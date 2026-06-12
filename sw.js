const CACHE_NAME = 'ab-no-cache-v25-coach-clean-01';

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
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  const mustGoNetwork =
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/coach' ||
    url.pathname === '/coach.html' ||
    url.pathname === '/admin-mobile' ||
    url.pathname === '/admin-mobile.html' ||
    url.pathname === '/cliente' ||
    url.pathname === '/cliente.html' ||
    url.pathname === '/admin' ||
    url.pathname === '/admin.html' ||
    url.pathname === '/auth.js' ||
    url.pathname === '/sw.js' ||
    url.pathname === '/manifest.json';

  if (mustGoNetwork) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
    );
    return;
  }

  return;
});

self.addEventListener('push', event => {
  if (!event.data) return;

  let d = {};

  try {
    d = event.data.json();
  } catch (err) {
    d = {
      title: 'AB SYSTEM',
      body: event.data.text() || ''
    };
  }

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
    ? 'https://absystem.app/cliente?v=push-client-01'
    : 'https://absystem.app/coach?v=push-coach-clean-01';

  const PAGE = isClient ? '/cliente' : '/coach';

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
