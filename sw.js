const CACHE_NAME = 'medlatin-v5';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components/search-bar.css',
  './css/components/filters.css',
  './css/components/word-card.css',
  './css/components/responsive.css',
  './js/app.js',
  './js/modules/data-loader.js',
  './js/modules/search-engine.js',
  './js/modules/ui-renderer.js',
  
  // 4 Core sets
  './data/prescriptions.json',
  './data/anatomy.json',
  './data/clinical.json',
  './data/general.json',

  // 12 Human body systems
  './data/anatomy_systems.json',
  
  // 9 Anatomical categories
  './data/anatomy_organs.json',
  './data/anatomy_bones.json',
  './data/anatomy_nerves.json',
  './data/anatomy_vessels.json',
  './data/anatomy_muscles.json',
  './data/anatomy_glands.json',
  './data/anatomy_joints.json',
  './data/anatomy_ligaments.json',
  './data/anatomy_tendons.json',

  // 7 Latin POS categories
  './data/latin_nouns.json',
  './data/latin_adjectives.json',
  './data/latin_verbs.json',
  './data/latin_adverbs.json',
  './data/latin_prepositions.json',
  './data/latin_conjunctions.json',
  './data/latin_interjections.json'
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
