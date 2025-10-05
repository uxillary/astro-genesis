import clsx from 'clsx';
import { type CSSProperties } from 'react';
import '@/styles/hud-accents.css';

type GlyphId = 'diag-lines' | 'grid-dots' | 'box-diag' | 'ring';

type VectorGlyphProps = {
  id?: GlyphId;
  size?: number;
  caption?: string;
  color?: 'mono' | 'cyan';
  className?: string;
  style?: CSSProperties;
};

const VectorGlyph = ({
  id = 'diag-lines',
  size = 56,
  caption,
  color = 'mono',
  className,
  style
}: VectorGlyphProps) => {
  const renderGlyph = () => {
    switch (id) {
      case 'grid-dots': {
        const dots = [] as JSX.Element[];
        const step = size / 6;
        for (let x = step; x < size; x += step) {
          for (let y = step; y < size; y += step) {
            dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill="var(--hud-stroke)" opacity={0.45} />);
          }
        }
        return dots;
      }
      case 'box-diag':
        return (
          <>
            <rect x={6} y={6} width={size - 12} height={size - 12} fill="none" stroke="var(--hud-stroke)" opacity={0.55} />
            <line x1={6} y1={size - 6} x2={size - 6} y2={6} stroke="var(--hud-stroke)" strokeWidth={1.2} opacity={0.65} />
          </>
        );
      case 'ring':
        return (
          <>
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 6} fill="none" stroke="var(--hud-stroke)" strokeWidth={1.4} opacity={0.6} />
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 12} fill="none" stroke="var(--hud-stroke)" strokeWidth={1} opacity={0.4} />
            <line
              x1={size / 2}
              y1={6}
              x2={size / 2}
              y2={size - 6}
              stroke="var(--hud-stroke)"
              strokeWidth={1}
              strokeDasharray="6 6"
              opacity={0.45}
            />
          </>
        );
      default: {
        const lines = [] as JSX.Element[];
        const step = size / 5;
        for (let offset = -size; offset < size * 2; offset += step) {
          lines.push(
            <line
              key={offset}
              x1={offset}
              y1={size}
              x2={offset + size}
              y2={0}
              stroke="var(--hud-stroke)"
              strokeWidth={1.1}
              opacity={0.48}
            />
          );
        }
        return lines;
      }
    }
  };

  return (
    <div className={clsx('vector-glyph', `hud-accent-color-${color}`, className)} style={style}>
      <svg
        className="vector-glyph__canvas"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="presentation"
        aria-hidden="true"
      >
        {renderGlyph()}
      </svg>
      {caption ? <span>{caption}</span> : null}
    </div>
  );
};

export default VectorGlyph;
