#!/usr/bin/env python3
"""Lightweight wrapper around pmc_fetch to fetch a small sample set."""

import argparse
import json
from pathlib import Path

from pmc_fetch import iter_pmcids_from_csv, run_pipeline


def main():
    parser = argparse.ArgumentParser(
        description="Fetch a minimal subset of PMC articles for smoke testing."
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=Path("SB_publication_PMC.csv"),
        help="Path to the CSV file containing PMCID entries (default: SB_publication_PMC.csv)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("data"),
        help="Output base directory (default: data)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=3,
        help="Number of PMCIDs to process (default: 3)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=3,
        help="Number of worker threads to use (default: 3)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force refetching HTML even if cached versions are present",
    )
    args = parser.parse_args()

    items = iter_pmcids_from_csv(args.csv, args.limit)
    report = run_pipeline(items, args.out, args.workers, args.force)
    print(json.dumps(report, indent=2))
    print(
        "Summary: processed {total} papers — {ok} succeeded, {missing} with missing sections," \
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

