
const CACHE_NAME = 'hdfc-money-v7';
const RUNTIME_CACHE = 'hdfc-runtime-v7';

// Core assets to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.tsx', // Entry point
  '/manifest.json',
  '/icon.png',
  // External Dependencies from importmap
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://aistudiocdn.com/html2canvas@^1.4.1',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/',
  'https://aistudiocdn.com/lucide-react@^0.555.0',
  'https://aistudiocdn.com/@google/genai@^1.30.0',
  'https://aistudiocdn.com/react-router-dom@^7.9.6',
  'https://aistudiocdn.com/react-webcam@^7.2.0',
  'https://aistudiocdn.com/jsqr@^1.4.0'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Attempt to cache all, but don't fail entire install if one fails (except core)
        // We iterate and fetch individually to be robust
        const cachePromises = PRECACHE_URLS.map(async (url) => {
            try {
                const req = new Request(url, { mode: 'cors' });
                const response = await fetch(req);
                if (response.ok) {
                    return cache.put(req, response);
                }
            } catch (error) {
                console.warn('Pre-caching failed for:', url, error);
            }
        });
        return Promise.all(cachePromises);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation Requests (HTML) - Network First, Fallback to Cache
  // We use Network First for HTML to ensure updates are seen, but fallback to cache for offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
           return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
           });
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. Runtime Caching for Assets (Stale-While-Revalidate)
  // This ensures we return the cached version fast, but update it in the background
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Cache valid responses
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
           // Network failed
           console.log('Offline fetch failed:', event.request.url);
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
