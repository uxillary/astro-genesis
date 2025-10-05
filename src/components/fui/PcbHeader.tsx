import { Children, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import '@/styles/pcb.css';
import { makePath, offsetPath, type Point, type Vector } from './TraceMath';

type AnchorSide = 'left' | 'right' | 'top' | 'bottom';

type Trace = {
  from: string;
  to?: string;
  exit?: AnchorSide;
  style?: 'solid' | 'dotted';
  accent?: 'cyan' | 'amber' | 'red' | 'mono';
  signal?: boolean;
};

type TracePlan = Trace & {
  key: string;
  d: string;
  micros: string[];
};

type Anchor = {
  point: Point;
  dir: Vector;
};

type EdgeTarget = 'left' | 'right' | 'top' | 'bottom';

type PcbHeaderProps = {
  children: ReactNode;
  traces: Trace[];
  density?: 0.5 | 1 | 2;
  className?: string;
};

const anchorVectors: Record<AnchorSide, Vector> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 }
};

const getOffsetsForDensity = (density: number | undefined): number[] => {
  if (!density || density <= 0) return [];
  if (density === 0.5) return [1.4];
  if (density === 1) return [1.4, -1.4];
  return [1.4, -1.4, 3, -3];
};

const parseAnchorSpec = (value: string): { id: string; side: AnchorSide } => {
  const [id, rawSide] = value.split(':');
  const side = (rawSide ?? 'right') as AnchorSide;
  return { id, side };
};

const createEdgeAnchor = (
  direction: EdgeTarget,
  containerRect: DOMRect,
  alignWith?: Anchor
): Anchor => {
  const margin = 18;
  switch (direction) {
    case 'left':
      return {
        point: { x: -margin, y: alignWith?.point.y ?? containerRect.height / 2 },
        dir: anchorVectors.left
      };
    case 'right':
      return {
        point: { x: containerRect.width + margin, y: alignWith?.point.y ?? containerRect.height / 2 },
        dir: anchorVectors.right
      };
    case 'top':
      return {
        point: { x: alignWith?.point.x ?? containerRect.width / 2, y: -margin },
        dir: anchorVectors.top
      };
    case 'bottom':
    default:
      return {
        point: { x: alignWith?.point.x ?? containerRect.width / 2, y: containerRect.height + margin },
        dir: anchorVectors.bottom
      };
  }
};

const getDensityOffsets = (density: 0.5 | 1 | 2 | undefined) => getOffsetsForDensity(density);

const resolveExternalTarget = (
  target: string,
  containerRect: DOMRect
): Anchor | null => {
  const element = document.querySelector(target);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    point: {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top
    },
    dir: anchorVectors.top
  };
};

const PcbHeader = ({ children, traces, density = 0.5, className }: PcbHeaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<{ width: number; height: number; plans: TracePlan[] }>({
    width: 0,
    height: 0,
    plans: []
  });
  const frameRef = useRef<number>();
  const childCount = useMemo(() => Children.count(children), [children]);

  const requestMeasure = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = undefined;
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const resolveAnchor = (id: string, side: AnchorSide): Anchor | null => {
        const badge = container.querySelector(`#${id}`) as HTMLElement | null;
        if (!badge) return null;
        const anchor = badge.querySelector(`[data-anchor-${side}]`) as HTMLElement | null;
        if (!anchor) return null;
        const rect = anchor.getBoundingClientRect();
        return {
          point: {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top
          },
          dir: anchorVectors[side]
        };
      };

      const computed: TracePlan[] = [];
      traces.forEach((trace, index) => {
        const { id: fromId, side: fromSide } = parseAnchorSpec(trace.from);
        const fromAnchor = resolveAnchor(fromId, fromSide);
        if (!fromAnchor) return;

        let toAnchor: Anchor | null = null;
        if (trace.to) {
          if (trace.to.startsWith('edge:')) {
            const [, edgeDirection] = trace.to.split(':');
            toAnchor = createEdgeAnchor(edgeDirection as EdgeTarget, containerRect, fromAnchor);
          } else if (trace.to.startsWith('#')) {
            toAnchor = resolveExternalTarget(trace.to, containerRect);
          } else {
            const { id: toId, side: toSide } = parseAnchorSpec(trace.to);
            toAnchor = resolveAnchor(toId, toSide);
          }
        }

        if (!toAnchor && trace.exit) {
          toAnchor = createEdgeAnchor(trace.exit, containerRect, fromAnchor);
        }

        if (!toAnchor) return;

        const fromDirection = trace.exit ? anchorVectors[trace.exit] : fromAnchor.dir;
        const toDirection = { x: -toAnchor.dir.x, y: -toAnchor.dir.y };

        const d = makePath(fromAnchor.point, toAnchor.point, {
          fromDirection,
          toDirection,
          preferAxis: Math.abs(fromDirection.x) > Math.abs(fromDirection.y) ? 'horizontal' : 'vertical'
        });
        const offsets = getDensityOffsets(density);
        const micros = offsets.map((offsetValue) => offsetPath(d, offsetValue));
        const plan: TracePlan = {
          ...trace,
          key: `${trace.from}-${trace.to ?? trace.exit ?? index}`,
          d,
          micros
        };
        computed.push(plan);
      });

      setGeometry({
        width: containerRect.width,
        height: containerRect.height,
        plans: computed
      });
    });
  }, [density, traces]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const observer = new ResizeObserver(() => requestMeasure());
    observer.observe(container);
    container.querySelectorAll('[data-badge-root]').forEach((node) => observer.observe(node));

    const handleResize = () => requestMeasure();
    const handleScroll = () => requestMeasure();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    requestMeasure();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      observer.disconnect();
    };
  }, [requestMeasure, childCount]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    requestMeasure();
  }, [requestMeasure, traces, density, childCount]);

  const { width, height, plans } = geometry;

  return (
    <div ref={containerRef} className={clsx('pcb-header relative', className)}>
      <svg
        className="pcb-header__trace-layer"
        width={Math.max(width, 1)}
        height={Math.max(height, 1)}
        viewBox={`0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`}
        role="presentation"
        aria-hidden="true"
      >
        <g>
          {plans.map((plan) => {
            const accent = plan.accent ?? 'cyan';
            const style = plan.style ?? 'solid';
            return (
              <g key={plan.key} className={clsx('trace-group', `trace-accent-${accent}`)}>
                <path className={clsx('trace', style === 'dotted' && 'trace--dotted')} d={plan.d} />
                {plan.signal ? <path className="trace trace--signal" d={plan.d} pathLength={1} /> : null}
                {plan.micros.map((micro, index) => (
                  <path key={`${plan.key}-micro-${index}`} className="trace trace--micro" d={micro} />
                ))}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="pcb-header__content">{children}</div>
    </div>
  );
};

export type { Trace, PcbHeaderProps };
export default PcbHeader;

