import type { CSSProperties, ReactNode } from 'react';

export type StackLayer = {
  label: string;
  icon?: ReactNode;
};

type Props = {
  layers: StackLayer[];
  reducedMotion?: boolean;
};

const arrowLabels = ['INDEX', 'CACHE', 'SEARCH', 'BRANCH MAP', 'PANELS'];

export default function DeconstructedStack({ layers, reducedMotion = false }: Props) {
  return (
    <div className={`deconstructed-stack${reducedMotion ? ' is-reduced' : ''}`} aria-hidden="false">
      <div className="stack-heading">
        <span className="stack-eyebrow">SYSTEM LAYER TRACE</span>
        <span className="stack-caption">INTEGRITY // NOMINAL</span>
      </div>
      <div className="stack-body">
        {layers.map((layer, index) => {
          const depth = layers.length - index;
          return (
            <div className="stack-row" key={layer.label}>
              <div
                className="stack-layer"
                style={{
                  '--layer-depth': depth,
                  '--layer-index': index,
                  '--layer-total': layers.length,
                } as CSSProperties}
              >
                <svg className="stack-plate" viewBox="0 0 180 120" role="presentation" aria-hidden="true">
                  <defs>
                    <linearGradient id={`plateGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(66, 91, 102, 0.35)" />
                      <stop offset="100%" stopColor="rgba(12, 20, 26, 0.85)" />
                    </linearGradient>
                    <linearGradient id={`plateStroke-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(0, 179, 255, 0.35)" />
                      <stop offset="100%" stopColor="rgba(255, 176, 32, 0.5)" />
                    </linearGradient>
                  </defs>
                  <polygon
                    className="stack-plate-face"
                    points="90,4 176,60 90,116 4,60"
                    fill={`url(#plateGradient-${index})`}
                    stroke={`url(#plateStroke-${index})`}
                    strokeWidth="2"
                  />
                  <polygon
                    className="stack-plate-glow"
                    points="90,16 160,60 90,104 20,60"
                    fill="rgba(255,255,255,0.04)"
                  />
                </svg>
                <div className="stack-label" aria-hidden="true">
                  {layer.icon ? <span className="stack-icon">{layer.icon}</span> : null}
                  <span>{layer.label}</span>
                </div>
                <div className="stack-corner stack-corner-tl" aria-hidden="true" />
                <div className="stack-corner stack-corner-tr" aria-hidden="true" />
                <div className="stack-corner stack-corner-bl" aria-hidden="true" />
                <div className="stack-corner stack-corner-br" aria-hidden="true" />
              </div>
              {index < layers.length - 1 && (
                <div className="stack-connector" aria-hidden="true">
                  <div className="stack-arrow">
                    <span className="stack-arrow-body" />
                    <span className="stack-arrow-head" />
                    {!reducedMotion && <span className="stack-signal" />}
                  </div>
                  <span className="stack-arrow-label">{arrowLabels[index] ?? 'ROUTE'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
