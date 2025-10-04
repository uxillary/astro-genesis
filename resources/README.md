# Space Biology Publication Source Data

Place the `SB_publication_PMC.csv` manifest obtained from the NASA Space Biology
repository in this folder. The ingest pipeline reads this CSV to locate PMC
articles, fetches their raw HTML, and derives structured dossiers for the Astro
Genesis application.

```
resources/
└── SB_publication_PMC.csv  # not versioned here – download from your source
```

The CSV must contain a column that either stores the PMCID itself (e.g. `PMCID`,
`pmcid`, `PMCID #`) or a PMC URL. Additional columns such as `Title`, `Year`, and
`Authors` are optional but will improve metadata fidelity when present.
