import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const InstallPrompt = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !promptEvent) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-30 flex w-[min(420px,90vw)] -translate-x-1/2 items-center justify-between gap-4 rounded-[22px] border border-[#d6e3e0]/15 bg-panel/85 px-5 py-4 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#d6e3e0] shadow-panel">
      <span>Install BioArchive Intelligence for offline deployment?</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-[#d6e3e0]/20 px-3 py-1 text-dim hover:text-[#d6e3e0]"
          onClick={() => setVisible(false)}
        >
          Dismiss
        </button>
        <button
          type="button"
          className="rounded-full border border-amber/60 bg-amber/10 px-3 py-1 text-amber"
          onClick={async () => {
            await promptEvent.prompt();
            setVisible(false);
            setPromptEvent(null);
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
