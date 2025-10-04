#!/usr/bin/env python3
"""High-level pipeline for harvesting PMC articles listed in SB_publication_PMC.csv.

This script orchestrates two phases:

1. Fetch: download and cache the raw HTML for every PMCID found in the CSV.
   Raw documents are stored under ``data/raw_pmc/<pmcid>.html`` so they can be
   inspected or re-processed without re-contacting PMC.
2. Transform: parse the cached HTML, extract structural sections, and optionally
   call an LLM to infer higher level metadata (organism, experiment type, etc.).
   The final dossier is written to ``data/papers/<id>.json`` matching the schema
   used by the Astro Genesis application.

The script is intentionally dependency-light. If an OpenAI API key is available
it will be used automatically for richer summarisation and metadata inference.
When no LLM backend is reachable, the pipeline falls back to deterministic
heuristics so that data extraction still succeeds (albeit with less nuance).
"""

from __future__ import annotations

import argparse
import dataclasses
import json
import os
import re
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter, Retry

try:  # Optional dependency for CSV parsing
    import pandas as pd
except Exception as exc:  # pragma: no cover - surfaced in CLI error message
    pd = None
    _PANDAS_IMPORT_ERROR = exc
else:
    _PANDAS_IMPORT_ERROR = None


PMC_BASE = "https://pmc.ncbi.nlm.nih.gov"
USER_AGENT = "AstroGenesis-Ingestor/1.0 (+https://github.com/NASA-SpaceApps-Challenge)"
STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "from",
    "that",
    "were",
    "this",
    "have",
    "which",
    "using",
    "into",
    "been",
    "their",
    "about",
    "between",
    "within",
    "after",
    "before",
    "during",
    "these",
    "those",
    "into",
    "through",
    "under",
    "over",
    "such",
    "also",
    "because",
    "while",
    "among",
    "based",
    "data",
    "study",
    "results",
    "conclusion",
    "methods",
    "analysis",
    "effect",
    "effects",
    "space",
    "microgravity",
}

KNOWN_PLATFORMS = {
    "international space station": "ISS",
    "iss": "ISS",
    "space shuttle": "Space Shuttle",
    "sts": "Space Shuttle",
    "spacelab": "Spacelab",
    "mir": "Mir",
    "soyuz": "Soyuz",
    "falcon 9": "Falcon 9",
    "dragon": "SpaceX Dragon",
    "orbiter": "Space Shuttle",
}

KNOWN_ORGANISMS = {
    "arabidopsis": "Arabidopsis thaliana",
    "mus musculus": "Mus musculus",
    "mouse": "Mus musculus",
    "mice": "Mus musculus",
    "homo sapiens": "Homo sapiens",
    "human": "Homo sapiens",
    "drosophila": "Drosophila melanogaster",
    "zebrafish": "Danio rerio",
    "danio rerio": "Danio rerio",
    "yeast": "Saccharomyces cerevisiae",
    "ecoli": "Escherichia coli",
    "escherichia coli": "Escherichia coli",
    "bacillus subtilis": "Bacillus subtilis",
    "lettuce": "Lactuca sativa",
    "spinach": "Spinacia oleracea",
    "wheat": "Triticum aestivum",
    "soybean": "Glycine max",
    "rice": "Oryza sativa",
    "arabidopsis thaliana": "Arabidopsis thaliana",
    "c. elegans": "Caenorhabditis elegans",
    "caenorhabditis elegans": "Caenorhabditis elegans",
}

EXPERIMENT_KEYWORDS = {
    "radiation": "Space Radiation Biology",
    "dosimetry": "Space Radiation Biology",
    "microgravity": "Microgravity Research",
    "bone": "Musculoskeletal Adaptation",
    "muscle": "Musculoskeletal Adaptation",
    "plant": "Space Botany",
    "seed": "Space Botany",
    "germination": "Space Botany",
    "genomic": "Omics & Genomics",
    "transcript": "Omics & Genomics",
    "protein": "Proteomics",
    "bacteria": "Microbiology",
    "bacterial": "Microbiology",
    "immune": "Immunology",
    "cardio": "Cardiovascular Research",
}


