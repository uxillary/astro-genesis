import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

const ROOT = process.cwd();
const RAW_DIR = join(ROOT, 'data', 'papers');
const OUT_DIR = join(ROOT, 'public', 'data');
const OUT_PAPERS_DIR = join(OUT_DIR, 'papers');

type KeywordCounts = Record<string, number>;

type RawPaper = {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  organism: string;
  experiment_type?: string;
  platform: string;
  keywords?: string[];
  sections: {
    abstract?: string;
    methods?: string;
    results?: string;
    conclusion?: string;
  };
  links?: Record<string, string>;
  summary?: string;
  ai_summary?: string;
  metrics?: {
    keyword_counts?: KeywordCounts;
  };
};

type CitationPoint = { y: number; c: number };

type PaperIndex = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  organism: string;
  platform: string;
  keywords: string[];
  confidence: number;
  access: string[];
  citations_by_year: CitationPoint[];
  entities: string[];
};

type PaperDetail = PaperIndex & {
  sections: {
    abstract: string;
    methods: string;
    results: string;
    conclusion: string;
  };
  ai_summary: string;
  links: {
    taskbook?: string;
    osdr?: string;
    pmc_html?: string;
    pmc_pdf?: string;
  };
};

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1950;

const clampYear = (value: number | null | undefined) => {
  if (typeof value !== 'number') return undefined;
  if (!Number.isFinite(value)) return undefined;
  const int = Math.trunc(value);
  if (int < MIN_YEAR || int > CURRENT_YEAR) return undefined;
  return int;
};

const extractYearFromText = (text?: string) => {
  if (!text) return undefined;
  const matches = Array.from(text.matchAll(/(19|20)\d{2}/g));
  for (const match of matches) {
    const candidate = clampYear(Number(match[0]));
    if (typeof candidate === 'number') {
      return candidate;
    }
  }
  return undefined;
};

const deriveYear = (paper: RawPaper) => {
  const linkValues = Object.values(paper.links ?? {});
  const linkYear = linkValues.reduce<number | undefined>((acc, value) => {
    if (typeof acc === 'number') return acc;
    return extractYearFromText(value);
  }, undefined);

  return (
    clampYear(paper.year) ??
    extractYearFromText(paper.summary) ??
    extractYearFromText(paper.sections?.abstract) ??
    extractYearFromText(paper.sections?.methods) ??
    extractYearFromText(paper.sections?.results) ??
    extractYearFromText(paper.sections?.conclusion) ??
    linkYear ??
    0
  );
};

const normaliseKeywords = (keywords: string[] = []) => {
  const seen = new Set<string>();
  return keywords
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0)
    .filter((keyword) => {
      const lower = keyword.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
};

const selectEntities = (keywordCounts: KeywordCounts | undefined, fallback: string[]) => {
  if (!keywordCounts) return fallback.slice(0, 6);
  return Object.entries(keywordCounts)
    .sort(([, aCount], [, bCount]) => bCount - aCount)
    .slice(0, 6)
    .map(([keyword]) => keyword);
};

const computeConfidence = (paper: RawPaper) => {
  const keywordCount = Object.keys(paper.metrics?.keyword_counts ?? {}).length;
  const base = 0.5;
  const keywordBoost = Math.min(0.3, keywordCount * 0.03);
  const sectionValues = Object.values(paper.sections ?? {});
  const filledSections = sectionValues.filter((value) => typeof value === 'string' && value.trim().length > 0).length;
  const sectionBoost = Math.min(0.15, filledSections * 0.02);
  const confidence = base + keywordBoost + sectionBoost;
  return Math.round(confidence * 100) / 100;
};

const deriveAccessTags = (paper: RawPaper) => {
  const tags = new Set<string>();
  if (paper.links?.pmc_html || paper.links?.pmc_pdf) {
    tags.add('PEER-REVIEWED');
  }
  if (paper.platform) {
    tags.add(paper.platform);
  }
  if (paper.experiment_type) {
    tags.add(paper.experiment_type.toUpperCase());
  }
  if (paper.links?.osdr) {
    tags.add('OSDR');
  }
  return Array.from(tags);
};

const mapLinks = (links: RawPaper['links']) => {
  return {
    taskbook: links?.taskbook,
    osdr: links?.osdr,
    pmc_html: links?.pmc_html,
    pmc_pdf: links?.pmc_pdf
  } satisfies PaperDetail['links'];
};

const ensureSections = (sections: RawPaper['sections']) => ({
  abstract: sections?.abstract ?? '',
  methods: sections?.methods ?? '',
  results: sections?.results ?? '',
  conclusion: sections?.conclusion ?? ''
});

const toDetail = (paper: RawPaper): PaperDetail => {
  const keywords = normaliseKeywords(paper.keywords ?? []);
  const keywordCounts = paper.metrics?.keyword_counts;
  const detail: PaperDetail = {
    id: paper.id,
    title: paper.title,
    authors: paper.authors,
    year: deriveYear(paper),
    organism: paper.organism,
    platform: paper.platform,
    keywords,
    sections: ensureSections(paper.sections),
    links: mapLinks(paper.links),
    ai_summary: paper.ai_summary ?? paper.summary ?? '',
    access: deriveAccessTags(paper),
    citations_by_year: [],
    confidence: computeConfidence(paper),
    entities: selectEntities(keywordCounts, keywords)
  };
  return detail;
};

const writeDetail = async (detail: PaperDetail) => {
  await writeFile(join(OUT_PAPERS_DIR, `${detail.id}.json`), JSON.stringify(detail, null, 2));
};

const toIndexEntry = ({ sections, links, ...rest }: PaperDetail): PaperIndex => rest;

const run = async () => {
  await mkdir(OUT_PAPERS_DIR, { recursive: true });
  const files = (await readdir(RAW_DIR)).filter((file) => file.endsWith('.json'));
  const details: PaperDetail[] = [];

  for (const file of files) {
    const rawPath = join(RAW_DIR, file);
    const buffer = await readFile(rawPath, 'utf-8');
    const paper = JSON.parse(buffer) as RawPaper;
    const detail = toDetail(paper);
    details.push(detail);
    await writeDetail(detail);
  }

  const sorted = details.sort((a, b) => {
    if (b.year === a.year) {
      return a.title.localeCompare(b.title);
    }
    return b.year - a.year;
  });

  const indexEntries = sorted.map((detail) => toIndexEntry(detail));
  await writeFile(join(OUT_DIR, 'index.json'), JSON.stringify(indexEntries, null, 2));

  console.log(`Generated ${details.length} dossiers from ${basename(RAW_DIR)}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
