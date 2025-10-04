import MiniSearch, { SearchResult } from 'minisearch';
import type { PaperRecord } from './db';
import type { FilterState } from './types';

const miniSearch = new MiniSearch<PaperRecord>({
  fields: ['title', 'authors', 'keywords'],
  storeFields: ['id', 'title', 'authors', 'year', 'organism', 'platform', 'keywords'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.1
  }
});

let cachedRecords: PaperRecord[] = [];

export const buildIndex = (papers: PaperRecord[]) => {
  cachedRecords = papers;
  miniSearch.removeAll();
  miniSearch.addAll(papers);
};

export const typeahead = (query: string, limit = 5): SearchResult[] => {
  if (!query) return [];
  return miniSearch.search(query).slice(0, limit);
};

export const runSearch = (query: string, filters: FilterState) => {
  let results: PaperRecord[];
  if (!query) {
    results = cachedRecords;
  } else {
    const hits = miniSearch.search(query, { combineWith: 'AND' });
    results = hits
      .map((hit) => cachedRecords.find((record) => record.id === hit.id))
      .filter((record): record is PaperRecord => Boolean(record));
  }

  return results.filter((paper) => {
    if (filters.organism && paper.organism !== filters.organism) return false;
    if (filters.platform && paper.platform !== filters.platform) return false;
    if (filters.year && paper.year !== filters.year) return false;
    return true;
  });
};

export const getCachedRecords = () => cachedRecords;
