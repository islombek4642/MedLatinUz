const CACHE_NAME = 'medlatin-v12';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components/sidebar.css',
  './css/components/search-bar.css',
  './css/components/filters.css',
  './css/components/word-card.css',
  './css/components/theme-toggle.css',
  './css/components/toast.css',
  './css/components/loading-modal.css',
  './css/components/responsive.css',
  './js/app.js',
  './js/modules/data-loader.js',
  './js/modules/search-engine.js',
  './js/modules/ui-renderer.js',
  './js/modules/speech-speaker.js',
  './js/modules/theme-manager.js',
  './js/modules/bookmark-manager.js',
  './js/modules/loading-modal.js',
  './js/modules/db-storage.js',
  './js/workers/search-worker.js',
  './data/dictionary.json',
  './data/dictionary-data.js',
  'https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js'
];

// Install: Cache all static assets and data files
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching all offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate: Clean up any old caches and claim immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-First with Cache Fallback (always fresh online, 100% functional offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.method === 'GET'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
