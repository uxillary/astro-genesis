const ExclusionMap = () => {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/80 shadow-panel">
      <header className="absolute left-6 top-6 z-20 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.32em] text-white">
        <span className="rounded-full border border-red/60 px-3 py-1 text-red">Exclusion Zone</span>
        <span className="text-dim">S-17 Quadrant</span>
      </header>
      <div className="relative h-80 w-full">
        <svg className="h-full w-full" viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06121b" />
              <stop offset="40%" stopColor="#0f1f2d" />
              <stop offset="100%" stopColor="#071018" />
            </linearGradient>
            <radialGradient id="flare" cx="80%" cy="20%" r="60%">
              <stop offset="0%" stopColor="rgba(255,77,79,0.8)" />
              <stop offset="100%" stopColor="rgba(255,77,79,0)" />
            </radialGradient>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
            <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M0 8L8 0" stroke="rgba(255,77,79,0.55)" strokeWidth="1" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="640" height="320" fill="url(#bg-gradient)" />
          <rect width="640" height="320" fill="url(#grid)" />
          <rect width="640" height="320" fill="url(#flare)" opacity="0.5" />
          <g filter="url(#glow)" opacity="0.35">
            <ellipse cx="180" cy="120" rx="90" ry="40" fill="#ff4d4f" />
            <ellipse cx="440" cy="220" rx="120" ry="54" fill="#ff8a00" />
          </g>
          <g stroke="rgba(85,230,165,0.45)" strokeWidth="1.5" fill="none">
            <path d="M60 260C120 210 180 230 240 180C320 120 420 140 520 80" />
            <circle cx="240" cy="180" r="6" fill="rgba(85,230,165,0.35)" />
            <circle cx="420" cy="140" r="8" fill="rgba(85,230,165,0.25)" />
          </g>
          <polygon
            points="140,40 320,60 460,160 420,260 240,300 120,220"
            fill="url(#hatch)"
            stroke="rgba(255,77,79,0.7)"
            strokeWidth="2"
            opacity="0.65"
          />
          <polygon
            points="140,40 320,60 460,160 420,260 240,300 120,220"
            fill="none"
            stroke="rgba(255,138,0,0.6)"
            strokeDasharray="6 4"
          />
          <g fill="rgba(232,242,239,0.08)" stroke="rgba(232,242,239,0.12)" strokeWidth="0.5">
            <circle cx="120" cy="60" r="12" />
            <circle cx="520" cy="240" r="10" />
            <circle cx="360" cy="90" r="6" />
          </g>
          <rect width="640" height="320" fill="url(#hatch)" opacity="0.1" />
        </svg>
      </div>
      <div className="absolute inset-0 border border-dashed border-white/10" />
      <footer className="absolute bottom-0 left-0 right-0 bg-black/70 px-6 py-4 font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">
        Tactical feed offline // Synth snapshot
      </footer>
    </div>
  );
};

export default ExclusionMap;
