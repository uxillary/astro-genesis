# 🧬 AstroGenesis Ingestion Pipeline — Simplified Overview

### 🚀 What It Does

This script is your complete ingestion pipeline — it automates collecting and structuring NASA’s bioscience experiment data into clean JSON files that your UI can use.

When you run it, it performs the following steps:

1. **Reads the NASA CSV (resources/SB_publication_PMC.csv)**  
   The CSV lists hundreds of NASA bioscience publications with PMCID links (like PMC123456). The script automatically finds and processes those IDs.

2. **Downloads and Caches Each Article**  
   It fetches the full HTML pages for each PMCID from PubMed Central (PMC).  
   Each HTML file is saved locally in the folder data/raw_pmc/, allowing re-runs without re-downloading everything.

3. **Extracts Structured Information**  
   From each raw HTML file, the script identifies and extracts:  
   - Title, authors, and publication year  
   - Key sections such as Abstract, Methods, Results, and Conclusion  
   It then cleans and organizes the text for consistency.

4. **Adds Extra Fields Using AI (Optional)**  
   If an OpenAI API key is set in your environment, the script uses GPT-4o to infer and summarize extra details:  
   - Organism (e.g., Human, Arabidopsis thaliana)  
   - Experiment type (e.g., Microgravity Research)  
   - Platform (e.g., ISS, Shuttle)  
   - Keywords  
   - Concise summary paragraph  

   If no API key is provided, the script falls back to built-in heuristic detection for these fields.

5. **Saves Everything as Structured JSON Files**  
   Each publication becomes a single JSON file (e.g., data/papers/exp_001.json) containing all the extracted and summarized information needed for your UI.

6. **Adds Basic Metrics**  
   The script also includes lightweight metrics like publication year and simple keyword occurrence counts to assist with graphs and analytics later.

---

### 🧩 Folder Structure Overview

| Folder | Purpose |
|---------|----------|
| resources/ | Contains the input CSV (SB_publication_PMC.csv) |
| data/raw_pmc/ | Stores cached raw HTML files for each PMC article |
| data/papers/ | Stores the final JSON outputs used by your dashboard |

---

### 🧠 How to Use It

1. Place this file in your repository (e.g., scripts/ingest_pmc.py)  
2. Install required dependencies  
3. (Optional) Set your OpenAI API key  
4. Run the script to fetch and process publications  
5. Check that JSON files have been created under data/papers/

---

### ✅ In Short

This script:
- Collects raw data from NASA’s bioscience publication list  
- Cleans and structures the information  
- Uses AI to enrich each record with summaries and metadata  
- Outputs clean JSON files ready for your AstroGenesis dashboard
