import clsx from 'clsx';

const TargetingHUD = () => {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/70 p-6 text-white/80 shadow-panel">
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/20" />
        <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/20" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 border border-white/40" />
        <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 border border-white/60" />
        <div className="absolute left-1/2 top-3 h-3 w-px -translate-x-1/2 bg-amber/60" />
        <div className="absolute left-1/2 bottom-3 h-3 w-px -translate-x-1/2 bg-amber/60" />
        <div className="absolute top-1/2 left-3 h-px w-3 -translate-y-1/2 bg-amber/60" />
        <div className="absolute top-1/2 right-3 h-px w-3 -translate-y-1/2 bg-amber/60" />
        <div className="absolute left-1/2 top-10 h-10 w-10 -translate-x-1/2 border border-dashed border-white/25" />
      </div>
      <div className="relative flex h-64 flex-col justify-between font-mono text-[0.58rem] uppercase tracking-[0.28em]">
        <div className="flex items-start justify-between text-dim">
          <span>W ● Y</span>
          <span>MG1 VULCAN</span>
          <span>E ● N</span>
        </div>
        <div className="relative flex grow items-center justify-center">
          <div className="absolute left-10 top-10 space-y-1 text-left text-[0.52rem] tracking-[0.3em] text-dim">
            <p>LOCK ::</p>
            <p className="text-white/80">TARGET 815</p>
          </div>
          <div className="absolute right-10 bottom-10 text-right text-[0.52rem] tracking-[0.3em] text-dim">
            <p>LOCKED</p>
            <p className="text-white/80">TRACK 02</p>
          </div>
          <div className="absolute right-10 top-10 flex h-12 w-12 items-center justify-center border border-white/40">
            <div className="h-3 w-3 border border-white/70" />
          </div>
          <div className="absolute left-10 bottom-10 flex h-12 w-12 items-center justify-center border border-white/40">
            <div className="h-2 w-2 bg-white/70" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-[0.5rem] tracking-[0.4em] text-dim">
          <span className="border border-white/10 px-2 py-1 text-white/60">A</span>
          <span className="border border-white/10 px-2 py-1 text-white/60">L</span>
          <span className="border border-white/10 px-2 py-1 text-white/60">T</span>
          <span className="border border-white/10 px-2 py-1 text-white/60">R</span>
        </div>
      </div>
    </div>
  );
};

const VectorLattice = () => {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/70 p-6 text-white/80 shadow-panel">
      <div className="relative flex h-64 flex-col justify-between font-mono text-[0.58rem] uppercase tracking-[0.28em] text-dim">
        <div className="flex justify-between">
          <span>Grid Vec</span>
          <span>VEC 223</span>
        </div>
        <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
          <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
            {Array.from({ length: 25 }).map((_, index) => (
              <div
                key={index}
                className={clsx(
                  'flex items-center justify-center',
                  'before:block before:h-1 before:w-1 before:rounded-full before:bg-white/20'
                )}
              />
            ))}
          </div>
          <div className="absolute inset-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="absolute left-2 right-2 h-px origin-left bg-white/25"
                style={{
                  top: `${20 + index * 15}%`,
                  transform: 'rotate(-35deg)'
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="absolute h-5 w-5 border border-white/60"
                style={{
                  left: `${10 + index * 15}%`,
                  top: `${20 + index * 10}%`
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 border border-white/30" />
        </div>
        <div className="flex items-center justify-between text-[0.5rem] tracking-[0.4em]">
          <span>Signal Integrity 98%</span>
          <span>Vectors Armed</span>
        </div>
      </div>
    </div>
  );
};

const DossierGlyphs = () => {
  return (
    <div className="space-y-6">
      <TargetingHUD />
      <VectorLattice />
    </div>
  );
};

export default DossierGlyphs;
