import clsx from 'clsx';
import { forwardRef, type MouseEventHandler, type ReactNode } from 'react';
import '@/styles/pcb.css';

type Tone = 'amber' | 'red' | 'cyan' | 'mono';

type HudBadgeProps = {
  id?: string;
  label: string;
  value?: ReactNode;
  tone?: Tone;
  compact?: boolean;
  pressed?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

const toneClass: Record<Tone, string> = {
  amber:
    'border-[rgba(0,179,255,0.35)] text-[color:var(--accent-2)] shadow-[0_0_18px_rgba(0,179,255,0.25)] hover:border-[rgba(0,179,255,0.6)]',
  red:
    'border-[rgba(255,59,59,0.45)] text-[color:var(--alert)] shadow-[0_0_18px_rgba(255,59,59,0.3)] hover:border-[rgba(255,59,59,0.6)]',
  cyan:
    'border-[rgba(85,230,165,0.35)] text-[color:var(--accent-1)] shadow-[0_0_18px_rgba(85,230,165,0.28)] hover:border-[rgba(85,230,165,0.55)]',
  mono:
    'border-[rgba(214,227,224,0.35)] text-[color:var(--white)] shadow-[0_0_18px_rgba(214,227,224,0.2)] hover:border-[rgba(214,227,224,0.55)]'
};

const HudBadge = forwardRef<HTMLButtonElement, HudBadgeProps>(
  ({ id, label, value, tone = 'amber', compact, pressed, onClick, className }, ref) => {
    const interactive = typeof onClick === 'function';
    return (
      <button
        type="button"
        id={id}
        ref={ref}
        data-badge-root=""
        className={clsx(
          'hud-badge relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-3.5 py-1.5 font-meta text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(240,248,255,0.9)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(10,15,20,0.92)]',
          toneClass[tone],
          compact ? 'hud-badge--compact px-3 py-1 text-[0.68rem]' : null,
          !interactive ? 'hud-badge--static' : null,
          className
        )}
        onClick={onClick}
        aria-pressed={typeof pressed === 'boolean' ? pressed : undefined}
        aria-disabled={interactive ? undefined : true}
        tabIndex={interactive ? undefined : -1}
      >
        <span className="hud-badge__label opacity-75">{label}</span>
        {value ? (
          <span className="hud-badge__value text-[0.82rem] font-semibold tracking-[0.12em] text-[color:var(--white)]">
            {value}
          </span>
        ) : null}
        <span className="hud-badge__anchor hud-badge__anchor--left" data-anchor-left aria-hidden="true" />
        <span className="hud-badge__anchor hud-badge__anchor--right" data-anchor-right aria-hidden="true" />
        <span className="hud-badge__anchor hud-badge__anchor--top" data-anchor-top aria-hidden="true" />
        <span className="hud-badge__anchor hud-badge__anchor--bottom" data-anchor-bottom aria-hidden="true" />
      </button>
    );
  }
);

HudBadge.displayName = 'HudBadge';

export default HudBadge;

