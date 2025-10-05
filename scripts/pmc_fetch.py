"""Utilities for downloading PMC articles listed in CSV files."""
from __future__ import annotations

import argparse
import csv
import logging
import re
import sys
from pathlib import Path
from typing import Iterator, Union

PMC_PATTERN = re.compile(r"PMC\d+", re.IGNORECASE)


logger = logging.getLogger(__name__)


def configure_logging(verbosity: int = 0, quiet: bool = False) -> None:
    """Configure logging for CLI usage."""

    if quiet:
        level = logging.WARNING
    else:
        level = logging.INFO
        if verbosity >= 1:
            level = logging.DEBUG

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(levelname)s %(name)s: %(message)s"))

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(level)
    root_logger.addHandler(handler)


def iter_pmcids_from_csv(csv_path: Union[str, Path]) -> Iterator[str]:
    """Yield PMCIDs extracted from ``csv_path``.

    The CSV is expected to contain a ``PMCID`` column. When that column is
    missing—as is the case for NASA's ``SB_publication_PMC.csv``—the function
    will fall back to extracting the PMCID from columns whose name or values
    reference PMC links.
    """

    path = Path(csv_path)
    logger.info("Scanning CSV for PMCIDs: %s", path)
    try:
        handle = path.open(newline="", encoding="utf-8")
    except FileNotFoundError:
        logger.error("CSV file %s not found", path)
        raise
    except OSError as exc:
        logger.error("Unable to open %s: %s", path, exc)
        raise

    with handle:
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
                logger.debug("Row %d yielded PMCID %s", idx, pmcid)
                yield pmcid
            else:
                logger.warning("Skipping row %d: no PMCID detected", idx)


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
                logger.info("Extracted PMCID from %s column for row %d", column_label, idx)
                return match.group(0).upper()

    return None


__all__ = ["iter_pmcids_from_csv"]


def main() -> None:
    parser = argparse.ArgumentParser(description="List PMCIDs discovered in a CSV file")
    parser.add_argument("csv", type=Path, help="Path to the CSV file containing PMC references")
    parser.add_argument("--limit", type=int, default=None, help="Limit the number of PMCIDs emitted")
    parser.add_argument("-v", "--verbose", action="count", default=0, help="Increase logging verbosity (use -vv for debug)")
    parser.add_argument("--quiet", action="store_true", help="Only show warnings and errors")
    args = parser.parse_args()

    configure_logging(args.verbose, args.quiet)
    logger.debug("CLI arguments: %s", args)

    emitted = 0
    try:
        for pmcid in iter_pmcids_from_csv(args.csv):
            print(pmcid)
            emitted += 1
            if args.limit and emitted >= args.limit:
                break
    except Exception as exc:
        logger.exception("Failed to extract PMCIDs from %s", args.csv)
        raise SystemExit(1) from exc

    logger.info("Emitted %d PMCIDs from %s", emitted, args.csv)


if __name__ == "__main__":
    main()
