import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import GridBg from './components/GridBg';
import BiosignalPulse from './components/BiosignalPulse';
import InstallPrompt from './components/InstallPrompt';
import HelpOverlay from './components/HelpOverlay';
import CredentialOverlay from './components/CredentialOverlay';
import UnifiedSplash from './components/splash/UnifiedSplash';
import { useUiStore } from './lib/state';

const Home = lazy(() => import('./routes/Home'));
const Paper = lazy(() => import('./routes/Paper'));
const Tactical = lazy(() => import('./routes/Tactical'));

const ENTRY_STORAGE_KEY = 'astro-genesis-entered';

const App = () => {
  const [entered, setEntered] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem(ENTRY_STORAGE_KEY);
      return stored === '1' || stored === 'true';
    } catch (error) {
      console.warn('Unable to access localStorage', error);
      return false;
    }
  });

  const handleProceed = useCallback(() => {
    try {
      window.localStorage.setItem(ENTRY_STORAGE_KEY, '1');
    } catch (error) {
      console.warn('Unable to persist entry state', error);
    }
    setEntered(true);
  }, []);

  if (!entered) {
    return <UnifiedSplash onProceed={handleProceed} />;
  }

  return <AppContent />;
};

const AppContent = () => {
  const mode = useUiStore((state) => state.mode);
  const toggleMode = useUiStore((state) => state.toggleMode);
  const showHelp = useUiStore((state) => state.showHelp);
  const setHelp = useUiStore((state) => state.setHelp);
  const credentialOpen = useUiStore((state) => state.credentialOpen);
  const setCredential = useUiStore((state) => state.setCredential);
  const location = useLocation();

  useEffect(() => {
    if (mode === 'mono') {
      document.body.setAttribute('data-mode', 'mono');
    } else {
      document.body.removeAttribute('data-mode');
    }
  }, [mode]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        setCredential(true);
      }
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        setHelp(!showHelp);
      }
      if (event.key === 'Escape') {
        setCredential(false);
        setHelp(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setCredential, setHelp, showHelp]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-[var(--white)]">
      <GridBg />
      <InstallPrompt />
      <HelpOverlay open={showHelp} onClose={() => setHelp(false)} />
      <CredentialOverlay open={credentialOpen} onClose={() => setCredential(false)} />
      <div className="parallax-grid" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="layered-panel mx-6 mt-6 border border-[rgba(26,31,36,0.6)] bg-[rgba(10,15,20,0.92)] px-6 py-5 text-[var(--white)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <Link
                to="/"
                className="group relative rounded-[6px] border border-[rgba(32,42,50,0.65)] bg-[rgba(13,20,26,0.95)] px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-2)]"
                aria-label="Return to AstroGenesis home"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[6px] bg-[radial-gradient(circle_at_top,_rgba(0,179,255,0.22),_transparent_68%)] transition-opacity group-hover:opacity-90" />
                <div className="relative flex flex-col gap-1">
                  <span className="font-meta text-[0.7rem] tracking-[0.32em] text-[color:var(--accent-2)]/75 normal-case">Mission Control // A.G-01</span>
                  <span className="font-display text-[1.45rem] tracking-[0.32em] text-[var(--white)] transition-colors group-hover:text-[color:var(--accent-2)]">
                    AstroGenesis
                  </span>
                  <span className="font-meta text-[0.72rem] tracking-[0.32em] text-[rgba(255,59,59,0.82)] normal-case">Bio-Intelligence Archive</span>
                </div>
              </Link>
              <div className="max-w-sm space-y-1">
                <p className="font-meta text-[0.8rem] tracking-[0.22em] text-[color:var(--accent-1)]">Offline-first classified ops console</p>
                <p className="font-body text-sm text-[color:var(--mid)]">Reconstruct live transmissions across NASA bioscience missions with layered telemetry, analyst intelligence, and immersive briefing cues.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <nav className="flex gap-2 font-meta text-[0.78rem] tracking-[0.22em] text-[color:var(--passive)]">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `panel-hover rounded-full border px-4 py-1.5 transition-all ${
                      isActive
                        ? 'border-[rgba(85,230,165,0.4)] bg-[rgba(20,35,40,0.92)] text-[color:var(--accent-1)] shadow-[0_0_24px_rgba(85,230,165,0.35)]'
                        : 'border-transparent bg-[rgba(12,18,24,0.6)] hover:border-[rgba(0,179,255,0.35)] hover:text-[color:var(--white)]'
                    }`
                  }
                  end
                >
                  Dossiers
                </NavLink>
                <NavLink
                  to="/tactical"
                  className={({ isActive }) =>
                    `panel-hover rounded-full border px-4 py-1.5 transition-all ${
                      isActive
                        ? 'border-[rgba(0,179,255,0.4)] bg-[rgba(16,28,36,0.92)] text-[color:var(--accent-2)] shadow-[0_0_24px_rgba(0,179,255,0.35)]'
                        : 'border-transparent bg-[rgba(12,18,24,0.6)] hover:border-[rgba(85,230,165,0.35)] hover:text-[color:var(--white)]'
                    }`
                  }
                >
                  Tactical
                </NavLink>
              </nav>
              <button
                type="button"
                className="panel-hover rounded-full border border-[rgba(36,48,58,0.6)] bg-[rgba(15,24,32,0.85)] px-5 py-2 font-meta text-[0.78rem] tracking-[0.22em] text-[color:var(--mid)] transition-colors hover:text-[color:var(--white)]"
                onClick={() => toggleMode()}
              >
                {mode === 'hud' ? 'Switch to Mono' : 'Switch to HUD'}
              </button>
            </div>
          </div>
        </header>
        <BiosignalPulse className="mx-6 mt-4" />
        <main className="flex-1 px-6 pb-10 pt-4">
          <Suspense fallback={<div className="font-meta animate-pulse text-[color:var(--mid)]">Initializing dossier feed…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/paper/:id" element={<Paper />} />
              <Route path="/tactical" element={<Tactical />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="mx-6 mb-6 rounded-[6px] border border-[rgba(26,31,36,0.55)] bg-[rgba(9,14,18,0.85)] px-6 py-4 font-meta text-[0.72rem] tracking-[0.22em] text-[color:var(--passive)]">
          Signal integrity nominal // Press C for credentials · Press ? for help overlay
        </footer>
      </div>
    </div>
  );
};

export default App;
