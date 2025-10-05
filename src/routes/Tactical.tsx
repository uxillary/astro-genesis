import ExclusionMap from '../components/ExclusionMap';

const Tactical = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-[3px] border border-[#d6e3e0]/14 bg-panel/95 p-6 shadow-panel">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-[#55e6a5]">Mission Planning</p>
        <h1 className="mt-2 text-3xl font-semibold uppercase tracking-[0.22em] text-[#f3f8f6]">Tactical Map</h1>
        <p className="mt-3 max-w-2xl font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#9fb4bc]">
          Static preview of exclusion overlays and hazard zones. Live geospatial data hooks are coming next.
        </p>
      </header>
      <ExclusionMap />
    </div>
  );
};

export default Tactical;
