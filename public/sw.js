// ============================================
// Me+ PWA — Service Worker
// ============================================
// Cache-first strategy for static assets,
// network-first for navigation requests.
// Bump CACHE_VERSION to force a cache refresh on deploy.

const CACHE_VERSION = 'meplus-v1';

// App shell: files to pre-cache on install.
// Vite hashes filenames, so we cache the entry point
// and let runtime caching handle hashed assets.
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/fonts/inter-latin.woff2',
  '/fonts/outfit-latin.woff2',
];

// ---------- Install ----------
self.addEventListener('install', (event) => {
  // Pre-cache the app shell
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(APP_SHELL);
    })
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

// ---------- Activate ----------
self.addEventListener('activate', (event) => {
  // Remove old caches from previous versions
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ---------- Fetch ----------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (analytics, external APIs, etc.)
  if (!request.url.startsWith(self.location.origin)) return;

  // Navigation requests (HTML pages): network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest HTML
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Offline: serve cached HTML
          return caches.match(request).then(
            (cached) => cached || caches.match('/')
          );
        })
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images): cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached version immediately, but update cache in background
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);

        // Stale-while-revalidate: return cached now, update later
        return cached;
      }

      // Not in cache: fetch from network and cache it
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
