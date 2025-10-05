import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import '@/styles/hud-accents.css';

type Variant = 'dot' | 'box' | 'lock';
type Tone = 'mono' | 'red' | 'cyan' | 'amber';

type TargetBadgeProps = {
  label: string;
  variant?: Variant;
  tone?: Tone;
  locked?: boolean;
  pulse?: boolean;
  onClick?: () => void;
};

const TargetBadge = ({
  label,
  variant = 'dot',
  tone = 'mono',
  locked,
  pulse = false,
  onClick
}: TargetBadgeProps) => {
  const [isLocked, setIsLocked] = useState<boolean>(locked ?? false);
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    if (typeof locked === 'boolean') {
      setIsLocked(locked);
    }
  }, [locked]);

  const handleClick = () => {
    const next = !isLocked;
    if (typeof locked !== 'boolean') {
      setIsLocked(next);
    }
    setAnnouncement(next ? 'Lock engaged.' : 'Lock released.');
    onClick?.();
  };

  const glyph = useMemo(() => {
    const glyphColor = 'var(--target-color)';
    switch (variant) {
      case 'box':
        return (
          <svg className="target-badge__glyph" viewBox="0 0 18 18" aria-hidden>
            <rect x={2} y={2} width={14} height={14} rx={2.5} fill="none" stroke={glyphColor} strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
          </svg>
        );
      case 'lock':
        return (
          <svg className="target-badge__glyph" viewBox="0 0 18 18" aria-hidden>
            <rect x={4} y={8.5} width={10} height={6.5} rx={1.6} fill="rgba(12,18,24,0.8)" stroke={glyphColor} strokeWidth={1} opacity={0.9} />
            {isLocked ? (
              <path d="M9 6.6a1.6 1.6 0 0 1 1.6 1.6v0.9h-3.2V8.2A1.6 1.6 0 0 1 9 6.6Z" fill="none" stroke={glyphColor} strokeWidth={1} strokeLinecap="round" />
            ) : (
              <path d="M9 6.5c1 0 1.8 0.7 1.8 1.6v1.1H8.4l-0.2-0.8c-0.2-0.6-0.7-1-1.3-1.1V7.9C6.9 7 7.9 6.5 9 6.5Z" fill="none" stroke={glyphColor} strokeWidth={1} strokeLinecap="round" />
            )}
          </svg>
        );
      default:
        return (
          <svg className="target-badge__glyph" viewBox="0 0 18 18" aria-hidden>
            <rect x={2.5} y={2.5} width={13} height={13} rx={3} fill="none" stroke={glyphColor} strokeWidth={1} opacity={0.65} />
            <circle cx={9} cy={9} r={2.6} fill={glyphColor} opacity={0.85} />
          </svg>
        );
    }
  }, [isLocked, variant]);

  return (
    <>
      <button
        type="button"
        className={clsx('target-badge', `target-badge--${tone}`, pulse && 'target-badge--pulse', isLocked && 'target-badge--active')}
        onClick={handleClick}
        aria-pressed={isLocked}
      >
        {glyph}
        <span>{label}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </>
  );
};

export default TargetBadge;
