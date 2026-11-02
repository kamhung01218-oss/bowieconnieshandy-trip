/* ============================================================
 * Service Worker - v3.2（8天7夜修正版）
 *
 * v3.2 變更：
 *   - 補全 ASSETS（tokens / dark / design-v15 / v16 / focus-card-v2
 *     / prep-swipe / attachments-overview / icons.js / messages.js
 *     / simulator.js / attachments-overview.js）
 *   - Firebase SDK 加入 EXTERNAL_ASSETS 預快取
 * ============================================================ */

const BUILD = '2026-11-02-1';

const CACHE_NAME = `tohoku-trip-${BUILD}`;

const ASSETS = [
  '/', '/index.html', '/ledger.html',
  '/data.js', '/shoot-tips.js', '/shopping.js', '/emergency.js', '/messages.js',
  '/app-core.js', '/app-lists.js', '/app-itinerary.js', '/app-uploads.js',
  '/attachments-overview.js', '/header.js', '/icons.js', '/simulator.js',
  '/ledger.js',
  '/tokens.css', '/header.css', '/style.css', '/dark.css',
  '/patches.css', '/perf.css',
  '/design-v14.css', '/design-v14b.css', '/design-v15.css', '/design-v16.css',
  '/focus-card-v2.css', '/prep-swipe.css', '/attachments-overview.css',
  '/ledger.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/firebase@11.6.1/firebase-app-compat.js',
  'https://cdn.jsdelivr.net/npm/firebase@11.6.1/firebase-auth-compat.js',
  'https://cdn.jsdelivr.net/npm/firebase@11.6.1/firebase-firestore-compat.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap'
];

const NETWORK_FIRST_HOSTS = ['firebase', 'firestore', 'open-meteo', 'er-api'];

function isFreshResource(url, request) {
  if (request.mode === 'navigate') return true;
  return /\.(html|js|css|json)(\?|$)/i.test(url);
}

function addWithTimeout(cache, url, timeoutMs = 8000) {
  return Promise.race([
    cache.add(url).catch(err => {
      console.warn('[SW] 略過:', url, err.message);
    }),
    new Promise(resolve => setTimeout(() => {
      console.warn('[SW] 超時略過:', url);
      resolve();
    }, timeoutMs))
  ]);
}

async function precacheAssets() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(ASSETS.map(url => addWithTimeout(cache, url)));
  await Promise.all(EXTERNAL_ASSETS.map(url =>
    addWithTimeout(cache, url, 5000).catch(() => {})
  ));
  console.log(`[SW] 預快取完成（${BUILD}）`);
}

self.addEventListener('install', (e) => {
  console.log(`[SW] 安裝新版：${BUILD}`);
  e.waitUntil(
    precacheAssets().catch(err => {
      console.warn('[SW] precache 失敗:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log(`[SW] 啟用新版：${BUILD}`);
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('tohoku-trip-') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  if (NETWORK_FIRST_HOSTS.some(h => url.includes(h))) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  if (isFreshResource(url, e.request)) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(e.request).then(c => c || caches.match('/index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok && url.startsWith('http')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return response;
      });
    })
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    console.log('[SW] 收到 SKIP_WAITING');
    self.skipWaiting();
  }
});