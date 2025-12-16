
const CACHE_NAME = 'hdfc-money-v1';
const DYNAMIC_CACHE = 'hdfc-dynamic-v1';

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon.png'
];

// Install Event: Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network First, falling back to Cache for HTML/JS
// Stale-while-revalidate for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle external CDNs (imports)
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Cache valid responses only
            if(response.status === 200) {
                cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // App Shell Strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