class OptionalLLM:
    """Tiny abstraction that optionally calls OpenAI for richer summaries."""

    def __init__(self, model: str = "gpt-4o-mini", enabled: Optional[bool] = None):
        self.model = model
        self.enabled = enabled
        self._client = None
        self._reason = None

        if self.enabled is False:
            return

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            self.enabled = False
            self._reason = "OPENAI_API_KEY not set; falling back to heuristics"
            return

        try:
            from openai import OpenAI
        except Exception as exc:  # pragma: no cover - optional path
            self.enabled = False
            self._reason = f"openai package unavailable ({exc}); heuristics will be used"
            return

        self._client = OpenAI(api_key=api_key)
        self.enabled = True

    @property
    def reason(self) -> Optional[str]:
        return self._reason

    def structured_summary(
        self,
        metadata: Dict[str, Optional[str]],
        sections: Dict[str, str],
    ) -> Dict[str, Optional[str]]:
        if not self.enabled or not self._client:
            return {}

        core_text = "\n\n".join(
            f"## {name.capitalize()}\n{sections.get(name, '')}" for name in ("abstract", "methods", "results", "conclusion")
        )
        prompt = (
            "You are assisting with the NASA Space Biology archive. "
            "Analyse the following experiment report and respond with a compact JSON document. "
            "JSON keys: organism (string), experiment_type (string), platform (string), "
            "keywords (array of <=8 lowercase keywords), summary (concise paragraph <=120 words). "
            "If unsure of a field use null. JSON only, no commentary.\n\n"
            f"Title: {metadata.get('title') or ''}\n"
            f"Year: {metadata.get('year') or ''}\n"
            f"Authors: {', '.join(metadata.get('authors') or [])}\n"
            f"PMC Link: {metadata.get('pmc_url') or ''}\n\n"
            f"Article sections:\n{core_text}"
        )

        try:
            completion = self._client.responses.create(
                model=self.model,
                input=prompt,
                temperature=0.2,
                max_output_tokens=400,
            )
            message = completion.output[0].content[0].text  # type: ignore[index]
        except Exception as exc:  # pragma: no cover - network failure path
            self._reason = f"OpenAI request failed: {exc}"  # surface warning upstream
            self.enabled = False
            return {}
        try:
            data = json.loads(message)
        except json.JSONDecodeError:
            return {}
        return data


@dataclass
class ArticleRecord:
    pmcid: str
    id: str
    title: str = ""
    authors: List[str] = field(default_factory=list)
    year: Optional[int] = None
    organism: Optional[str] = None
    experiment_type: Optional[str] = None
    platform: Optional[str] = None
    keywords: List[str] = field(default_factory=list)
    sections: Dict[str, str] = field(default_factory=dict)
    links: Dict[str, str] = field(default_factory=dict)
    summary: Optional[str] = None
    metrics: Dict[str, object] = field(default_factory=dict)

    def as_dict(self) -> Dict[str, object]:
        return dataclasses.asdict(self)


def ensure_directories(raw_dir: Path, json_dir: Path) -> None:
    raw_dir.mkdir(parents=True, exist_ok=True)
    json_dir.mkdir(parents=True, exist_ok=True)


def make_session() -> requests.Session:
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=0.5, status_forcelist=[429, 500, 502, 503, 504])
    session.mount("https://", HTTPAdapter(max_retries=retries))
    session.headers.update({"User-Agent": USER_AGENT})
    return session


def normalise_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def detect_section(article: BeautifulSoup, labels: Iterable[str]) -> str:
    heading_tags = [f"h{i}" for i in range(1, 7)]
    label_patterns = [re.compile(rf"\b{re.escape(label)}\b", re.IGNORECASE) for label in labels]

    for heading in article.find_all(heading_tags):
        heading_text = heading.get_text(" ", strip=True)
        if not heading_text:
            continue
        if any(pattern.search(heading_text) for pattern in label_patterns):
            collected: List[str] = []
            for sibling in heading.next_siblings:
                if getattr(sibling, "name", None) in heading_tags:
                    break
                text = sibling.get_text(" ", strip=True) if hasattr(sibling, "get_text") else str(sibling).strip()
                if text:
                    collected.append(text)
            if collected:
                return normalise_whitespace(" ".join(collected))
    return ""


def parse_sections(soup: BeautifulSoup) -> Dict[str, str]:
    main = soup.find("div", id="maincontent") or soup
    abstract = detect_section(main, ["abstract"])
    if not abstract:
        abstr = soup.find("div", class_="abstr") or soup.find("section", class_="abstract")
        if abstr:
            abstract = normalise_whitespace(abstr.get_text(" ", strip=True))

    methods = detect_section(main, ["methods", "materials", "materials and methods", "experimental"])
    results = detect_section(main, ["results", "findings", "results and discussion"])
    conclusion = detect_section(main, ["conclusion", "conclusions", "summary", "closing remarks"])

    return {
        "abstract": abstract,
        "methods": methods,
        "results": results,
        "conclusion": conclusion,
    }


