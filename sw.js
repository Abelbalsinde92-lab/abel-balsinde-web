const CACHE_NAME = 'ab-system-v17';

const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await Promise.all(
        STATIC_ASSETS.map(async asset => {
          try {
            const response = await fetch(asset, { cache: 'no-store' });
            if (response.ok) {
              await cache.put(asset, response);
            }
          } catch (err) {
            console.warn('No se pudo cachear:', asset);
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  const isHtmlNavigation =
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html');

  const noCachePaths = [
    '/',
    '/index',
    '/index.html',
    '/cliente',
    '/cliente.html',
    '/cliente-sr',
    '/cliente-sr.html',
    '/admin',
    '/admin.html',
    '/auth.js',
    '/sw.js'
  ];

  if (isHtmlNavigation || noCachePaths.includes(path)) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => {
        return new Response(
          '<h1>Sin conexión</h1><p>Actualiza cuando tengas internet.</p>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then(response => {
        if (!response || !response.ok) return response;

        const responseClone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});