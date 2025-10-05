import clsx from 'clsx';

type FuiReticleProps = {
  mode?: 'fine' | 'coarse';
  tone?: 'mono' | 'cyan' | 'amber' | 'red';
  className?: string;
};

const FuiReticle = ({ mode = 'fine', tone = 'mono', className }: FuiReticleProps) => {
  const strokeWidth = mode === 'fine' ? 0.6 : 1.2;
  const tick = mode === 'fine' ? 6 : 10;
  return (
    <div className={clsx('fui-reticle', className)} data-tone={tone} aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" fill="none" opacity={0.85}>
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1={50 - tick} y1="20" x2={50 + tick} y2="20" />
          <line x1={50 - tick} y1="80" x2={50 + tick} y2="80" />
          <line x1="20" y1={50 - tick} x2="20" y2={50 + tick} />
          <line x1="80" y1={50 - tick} x2="80" y2={50 + tick} />
          <circle cx="50" cy="50" r={mode === 'fine' ? 6 : 8} opacity={0.45} />
        </g>
      </svg>
    </div>
  );
};

export default FuiReticle;
