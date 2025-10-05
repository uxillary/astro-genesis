import { useSearchStore } from '../lib/state';

const filterLabels: Record<'organism' | 'platform' | 'year', string> = {
  organism: 'Organism',
  platform: 'Platform',
  year: 'Mission Year'
};

const ActiveFiltersBar = () => {
  const { filters, setFilters, resetFilters } = useSearchStore((state) => ({
    filters: state.filters,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters
  }));

  const entries = (Object.entries(filters) as [keyof typeof filters, string | number | null][])
    .filter(([, value]) => value !== null)
    .map(([key, value]) => ({
      key,
      label: filterLabels[key],
      value: String(value)
    }));

  const handleRemove = (key: keyof typeof filters) => {
    const patch: Partial<typeof filters> = { [key]: null };
    setFilters(patch);
  };

  if (entries.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-[3px] border border-[#1a1f24]/60 bg-[#0b0d0f]/75 px-5 py-3.5 font-mono text-[0.78rem] uppercase tracking-[0.24em] text-[#4d606a] shadow-[0_16px_38px_rgba(0,0,0,0.45)]">
        <span className="text-[#67f3b5]/80">Filters nominal</span>
        <span className="text-[#8fa1ac]">// All dossiers shown</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[3px] border border-[#1a1f24]/60 bg-[#0b0d0f]/75 px-5 py-3.5 shadow-[0_16px_38px_rgba(0,0,0,0.45)]">
      <span className="font-mono text-[0.78rem] uppercase tracking-[0.24em] text-[#67f3b5]">
        Active Filters
      </span>
      <ul className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li key={entry.key}>
            <button
              type="button"
              onClick={() => handleRemove(entry.key)}
              className="group flex items-center gap-2 rounded-full border border-amber/50 bg-[#131d26]/75 px-4 py-1.5 font-mono text-[0.78rem] uppercase tracking-[0.2em] text-amber transition-colors hover:border-amber/80 hover:bg-amber/10 hover:text-[#f1f7f5]"
            >
              <span>{entry.label}</span>
              <span className="rounded-sm bg-[#0b0d0f]/70 px-2 py-0.5 text-[0.72rem] text-[#8fa1ac] group-hover:bg-amber/20 group-hover:text-[#f1f7f5]">
                {entry.value}
              </span>
              <span className="text-[#d6e3e0]/70 group-hover:text-[#d6e3e0]">×</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => resetFilters()}
        className="ml-auto rounded-full border border-[#1a1f24] bg-[#131d26]/80 px-4 py-1.5 font-mono text-[0.78rem] uppercase tracking-[0.2em] text-[#8fa1ac] transition hover:border-[#55e6a5]/60 hover:text-[#f1f7f5]"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFiltersBar;
