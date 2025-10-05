import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import DeconstructedStack from './DeconstructedStack';
import PerspectiveTrack from './PerspectiveTrack';
import CredentialPane from './CredentialPane';
import useParallax from '../../hooks/useParallax';
import useReducedMotion from '../../hooks/useReducedMotion';
import '../../styles/splash.css';

type Props = {
  onProceed: () => void;
};

const AUTH_DELAY = 950;
const PROCEED_DELAY = 700;

const stackLayers = [
  { label: 'INDEX' },
  { label: 'CACHE' },
  { label: 'SEARCH' },
  { label: 'BRANCH MAP' },
  { label: 'PANELS' },
  { label: 'RELAY CORE' },
];

const trackCards = [
  { id: 'scan', label: 'SCAN TYPE // AUTO', accent: 'amber' as const },
  { id: 'dossier-1', label: 'DOSSIER // EXP_001', accent: 'cyan' as const },
  { id: 'dossier-2', label: 'DOSSIER // EXP_002', accent: 'cyan' as const },
  { id: 'branch', label: 'BRANCH MAP // CLUSTER_09', accent: 'red' as const },
  { id: 'panels', label: 'PANEL HUD // ROUTE_04', accent: 'cyan' as const },
];

export default function SplashScreen({ onProceed }: Props) {
  const reducedMotion = useReducedMotion();
  const [authing, setAuthing] = useState(false);
  const [granted, setGranted] = useState(false);
  const timers = useRef<number[]>([]);
  const titleId = useId();
  const subtitleId = useId();

  const leftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useParallax(leftRef, 6);
  useParallax(centerRef, 4);
  useParallax(rightRef, 8);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  const proceed = useCallback(() => {
    onProceed();
  }, [onProceed]);

  const handleAuthenticate = useCallback(() => {
    if (authing) return;
    setAuthing(true);

    if (reducedMotion) {
      setGranted(true);
      const quickTimer = window.setTimeout(() => {
        proceed();
      }, 200);
      timers.current.push(quickTimer);
      return;
    }

    const authTimer = window.setTimeout(() => {
      setGranted(true);
      const proceedTimer = window.setTimeout(() => {
        proceed();
      }, PROCEED_DELAY);
      timers.current.push(proceedTimer);
    }, AUTH_DELAY);

    timers.current.push(authTimer);
  }, [authing, proceed, reducedMotion]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleAuthenticate();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleAuthenticate]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = node.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (!active || active === first || !node.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const gridClass = useMemo(() => {
    const classes = ['splash-grid-shell'];
    if (granted) classes.push('is-granted');
    return classes.join(' ');
  }, [granted]);

  return (
    <div
      className="splash-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
      ref={containerRef}
    >
      <div className="splash-gradient" aria-hidden="true" />
      <div className="splash-dot-grid" aria-hidden="true" />
      <div className={`splash-overlay${reducedMotion ? ' is-reduced' : ''}`} aria-hidden="true" />
      <div className="splash-vignette" aria-hidden="true" />
      <div className={gridClass}>
        <div className="splash-column" ref={leftRef}>
          <DeconstructedStack layers={stackLayers} reducedMotion={reducedMotion} />
        </div>
        <div className="splash-column center" ref={centerRef}>
          <CredentialPane
            authing={authing}
            granted={granted}
            reducedMotion={reducedMotion}
            onAuthenticate={handleAuthenticate}
            titleId={titleId}
            subtitleId={subtitleId}
          />
        </div>
        <div className="splash-column" ref={rightRef}>
          <PerspectiveTrack cards={trackCards} activeIndex={0} reducedMotion={reducedMotion} />
        </div>
      </div>
    </div>
  );
}
