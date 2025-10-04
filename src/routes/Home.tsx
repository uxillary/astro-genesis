import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { seedIndex, listPaperIndex } from '../lib/db';
import type { PaperIndex } from '../lib/types';
import Filters from '../components/Filters';
import SearchBox from '../components/SearchBox';
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
    const unique = <T,>(items: T[]) => Array.from(new Set(items)).filter(Boolean) as T[];
    return {
      organisms: unique(records.map((item) => item.organism)).map((value) => ({ label: value, value })),
      platforms: unique(records.map((item) => item.platform)).map((value) => ({ label: value, value })),
      years: unique(records.map((item) => item.year))
        .sort((a, b) => b - a)
        .map((value) => ({ label: String(value), value }))
    };
  }, [papersQuery.data]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <h1 className="text-2xl sm:text-3xl uppercase tracking-[0.4em] text-accent-cyan/90">BioArchive Intelligence</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Browse NASA-style bioscience dossiers cached for offline operations. Search across mission logs and filter by
            organism, platform, and mission year.
          </p>
          <SearchBox onSearch={() => setResults(runSearch(query, filters))} />
          {indexQuery.isLoading ? <StatusBadge text="Synchronizing index" tone="cyan" /> : null}
          {indexQuery.isError ? <StatusBadge text="Index sync failed" tone="red" /> : null}
        </div>
        <div className="w-full lg:w-[320px] shrink-0">
          <Filters {...filterOptions} />
        </div>
      </section>

      <section className="border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm p-4">
        <header className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-slate-400 mb-4">
          <span>Results</span>
          <span className="text-accent-amber">{results.length.toString().padStart(2, '0')} dossiers</span>
        </header>
        <div className="grid gap-4">
          {results.map((paper) => (
            <Link
              key={paper.id}
              to={`/paper/${paper.id}`}
              className="group border border-white/10 rounded-lg px-4 py-3 bg-black/60 hover:border-accent-cyan/60 transition shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg text-accent-cyan group-hover:text-white transition">{paper.title}</h2>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{paper.authors.join(', ')}</p>
                </div>
                <div className="flex gap-3 text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">
                  <span>{paper.year}</span>
                  <span>{paper.organism}</span>
                  <span>{paper.platform}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 text-[0.55rem] uppercase tracking-[0.2em] text-slate-300">
                {paper.keywords.map((keyword) => (
                  <span key={keyword} className="px-2 py-1 border border-accent-cyan/40 rounded-full bg-accent-cyan/10">
                    {keyword}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {results.length === 0 ? (
            <div className="text-sm text-slate-400 border border-dashed border-white/10 rounded-lg p-6 text-center">
              No dossiers match the current filters.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

const StatusBadge = ({ text, tone }: { text: string; tone: 'cyan' | 'red' }) => (
  <div
    className={`inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.3em] px-3 py-2 border rounded-lg bg-black/60 ${
      tone === 'cyan' ? 'border-accent-cyan/60 text-accent-cyan' : 'border-accent-red/60 text-accent-red'
    }`}
  >
    <span className="inline-block h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: tone === 'cyan' ? '#55e6a5' : '#ff4d4f' }} />
    {text}
  </div>
);

export default Home;
