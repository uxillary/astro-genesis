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
    <aside className="rounded-[28px] border border-white/10 bg-panel/70 p-6 shadow-panel">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">Filters</p>
          <h3 className="text-lg font-semibold tracking-[0.18em] text-white">Operational Scope</h3>
        </div>
        <button
          className="rounded-full border border-white/20 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-dim hover:text-white/90"
          onClick={() => resetFilters()}
          type="button"
        >
          Reset
        </button>
      </header>
      <div className="space-y-6">
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
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">{label}</p>
      <HudBadge label="Count" tone="cyan" compact value={<span>{options.reduce((acc, option) => acc + option.count, 0)}</span>} />
    </div>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={clsx(
            'group flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.28em] transition-colors duration-200',
            activeValue === option.value
              ? 'border-amber/60 bg-amber/10 text-amber'
              : 'border-white/15 text-mid hover:border-amber/40 hover:text-white'
          )}
          onClick={() => onSelect(option.value)}
        >
          <span>{option.label}</span>
          <span className="rounded-sm bg-black/40 px-1.5 py-0.5 text-[0.55rem] text-dim group-hover:text-white">{option.count}</span>
        </button>
      ))}
    </div>
  </div>
);

export default Filters;
