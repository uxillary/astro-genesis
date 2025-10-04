import { ReactNode } from 'react';
import clsx from 'clsx';

type PanelProps = {
  title: string;
  children: ReactNode;
  active?: boolean;
};

const Panel = ({ title, children, active }: PanelProps) => {
  return (
    <section
      className={clsx(
        'border border-white/10 rounded-lg p-4 sm:p-6 transition-all duration-300 bg-black/40 backdrop-blur-sm shadow-glow',
        active ? 'border-accent-cyan/80 shadow-glow scale-[1.01]' : 'opacity-80 hover:border-accent-cyan/40'
      )}
    >
      <header className="flex items-center justify-between mb-3 text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
        <span>{title}</span>
      </header>
      <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-line">{children}</div>
    </section>
  );
};

export default Panel;
