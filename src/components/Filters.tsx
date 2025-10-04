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
    <aside className="rounded-[28px] border border-[#123025]/70 bg-[#04100d]/80 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-[#55ffb4]">Filters</p>
          <h3 className="text-lg font-semibold tracking-[0.18em] text-white">Operational Scope</h3>
        </div>
        <button
          className="rounded-full border border-[#123025] bg-[#061a14]/80 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-[#6d8179] transition hover:border-[#55ffb4]/60 hover:text-white/90"
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
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-[#6d8179]">{label}</p>
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
              ? 'border-[#55ffb4]/70 bg-[#0b1f19]/80 text-[#55ffb4] shadow-[0_0_18px_rgba(85,255,180,0.35)]'
              : 'border-[#123025] text-[#6d8179] hover:border-[#55ffb4]/50 hover:text-white'
          )}
          onClick={() => onSelect(option.value)}
        >
          <span>{option.label}</span>
          <span className="rounded-sm bg-black/40 px-1.5 py-0.5 text-[0.55rem] text-[#6d8179] group-hover:text-white">{option.count}</span>
        </button>
      ))}
    </div>
  </div>
);

export default Filters;
