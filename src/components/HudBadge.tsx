import clsx from 'clsx';
import { ReactNode } from 'react';

type HudBadgeProps = {
  label: string;
  value?: ReactNode;
  tone?: 'amber' | 'red' | 'cyan' | 'mono';
  compact?: boolean;
};

const toneClass: Record<NonNullable<HudBadgeProps['tone']>, string> = {
  amber: 'text-amber border-amber/50 shadow-[0_0_18px_rgba(0,179,255,0.24)]',
  red: 'text-red border-red/60 shadow-[0_0_18px_rgba(255,59,59,0.28)]',
  cyan: 'text-cyan border-cyan/50 shadow-[0_0_18px_rgba(85,230,165,0.28)]',
  mono: 'text-[#d6e3e0] border-[#d6e3e0]/40 shadow-[0_0_18px_rgba(214,227,224,0.16)]'
};

const HudBadge = ({ label, value, tone = 'amber', compact }: HudBadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em] transition-colors duration-200',
        toneClass[tone],
        compact ? 'text-[0.55rem] px-2.5 py-1' : null
      )}
    >
      <span className="opacity-70">{label}</span>
      {value ? <span className="text-[0.65rem] font-semibold tracking-[0.18em]">{value}</span> : null}
    </span>
  );
};

export default HudBadge;
