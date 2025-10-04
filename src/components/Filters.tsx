import clsx from 'clsx';
import { useSearchStore } from '../lib/state';

export type FilterOption = {
  label: string;
  value: string | number;
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
    <div className="border border-white/10 rounded-xl p-4 bg-black/40 backdrop-blur-sm text-[0.65rem] uppercase tracking-[0.3em] space-y-3">
      <header className="flex items-center justify-between text-slate-400">
        <span>Filters</span>
        <button
          className="text-[0.55rem] text-accent-cyan hover:text-white transition"
          onClick={() => resetFilters()}
          type="button"
        >
          Reset
        </button>
      </header>
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
        label="Year"
        options={years}
        activeValue={filters.year ?? undefined}
        onSelect={(value) => setFilters({ year: filters.year === value ? null : Number(value) })}
      />
    </div>
  );
};

type FilterGroupProps = {
  label: string;
  options: FilterOption[];
  activeValue?: string | number;
  onSelect: (value: string | number) => void;
};

const FilterGroup = ({ label, options, activeValue, onSelect }: FilterGroupProps) => (
  <div className="space-y-2">
    <p className="text-slate-500">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={clsx(
            'px-3 py-1 rounded-full border text-[0.6rem] transition-colors duration-200',
            activeValue === option.value
              ? 'border-accent-amber text-accent-amber bg-accent-amber/10'
              : 'border-white/15 text-slate-300 hover:border-accent-amber/60 hover:text-accent-amber'
          )}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

export default Filters;
