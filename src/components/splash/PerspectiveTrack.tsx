import type { CSSProperties } from 'react';

export type TrackCard = {
  id: string;
  label: string;
  accent?: 'amber' | 'red' | 'cyan';
};

type Props = {
  cards: TrackCard[];
  activeIndex: number;
  reducedMotion?: boolean;
};

export default function PerspectiveTrack({ cards, activeIndex, reducedMotion = false }: Props) {
  return (
    <div className={`perspective-track${reducedMotion ? ' is-reduced' : ''}`}>
      <div className="track-header">
        <span className="track-eyebrow">SCAN QUEUE</span>
        <span className="track-caption">CHANNEL // OMEGA</span>
      </div>
      <div className="track-ruler" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, index) => (
          <span key={index} className="track-tick" />
        ))}
      </div>
      <div className="track-cards">
        {cards.map((card, index) => {
          const offset = index - activeIndex;
          return (
            <div
              key={card.id}
              className={`track-card${index === activeIndex ? ' is-active' : ''}`}
              data-accent={card.accent ?? 'cyan'}
              style={{
                '--card-offset': offset,
                '--card-index': index,
                '--card-depth': index * 1.25 + 1,
              } as CSSProperties}
              aria-hidden={index !== activeIndex}
            >
              <div className="track-card-surface">
                <span className="track-card-id">SEQ // {String(index + 1).padStart(2, '0')}</span>
                <span className="track-card-label">{card.label}</span>
              </div>
              {index === activeIndex ? (
                <div className="track-card-caption" role="status" aria-live="polite">
                  ACTIVE // ROUTING AUTH PAYLOAD
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
