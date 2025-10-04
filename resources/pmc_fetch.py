#!/usr/bin/env python3
# Automates fetching & caching of PMC articles by PMCID, extracts key sections,
# and writes both raw HTML and cleaned JSON artifacts.
#
# Usage:
#   python pmc_fetch.py --csv SB_publication_PMC.csv --out data --limit 200 --workers 6
#   python pmc_fetch.py --pmcids PMC4136787 PMC123456 --out data --force
#
# Requirements:
#   pip install pandas requests beautifulsoup4 lxml tqdm
# Optional:
#   pip install coloredlogs
#
# Notes:
# - Caches: data/raw/<PMCID>.html and data/clean/<PMCID>.json
# - Polite: identifies a User-Agent and spaces requests.
# - Retries: transient HTTP errors handled.

import argparse
import concurrent.futures as cf
import json
import re
import time
from pathlib import Path
from typing import Dict, List, Optional

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter, Retry

try:
    import pandas as pd
except Exception:
    pd = None

try:
    from tqdm import tqdm
    _TQDM = True
except Exception:
    _TQDM = False

HEADERS = {
    "User-Agent": "NASA-SpaceApps-DataHarvester/1.0 (+github.com/your-user; contact: youremail@example.com)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

SECTION_KEYS = [
    ("results", ["results", "results and discussion", "findings"]),
    ("conclusion", ["conclusion", "conclusions", "concluding remarks", "summary and conclusions"]),
    ("abstract", ["abstract"]),
]

def ensure_dirs(base: Path):
    (base / "raw").mkdir(parents=True, exist_ok=True)
    (base / "clean").mkdir(parents=True, exist_ok=True)

def requests_session() -> requests.Session:
    s = requests.Session()
    retries = Retry(
        total=5,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=frozenset(["GET"]),
        raise_on_status=False,
    )
    s.mount("https://", HTTPAdapter(max_retries=retries))
    s.headers.update(HEADERS)
    return s

def fetch_html(pmcid: str, raw_dir: Path, force: bool, session: requests.Session) -> Optional[str]:
    out = raw_dir / f"{pmcid}.html"
    if out.exists() and not force:
        try:
            return out.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            pass
    url = f"https://pmc.ncbi.nlm.nih.gov/{pmcid}/"
    resp = session.get(url, timeout=30)
    if resp.status_code != 200:
        return None
    html = resp.text
    out.write_text(html, encoding="utf-8")
    time.sleep(0.4)  # be polite
    return html

def _normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def extract_sections(html: str) -> Dict[str, str]:
    soup = BeautifulSoup(html, "lxml")
    article = soup.find("div", id="maincontent") or soup

    def find_section(labels: List[str]) -> str:
        header = None
        for h in article.find_all(["h2", "h3"]):
            title = h.get_text(" ", strip=True).lower()
            for lab in labels:
                if title.startswith(lab):
                    header = h
                    break
            if header:
                break
        if not header:
            return ""
        parts = []
        for sib in header.next_siblings:
            if getattr(sib, "name", None) in ["h2", "h3"]:
                break
            if hasattr(sib, "get_text"):
                parts.append(sib.get_text(" ", strip=True))
        return _normalize_ws(" ".join(parts))

    results = find_section(SECTION_KEYS[0][1])
    conclusion = find_section(SECTION_KEYS[1][1])
    abstract = find_section(SECTION_KEYS[2][1])

    if not abstract:
        abs_div = soup.find("div", class_="abstr") or soup.find("section", class_="abstract")
        if abs_div:
            abstract = _normalize_ws(abs_div.get_text(" ", strip=True))

    return {"results": results, "conclusion": conclusion, "abstract": abstract}

def build_record(pmcid: str, html: Optional[str], meta: Dict[str, str]) -> Optional[Dict]:
    if not html:
        return None
    secs = extract_sections(html)
    record = {
        "pmcid": pmcid,
        "title": meta.get("title") or meta.get("Title") or "",
        "year": _safe_int(meta.get("year") or meta.get("Year")),
        "authors": _split_authors(meta.get("authors") or meta.get("Authors") or ""),
        "sections": {
            "results": secs.get("results", ""),
            "conclusion": secs.get("conclusion", ""),
            "abstract": secs.get("abstract", ""),
        },
        "links": {
            "pmc_html": f"https://pmc.ncbi.nlm.nih.gov/{pmcid}/"
        }
    }
    return record

def _safe_int(x):
    try:
        return int(float(str(x)))
    except Exception:
        return None

def _split_authors(s: str) -> List[str]:
    if not s:
        return []
    if ";" in s:
        parts = [p.strip() for p in s.split(";")]
    else:
        parts = [p.strip() for p in s.split(",")]
    return [p for p in parts if p]

def save_clean(record: Dict, clean_dir: Path):
    out = clean_dir / f"{record['pmcid']}.json"
    out.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")

def iter_pmcids_from_csv(csv_path: Path, limit: Optional[int]) -> List[Dict]:
    if pd is None:
        raise RuntimeError("pandas is required to read CSV. pip install pandas")
    df = pd.read_csv(csv_path)
    pmc_col = None
    for cand in ["PMCID", "pmcid", "Pmcid"]:
        if cand in df.columns:
            pmc_col = cand
            break
    if not pmc_col:
        raise RuntimeError("CSV must contain a PMCID column (PMCID/pmcid/Pmcid).")
    rows = []
    for _, row in df.iterrows():
        pmcid = str(row[pmc_col]).strip()
        if not pmcid or not pmcid.startswith("PMC"):
            continue
        meta = {k: (row[k] if k in df.columns else None) for k in ["title","Title","year","Year","authors","Authors"]}
        rows.append({"pmcid": pmcid, "meta": meta})
        if limit and len(rows) >= limit:
            break
    return rows

def process_one(item, raw_dir: Path, clean_dir: Path, force: bool, session: requests.Session) -> Dict[str, str]:
    pmcid = item["pmcid"]
    meta = item["meta"]
    try:
        html = fetch_html(pmcid, raw_dir, force, session)
        rec = build_record(pmcid, html, meta)
        if rec:
            save_clean(rec, clean_dir)
            return {"pmcid": pmcid, "status": "ok"}
        return {"pmcid": pmcid, "status": "no_record"}
    except Exception as e:
        return {"pmcid": pmcid, "status": f"error: {e}"}

def main():
    ap = argparse.ArgumentParser(description="Fetch & cache PMC HTML, extract sections, write JSON.")
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--csv", type=Path, help="Path to SB_publication_PMC.csv")
    group.add_argument("--pmcids", nargs="+", help="Explicit PMCID list, e.g., PMC4136787 PMC123456")

    ap.add_argument("--out", type=Path, default=Path("data"), help="Output base dir (default: data)")
    ap.add_argument("--limit", type=int, default=None, help="Limit number of rows from CSV")
    ap.add_argument("--workers", type=int, default=6, help="Parallel workers (default 6)")
    ap.add_argument("--force", action="store_true", help="Refetch even if raw HTML exists")
    args = ap.parse_args()

    ensure_dirs(args.out)
    raw_dir = args.out / "raw"
    clean_dir = args.out / "clean"

    if args.csv:
        items = iter_pmcids_from_csv(args.csv, args.limit)
    else:
        items = [{"pmcid": pmc.strip(), "meta": {}} for pmc in args.pmcids]

    sess = requests_session()

    # Thread pool for I/O bound fetching
    results = []
    it = items
    if _TQDM:
        it = tqdm(items, desc="Queueing", unit="paper")

    with cf.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = [ex.submit(process_one, item, raw_dir, clean_dir, args.force, sess) for item in items]
        if _TQDM:
            for f in tqdm(cf.as_completed(futures), total=len(items), desc="Processing", unit="paper"):
                results.append(f.result())
        else:
            for f in cf.as_completed(futures):
                results.append(f.result())

    report = {
        "processed": len(results),
        "ok": sum(1 for r in results if r["status"] == "ok"),
        "errors": [r for r in results if r["status"].startswith("error")],
        "skipped": [r for r in results if r["status"] not in ("ok",) and not r["status"].startswith("error")],
    }
    (args.out / "run_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
