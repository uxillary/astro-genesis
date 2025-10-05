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
      <a
        href="#main-content"
        className="skip-link fixed left-4 top-4 z-[999] -translate-y-16 rounded-full border border-[rgba(0,179,255,0.45)] bg-[rgba(8,16,22,0.96)] px-5 py-2 font-meta text-[0.72rem] tracking-[0.24em] text-[color:var(--white)] shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(4,8,12,0.85)] sm:hover:-translate-y-14 sm:hover:opacity-80"
      >
        Skip to mission console
      </a>
      <GridBg />
      <InstallPrompt />
      <HelpOverlay open={showHelp} onClose={() => setHelp(false)} />
      <CredentialOverlay open={credentialOpen} onClose={() => setCredential(false)} />
      <div className="parallax-grid" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="layered-panel relative mx-6 mt-6 overflow-hidden rounded-2xl border border-[rgba(26,31,36,0.6)] bg-[rgba(10,15,20,0.92)] px-6 py-5 text-[var(--white)] shadow-[0_22px_60px_rgba(0,0,0,0.42)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(0,179,255,0.18),_transparent_58%)] before:opacity-80 after:pointer-events-none after:absolute after:inset-x-6 after:top-0 after:h-px after:bg-gradient-to-r after:from-[rgba(0,179,255,0.35)] after:via-[rgba(85,230,165,0.4)] after:to-[rgba(0,179,255,0.35)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <Link
                to="/"
                className="group relative rounded-xl border border-[rgba(32,42,50,0.65)] bg-[rgba(13,20,26,0.95)] px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-2)]"
                aria-label="Return to AstroGenesis home"
              >
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,_rgba(0,179,255,0.22),_transparent_68%)] transition-opacity group-hover:opacity-90" />
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
              <nav className="flex gap-2 font-meta text-[0.78rem] tracking-[0.22em] text-[color:var(--passive)]" aria-label="Primary navigation">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `panel-hover relative overflow-hidden rounded-full border px-4 py-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-2)] ${
                      isActive
                        ? 'border-[rgba(85,230,165,0.4)] bg-[rgba(20,35,40,0.92)] text-[color:var(--accent-1)] shadow-[0_0_24px_rgba(85,230,165,0.35)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_rgba(85,230,165,0.2),_transparent_72%)] before:opacity-80 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-4/5 after:-translate-x-1/2 after:rounded-full after:bg-gradient-to-r after:from-[rgba(85,230,165,0.5)] after:via-[rgba(255,255,255,0.45)] after:to-[rgba(85,230,165,0.5)]'
                        : 'border-transparent bg-[rgba(12,18,24,0.6)] hover:border-[rgba(0,179,255,0.35)] hover:text-[color:var(--white)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_rgba(0,179,255,0.12),_transparent_75%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100'
                    }`
                  }
                  end
                >
                  <span className="relative z-10">Dossiers</span>
                </NavLink>
                <NavLink
                  to="/tactical"
                  className={({ isActive }) =>
                    `panel-hover relative overflow-hidden rounded-full border px-4 py-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-2)] ${
                      isActive
                        ? 'border-[rgba(0,179,255,0.4)] bg-[rgba(16,28,36,0.92)] text-[color:var(--accent-2)] shadow-[0_0_24px_rgba(0,179,255,0.35)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_rgba(0,179,255,0.22),_transparent_72%)] before:opacity-90 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-4/5 after:-translate-x-1/2 after:rounded-full after:bg-gradient-to-r after:from-[rgba(0,179,255,0.55)] after:via-[rgba(255,255,255,0.35)] after:to-[rgba(0,179,255,0.55)]'
                        : 'border-transparent bg-[rgba(12,18,24,0.6)] hover:border-[rgba(85,230,165,0.35)] hover:text-[color:var(--white)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_rgba(85,230,165,0.12),_transparent_75%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100'
                    }`
                  }
                >
                  <span className="relative z-10">Tactical</span>
                </NavLink>
              </nav>
              <button
                type="button"
                className="panel-hover relative overflow-hidden rounded-full border border-[rgba(36,48,58,0.6)] bg-[rgba(15,24,32,0.85)] px-5 py-2 font-meta text-[0.78rem] tracking-[0.22em] text-[color:var(--mid)] transition-colors hover:text-[color:var(--white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-2)]"
                onClick={() => toggleMode()}
                aria-pressed={mode === 'mono'}
              >
                <span className="relative z-10">{mode === 'hud' ? 'Switch to Mono' : 'Switch to HUD'}</span>
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ${
                    mode === 'mono'
                      ? 'bg-[radial-gradient(circle_at_center,_rgba(85,230,165,0.22),_transparent_70%)] opacity-100'
                      : 'bg-[radial-gradient(circle_at_center,_rgba(0,179,255,0.18),_transparent_72%)]'
                  }`}
                />
              </button>
            </div>
          </div>
        </header>
        <BiosignalPulse className="mx-6 mt-4" />
        <main
          id="main-content"
          tabIndex={-1}
          className="relative flex-1 overflow-hidden rounded-t-3xl border-t border-[rgba(26,31,36,0.55)] bg-[linear-gradient(180deg,rgba(12,18,24,0.85),rgba(10,14,20,0.95))] px-6 pb-10 pt-6 before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-[radial-gradient(circle,_rgba(255,255,255,0.18),_transparent_70%)]"
        >
          <Suspense fallback={<div className="font-meta animate-pulse text-[color:var(--mid)]">Initializing dossier feed…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/paper/:id" element={<Paper />} />
              <Route path="/tactical" element={<Tactical />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="relative mx-6 mb-6 overflow-hidden rounded-xl border border-[rgba(26,31,36,0.55)] bg-[rgba(9,14,18,0.85)] px-6 py-4 font-meta text-[0.72rem] tracking-[0.22em] text-[color:var(--passive)] before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-[rgba(0,179,255,0.28)] before:via-transparent before:to-[rgba(85,230,165,0.3)] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_bottom,_rgba(0,179,255,0.08),_transparent_70%)]">
          Signal integrity nominal // Press C for credentials · Press ? for help overlay
        </footer>
      </div>
    </div>
  );
};

export default App;
