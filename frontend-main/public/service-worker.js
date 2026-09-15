/* ==========================================================================
   Holy Grill — Service Worker
   --------------------------------------------------------------------------
   Caching strategies:
     • App shell (HTML/JS/CSS)      → cache-first, version-busted on install
     • Static assets (fonts/imgs)  → stale-while-revalidate
     • Navigation requests         → network-first, fall back to cache/offline
     • Images                      → stale-while-revalidate
   Update flow: a new SW installs → notifies client → client posts
   SKIP_WAITING → new SW activates → client reloads (handled in main.jsx).
   ========================================================================== */

// OneSignal push support — harmless if OneSignal isn't configured.
try { importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js'); } catch (e) { /* no-op */ }

const CACHE_VERSION = 'hg-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = '/offline.html';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/maskable.svg',
];

// --- Install: pre-cache the app shell ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// --- Activate: clear old caches ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// --- Message handler: update flow ---
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// --- Fetch: routing by request type ---
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Skip cross-origin + OneSignal/SDK requests.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('OneSignalSDK')) return;

  // Navigation → network-first, offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static shell assets → cache-first.
  if (SHELL_ASSETS.includes(url.pathname) || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
        return res;
      }).catch(() => cached))
    );
    return;
  }

  // Everything else (fonts, images, API) → stale-while-revalidate.
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              cache.put(request, copy);
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
