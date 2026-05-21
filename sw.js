const CACHE_NAME = 'ab-kill-cache-v21';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));

      await self.clients.claim();

      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      clientsList.forEach(client => {
        client.navigate(client.url);
      });
    })()
  );
});

self.addEventListener('fetch', event => {
  return;
});