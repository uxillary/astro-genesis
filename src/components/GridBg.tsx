const GridBg = () => {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.08)" />
          </pattern>
          <pattern id="grid-lines" width="96" height="96" patternUnits="userSpaceOnUse">
            <path d="M96 0H0V96" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="scan" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,61,46,0.35)" />
            <stop offset="100%" stopColor="rgba(11,14,16,0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-lines)" opacity="0.35" />
        <rect width="100%" height="100%" fill="url(#dots)" opacity="0.35" />
        <rect width="100%" height="100%" fill="url(#scan)" opacity="0.45" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,74,79,0.24),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_72%,rgba(85,230,165,0.16),transparent_50%)]" />
      <div className="absolute inset-0 mix-blend-screen opacity-50"
        style={{ backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 6px)' }}
      />
      <div className="absolute inset-6 border border-dashed border-white/5 rounded-[28px]" />
      <CornerTick position="top-left" />
      <CornerTick position="top-right" />
      <CornerTick position="bottom-left" />
      <CornerTick position="bottom-right" />
    </div>
  );
};

type CornerTickProps = {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

const CornerTick = ({ position }: CornerTickProps) => {
  const common = 'absolute h-8 w-8 border border-white/10';
  const map: Record<CornerTickProps['position'], string> = {
    'top-left': 'left-6 top-6 border-r-0 border-b-0 rounded-tl-[12px]',
    'top-right': 'right-6 top-6 border-l-0 border-b-0 rounded-tr-[12px]',
    'bottom-left': 'left-6 bottom-6 border-r-0 border-t-0 rounded-bl-[12px]',
    'bottom-right': 'right-6 bottom-6 border-l-0 border-t-0 rounded-br-[12px]'
  };
  return <span className={`${common} ${map[position]}`} />;
};

export default GridBg;
