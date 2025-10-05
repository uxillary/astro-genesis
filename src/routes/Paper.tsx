import { useEffect, useRef, useState, type RefObject } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BranchMap, { BranchKey } from '../components/BranchMap';
import Panel from '../components/Panel';
import TrendMini from '../components/TrendMini';
import PcbHeader from '@/components/fui/PcbHeader';
import HudBadge from '@/components/fui/HudBadge';
import ReticleOverlay from '@/components/fui/ReticleOverlay';
import CornerBracket from '@/components/fui/CornerBracket';
import VectorGlyph from '@/components/fui/VectorGlyph';
import { FuiBadge, FuiCallout, FuiConnectorLayer, FuiCorner, FuiDivider, useConnectorLayer } from '@/components/fui';
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

  const { paper } = query.data;

  const handleCopyLink = (section: BranchKey) => {
    const url = `${window.location.origin}/paper/${id}#${section}`;
    navigator.clipboard.writeText(url).catch(() => undefined);
  };

  return (
    <FuiConnectorLayer>
      <PaperLayout
        dossierId={id}
        data={query.data}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onCopyLink={handleCopyLink}
      />
    </FuiConnectorLayer>
  );
};

type PaperLayoutProps = {
  dossierId: string;
  data: PaperQueryResult;
  activeSection: BranchKey;
  onSectionChange: (section: BranchKey) => void;
  onCopyLink: (section: BranchKey) => void;
};

