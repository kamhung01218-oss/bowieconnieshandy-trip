/* ============================================================
 * Service Worker - v3（自動更新版）
 *
 * 策略：
 *   - 完全自動更新，使用者無感
 *   - HTML / JS / CSS：Network First（永遠拿最新）
 *   - 圖片 / 字體：Cache First（省流量）
 *   - API：Network First
 *
 * ⭐ 你只需要在改版時改下面這一行 BUILD 值
 * ============================================================ */

// ⭐ 每次發布新版時，把這行改成今天的日期 + 序號
// 例如：'2026-09-16-1' → '2026-09-20-1' → '2026-09-20-2'
const BUILD = '2026-09-16-1';

const CACHE_NAME = `tohoku-trip-${BUILD}`;

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

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap'
];

const NETWORK_FIRST_HOSTS = ['firebase', 'firestore', 'open-meteo', 'er-api', 'googleapis', 'gstatic'];

function isFreshResource(url, request) {
  if (request.mode === 'navigate') return true;
  return /\.(html|js|css|json)(\?|$)/i.test(url);
}

// 單一資源加入快取（帶 8 秒超時）
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

// ⭐ install：預快取資源
self.addEventListener('install', (e) => {
  console.log(`[SW] 安裝新版：${BUILD}`);
  e.waitUntil(
    precacheAssets().catch(err => {
      console.warn('[SW] precache 失敗:', err);
    })
  );
  // ⭐ 立即接管，不等待使用者點擊
  self.skipWaiting();
});

// ⭐ activate：清掉舊 cache，立即接管所有頁面
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

  // 外部 API：Network First
  if (NETWORK_FIRST_HOSTS.some(h => url.includes(h))) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // HTML/JS/CSS：Network First（永遠拿最新）
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

  // 圖片/字體：Cache First
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

// 保留 SKIP_WAITING 兼容舊版
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    console.log('[SW] 收到 SKIP_WAITING');
    self.skipWaiting();
  }
});