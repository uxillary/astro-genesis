import { useMemo } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  r: number;
  delay: number;
  hue: 'cyan' | 'green';
};

const GridBg = () => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 56 }).map((_, index) => ({
      id: index,
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.8 + 0.6,
      delay: (index % 8) * 0.75,
      hue: index % 2 === 0 ? 'cyan' : 'green'
    }));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bg-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#050607" />
            <stop offset="45%" stopColor="#0b0d0f" />
            <stop offset="100%" stopColor="#020304" />
          </linearGradient>
          <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M120 0H0V120" fill="none" stroke="rgba(26, 31, 36, 0.32)" strokeWidth="0.7" />
          </pattern>
          <linearGradient id="horizon" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 179, 255, 0.22)" />
            <stop offset="30%" stopColor="rgba(0, 179, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(0, 179, 255, 0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-gradient)" />
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.4" />
        <rect width="100%" height="100%" fill="url(#horizon)" opacity="0.45" />
      </svg>

      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 18% 22%, rgba(0, 179, 255, 0.16), transparent 65%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 78% 72%, rgba(85, 230, 165, 0.12), transparent 58%)' }} />

      <div className="absolute inset-0 animate-[ambientSpark_18s_linear_infinite] opacity-35" style={{ backgroundImage: 'radial-gradient(circle at 12% 18%, rgba(0,179,255,0.12) 0, rgba(0,179,255,0) 55%), radial-gradient(circle at 84% 68%, rgba(85,230,165,0.1) 0, rgba(85,230,165,0) 50%)' }} />

      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="particle-cyan" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 179, 255, 0.95)" />
            <stop offset="100%" stopColor="rgba(0, 179, 255, 0.05)" />
          </linearGradient>
          <linearGradient id="particle-green" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(85, 230, 165, 0.95)" />
            <stop offset="100%" stopColor="rgba(85, 230, 165, 0.05)" />
          </linearGradient>
        </defs>
        {particles.map((particle) => (
          <circle
            key={particle.id}
            cx={`${particle.x}%`}
            cy={`${particle.y}%`}
            r={particle.r}
            fill={particle.hue === 'cyan' ? 'url(#particle-cyan)' : 'url(#particle-green)'}
            className="motion-safe:animate-[timelineGlow_6s_linear_infinite]"
            style={{ animationDelay: `${particle.delay}s` }}
            opacity={0.3 + particle.r / 6}
          />
        ))}
      </svg>

      <svg className="absolute inset-0 h-full w-full opacity-40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <pattern id="diagonal" width="140" height="140" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="140" stroke="rgba(0, 179, 255, 0.08)" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#diagonal)" />
      </svg>

      <div className="absolute inset-6 rounded-3xl border border-[rgba(255,255,255,0.04)]" />
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
  const common = 'absolute h-10 w-10 border border-[rgba(255,255,255,0.08)]';
  const map: Record<CornerTickProps['position'], string> = {
    'top-left': 'left-6 top-6 border-r-0 border-b-0 rounded-tl-xl',
    'top-right': 'right-6 top-6 border-l-0 border-b-0 rounded-tr-xl',
    'bottom-left': 'left-6 bottom-6 border-r-0 border-t-0 rounded-bl-xl',
    'bottom-right': 'right-6 bottom-6 border-l-0 border-t-0 rounded-br-xl'
  };
  return <span className={`${common} ${map[position]}`} />;
};

export default GridBg;