const PaperLayout = ({ dossierId, data, activeSection, onSectionChange, onCopyLink }: PaperLayoutProps) => {
  const connector = useConnectorLayer();
  const abstractAnchorRef = useRef<HTMLDivElement>(null);
  const methodsAnchorRef = useRef<HTMLDivElement>(null);
  const resultsAnchorRef = useRef<HTMLDivElement>(null);
  const conclusionAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connector) return undefined;
    const anchors: Array<[string, RefObject<HTMLDivElement>]> = [
      ['panel-abstract', abstractAnchorRef],
      ['panel-methods', methodsAnchorRef],
      ['panel-results', resultsAnchorRef],
      ['panel-conclusion', conclusionAnchorRef],
    ];
    anchors.forEach(([id, ref]) => {
      if (ref.current) {
        connector.registerAnchor(id, ref.current);
      }
    });
    return () => {
      anchors.forEach(([id]) => connector.unregisterAnchor(id));
    };
  }, [connector]);

  const { paper } = data;
  const { title, sections, authors, year, organism, platform, keywords, links, access, citations_by_year, confidence, entities } = paper;

  return (
    <div className="space-y-8 transmission-field">
      <header className="relative overflow-hidden rounded-[8px] border border-[#d6e3e0]/16 bg-[rgba(12,18,24,0.86)] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.42)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,179,255,0.18),transparent_55%)] opacity-70 mix-blend-screen" aria-hidden="true" />
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-[rgba(85,230,165,0.8)]">Dossier {dossierId}</p>
            <h1 className="text-3xl font-semibold uppercase tracking-[0.22em] text-white">{title}</h1>
            <p className="font-mono text-[0.62rem] tracking-[0.12em] text-white/70">{authors.join(', ')}</p>
            {data.isFallback ? (
              <div className="signal-indicator mt-2 inline-flex items-center gap-3 rounded-full border border-amber/40 bg-[rgba(20,16,16,0.55)] px-4 py-2 text-xs font-mono uppercase tracking-[0.22em] text-amber/80">
                <span className="signal-indicator__dot" aria-hidden="true" />
                Signal lost — degraded transmission
              </div>
            ) : null}
          </div>
          <PcbHeader
            className="ml-auto"
            density={0.5}
            traces={[
              { from: 'p-confidence:right', to: 'p-keywords:left', accent: 'amber', style: 'solid' },
              { from: 'p-keywords:right', to: 'p-entities:left', accent: 'cyan', style: 'dotted', signal: true },
              { from: 'p-entities:bottom', exit: 'bottom', accent: 'red', style: 'solid' },
            ]}
          >
            <HudBadge id="p-confidence" tone="amber" label="Confidence" value={<span>{Math.round(confidence * 100)}%</span>} />
            <HudBadge id="p-keywords" tone="cyan" label="Keywords" value={<span>{keywords.length}</span>} />
            <HudBadge id="p-entities" tone="cyan" label="Entities" value={<span>{entities.length}</span>} />
          </PcbHeader>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <CornerBracket radius={10} size={24} offset={12} color="cyan" glow>
            <div className="relative flex flex-col gap-4">
              <HudDivider label="BRANCH MAP" accent="cyan" variant="pill" lanePadding={16} elevate />
              <div className="relative">
                <ReticleOverlay
                  mode="fine"
                  animated={false}
                  padding={18}
                  color="cyan"
                  showCompass
                  className="pointer-events-none absolute inset-0"
                />
                <BranchMap title={title} activeSection={activeSection} onSectionChange={(key) => setActiveSection(key)} />
              </div>
            </div>
          </CornerBracket>

          <div className="flex flex-wrap items-center gap-3 text-white/80">
            <FuiBadge id="b-abs" label="Abstract" tone="cyan" size="sm" anchors={['bottom']} />
            <FuiBadge id="b-met" label="Methods" tone="cyan" size="sm" anchors={['bottom']} />
            <FuiBadge id="b-res" label="Results" tone="cyan" size="sm" anchors={['bottom']} />
            <FuiBadge id="b-con" label="Conclusion" tone="cyan" size="sm" anchors={['bottom']} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div id="panel-abstract" ref={abstractAnchorRef}>
              <Panel
                id="abstract"
                title="Abstract"
                sublabel="Module Alpha"
                active={activeSection === 'abstract'}
                actions={
                  <button type="button" onClick={() => onCopyLink('abstract')} className="text-dim hover:text-[#d6e3e0]">
                    Copy link
                  </button>
                }
                variant="dossier"
              >
                {sections.abstract}
              </Panel>
            </div>
            <div id="panel-methods" ref={methodsAnchorRef}>
              <Panel
                id="methods"
                title="Methods"
                sublabel="Module Beta"
                active={activeSection === 'methods'}
                actions={
                  <button type="button" onClick={() => onCopyLink('methods')} className="text-dim hover:text-[#d6e3e0]">
                    Copy link
                  </button>
                }
                variant="dossier"
              >
                <div className="relative">
                  <VectorGlyph
                    id="diag-lines"
                    caption="VEC 223"
                    size={64}
                    color="cyan"
                    className="absolute -right-2 -top-2 hidden md:flex"
                  />
                  <div className="relative z-10">{sections.methods}</div>
                </div>
              </Panel>
            </div>
            <div id="panel-results" ref={resultsAnchorRef}>
              <Panel
                id="results"
                title="Results"
                sublabel="Module Gamma"
                active={activeSection === 'results'}
                actions={
                  <button type="button" onClick={() => onCopyLink('results')} className="text-dim hover:text-[#d6e3e0]">
                    Copy link
                  </button>
                }
                variant="dossier"
              >
                {sections.results}
              </Panel>
            </div>
            <div id="panel-conclusion" ref={conclusionAnchorRef}>
              <Panel
                id="conclusion"
                title="Conclusion"
                sublabel="Module Delta"
                active={activeSection === 'conclusion'}
                actions={
                  <button type="button" onClick={() => onCopyLink('conclusion')} className="text-dim hover:text-[#d6e3e0]">
                    Copy link
                  </button>
                }
                variant="dossier"
              >
                {sections.conclusion}
              </Panel>
            </div>
          </div>

          <FuiCallout from="b-abs" to="panel-abstract" variant="dotted" tone="cyan" />
          <FuiCallout from="b-met" to="panel-methods" variant="dotted" tone="cyan" />
          <FuiCallout from="b-res" to="panel-results" variant="dotted" tone="cyan" />
          <FuiCallout from="b-con" to="panel-conclusion" variant="dotted" tone="cyan" />

          <Panel title="Analyst Summary" sublabel="AI Channel" actions={<span className="text-[#5f6c75]">Uplink offline</span>}>
            LLM summary feed is offline. This panel will populate once the analyst channel is connected.
          </Panel>
        </div>

        <aside className="dossier-aside space-y-6">
          <div className="dossier-meta">
            <header className="meta-heading">Meta</header>
            <dl className="meta-grid">
              <MetaRow label="Year" value={year.toString()} />
              <MetaRow label="Organism" value={organism} />
              <MetaRow label="Platform" value={platform} />
            </dl>
            <div className="meta-section">
              <p className="meta-label">Access Flags</p>
              <div className="meta-tags">
                {access.map((flag) => (
                  <HudBadge
                    key={flag}
                    label={flag}
                    tone="red"
                    compact
                    className="!border-[rgba(255,86,86,0.6)] !text-[rgba(255,142,142,0.92)]"
                    tooltip={`Classification flag: ${flag}`}
                  />
                ))}
              </div>
            </div>
            <div className="meta-section">
              <p className="meta-label">Keywords</p>
              <div className="meta-tags">
                {keywords.map((keyword) => (
                  <span key={keyword} className="meta-tag" title={`Related topic: ${keyword}`}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="meta-section">
              <p className="meta-label">Entities</p>
              <ul className="meta-entities">
                {entities.map((entity) => (
                  <li key={entity} title={`Referenced entity: ${entity}`}>
                    {entity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="meta-section">
              <p className="meta-label">External Links</p>
              <ul className="meta-links">
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

          <DossierGlyphs />
          <HudDivider label="TELEMETRY" align="end" accent="amber" variant="knockout" lanePadding={14} />
          <TrendMini data={citations_by_year} />
        </aside>
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="meta-row">
    <dt className="meta-row__label">{label}</dt>
    <dd className="meta-row__value">{value}</dd>
  </div>
);

export default Paper;
