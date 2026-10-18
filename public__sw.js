const CACHE_NAME = 'zakir-smart-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/pdf.min.js',
  '/pdf.worker.min.js',
];

// Install: precache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('Pre-cache partial error:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Network first with Cache fallback for app shell and assets
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip non-GET requests and API calls from cache
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful responses for assets
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (request.url.includes('.js') ||
            request.url.includes('.css') ||
            request.url.includes('.png') ||
            request.url.includes('.svg') ||
            request.url.includes('fonts.gstatic.com'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // If offline, serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Return root page if navigating
        if (request.mode === 'navigate') {
          return caches.match('/');
        }

        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});
