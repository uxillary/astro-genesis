import { create } from 'zustand';
import type { FilterState } from './types';
import type { PaperRecord } from './db';

type SearchStore = {
  query: string;
  filters: FilterState;
  results: PaperRecord[];
  suggestions: { id: string; title: string; year?: number }[];
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setResults: (records: PaperRecord[]) => void;
  setSuggestions: (items: { id: string; title: string; year?: number }[]) => void;
};

type UiMode = 'hud' | 'mono';

type UiStore = {
  mode: UiMode;
  showHelp: boolean;
  credentialOpen: boolean;
  branchLayout: 'layered' | 'radial';
  toggleMode: () => void;
  setHelp: (open: boolean) => void;
  setCredential: (open: boolean) => void;
  setBranchLayout: (layout: 'layered' | 'radial') => void;
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

export const useUiStore = create<UiStore>((set) => ({
  mode: 'hud',
  showHelp: false,
  credentialOpen: false,
  branchLayout: 'layered',
  toggleMode: () =>
    set((state) => ({
      mode: state.mode === 'hud' ? 'mono' : 'hud'
    })),
  setHelp: (open) => set({ showHelp: open }),
  setCredential: (open) => set({ credentialOpen: open }),
  setBranchLayout: (layout) => set({ branchLayout: layout })
}));
