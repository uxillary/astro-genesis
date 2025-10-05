import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import HudBadge from '@/components/fui/HudBadge';

type CredentialOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const CredentialOverlay = ({ open, onClose }: CredentialOverlayProps) => {
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      const timeout = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0b0d0f]/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[4px] border border-[#d6e3e0]/15 bg-panel/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
        <div className="absolute inset-0 scanlines" />
        <header className="relative mb-6 space-y-3 text-center">
          <HudBadge label="Level 7" tone="red" value={<span>SECURE</span>} />
          <h2 className="text-xl font-semibold tracking-[0.4em] text-[#d6e3e0]">Submit Security Credentials</h2>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-dim">
            Clearance required // Press ESC to abort
          </p>
        </header>
        <form
          className="relative space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
            setTimeout(onClose, 1200);
          }}
        >
          <label className="block text-[0.62rem] font-mono uppercase tracking-[0.28em] text-dim">
            Access Key
            <input
              ref={inputRef}
              type="password"
              className="mt-2 w-full rounded-[3px] border border-[#d6e3e0]/20 bg-[#0b0d0f]/70 px-4 py-3 font-mono text-[0.8rem] tracking-[0.28em] text-[#d6e3e0] focus:border-amber focus:outline-none"
              placeholder="••••-••••-••••"
              required
            />
          </label>
          <label className="block text-[0.62rem] font-mono uppercase tracking-[0.28em] text-dim">
            Operator Call Sign
            <input
              type="text"
              className="mt-2 w-full rounded-[3px] border border-[#d6e3e0]/20 bg-[#0b0d0f]/70 px-4 py-3 font-mono text-[0.8rem] tracking-[0.28em] text-[#d6e3e0] focus:border-amber focus:outline-none"
              placeholder="e.g. ORION-12"
              required
            />
          </label>
          <button
            type="submit"
            className="hud-glow relative w-full rounded-[4px] border border-red/60 bg-gradient-to-r from-red/85 to-amber/75 py-3 font-mono text-[0.75rem] uppercase tracking-[0.32em] text-[#d6e3e0]"
          >
            Authenticate
          </button>
        </form>
        {submitted ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0d0f]/80 text-center font-mono text-[0.7rem] uppercase tracking-[0.32em] text-cyan">
            <span className="text-sm font-semibold tracking-[0.42em] text-[#d6e3e0]">Access Granted</span>
            <span>Routing back to console…</span>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export default CredentialOverlay;
