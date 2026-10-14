// public/sw.js - Service Worker for Dapoer Thatha POS Offline-First

const CACHE_NAME = 'dapoer-thatha-pos-v2';

const STATIC_ASSETS = [
  '/',
  '/pos',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/globals.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan cache jika development localhost, request API, WebSocket, atau chrome extensions
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.startsWith('/api/') ||
    request.method !== 'GET' ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  // Stale-while-revalidate untuk static assets (JS chunks, CSS, fonts, images)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|woff|woff2)$/)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Network-first untuk halaman HTML (/pos, dsb), fallback ke cache jika offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedPage = await cache.match(request);
          if (cachedPage) return cachedPage;

          // Fallback ke /pos yang ter-cache
          const posFallback = await cache.match('/pos');
          if (posFallback) return posFallback;

          return new Response('Anda sedang offline. Buka aplikasi yang sudah ter-cache.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
  }
});
