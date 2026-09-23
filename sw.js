/* ============================================================
 * Service Worker - v3.1（字體 Cache-First）
 *
 * v3.1 變更：
 *   - ⭐ 移除 googleapis / gstatic 從 NETWORK_FIRST_HOSTS
 *   - ⭐ 字體 CSS / WOFF2 走 Cache-First（首次載入後秒開）
 * ============================================================ */

const BUILD = '2026-09-24-4';

const CACHE_NAME = `tohoku-trip-${BUILD}`;

const ASSETS = [
  '/', '/index.html', '/ledger.html',
  '/data.js', '/shoot-tips.js', '/shopping.js', '/emergency.js',
  '/app-core.js', '/app-lists.js', '/app-itinerary.js', '/app-uploads.js',
  '/header.css', '/header.js', '/style.css', '/ledger.css', '/ledger.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap'
];

// ⭐ v3.1：移除 googleapis / gstatic，讓字體走 cache-first
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

  // ⭐ 字體 / 圖片：Cache-First（含 Google Fonts）
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