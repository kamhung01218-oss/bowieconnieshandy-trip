/* ============================================================
 * Service Worker - v13（自動更新版）
 * 策略：
 *   - HTML / JS / CSS：Network First（永遠拿最新，離線才用快取）
 *   - 圖片 / 字體：Cache First（省流量）
 *   - API：Network First（即時資料優先）
 *   - ✅ 不再需要手動改版本號
 * ============================================================ */

const CACHE_NAME = 'tohoku-winter-trip';  // 固定名稱，永不改

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

const NETWORK_FIRST_HOSTS = [
  'firebase', 'firestore', 'open-meteo', 'er-api', 'googleapis'
];

// 判斷是否為「需要即時最新」的資源
function isFreshResource(url, request) {
  if (request.mode === 'navigate') return true;
  return /\.(html|js|css|json)(\?|$)/i.test(url);
}

// ---------- install：預快取 ----------
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(ASSETS).catch(err => {
        console.warn('[SW] Pre-cache 部分失敗:', err);
      })
    )
  );
  // 不自動 skipWaiting，維持你原本的手動更新體驗
});

// ---------- activate：清掉舊 cache（用字首比對）----------
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('tohoku-winter-trip') && key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] 刪除舊快取:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ---------- fetch ----------
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = e.request.url;

  // 1️⃣ API：Network First
  if (NETWORK_FIRST_HOSTS.some(h => url.includes(h))) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // 2️⃣ HTML / JS / CSS：Network First（永不拿到舊版）
  if (isFreshResource(url, e.request)) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(e.request).then(cached =>
            cached || caches.match('/index.html')
          )
        )
    );
    return;
  }

  // 3️⃣ 其他（圖片 / 字體）：Cache First
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

// ---------- message：手動 SKIP_WAITING ----------
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});