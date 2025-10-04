/// <reference lib="WebWorker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { withBase } from './lib/paths';

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<any> };

precacheAndRoute(self.__WB_MANIFEST);

const dataPrefix = new URL(withBase('data/'), self.registration.scope).pathname;

registerRoute(
  ({ url }) => url.pathname.startsWith(dataPrefix),
  new StaleWhileRevalidate({
    cacheName: 'bio-data-cache'
  })
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

export {};
