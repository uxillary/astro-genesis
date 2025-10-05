import { type CSSProperties } from 'react';
import clsx from 'clsx';

type FuiFrameProps = {
  children: React.ReactNode;
  grid?: 'none' | 'dots' | 'tri' | 'soft';
  notched?: boolean;
  padding?: number;
  tone?: 'mono' | 'cyan' | 'amber';
  className?: string;
  style?: CSSProperties;
};

const FuiFrame = ({
  children,
  grid = 'none',
  notched = false,
  padding = 16,
  tone = 'mono',
  className,
  style,
}: FuiFrameProps) => {
  return (
    <div
      className={clsx('fui-frame', notched && 'fui-frame--notched', className)}
      data-grid={grid}
      data-tone={tone}
      style={{
        '--fui-frame-padding': `${padding}px`,
        ...style,
      } as CSSProperties}
    >
      <div className="fui-frame__content">{children}</div>
    </div>
  );
};

export default FuiFrame;
