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
      className={clsx(
        'relative overflow-hidden rounded-[22px] border border-white/10 bg-panel/75 p-5 text-sm shadow-panel transition-all duration-300',
        active ? 'border-amber/80 shadow-[0_0_32px_rgba(255,138,0,0.25)]' : 'hover:border-amber/40',
        variant === 'dossier' && 'bg-black/60 font-mono text-[0.82rem] uppercase tracking-[0.18em] text-mid'
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">{sublabel ?? 'Module'}</p>
          <h3 className="text-base font-semibold tracking-[0.18em] text-white">{title}</h3>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2 text-[0.6rem] text-dim">{actions}</div> : null}
      </header>
      <div className={clsx('space-y-3 text-[0.92rem] leading-relaxed text-white/85', variant === 'dossier' && 'text-[0.65rem] leading-relaxed text-white/70')}>
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 border border-dashed border-white/5" />
      <div className="pointer-events-none absolute -left-10 top-10 h-20 w-20 rounded-full border border-amber/30 opacity-30" />
      <div className="pointer-events-none absolute right-6 top-6 h-6 w-6 border border-white/20" />
    </section>
  );
};

export default Panel;
