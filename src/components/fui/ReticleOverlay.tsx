import clsx from 'clsx';
import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import '@/styles/hud-accents.css';

export type ReticleOverlayProps = {
  mode?: 'fine' | 'bold';
  animated?: boolean;
  showCompass?: boolean;
  padding?: number;
  color?: 'mono' | 'cyan' | 'amber' | 'red';
  children?: ReactNode;
  crosshair?: 'plus' | 'x' | 'diamond';
  className?: string;
  style?: CSSProperties;
};

type Size = { width: number; height: number };

const ReticleOverlay = ({
  mode = 'fine',
  animated = false,
  showCompass = false,
  padding = 12,
  color = 'mono',
  children,
  crosshair = 'plus',
  className,
  style
}: ReticleOverlayProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = wrapperRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { verticalTicks, horizontalTicks, strokeWidth, tickGap } = useMemo(() => {
    const spacing = mode === 'bold' ? 16 : 12;
    const stroke = mode === 'bold' ? 1.4 : 1;
    const ticks = [] as Array<{ y: number; length: number; major: boolean }>;
    const horizontal = [] as Array<{ x: number; length: number; major: boolean }>;
    const majorEvery = 4;
    const minorLength = mode === 'bold' ? 9 : 7;
    const majorLength = mode === 'bold' ? 16 : 12;

    const height = Math.max(size.height, 0);
    const width = Math.max(size.width, 0);
    const yStart = padding;
    const yEnd = height - padding;
    const xStart = padding;
    const xEnd = width - padding;
    const centerY = height / 2;
    const centerX = width / 2;

    if (width <= 0 || height <= 0) {
      return { verticalTicks: ticks, horizontalTicks: horizontal, strokeWidth: stroke, tickGap: spacing };
    }

    let index = 0;
    for (let y = yStart; y <= yEnd; y += spacing) {
      if (Math.abs(y - centerY) < 0.5) {
        index += 1;
        continue;
      }
      const major = index % majorEvery === 0;
      ticks.push({ y, length: major ? majorLength : minorLength, major });
      index += 1;
    }

    index = 0;
    for (let x = xStart; x <= xEnd; x += spacing) {
      if (Math.abs(x - centerX) < 0.5) {
        index += 1;
        continue;
      }
      const major = index % majorEvery === 0;
      horizontal.push({ x, length: major ? majorLength : minorLength, major });
      index += 1;
    }

    return { verticalTicks: ticks, horizontalTicks: horizontal, strokeWidth: stroke, tickGap: spacing };
  }, [mode, padding, size.height, size.width]);

  const centerX = size.width / 2;
  const centerY = size.height / 2;
  const compass = useMemo(() => {
    if (!showCompass || size.width === 0 || size.height === 0) return null;
    const offset = 18;
    const fontSize = 9;
    const positions: Array<{ label: string; x: number; y: number }> = [
      { label: 'N', x: centerX, y: padding + offset },
      { label: 'S', x: centerX, y: size.height - padding - offset / 3 },
      { label: 'E', x: size.width - padding - offset / 2, y: centerY },
      { label: 'W', x: padding + offset / 2, y: centerY }
    ];

    return positions.map((item) => (
      <text
        key={item.label}
        x={item.x}
        y={item.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fill="var(--hud-stroke)"
        opacity={0.55}
        fontFamily="var(--font-mono, 'Space Mono', monospace)"
      >
        {item.label}
      </text>
    ));
  }, [centerX, centerY, padding, showCompass, size.height, size.width]);

  const crosshairGlyph = useMemo(() => {
    const radius = 14;
    const diag = radius * Math.cos(Math.PI / 4);
    if (crosshair === 'x') {
      return (
        <g stroke="var(--hud-stroke)" strokeWidth={strokeWidth} opacity={0.58}>
          <line x1={centerX - diag} y1={centerY - diag} x2={centerX + diag} y2={centerY + diag} />
          <line x1={centerX + diag} y1={centerY - diag} x2={centerX - diag} y2={centerY + diag} />
        </g>
      );
    }

    if (crosshair === 'diamond') {
      return (
        <polygon
          points={`${centerX},${centerY - radius} ${centerX + radius},${centerY} ${centerX},${centerY + radius} ${centerX - radius},${centerY}`}
          fill="none"
          stroke="var(--hud-stroke)"
          strokeWidth={strokeWidth}
          opacity={0.6}
        />
      );
    }

    return (
      <g stroke="var(--hud-stroke)" strokeWidth={strokeWidth} opacity={0.64}>
        <line x1={centerX - radius} y1={centerY} x2={centerX + radius} y2={centerY} />
        <line x1={centerX} y1={centerY - radius} x2={centerX} y2={centerY + radius} />
      </g>
    );
  }, [centerX, centerY, crosshair, strokeWidth]);

  const linesColor = `hud-accent-color-${color}`;
  const hasSize = size.width > 0 && size.height > 0;

  return (
    <div
      ref={wrapperRef}
      className={clsx('reticle-overlay', linesColor, animated && 'reticle-overlay--animated', className)}
      style={style}
    >
      {children ? <div className="reticle-overlay__center">{children}</div> : null}
      {hasSize ? (
        <svg
          className="reticle-overlay__svg hud-accent-svg"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${Math.max(size.width, 0)} ${Math.max(size.height, 0)}`}
          aria-hidden="true"
          focusable="false"
        >
          <g>
            <line
              x1={padding}
              y1={centerY}
              x2={size.width - padding}
              y2={centerY}
              stroke="var(--hud-stroke)"
              strokeWidth={strokeWidth}
              strokeOpacity={0.78}
            />
            <line
              x1={centerX}
              y1={padding}
              x2={centerX}
              y2={size.height - padding}
              stroke="var(--hud-stroke)"
              strokeWidth={strokeWidth}
              strokeOpacity={0.78}
            />
            {verticalTicks.map((tick, index) => (
              <line
                key={`v-${tick.y}-${index}`}
                x1={centerX - tick.length / 2}
                x2={centerX + tick.length / 2}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--hud-stroke)"
                strokeWidth={mode === 'bold' ? 1.2 : 1}
                strokeOpacity={tick.major ? 0.6 : 0.38}
              />
            ))}
            {horizontalTicks.map((tick, index) => (
              <line
                key={`h-${tick.x}-${index}`}
                x1={tick.x}
                x2={tick.x}
                y1={centerY - tick.length / 2}
                y2={centerY + tick.length / 2}
                stroke="var(--hud-stroke)"
                strokeWidth={mode === 'bold' ? 1.2 : 1}
                strokeOpacity={tick.major ? 0.6 : 0.38}
              />
            ))}
            {animated ? (
              <line
                className="reticle-overlay__scan"
                x1={padding}
                y1={centerY - tickGap * 2}
                x2={size.width - padding}
                y2={centerY - tickGap * 2}
                stroke="var(--hud-stroke)"
                strokeWidth={strokeWidth / 2}
                strokeOpacity={0.32}
                strokeDasharray="12 12"
              />
            ) : null}
            {crosshairGlyph}
            {crosshair === 'diamond' ? null : null}
            <circle className="reticle-overlay__pulse-dot" cx={centerX} cy={centerY} r={animated ? 3 : 2.4} />
            <circle className="reticle-overlay__pulse-ring" cx={centerX} cy={centerY} r={12} />
            {compass}
          </g>
        </svg>
      ) : null}
    </div>
  );
};

export default ReticleOverlay;
