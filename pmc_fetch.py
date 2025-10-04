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
    (
        "results",
        [
            "results",
            "result",
            "results and discussion",
            "findings",
            "outcome",
            "outcomes",
            "observations",
        ],
    ),
    (
        "conclusion",
        [
            "conclusion",
            "conclusions",
            "concluding remarks",
            "summary and conclusions",
            "summary",
            "closing remarks",
        ],
    ),
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

    heading_tags = [f"h{i}" for i in range(1, 7)]

    def _matches_label(text: str, labels: List[str]) -> bool:
        lowered = text.lower()
        for lab in labels:
            if lowered.startswith(lab) or f" {lab} " in f" {lowered} ":
                return True
        return False

    def _collect_from_heading(header) -> str:
        if header is None:
            return ""
        current_level = int(header.name[1]) if header.name and header.name[1:].isdigit() else 7
        parts: List[str] = []
        for sib in header.next_siblings:
            if getattr(sib, "name", None) in heading_tags:
                level = int(sib.name[1]) if sib.name[1:].isdigit() else 7
                if level <= current_level:
                    break
            if hasattr(sib, "get_text"):
                text = sib.get_text(" ", strip=True)
            else:
                text = str(sib).strip()
            if text:
                parts.append(text)
        if not parts and header.parent:
            # Some PMC articles wrap content inside the same parent container.
            candidate_parent = header.parent
            texts = []
            for child in candidate_parent.children:
                if child == header:
                    continue
                if getattr(child, "name", None) in heading_tags:
                    break
                if hasattr(child, "get_text"):
                    t = child.get_text(" ", strip=True)
                else:
                    t = str(child).strip()
                if t:
                    texts.append(t)
            if texts:
                parts.extend(texts)
        return _normalize_ws(" ".join(parts))

    def _search_by_attributes(labels: List[str]) -> Optional[str]:
        patterns = [re.compile(rf"\b{re.escape(lab)}\b", re.IGNORECASE) for lab in labels]
        for container in article.find_all(["section", "div", "article"]):
            attr_chunks = [container.get("id") or "", container.get("title") or ""]
            classes = container.get("class") or []
            attr_chunks.extend(classes)
            attr_text = " ".join(attr_chunks).lower()
            if any(p.search(attr_text) for p in patterns):
                text = container.get_text(" ", strip=True)
                if text:
                    return _normalize_ws(text)
        return None

    def find_section(labels: List[str]) -> str:
        for heading in article.find_all(heading_tags):
            title = heading.get_text(" ", strip=True)
            if not title:
                continue
            if _matches_label(title, labels):
                collected = _collect_from_heading(heading)
                if collected:
                    return collected
        attr_match = _search_by_attributes(labels)
        if attr_match:
            return attr_match
        # Fallback: search any element containing the label inline
        patterns = [re.compile(rf"\b{re.escape(lab)}\b", re.IGNORECASE) for lab in labels]
        for element in article.find_all(True):
            text = element.get_text(" ", strip=True)
            if not text:
                continue
            if any(p.search(text) for p in patterns):
                return _normalize_ws(text)
        return ""

    results = find_section(SECTION_KEYS[0][1])
    conclusion = find_section(SECTION_KEYS[1][1])
    abstract = find_section(SECTION_KEYS[2][1])

    if not abstract:
        abs_div = soup.find("div", class_="abstr") or soup.find("section", class_="abstract")
        if abs_div:
            abstract = _normalize_ws(abs_div.get_text(" ", strip=True))

    return {"results": results, "conclusion": conclusion, "abstract": abstract}

