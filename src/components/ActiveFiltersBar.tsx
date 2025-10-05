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
      <div className="flex items-center gap-3 rounded-[3px] border border-[#1a1f24]/70 bg-[#0b0d0f]/70 px-4 py-3 font-mono text-[0.58rem] uppercase tracking-[0.3em] text-[#3f525c] shadow-[0_16px_38px_rgba(0,0,0,0.45)]">
        <span className="text-[#55e6a5]/70">Filters nominal</span>
        <span>// All dossiers shown</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[3px] border border-[#1a1f24]/70 bg-[#0b0d0f]/70 px-4 py-3 shadow-[0_16px_38px_rgba(0,0,0,0.45)]">
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.3em] text-[#55e6a5]">
        Active Filters
      </span>
      <ul className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li key={entry.key}>
            <button
              type="button"
              onClick={() => handleRemove(entry.key)}
              className="group flex items-center gap-2 rounded-full border border-amber/50 bg-[#131d26]/70 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.28em] text-amber transition-colors hover:border-amber/80 hover:bg-amber/10 hover:text-[#d6e3e0]"
            >
              <span>{entry.label}</span>
              <span className="rounded-sm bg-[#0b0d0f]/70 px-1.5 py-0.5 text-[0.55rem] group-hover:bg-amber/20">
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
        className="ml-auto rounded-full border border-[#1a1f24] bg-[#131d26]/70 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.28em] text-[#7a8b94] transition hover:border-[#55e6a5]/60 hover:text-[#d6e3e0]"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFiltersBar;
