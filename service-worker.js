
const CACHE_NAME = 'hdfc-money-v12';
const RUNTIME_CACHE = 'hdfc-runtime-v12';

// Core assets to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon.png',
  // External Dependencies - Exact Import Map Matches
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://aistudiocdn.com/html2canvas@^1.4.1',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react@^19.2.0/jsx-runtime', // Potentially used by transpiler
  'https://aistudiocdn.com/react-dom@^19.2.0/',
  'https://aistudiocdn.com/react-dom@^19.2.0/client', // Critical for index.tsx startup
  'https://aistudiocdn.com/lucide-react@^0.555.0',
  'https://aistudiocdn.com/@google/genai@^1.30.0',
  'https://aistudiocdn.com/react-router-dom@^7.9.6',
  'https://aistudiocdn.com/react-webcam@^7.2.0',
  'https://aistudiocdn.com/jsqr@^1.4.0',
  // Local Modules (App logic)
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
        const cachePromises = PRECACHE_URLS.map(async (url) => {
            try {
                // Using no-cors for generic CDNs to avoid opaque response issues if they don't support CORS (though these usually do)
                // However, for scripts, we need CORS to execute in module workers sometimes. 
                // We'll stick to 'cors' as these are ESM modules.
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

  // 1. Navigation Requests (HTML) - CACHE FIRST Strategy (App Shell)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const cachedShell = await caches.match('/index.html');
          if (cachedShell) return cachedShell;
          return await fetch(event.request);
        } catch (error) {
          return caches.match('/index.html');
        }
      })()
    );
    return;
  }

  // 2. Asset Requests with Smart Extension Matching
  event.respondWith(
    (async () => {
      // A. Exact Match
      const exactMatch = await caches.match(event.request);
      if (exactMatch) return exactMatch;

      // B. Extension Match (for local imports like /App -> /App.tsx)
      if (!url.pathname.includes('.')) {
         const tsxMatch = await caches.match(url.pathname + '.tsx');
         if (tsxMatch) return tsxMatch;
         
         const tsMatch = await caches.match(url.pathname + '.ts');
         if (tsMatch) return tsMatch;
      }

      // C. Network Fallback
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // D. Offline Failure
        // Return a 503 response instead of failing to ensure the browser doesn't crash the script load
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
    })()
  );
});
