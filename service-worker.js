
const CACHE_NAME = 'hdfc-money-v10';
const RUNTIME_CACHE = 'hdfc-runtime-v10';

// Core assets to cache immediately
// NOTE: We include extensions (.tsx, .ts) to match the actual file system
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
  // Local Modules (App logic) - explicitly caching with extensions
  '/App.tsx',
  '/utils/upiParser.ts',
  '/utils/historyManager.ts',
  '/utils/authManager.ts',
  '/utils/reminderManager.ts',
  '/utils/billManager.ts',
  '/utils/aiSupport.ts',
  '/components/Button.tsx',
  '/components/Header.tsx',
  '/pages/Home.tsx',
  '/pages/Scan.tsx',
  '/pages/ConfirmPayment.tsx',
  '/pages/Result.tsx',
  '/pages/ManualEntry.tsx',
  '/pages/History.tsx',
  '/pages/Profile.tsx',
  '/pages/Support.tsx',
  '/pages/ChatSupport.tsx',
  '/pages/Login.tsx',
  '/pages/Signup.tsx',
  '/pages/Reminders.tsx',
  '/pages/BillPayments.tsx',
  '/pages/BankTransfer.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // We wrap each fetch in a catch so one failure doesn't stop the whole installation
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

  // 1. Navigation Requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2. Asset Requests with Smart Extension Matching
  event.respondWith(
    (async () => {
      // Try to find the exact request in cache
      const exactMatch = await caches.match(event.request);
      if (exactMatch) return exactMatch;

      // If exact match fails, try appending extensions (for extension-less imports)
      // e.g. request for '/App' looks for cached '/App.tsx'
      if (!url.pathname.includes('.')) {
         const tsxMatch = await caches.match(url.pathname + '.tsx');
         if (tsxMatch) return tsxMatch;
         
         const tsMatch = await caches.match(url.pathname + '.ts');
         if (tsMatch) return tsMatch;
      }

      // If not in cache, try network
      try {
        const networkResponse = await fetch(event.request);
        // Save to runtime cache if successful
        if (networkResponse && networkResponse.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // Network failed and not in cache
        // console.log('Fetch failed:', event.request.url);
        // Return undefined, allowing browser to handle error
      }
    })()
  );
});
