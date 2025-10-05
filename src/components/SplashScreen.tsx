import { useCallback, useEffect, useRef, useState } from 'react';

type Props = { onProceed: () => void };

const AUTH_DELAY = 900;
const PROCEED_DELAY = 700;

export default function SplashScreen({ onProceed }: Props) {
  const [authing, setAuthing] = useState(false);
  const [granted, setGranted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(updatePreference);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updatePreference);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(updatePreference);
      }
    };
  }, []);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  const handleAuth = useCallback(() => {
    if (authing) return;
    setAuthing(true);

    if (prefersReducedMotion) {
      setGranted(true);
      onProceed();
      return;
    }

    const authTimer = window.setTimeout(() => {
      setGranted(true);
      const proceedTimer = window.setTimeout(() => {
        onProceed();
      }, PROCEED_DELAY);
      timers.current.push(proceedTimer);
    }, AUTH_DELAY);
    timers.current.push(authTimer);
  }, [authing, onProceed, prefersReducedMotion]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'enter') {
        event.preventDefault();
        handleAuth();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleAuth]);

  useEffect(() => {
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, []);

  return (
    <div className="splash-wrap" ref={containerRef} role="dialog" aria-modal="true" aria-labelledby="splash-title">
      <div className="splash-noise" aria-hidden="true" />
      <div className="splash-grid" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <div className="corner corner-tl" aria-hidden="true" />
      <div className="corner corner-tr" aria-hidden="true" />
      <div className="corner corner-bl" aria-hidden="true" />
      <div className="corner corner-br" aria-hidden="true" />

      <div className="crosshair" aria-hidden="true">
        <span className="crosshair-line horizontal" />
        <span className="crosshair-line vertical" />
        <span className="crosshair-ring" />
        <span className="crosshair-glyph" />
      </div>

      <div className="frame-bounds" aria-hidden="true">
        <span className="frame-horizontal top" />
        <span className="frame-horizontal bottom" />
        <span className="frame-vertical left" />
        <span className="frame-vertical right" />
      </div>

      <div className="pane">
        <div className="pane-glow" aria-hidden="true" />
        <div className="pane-scan" aria-hidden="true" />
        <div className="pane-inner" aria-live="polite">
          <div className="pane-header" aria-hidden="true">
            <span className="tag">A.G BIOSCIENCE ARCHIVE</span>
            <span className="tag id">NODE AG-223</span>
          </div>
          <p className="eyebrow">SUBMIT SECURITY CREDENTIALS</p>

          {!granted ? (
            <>
              <h1 className="title" id="splash-title">
                <span className={authing ? 'blink' : ''}>CLASSIFIED</span>
              </h1>
              <p className="sub" id="splash-subtitle">
                PERSONNEL ONLY // ACCESS LEVEL: ALPHA
              </p>

              <button
                ref={buttonRef}
                className={`auth-btn ${authing ? 'is-busy' : ''}`}
                onClick={handleAuth}
                aria-label="Authenticate and enter"
                aria-describedby="splash-subtitle"
              >
                {authing ? 'VERIFYING…' : 'AUTHENTICATE'}
              </button>
              <p className="hint">Press ENTER</p>
            </>
          ) : (
            <>
              <h1 className="title granted" id="splash-title">
                ACCESS GRANTED
              </h1>
              <p className="sub ok">IDENTITY CONFIRMED // ROUTING…</p>
            </>
          )}

          <div className="pane-footer" aria-hidden="true">
            <span className="footer-label">TRANSMISSION CHANNEL</span>
            <span className="footer-status">A.G // SECURE-LINK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
