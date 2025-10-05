import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import AmbientChrome from './AmbientChrome';
import CredentialPane from './CredentialPane';
import Traces, { Trace } from './Traces';
import useReducedMotion from '../../hooks/useReducedMotion';
import '../../styles/splash.css';
import { FuiCorner, FuiReticle } from '@/components/fui';

type UnifiedSplashProps = {
  onProceed: () => void;
};

const AUTH_DURATION = 650;
const PROCEED_DELAY = 720;

const defaultTraces: Trace[] = [
  { from: 'right', len: 110, bend: 60, accent: 'amber', signal: true },
  { from: 'bottom', len: 90, bend: 48, accent: 'cyan' },
  { from: 'top', len: 80, bend: 52, accent: 'red', signal: true },
];

export default function UnifiedSplash({ onProceed }: UnifiedSplashProps) {
  const reducedMotion = useReducedMotion();
  const [authing, setAuthing] = useState(false);
  const [granted, setGranted] = useState(false);
  const timers = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const subtitleId = useId();

  const cleanupTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => cleanupTimers, [cleanupTimers]);

  const handleAuthenticate = useCallback(() => {
    if (authing || granted) return;

    setAuthing(true);

    if (reducedMotion) {
      setGranted(true);
      setAuthing(false);
      const proceedTimer = window.setTimeout(() => {
        onProceed();
      }, PROCEED_DELAY);
      timers.current.push(proceedTimer);
      return;
    }

    const grantTimer = window.setTimeout(() => {
      setAuthing(false);
      setGranted(true);
      const proceedTimer = window.setTimeout(() => {
        onProceed();
      }, PROCEED_DELAY);
      timers.current.push(proceedTimer);
    }, AUTH_DURATION);

    timers.current.push(grantTimer);
  }, [authing, granted, onProceed, reducedMotion]);

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

    const focusables = node.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])');
    if (focusables.length) {
      focusables[0].focus();
    }
  }, []);

  const splashClass = useMemo(() => {
    const classes = ['unified-splash'];
    if (granted) classes.push('is-granted');
    return classes.join(' ');
  }, [granted]);

  return (
    <div
      className={splashClass}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
      ref={containerRef}
    >
      <AmbientChrome reducedMotion={reducedMotion} />
      <div className="unified-splash__content">
        <div className="unified-splash__paneWrap">
          <Traces traces={defaultTraces} reducedMotion={reducedMotion} />
          <div className="relative">
            <FuiReticle mode="fine" tone="cyan" className="fui-splash-reticle" />
            <FuiCorner tone="cyan" inset={10} className="fui-splash-corners" />
            <CredentialPane
              authing={authing}
              granted={granted}
              reducedMotion={reducedMotion}
              onAuthenticate={handleAuthenticate}
              titleId={titleId}
              subtitleId={subtitleId}
            />
          </div>
          <div className="unified-splash__ticks" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
