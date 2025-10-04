export const initPwa = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((error) => console.error('SW registration failed', error));
    });
  }
};
