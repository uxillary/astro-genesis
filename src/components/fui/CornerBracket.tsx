import clsx from 'clsx';
import { type CSSProperties, type ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import '@/styles/hud-accents.css';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

type CornerBracketProps = {
  radius?: number;
  size?: number;
  stroke?: number;
  corners?: Corner[];
  offset?: number;
  glow?: boolean;
  color?: 'mono' | 'cyan' | 'amber' | 'red';
  dashed?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

type Dimensions = { width: number; height: number };

const glowColor: Record<'mono' | 'cyan' | 'amber' | 'red', string> = {
  mono: 'rgba(217,226,223,0.32)',
  cyan: 'rgba(85,230,165,0.32)',
  amber: 'rgba(255,176,32,0.26)',
  red: 'rgba(255,77,79,0.26)'
};

const CornerBracket = ({
  radius = 6,
  size = 20,
  stroke = 1,
  corners = ['tl', 'tr', 'bl', 'br'],
  offset = 4,
  glow = false,
  color = 'mono',
  dashed = false,
  children,
  className,
  style
}: CornerBracketProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = wrapperRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const paths = useMemo(() => {
    const w = dimensions.width;
    const h = dimensions.height;
    const adjustedRadius = Math.max(Math.min(radius, size), 0);
    const xMin = offset;
    const yMin = offset;
    const xMax = offset + w;
    const yMax = offset + h;

    const arcStart = (value: number) => value + adjustedRadius;

    const createTopLeft = () => {
      const commands = [`M ${xMin} ${yMin + size}`, `L ${xMin} ${arcStart(yMin)}`];
      if (adjustedRadius > 0) {
        commands.push(`Q ${xMin} ${yMin} ${arcStart(xMin)} ${yMin}`);
      } else {
        commands.push(`L ${xMin} ${yMin}`);
      }
      commands.push(`L ${xMin + size} ${yMin}`);
      return commands.join(' ');
    };

    const createTopRight = () => {
      const commands = [`M ${xMax - size} ${yMin}`, `L ${xMax - adjustedRadius} ${yMin}`];
      if (adjustedRadius > 0) {
        commands.push(`Q ${xMax} ${yMin} ${xMax} ${arcStart(yMin)}`);
      } else {
        commands.push(`L ${xMax} ${yMin}`);
      }
      commands.push(`L ${xMax} ${yMin + size}`);
      return commands.join(' ');
    };

    const createBottomLeft = () => {
      const commands = [`M ${xMin} ${yMax - size}`, `L ${xMin} ${yMax - adjustedRadius}`];
      if (adjustedRadius > 0) {
        commands.push(`Q ${xMin} ${yMax} ${arcStart(xMin)} ${yMax}`);
      } else {
        commands.push(`L ${xMin} ${yMax}`);
      }
      commands.push(`L ${xMin + size} ${yMax}`);
      return commands.join(' ');
    };

    const createBottomRight = () => {
      const commands = [`M ${xMax - size} ${yMax}`, `L ${xMax - adjustedRadius} ${yMax}`];
      if (adjustedRadius > 0) {
        commands.push(`Q ${xMax} ${yMax} ${xMax} ${yMax - adjustedRadius}`);
      } else {
        commands.push(`L ${xMax} ${yMax}`);
      }
      commands.push(`L ${xMax} ${yMax - size}`);
      return commands.join(' ');
    };

    const pathMap: Record<Corner, string> = {
      tl: createTopLeft(),
      tr: createTopRight(),
      bl: createBottomLeft(),
      br: createBottomRight()
    };

    return corners.map((corner) => ({ corner, d: pathMap[corner] }));
  }, [corners, dimensions.height, dimensions.width, offset, radius, size]);

  const colorClass = `hud-accent-color-${color}`;
  const dashArray = dashed ? '6 4' : undefined;
  const svgStyle: CSSProperties | undefined = glow ? { filter: `drop-shadow(0 0 3px ${glowColor[color]})` } : undefined;

  return (
    <div ref={wrapperRef} className={clsx('corner-bracket__wrapper', className)} style={style}>
      {children}
      {dimensions.width > 0 && dimensions.height > 0 ? (
        <svg
          className={clsx('corner-bracket__svg hud-accent-svg', colorClass)}
          width={dimensions.width + offset * 2}
          height={dimensions.height + offset * 2}
          viewBox={`0 0 ${dimensions.width + offset * 2} ${dimensions.height + offset * 2}`}
          aria-hidden="true"
          focusable="false"
          style={svgStyle}
        >
          {paths.map((path) => (
            <path
              key={path.corner}
              d={path.d}
              fill="none"
              stroke="var(--hud-stroke)"
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeLinecap="round"
            />
          ))}
        </svg>
      ) : null}
    </div>
  );
};

export default CornerBracket;
