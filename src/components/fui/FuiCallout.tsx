import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useConnectorLayer } from './useConnectorLayer';
import useReducedMotion from '@/hooks/useReducedMotion';

type FuiPoint = { x: number; y: number };

type FuiCalloutProps = {
  from: string | FuiPoint;
  to: string | FuiPoint;
  variant?: 'solid' | 'dotted';
  tone?: 'mono' | 'cyan' | 'amber' | 'red';
  animate?: boolean;
  className?: string;
};

type Geometry = {
  path: string;
  start: FuiPoint;
  end: FuiPoint;
};

const average = (a: number, b: number) => (a + b) / 2;

const getCenter = (rect: DOMRect): FuiPoint => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const adjustForRect = (rect: DOMRect, dx: number, dy: number, role: 'start' | 'end'): FuiPoint => {
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (role === 'start') {
      return dx >= 0
        ? { x: rect.right, y: rect.top + rect.height / 2 }
        : { x: rect.left, y: rect.top + rect.height / 2 };
    }
    return dx >= 0
      ? { x: rect.left, y: rect.top + rect.height / 2 }
      : { x: rect.right, y: rect.top + rect.height / 2 };
  }

  if (role === 'start') {
    return dy >= 0
      ? { x: rect.left + rect.width / 2, y: rect.bottom }
      : { x: rect.left + rect.width / 2, y: rect.top };
  }

  return dy >= 0
    ? { x: rect.left + rect.width / 2, y: rect.top }
    : { x: rect.left + rect.width / 2, y: rect.bottom };
};

const buildPath = (start: FuiPoint, end: FuiPoint) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
    return `M ${start.x} ${start.y}`;
  }

  const horizontalFirst = Math.abs(dx) > Math.abs(dy);

  if (horizontalFirst) {
    const midX = average(start.x, end.x);
    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  }

  const midY = average(start.y, end.y);
  return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
};

const FuiCallout = ({ from, to, variant = 'solid', tone = 'mono', animate = true, className }: FuiCalloutProps) => {
  const connector = useConnectorLayer();
  const reducedMotion = useReducedMotion();
  const [geometry, setGeometry] = useState<Geometry | null>(null);

  const layer = connector?.layerRef.current ?? null;

  const resolveTarget = useCallback(
    (target: string | FuiPoint) => {
      if (typeof target === 'string') {
        if (!connector) return null;
        const snapshot = connector.getAnchorSnapshot(target);
        if (!snapshot) return null;
        return { point: getCenter(snapshot.rect), rect: snapshot.rect };
      }
      return { point: target };
    },
    [connector],
  );

  const recompute = useCallback(() => {
    const resolvedStart = resolveTarget(from);
    const resolvedEnd = resolveTarget(to);
    if (!resolvedStart || !resolvedEnd) {
      setGeometry(null);
      return;
    }

    const basisDx = resolvedEnd.point.x - resolvedStart.point.x;
    const basisDy = resolvedEnd.point.y - resolvedStart.point.y;

    const startPoint = resolvedStart.rect
      ? adjustForRect(resolvedStart.rect, basisDx, basisDy, 'start')
      : resolvedStart.point;
    const endPoint = resolvedEnd.rect
      ? adjustForRect(resolvedEnd.rect, basisDx, basisDy, 'end')
      : resolvedEnd.point;

    setGeometry({
      path: buildPath(startPoint, endPoint),
      start: startPoint,
      end: endPoint,
    });
  }, [from, resolveTarget, to]);

  useEffect(() => {
    if (!connector) return;
    const unsubscribe = connector.subscribe(() => {
      recompute();
    });
    connector.requestRender();
    return unsubscribe;
  }, [connector, recompute]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  const content = useMemo(() => {
    if (!geometry) return null;
    const { path, start, end } = geometry;
    const showPulse = animate && !reducedMotion;

    return (
      <g className={clsx('fui-callout', variant === 'dotted' && 'fui-callout--dotted', className)} data-tone={tone}>
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
        <circle className="fui-callout__dot" cx={start.x} cy={start.y} r={2.2} />
        <circle className="fui-callout__dot" cx={end.x} cy={end.y} r={2.8} />
        {showPulse ? <circle className="fui-callout__dot fui-callout__pulse fui-anim" cx={end.x} cy={end.y} r={2} /> : null}
      </g>
    );
  }, [animate, className, geometry, reducedMotion, tone, variant]);

  if (!layer || !content) {
    return null;
  }

  return createPortal(content, layer.firstElementChild ?? layer);
};

export default FuiCallout;