def extract_meta_from_html(pmcid: str, html: str) -> Tuple[Dict[str, Optional[str]], Dict[str, str]]:
    soup = BeautifulSoup(html, "lxml")

    title = soup.find("meta", attrs={"name": "citation_title"})
    if title is None:
        title = soup.find("title")
    title_text = title.get("content") if title and title.has_attr("content") else title.get_text(strip=True) if title else ""

    author_tags = soup.find_all("meta", attrs={"name": "citation_author"})
    authors = [tag.get("content", "").strip() for tag in author_tags if tag.get("content")]

    year = None
    date_tag = soup.find("meta", attrs={"name": "citation_date"})
    if date_tag and date_tag.get("content"):
        try:
            year = datetime.fromisoformat(date_tag["content"]).year
        except Exception:
            match = re.search(r"(19|20)\d{2}", date_tag["content"])
            if match:
                year = int(match.group(0))

    pmc_url = f"{PMC_BASE}/{pmcid}/"
    pdf_tag = soup.find("meta", attrs={"name": "citation_pdf_url"})
    links = {"pmc_html": pmc_url}
    if pdf_tag and pdf_tag.get("content"):
        links["pmc_pdf"] = pdf_tag["content"]

    return (
        {
            "pmcid": pmcid,
            "title": title_text or "",
            "authors": authors,
            "year": year,
            "pmc_url": pmc_url,
        },
        links,
    )


def heuristic_keywords(text: str, limit: int = 8) -> List[str]:
    tokens = re.findall(r"[A-Za-z][A-Za-z\-]{2,}", text.lower())
    filtered = [token for token in tokens if token not in STOPWORDS]
    counts = Counter(filtered)
    most_common = [word for word, _ in counts.most_common(limit)]
    return most_common


def detect_platform(text: str) -> Optional[str]:
    lowered = text.lower()
    for pattern, label in KNOWN_PLATFORMS.items():
        if pattern in lowered:
            return label
    return None


def detect_organism(text: str) -> Optional[str]:
    lowered = text.lower()
    for pattern, label in KNOWN_ORGANISMS.items():
        if pattern in lowered:
            return label
    return None


def detect_experiment_type(text: str) -> Optional[str]:
    lowered = text.lower()
    hits = []
    for pattern, label in EXPERIMENT_KEYWORDS.items():
        if pattern in lowered:
            hits.append(label)
    if hits:
        return hits[0]
    return None


def simple_summary(sections: Dict[str, str]) -> str:
    text = sections.get("abstract") or sections.get("results") or sections.get("conclusion") or ""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return " ".join(sentences[:3]).strip()


def build_metrics(record: ArticleRecord) -> Dict[str, object]:
    metrics: Dict[str, object] = {}
    if record.year:
        metrics["publication_year"] = record.year
    if record.keywords:
        metrics["keyword_counts"] = {kw: record.sections.get("results", "").lower().count(kw.lower()) for kw in record.keywords[:5]}
    return metrics


def load_csv_rows(csv_path: Path, limit: Optional[int] = None) -> List[Dict[str, object]]:
    if pd is None:
        raise RuntimeError(
            "pandas is required to parse CSV files. Install with `pip install pandas`"
            f" (import error: {_PANDAS_IMPORT_ERROR})"
        )
    df = pd.read_csv(csv_path)
    if limit:
        df = df.head(limit)
    rows: List[Dict[str, object]] = []
    for _, row in df.iterrows():
        rows.append(row.to_dict())
    return rows


def derive_pmcid(row: Dict[str, object]) -> Optional[str]:
    candidates = []
    for key, value in row.items():
        if value is None:
            continue
        text = str(value)
        match = re.search(r"PMC\d+", text, re.IGNORECASE)
        if match:
            candidates.append(match.group(0).upper())
    return candidates[0] if candidates else None


def fetch_raw_html(pmcid: str, raw_dir: Path, session: requests.Session, force: bool = False) -> str:
    out_path = raw_dir / f"{pmcid}.html"
    if out_path.exists() and not force:
        return out_path.read_text(encoding="utf-8", errors="ignore")

    url = f"{PMC_BASE}/{pmcid}/"
    response = session.get(url, timeout=30)
    response.raise_for_status()
    html = response.text
    out_path.write_text(html, encoding="utf-8")
    return html


