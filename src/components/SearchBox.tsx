import { FormEvent, useEffect, useRef } from 'react';
import { useSearchStore } from '../lib/state';
import { typeahead } from '../lib/search';

const SearchBox = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const { query, setQuery, suggestions, setSuggestions } = useSearchStore((state) => ({
    query: state.query,
    setQuery: state.setQuery,
    suggestions: state.suggestions,
    setSuggestions: state.setSuggestions
  }));
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const next = typeahead(query).map((item) => ({ id: String(item.id), title: String(item.title) }));
    setSuggestions(next);
  }, [query, setSuggestions]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <label className="sr-only" htmlFor="archive-search">
          Search papers
        </label>
        <input
          id="archive-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full sm:w-[420px] bg-black/60 border border-white/15 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan/80 focus:ring-2 focus:ring-accent-cyan/40 transition"
          placeholder="Type to search title, authors, keywords"
        />
        <button
          type="submit"
          className="px-4 py-2 text-xs uppercase tracking-[0.3em] border border-accent-cyan/80 text-accent-cyan rounded-lg hover:bg-accent-cyan/10 transition"
        >
          Execute
        </button>
      </form>
      {suggestions.length > 0 && query.length > 0 ? (
        <ul
          ref={listRef}
          className="absolute mt-2 w-full sm:w-[420px] bg-black/80 border border-white/10 rounded-lg shadow-glow text-xs uppercase tracking-[0.2em] text-slate-200 divide-y divide-white/5"
        >
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent-cyan/10 focus:bg-accent-cyan/10 focus:outline-none"
                onClick={() => {
                  setQuery(item.title);
                  onSearch(item.title);
                }}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default SearchBox;
