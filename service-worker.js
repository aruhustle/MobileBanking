
const CACHE_NAME = 'hdfc-money-v5';
const RUNTIME_CACHE = 'hdfc-runtime-v5';

// 1. Install Phase: Cache only the absolute essentials we KNOW exist.
// We removed specific .tsx files from here because in production (Vercel), 
// the build process might convert them to .js files with hashes, causing the install to fail.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // External CDNs are stable, so we pre-cache them to speed up first load
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
        // We use a map to handle individual failures gracefully.
        // Even if icon.png is missing, the app should still work offline.
        const cachePromises = PRECACHE_URLS.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return cache.put(url, response);
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
  const url = new URL(event.request.url);

  // 1. Navigation Requests (HTML) - SPA Strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((response) => {
        return response || fetch(event.request).catch(() => caches.match('/index.html'));
      })
    );
    return;
  }

  // 2. Runtime Caching for Assets (JS, CSS, Images, etc.)
  // If it's not a navigation, try to serve from cache, otherwise fetch and cache.
  // This "Stale-While-Revalidate" or "Cache First" hybrid ensures we capture
  // whatever assets the app actually requests during operation.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If found in cache, return it
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch it from network
      return fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic' && networkResponse.type !== 'cors'
        ) {
          return networkResponse;
        }

        // Clone the response because it's a stream and can only be consumed once
        const responseToCache = networkResponse.clone();

        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
         // Network failed and not in cache. 
         // For images, we could return a placeholder here if needed.
         console.log('Fetch failed for', event.request.url);
      });
    })
  );
});
