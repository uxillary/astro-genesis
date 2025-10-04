import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { seedIndex, listPaperIndex, isDexieAvailable } from '../lib/db';
import type { PaperIndex } from '../lib/types';
import Filters from '../components/Filters';
import SearchBox from '../components/SearchBox';
import CardStack from '../components/CardStack';
import HudBadge from '../components/HudBadge';
import { useSearchStore } from '../lib/state';
import { buildIndex, runSearch, getCachedRecords } from '../lib/search';

const fetchIndex = async (): Promise<PaperIndex[]> => {
  const response = await fetch('/data/index.json');
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

  return (
    <div className="relative z-10 space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <header className="space-y-4">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.42em] text-dim">BioArchive Intelligence</p>
            <h1 className="text-4xl font-semibold uppercase tracking-[0.3em] text-white">
              Classified Ops Console
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <HudBadge label="Dossiers" tone="amber" value={<span>{results.length.toString().padStart(2, '0')}</span>} />
              <HudBadge
                label="Cache"
                tone={dexieReady ? 'cyan' : 'red'}
                value={<span>{dexieReady ? 'Dexie cache' : 'Memory only'}</span>}
              />
              {indexQuery.isLoading ? <HudBadge label="Sync" tone="cyan" value={<span>Updating</span>} /> : null}
              {indexQuery.isError ? <HudBadge label="Sync" tone="red" value={<span>Failed</span>} /> : null}
            </div>
          </header>
          <p className="max-w-2xl font-mono text-[0.68rem] uppercase tracking-[0.32em] text-mid">
            Operate the offline-first NASA bioscience archive. Search across mission dossiers, filter by organism, platform, and year, and pivot into branch maps for rapid briefing delivery.
          </p>
          <SearchBox onSearch={() => setResults(runSearch(query, filters))} />
          <div className="flex items-center gap-3 text-[0.58rem] font-mono uppercase tracking-[0.32em] text-dim">
            <span>Need help?</span>
            <kbd className="rounded border border-white/20 px-2 py-1 text-white/80">?</kbd>
            <span>Open console reference</span>
          </div>
        </div>
        <Filters {...filterOptions} />
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">Results</p>
            <h2 className="text-xl font-semibold tracking-[0.22em] text-white">Stacked Dossiers</h2>
          </div>
          <Link
            to="/tactical"
            className="rounded-full border border-white/20 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-dim hover:text-white/90"
          >
            Tactical map
          </Link>
        </header>
        {results.length > 0 ? <CardStack items={results} /> : <EmptyState />}
      </section>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex h-60 flex-col items-center justify-center rounded-[26px] border border-dashed border-white/15 bg-black/50 text-center">
    <p className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-dim">No dossiers match the current filters.</p>
    <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.3em] text-mid">
      Adjust organism, platform, or mission year to widen the search.
    </p>
  </div>
);

export default Home;
