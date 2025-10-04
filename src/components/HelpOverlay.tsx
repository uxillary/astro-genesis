import { createPortal } from 'react-dom';

type HelpOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const HelpOverlay = ({ open, onClose }: HelpOverlayProps) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0d0f]/80 backdrop-blur-sm">
      <div className="relative w-[min(640px,90vw)] rounded-[28px] border border-[#d6e3e0]/15 bg-panel/85 p-8 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-[#d6e3e0] shadow-panel">
        <h2 className="mb-6 text-center text-xl font-semibold tracking-[0.36em] text-amber">Console Reference</h2>
        <div className="grid gap-4 text-left text-[0.65rem] uppercase tracking-[0.28em] text-mid">
          <p>Press <span className="text-[#d6e3e0]">C</span> for credentials overlay.</p>
          <p>Press <span className="text-[#d6e3e0]">?</span> to toggle this dossier help.</p>
          <p>Mode toggle: HUD vs MONO at console header.</p>
          <p>Results update offline via Dexie cache. Use filter chips to refine organism/platform/year.</p>
          <p>Branch map anchors update hash #abstract/#methods/#results/#conclusion.</p>
        </div>
        <button
          type="button"
          className="mt-8 block w-full rounded-full border border-[#d6e3e0]/20 px-4 py-3 text-[0.65rem] text-dim hover:text-[#d6e3e0]"
          onClick={onClose}
        >
          Return to console
        </button>
      </div>
    </div>,
    document.body
  );
};

export default HelpOverlay;
