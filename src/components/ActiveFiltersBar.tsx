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
      <div className="flex items-center gap-4 rounded-[6px] border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.75)] px-5 py-3.5 font-meta text-[0.74rem] tracking-[0.22em] text-[color:var(--passive)] shadow-[0_16px_38px_rgba(0,0,0,0.45)]">
        <span className="text-[rgba(85,230,165,0.8)]">Filters nominal</span>
        <span className="text-[color:var(--mid)]">// All dossiers shown</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[6px] border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.75)] px-5 py-3.5 shadow-[0_16px_38px_rgba(0,0,0,0.45)]">
      <span className="font-meta text-[0.74rem] tracking-[0.24em] text-[color:var(--accent-1)]">
        Active Filters
      </span>
      <ul className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li key={entry.key}>
            <button
              type="button"
              onClick={() => handleRemove(entry.key)}
              className="group flex items-center gap-2 rounded-full border border-[rgba(0,179,255,0.35)] bg-[rgba(12,18,24,0.65)] px-4 py-1.5 font-meta text-[0.72rem] tracking-[0.2em] text-[color:var(--accent-2)] transition-colors hover:border-[rgba(0,179,255,0.55)] hover:bg-[rgba(0,179,255,0.15)] hover:text-[color:var(--white)]"
            >
              <span>{entry.label}</span>
              <span className="rounded-sm bg-[rgba(8,12,16,0.7)] px-2 py-0.5 text-[0.7rem] text-[color:var(--mid)] group-hover:bg-[rgba(0,179,255,0.2)] group-hover:text-[color:var(--white)]">
                {entry.value}
              </span>
              <span className="text-[rgba(244,252,251,0.75)] group-hover:text-[color:var(--white)]">×</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => resetFilters()}
        className="ml-auto rounded-full border border-[rgba(32,42,50,0.6)] bg-[rgba(13,20,26,0.82)] px-4 py-1.5 font-meta text-[0.72rem] tracking-[0.22em] text-[color:var(--mid)] transition hover:border-[rgba(0,179,255,0.45)] hover:text-[color:var(--white)]"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFiltersBar;
