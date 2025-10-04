# NASA Bioscience Knowledge Dashboard

## Overview

Enable a new era of human space exploration by organizing and summarizing NASA’s decades of bioscience research.  
This project transforms complex biological experiment data from multiple NASA sources into an interactive, AI-powered dashboard — helping scientists, mission planners, and researchers quickly explore key insights and knowledge gaps.

## Project Goal

To build a dynamic web dashboard that:

- Summarizes 600+ NASA bioscience publications using AI & NLP  
- Enables interactive search, filtering, and visualization of studies  
- Identifies patterns in how humans, plants, and organisms respond to space environments  
- Highlights research progress, gaps, and actionable insights for future Moon and Mars missions  

## Data Sources

- <https://science.nasa.gov/biological-physical/data>  
- <https://github.com/jgalazka/SB_publications/blob/main/SB_publication_PMC.csv>
- <https://taskbook.nasaprs.com/tbp/welcome.cfm>
- <https://public.ksc.nasa.gov/nslsl>

## Data Structure

All data is standardized into a unified JSON format:

```
{
  "title": "",
  "authors": "",
  "year": "",
  "keywords": [],
  "organism": "",
  "experiment_type": "",
  "platform": "",
  "summary": "",
  "findings": "",
  "link": ""
}
```

## Analysis Approach

1. Clean & Unify Data — Parse CSV + scrape linked resources into structured JSON  
2. Enrich with AI — Use NLP for automatic summarization, keyword extraction, and topic tagging  
3. Cluster & Connect — Apply embeddings to group related studies and visualize relationships  
4. Build Knowledge Graph — Map experiments → findings → biological systems → missions  
5. Visualize — Create an interactive dashboard to explore these connections dynamically  

## Core Idea

Clean → Enrich → Cluster → Visualize  

This workflow turns scattered datasets into an intelligent exploration tool that redefines how NASA’s bioscience archives can inform the future of human spaceflight.

## Future Enhancements

- Integration with NASA’s Open Science Data Repository (OSDR)  
- 3D visual exploration of experiment relationships  
- AI-powered semantic search  
- Mission impact correlation maps  

## Credits

Developed for the NASA Space Apps Challenge 2025
by Adam Johnston

## Habitable Map Dashboard Prototype

The repository now includes a sci-fi inspired interface for browsing sample bioscience publications. Launch `index.html` in a browser (or serve the project with `python -m http.server`) to explore the prototype.

### Prototype Highlights

- Neon HUD aesthetic with animated scanline header and grid overlay.
- Filters for organism, experiment type, year, and platform with typeahead search.
- Branching SVG connectors linking the central publication node to modular Abstract, Methods, Results, Conclusion, and Keyword Trend panels.
- Metadata dossier and AI summary placeholder ready for future model integration.

### Static Asset Map

- `index.html` – layout scaffold and modules.
- `styles.css` – custom HUD visual language.
- `app.js` – data loading, filter logic, connector rendering, and dummy trend graph.
- `data/` – sample publication index and individual records (mirrored in `data_min/clean/`).
