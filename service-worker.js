const CACHE_NAME = 'my-pwa-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/url-store.js',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(responseFromCache => {
        if (responseFromCache) {
          return responseFromCache;
        }

        return fetch(event.request)
          .then(responseFromNetwork => {
            if (!responseFromNetwork || responseFromNetwork.status !== 200) {
              return responseFromNetwork;
            }

            const responseClone = responseFromNetwork.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));

            return responseFromNetwork;
          })
          .catch(() => {
            return caches.match(event.request)
              .then(fallback => fallback || new Response('Offline', { status: 408 }));
          });
      })
  );
});
