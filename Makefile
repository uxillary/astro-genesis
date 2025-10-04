# Simple automation for fetching & parsing PMC content
OUT ?= data
CSV ?= SB_publication_PMC.csv
WORKERS ?= 6
LIMIT ?= 200

fetch:
\tpython pmc_fetch.py --csv $(CSV) --out $(OUT) --limit $(LIMIT) --workers $(WORKERS)

force-fetch:
\tpython pmc_fetch.py --csv $(CSV) --out $(OUT) --limit $(LIMIT) --workers $(WORKERS) --force

one:
\tpython pmc_fetch.py --pmcids PMC4136787 --out $(OUT)

report:
\t@echo "Run report:" && cat $(OUT)/run_report.json || true
