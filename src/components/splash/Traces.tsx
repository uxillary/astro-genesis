import { CSSProperties, useMemo } from 'react';

export type Trace = {
  from: 'top' | 'right' | 'bottom' | 'left';
  len?: number;
  bend?: number;
  accent?: 'amber' | 'cyan' | 'red';
  signal?: boolean;
};

export type TracesProps = {
  traces: Trace[];
  reducedMotion?: boolean;
};

type PathConfig = {
  id: string;
  d: string;
  accent: 'amber' | 'cyan' | 'red';
  signal: boolean;
};

const BASE_LENGTH = 120;
const BASE_BEND = 36;

export default function Traces({ traces, reducedMotion }: TracesProps) {
  const paths = useMemo<PathConfig[]>(
    () =>
      traces.map((trace, index) => {
        const len = trace.len ?? BASE_LENGTH;
        const bend = trace.bend ?? BASE_BEND;
        const accent = trace.accent ?? 'amber';

        switch (trace.from) {
          case 'top': {
            const startX = 200 + index * 26;
            const vertical = Math.max(40, len);
            const horizontal = Math.max(24, bend);
            const d = `M ${startX} 18 v -${vertical} h ${horizontal}`;
            return { id: `trace-${index}`, d, accent, signal: Boolean(trace.signal) };
          }
          case 'bottom': {
            const startX = 180 - index * 24;
            const vertical = Math.max(40, len);
            const horizontal = Math.max(24, bend);
            const d = `M ${startX} 282 v ${vertical} h -${horizontal}`;
            return { id: `trace-${index}`, d, accent, signal: Boolean(trace.signal) };
          }
          case 'left': {
            const startY = 160 + index * 18;
            const horizontal = Math.max(50, len);
            const vertical = Math.max(24, bend);
            const d = `M 22 ${startY} h -${horizontal} v ${vertical}`;
            return { id: `trace-${index}`, d, accent, signal: Boolean(trace.signal) };
          }
          case 'right':
          default: {
            const startY = 120 - index * 20;
            const horizontal = Math.max(50, len);
            const vertical = Math.max(24, bend);
            const d = `M 378 ${startY} h ${horizontal} v -${vertical}`;
            return { id: `trace-${index}`, d, accent, signal: Boolean(trace.signal) };
          }
        }
      }),
    [traces]
  );

  return (
    <svg className="splash-traces" viewBox="0 0 400 320" fill="none" aria-hidden="true">
      {paths.map((path) => (
        <g key={path.id} className={`splash-trace splash-trace--${path.accent}`}>
          <path d={path.d} />
          {path.signal && !reducedMotion ? (
            <circle
              r={3}
              className="splash-trace__signal"
              style={{
                offsetPath: `path('${path.d}')`,
                WebkitOffsetPath: `path('${path.d}')`,
              } as CSSProperties}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}
