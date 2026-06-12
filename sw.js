const CACHE_NAME = 'ab-kill-cache-v24';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  const isHtml =
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('sw.js');

  if (isHtml) {
    event.respondWith(fetch(event.request, { cache: 'reload' }));
    return;
  }

  return;
});

self.addEventListener('push', event => {
  if (!event.data) return;
  const d = event.data.json();

  event.waitUntil(
    self.registration.showNotification(d.title || 'AB SYSTEM', {
      body: d.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: d.tag || 'ab-notif',
      data: d.data || {},
      actions: d.actions || [],
      vibrate: [200, 100, 200],
      requireInteraction: d.urgent || false
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  const isClient = data.target === 'client';
  const APP_URL = isClient
    ? 'https://absystem.app/cliente.html'
    : 'https://absystem.app/admin-mobile.html';

  const PAGE = isClient ? 'cliente.html' : 'admin-mobile.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(cls => {
        const existing = cls.find(c => c.url.includes(PAGE));
        if (existing) {
          existing.postMessage({ action, data });
          return existing.focus();
        }
        return clients.openWindow(APP_URL);
      })
  );
});
