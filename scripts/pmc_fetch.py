"""Utilities for downloading PMC articles listed in CSV files."""
from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Iterator, Union

PMC_PATTERN = re.compile(r"PMC\d+", re.IGNORECASE)


def iter_pmcids_from_csv(csv_path: Union[str, Path]) -> Iterator[str]:
    """Yield PMCIDs extracted from ``csv_path``.

    The CSV is expected to contain a ``PMCID`` column. When that column is
    missing—as is the case for NASA's ``SB_publication_PMC.csv``—the function
    will fall back to extracting the PMCID from columns whose name or values
    reference PMC links.
    """

    path = Path(csv_path)
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames or []

        pmcid_column = None
        for name in fieldnames:
            if name and name.strip().lower() == "pmcid":
                pmcid_column = name
                break

        for idx, row in enumerate(reader, start=1):
            pmcid: str | None = None

            if pmcid_column:
                raw_value = row.get(pmcid_column)
                if raw_value:
                    text = str(raw_value).strip()
                    if text:
                        match = PMC_PATTERN.search(text)
                        pmcid = match.group(0).upper() if match else text.upper()

            if pmcid is None and not pmcid_column:
                pmcid = _extract_pmcid_from_fallback(row, idx)

            if pmcid:
                yield pmcid
            else:
                print(f"[warn] Skipping row {idx}: no PMCID detected")


def _extract_pmcid_from_fallback(row: dict[str, object], idx: int) -> str | None:
    for column, value in row.items():
        if value is None:
            continue

        column_name = column or ""
        text = str(value)
        lower_text = text.lower()

        if "pmc" in column_name.lower() or "link" in column_name.lower() or "pmc" in lower_text or "link" in lower_text:
            match = PMC_PATTERN.search(text)
            if match:
                column_label = column_name.strip() or "link"
                print(f"[info] Extracted PMCID from {column_label} column for row {idx}")
                return match.group(0).upper()

    return None


__all__ = ["iter_pmcids_from_csv"]
