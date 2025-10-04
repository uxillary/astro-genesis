import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { useSearchStore } from '../lib/state';
import { typeahead } from '../lib/search';

const SearchBox = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const { query, setQuery, suggestions, setSuggestions } = useSearchStore((state) => ({
    query: state.query,
    setQuery: state.setQuery,
    suggestions: state.suggestions,
    setSuggestions: state.setSuggestions
  }));
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLLIElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listboxId = useId();

  useEffect(() => {
    const next = typeahead(query).map((item) => ({
      id: String(item.id),
      title: String(item.title),
      year: Number((item as any).year ?? 0)
    }));
    setSuggestions(next);
  }, [query, setSuggestions]);

  useEffect(() => {
    if (suggestions.length > 0 && query.trim().length > 0) {
      setOpen(true);
      setActiveIndex((current) => (current >= 0 && current < suggestions.length ? current : 0));
    } else {
      setOpen(false);
      setActiveIndex(-1);
    }
  }, [suggestions, query]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleSuggestionSelect = (title: string) => {
    setQuery(title);
    onSearch(title);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(query.trim());
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && ['ArrowDown', 'ArrowUp'].includes(event.key) && suggestions.length > 0) {
      setOpen(true);
      setActiveIndex(0);
      event.preventDefault();
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        if (suggestions.length === 0) return;
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        if (suggestions.length === 0) return;
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        if (open && activeIndex >= 0 && suggestions[activeIndex]) {
          event.preventDefault();
          handleSuggestionSelect(suggestions[activeIndex].title);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 rounded-[28px] border border-[#d6e3e0]/10 bg-[#0b0d0f]/60 px-5 py-3 shadow-panel"
      >
        <label className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-dim" htmlFor="archive-search">
          Query
        </label>
        <input
          id="archive-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(suggestions.length > 0 && query.trim().length > 0)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-${suggestions[activeIndex]?.id}` : undefined}
          className="flex-1 bg-transparent font-mono text-[0.85rem] uppercase tracking-[0.28em] text-[#d6e3e0] placeholder:text-dim focus:outline-none"
          placeholder="Title / authors / keywords"
        />
        <button
          type="submit"
          className="rounded-full border border-amber/60 px-4 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-amber hover:bg-amber/10"
        >
          Execute
        </button>
      </form>
      {open && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Suggested dossiers"
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-[20px] border border-[#d6e3e0]/12 bg-panel/90 backdrop-blur-xl text-left shadow-panel"
        >
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              id={`${listboxId}-${item.id}`}
              ref={index === activeIndex ? activeItemRef : undefined}
            >
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={
                  'flex w-full items-center justify-between gap-3 px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.26em] transition-colors ' +
                  (index === activeIndex
                    ? 'bg-amber/10 text-[#d6e3e0] shadow-[0_0_18px_rgba(244,159,66,0.22)]'
                    : 'text-mid hover:bg-amber/10 hover:text-[#d6e3e0]')
                }
                onClick={() => handleSuggestionSelect(item.title)}
                onMouseEnter={() => setActiveIndex(index)}
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
