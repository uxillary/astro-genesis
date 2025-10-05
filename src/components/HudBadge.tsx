import clsx from 'clsx';
import { ReactNode } from 'react';

type HudBadgeProps = {
  label: string;
  value?: ReactNode;
  tone?: 'amber' | 'red' | 'cyan' | 'mono';
  compact?: boolean;
};

const toneClass: Record<NonNullable<HudBadgeProps['tone']>, string> = {
  amber: 'border-[rgba(0,179,255,0.35)] text-[color:var(--accent-2)] shadow-[0_0_18px_rgba(0,179,255,0.25)]',
  red: 'border-[rgba(255,59,59,0.45)] text-[color:var(--alert)] shadow-[0_0_18px_rgba(255,59,59,0.3)]',
  cyan: 'border-[rgba(85,230,165,0.35)] text-[color:var(--accent-1)] shadow-[0_0_18px_rgba(85,230,165,0.28)]',
  mono: 'border-[rgba(214,227,224,0.35)] text-[color:var(--white)] shadow-[0_0_18px_rgba(214,227,224,0.2)]'
};

const HudBadge = ({ label, value, tone = 'amber', compact }: HudBadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-meta text-[0.72rem] tracking-[0.22em] uppercase transition-colors duration-200',
        toneClass[tone],
        compact ? 'text-[0.68rem] px-3 py-1' : null
      )}
    >
      <span className="opacity-75">{label}</span>
      {value ? <span className="text-[0.82rem] font-semibold tracking-[0.12em] text-[color:var(--white)]">{value}</span> : null}
    </span>
  );
};

export default HudBadge;
