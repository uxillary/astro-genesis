# 🌍 AstroGenesis.wiki — Context Document, for space apps challlenge 2025

---

## 🧭 Overview

**Project Title:** AstroGenesis.wiki  
**Challenge:** “Enable a new era of human space exploration!” (Biological and Physical Sciences Data Challenge)  
**Team Lead:** Adam Johnston  
**Platform:** GitHub + Cloudflare Pages  
**Tech Focus:** AI-driven data visualization and knowledge synthesis

---

## 🚀 Challenge Brief (from NASA)

NASA has conducted **biological experiments in space for decades**, producing a **massive amount of information** vital for future missions to the Moon and Mars.  
While this data is **publicly available**, it’s **difficult to navigate, fragmented across multiple repositories**, and often **inaccessible to researchers** or enthusiasts without deep domain expertise.

**Your challenge:**  
> Build a *dynamic dashboard or visualization tool* that leverages **AI, knowledge graphs, or other data science methods** to **summarize and explore NASA bioscience publications** — revealing how past space biology experiments inform future exploration and habitability research.

---

## 🌱 Core Objectives

1. **Aggregate** and **structure** existing bioscience publication data (e.g., from Taskbook, PubMed Central, OSIDR).
2. **Summarize** key findings using LLMs or embeddings (e.g., GPT / Codex API).
3. **Visualize** relationships across:
   - Organism type (e.g., human, plant, bacteria)
   - Experimental environment (ISS, microgravity, lunar, etc.)
   - Results and implications for habitability
4. Provide an **interactive and intuitive interface** that feels like classified scientific intelligence access — blending *space research* with *immersive UI storytelling*.

---

## 🧩 Concept Vision: *“Habitable Map”*

A **classified-research-style dashboard** where users can:

- Explore **clusters of biological experiments** (mapped across time, organism, and mission)
- View **AI-generated summaries** of key findings  
- Discover **cross-mission correlations** between species, systems, and outcomes
- Toggle between visual modes (timeline / organism / mission / environment)

Inspired by **UAC terminals from DOOM**, the interface evokes a sense of *restricted access to advanced bioscience data*, while maintaining scientific rigor and clarity.

---

## 🎯 Constraints and Focus

| Category | Details |
|-----------|----------|
| **Time Limit** | 48 hours (NASA Space Apps weekend constraint) |
| **Data Sources** | NASA OSIDR, Taskbook, PMC, GitHub datasets (e.g., SB_publication_PMC.csv) |
| **Hosting** | Cloudflare Pages (static, no databases) |
| **Backend Logic** | Cloudflare Workers (for KV storage, summarization, API calls) |
| **Front-End Framework** | Tailwind + Next.js / React (modern, fast, responsive) |
| **AI Integration** | OpenAI API (GPT / Codex) for summarization and structuring |
| **Design Aesthetic** | Classified lab interface; sleek, hexagonal patterns; modern typography; subtle cyber-scientific design cues |
| **Data Handling** | JSON-based parsing and semantic chunking; summarization pipeline via Codex scripts |
| **Accessibility** | Must function fully client-side and handle large data with graceful degradation |

---

## 🧠 Functional Modules (Planned)

1. **Data Ingestion**
   - Parse CSV from NASA repositories.
   - Extract and normalize: `title`, `authors`, `organism`, `experiment_type`, `summary`, `link`.

2. **AI Summarization**
   - Codex script to summarize abstracts into short, digestible “knowledge bites.”
   - Auto-categorization via keywords and embeddings.

3. **Knowledge Visualization**
   - Timeline view (experiment evolution)
   - Network/graph view (organism-environment relationships)
   - “Habitable Index” visualization showing how results affect future human exploration

4. **User Interface**
   - UAC-style dashboard
   - Animated header with “Authorized Access” splash screen
   - Interactive cards displaying mission summaries
   - Search & filter (by organism, year, mission, focus)

---

## 🏆 How to Earn Bonus Points (Judging Criteria)

| Criteria | Description | How We Exceed It |
|-----------|--------------|------------------|
| **Impact** | Does it address the challenge meaningfully and advance public access to NASA data? | Yes — democratizes decades of bioscience data in a structured, accessible interface with visual and AI-driven summaries. |
| **Use of NASA Data** | Effective, innovative use of NASA’s publicly available datasets. | Integrates multiple NASA sources (Taskbook, PMC, OSIDR) into a unified graph model, adding AI-summarized layers. |
| **Innovation** | Is the concept creative and forward-thinking? | “Habitable Map” merges data visualization with narrative UI — immersive and educational, styled like secret mission intelligence. |
| **Scientific Accuracy** | Is the data represented accurately and respectfully? | Uses real metadata, citations, and verified publication links — AI summaries cite sources. |
| **User Experience** | Is the design intuitive, engaging, and visually coherent? | Modern responsive layout, space-lab aesthetic, meaningful motion and sound design for immersion. |
| **Scalability** | Can it grow beyond the hackathon? | Cloudflare-based architecture supports future expansions (API, real-time data, contribution layers). |
| **Open Science** | Does it promote transparency and reusability? | Fully open-source repo on GitHub under MIT license with clear documentation. |

---

## 💡 Design Philosophy

> “It should feel like accessing the vault of human space biology — not just reading about it.”

The UI is **scientifically clean** but **cinematically immersive**, combining **hex-based layouts**, **classified typography**, and **animated data panels** that reveal interlinked biological insights from NASA’s space experiments.

**Font Recommendations:** Space Grotesk, Exo 2, IBM Plex Sans  
**Color Palette:** Monotone slate background with cyan (#55e6a5) and orange accent (#ff6347) for critical data highlights.  
**Inspiration:** DOOM’s UAC terminal, Interstellar mission logs, NASA OSIRIS dashboards.

## 🧭 Direction for Codex Prompts

Codex should:

1. Parse CSV publication data → JSON schema.
2. Summarize long abstracts → concise, categorized entries.
3. Generate visualization-ready JSON (clusters by organism, mission, etc.).
4. Create an interactive dashboard UI (React or Next.js with Tailwind).
5. Apply UAC-style UI elements and animations.
6. Build search & filter capabilities without needing a database.
7. Optimize for readability and UX flow — balance technical density with visual clarity.

---

## 🌌 End Goal

A **living knowledge map** that connects NASA’s biological space research across missions — accessible, beautiful, and inspiring.  
The app should not only present data but also **tell the story of life beyond Earth** and how **microgravity science fuels our future on Mars.**

---

*Prepared for Codex integration and NASA Space Apps submission — 2025.*
