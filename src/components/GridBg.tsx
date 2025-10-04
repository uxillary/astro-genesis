const GridBg = () => {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bg-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#050a09" />
            <stop offset="45%" stopColor="#071310" />
            <stop offset="100%" stopColor="#020605" />
          </linearGradient>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0H0V80" fill="none" stroke="rgba(87, 129, 116, 0.14)" strokeWidth="0.6" />
          </pattern>
          <pattern id="micro-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill="rgba(160, 214, 185, 0.18)" />
          </pattern>
          <linearGradient id="scan" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 86, 72, 0.35)" />
            <stop offset="100%" stopColor="rgba(3, 7, 6, 0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-gradient)" />
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.55" />
        <rect width="100%" height="100%" fill="url(#micro-dots)" opacity="0.35" />
        <rect width="100%" height="100%" fill="url(#scan)" opacity="0.4" />
      </svg>

      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 18% 24%, rgba(108, 208, 162, 0.18), transparent 55%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 82% 68%, rgba(255, 86, 72, 0.16), transparent 48%)' }} />

      <svg
        className="absolute left-1/2 top-12 h-[180px] w-[960px] -translate-x-1/2 opacity-90 max-w-none"
        viewBox="0 0 960 180"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text x="12" y="28" fill="#55ffb4" fontFamily="'IBM Plex Mono', monospace" fontSize="16" letterSpacing={6}>
          POINTERS
        </text>
        <g transform="translate(0 48)" fill="none" stroke="#dfe8e3" strokeWidth="2">
          <PointerIcon x={40} variant="circle" />
          <PointerIcon x={140} variant="square" />
          <PointerIcon x={240} variant="cross" />
          <PointerIcon x={340} variant="radial" />
          <PointerIcon x={440} variant="triangle" />
          <PointerIcon x={540} variant="glitch" />
          <PointerIcon x={640} variant="skull" />
          <PointerIcon x={740} variant="arc" />
          <PointerIcon x={840} variant="scan" />
        </g>
      </svg>

      <svg
        className="absolute left-1/2 top-1/2 h-[220px] w-[1040px] -translate-x-1/2 -translate-y-1/2 opacity-80 max-w-none"
        viewBox="0 0 1040 220"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text x="18" y="26" fill="#55ffb4" fontFamily="'IBM Plex Mono', monospace" fontSize="16" letterSpacing={6}>
          LINE CALLOUT
        </text>
        <CalloutPanel x={60} y={60} width={260} label="TEXT" />
        <CalloutPanel x={368} y={112} width={300} label="TEXT" flip />
        <CalloutPanel x={704} y={68} width={260} label="TEXT" skew />
      </svg>

      <svg
        className="absolute bottom-10 left-1/2 h-[240px] w-[1040px] -translate-x-1/2 opacity-70 max-w-none"
        viewBox="0 0 1040 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text x="18" y="30" fill="#55ffb4" fontFamily="'IBM Plex Mono', monospace" fontSize="16" letterSpacing={6}>
          GRID
        </text>
        <g transform="translate(60 52)" stroke="#dfe8e3" strokeOpacity="0.25" strokeWidth="1" fill="none">
          <rect width="360" height="160" rx="14" ry="14" />
          <path d="M60 0v160" opacity="0.35" />
          <path d="M0 64h360" opacity="0.35" />
          <rect x="220" y="28" width="120" height="72" rx="8" ry="8" opacity="0.45" />
          <path d="M320 0v160" opacity="0.2" />
          <path d="M0 120h360" opacity="0.2" />
        </g>
        <g transform="translate(460 52)">
          <TriangularGrid />
        </g>
        <g transform="translate(760 52)" fill="#dfe8e3">
          <rect width="220" height="120" fill="rgba(223, 232, 227, 0.04)" />
          <rect x="12" y="12" width="60" height="60" fill="rgba(223, 232, 227, 0.08)" />
          <rect x="84" y="28" width="44" height="44" fill="rgba(223, 232, 227, 0.12)" />
          <rect x="144" y="56" width="36" height="36" fill="rgba(223, 232, 227, 0.16)" />
        </g>
      </svg>

      <div
        className="absolute inset-0 mix-blend-screen opacity-40"
        style={{ backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)' }}
      />
      <div className="absolute inset-8 rounded-[28px] border border-white/5" />
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

type PointerVariant =
  | 'circle'
  | 'square'
  | 'cross'
  | 'radial'
  | 'triangle'
  | 'glitch'
  | 'skull'
  | 'arc'
  | 'scan';

type PointerIconProps = {
  x: number;
  variant: PointerVariant;
};

const PointerIcon = ({ x, variant }: PointerIconProps) => {
  const center = { cx: x, cy: 46 };
  switch (variant) {
    case 'circle':
      return (
        <g transform={`translate(${center.cx - 32} ${center.cy - 32})`}>
          <circle cx="32" cy="32" r="30" opacity="0.4" />
          <circle cx="32" cy="32" r="16" opacity="0.6" />
          <line x1="32" x2="32" y1="12" y2="0" opacity="0.7" />
          <line x1="32" x2="32" y1="64" y2="52" opacity="0.7" />
          <line x1="12" x2="0" y1="32" y2="32" opacity="0.7" />
          <line x1="64" x2="52" y1="32" y2="32" opacity="0.7" />
        </g>
      );
    case 'square':
      return (
        <g transform={`translate(${center.cx - 32} ${center.cy - 32})`}>
          <rect x="6" y="6" width="52" height="52" rx="4" opacity="0.45" />
          <path d="M6 6l52 52" opacity="0.5" />
          <path d="M58 6L6 58" opacity="0.5" />
          <rect x="26" y="26" width="12" height="12" opacity="0.8" />
        </g>
      );
    case 'cross':
      return (
        <g transform={`translate(${center.cx - 32} ${center.cy - 32})`}>
          <circle cx="32" cy="32" r="30" opacity="0.25" />
          <path d="M32 0v64M0 32h64" strokeDasharray="6 6" opacity="0.7" />
          <circle cx="32" cy="32" r="6" opacity="0.8" />
        </g>
      );
    case 'radial':
      return (
        <g transform={`translate(${center.cx - 32} ${center.cy - 32})`}>
          <circle cx="32" cy="32" r="30" strokeDasharray="4 6" opacity="0.4" />
          <circle cx="32" cy="32" r="18" strokeDasharray="2 4" opacity="0.6" />
          <path d="M32 12l6 10h-12z" opacity="0.8" />
          <path d="M32 52l-6-10h12z" opacity="0.8" />
        </g>
      );
    case 'triangle':
      return (
        <g transform={`translate(${center.cx - 32} ${center.cy - 30})`}>
          <polygon points="32,2 62,52 2,52" fill="rgba(255,98,80,0.18)" stroke="rgba(255,98,80,0.75)" />
          <text
            x="32"
            y="38"
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="12"
            fill="rgba(255,98,80,0.8)"
          >
            ⚠
          </text>
        </g>
      );
    case 'glitch':
      return (
        <g transform={`translate(${center.cx - 32} ${center.cy - 32})`}>
          <rect x="8" y="12" width="48" height="40" opacity="0.35" />
          <path d="M12 16h12v8H12zm20 0h12v8H32zM12 36h12v8H12zm20 12h12v4H32z" opacity="0.8" />
          <rect x="26" y="26" width="12" height="12" fill="#ff5648" opacity="0.6" />
        </g>
      );
    case 'skull':
      return (
        <g transform={`translate(${center.cx - 32} ${center.cy - 32})`}>
          <circle cx="32" cy="32" r="26" stroke="rgba(255,98,80,0.75)" fill="rgba(255,98,80,0.08)" />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="20"
            fill="rgba(255,98,80,0.75)"
          >
            ☠
          </text>
        </g>
      );
    case 'arc':
      return (
        <g transform={`translate(${center.cx - 32} ${center.cy - 32})`}>
          <path d="M32 0a32 32 0 0132 32" strokeDasharray="12 8" opacity="0.6" />
          <path d="M32 64a32 32 0 01-32-32" strokeDasharray="12 8" opacity="0.35" />
          <path d="M32 6a26 26 0 0126 26" opacity="0.6" />
          <circle cx="32" cy="32" r="4" opacity="0.8" />
        </g>
      );
    case 'scan':
      return (
        <g transform={`translate(${center.cx - 32} ${center.cy - 32})`}>
          <rect x="10" y="10" width="44" height="44" rx="12" opacity="0.35" />
          <path d="M12 32h40" strokeDasharray="4 4" opacity="0.6" />
          <path d="M32 12v40" strokeDasharray="4 4" opacity="0.6" />
          <circle cx="32" cy="32" r="20" strokeDasharray="6 6" opacity="0.45" />
          <rect x="24" y="24" width="16" height="16" fill="#55ffb4" opacity="0.35" />
        </g>
      );
    default:
      return null;
  }
};

type CalloutPanelProps = {
  x: number;
  y: number;
  width: number;
  label: string;
  flip?: boolean;
  skew?: boolean;
};

const CalloutPanel = ({ x, y, width, label, flip, skew }: CalloutPanelProps) => {
  const lineY = y + 38;
  const anchorX = flip ? x + width + 110 : x - 110;
  const midX = flip ? x + width + 36 : x - 36;
  const transform = skew ? `rotate(-2 ${x + width / 2} ${y + 42})` : undefined;
  return (
    <g>
      <path
        d={`M${anchorX} ${lineY} L${midX} ${lineY} L${midX + (flip ? -12 : 12)} ${lineY - 12} L${flip ? x + width : x} ${lineY - 12}`}
        stroke="#dfe8e3"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={84}
        rx={12}
        ry={12}
        fill="rgba(8, 16, 14, 0.6)"
        stroke="#dfe8e3"
        strokeOpacity="0.35"
        transform={transform}
      />
      <text
        x={x + width / 2}
        y={y + 48}
        textAnchor="middle"
        fill="#dfe8e3"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="20"
        letterSpacing="10"
      >
        {label}
      </text>
      <circle cx={anchorX} cy={lineY} r={4} fill="#55ffb4" opacity="0.65" />
      <circle cx={midX} cy={lineY} r={3} fill="#dfe8e3" opacity="0.45" />
    </g>
  );
};

const TriangularGrid = () => {
  const lines = [];
  const size = 200;
  const step = 18;
  for (let i = 0; i <= size; i += step) {
    lines.push(
      <path key={`diag-${i}`} d={`M0 ${i} L${i} 0`} stroke="rgba(223,232,227,0.18)" strokeWidth="1" />
    );
    lines.push(
      <path key={`diag2-${i}`} d={`M${size - i} ${size} L${size} ${size - i}`} stroke="rgba(223,232,227,0.12)" strokeWidth="1" />
    );
  }
  return (
    <svg width="220" height="160" viewBox="0 0 200 160" fill="none">
      <rect width="200" height="160" fill="rgba(223,232,227,0.04)" stroke="rgba(223,232,227,0.25)" rx="10" ry="10" />
      <g transform="translate(0 0)">
        {lines}
      </g>
    </svg>
  );
};

export default GridBg;
