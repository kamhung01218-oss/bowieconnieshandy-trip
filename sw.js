/* ============================================================
 * Service Worker - v20
 * 策略：
 *   - HTML / JS / CSS：Network First（永遠拿最新）
 *   - 圖片 / 字體：Cache First（省流量）
 *   - API：Network First
 *   - 更新流程：安裝完成 → 等待使用者點擊 → 跳過等待
 * ============================================================ */

const CACHE_NAME = 'tohoku-winter-trip-v20';

const ASSETS = [
  '/', '/index.html', '/ledger.html',
  '/data.js', '/shoot-tips.js', '/shopping.js', '/emergency.js',
  '/app-core.js', '/app-lists.js', '/app-itinerary.js',
  '/header.css', '/header.js', '/style.css', '/ledger.css', '/ledger.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png'
];

// 外部資源（不預快取，避免卡住安裝）
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap'
];

const NETWORK_FIRST_HOSTS = ['firebase', 'firestore', 'open-meteo', 'er-api', 'googleapis', 'gstatic'];

function isFreshResource(url, request) {
  if (request.mode === 'navigate') return true;
  return /\.(html|js|css|json)(\?|$)/i.test(url);
}

// ⭐ 單一資源加入快取（帶 8 秒超時）
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
  // 本機資源：並行下載，各自帶超時
  await Promise.all(ASSETS.map(url => addWithTimeout(cache, url)));
  // 外部資源：另外處理，失敗不影響
  await Promise.all(EXTERNAL_ASSETS.map(url =>
    addWithTimeout(cache, url, 5000).catch(() => {})
  ));
  console.log('[SW] 預快取完成');
}

self.addEventListener('install', (e) => {
  // ⭐ 不在這裡呼叫 skipWaiting()
  // 讓新 SW 進入 waiting 狀態，等使用者點「立即更新」
  e.waitUntil(
    precacheAssets().catch(err => {
      console.warn('[SW] precache 失敗，但繼續安裝:', err);
    })
  );
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

// ⭐ 收到 SKIP_WAITING 才真正跳過等待
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    console.log('[SW] 收到 SKIP_WAITING，立即啟用');
    self.skipWaiting();
  }
});