/* ============================================================
 * messages.js — 家庭廣播 v1.0（簡化版）
 * ============================================================ */
window.Messages = (function () {
  let _cache = [];
  let _listeners = [];
  let _unsub = null;

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

  // 過濾 + 排序
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

  // 訂閱
  function subscribe(cb) {
    _listeners.push(cb);
    cb(process(_cache));

    if (!_unsub && window.db) {
      _unsub = window.db
        .collection('tohoku_trip').doc('messages')
        .collection('items')
        .orderBy('createdAt', 'desc')
        .limit(30)
        .onSnapshot(snap => {
          _cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          notify();
        }, err => console.warn('[Messages]', err));
    }
    return () => {
      const i = _listeners.indexOf(cb);
      if (i > -1) _listeners.splice(i, 1);
    };
  }

  // 發送
  async function send(text, opts = {}) {
    if (!text || !text.trim()) return false;
    if (!window.db) { if (typeof showToast==='function') showToast('雲端未連線','⚠️'); return false; }
    const author = (window.currentUser && window.currentUser !== '訪客') ? window.currentUser : '訪客';
    try {
      await window.db.collection('tohoku_trip').doc('messages').collection('items').add({
        text: text.trim(),
        author,
        createdAt: Date.now(),
        expiresAt: opts.duration ? Date.now() + opts.duration : null,
        pinned: !!opts.pinned,
        type: opts.type || 'normal'
      });
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
    if (!window.db) return;
    const m = _cache.find(x => x.id === id);
    if (!m) return;
    await window.db.collection('tohoku_trip').doc('messages').collection('items').doc(id)
      .update({ pinned: !m.pinned });
  }

  async function remove(id) {
    if (!window.db) return;
    await window.db.collection('tohoku_trip').doc('messages').collection('items').doc(id).delete();
    if (typeof showToast==='function') showToast('已刪除','🗑');
  }

  // 卡片渲染
  function renderCard(limit = 2) {
    const list = process(_cache).slice(0, limit);
    if (list.length === 0) return '';
    return list.map(m => {
      const dot = m.pinned ? '🔴' : '⚪';
      const cd = m.expiresAt ? ` · 還有 ${countdown(m.expiresAt - Date.now())}` : '';
      return `<div class="broadcast-item ${m.pinned?'pinned':''}">
        <span class="broadcast-dot">${dot}</span>
        <div class="broadcast-body">
          <div class="broadcast-text"><strong>${esc(m.author)}</strong>：${esc(m.text)}</div>
          <div class="broadcast-meta">${timeAgo(m.createdAt)}${cd}</div>
        </div>
      </div>`;
    }).join('');
  }

  // 完整列表
  function renderFull() {
    const list = process(_cache);
    if (list.length === 0) {
      return `<div style="text-align:center;padding:40px 20px">
        <div style="font-size:40px;margin-bottom:8px">💬</div>
        <div style="font-size:14px;font-weight:700;color:#64748b">尚無留言</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px">發送第一則家庭廣播吧</div>
      </div>`;
    }
    return list.map(m => {
      const dot = m.pinned ? '🔴' : '⚪';
      const cd = m.expiresAt ? ` · 還有 ${countdown(m.expiresAt - Date.now())}` : '';
      return `<div class="message-row ${m.pinned?'pinned':''}">
        <div class="message-row-head">
          <span class="message-dot">${dot}</span>
          <span class="message-author">${esc(m.author)}</span>
          <span class="message-time">${timeAgo(m.createdAt)}${cd}</span>
          <div class="message-actions">
            <button type="button" class="msg-action-btn" onclick="Messages.togglePin('${m.id}')" title="置頂">${m.pinned?'📌':'📍'}</button>
            <button type="button" class="msg-action-btn" onclick="if(confirm('確定刪除？'))Messages.remove('${m.id}')" title="刪除">🗑</button>
          </div>
        </div>
        <div class="message-text">${esc(m.text)}</div>
      </div>`;
    }).join('');
  }

  return {
    subscribe, send, togglePin, remove, renderCard, renderFull,
    getAll: () => process(_cache),
    getCount: () => process(_cache).length
  };
})();