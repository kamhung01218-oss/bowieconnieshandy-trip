/* ============================================================
 * Service Worker - v14（穩健版）
 * 修復：addAll 整批失敗問題，改為逐項快取
 * 策略：
 *   - HTML / JS / CSS：Network First
 *   - 圖片 / 字體：Cache First
 *   - API：Network First
 * ============================================================ */

const CACHE_NAME = 'tohoku-winter-trip-v14';

const ASSETS = [
  '/', '/index.html', '/ledger.html',
  '/data.js', '/shoot-tips.js', '/shopping.js',
  '/header.css', '/header.js',
  '/style.css',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap'
];

const NETWORK_FIRST_HOSTS = ['firebase', 'firestore', 'open-meteo', 'er-api', 'googleapis'];

function isFreshResource(url, request) {
  if (request.mode === 'navigate') return true;
  return /\.(html|js|css|json)(\?|$)/i.test(url);
}

// ✅ 逐項快取：任何一個失敗都不會拖累其他
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
  // ✅ 讓新版 SW 立即接手，不等舊分頁關閉
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

  // API：Network First
  if (NETWORK_FIRST_HOSTS.some(h => url.includes(h))) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // HTML / JS / CSS：Network First
  if (isFreshResource(url, e.request)) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
          return response;
        })
        .catch(() =>
          caches.match(e.request).then(c => c || caches.match('/index.html'))
        )
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