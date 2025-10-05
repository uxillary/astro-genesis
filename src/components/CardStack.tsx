import { memo, useEffect, useRef, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import type { PaperRecord } from '../lib/db';
import HudBadge from '@/components/fui/HudBadge';
import CornerBracket from '@/components/fui/CornerBracket';
import TargetBadge from '@/components/fui/TargetBadge';
import { FuiFrame } from '@/components/fui';

type CardStackProps = {
  items: PaperRecord[];
};

const CardStack = ({ items }: CardStackProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <StackCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
};

type StackCardProps = {
  item: PaperRecord;
  index: number;
};

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
};

const formatAuthors = (authors: string[]) => {
  if (authors.length === 0) return 'Classified authorship';
  if (authors.length === 1) return truncate(authors[0], 72);
  if (authors.length === 2) return truncate(`${authors[0]}, ${authors[1]}`, 72);
  const remaining = authors.length - 2;
  return truncate(`${authors[0]}, ${authors[1]} +${remaining} more`, 72);
};

const StackCard = memo(({ item, index }: StackCardProps) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const nextTiltRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef(false);

  const applyTilt = (x: number, y: number) => {
    const backdropOffset = hoveredRef.current ? -8 : 0;
    const articleOffset = hoveredRef.current ? -12 : 0;
    if (backdropRef.current) {
      backdropRef.current.style.transform = `translate3d(${x}px, ${y + backdropOffset}px, 0)`;
    }
    if (articleRef.current) {
      articleRef.current.style.transform = `translate3d(${x}px, ${y + articleOffset}px, 0)`;
    }
  };

  const scheduleTilt = (x: number, y: number) => {
    nextTiltRef.current = { x, y };
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const { x: nextX, y: nextY } = nextTiltRef.current;
      applyTilt(nextX, nextY);
    });
  };

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    hoveredRef.current = true;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -6;
    scheduleTilt(x, y);
  };

  const handleLeave = () => {
    hoveredRef.current = false;
    scheduleTilt(0, 0);
  };

  useEffect(() => {
    applyTilt(0, 0);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const lockLabel = `LOCK ${String(index + 1).padStart(2, '0')}`;

  return (
    <Link
      to={`/paper/${item.id}`}
      className="group relative block"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 -z-[1] rounded-2xl border border-[rgba(26,31,36,0.45)] bg-[rgba(12,18,24,0.72)] backdrop-blur-sm transition-transform duration-500 group-hover:-translate-y-2"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      />
      <article
        ref={articleRef}
        className="scanline-card relative overflow-hidden rounded-2xl border border-[rgba(26,31,36,0.65)] bg-[rgba(10,15,20,0.88)] p-7 shadow-[0_28px_70px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-3"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        <header className="mb-6">
          <CornerBracket
            radius={8}
            size={22}
            offset={10}
            stroke={0.9}
            color="cyan"
            className="stack-card-corner -m-4 rounded-lg p-4"
          >
            <FuiFrame grid="soft" tone="cyan" padding={14} className="relative z-[1] overflow-hidden rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-meta text-[0.72rem] tracking-[0.24em] text-[color:var(--passive)] normal-case">
                  <span>Dossier {index.toString().padStart(3, '0')}</span>
                  <div className="flex items-center gap-3">
                    <TargetBadge label={lockLabel} variant="lock" tone="cyan" />
                    <span className="font-mono text-[color:var(--dim)]">ID // {item.id}</span>
                  </div>
                </div>
                <h2 className="text-2xl text-[color:var(--white)] transition-colors group-hover:text-[color:var(--accent-2)]">
                  {truncate(item.title, 96)}
                </h2>
                <p className="font-body text-[0.9rem] leading-relaxed text-[color:var(--mid)]">
                  {formatAuthors(item.authors)}
                </p>
              </div>
            </FuiFrame>
          </CornerBracket>
        </header>

        <dl className="grid grid-cols-3 gap-3 text-[0.88rem] font-body text-[color:var(--mid)]">
          <div className="rounded-xl border border-[rgba(26,31,36,0.55)] bg-[rgba(12,18,24,0.7)] px-4 py-3">
            <dt className="text-[0.75rem] font-meta normal-case tracking-[0.12em] text-[color:var(--passive)]">Year</dt>
            <dd className="text-[color:var(--white)]">{item.year}</dd>
          </div>
          <div className="rounded-xl border border-[rgba(26,31,36,0.55)] bg-[rgba(12,18,24,0.7)] px-4 py-3">
            <dt className="text-[0.75rem] font-meta normal-case tracking-[0.12em] text-[color:var(--passive)]">Organism</dt>
            <dd className="truncate text-[color:var(--white)]" title={item.organism}>
              {item.organism}
            </dd>
          </div>
          <div className="rounded-xl border border-[rgba(26,31,36,0.55)] bg-[rgba(12,18,24,0.7)] px-4 py-3">
            <dt className="text-[0.75rem] font-meta normal-case tracking-[0.12em] text-[color:var(--passive)]">Platform</dt>
            <dd className="truncate text-[color:var(--white)]" title={item.platform}>
              {item.platform}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          {item.keywords.slice(0, 3).map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-[rgba(32,42,50,0.65)] bg-[rgba(12,18,24,0.6)] px-3.5 py-1.5 font-body text-[0.78rem] text-[color:var(--mid)] transition-colors group-hover:border-[rgba(0,179,255,0.45)] group-hover:text-[color:var(--white)]"
            >
              {truncate(keyword, 26)}
            </span>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <Battery confidence={item.confidence} />
          <HudBadge label="Entities" tone="cyan" compact value={<span>{item.entities.length}</span>} />
        </div>
      </article>
      <div className="pointer-events-none absolute inset-0 -z-[2] translate-x-2 translate-y-2 rounded-2xl border border-[rgba(26,31,36,0.45)] bg-[rgba(9,13,17,0.55)] opacity-70" />
    </Link>
  );
}, (prev, next) => prev.item === next.item && prev.index === next.index);

StackCard.displayName = 'StackCard';

type BatteryProps = {
  confidence: number;
};

const Battery = ({ confidence }: BatteryProps) => {
  const segments = 5;
  const active = Math.round(confidence * segments);
  return (
    <div className="flex items-center gap-2">
      <span className="font-meta text-[0.72rem] tracking-[0.22em] text-[color:var(--passive)] normal-case">Confidence</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-[rgba(26,31,36,0.55)] bg-[rgba(12,18,24,0.6)] px-1.5 py-1.5">
          {Array.from({ length: segments }).map((_, index) => (
            <span
              key={index}
              className={`h-3.5 w-2.5 rounded-sm ${
                index < active
                  ? 'bg-[color:var(--accent-1)] shadow-[0_0_12px_rgba(85,230,165,0.35)]'
                  : 'bg-[rgba(214,227,224,0.12)]'
              }`}
            />
          ))}
        </div>
        <span className="font-meta text-[0.72rem] tracking-[0.2em] text-[color:var(--mid)] normal-case">{Math.round(confidence * 100)}%</span>
      </div>
    </div>
  );
};

export default CardStack;
