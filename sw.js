const CACHE_NAME = 'ab-system-v9';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/cliente.html',
  '/admin.html',
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
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // Para páginas HTML: primero red, luego caché.
  if (
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached => cached || caches.match('/'))
        )
    );
    return;
  }

  // Para assets: primero caché, luego red.
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