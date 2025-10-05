import clsx from 'clsx';

type FuiCornerProps = {
  mode?: 'fine' | 'bold';
  tone?: 'mono' | 'cyan' | 'amber' | 'red';
  inset?: number;
  className?: string;
};

const FuiCorner = ({ mode = 'fine', tone = 'mono', inset = 4, className }: FuiCornerProps) => {
  const strokeWidth = mode === 'fine' ? 0.8 : 1.6;
  const length = mode === 'fine' ? 12 : 18;
  const offset = Math.min(Math.max(inset, 0), 20);
  const max = 100 - offset;
  const min = offset;
  const segments = [
    `M ${min} ${min + length} V ${min} H ${min + length}`,
    `M ${max} ${min + length} V ${min} H ${max - length}`,
    `M ${min} ${max - length} V ${max} H ${min + length}`,
    `M ${max} ${max - length} V ${max} H ${max - length}`,
  ].join(' ');

  return (
    <div className={clsx('fui-corner', className)} data-tone={tone} aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={segments} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" fill="none" opacity={0.85} />
      </svg>
    </div>
  );
};

export default FuiCorner;
