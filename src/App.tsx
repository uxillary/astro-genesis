import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import GridBg from './components/GridBg';
import InstallPrompt from './components/InstallPrompt';
import HelpOverlay from './components/HelpOverlay';
import CredentialOverlay from './components/CredentialOverlay';
import SplashScreen from './components/SplashScreen';
import { useUiStore } from './lib/state';

const Home = lazy(() => import('./routes/Home'));
const Paper = lazy(() => import('./routes/Paper'));
const Tactical = lazy(() => import('./routes/Tactical'));

const ENTRY_STORAGE_KEY = 'astro-genesis-entered';

const App = () => {
  const [entered, setEntered] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(ENTRY_STORAGE_KEY) === 'true';
    } catch (error) {
      console.warn('Unable to access localStorage', error);
      return false;
    }
  });

  const handleProceed = useCallback(() => {
    try {
      window.localStorage.setItem(ENTRY_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('Unable to persist entry state', error);
    }
    setEntered(true);
  }, []);

  if (!entered) {
    return <SplashScreen onProceed={handleProceed} />;
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
    <div className="relative min-h-screen overflow-hidden bg-bg text-[#d6e3e0]">
      <GridBg />
      <InstallPrompt />
      <HelpOverlay open={showHelp} onClose={() => setHelp(false)} />
      <CredentialOverlay open={credentialOpen} onClose={() => setCredential(false)} />
      <div className="relative z-10 flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-amber/60 focus:bg-[#0b1116]/95 focus:px-5 focus:py-2 focus:font-mono focus:text-[0.7rem] focus:uppercase focus:tracking-[0.32em] focus:text-amber focus:shadow-[0_0_24px_rgba(244,159,66,0.35)]"
        >
          Skip to main content
        </a>
        <header className="px-6 py-4 border-b border-[#1a1f24]/70 bg-[#10161d]/80 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative overflow-hidden rounded-lg border border-[#1f2a33] bg-[#0b1118]/90 px-5 py-3 text-left shadow-[0_0_32px_rgba(9,15,22,0.55)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(85,230,165,0.28),_transparent_65%)]" />
                <div className="relative flex flex-col leading-tight">
                  <span className="font-mono text-[0.52rem] uppercase tracking-[0.5em] text-[#55e6a5]/70">
                    Mission Control // A.G-01
                  </span>
                  <span className="font-semibold uppercase tracking-[0.44em] text-[#f5fbfa] sm:text-[0.95rem]">
                    Astro Genesis
                  </span>
                  <span className="font-mono text-[0.5rem] uppercase tracking-[0.42em] text-[#f66a4d]">
                    Bio Intelligence Archive
                  </span>
                </div>
              </div>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-[#55e6a5]">
                Offline-first classified ops console
              </span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-4 text-[0.68rem] font-mono uppercase tracking-[0.2em] text-[#7a8b94]">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `rounded-full border px-3 py-1 transition-colors ${
                      isActive
                        ? 'border-[#55e6a5]/70 bg-[#142027]/80 text-[#55e6a5] shadow-[0_0_18px_rgba(85,230,165,0.35)]'
                        : 'border-transparent hover:border-[#1a1f24] hover:text-[#d6e3e0]'
                    }`
                  }
                  end
                >
                  Dossiers
                </NavLink>
                <NavLink
                  to="/tactical"
                  className={({ isActive }) =>
                    `rounded-full border px-3 py-1 transition-colors ${
                      isActive
                        ? 'border-[#55e6a5]/70 bg-[#142027]/80 text-[#55e6a5] shadow-[0_0_18px_rgba(85,230,165,0.35)]'
                        : 'border-transparent hover:border-[#1a1f24] hover:text-[#d6e3e0]'
                    }`
                  }
                >
                  Tactical
                </NavLink>
              </nav>
              <button
                type="button"
                className="rounded-full border border-[#1a1f24] bg-[#131d26]/80 px-4 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#7a8b94] shadow-[0_0_22px_rgba(0,0,0,0.45)] transition-colors hover:text-[#d6e3e0]"
                onClick={() => toggleMode()}
              >
                {mode === 'hud' ? 'Switch to MONO' : 'Switch to HUD'}
              </button>
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 sm:px-8 py-8 focus:outline-none">
          <Suspense fallback={<div className="animate-pulse text-dim">Loading dossier…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/paper/:id" element={<Paper />} />
              <Route path="/tactical" element={<Tactical />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="px-6 py-4 border-t border-[#1a1f24]/70 bg-[#0f141a]/80 text-[0.6rem] font-mono uppercase tracking-[0.22em] text-[#7a8b94]">
          Signal integrity nominal // Press C for credentials · Press ? for help overlay
        </footer>
      </div>
    </div>
  );
};

export default App;
