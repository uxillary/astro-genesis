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
    <aside className="rounded-[3px] border border-[#1a1f24]/60 bg-[#10161d]/92 p-7 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.78rem] uppercase tracking-[0.24em] text-[#67f3b5]">Filters</p>
          <h3 className="text-2xl font-semibold tracking-[0.14em] text-[#f1f7f5]">Operational Scope</h3>
        </div>
        <button
          className="rounded-full border border-[#1a1f24] bg-[#131d26]/80 px-5 py-2 font-mono text-[0.82rem] uppercase tracking-[0.2em] text-[#8fa1ac] transition hover:border-[#55e6a5]/60 hover:text-[#d6e3e0]"
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
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="font-mono text-[0.78rem] uppercase tracking-[0.24em] text-[#8fa1ac]">{label}</p>
      <HudBadge label="Count" tone="cyan" compact value={<span>{options.reduce((acc, option) => acc + option.count, 0)}</span>} />
    </div>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={clsx(
            'group flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[0.78rem] uppercase tracking-[0.2em] transition-colors duration-200',
            activeValue === option.value
              ? 'border-[#55e6a5]/70 bg-[#142027]/80 text-[#55e6a5] shadow-[0_0_18px_rgba(85,230,165,0.35)]'
              : 'border-[#1a1f24] text-[#7a8b94] hover:border-[#55e6a5]/50 hover:text-[#d6e3e0]'
          )}
          onClick={() => onSelect(option.value)}
        >
          <span>{option.label}</span>
          <span className="rounded-sm bg-[#0b0d0f]/50 px-2 py-0.5 text-[0.7rem] text-[#8fa1ac] group-hover:text-[#d6e3e0]">{option.count}</span>
        </button>
      ))}
    </div>
  </div>
);

export default Filters;
