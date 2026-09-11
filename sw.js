/* ============================================================
 * Service Worker - v12
 * 策略：
 *   - 靜態資源（HTML/CSS/JS）：Cache First
 *   - API（Firebase / 天氣 / 匯率）：Network First
 *   - 支援 SKIP_WAITING 訊息，讓使用者手動更新
 * ============================================================ */

const CACHE_NAME = 'tohoku-winter-trip-v12';

const ASSETS = [
  '/',
  '/index.html',
  '/ledger.html',
  '/data.js',
  '/shoot-tips.js',
  '/shopping.js',
  '/header.css',
  '/header.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap'
];

// 這些主機一律用 Network First（避免拿到舊資料）
const NETWORK_FIRST_HOSTS = [
  'firebase',
  'firestore',
  'open-meteo',
  'er-api',
  'googleapis'
];

// ---------- install ----------
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('[SW] Pre-cache 部分失敗（可能是離線或跨域）:', err);
      });
    })
  );
  // ❗ 不自動 skipWaiting，等使用者確認
});

// ---------- activate ----------
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[SW] 刪除舊快取:', key);
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// ---------- fetch ----------
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = e.request.url;

  // API：Network First（即時資料優先）
  if (NETWORK_FIRST_HOSTS.some(h => url.includes(h))) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // 不快取 API 回應（避免資料過期）
          return response;
        })
        .catch(() => {
          // 離線時回傳快取（如果有）
          return caches.match(e.request);
        })
    );
    return;
  }

  // 靜態資源：Cache First
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        if (response.ok && url.startsWith('http')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // 離線 fallback（僅對 HTML 導航）
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ---------- message：讓使用者手動 SKIP_WAITING ----------
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});