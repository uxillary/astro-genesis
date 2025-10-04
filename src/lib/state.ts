import { create } from 'zustand';
import type { FilterState } from './types';
import type { PaperRecord } from './db';

type SearchStore = {
  query: string;
  filters: FilterState;
  results: PaperRecord[];
  suggestions: { id: string; title: string }[];
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setResults: (records: PaperRecord[]) => void;
  setSuggestions: (items: { id: string; title: string }[]) => void;
};

const defaultFilters: FilterState = {
  organism: null,
  platform: null,
  year: null
};

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  filters: defaultFilters,
  results: [],
  suggestions: [],
  setQuery: (query) => set({ query }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters }
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  setResults: (records) => set({ results: records }),
  setSuggestions: (items) => set({ suggestions: items })
}));
