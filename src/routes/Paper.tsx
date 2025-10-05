import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BranchMap, { BranchKey } from '../components/BranchMap';
import Panel from '../components/Panel';
import TrendMini from '../components/TrendMini';
import PcbHeader from '@/components/fui/PcbHeader';
import HudBadge from '@/components/fui/HudBadge';
import DossierGlyphs from '../components/DossierGlyphs';
import { getPaperFromCache, upsertPaperDetail } from '../lib/db';
import type { PaperDetail } from '../lib/types';
import { createFallbackPaper } from '../lib/fallback';
import { withBase } from '../lib/paths';

type PaperQueryResult = {
  paper: PaperDetail;
  isFallback: boolean;
};

const fetchPaper = async (id: string): Promise<PaperQueryResult> => {
  const cached = await getPaperFromCache(id);
  if (cached && cached.sections && cached.links) {
    return { paper: cached as PaperDetail, isFallback: false };
  }

  try {
    const response = await fetch(withBase(`data/papers/${id}.json`));
    if (!response.ok) {
      throw new Error(`Failed to fetch dossier: ${response.status}`);
    }
    const data = (await response.json()) as PaperDetail;
    await upsertPaperDetail(data);
    return { paper: data, isFallback: false };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Archive] dossier retrieval failed, supplying fallback stub.', error);
    return { paper: createFallbackPaper(id), isFallback: true };
  }
};

const Paper = () => {
  const params = useParams();
  const id = params.id as string;
  const [activeSection, setActiveSection] = useState<BranchKey>('abstract');

  const query = useQuery<PaperQueryResult>({
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
      <div className="rounded-[3px] border border-red/40 bg-[#0b0d0f]/70 p-6 text-red text-sm">
        Dossier retrieval failed. <Link className="underline" to="/">Return to archive</Link>
      </div>
    );
  }

  const { paper, isFallback } = query.data;
  const { title, sections, authors, year, organism, platform, keywords, links, access, citations_by_year, confidence, entities } = paper;

  const handleCopyLink = (section: BranchKey) => {
    const url = `${window.location.origin}/paper/${id}#${section}`;
    navigator.clipboard.writeText(url).catch(() => undefined);
  };

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-[3px] border border-[#d6e3e0]/12 bg-panel/95 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-[#55e6a5]">Dossier {id}</p>
            <h1 className="text-3xl font-semibold uppercase tracking-[0.22em] text-[#f3f8f6]">{title}</h1>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#9fb4bc]">{authors.join(', ')}</p>
          </div>
          <PcbHeader
            className="ml-auto"
            density={0.5}
            traces={[
              { from: 'p-confidence:right', to: 'p-keywords:left', accent: 'amber', style: 'solid' },
              { from: 'p-keywords:right', to: 'p-entities:left', accent: 'cyan', style: 'dotted', signal: true },
              { from: 'p-entities:bottom', exit: 'bottom', accent: 'red', style: 'solid' }
            ]}
          >
            <HudBadge id="p-confidence" tone="amber" label="Confidence" value={<span>{Math.round(confidence * 100)}%</span>} />
            <HudBadge id="p-keywords" tone="cyan" label="Keywords" value={<span>{keywords.length}</span>} />
            <HudBadge id="p-entities" tone="cyan" label="Entities" value={<span>{entities.length}</span>} />
          </PcbHeader>
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
                <button type="button" onClick={() => handleCopyLink('abstract')} className="text-dim hover:text-[#d6e3e0]">
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
                <button type="button" onClick={() => handleCopyLink('methods')} className="text-dim hover:text-[#d6e3e0]">
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
                <button type="button" onClick={() => handleCopyLink('results')} className="text-dim hover:text-[#d6e3e0]">
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
                <button type="button" onClick={() => handleCopyLink('conclusion')} className="text-dim hover:text-[#d6e3e0]">
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
            actions={<span className="text-[#5f6c75]">Uplink offline</span>}
          >
            LLM summary feed is offline. This panel will populate once the analyst channel is connected.
          </Panel>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[3px] border border-[#d6e3e0]/14 bg-panel/95 p-5 shadow-panel">
            <header className="mb-4 font-mono text-[0.58rem] uppercase tracking-[0.28em] text-[#9fb4bc]">Meta</header>
            <dl className="space-y-3 text-[0.82rem]">
              <MetaRow label="Year" value={year.toString()} />
              <MetaRow label="Organism" value={organism} />
              <MetaRow label="Platform" value={platform} />
            </dl>
            <div className="mt-4 space-y-2">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-[#5f6c75]">Access Flags</p>
              <div className="flex flex-wrap gap-2">
                {access.map((flag) => (
                  <HudBadge key={flag} label={flag} tone="red" compact />
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-[#5f6c75]">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-[#d6e3e0]/15 bg-[#0b0d0f]/40 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.28em] text-mid"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-[#5f6c75]">Entities</p>
              <ul className="grid gap-2 text-[0.62rem] font-mono uppercase tracking-[0.28em] text-mid">
                {entities.map((entity) => (
                  <li key={entity} className="rounded border border-[#d6e3e0]/10 bg-[#0b0d0f]/30 px-3 py-2">
                    {entity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 space-y-2">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-[#5f6c75]">External Links</p>
              <ul className="space-y-2 text-[0.62rem] font-mono uppercase tracking-[0.28em] text-amber">
                {links.taskbook ? (
                  <li>
                    <a className="hover:text-[#d6e3e0]" href={links.taskbook} target="_blank" rel="noreferrer">
                      Taskbook dossier
                    </a>
                  </li>
                ) : null}
                {links.osdr ? (
                  <li>
                    <a className="hover:text-[#d6e3e0]" href={links.osdr} target="_blank" rel="noreferrer">
                      OSDR record
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <DossierGlyphs />

          <TrendMini data={citations_by_year} />
        </aside>
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-[#d6e3e0]/10 pb-2 last:border-none last:pb-0">
    <span className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-[#5f6c75]">{label}</span>
    <span className="text-sm font-medium text-[#f3f8f6]">{value}</span>
  </div>
);

export default Paper;
