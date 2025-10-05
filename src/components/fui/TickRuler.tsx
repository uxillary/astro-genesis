import clsx from 'clsx';
import { type CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react';
import '@/styles/hud-accents.css';

type TickRulerProps = {
  orientation: 'horizontal' | 'vertical';
  length?: number;
  spacing?: number;
  majorEvery?: number;
  label?: string;
  align?: 'start' | 'center' | 'end';
  color?: 'mono' | 'cyan';
  className?: string;
  style?: CSSProperties;
};

type Tick = { position: number; major: boolean };

const TickRuler = ({
  orientation,
  length,
  spacing = 12,
  majorEvery = 4,
  label,
  align = 'start',
  color = 'mono',
  className,
  style
}: TickRulerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [measure, setMeasure] = useState<number>(length ?? 0);

  useLayoutEffect(() => {
    if (typeof length === 'number') {
      setMeasure(length);
      return;
    }

    const element = wrapperRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setMeasure(orientation === 'horizontal' ? width : height);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [length, orientation]);

  const ticks = useMemo<Tick[]>(() => {
    if (measure <= 0) return [];
    const total = Math.max(Math.floor(measure / spacing), 0);
    const entries: Tick[] = [];
    for (let index = 0; index <= total; index += 1) {
      const position = index * spacing;
      if (position > measure) break;
      entries.push({ position, major: index % majorEvery === 0 });
    }
    return entries;
  }, [majorEvery, measure, spacing]);

  const colorClass = `hud-accent-color-${color}`;
  const width = orientation === 'horizontal' ? measure : 20;
  const height = orientation === 'horizontal' ? 20 : measure;
  const baselineProps = {
    stroke: 'var(--hud-stroke)',
    strokeWidth: 1,
    strokeOpacity: 0.78
  } as const;

  const tickLengthMinor = orientation === 'horizontal' ? 6 : 6;
  const tickLengthMajor = orientation === 'horizontal' ? 12 : 12;

  const wrapperStyle: CSSProperties = {
    ...(style ?? {}),
    width: orientation === 'horizontal' && typeof length === 'number' ? `${length}px` : style?.width,
    height: orientation === 'vertical' && typeof length === 'number' ? `${length}px` : style?.height
  };

  return (
    <div
      ref={wrapperRef}
      className={clsx('tick-ruler', `tick-ruler--${orientation}`, colorClass, className)}
      style={wrapperStyle}
    >
      {label ? <span className={clsx('tick-ruler__label', `tick-ruler__label--${align}`)}>{label}</span> : null}
      {measure > 0 ? (
        <svg
          className="tick-ruler__svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
          focusable="false"
        >
          {orientation === 'horizontal' ? (
            <line x1={0} y1={height - 4} x2={width} y2={height - 4} {...baselineProps} />
          ) : (
            <line x1={4} y1={0} x2={4} y2={height} {...baselineProps} />
          )}
          {ticks.map((tick, index) => {
            if (orientation === 'horizontal') {
              const y2 = height - 4;
              const y1 = y2 - (tick.major ? tickLengthMajor : tickLengthMinor);
              return (
                <line
                  key={`tick-${tick.position}-${index}`}
                  x1={tick.position}
                  x2={tick.position}
                  y1={y1}
                  y2={y2}
                  stroke="var(--hud-stroke)"
                  strokeWidth={tick.major ? 1.1 : 0.9}
                  strokeOpacity={tick.major ? 0.6 : 0.45}
                />
              );
            }
            const x1 = 4;
            const x2 = x1 + (tick.major ? tickLengthMajor : tickLengthMinor);
            return (
              <line
                key={`tick-${tick.position}-${index}`}
                x1={x1}
                x2={x2}
                y1={tick.position}
                y2={tick.position}
                stroke="var(--hud-stroke)"
                strokeWidth={tick.major ? 1.1 : 0.9}
                strokeOpacity={tick.major ? 0.6 : 0.45}
              />
            );
          })}
        </svg>
      ) : null}
    </div>
  );
};

export default TickRuler;
