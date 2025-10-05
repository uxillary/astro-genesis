import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useConnectorLayer, type AnchorSide } from './useConnectorLayer';

type FuiBadgeProps = {
  id?: string;
  label: string;
  tone?: 'mono' | 'cyan' | 'amber' | 'red';
  size?: 'sm' | 'md';
  anchors?: AnchorSide[];
  className?: string;
};

const FuiBadge = ({ id, label, tone = 'mono', size = 'md', anchors, className }: FuiBadgeProps) => {
  const localRef = useRef<HTMLSpanElement>(null);
  const connector = useConnectorLayer();

  useEffect(() => {
    const element = localRef.current;
    if (!connector || !id || !element) {
      return () => undefined;
    }

    connector.registerAnchor(id, element, anchors);
    return () => connector.unregisterAnchor(id);
  }, [anchors, connector, id]);

  return (
    <span
      id={id}
      ref={localRef}
      className={clsx('fui-badge', size === 'sm' && 'fui-badge--sm', className)}
      data-tone={tone}
      data-anchors={anchors?.join(' ')}
    >
      {label}
    </span>
  );
};

export default FuiBadge;
