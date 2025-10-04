import ExclusionMap from '../components/ExclusionMap';

const Tactical = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border border-white/12 bg-panel/80 p-6 shadow-panel">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-dim">Mission Planning</p>
        <h1 className="mt-2 text-3xl font-semibold uppercase tracking-[0.24em] text-white">Tactical Map Placeholder</h1>
        <p className="mt-3 max-w-2xl font-mono text-[0.65rem] uppercase tracking-[0.28em] text-mid">
          Offline static snapshot demonstrating hatch overlays and exclusion zone rendering. Future iterations will wire geospatial layers to mission feeds.
        </p>
      </header>
      <ExclusionMap />
    </div>
  );
};

export default Tactical;
