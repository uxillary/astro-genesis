import clsx from 'clsx';

type FuiDividerProps = {
  label?: string;
  side?: 'left' | 'center' | 'right';
  tone?: 'mono' | 'cyan' | 'amber' | 'red';
  className?: string;
};

const FuiDivider = ({ label, side = 'center', tone = 'mono', className }: FuiDividerProps) => {
  return (
    <div className={clsx('fui-divider', className)} data-side={side} data-tone={tone}>
      {label ? (
        <span className="fui-divider__label">
          {label}
          <span className="fui-divider__ticks" aria-hidden />
        </span>
      ) : null}
    </div>
  );
};

export default FuiDivider;
