import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BranchMap, { BranchKey } from '../components/BranchMap';
import Panel from '../components/Panel';
import TrendMini from '../components/TrendMini';
import HudBadge from '../components/HudBadge';
import { getPaperFromCache, upsertPaperDetail } from '../lib/db';
import type { PaperDetail } from '../lib/types';
import { withBase } from '../lib/paths';

const fetchPaper = async (id: string): Promise<PaperDetail> => {
  const cached = await getPaperFromCache(id);
  if (cached && cached.sections && cached.links) {
    return cached as PaperDetail;
  }
  const response = await fetch(withBase(`data/papers/${id}.json`));
  if (!response.ok) throw new Error('Failed to fetch dossier');
  const data = (await response.json()) as PaperDetail;
  await upsertPaperDetail(data);
  return data;
};

const Paper = () => {
  const params = useParams();
  const id = params.id as string;
  const [activeSection, setActiveSection] = useState<BranchKey>('abstract');

  const query = useQuery({
    queryKey: ['paper', id],
    queryFn: () => fetchPaper(id),
    enabled: Boolean(id)
  });

  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '') as BranchKey;
      if (hash === 'abstract' || hash === 'methods' || hash === 'results' || hash === 'conclusion') {
        setActiveSection(hash);
      }
    }
  }, []);

  if (query.isLoading) {
    return <div className="text-sm text-dim">Synchronizing dossier…</div>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-[22px] border border-red/40 bg-black/60 p-6 text-red text-sm">
        Dossier retrieval failed. <Link className="underline" to="/">Return to archive</Link>
      </div>
    );
  }

  const { title, sections, authors, year, organism, platform, keywords, links, access, citations_by_year, confidence, entities } = query.data;

  const handleCopyLink = (section: BranchKey) => {
    const url = `${window.location.origin}/paper/${id}#${section}`;
    navigator.clipboard.writeText(url).catch(() => undefined);
  };

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-[28px] border border-white/12 bg-panel/80 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">Dossier {id}</p>
            <h1 className="text-3xl font-semibold uppercase tracking-[0.24em] text-white">{title}</h1>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-mid">{authors.join(', ')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <HudBadge label="Confidence" tone="amber" value={<span>{Math.round(confidence * 100)}%</span>} />
            <HudBadge label="Keywords" tone="cyan" value={<span>{keywords.length}</span>} />
            <HudBadge label="Entities" tone="cyan" value={<span>{entities.length}</span>} />
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <BranchMap title={title} activeSection={activeSection} onSectionChange={(key) => setActiveSection(key)} />

          <div className="grid gap-4 md:grid-cols-2">
            <Panel
              id="abstract"
              title="Abstract"
              sublabel="Module Alpha"
              active={activeSection === 'abstract'}
              actions={
                <button type="button" onClick={() => handleCopyLink('abstract')} className="text-dim hover:text-white/80">
                  Copy link
                </button>
              }
              variant="dossier"
            >
              {sections.abstract}
            </Panel>
            <Panel
              id="methods"
              title="Methods"
              sublabel="Module Beta"
              active={activeSection === 'methods'}
              actions={
                <button type="button" onClick={() => handleCopyLink('methods')} className="text-dim hover:text-white/80">
                  Copy link
                </button>
              }
              variant="dossier"
            >
              {sections.methods}
            </Panel>
            <Panel
              id="results"
              title="Results"
              sublabel="Module Gamma"
              active={activeSection === 'results'}
              actions={
                <button type="button" onClick={() => handleCopyLink('results')} className="text-dim hover:text-white/80">
                  Copy link
                </button>
              }
              variant="dossier"
            >
              {sections.results}
            </Panel>
            <Panel
              id="conclusion"
              title="Conclusion"
              sublabel="Module Delta"
              active={activeSection === 'conclusion'}
              actions={
                <button type="button" onClick={() => handleCopyLink('conclusion')} className="text-dim hover:text-white/80">
                  Copy link
                </button>
              }
              variant="dossier"
            >
              {sections.conclusion}
            </Panel>
          </div>

          <Panel
            title="Analyst Summary"
            sublabel="AI Channel"
            actions={<span className="text-white/50">Uplink offline</span>}
          >
            Analyst uplink is offline. The briefing summary will appear here once the channel activates.
          </Panel>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[24px] border border-white/12 bg-panel/75 p-5 shadow-panel">
            <header className="mb-4 font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">Meta</header>
            <dl className="space-y-3 text-[0.82rem]">
              <MetaRow label="Year" value={year.toString()} />
              <MetaRow label="Organism" value={organism} />
              <MetaRow label="Platform" value={platform} />
            </dl>
            <div className="mt-4 space-y-2">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">Access Flags</p>
              <div className="flex flex-wrap gap-2">
                {access.map((flag) => (
                  <HudBadge key={flag} label={flag} tone="red" compact />
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.28em] text-mid"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">Entities</p>
              <ul className="grid gap-2 text-[0.62rem] font-mono uppercase tracking-[0.28em] text-mid">
                {entities.map((entity) => (
                  <li key={entity} className="rounded border border-white/10 bg-black/30 px-3 py-2">
                    {entity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 space-y-2">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">External Links</p>
              <ul className="space-y-2 text-[0.62rem] font-mono uppercase tracking-[0.28em] text-amber">
                {links.taskbook ? (
                  <li>
                    <a className="hover:text-white" href={links.taskbook} target="_blank" rel="noreferrer">
                      Taskbook dossier
                    </a>
                  </li>
                ) : null}
                {links.osdr ? (
                  <li>
                    <a className="hover:text-white" href={links.osdr} target="_blank" rel="noreferrer">
                      OSDR record
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <TrendMini data={citations_by_year} />
        </aside>
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-white/10 pb-2 last:border-none last:pb-0">
    <span className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">{label}</span>
    <span className="text-sm text-white">{value}</span>
  </div>
);

export default Paper;
