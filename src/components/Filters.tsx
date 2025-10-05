import clsx from 'clsx';
import HudBadge from './HudBadge';
import { useSearchStore } from '../lib/state';

export type FilterOption = {
  label: string;
  value: string | number;
  count: number;
};

type FilterProps = {
  organisms: FilterOption[];
  platforms: FilterOption[];
  years: FilterOption[];
};

const Filters = ({ organisms, platforms, years }: FilterProps) => {
  const { filters, setFilters, resetFilters } = useSearchStore((state) => ({
    filters: state.filters,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters
  }));

  return (
    <aside className="flex h-full flex-col gap-6">
      <header className="flex items-center justify-between rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(8,12,16,0.85)] px-4 py-3">
        <div>
          <p className="font-meta text-[0.74rem] tracking-[0.24em] text-[color:var(--accent-1)]">Filters</p>
          <h3 className="text-xl text-[color:var(--white)]">Operational scope</h3>
        </div>
        <button
          className="panel-hover rounded-full border border-[rgba(32,42,50,0.6)] bg-[rgba(13,20,26,0.82)] px-5 py-2 font-meta text-[0.74rem] tracking-[0.22em] text-[color:var(--mid)] hover:text-[color:var(--white)]"
          onClick={() => resetFilters()}
          type="button"
        >
          Reset
        </button>
      </header>
      <div className="space-y-6 rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.8)] p-5">
        <FilterGroup
          label="Organism"
          options={organisms}
          activeValue={filters.organism ?? undefined}
          onSelect={(value) => setFilters({ organism: filters.organism === value ? null : String(value) })}
        />
        <FilterGroup
          label="Platform"
          options={platforms}
          activeValue={filters.platform ?? undefined}
          onSelect={(value) => setFilters({ platform: filters.platform === value ? null : String(value) })}
        />
        <FilterGroup
          label="Mission Year"
          options={years}
          activeValue={filters.year ?? undefined}
          onSelect={(value) => setFilters({ year: filters.year === value ? null : Number(value) })}
        />
      </div>
    </aside>
  );
};

type FilterGroupProps = {
  label: string;
  options: FilterOption[];
  activeValue?: string | number;
  onSelect: (value: string | number) => void;
};

const FilterGroup = ({ label, options, activeValue, onSelect }: FilterGroupProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="font-meta text-[0.74rem] tracking-[0.22em] text-[color:var(--passive)]">{label}</p>
      <HudBadge label="Count" tone="cyan" compact value={<span>{options.reduce((acc, option) => acc + option.count, 0)}</span>} />
    </div>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={clsx(
            'group flex items-center gap-2 rounded-full border px-4 py-2 font-meta text-[0.72rem] tracking-[0.2em] transition-colors duration-200',
            activeValue === option.value
              ? 'border-[rgba(85,230,165,0.45)] bg-[rgba(20,35,40,0.92)] text-[color:var(--accent-1)] shadow-[0_0_20px_rgba(85,230,165,0.35)]'
              : 'border-[rgba(32,42,50,0.6)] text-[color:var(--mid)] hover:border-[rgba(0,179,255,0.35)] hover:text-[color:var(--white)]'
          )}
          onClick={() => onSelect(option.value)}
        >
          <span>{option.label}</span>
          <span className="rounded-sm bg-[rgba(8,12,16,0.6)] px-2 py-0.5 text-[0.7rem] text-[color:var(--passive)] group-hover:text-[color:var(--white)]">{option.count}</span>
        </button>
      ))}
    </div>
  </div>
);

export default Filters;
