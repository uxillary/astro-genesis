import { ReactNode } from 'react';
import clsx from 'clsx';

type PanelProps = {
  title: string;
  sublabel?: string;
  actions?: ReactNode;
  children: ReactNode;
  active?: boolean;
  variant?: 'default' | 'dossier';
  id?: string;
};

const Panel = ({ title, sublabel, actions, children, active, variant = 'default', id }: PanelProps) => {
  return (
    <section
      id={id}
      data-variant={variant === 'dossier' ? 'dossier' : undefined}
      data-active={active ? '' : undefined}
      className={clsx(
        'relative overflow-hidden rounded-[3px] border border-[#d6e3e0]/12 bg-panel/80 p-5 text-sm shadow-panel transition-all duration-300',
        active
          ? 'border-cyan/60 shadow-[0_0_42px_rgba(0,179,255,0.28)] backdrop-blur-md'
          : 'hover:border-cyan/45 hover:shadow-[0_0_30px_rgba(0,179,255,0.18)]',
        variant === 'dossier' &&
          'bg-[#0b0d0f]/70 font-body text-[0.92rem] tracking-[0.06em] text-white/70 [--panel-accent:rgba(0,179,255,0.55)]'
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-white/70">{sublabel ?? 'Module'}</p>
          <h3 className="text-base font-semibold tracking-[0.2em] text-white">{title}</h3>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2 text-[0.6rem] text-dim">{actions}</div> : null}
      </header>
      <div
        className={clsx(
          'space-y-3 text-[0.92rem] leading-relaxed text-white/80',
          variant === 'dossier' && 'space-y-4 text-[0.95rem] leading-[1.85] text-white/70'
        )}
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 border border-dashed border-[#d6e3e0]/5" />
      <div className="pointer-events-none absolute -left-10 top-10 h-20 w-20 rounded-full border border-[color:var(--panel-accent,rgba(255,59,59,0.35))]/30 opacity-[0.18]" />
      <div className="pointer-events-none absolute right-6 top-6 h-6 w-6 border border-[#d6e3e0]/12" />
    </section>
  );
};

export default Panel;
