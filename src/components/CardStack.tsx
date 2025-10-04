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
        className="absolute inset-0 -z-[1] rounded-[26px] border border-[#123025]/50 bg-[#04100d]/70 backdrop-blur-sm transition-transform duration-500 group-hover:-translate-y-2"
        style={{ transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)` }}
      />
      <article
        className="relative overflow-hidden rounded-[26px] border border-[#123025]/70 bg-[#061a14]/80 p-6 shadow-[0_28px_60px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-3"
        style={{ transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)` }}
      >
        <header className="mb-4 space-y-3">
          <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.28em] text-[#6d8179]">
            <span>Dossier {index.toString().padStart(3, '0')}</span>
            <span className="font-mono text-[#6d8179]">ID // {item.id}</span>
          </div>
          <h2 className="text-lg font-semibold tracking-[0.06em] text-white/95 transition-colors group-hover:text-cyan">
            {item.title}
          </h2>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#6d8179]">
            {item.authors.join(', ')}
          </p>
        </header>

        <dl className="grid grid-cols-3 gap-2 text-[0.6rem] font-mono uppercase tracking-[0.2em] text-[#6d8179]">
          <div className="rounded-md border border-[#123025]/70 bg-[#03110d]/80 px-3 py-2">
            <dt className="text-[0.55rem] text-[#4f625b]">Year</dt>
            <dd className="text-white">{item.year}</dd>
          </div>
          <div className="rounded-md border border-[#123025]/70 bg-[#03110d]/80 px-3 py-2">
            <dt className="text-[0.55rem] text-[#4f625b]">Organism</dt>
            <dd className="text-white truncate" title={item.organism}>
              {item.organism}
            </dd>
          </div>
          <div className="rounded-md border border-[#123025]/70 bg-[#03110d]/80 px-3 py-2">
            <dt className="text-[0.55rem] text-[#4f625b]">Platform</dt>
            <dd className="text-white truncate" title={item.platform}>
              {item.platform}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.keywords.slice(0, 4).map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-[#123025] bg-[#03110d]/70 px-3 py-1 text-[0.55rem] font-mono uppercase tracking-[0.28em] text-[#6d8179] transition-colors group-hover:border-[#55ffb4]/60 group-hover:text-white"
            >
              {keyword}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Battery confidence={item.confidence} />
          <HudBadge label="Entities" tone="cyan" compact value={<span>{item.entities.length}</span>} />
        </div>
      </article>
      <div className="pointer-events-none absolute inset-0 -z-[2] translate-x-2 translate-y-2 rounded-[26px] border border-[#123025]/40 bg-[#03110d]/40 opacity-70" />
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
      <span className="text-[0.55rem] font-mono uppercase tracking-[0.28em] text-[#6d8179]">Confidence</span>
      <div className="flex items-center gap-1">
        <div className="flex gap-1 rounded-md border border-[#123025]/60 bg-[#03110d]/70 px-1 py-1">
          {Array.from({ length: segments }).map((_, index) => (
            <span
              key={index}
              className={`h-3 w-2 rounded-sm ${index < active ? 'bg-cyan shadow-[0_0_12px_rgba(85,255,180,0.35)]' : 'bg-white/10'}`}
            />
          ))}
        </div>
        <span className="font-mono text-[0.6rem] text-[#6d8179]">{Math.round(confidence * 100)}%</span>
      </div>
    </div>
  );
};

export default CardStack;
