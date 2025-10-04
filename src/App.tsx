import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import GridBg from './components/GridBg';
import InstallPrompt from './components/InstallPrompt';
import HelpOverlay from './components/HelpOverlay';
import CredentialOverlay from './components/CredentialOverlay';
import { useUiStore } from './lib/state';

const Home = lazy(() => import('./routes/Home'));
const Paper = lazy(() => import('./routes/Paper'));
const Tactical = lazy(() => import('./routes/Tactical'));

const App = () => {
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
    <div className="min-h-screen bg-bg text-white relative overflow-hidden">
      <GridBg />
      <InstallPrompt />
      <HelpOverlay open={showHelp} onClose={() => setHelp(false)} />
      <CredentialOverlay open={credentialOpen} onClose={() => setCredential(false)} />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-6 py-4 border-b border-white/10 backdrop-blur-sm bg-black/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full border border-red/60 px-4 py-1 text-[0.55rem] font-mono uppercase tracking-[0.32em] text-red">
                BioArchive Intelligence
              </div>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-dim">
                Offline-first classified ops console
              </span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-4 text-[0.6rem] font-mono uppercase tracking-[0.28em] text-dim">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `rounded-full border px-3 py-1 transition-colors ${
                      isActive ? 'border-amber/70 text-amber' : 'border-transparent hover:text-white/80'
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
                      isActive ? 'border-amber/70 text-amber' : 'border-transparent hover:text-white/80'
                    }`
                  }
                >
                  Tactical
                </NavLink>
              </nav>
              <button
                type="button"
                className="rounded-full border border-white/20 px-4 py-1 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-dim hover:text-white/90"
                onClick={() => toggleMode()}
              >
                {mode === 'hud' ? 'Switch to MONO' : 'Switch to HUD'}
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-8">
          <Suspense fallback={<div className="animate-pulse text-dim">Loading dossier…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/paper/:id" element={<Paper />} />
              <Route path="/tactical" element={<Tactical />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="px-6 py-4 text-[0.55rem] font-mono uppercase tracking-[0.3em] text-dim border-t border-white/10">
          Signal integrity nominal // Press C for credentials · Press ? for help overlay
        </footer>
      </div>
    </div>
  );
};

export default App;
