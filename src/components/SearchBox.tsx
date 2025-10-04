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
    const next = typeahead(query).map((item) => ({
      id: String(item.id),
      title: String(item.title),
      year: Number((item as any).year ?? 0)
    }));
    setSuggestions(next);
  }, [query, setSuggestions]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 rounded-[28px] border border-white/10 bg-black/60 px-5 py-3 shadow-panel"
      >
        <label className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-dim" htmlFor="archive-search">
          Query
        </label>
        <input
          id="archive-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1 bg-transparent font-mono text-[0.85rem] uppercase tracking-[0.28em] text-white placeholder:text-dim focus:outline-none"
          placeholder="Title / authors / keywords"
        />
        <button
          type="submit"
          className="rounded-full border border-amber/60 px-4 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-amber hover:bg-amber/10"
        >
          Execute
        </button>
      </form>
      {suggestions.length > 0 && query.length > 0 ? (
        <ul
          ref={listRef}
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-[20px] border border-white/12 bg-panel/90 backdrop-blur-xl text-left shadow-panel"
        >
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.26em] text-mid hover:bg-amber/10 hover:text-white"
                onClick={() => {
                  setQuery(item.title);
                  onSearch(item.title);
                }}
              >
                <span className="truncate text-left">{item.title}</span>
                <span className="text-dim">{item.year || '—'}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default SearchBox;
