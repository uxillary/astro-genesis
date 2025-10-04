import { lazy, Suspense } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import GridBg from './components/GridBg';

const Home = lazy(() => import('./routes/Home'));
const Paper = lazy(() => import('./routes/Paper'));

const App = () => {
  return (
    <div className="min-h-screen bg-background text-slate-100 relative overflow-hidden">
      <GridBg />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-6 py-4 border-b border-white/10 backdrop-blur-sm bg-black/40 flex items-center justify-between uppercase tracking-[0.3em] text-xs text-slate-300">
          <span>CLASSIFIED ACCESS // EARTH SCIENCE DIVISION</span>
          <nav className="flex gap-4 text-[0.6rem]">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors duration-200 ${isActive ? 'text-accent-cyan' : 'text-slate-400 hover:text-slate-200'}`
              }
              end
            >
              Archive
            </NavLink>
          </nav>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-6">
          <Suspense fallback={<div className="animate-pulse text-slate-400">Loading dossier…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/paper/:id" element={<Paper />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="px-6 py-3 text-[0.55rem] tracking-[0.2em] uppercase text-slate-500 border-t border-white/5">
          Signal integrity nominal // Offline-ready archive
        </footer>
      </div>
    </div>
  );
};

export default App;
