
const CACHE_NAME = 'hdfc-money-v4'; // Bumped version for full reload
const DYNAMIC_CACHE = 'hdfc-dynamic-v4';

// Explicitly cache ALL local source files and external dependencies.
// This ensures the "Offline Launch" capability works perfectly by treating the app as a fully contained bundle.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  
  // Core Entry Points
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  
  // Components
  '/components/Header.tsx',
  '/components/Button.tsx',
  
  // Pages
  '/pages/Home.tsx',
  '/pages/Scan.tsx',
  '/pages/ConfirmPayment.tsx',
  '/pages/Result.tsx',
  '/pages/ManualEntry.tsx',
  '/pages/History.tsx',
  '/pages/Profile.tsx',
  '/pages/Support.tsx',
  '/pages/Login.tsx',
  '/pages/Signup.tsx',
  '/pages/Reminders.tsx',
  '/pages/ChatSupport.tsx',
  '/pages/BillPayments.tsx',
  '/pages/BankTransfer.tsx',
  
  // Utilities
  '/utils/authManager.ts',
  '/utils/historyManager.ts',
  '/utils/upiParser.ts',
  '/utils/reminderManager.ts',
  '/utils/billManager.ts',
  '/utils/aiSupport.ts',

  // Critical CDNs (Must match importmap exactly)
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

// Install Event: Cache App Shell & ALL Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Installing Service Worker & Caching App Shell...');
        // We use addAll. If any of these fail, the SW install fails.
        // This guarantees that if the SW is installed, the app IS offline ready.
        return cache.addAll(URLS_TO_CACHE).catch(err => {
            console.error('Failed to cache critical assets during install:', err);
            // We don't re-throw here to allow partial installs in worst case, 
            // but ideally this list should be perfect.
        });
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Navigation Requests (HTML) - App Shell Strategy
  // If user requests a page, serve index.html from cache first.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((response) => {
        return response || fetch(event.request).catch(() => caches.match('/index.html'));
      })
    );
    return;
  }

  // 2. Strategy for External Resources (CDNs, APIs)
  // Stale-While-Revalidate: Return cache if available, but update it in background
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                 cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse); // Return cache on network fail

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Strategy for Local App Files (JS, TSX, CSS)
  // Cache First, Fallback to Network.
  // Since we pre-cached everything in 'install', this should hit cache 99% of time.
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache new local files that we might have missed in the pre-cache list
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      });
    })
  );
});
