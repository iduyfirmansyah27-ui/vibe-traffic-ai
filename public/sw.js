self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Cache-first for same-origin static assets
  if (url.origin === location.origin) {
    e.respondWith(
      caches.open('vt-static-v1').then(async (cache) => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        const resp = await fetch(e.request);
        if (resp.ok && (e.request.destination === 'script' || e.request.destination === 'style' || e.request.destination === 'image' || url.pathname.endsWith('.webmanifest'))) {
          cache.put(e.request, resp.clone());
        }
        return resp;
      })
    );
  }
});
