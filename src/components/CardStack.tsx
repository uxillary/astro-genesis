import { useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import type { PaperRecord } from '../lib/db';
import HudBadge from './HudBadge';

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

const StackCard = ({ item, index }: StackCardProps) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -6;
    setTilt({ x, y });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <Link
      ref={cardRef}
      to={`/paper/${item.id}`}
      className="group relative block"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        className="absolute inset-0 -z-[1] rounded-[4px] border border-[#1a1f24]/45 bg-[#10161d]/80 backdrop-blur-sm transition-transform duration-500 group-hover:-translate-y-2"
        style={{ transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)` }}
      />
      <article
        className="relative overflow-hidden rounded-[4px] border border-[#1a1f24]/65 bg-[#131d26]/90 p-7 shadow-[0_28px_60px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-3"
        style={{ transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)` }}
      >
        <header className="mb-6 space-y-4">
          <div className="flex items-center justify-between text-[0.78rem] uppercase tracking-[0.2em] text-[#8fa1ac]">
            <span>Dossier {index.toString().padStart(3, '0')}</span>
            <span className="font-mono text-[#7a8b94]">ID // {item.id}</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-[0.08em] text-[#f1f7f5] transition-colors group-hover:text-cyan">
            {item.title}
          </h2>
          <p className="font-mono text-[0.82rem] uppercase tracking-[0.2em] text-[#8fa1ac]">
            {item.authors.join(', ')}
          </p>
        </header>

        <dl className="grid grid-cols-3 gap-3 text-[0.82rem] font-mono uppercase tracking-[0.18em] text-[#8fa1ac]">
          <div className="rounded-[3px] border border-[#1a1f24]/60 bg-[#141c24]/85 px-4 py-3">
            <dt className="text-[0.72rem] text-[#6c7d87]">Year</dt>
            <dd className="text-[#f1f7f5]">{item.year}</dd>
          </div>
          <div className="rounded-[3px] border border-[#1a1f24]/60 bg-[#141c24]/85 px-4 py-3">
            <dt className="text-[0.72rem] text-[#6c7d87]">Organism</dt>
            <dd className="text-[#f1f7f5] truncate" title={item.organism}>
              {item.organism}
            </dd>
          </div>
          <div className="rounded-[3px] border border-[#1a1f24]/60 bg-[#141c24]/85 px-4 py-3">
            <dt className="text-[0.72rem] text-[#6c7d87]">Platform</dt>
            <dd className="text-[#f1f7f5] truncate" title={item.platform}>
              {item.platform}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          {item.keywords.slice(0, 4).map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-[#1a1f24] bg-[#141c24]/75 px-3.5 py-1.5 text-[0.78rem] font-mono uppercase tracking-[0.18em] text-[#8fa1ac] transition-colors group-hover:border-[#55e6a5]/60 group-hover:text-[#d6e3e0]"
            >
              {keyword}
            </span>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <Battery confidence={item.confidence} />
          <HudBadge label="Entities" tone="cyan" compact value={<span>{item.entities.length}</span>} />
        </div>
      </article>
      <div className="pointer-events-none absolute inset-0 -z-[2] translate-x-2 translate-y-2 rounded-[4px] border border-[#1a1f24]/40 bg-[#141c24]/45 opacity-70" />
    </Link>
  );
};

type BatteryProps = {
  confidence: number;
};

const Battery = ({ confidence }: BatteryProps) => {
  const segments = 5;
  const active = Math.round(confidence * segments);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.78rem] font-mono uppercase tracking-[0.2em] text-[#8fa1ac]">Confidence</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-[3px] border border-[#1a1f24]/60 bg-[#141c24]/70 px-1.5 py-1.5">
          {Array.from({ length: segments }).map((_, index) => (
            <span
              key={index}
              className={`h-3.5 w-2.5 rounded-sm ${index < active ? 'bg-cyan shadow-[0_0_12px_rgba(85,230,165,0.35)]' : 'bg-[#d6e3e0]/10'}`}
            />
          ))}
        </div>
        <span className="font-mono text-[0.82rem] text-[#8fa1ac]">{Math.round(confidence * 100)}%</span>
      </div>
    </div>
  );
};

export default CardStack;