def synthesize_record(
    pmcid: str,
    idx: int,
    html: str,
    row: Dict[str, object],
    llm: OptionalLLM,
) -> ArticleRecord:
    meta, links = extract_meta_from_html(pmcid, html)
    sections = parse_sections(BeautifulSoup(html, "lxml"))

    title = meta.get("title") or str(row.get("title") or row.get("Title") or "").strip()
    authors = meta.get("authors") or []
    if not authors:
        raw_authors = row.get("authors") or row.get("Authors")
        if raw_authors:
            authors = [a.strip() for a in str(raw_authors).replace(";", ",").split(",") if a.strip()]

    year = meta.get("year")
    if not year:
        raw_year = row.get("year") or row.get("Year")
        try:
            if raw_year:
                year = int(str(raw_year).split("-")[0])
        except Exception:
            year = None

    combined_text = " ".join(sections.values())

    ai_payload = llm.structured_summary(
        {"title": title, "authors": authors, "year": year, "pmc_url": links.get("pmc_html")},
        sections,
    ) if llm.enabled else {}

    organism = ai_payload.get("organism") if ai_payload else detect_organism(combined_text)
    experiment_type = ai_payload.get("experiment_type") if ai_payload else detect_experiment_type(combined_text)
    platform = ai_payload.get("platform") if ai_payload else detect_platform(combined_text)

    keywords = ai_payload.get("keywords") if ai_payload and isinstance(ai_payload.get("keywords"), list) else heuristic_keywords(combined_text)
    summary_text = ai_payload.get("summary") if ai_payload else simple_summary(sections)

    record = ArticleRecord(
        pmcid=pmcid,
        id=f"exp_{idx:03d}",
        title=title,
        authors=authors,
        year=year,
        organism=organism,
        experiment_type=experiment_type,
        platform=platform,
        keywords=keywords,
        sections=sections,
        links=links,
        summary=summary_text,
    )
    record.metrics = build_metrics(record)
    return record


def write_record(record: ArticleRecord, out_dir: Path) -> Path:
    out_path = out_dir / f"{record.id}.json"
    out_path.write_text(json.dumps(record.as_dict(), ensure_ascii=False, indent=2), encoding="utf-8")
    return out_path


def ingest(
    csv_path: Path,
    raw_dir: Path,
    json_dir: Path,
    limit: Optional[int] = None,
    force: bool = False,
    llm_model: str = "gpt-4o-mini",
    llm_enabled: Optional[bool] = None,
) -> List[ArticleRecord]:
    ensure_directories(raw_dir, json_dir)
    session = make_session()
    rows = load_csv_rows(csv_path, limit=limit)
    llm = OptionalLLM(model=llm_model, enabled=llm_enabled)

    if llm.reason:
        print(f"[info] {llm.reason}")

    records: List[ArticleRecord] = []
    for idx, row in enumerate(rows, start=1):
        pmcid = derive_pmcid(row)
        if not pmcid:
            print(f"[warn] Skipping row {idx}: no PMCID detected")
            continue
        try:
            html = fetch_raw_html(pmcid, raw_dir, session, force=force)
        except Exception as exc:
            print(f"[error] Failed to fetch {pmcid}: {exc}")
            continue
        record = synthesize_record(pmcid, idx, html, row, llm)
        write_record(record, json_dir)
        records.append(record)
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description="Harvest PMC publications and emit Astro Genesis dossiers")
    parser.add_argument("--csv", type=Path, default=Path("resources/SB_publication_PMC.csv"), help="Path to the SB_publication_PMC.csv file")
    parser.add_argument("--raw-dir", type=Path, default=Path("data/raw_pmc"), help="Directory for cached raw HTML")
    parser.add_argument("--json-dir", type=Path, default=Path("data/papers"), help="Directory for JSON dossiers")
    parser.add_argument("--limit", type=int, default=None, help="Optional row limit for testing")
    parser.add_argument("--force", action="store_true", help="Refetch HTML even if cached")
    parser.add_argument("--llm", choices=["auto", "off"], default="auto", help="Use OpenAI if configured ('auto') or disable ('off')")
    parser.add_argument("--llm-model", default="gpt-4o-mini", help="OpenAI model name when LLM is enabled")
    args = parser.parse_args()

    llm_enabled = None if args.llm == "auto" else False
    records = ingest(
        csv_path=args.csv,
        raw_dir=args.raw_dir,
        json_dir=args.json_dir,
        limit=args.limit,
        force=args.force,
        llm_model=args.llm_model,
        llm_enabled=llm_enabled,
    )

    print(f"Ingested {len(records)} publications -> {args.json_dir}")


if __name__ == "__main__":
    main()
