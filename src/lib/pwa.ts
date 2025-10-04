import { withBase } from './paths';

export const initPwa = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = withBase('sw.js');
      navigator.serviceWorker
        .register(swUrl)
        .catch((error) => console.error('SW registration failed', error));
    });
  }
};
