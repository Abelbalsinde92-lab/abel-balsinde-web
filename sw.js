const CACHE_NAME = 'ab-system-v16';

const STATIC_ASSETS = [
  '/manifest.json',
  '/hero-ab-system.png.PNG',
  '/hero-gym-red.jpeg',
  '/abel-lucha-bw.jpg',
  '/ab-system-logo.png.PNG',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

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
      return cachedResponse || fetch(request).then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        return response;
      });
    })
  );
});