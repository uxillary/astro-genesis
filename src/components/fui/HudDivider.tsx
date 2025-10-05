import clsx from 'clsx';
import TickRuler from './TickRuler';
import '@/styles/hud-accents.css';

type HudDividerProps = {
  label: string;
  side?: 'left' | 'right' | 'center';
  compact?: boolean;
  className?: string;
};

const HudDivider = ({ label, side = 'left', compact = false, className }: HudDividerProps) => {
  const labelClass = clsx('hud-divider__label', {
    'hud-divider__label--left': side === 'left',
    'hud-divider__label--right': side === 'right',
    'hud-divider__label--center': side === 'center'
  });

  return (
    <div className={clsx('hud-divider', compact && 'hud-divider--compact', className)}>
      {side === 'right' || side === 'center' ? (
        <TickRuler orientation="horizontal" className="hud-divider__ticks" spacing={12} majorEvery={5} align="start" />
      ) : null}
      <span className={labelClass}>{label}</span>
      {side === 'left' || side === 'center' ? (
        <TickRuler orientation="horizontal" className="hud-divider__ticks" spacing={12} majorEvery={5} align="end" />
      ) : null}
    </div>
  );
};

export default HudDivider;
