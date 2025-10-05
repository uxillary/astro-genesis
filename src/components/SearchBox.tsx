import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { useSearchStore } from '../lib/state';
import { typeahead } from '../lib/search';
import { useConnectorLayer } from '@/components/fui';

const SearchBox = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const { query, setQuery, suggestions, setSuggestions } = useSearchStore((state) => ({
    query: state.query,
    setQuery: state.setQuery,
    suggestions: state.suggestions,
    setSuggestions: state.setSuggestions
  }));
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLLIElement | null>(null);
  const executeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listboxId = useId();
  const connector = useConnectorLayer();

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

  useEffect(() => {
    const element = executeRef.current;
    if (!connector || !element) return undefined;
    connector.registerAnchor('search-execute', element, ['right', 'bottom']);
    return () => connector.unregisterAnchor('search-execute');
  }, [connector]);

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
      <form onSubmit={handleSubmit} className="search-console">
        <label className="search-console__label" htmlFor="archive-search">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M12.5 12.5L17.5 17.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8.5 3V1.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8.5 15V16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Query title / authors</span>
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
          className="search-console__input focus:outline-none"
          placeholder="Title / authors / keywords"
        />
        <button ref={executeRef} type="submit" className="search-console__cta">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 10H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path
              d="M11.5 5.5L17 10L11.5 14.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Execute</span>
        </button>
      </form>
      {open && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Suggested dossiers"
          className="absolute z-20 mt-3 max-h-72 w-full overflow-auto border border-[#d6e3e0]/18 bg-[#05090d]/95 backdrop-blur-xl text-left shadow-[0_18px_44px_rgba(0,0,0,0.45)]"
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
                  'flex w-full items-center justify-between gap-4 border-b border-[#0f161d] px-6 py-3 font-mono text-[0.78rem] uppercase tracking-[0.2em] transition-colors last:border-b-0 ' +
                  (index === activeIndex
                    ? 'bg-[rgba(0,179,255,0.12)] text-[#f1f7f5] shadow-[0_0_18px_rgba(0,179,255,0.18)]'
                    : 'text-[#8fa1ac] hover:bg-[rgba(0,179,255,0.08)] hover:text-[#f1f7f5]')
                }
                onClick={() => handleSuggestionSelect(item.title)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="truncate text-left">{item.title}</span>
                <span className="text-[#6f828d]">{item.year || '—'}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default SearchBox;