def build_record(
    pmcid: str,
    meta: Dict[str, str],
    sections: Dict[str, str],
    status: str,
    error: Optional[str] = None,
) -> Dict:
    record = {
        "pmcid": pmcid,
        "title": meta.get("title") or meta.get("Title") or "",
        "year": _safe_int(meta.get("year") or meta.get("Year")),
        "authors": _split_authors(meta.get("authors") or meta.get("Authors") or ""),
        "sections": {
            "results": sections.get("results", ""),
            "conclusion": sections.get("conclusion", ""),
            "abstract": sections.get("abstract", ""),
        },
        "links": {"pmc_html": f"https://pmc.ncbi.nlm.nih.gov/{pmcid}/"},
        "status": status,
    }
    if error:
        record["error"] = error
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
    normalized = {
        col: re.sub(r"[^a-z0-9]", "", str(col).lower()) for col in df.columns
    }
    for col, norm in normalized.items():
        if norm == "pmcid":
            pmc_col = col
            break
    if not pmc_col:
        raise RuntimeError(
            "CSV must contain a PMCID column (e.g., PMCID, pmcid, 'PMCID #')."
        )
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
    meta = item.get("meta", {})
    try:
        html = fetch_html(pmcid, raw_dir, force, session)
        if not html:
            sections = {"results": "", "conclusion": "", "abstract": ""}
            record = build_record(
                pmcid,
                meta,
                sections,
                status="no_html",
                error="Failed to retrieve article HTML",
            )
            save_clean(record, clean_dir)
            return {"pmcid": pmcid, "status": "no_html"}

        sections = extract_sections(html)
        missing = [k for k in ("results", "conclusion") if not sections.get(k)]
        status = "ok" if not missing else "missing_sections"
        record = build_record(pmcid, meta, sections, status=status)
        if missing:
            record["missing_sections"] = missing
        save_clean(record, clean_dir)
        return {"pmcid": pmcid, "status": status, "missing": missing}
    except Exception as e:
        sections = {"results": "", "conclusion": "", "abstract": ""}
        record = build_record(
            pmcid,
            meta,
            sections,
            status="error",
            error=str(e),
        )
        save_clean(record, clean_dir)
        return {"pmcid": pmcid, "status": f"error: {e}"}


def summarize_results(results: List[Dict[str, str]]) -> Dict[str, List[Dict[str, str]]]:
    summary = {
        "ok": [],
        "missing_sections": [],
        "no_html": [],
        "errors": [],
    }
    for res in results:
        status = res.get("status", "")
        if status == "ok":
            summary["ok"].append(res)
        elif status == "missing_sections":
            summary["missing_sections"].append(res)
        elif status == "no_html":
            summary["no_html"].append(res)
        elif status.startswith("error"):
            summary["errors"].append(res)
    return summary


def run_pipeline(items: List[Dict], out_dir: Path, workers: int, force: bool) -> Dict:
    ensure_dirs(out_dir)
    raw_dir = out_dir / "raw"
    clean_dir = out_dir / "clean"

    session = requests_session()

    items_list = list(items)
    results: List[Dict[str, str]] = []

    with cf.ThreadPoolExecutor(max_workers=workers) as ex:
        futures = [
            ex.submit(process_one, item, raw_dir, clean_dir, force, session)
            for item in items_list
        ]
        if _TQDM:
            for f in tqdm(cf.as_completed(futures), total=len(items_list), desc="Processing", unit="paper"):
                results.append(f.result())
        else:
            for f in cf.as_completed(futures):
                results.append(f.result())

    summary = summarize_results(results)
    report = {
        "processed": len(results),
        "ok": len(summary["ok"]),
        "missing_sections": summary["missing_sections"],
        "no_html": summary["no_html"],
        "errors": summary["errors"],
    }
    (out_dir / "run_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report

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

    if args.csv:
        items = iter_pmcids_from_csv(args.csv, args.limit)
    else:
        items = [{"pmcid": pmc.strip(), "meta": {}} for pmc in args.pmcids]
    report = run_pipeline(items, args.out, args.workers, args.force)
    print(json.dumps(report, indent=2))
    print(
        "Summary: processed {total} papers — {ok} succeeded, {missing} with missing sections,"
        " {no_html} without HTML, {errors} errors.".format(
            total=report["processed"],
            ok=report["ok"],
            missing=len(report["missing_sections"]),
            no_html=len(report["no_html"]),
            errors=len(report["errors"]),
        )
    )

if __name__ == "__main__":
    main()
