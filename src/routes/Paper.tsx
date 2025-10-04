import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BranchMap from '../components/BranchMap';
import Panel from '../components/Panel';
import TrendMini from '../components/TrendMini';
import { getPaperFromCache, upsertPaperDetail } from '../lib/db';
import type { PaperDetail } from '../lib/types';

const fetchPaper = async (id: string): Promise<PaperDetail> => {
  const cached = await getPaperFromCache(id);
  if (cached && cached.sections && cached.links) {
    return cached as PaperDetail;
  }
  const response = await fetch(`/data/papers/${id}.json`);
  if (!response.ok) throw new Error('Failed to fetch dossier');
  const data = (await response.json()) as PaperDetail;
  await upsertPaperDetail(data);
  return data;
};

const Paper = () => {
  const params = useParams();
  const id = params.id as string;
  const [activeSection, setActiveSection] = useState<'abstract' | 'methods' | 'results' | 'conclusion'>('abstract');

  const query = useQuery({
    queryKey: ['paper', id],
    queryFn: () => fetchPaper(id),
    enabled: Boolean(id)
  });

  if (query.isLoading) {
    return <div className="text-sm text-slate-400">Synchronizing dossier…</div>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="border border-accent-red/40 rounded-lg p-6 bg-black/60 text-accent-red text-sm">
        Dossier retrieval failed. <Link className="underline" to="/">Return to archive</Link>
      </div>
    );
  }

  const { title, sections, authors, year, organism, platform, keywords, links } = query.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div className="border border-white/10 rounded-xl p-6 bg-black/50 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
            <span>Dossier</span>
            <span className="text-accent-cyan">{id}</span>
          </div>
          <h1 className="text-2xl text-accent-cyan leading-snug">{title}</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{authors.join(', ')}</p>
        </div>

        <BranchMap title={title} activeSection={activeSection} onSectionChange={(key) => setActiveSection(key)} />

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Abstract" active={activeSection === 'abstract'}>
            {sections.abstract}
          </Panel>
          <Panel title="Methods" active={activeSection === 'methods'}>
            {sections.methods}
          </Panel>
          <Panel title="Results" active={activeSection === 'results'}>
            {sections.results}
          </Panel>
          <Panel title="Conclusion" active={activeSection === 'conclusion'}>
            {sections.conclusion}
          </Panel>
        </div>

        <Panel title="AI Summary (placeholder)" active>
          Synthetic analyst summary channel pending activation. Placeholder text demonstrating panel chrome and typographic
          hierarchy for future LLM integration.
        </Panel>
      </div>

      <aside className="space-y-6">
        <div className="border border-white/10 rounded-xl p-6 bg-black/50 backdrop-blur-sm">
          <header className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400 mb-3">Meta</header>
          <dl className="space-y-2 text-sm">
            <MetaRow label="Year" value={year.toString()} />
            <MetaRow label="Organism" value={organism} />
            <MetaRow label="Platform" value={platform} />
          </dl>
          <div className="mt-4 text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">Keywords</div>
          <div className="flex flex-wrap gap-2 mt-2 text-[0.55rem] uppercase tracking-[0.2em] text-slate-300">
            {keywords.map((keyword) => (
              <span key={keyword} className="px-2 py-1 border border-accent-cyan/40 rounded-full bg-accent-cyan/10">
                {keyword}
              </span>
            ))}
          </div>
          <div className="mt-4 text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">External Links</div>
          <ul className="mt-2 space-y-2 text-xs">
            {links.taskbook ? (
              <li>
                <a className="text-accent-amber hover:text-white" href={links.taskbook} target="_blank" rel="noreferrer">
                  Taskbook dossier
                </a>
              </li>
            ) : null}
            {links.osdr ? (
              <li>
                <a className="text-accent-amber hover:text-white" href={links.osdr} target="_blank" rel="noreferrer">
                  OSDR record
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        <TrendMini />
      </aside>
    </div>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-white/10 pb-2 last:border-none last:pb-0">
    <span className="text-slate-500 uppercase tracking-[0.3em] text-[0.6rem]">{label}</span>
    <span className="text-slate-200 text-xs">{value}</span>
  </div>
);

export default Paper;
