/* ============================================================
 * Service Worker - v13（自動更新版）
 * 策略：
 *   - HTML / JS / CSS：Network First（永遠拿最新）
 *   - 圖片 / 字體：Cache First（省流量）
 *   - API：Network First
 *   - ✅ 不再需要手動改版本號
 * ============================================================ */

const CACHE_NAME = 'tohoku-winter-trip';  // 固定名稱，永不改

const ASSETS = [
  '/', '/index.html', '/ledger.html',
  '/data.js', '/shoot-tips.js', '/shopping.js',
  '/header.css', '/header.js',
  '/style.css',        // ← 新增
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap'
];

const NETWORK_FIRST_HOSTS = ['firebase', 'firestore', 'open-meteo', 'er-api', 'googleapis'];

function isFreshResource(url, request) {
  if (request.mode === 'navigate') return true;
  return /\.(html|js|css|json)(\?|$)/i.test(url);
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(ASSETS).catch(err => console.warn('[SW] Pre-cache 失敗:', err))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('tohoku-winter-trip') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  // API：Network First
  if (NETWORK_FIRST_HOSTS.some(h => url.includes(h))) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // HTML / JS / CSS：Network First（★關鍵★）
  if (isFreshResource(url, e.request)) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request).then(c => c || caches.match('/index.html')))
    );
    return;
  }

  // 其他：Cache First
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok && url.startsWith('http')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return response;
      });
    })
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});