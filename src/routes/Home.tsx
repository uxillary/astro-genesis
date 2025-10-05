import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { seedIndex, listPaperIndex, isDexieAvailable, type PaperRecord } from '../lib/db';
import type { PaperIndex } from '../lib/types';
import Filters from '../components/Filters';
import SearchBox from '../components/SearchBox';
import CardStack from '../components/CardStack';
import PcbHeader from '@/components/fui/PcbHeader';
import HudBadge from '@/components/fui/HudBadge';
import ActiveFiltersBar from '../components/ActiveFiltersBar';
import { useSearchStore } from '../lib/state';
import { buildIndex, runSearch, getCachedRecords } from '../lib/search';
import { withBase } from '../lib/paths';

const fetchIndex = async (): Promise<PaperIndex[]> => {
  const response = await fetch(withBase('data/index.json'));
  if (!response.ok) throw new Error('Failed to load index');
  return response.json();
};

const Home = () => {
  const queryClient = useQueryClient();
  const { query, filters, setResults, results } = useSearchStore((state) => ({
    query: state.query,
    filters: state.filters,
    setResults: state.setResults,
    results: state.results
  }));
  const dexieReady = isDexieAvailable();

  const [uplinkActive, setUplinkActive] = useState(false);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [connectionRestored, setConnectionRestored] = useState(false);

  const indexQuery = useQuery({
    queryKey: ['index'],
    queryFn: fetchIndex,
    staleTime: Infinity
  });

  useEffect(() => {
    if (indexQuery.data) {
      seedIndex(indexQuery.data).then(() => {
        queryClient.invalidateQueries({ queryKey: ['papers'] }).catch(() => undefined);
      });
    }
  }, [indexQuery.data, queryClient]);

  const papersQuery = useQuery({
    queryKey: ['papers'],
    queryFn: async () => listPaperIndex(),
    staleTime: Infinity,
    initialData: [] as Awaited<ReturnType<typeof listPaperIndex>>
  });

  useEffect(() => {
    const fetching = indexQuery.isFetching || papersQuery.isFetching;
    if (fetching) {
      setUplinkActive(true);
    } else if (uplinkActive) {
      const timeout = window.setTimeout(() => setUplinkActive(false), 1200);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [indexQuery.isFetching, papersQuery.isFetching, uplinkActive]);

  useEffect(() => {
    if (papersQuery.data) {
      buildIndex(papersQuery.data);
      setResults(runSearch(query, filters));
    }
  }, [papersQuery.data, query, filters, setResults]);

  useEffect(() => {
    setResults(runSearch(query, filters));
  }, [query, filters, setResults]);

  const filterOptions = useMemo(() => {
    const records = getCachedRecords();
    const toCounts = <T extends string | number>(values: T[]) => {
      return Array.from(values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<T, number>()).entries())
        .sort((a, b) => (typeof a[0] === 'number' ? Number(b[0]) - Number(a[0]) : String(a[0]).localeCompare(String(b[0]))))
        .map(([value, count]) => ({ label: String(value), value, count }));
    };

    return {
      organisms: toCounts(records.map((item) => item.organism)),
      platforms: toCounts(records.map((item) => item.platform)),
      years: toCounts(records.map((item) => item.year))
    };
  }, [papersQuery.data]);

  const totalRecords = papersQuery.data?.length ?? 0;
  const integrity = totalRecords > 0 ? results.length / totalRecords : 0;

  const timeline = useMemo(() => buildTimeline(results), [results]);
  const availableYears = timeline.map((item) => item.year);

  useEffect(() => {
    if (!activeYear && availableYears.length > 0) {
      setActiveYear(availableYears[0]);
    }
  }, [activeYear, availableYears]);

  useEffect(() => {
    if (results.length > 0) {
      setConnectionRestored(true);
      const timer = window.setTimeout(() => setConnectionRestored(false), 1800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [results.length]);

  const activeYearRecords = useMemo(() => {
    if (!activeYear) return [];
    return results.filter((item) => item.year === activeYear);
  }, [results, activeYear]);

  const analystSummaries = useMemo(() => {
    const items = activeYearRecords.length > 0 ? activeYearRecords : results;
    return items.slice(0, 4).map((record) => ({
      id: record.id,
      title: record.title,
      summary: synthesiseSummary(record),
      confidence: record.confidence,
      platform: record.platform,
      organism: record.organism,
      year: record.year
    }));
  }, [activeYearRecords, results]);

  const confidenceMatrix = useMemo(() => buildConfidenceMatrix(results), [results]);

  return (
    <div className="relative z-10 space-y-12">
      <section className="relative">
        <span className="section-anchor">Mission Control</span>
        <div className="layered-panel grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.8)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <p className="font-meta text-[0.8rem] tracking-[0.22em] text-[color:var(--accent-1)]">BioArchive Intelligence</p>
              <h1 className="mt-3 text-[2.6rem] text-[color:var(--white)] sm:text-[3rem]">Classified Ops Console</h1>
              <p className="mt-4 max-w-2xl font-body text-[0.95rem] leading-relaxed text-[color:var(--mid)]">
                Coordinate NASA&apos;s bio-intelligence archive. Triangulate organisms, platforms, and temporal signals to decode lost transmissions and brief mission teams with rapid clarity.
              </p>
              <PcbHeader
                className="mt-6"
                density={1}
                traces={[
                  { from: 'b-dossiers:right', to: 'b-cache:left', style: 'dotted', accent: 'cyan', signal: true },
                  { from: 'b-cache:bottom', exit: 'bottom', style: 'solid', accent: 'amber' },
                  { from: 'b-integrity:right', exit: 'right', style: 'solid', accent: 'red' }
                ]}
              >
                <HudBadge id="b-dossiers" tone="cyan" label="Dossiers" value={<span>{results.length.toString().padStart(2, '0')}</span>} />
                <HudBadge
                  id="b-cache"
                  tone={dexieReady ? 'amber' : 'red'}
                  label="Cache"
                  value={<span>{dexieReady ? 'Dexie cache' : 'Memory only'}</span>}
                />
                {indexQuery.isLoading ? <HudBadge id="b-sync" tone="cyan" label="Sync" value={<span>Updating</span>} /> : null}
                {indexQuery.isError ? <HudBadge id="b-sync-error" tone="red" label="Sync" value={<span>Failed</span>} /> : null}
                <HudBadge id="b-integrity" tone="cyan" label="Integrity" value={<span>{Math.round(integrity * 100)}%</span>} />
              </PcbHeader>
            </div>

            <div className="rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.8)] p-6">
              <SignalUplinkIndicator
                active={uplinkActive}
                restored={connectionRestored}
                hasError={Boolean(indexQuery.error || papersQuery.error)}
              />
              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <SearchBox onSearch={() => setResults(runSearch(query, filters))} />
                  <ActiveFiltersBar />
                  <div className="flex items-center gap-3 text-[0.78rem] font-meta tracking-[0.22em] text-[color:var(--passive)]">
                    <span>Need help?</span>
                    <kbd className="rounded border border-[rgba(214,227,224,0.25)] bg-[rgba(10,15,20,0.7)] px-2 py-1 text-[rgba(244,252,251,0.8)]">?</kbd>
                    <span>Press for console reference</span>
                  </div>
                </div>
                <TransmissionIntegrityMeter integrity={integrity} totalRecords={totalRecords} activeYear={activeYear} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.8)] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
            <Filters {...filterOptions} />
          </div>
        </div>
      </section>

      <section className="relative">
        <span className="section-anchor">Dossier Grid</span>
        <div className="layered-panel space-y-6 px-6 py-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-meta text-[0.78rem] tracking-[0.22em] text-[color:var(--accent-2)]">Results</p>
              <h2 className="text-3xl text-[color:var(--white)]">Stacked Dossiers</h2>
            </div>
            <Link
              to="/tactical"
              className="panel-hover rounded-full border border-[rgba(26,31,36,0.55)] bg-[rgba(13,20,26,0.82)] px-5 py-2 font-meta text-[0.8rem] tracking-[0.22em] text-[color:var(--mid)] hover:text-[color:var(--white)]"
            >
              Tactical map
            </Link>
          </header>
          {results.length > 0 ? <CardStack items={results} /> : <EmptyState restoring={connectionRestored} />}
        </div>
      </section>

      <section className="relative">
        <span className="section-anchor">Signal Analysis</span>
        <div className="layered-panel grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <MissionTimeline timeline={timeline} activeYear={activeYear} onYearChange={setActiveYear} />
            <ConfidenceHeatGrid matrix={confidenceMatrix} activeYear={activeYear} onYearChange={setActiveYear} />
            <HabitableMapVisualizer records={results} activeYear={activeYear} />
          </div>
          <AnalystSummary summaries={analystSummaries} />
        </div>
      </section>
    </div>
  );
};

type TimelinePoint = {
  year: number;
  total: number;
  entities: number;
  averageConfidence: number;
  records: PaperRecord[];
};

type MissionTimelineProps = {
  timeline: TimelinePoint[];
  activeYear: number | null;
  onYearChange: (year: number) => void;
};

const MissionTimeline = ({ timeline, activeYear, onYearChange }: MissionTimelineProps) => {
  if (timeline.length === 0) {
    return (
      <div className="rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.75)] p-6 text-[color:var(--mid)]">
        No mission chronology detected. Adjust filters to rehydrate the transmission.
      </div>
    );
  }

  const minYear = timeline[timeline.length - 1]?.year ?? 0;
  const maxYear = timeline[0]?.year ?? 0;

  return (
    <div className="rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.8)] p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-meta text-[0.74rem] tracking-[0.22em] text-[color:var(--accent-1)]">Mission Timeline</p>
          <h3 className="text-2xl text-[color:var(--white)]">Scrubbable mission chronology</h3>
        </div>
        <div className="font-meta text-[0.74rem] tracking-[0.22em] text-[color:var(--mid)]">
          <span>{minYear}</span>
          <span className="mx-1">—</span>
          <span>{maxYear}</span>
        </div>
      </header>
      <div className="mt-6 space-y-6">
        <div className="relative h-32 overflow-hidden rounded-xl border border-[rgba(26,31,36,0.55)] bg-[rgba(9,14,18,0.75)] p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,179,255,0.15),_transparent_65%)] opacity-60" />
          <div className="relative flex h-full items-center justify-between">
            {timeline.map((point) => (
              <button
                key={point.year}
                type="button"
                className={`group relative flex h-full flex-1 flex-col items-center justify-end focus-visible:outline-none`}
                onClick={() => onYearChange(point.year)}
              >
                <div className="flex h-full w-px justify-center">
                  <span
                    className={`h-full w-px rounded-full transition-all duration-300 ${
                      activeYear === point.year
                        ? 'bg-[color:var(--accent-2)] shadow-[0_0_24px_rgba(0,179,255,0.45)]'
                        : 'bg-[rgba(0,179,255,0.25)]'
                    }`}
                  />
                </div>
                <div
                  className={`mt-3 flex items-center gap-2 rounded-full border px-3 py-1 font-meta text-[0.68rem] tracking-[0.24em] transition ${
                    activeYear === point.year
                      ? 'border-[rgba(0,179,255,0.45)] bg-[rgba(13,24,32,0.9)] text-[color:var(--accent-2)]'
                      : 'border-transparent bg-[rgba(10,15,20,0.6)] text-[color:var(--mid)] hover:border-[rgba(0,179,255,0.25)] hover:text-[color:var(--white)]'
                  }`}
                >
                  <span>{point.year}</span>
                  <span className="rounded-sm bg-[rgba(0,179,255,0.15)] px-2 py-0.5 text-[0.65rem] text-[rgba(244,252,251,0.85)]">
                    {point.total}
                  </span>
                </div>
                <TimelineTooltip point={point} active={activeYear === point.year} />
              </button>
            ))}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(timeline.length - 1, 0)}
          step={1}
          value={Math.max(timeline.findIndex((point) => point.year === activeYear), 0)}
          onChange={(event) => {
            const index = Number(event.target.value);
            const point = timeline[index];
            if (point) onYearChange(point.year);
          }}
          className="w-full accent-[var(--accent-2)]"
          aria-label="Scrub mission timeline"
        />
      </div>
    </div>
  );
};

type TimelineTooltipProps = {
  point: TimelinePoint;
  active: boolean;
};

const TimelineTooltip = ({ point, active }: TimelineTooltipProps) => (
  <div
    className={`pointer-events-none absolute -top-28 flex w-56 flex-col gap-2 rounded-xl border border-[rgba(26,31,36,0.55)] bg-[rgba(8,12,16,0.9)] p-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.45)] transition-all duration-300 ${
      active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
    }`}
  >
    <div className="flex items-center justify-between font-meta text-[0.68rem] tracking-[0.24em] text-[color:var(--accent-2)]">
      <span>{point.year}</span>
      <span>{Math.round(point.averageConfidence * 100)}% conf</span>
    </div>
    <p className="font-body text-[0.82rem] text-[color:var(--mid)]">
      {point.total} dossiers, {point.entities} referenced entities.
    </p>
  </div>
);

type ConfidenceMatrix = {
  years: number[];
  organisms: string[];
  values: number[][];
};

type ConfidenceHeatGridProps = {
  matrix: ConfidenceMatrix;
  activeYear: number | null;
  onYearChange: (year: number) => void;
};

const ConfidenceHeatGrid = ({ matrix, activeYear, onYearChange }: ConfidenceHeatGridProps) => {
  if (matrix.years.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.8)] p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-meta text-[0.74rem] tracking-[0.22em] text-[color:var(--accent-1)]">Confidence Heat Grid</p>
          <h3 className="text-2xl text-[color:var(--white)]">Signal confidence by organism</h3>
        </div>
        <div className="font-meta text-[0.7rem] tracking-[0.22em] text-[color:var(--mid)]">
          Hover nodes for mission imagery
        </div>
      </header>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] table-fixed border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="w-32 text-left font-meta text-[0.68rem] tracking-[0.22em] text-[color:var(--passive)]">Organism</th>
              {matrix.years.map((year) => (
                <th key={year} className="text-center font-meta text-[0.68rem] tracking-[0.22em] text-[color:var(--passive)]">
                  <button
                    type="button"
                    className={`panel-hover rounded-full border px-3 py-1 transition ${
                      activeYear === year
                        ? 'border-[rgba(0,179,255,0.45)] bg-[rgba(12,22,30,0.9)] text-[color:var(--accent-2)]'
                        : 'border-transparent bg-[rgba(12,18,24,0.6)] text-[color:var(--mid)] hover:border-[rgba(0,179,255,0.25)] hover:text-[color:var(--white)]'
                    }`}
                    onClick={() => onYearChange(year)}
                  >
                    {year}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.organisms.map((organism, rowIndex) => (
              <tr key={organism}>
                <th className="text-left font-body text-[0.82rem] text-[color:var(--mid)]">{organism}</th>
                {matrix.values[rowIndex]?.map((value, columnIndex) => (
                  <td key={`${organism}-${matrix.years[columnIndex]}`}>
                    <div
                      className={`group relative flex h-14 items-center justify-center rounded-lg border border-[rgba(26,31,36,0.45)] bg-[rgba(12,18,24,0.65)] transition ${
                        activeYear === matrix.years[columnIndex]
                          ? 'ring-1 ring-[rgba(0,179,255,0.45)] ring-offset-2 ring-offset-[rgba(8,12,16,0.85)]'
                          : ''
                      }`}
                    >
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full font-meta text-[0.7rem] tracking-[0.2em]"
                        style={{
                          background:
                            value > 0
                              ? `linear-gradient(135deg, rgba(0,179,255,${value}), rgba(85,230,165,${Math.min(1, value + 0.2)}))`
                              : 'rgba(32,42,50,0.6)',
                          color: value > 0.4 ? '#04131c' : 'var(--white)'
                        }}
                      >
                        {Math.round(value * 100)}
                      </span>
                      <HeatTooltip
                        organism={organism}
                        year={matrix.years[columnIndex]}
                        value={value}
                        active={activeYear === matrix.years[columnIndex]}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type HeatTooltipProps = {
  organism: string;
  year: number;
  value: number;
  active: boolean;
};

const HeatTooltip = ({ organism, year, value, active }: HeatTooltipProps) => (
  <div
    className={`pointer-events-none absolute -top-32 flex w-48 flex-col gap-2 rounded-xl border border-[rgba(26,31,36,0.55)] bg-[rgba(8,12,16,0.94)] p-4 text-left transition-all duration-300 ${
      active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`}
  >
    <div className="flex items-center justify-between font-meta text-[0.68rem] tracking-[0.22em] text-[color:var(--accent-1)]">
      <span>{organism}</span>
      <span>{year}</span>
    </div>
    <p className="font-body text-[0.8rem] text-[color:var(--mid)]">Signal confidence {Math.round(value * 100)}%. Hover reveals decoded mission patch.</p>
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,179,255,0.15)] text-2xl">🛰️</span>
  </div>
);

type HabitableMapVisualizerProps = {
  records: PaperRecord[];
  activeYear: number | null;
};

const HabitableMapVisualizer = ({ records, activeYear }: HabitableMapVisualizerProps) => {
  if (records.length === 0) {
    return null;
  }

  const nodes = buildHabitableNodes(records, activeYear);

  return (
    <div className="rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.82)] p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-meta text-[0.74rem] tracking-[0.22em] text-[color:var(--accent-2)]">Habitable Map Visualizer</p>
          <h3 className="text-2xl text-[color:var(--white)]">Organism-platform lattice</h3>
        </div>
        <span className="font-meta text-[0.7rem] tracking-[0.22em] text-[color:var(--mid)]">Interconnected organisms · platforms · years</span>
      </header>
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(8,12,16,0.75)] p-6">
        <svg viewBox="0 0 640 320" className="h-72 w-full">
          <defs>
            <linearGradient id="node-gradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,179,255,0.9)" />
              <stop offset="100%" stopColor="rgba(85,230,165,0.9)" />
            </linearGradient>
          </defs>
          {nodes.links.map((link) => (
            <line
              key={`${link.source}-${link.target}`}
              x1={link.x1}
              y1={link.y1}
              x2={link.x2}
              y2={link.y2}
              stroke="rgba(0,179,255,0.35)"
              strokeWidth={1.2}
              strokeDasharray="4 6"
            />
          ))}
          {nodes.nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
              <circle
                r={node.r}
                fill={node.kind === 'organism' ? 'url(#node-gradient)' : 'rgba(0,179,255,0.15)'}
                stroke={node.kind === 'year' ? 'rgba(0,179,255,0.4)' : 'rgba(85,230,165,0.45)'}
                strokeWidth={node.kind === 'year' ? 2 : 1.4}
                className={node.highlight ? 'uplink-active' : ''}
              />
              <text
                textAnchor="middle"
                fill="var(--white)"
                fontSize={node.kind === 'platform' ? 11 : 13}
                fontFamily="var(--font-meta)"
                letterSpacing="0.08em"
                dy={4}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

type AnalystSummaryProps = {
  summaries: {
    id: string;
    title: string;
    summary: string;
    confidence: number;
    platform: string;
    organism: string;
    year: number;
  }[];
};

const AnalystSummary = ({ summaries }: AnalystSummaryProps) => (
  <div className="flex h-full flex-col gap-6">
    <div className="rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.82)] p-6">
      <p className="font-meta text-[0.74rem] tracking-[0.22em] text-[color:var(--accent-2)]">Analyst Summary</p>
      <h3 className="mt-2 text-2xl text-[color:var(--white)]">LLM brief of prioritized dossiers</h3>
      <p className="mt-3 font-body text-[0.9rem] leading-relaxed text-[color:var(--mid)]">
        Automated syntheses adapt to the selected mission year. Hover for decoded patch icons and imagery overlays.
      </p>
    </div>
    <div className="grid flex-1 content-start gap-4">
      {summaries.map((item, index) => (
        <article
          key={item.id}
          className="group relative overflow-hidden rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(8,12,16,0.9)] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.4)] transition hover:shadow-[0_20px_60px_rgba(0,179,255,0.25)]"
        >
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundImage: 'linear-gradient(135deg, rgba(0,179,255,0.12), rgba(85,230,165,0.1))' }} />
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center justify-between font-meta text-[0.72rem] tracking-[0.24em] text-[color:var(--accent-1)]">
              <span>Brief {index + 1}</span>
              <span>{item.year}</span>
            </div>
            <h4 className="text-xl text-[color:var(--white)]">{item.title}</h4>
            <p className="font-body text-[0.9rem] leading-relaxed text-[color:var(--mid)]">{item.summary}</p>
            <div className="flex items-center justify-between font-meta text-[0.7rem] tracking-[0.22em] text-[color:var(--passive)]">
              <span>{item.organism}</span>
              <span>{item.platform}</span>
              <span>{Math.round(item.confidence * 100)}% confidence</span>
            </div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,179,255,0.15)] p-3 text-3xl shadow-[0_0_24px_rgba(0,179,255,0.25)]">
              🪐
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
);

type TransmissionIntegrityMeterProps = {
  integrity: number;
  totalRecords: number;
  activeYear: number | null;
};

const TransmissionIntegrityMeter = ({ integrity, totalRecords, activeYear }: TransmissionIntegrityMeterProps) => {
  const normalized = Math.min(Math.max(integrity, 0), 1);
  const circumference = 2 * Math.PI * 56;
  const offset = circumference * (1 - normalized);

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-[rgba(26,31,36,0.55)] bg-[rgba(9,14,18,0.8)] p-6 text-center">
      <p className="font-meta text-[0.74rem] tracking-[0.22em] text-[color:var(--accent-2)]">Transmission Integrity</p>
      <div className="relative mt-4 h-40 w-40">
        <svg viewBox="0 0 140 140" className="h-full w-full">
          <circle cx="70" cy="70" r="56" stroke="rgba(32,42,50,0.65)" strokeWidth="8" fill="none" />
          <circle
            cx="70"
            cy="70"
            r="56"
            stroke="url(#integrityGradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
          <defs>
            <linearGradient id="integrityGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,179,255,0.9)" />
              <stop offset="100%" stopColor="rgba(85,230,165,0.9)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl text-[color:var(--white)]">{Math.round(normalized * 100)}%</span>
          <span className="font-meta text-[0.7rem] tracking-[0.24em] text-[color:var(--mid)]">Archive fidelity</span>
        </div>
      </div>
      <p className="mt-4 max-w-xs font-body text-[0.88rem] text-[color:var(--mid)]">
        {totalRecords > 0
          ? `${resultsText(totalRecords)} ready for reconstruction. ${activeYear ? `Focus year: ${activeYear}.` : ''}`
          : 'Awaiting uplink to hydrate archive cache.'}
      </p>
    </div>
  );
};

type SignalUplinkIndicatorProps = {
  active: boolean;
  restored: boolean;
  hasError: boolean;
};

const SignalUplinkIndicator = ({ active, restored, hasError }: SignalUplinkIndicatorProps) => (
  <div className="flex items-center justify-between rounded-xl border border-[rgba(26,31,36,0.55)] bg-[rgba(8,12,16,0.85)] px-4 py-3">
    <div className="flex items-center gap-3 font-meta text-[0.72rem] tracking-[0.24em] text-[color:var(--mid)]">
      <span
        className={`inline-flex h-3 w-3 rounded-full shadow-[0_0_16px_rgba(0,179,255,0.6)] ${
          active ? 'bg-[color:var(--accent-2)] animate-ping-slow' : 'bg-[rgba(90,110,120,0.75)]'
        }`}
      />
      {active
        ? 'Signal uplink engaged — fetching dossier data'
        : restored
          ? 'Connection restored — packets streaming'
          : 'Signal link stable — ready for analysis'}
    </div>
    <span className={`font-meta text-[0.7rem] tracking-[0.24em] ${hasError ? 'text-[color:var(--alert)]' : 'text-[color:var(--accent-1)]'}`}>
      {hasError ? 'Integrity degraded' : 'Telemetry nominal'}
    </span>
  </div>
);

type EmptyStateProps = {
  restoring: boolean;
};

const EmptyState = ({ restoring }: EmptyStateProps) => (
  <div className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[rgba(0,179,255,0.25)] bg-[rgba(9,12,15,0.7)] text-center">
    <div className="absolute inset-0 animate-[signalLost_3s_ease-in-out_infinite] bg-[radial-gradient(circle_at_center,_rgba(0,179,255,0.12),_transparent_65%)]" />
    <div className="relative flex flex-col items-center gap-3">
      <p className="font-meta text-[0.86rem] tracking-[0.24em] text-[color:var(--mid)]">Signal lost</p>
      <p className="max-w-md font-body text-[0.9rem] text-[color:var(--mid)]">
        No dossiers match the current filters. Re-route telemetry by adjusting organism, platform, or temporal sliders. Fallback cache will surface the last known packets automatically.
      </p>
      {restoring ? (
        <span className="font-meta text-[0.72rem] tracking-[0.24em] text-[color:var(--accent-1)]">Connection restored — streaming fresh packets…</span>
      ) : null}
    </div>
  </div>
);

const buildTimeline = (records: PaperRecord[]): TimelinePoint[] => {
  const grouped = records.reduce((acc, record) => {
    const bucket = acc.get(record.year) ?? { total: 0, entities: 0, confidence: 0, records: [] as PaperRecord[] };
    bucket.total += 1;
    bucket.entities += record.entities.length;
    bucket.confidence += record.confidence;
    bucket.records.push(record);
    acc.set(record.year, bucket);
    return acc;
  }, new Map<number, { total: number; entities: number; confidence: number; records: PaperRecord[] }>());

  return Array.from(grouped.entries())
    .map(([year, value]) => ({
      year,
      total: value.total,
      entities: value.entities,
      averageConfidence: value.total > 0 ? value.confidence / value.total : 0,
      records: value.records
    }))
    .sort((a, b) => b.year - a.year);
};

const buildConfidenceMatrix = (records: PaperRecord[]): ConfidenceMatrix => {
  if (records.length === 0) {
    return { years: [], organisms: [], values: [] };
  }

  const years = Array.from(new Set(records.map((item) => item.year))).sort((a, b) => b - a).slice(0, 6);
  const organisms = Array.from(new Set(records.map((item) => item.organism))).slice(0, 6);

  const values = organisms.map((organism) => {
    return years.map((year) => {
      const filtered = records.filter((record) => record.organism === organism && record.year === year);
      if (filtered.length === 0) return 0;
      const score = filtered.reduce((sum, item) => sum + item.confidence, 0) / filtered.length;
      return Math.min(1, score);
    });
  });

  return { years, organisms, values };
};

type HabitableNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  kind: 'organism' | 'platform' | 'year';
  highlight: boolean;
};

type HabitableLink = {
  source: string;
  target: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type HabitableGraph = {
  nodes: HabitableNode[];
  links: HabitableLink[];
};

const buildHabitableNodes = (records: PaperRecord[], activeYear: number | null): HabitableGraph => {
  const organisms = Array.from(new Set(records.map((item) => item.organism))).slice(0, 4);
  const platforms = Array.from(new Set(records.map((item) => item.platform))).slice(0, 4);
  const years = Array.from(new Set(records.map((item) => item.year))).sort((a, b) => a - b).slice(-4);

  const organismNodes = organisms.map((organism, index) => ({
    id: `org-${organism}`,
    label: organism,
    x: 120,
    y: 60 + index * 60,
    r: 26,
    kind: 'organism' as const,
    highlight: false
  }));

  const platformNodes = platforms.map((platform, index) => ({
    id: `plat-${platform}`,
    label: platform,
    x: 320,
    y: 60 + index * 60,
    r: 22,
    kind: 'platform' as const,
    highlight: false
  }));

  const yearNodes = years.map((year, index) => ({
    id: `year-${year}`,
    label: String(year),
    x: 520,
    y: 60 + index * 60,
    r: 20,
    kind: 'year' as const,
    highlight: activeYear === year
  }));

  const allNodes = [...organismNodes, ...platformNodes, ...yearNodes];
  const links: HabitableLink[] = [];

  records.forEach((record) => {
    const organismNode = allNodes.find((node) => node.id === `org-${record.organism}`);
    const platformNode = allNodes.find((node) => node.id === `plat-${record.platform}`);
    const yearNode = allNodes.find((node) => node.id === `year-${record.year}`);

    if (organismNode && platformNode) {
      links.push({
        source: organismNode.id,
        target: platformNode.id,
        x1: organismNode.x,
        y1: organismNode.y,
        x2: platformNode.x,
        y2: platformNode.y
      });
    }

    if (platformNode && yearNode) {
      links.push({
        source: platformNode.id,
        target: yearNode.id,
        x1: platformNode.x,
        y1: platformNode.y,
        x2: yearNode.x,
        y2: yearNode.y
      });
    }
  });

  return { nodes: allNodes, links };
};

const synthesiseSummary = (record: PaperRecord) => {
  const keywords = record.keywords.slice(0, 3).join(', ');
  const focus = record.entities.slice(0, 2).join(' & ') || 'mission biomarkers';
  return `LLM synthesis flags ${record.organism} studies on ${record.platform} (${record.year}). Key focus: ${focus}. Signal confidence ${Math.round(record.confidence * 100)}%. Keywords: ${keywords || 'classified'}.`;
};

const resultsText = (total: number) => `${total} dossier${total === 1 ? '' : 's'}`;

export default Home;
