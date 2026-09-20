/* ============================================================
 * messages.js — 家庭廣播 v1.5
 *
 * v1.4 變更：
 *   - ⭐ send 自動記錄當前 Day
 *   - ⭐ renderFull 顯示 Day 標籤（可點擊跳行程）
 *   - ⭐ 新增 getTodaySummary() 取今日置頂摘要
 *
 * v1.5 變更：
 *   - ⭐ getTodaySummary() 只看「置頂 + 未過期」，不看 Day
 *     這樣 D2 睡前置頂的「明早集合」到 D3 早上仍然看得到
 * ============================================================ */
window.Messages = (function () {
  let _cache = [];
  let _listeners = [];
  let _unsub = null;
  let _started = false;

  const TRIP_DATES = ['2027-01-21','2027-01-22','2027-01-23','2027-01-24','2027-01-25','2027-01-26','2027-01-27'];

  function canWrite() {
    try {
      const u = window.currentUser || localStorage.getItem('tohoku_current_user');
      return !!u && u !== '訪客';
    } catch (e) { return false; }
  }

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function timeAgo(ts) {
    const d = Date.now() - ts;
    if (d < 60000) return '剛剛';
    if (d < 3600000) return Math.floor(d/60000) + ' 分鐘前';
    if (d < 86400000) return Math.floor(d/3600000) + ' 小時前';
    return Math.floor(d/86400000) + ' 天前';
  }

  function countdown(ms) {
    if (ms <= 0) return '已到時間';
    const s = Math.floor(ms/1000);
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    if (h > 0) return h + '時' + String(m).padStart(2,'0') + '分';
    if (m > 0) return m + '分' + String(s%60).padStart(2,'0') + '秒';
    return s + '秒';
  }

  // 取得當前 Day（1~7，0 表示不在旅行期間）
  function getCurrentDayNum() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const testDay = urlParams.get('day');
      const testMode = urlParams.get('test');
      if (testMode === 'during' && testDay) {
        const n = parseInt(testDay);
        if (n >= 1 && n <= 7) return n;
      }
    } catch (e) {}

    const now = Date.now();
    for (let i = 0; i < TRIP_DATES.length; i++) {
      const s = new Date(TRIP_DATES[i] + "T00:00:00+08:00").getTime();
      const e = new Date(TRIP_DATES[i] + "T23:59:59+08:00").getTime();
      if (now >= s && now <= e) return i + 1;
    }
    return 0;
  }

  function process(list) {
    const now = Date.now();
    return list
      .filter(m => {
        if (m.expiresAt && m.expiresAt < now) return false;
        if (!m.pinned && m.createdAt < now - 24*3600*1000) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
  }

  function notify() {
    const data = process(_cache);
    _listeners.forEach(cb => { try { cb(data); } catch(e){} });
  }

  function startListener() {
    if (_started) return;
    if (!window.db) { setTimeout(startListener, 200); return; }
    _started = true;
    console.log('[Messages] 啟動 Firestore 訂閱');
    _unsub = window.db
      .collection('tohoku_trip').doc('messages')
      .collection('items')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .onSnapshot(snap => {
        _cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        notify();
      }, err => {
        console.warn('[Messages] 訂閱錯誤:', err);
        _started = false;
        setTimeout(startListener, 3000);
      });
  }

  function subscribe(cb) {
    _listeners.push(cb);
    cb(process(_cache));
    startListener();
    return () => {
      const i = _listeners.indexOf(cb);
      if (i > -1) _listeners.splice(i, 1);
    };
  }

  async function send(text, opts = {}) {
    if (!canWrite()) {
      if (typeof showToast === 'function') showToast('🔒 訪客無法發送訊息', '⚠️');
      return false;
    }
    if (!text || !text.trim()) return false;
    if (!window.db) { if (typeof showToast==='function') showToast('雲端未連線','⚠️'); return false; }
    const author = window.currentUser || localStorage.getItem('tohoku_current_user') || '訪客';

    const msg = {
      text: text.trim(),
      author,
      createdAt: Date.now(),
      expiresAt: opts.duration ? Date.now() + opts.duration : null,
      pinned: !!opts.pinned,
      type: opts.type || 'normal'
    };

    // 自動記錄當前 Day
    const dayNum = getCurrentDayNum();
    if (dayNum >= 1) msg.day = dayNum;

    if (opts.location && typeof opts.location.lat === 'number' && typeof opts.location.lng === 'number') {
      msg.location = {
        lat: opts.location.lat,
        lng: opts.location.lng,
        accuracy: opts.location.accuracy || null
      };
    }

    try {
      await window.db.collection('tohoku_trip').doc('messages').collection('items').add(msg);
      if (navigator.vibrate) navigator.vibrate(15);
      if (typeof showToast==='function') showToast('已發送','📢');
      return true;
    } catch(e) {
      console.warn('[Messages] send', e);
      if (typeof showToast==='function') showToast('發送失敗','⚠️');
      return false;
    }
  }

  async function togglePin(id) {
    if (!canWrite()) {
      if (typeof showToast === 'function') showToast('🔒 訪客無法置頂', '⚠️');
      return;
    }
    if (!window.db) return;
    const m = _cache.find(x => x.id === id);
    if (!m) return;
    await window.db.collection('tohoku_trip').doc('messages').collection('items').doc(id)
      .update({ pinned: !m.pinned });
  }

  async function remove(id) {
    if (!canWrite()) {
      if (typeof showToast === 'function') showToast('🔒 訪客無法刪除', '⚠️');
      return;
    }
    if (!window.db) return;
    await window.db.collection('tohoku_trip').doc('messages').collection('items').doc(id).delete();
    if (typeof showToast==='function') showToast('已刪除','🗑');
  }

  function buildMapUrl(loc) {
    if (!loc || typeof loc.lat !== 'number') return '';
    return `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
  }

  function isLocationMsg(m) {
    return m.type === 'location' && m.location && typeof m.location.lat === 'number';
  }

  // Day 標籤
  function buildDayTagHtml(m) {
    if (!m.day || m.day < 1 || m.day > 7) return '';
    return `<button type="button" class="message-day-tag" onclick="event.stopPropagation();window._Messages_jumpToDay(${m.day})">D${m.day}</button>`;
  }

  function renderCard(limit = 2) {
    const list = process(_cache).slice(0, limit);
    if (list.length === 0) return '';
    return list.map(m => {
      const dot = m.pinned ? '🔴' : '⚪';
      const cd = m.expiresAt ? ` · 還有 ${countdown(m.expiresAt - Date.now())}` : '';
      const mapBtn = isLocationMsg(m)
        ? `<a href="${buildMapUrl(m.location)}" target="_blank" rel="noopener" class="broadcast-map-btn" onclick="event.stopPropagation()">🗺️ 看地圖</a>`
        : '';
      const dayTag = buildDayTagHtml(m);
      return `<div class="broadcast-item ${m.pinned?'pinned':''}">
        <span class="broadcast-dot">${dot}</span>
        <div class="broadcast-body">
          <div class="broadcast-text"><strong>${esc(m.author)}</strong>：${esc(m.text)}</div>
          <div class="broadcast-meta">${dayTag}${timeAgo(m.createdAt)}${cd}</div>
          ${mapBtn}
        </div>
      </div>`;
    }).join('');
  }

  function renderFull() {
    const list = process(_cache);
    const writable = canWrite();

    if (list.length === 0) {
      return `<div style="text-align:center;padding:40px 20px">
        <div style="font-size:40px;margin-bottom:8px">💬</div>
        <div style="font-size:14px;font-weight:700;color:#64748b">尚無留言</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px">${writable ? '發送第一則家庭廣播吧' : '訪客僅能閱讀'}</div>
      </div>`;
    }

    return list.map(m => {
      const dot = m.pinned ? '🔴' : '⚪';
      const cd = m.expiresAt ? ` · 還有 ${countdown(m.expiresAt - Date.now())}` : '';
      const actions = writable ? `
        <div class="message-actions">
          <button type="button" class="msg-action-btn" onclick="Messages.togglePin('${m.id}')" title="置頂">${m.pinned?'📌':'📍'}</button>
          <button type="button" class="msg-action-btn" onclick="if(confirm('確定刪除？'))Messages.remove('${m.id}')" title="刪除">🗑</button>
        </div>` : '';
      const mapBtn = isLocationMsg(m)
        ? `<a href="${buildMapUrl(m.location)}" target="_blank" rel="noopener" class="message-map-btn">🗺️ 在地圖開啟</a>`
        : '';
      const dayTag = buildDayTagHtml(m);
      return `<div class="message-row ${m.pinned?'pinned':''} ${isLocationMsg(m)?'is-location':''}">
        <div class="message-row-head">
          <span class="message-dot">${dot}</span>
          <span class="message-author">${esc(m.author)}</span>
          ${dayTag}
          <span class="message-time">${timeAgo(m.createdAt)}${cd}</span>
          ${actions}
        </div>
        <div class="message-text">${esc(m.text)}</div>
        ${mapBtn}
      </div>`;
    }).join('');
  }

  // ⭐ v1.5：摘要只看「置頂 + 未過期」，不看 Day
  // 這樣 D2 睡前置頂的「明早集合」到 D3 早上仍然看得到
  function getTodaySummary() {
    const now = Date.now();
    const items = process(_cache).filter(m => {
      if (!m.pinned) return false;
      if (m.expiresAt && m.expiresAt < now) return false;
      return true;
    });
    return { day: getCurrentDayNum(), items };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(startListener, 300);
    });
  } else {
    setTimeout(startListener, 300);
  }

  return {
    subscribe, send, togglePin, remove, renderCard, renderFull,
    getTodaySummary,
    getAll: () => process(_cache),
    getCount: () => process(_cache).length,
    canWrite,
    getCurrentDayNum,
    _start: startListener
  };
})();