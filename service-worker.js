
const CACHE_NAME = 'hdfc-money-v9';
const RUNTIME_CACHE = 'hdfc-runtime-v9';

// Core assets to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon.png',
  // External Dependencies
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://aistudiocdn.com/html2canvas@^1.4.1',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/',
  'https://aistudiocdn.com/lucide-react@^0.555.0',
  'https://aistudiocdn.com/@google/genai@^1.30.0',
  'https://aistudiocdn.com/react-router-dom@^7.9.6',
  'https://aistudiocdn.com/react-webcam@^7.2.0',
  'https://aistudiocdn.com/jsqr@^1.4.0',
  // Local Modules (App logic)
  '/App',
  '/types',
  '/utils/upiParser',
  '/utils/historyManager',
  '/utils/authManager',
  '/utils/reminderManager',
  '/utils/billManager',
  '/utils/aiSupport',
  '/components/Button',
  '/components/Header',
  '/pages/Home',
  '/pages/Scan',
  '/pages/ConfirmPayment',
  '/pages/Result',
  '/pages/ManualEntry',
  '/pages/History',
  '/pages/Profile',
  '/pages/Support',
  '/pages/ChatSupport',
  '/pages/Login',
  '/pages/Signup',
  '/pages/Reminders',
  '/pages/BillPayments',
  '/pages/BankTransfer'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
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

  // Bypass service worker logic for ping checks
  if (url.searchParams.has('_ping')) {
    return; 
  }

  // 1. Navigation Requests (HTML) - Network First, Fallback to Cache
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

  // 2. Asset Requests (Stale-While-Revalidate Strategy)
  // Check ALL caches (Precache + Runtime) first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Fetch from network to update cache in background (Stale-while-revalidate)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache valid responses
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
           const responseToCache = networkResponse.clone();
           caches.open(RUNTIME_CACHE).then((cache) => {
             cache.put(event.request, responseToCache);
           });
        }
        return networkResponse;
      }).catch((err) => {
         // Network failed, handled by returning cachedResponse below or erroring if empty
         // console.log('Offline fetch failed:', event.request.url);
      });

      // Return cached response immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
