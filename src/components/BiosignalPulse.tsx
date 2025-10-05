import clsx from 'clsx';

type BiosignalPulseProps = {
  className?: string;
};

const BiosignalPulse = ({ className }: BiosignalPulseProps) => {
  return (
    <div
      className={clsx(
        'pulse-line relative overflow-hidden rounded-full border border-[rgba(32,42,50,0.6)] bg-[rgba(8,12,16,0.65)]',
        'shadow-[0_0_32px_rgba(0,179,255,0.08)]',
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pulse" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,179,255,0)" />
            <stop offset="35%" stopColor="rgba(0,179,255,0.8)" />
            <stop offset="55%" stopColor="rgba(85,230,165,0.9)" />
            <stop offset="80%" stopColor="rgba(0,179,255,0.6)" />
            <stop offset="100%" stopColor="rgba(0,179,255,0)" />
          </linearGradient>
        </defs>
        <path
          d="M0 60 L120 60 L180 20 L240 60 L360 60 L420 96 L480 60 L600 60 L660 24 L720 60 L780 60 L840 92 L900 60 L1020 60 L1080 32 L1140 60 L1200 60 L1260 100 L1320 60 L1440 60"
          fill="none"
          stroke="url(#pulse)"
          strokeWidth="3"
          strokeLinecap="round"
          className="[stroke-dasharray:12] [stroke-dashoffset:480] motion-safe:animate-[pulseSweep_6s_ease-in-out_infinite]"
        />
      </svg>
      <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center gap-2 font-meta text-[0.65rem] tracking-[0.32em] text-[color:var(--accent-2)]">
        <span className="inline-flex h-2 w-2 rounded-full bg-[color:var(--accent-1)] shadow-[0_0_12px_rgba(85,230,165,0.9)]" />
        Live bio-signal uplink
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center gap-2 font-meta text-[0.65rem] tracking-[0.32em] text-[color:var(--mid)]">
        Archive heartbeat stabilized
      </div>
    </div>
  );
};

export default BiosignalPulse;
