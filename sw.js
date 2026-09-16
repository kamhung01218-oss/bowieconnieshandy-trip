/* ============================================================
 * Service Worker - v19
 * 策略：
 *   - HTML / JS / CSS：Network First（永遠拿最新）
 *   - 圖片 / 字體：Cache First（省流量）
 *   - API：Network First
 * ============================================================ */

const CACHE_NAME = 'tohoku-winter-trip-v19';

const ASSETS = [
  '/', '/index.html', '/ledger.html',
  '/data.js', '/shoot-tips.js', '/shopping.js', '/emergency.js',
  '/app-core.js', '/app-lists.js', '/app-itinerary.js',
  '/header.css', '/header.js',
  '/style.css', '/perf.css',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap'
];

const NETWORK_FIRST_HOSTS = ['firebase', 'firestore', 'open-meteo', 'er-api', 'googleapis'];

function isFreshResource(url, request) {
  if (request.mode === 'navigate') return true;
  return /\.(html|js|css|json)(\?|$)/i.test(url);
}

async function precacheAssets() {
  const cache = await caches.open(CACHE_NAME);
  const results = await Promise.allSettled(
    ASSETS.map(url =>
      cache.add(url).catch(err => {
        console.warn('[SW] 略過無法快取的資源:', url, err.message);
      })
    )
  );
  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) console.warn(`[SW] 預快取完成，${failed}/${ASSETS.length} 項失敗`);
}

self.addEventListener('install', (e) => {
  e.waitUntil(precacheAssets());
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('tohoku-winter-trip') && k !== CACHE_NAME)
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
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});