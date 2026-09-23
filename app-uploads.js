/* ============================================================
 * app-uploads.js — 通用上傳 + 行程資料 v3.5
 *
 * v3.4：使用 data-event-key
 * v3.5：
 *   - ⭐ 同時更新「標籤列徽章」和「動作列按鈕徽章」
 *   - ⭐ 標籤列徽章只在有資料時存在（沒資料自動移除）
 * ============================================================ */

(function () {
  'use strict';

  const IMGBB_API_KEY = 'c810acea8fd53f787b34d7e81e6f759a';
  const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';
  const MAX_EDGE = 1600;
  const QUALITY = 0.82;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  if (!window.cloudAttachments) window.cloudAttachments = {};
  if (!window.cloudEventNotes) window.cloudEventNotes = {};

  let _currentEventKey = null;
  let _currentEventTitle = '';
  let _currentTab = 'attach';

  // ============================================================
  // 工具
  // ============================================================
  function _currentUser() {
    try { return window.currentUser || localStorage.getItem('tohoku_current_user') || '訪客'; }
    catch (e) { return '訪客'; }
  }
  function _canWrite() { const u = _currentUser(); return !!u && u !== '訪客'; }
  function _isAdmin() {
    try { return typeof window.isAdminUnlocked === 'function' && window.isAdminUnlocked(); }
    catch (e) { return false; }
  }
  function _toast(msg, icon) {
    if (typeof window.showToast === 'function') window.showToast(msg, icon || '✅');
    else console.log('[Uploads]', msg);
  }
  function _haptic(ms) { if (navigator.vibrate) { try { navigator.vibrate(ms || 8); } catch (e) {} } }
  function _esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function _genId() { return 'ph-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7); }

  function _getEventKeyFromEl(el) {
    if (!el) return null;
    if (el.dataset.eventKey) return el.dataset.eventKey;
    const day = el.dataset.day;
    const index = el.dataset.index;
    if (day != null && index != null) return `d${day}-e${index}`;
    return null;
  }

  // ============================================================
  // 圖片壓縮
  // ============================================================
  function compress(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type || !file.type.startsWith('image/')) { reject(new Error('不是圖片檔案')); return; }
      if (file.size > MAX_FILE_SIZE) { reject(new Error(`檔案過大（${Math.round(file.size / 1024 / 1024)}MB）`)); return; }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('讀取失敗'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('解碼失敗'));
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > MAX_EDGE) { height = Math.round((height * MAX_EDGE) / width); width = MAX_EDGE; }
          else if (height > MAX_EDGE) { width = Math.round((width * MAX_EDGE) / height); height = MAX_EDGE; }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('壓縮失敗')), 'image/jpeg', QUALITY);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('轉 Base64 失敗'));
      reader.onload = () => {
        const base64 = String(reader.result).split(',')[1];
        if (!base64) reject(new Error('Base64 為空')); else resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }

  // ============================================================
  // 上傳 imgbb
  // ============================================================
  async function uploadBlob(blob, opts = {}) {
    const base64 = await _blobToBase64(blob);
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64);
    const res = await fetch(IMGBB_ENDPOINT, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json || !json.success || !json.data) throw new Error('imgbb 失敗');
    const data = json.data;
    return {
      id: _genId(),
      url: data.url || data.display_url,
      thumb: (data.thumb && data.thumb.url) || data.url,
      deleteUrl: data.delete_url || '',
      uploader: _currentUser(),
      uploadedAt: Date.now(),
      category: opts.category || 'other',
      day: opts.day || null,
      note: opts.note || ''
    };
  }

  async function uploadFiles(files, opts = {}) {
    if (!_canWrite()) { _toast('🔒 訪客無法上傳', '⚠️'); return { success: [], failed: [] }; }
    const list = Array.from(files || []);
    if (list.length === 0) return { success: [], failed: [] };
    const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;
    const total = list.length;
    const success = [];
    const failed = [];
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        if (onProgress) onProgress({ phase: 'compress', current: i + 1, total });
        const blob = await compress(file);
        if (onProgress) onProgress({ phase: 'upload', current: i + 1, total });
        const meta = await uploadBlob(blob, opts);
        success.push(meta);
      } catch (e) {
        failed.push({ file: file && file.name, error: e.message || String(e) });
      }
      if (onProgress) onProgress({ phase: 'done', current: i + 1, total });
    }
    _haptic(success.length > 0 ? 15 : 50);
    return { success, failed };
  }

  // ============================================================
  // 燈箱
  // ============================================================
  function openLightbox(urls, index) {
    if (!Array.isArray(urls) || urls.length === 0) return;
    const idx = Math.max(0, Math.min(index || 0, urls.length - 1));
    if (typeof window.openLightbox === 'function') window.openLightbox(urls, idx);
    else window.open(urls[idx], '_blank');
  }

  function getAttachments(dayKey) {
    if (!dayKey) return [];
    const list = window.cloudAttachments && window.cloudAttachments[dayKey];
    return Array.isArray(list) ? list : [];
  }

  function getEventNote(dayKey) {
    if (!dayKey) return null;
    const notes = window.cloudEventNotes;
    return (notes && notes[dayKey]) ? notes[dayKey] : null;
  }

  async function _saveAttachments(dayKey, list) {
    if (!window.dbRef) throw new Error('雲端未連線');
    window.cloudAttachments[dayKey] = list;
    renderAllAttachments();
    renderEventDataModal();

    const docSnap = await window.dbRef.get();
    const cloudData = docSnap.exists ? docSnap.data() : {};
    const attachments = { ...(cloudData.attachments || {}) };
    attachments[dayKey] = list;
    await window.dbRef.set({ attachments, updatedAt: Date.now() }, { merge: true });
  }

  async function _saveNote(dayKey, noteObj) {
    if (!window.dbRef) throw new Error('雲端未連線');
    window.cloudEventNotes[dayKey] = noteObj;
    renderAllAttachments();
    renderEventDataModal();

    const docSnap = await window.dbRef.get();
    const cloudData = docSnap.exists ? docSnap.data() : {};
    const eventNotes = { ...(cloudData.eventNotes || {}) };
    eventNotes[dayKey] = noteObj;
    await window.dbRef.set({ eventNotes, updatedAt: Date.now() }, { merge: true });
  }

  function pickAndUpload(dayKey) {
    if (!_canWrite()) { _toast('🔒 訪客無法上傳', '⚠️'); return; }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(input);
    input.addEventListener('change', async () => {
      const files = Array.from(input.files || []);
      setTimeout(() => { try { document.body.removeChild(input); } catch(e) {} }, 100);
      if (files.length === 0) return;
      await _doUpload(dayKey, files);
    });
    setTimeout(() => { try { input.click(); } catch (e) { _toast('無法開啟檔案選擇器', '⚠️'); } }, 0);
  }

  async function _doUpload(dayKey, files) {
    const total = files.length;
    _toast(`⏳ 處理 ${total} 張…`, '📤');
    const result = await uploadFiles(files, {
      onProgress: ({ phase, current, total: t }) => {
        if (current === t || current % 3 === 0) {
          const label = phase === 'compress' ? '壓縮' : phase === 'upload' ? '上傳' : '完成';
          _toast(`⏳ ${label} ${current}/${t}`, '📤');
        }
      }
    });
    if (result.success.length === 0) { _toast(`❌ 全部失敗（${result.failed.length} 張）`, '⚠️'); return; }
    try {
      const existing = getAttachments(dayKey);
      const merged = [...result.success, ...existing];
      await _saveAttachments(dayKey, merged);
      _toast(`✅ 已加入 ${result.success.length} 張附件`, '📎');
    } catch (e) { _toast('❌ 儲存失敗：' + e.message, '⚠️'); }
    if (result.failed.length > 0) setTimeout(() => _toast(`⚠️ ${result.failed.length} 張上傳失敗`, '⚠️'), 1500);
  }

  async function deleteAttachment(dayKey, attId) {
    if (!_canWrite()) { _toast('🔒 訪客無法刪除', '⚠️'); return; }
    const list = getAttachments(dayKey);
    const att = list.find(a => a.id === attId);
    if (!att) return;
    const isOwner = att.uploader === _currentUser();
    if (!isOwner && !_isAdmin()) { _toast('🔒 只能刪除自己上傳的附件', '⚠️'); return; }
    if (!confirm('確定要移除這張附件嗎？')) return;
    const next = list.filter(a => a.id !== attId);
    try { await _saveAttachments(dayKey, next); _toast('🗑 已移除', '📎'); _haptic(10); }
    catch (e) { _toast('❌ 刪除失敗', '⚠️'); }
  }

  function buildAttachmentsInnerHtml(dayKey, options) {
    const opts = options || {};
    const showAddBtn = opts.showAddBtn !== false;
    const list = getAttachments(dayKey);
    const writable = _canWrite();
    const me = _currentUser();
    const admin = _isAdmin();

    let html = '';

    if (list.length === 0 && !writable) {
      return '<div class="event-att-empty">尚無附件</div>';
    }

    if (list.length > 0) {
      html += '<div class="event-att-grid">';
      list.forEach((att, i) => {
        const canDelete = writable && (att.uploader === me || admin);
        const safeUrl = _esc(att.thumb || att.url);
        const safeId = _esc(att.id);
        const safeKey = _esc(dayKey);
        html += `
          <div class="event-att-item">
            <img src="${safeUrl}" alt="" loading="lazy" decoding="async"
                 onclick="Uploads.openAttLightbox('${safeKey}', ${i})">
            ${canDelete ? `<button type="button" class="event-att-del"
                 onclick="event.stopPropagation();Uploads.deleteAttachment('${safeKey}','${safeId}')"
                 aria-label="刪除">×</button>` : ''}
          </div>`;
      });
      html += '</div>';
    }

    if (writable && showAddBtn) {
      const safeKey = _esc(dayKey);
      html += `
        <button type="button" class="event-att-add-line"
                onclick="event.preventDefault();event.stopPropagation();Uploads.pickAndUpload('${safeKey}')">
          <span class="event-att-add-line-icon">＋</span>
          <span>加入附件</span>
        </button>`;
    }

    return html;
  }

  // ============================================================
  // ⭐ v3.5：同步更新標籤列徽章 + 動作列按鈕徽章
  // ============================================================
  function renderAllAttachments() {
    // ───── 1. 附件內容區 ─────
    document.querySelectorAll('.event-attachments').forEach(el => {
      const dayKey = _getEventKeyFromEl(el);
      if (!dayKey) return;

      const list = getAttachments(dayKey);
      const note = getEventNote(dayKey);
      let inner = '';
      if (list.length > 0) {
        inner += '<div class="event-att-header"><span class="event-att-title">📎 附件</span>';
        inner += `<span class="event-att-count">${list.length}</span></div>`;
        inner += '<div class="event-att-grid">';
        list.forEach((att, i) => {
          const canDelete = _canWrite() && (att.uploader === _currentUser() || _isAdmin());
          const safeUrl = _esc(att.thumb || att.url);
          const safeId = _esc(att.id);
          const safeKey = _esc(dayKey);
          inner += `<div class="event-att-item"><img src="${safeUrl}" alt="" loading="lazy" onclick="Uploads.openAttLightbox('${safeKey}', ${i})">`;
          if (canDelete) inner += `<button type="button" class="event-att-del" onclick="event.stopPropagation();Uploads.deleteAttachment('${safeKey}','${safeId}')" aria-label="刪除">×</button>`;
          inner += `</div>`;
        });
        inner += '</div>';
      }
      if (note && note.text) {
        inner += '<div class="event-note-display"><span class="event-note-icon">📝</span><span class="event-note-text">' + _esc(note.text) + '</span></div>';
      }
      el.innerHTML = inner;
      el.style.display = inner ? '' : 'none';
    });

    // ───── 2. 標籤列徽章 + 動作列按鈕徽章 ─────
    document.querySelectorAll('details.event-card').forEach(card => {
      const dayKey = _getEventKeyFromEl(card);
      if (!dayKey) return;

      const total = getAttachments(dayKey).length + (getEventNote(dayKey)?.text ? 1 : 0);
      const titleEl = card.querySelector('.event-title');
      const eventTitle = titleEl ? titleEl.textContent.trim() : '';

      // 2a. 標籤列徽章（折疊時顯示）
      const tagRow = card.querySelector('.event-tag-row');
      if (tagRow) {
        let inlineBadge = tagRow.querySelector('.event-inline-data-badge');
        if (total > 0) {
          if (inlineBadge) {
            const countEl = inlineBadge.querySelector('.event-inline-data-badge-count');
            if (countEl) countEl.textContent = '（' + total + '）';
          } else {
            inlineBadge = document.createElement('button');
            inlineBadge.type = 'button';
            inlineBadge.className = 'event-inline-data-badge';
            inlineBadge.setAttribute('data-action', 'event-data');
            inlineBadge.setAttribute('data-event-key', dayKey);
            inlineBadge.setAttribute('data-event-title', eventTitle);
            inlineBadge.setAttribute('aria-label', '查看資料');
            inlineBadge.innerHTML = 
  '<svg class="event-inline-data-badge-icon" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>' +
  '</svg>' +
  '<span class="event-inline-data-badge-count">（' + total + '）</span>';
            inlineBadge.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              window.Uploads.openEventData(dayKey, eventTitle);
            });
            tagRow.appendChild(inlineBadge);
          }
        } else if (inlineBadge) {
          inlineBadge.remove();
        }
      }

      // 2b. 動作列按鈕徽章（展開時顯示）
      const btn = card.querySelector('.event-action-btn[data-action="event-data"]');
      if (btn) {
        btn.dataset.eventKey = dayKey;
        let badge = btn.querySelector('.badge');
        if (total > 0) {
          if (badge) badge.textContent = total;
          else {
            badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = total;
            btn.appendChild(badge);
          }
        } else if (badge) {
          badge.remove();
        }
      }
    });
  }

  function openAttLightbox(dayKey, index) {
    const list = getAttachments(dayKey);
    const urls = list.map(a => a.url);
    openLightbox(urls, index);
  }

  function openEventData(dayKey, eventTitle) {
    _currentEventKey = dayKey;
    _currentEventTitle = eventTitle || '';
    _currentTab = 'attach';

    const m = document.getElementById('event-data-modal');
    if (!m) return;

    const titleEl = document.getElementById('event-data-title');
    if (titleEl) titleEl.textContent = '📎 資料' + (_currentEventTitle ? ' · ' + _currentEventTitle : '');

    renderEventDataModal();

    m.style.display = 'flex';
    m.classList.add('active');
    document.body.classList.add('modal-open');
    _haptic(8);
  }

  function closeEventData() {
    const m = document.getElementById('event-data-modal');
    if (!m) return;
    m.classList.remove('active');
    setTimeout(() => { m.style.display = 'none'; }, 300);
    const a = document.querySelector('.modal-overlay.active');
    if (!a) document.body.classList.remove('modal-open');
    _currentEventKey = null;
    _haptic(6);
  }

  function switchEventDataTab(tab) {
    _currentTab = tab === 'note' ? 'note' : 'attach';
    renderEventDataModal();
    _haptic(6);
  }

  function renderEventDataModal() {
    if (!_currentEventKey) return;

    const attachPanel = document.getElementById('event-data-attach-panel');
    const notePanel = document.getElementById('event-data-note-panel');
    const tabAttach = document.querySelector('[data-event-data-tab="attach"]');
    const tabNote = document.querySelector('[data-event-data-tab="note"]');
    if (!attachPanel || !notePanel) return;

    const dayKey = _currentEventKey;
    const list = getAttachments(dayKey);
    const note = getEventNote(dayKey);

    if (tabAttach) tabAttach.classList.toggle('active', _currentTab === 'attach');
    if (tabNote) tabNote.classList.toggle('active', _currentTab === 'note');
    if (tabAttach) {
      const cnt = tabAttach.querySelector('.tab-count');
      if (cnt) cnt.textContent = list.length;
    }

    attachPanel.classList.toggle('hidden', _currentTab !== 'attach');
    notePanel.classList.toggle('hidden', _currentTab !== 'note');

    if (_currentTab === 'attach') {
      attachPanel.innerHTML = buildAttachmentsInnerHtml(dayKey, { showAddBtn: true });
    }

    if (_currentTab === 'note') {
      const isWritable = _canWrite();
      let noteHtml = '';
      if (isWritable) {
        noteHtml += `<textarea id="event-data-note-input" rows="5" placeholder="寫下這個行程的備註…（全家都能看到）"
          class="event-note-textarea">${_esc(note?.text || '')}</textarea>`;
        noteHtml += '<div class="event-note-actions">';
        noteHtml += `<span class="event-note-meta">${note?.updatedBy ? '上次更新：' + _esc(note.updatedBy) + ' · ' + new Date(note.updatedAt).toLocaleString('zh-HK', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>`;
        noteHtml += '<button type="button" onclick="Uploads.saveEventNote()" class="event-note-save-btn">💾 儲存</button>';
        noteHtml += '</div>';
      } else {
        noteHtml = note?.text
          ? `<div class="event-note-readonly">${_esc(note.text)}</div>`
          : '<div class="event-note-readonly event-note-empty">尚無備註</div>';
      }
      notePanel.innerHTML = noteHtml;
    }
  }

  async function saveEventNote() {
    if (!_currentEventKey) return;
    if (!_canWrite()) { _toast('🔒 訪客無法編輯', '⚠️'); return; }

    const input = document.getElementById('event-data-note-input');
    if (!input) return;
    const text = input.value.trim();

    const noteObj = {
      text,
      updatedAt: Date.now(),
      updatedBy: _currentUser()
    };

    try {
      await _saveNote(_currentEventKey, noteObj);
      _toast(text ? '✅ 備註已儲存' : '🗑 備註已清空', '📝');
      _haptic(15);
    } catch (e) {
      _toast('❌ 儲存失敗：' + e.message, '⚠️');
    }
  }

  function test() {
    const existing = document.getElementById('__uploads-test-modal');
    if (existing) existing.remove();
    _toast('測試 UI 保留舊版，無需使用', '🧪');
  }

  window.Uploads = {
    compress, uploadBlob, uploadFiles, openLightbox, test,
    canWrite: _canWrite, currentUser: _currentUser,
    getAttachments,
    getEventNote,
    buildAttachmentsInnerHtml,
    renderAllAttachments,
    pickAndUpload,
    deleteAttachment,
    openAttLightbox,
    openEventData,
    closeEventData,
    switchEventDataTab,
    saveEventNote,
    renderEventDataModal
  };

  console.log('[Uploads] v3.5（雙徽章同步）載入完成');
})();