/* ============================================================
 * app-uploads.js — 通用上傳 + 行程資料 v3.11
 *
 * v3.5：雙徽章同步
 * v3.6：renderAllAttachments 支援 scope 參數
 * v3.7：uploadFiles 並行上傳
 * v3.8：離線守衛
 * v3.9：
 *   - Fallback：讀取時新 id 找不到 → 試舊 key d{day}-e{index}
 *   - 寫入時統一存到新 id，順便清理舊 key
 * v3.10（修復「重整後附件消失」）：
 *   - _saveAttachments 改為「與雲端合併」
 *   - _doUpload 只傳「這次新圖」
 *   - 新增 _hydrateFromCloud()
 * v3.11（PDF 支援）：
 *   - ⭐ 支援 PDF 上傳（走 catbox.moe，不需 API key）
 *   - ⭐ 附件物件多 type 欄位（"image" | "pdf"）
 *   - ⭐ PDF 縮圖用 📄 圖示 + 檔名
 *   - ⭐ PDF 點擊 → 開新視窗
 *   - ⭐ 向下相容：舊附件無 type → 當作 image
 * ============================================================ */

(function () {
  'use strict';

  const IMGBB_API_KEY = 'c810acea8fd53f787b34d7e81e6f759a';
  const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';
  const CATBOX_ENDPOINT = 'https://catbox.moe/user/api.php';
  const MAX_EDGE = 1600;
  const QUALITY = 0.82;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;   // 圖片 10 MB
  const MAX_PDF_SIZE = 32 * 1024 * 1024;     // PDF 32 MB
  const UPLOAD_CONCURRENCY = 3;

  if (!window.cloudAttachments) window.cloudAttachments = {};
  if (!window.cloudEventNotes) window.cloudEventNotes = {};

  let _currentEventKey = null;
  let _currentEventTitle = '';
  let _currentTab = 'attach';

  // ============================================================
  // Key 映射（新 id ↔ 舊 key）
  // ============================================================
  let _keyMapCache = null;
  let _keyMapCacheSignature = '';

  function _computeItinerarySignature() {
    const itineraries = window.winterItineraries || [];
    let sig = '';
    for (const day of itineraries) {
      sig += day.day + ':' + day.events.length + ';';
      for (const evt of day.events) {
        const key = evt.id || evt.title || '';
        sig += key.length + '#' + key.substring(0, 4) + ',';
      }
      sig += '|';
    }
    return sig;
  }

  function _buildKeyMap() {
    const sig = _computeItinerarySignature();
    if (_keyMapCache && _keyMapCacheSignature === sig) return _keyMapCache;

    const newToOld = {};
    const oldToNew = {};
    const itineraries = window.winterItineraries || [];

    itineraries.forEach(day => {
      day.events.forEach((evt, idx) => {
        const oldKey = `d${day.day}-e${idx}`;
        if (evt.id) {
          newToOld[evt.id] = oldKey;
          oldToNew[oldKey] = evt.id;
        }
      });
    });

    _keyMapCache = { newToOld, oldToNew };
    _keyMapCacheSignature = sig;
    return _keyMapCache;
  }

  function _getOldKeyForNewId(newId) {
    if (!newId) return null;
    const map = _buildKeyMap();
    return map.newToOld[newId] || null;
  }

  function _getNewIdForOldKey(oldKey) {
    if (!oldKey) return null;
    const map = _buildKeyMap();
    return map.oldToNew[oldKey] || null;
  }

  function _normalizeKey(dayKey) {
    if (!dayKey) return dayKey;
    const newId = _getNewIdForOldKey(dayKey);
    if (newId) return newId;
    return dayKey;
  }

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

  function _isPdfAttachment(att) {
    return att && att.type === 'pdf';
  }

  function _formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  // ============================================================
  // 壓縮（圖片壓縮、PDF 直接通過）
  // ============================================================
  function compress(file) {
    return new Promise((resolve, reject) => {
      if (!file) { reject(new Error('沒有檔案')); return; }

      // ⭐ PDF：不壓縮，直接回傳
      if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')) {
        if (file.size > MAX_PDF_SIZE) {
          reject(new Error(`PDF 過大（${(file.size / 1024 / 1024).toFixed(1)}MB，上限 ${MAX_PDF_SIZE / 1024 / 1024}MB）`));
          return;
        }
        resolve(file);
        return;
      }

      // 圖片流程
      if (!file.type || !file.type.startsWith('image/')) {
        reject(new Error('只支援圖片或 PDF'));
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        reject(new Error(`圖片過大（${Math.round(file.size / 1024 / 1024)}MB）`));
        return;
      }

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
  // 上傳：依類型分流
  // ============================================================
  async function uploadBlob(blob, opts = {}) {
    const isPdf = (blob.type === 'application/pdf') || (opts.type === 'pdf');
    if (isPdf) {
      return await _uploadToCatbox(blob, opts);
    }
    return await _uploadToImgbb(blob, opts);
  }

  async function _uploadToImgbb(blob, opts = {}) {
    const base64 = await _blobToBase64(blob);
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64);
    const res = await fetch(IMGBB_ENDPOINT, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`imgbb HTTP ${res.status}`);
    const json = await res.json();
    if (!json || !json.success || !json.data) throw new Error('imgbb 上傳失敗');
    const data = json.data;
    return {
      id: _genId(),
      type: 'image',
      url: data.url || data.display_url,
      thumb: (data.thumb && data.thumb.url) || data.url,
      deleteUrl: data.delete_url || '',
      name: opts.name || '',
      size: blob.size || null,
      uploader: _currentUser(),
      uploadedAt: Date.now(),
      category: opts.category || 'other',
      day: opts.day || null,
      note: opts.note || ''
    };
  }

  // ⭐ PDF 走 catbox.moe（免費、無 API key、支援 200MB）
  async function _uploadToCatbox(blob, opts = {}) {
    const filename = opts.name || opts.filename || ('file-' + Date.now() + '.pdf');
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, filename);

    let res;
    try {
      res = await fetch(CATBOX_ENDPOINT, { method: 'POST', body: formData });
    } catch (e) {
      throw new Error('PDF 上傳失敗（網路或 CORS）：' + (e.message || e));
    }
    if (!res.ok) throw new Error(`catbox HTTP ${res.status}`);

    const text = (await res.text()).trim();
    if (!text || !/^https?:\/\//i.test(text)) {
      throw new Error('catbox 回應異常：' + text.substring(0, 80));
    }

    return {
      id: _genId(),
      type: 'pdf',
      url: text,
      thumb: null,
      name: filename,
      size: blob.size || null,
      uploader: _currentUser(),
      uploadedAt: Date.now(),
      category: opts.category || 'other',
      day: opts.day || null,
      note: opts.note || ''
    };
  }

  async function uploadFiles(files, opts = {}) {
    if (!_canWrite()) { _toast('🔒 訪客無法上傳', '⚠️'); return { success: [], failed: [] }; }

    if (typeof window.requireOnline === 'function' && !window.requireOnline('上傳')) {
      return { success: [], failed: [] };
    }

    const list = Array.from(files || []);
    if (list.length === 0) return { success: [], failed: [] };

    const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;
    const total = list.length;
    const success = [];
    const failed = [];
    let done = 0;
    let cursor = 0;

    async function worker() {
      while (cursor < list.length) {
        const i = cursor++;
        const file = list[i];
        try {
          if (onProgress) onProgress({ phase: 'compress', current: done + 1, total });
          const blob = await compress(file);

          if (onProgress) onProgress({ phase: 'upload', current: done + 1, total });

          // ⭐ 依檔案類型分流
          const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
          const meta = await uploadBlob(blob, {
            ...opts,
            type: isPdf ? 'pdf' : 'image',
            name: file.name || (isPdf ? 'file.pdf' : 'image.jpg'),
            filename: file.name || (isPdf ? 'file.pdf' : 'image.jpg')
          });

          success.push(meta);
        } catch (e) {
          failed.push({ file: file && file.name, error: e.message || String(e) });
        }
        done++;
        if (onProgress) onProgress({ phase: 'done', current: done, total });
      }
    }

    const workers = [];
    const workerCount = Math.min(UPLOAD_CONCURRENCY, list.length);
    for (let w = 0; w < workerCount; w++) {
      workers.push(worker());
    }
    await Promise.all(workers);

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

  // ============================================================
  // getAttachments / getEventNote（含 Fallback）
  // ============================================================
  function getAttachments(dayKey) {
    if (!dayKey) return [];
    const store = window.cloudAttachments || {};

    const direct = store[dayKey];
    if (Array.isArray(direct) && direct.length > 0) return direct;

    const altKey = _getOldKeyForNewId(dayKey) || _getNewIdForOldKey(dayKey);
    if (altKey && altKey !== dayKey) {
      const alt = store[altKey];
      if (Array.isArray(alt) && alt.length > 0) return alt;
    }

    return Array.isArray(direct) ? direct : [];
  }

  function getEventNote(dayKey) {
    if (!dayKey) return null;
    const notes = window.cloudEventNotes || {};

    if (notes[dayKey]) return notes[dayKey];

    const altKey = _getOldKeyForNewId(dayKey) || _getNewIdForOldKey(dayKey);
    if (altKey && altKey !== dayKey && notes[altKey]) return notes[altKey];

    return null;
  }

  // ============================================================
  // _saveAttachments（雲端合併）
  // ============================================================
  async function _saveAttachments(dayKey, items, opts = {}) {
    const replaceMode = opts.replace === true;

    if (typeof window.requireOnline === 'function' && !window.requireOnline('儲存附件')) {
      throw new Error('離線中');
    }
    if (!window.dbRef) throw new Error('雲端未連線');

    const targetKey = _normalizeKey(dayKey);
    const staleKey = _getOldKeyForNewId(targetKey);

    const docSnap = await window.dbRef.get();
    const cloudData = docSnap.exists ? docSnap.data() : {};
    const attachments = { ...(cloudData.attachments || {}) };

    const seen = new Set();
    const cloudList = [];
    const _pushUnique = (arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach(a => {
        if (a && a.id && !seen.has(a.id)) {
          seen.add(a.id);
          cloudList.push(a);
        }
      });
    };
    _pushUnique(attachments[targetKey]);
    if (staleKey && staleKey !== targetKey) {
      _pushUnique(attachments[staleKey]);
    }

    let merged;
    if (replaceMode) {
      merged = Array.isArray(items) ? items.slice() : [];
    } else {
      const newItems = Array.isArray(items) ? items : [];
      const toAdd = newItems.filter(a => a && a.id && !seen.has(a.id));
      merged = [...toAdd, ...cloudList];
    }

    attachments[targetKey] = merged;
    if (staleKey && staleKey !== targetKey) {
      delete attachments[staleKey];
    }

    if (!window.cloudAttachments) window.cloudAttachments = {};
    window.cloudAttachments[targetKey] = merged;
    if (staleKey && staleKey !== targetKey) {
      delete window.cloudAttachments[staleKey];
    }

    renderAllAttachments();
    renderEventDataModal();

    await window.dbRef.set({ attachments, updatedAt: Date.now() }, { merge: true });
  }

  async function _saveNote(dayKey, noteObj) {
    if (typeof window.requireOnline === 'function' && !window.requireOnline('儲存備註')) {
      throw new Error('離線中');
    }
    if (!window.dbRef) throw new Error('雲端未連線');

    const targetKey = _normalizeKey(dayKey);
    const staleKey = _getOldKeyForNewId(targetKey);

    const docSnap = await window.dbRef.get();
    const cloudData = docSnap.exists ? docSnap.data() : {};
    const eventNotes = { ...(cloudData.eventNotes || {}) };

    eventNotes[targetKey] = noteObj;
    if (staleKey && staleKey !== targetKey) {
      delete eventNotes[staleKey];
    }

    if (!window.cloudEventNotes) window.cloudEventNotes = {};
    window.cloudEventNotes[targetKey] = noteObj;
    if (staleKey && staleKey !== targetKey) {
      delete window.cloudEventNotes[staleKey];
    }

    renderAllAttachments();
    renderEventDataModal();

    await window.dbRef.set({ eventNotes, updatedAt: Date.now() }, { merge: true });
  }

  // ============================================================
  // 選擇檔案
  // ============================================================
  function pickAndUpload(dayKey) {
    _pickFiles(dayKey, 'image/*', '圖片');
  }

  // ⭐ PDF 上傳
  function pickAndUploadPdf(dayKey) {
    _pickFiles(dayKey, 'application/pdf', 'PDF');
  }

  function _pickFiles(dayKey, accept, label) {
    if (!_canWrite()) { _toast('🔒 訪客無法上傳', '⚠️'); return; }
    if (typeof window.requireOnline === 'function' && !window.requireOnline('上傳')) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = true;
    input.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(input);

    input.addEventListener('change', async () => {
      const files = Array.from(input.files || []);
      setTimeout(() => { try { document.body.removeChild(input); } catch (e) {} }, 100);
      if (files.length === 0) return;
      await _doUpload(dayKey, files);
    });

    setTimeout(() => {
      try { input.click(); }
      catch (e) { _toast('無法開啟檔案選擇器', '⚠️'); }
    }, 0);
  }

  // ⭐ 上傳流程（只傳新檔，合併交給 _saveAttachments）
  async function _doUpload(dayKey, files) {
    const total = files.length;
    _toast(`⏳ 處理 ${total} 個檔案…`, '📤');

    const result = await uploadFiles(files, {
      onProgress: ({ phase, current, total: t }) => {
        const p25 = Math.floor(t * 0.25);
        const p50 = Math.floor(t * 0.5);
        const p75 = Math.floor(t * 0.75);
        if (current === p25 || current === p50 || current === p75) {
          _toast(`⏳ 已處理 ${current}/${t}`, '📤');
        }
      }
    });

    if (result.success.length === 0) {
      if (result.failed.length > 0) {
        _toast(`❌ 全部失敗（${result.failed.length} 個）`, '⚠️');
        console.warn('[Uploads] 失敗詳情:', result.failed);
      }
      return;
    }

    try {
      await _saveAttachments(dayKey, result.success);
      _toast(`✅ 已加入 ${result.success.length} 個附件`, '📎');
    } catch (e) {
      _toast('❌ 儲存失敗：' + e.message, '⚠️');
    }

    if (result.failed.length > 0) {
      setTimeout(() => _toast(`⚠️ ${result.failed.length} 個上傳失敗`, '⚠️'), 1500);
    }
  }

  // ============================================================
  // 刪除附件
  // ============================================================
  async function deleteAttachment(dayKey, attId) {
    if (!_canWrite()) { _toast('🔒 訪客無法刪除', '⚠️'); return; }
    if (typeof window.requireOnline === 'function' && !window.requireOnline('刪除')) return;

    const list = getAttachments(dayKey);
    const att = list.find(a => a.id === attId);
    if (!att) return;

    const isOwner = att.uploader === _currentUser();
    if (!isOwner && !_isAdmin()) { _toast('🔒 只能刪除自己上傳的附件', '⚠️'); return; }
    if (!confirm('確定要移除這個附件嗎？')) return;

    const next = list.filter(a => a.id !== attId);

    try {
      await _saveAttachments(dayKey, next, { replace: true });
      _toast('🗑 已移除', '📎');
      _haptic(10);
    } catch (e) {
      _toast('❌ 刪除失敗', '⚠️');
    }
  }

  // ============================================================
  // 產生附件區 HTML
  // ============================================================
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
        const safeId = _esc(att.id);
        const safeKey = _esc(dayKey);

        if (_isPdfAttachment(att)) {
          // ⭐ PDF 縮圖
          const safeName = _esc(att.name || 'PDF');
          const sizeLabel = att.size ? _formatFileSize(att.size) : '';
          html += `
            <div class="event-att-item event-att-item-pdf"
                 onclick="Uploads.openPdfAttachment('${safeKey}', ${i})">
              <div class="event-att-pdf-icon">📄</div>
              <div class="event-att-pdf-name">${safeName}</div>
              ${sizeLabel ? `<div class="event-att-pdf-size">${sizeLabel}</div>` : ''}
              ${canDelete ? `<button type="button" class="event-att-del"
                 onclick="event.stopPropagation();Uploads.deleteAttachment('${safeKey}','${safeId}')"
                 aria-label="刪除">×</button>` : ''}
            </div>`;
        } else {
          // 圖片
          const safeUrl = _esc(att.thumb || att.url);
          html += `
            <div class="event-att-item">
              <img src="${safeUrl}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"
                   onclick="Uploads.openAttLightbox('${safeKey}', ${i})">
              ${canDelete ? `<button type="button" class="event-att-del"
                   onclick="event.stopPropagation();Uploads.deleteAttachment('${safeKey}','${safeId}')"
                   aria-label="刪除">×</button>` : ''}
            </div>`;
        }
      });
      html += '</div>';
    }

    if (writable && showAddBtn) {
      const safeKey = _esc(dayKey);
      html += `
        <div class="event-att-add-row">
          <button type="button" class="event-att-add-line"
                  onclick="event.preventDefault();event.stopPropagation();Uploads.pickAndUpload('${safeKey}')">
            <span class="event-att-add-line-icon">📷</span>
            <span>加入圖片</span>
          </button>
          <button type="button" class="event-att-add-line event-att-add-line-pdf"
                  onclick="event.preventDefault();event.stopPropagation();Uploads.pickAndUploadPdf('${safeKey}')">
            <span class="event-att-add-line-icon">📄</span>
            <span>加入 PDF</span>
          </button>
        </div>`;
    }

    return html;
  }

  // ============================================================
  // renderAllAttachments
  // ============================================================
  function renderAllAttachments(scope) {
    const root = scope || document;

    root.querySelectorAll('.event-attachments').forEach(el => {
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
          const safeId = _esc(att.id);
          const safeKey = _esc(dayKey);

          if (_isPdfAttachment(att)) {
            const safeName = _esc(att.name || 'PDF');
            inner += `<div class="event-att-item event-att-item-pdf" onclick="Uploads.openPdfAttachment('${safeKey}', ${i})">
              <div class="event-att-pdf-icon">📄</div>
              <div class="event-att-pdf-name">${safeName}</div>`;
            if (canDelete) inner += `<button type="button" class="event-att-del" onclick="event.stopPropagation();Uploads.deleteAttachment('${safeKey}','${safeId}')" aria-label="刪除">×</button>`;
            inner += `</div>`;
          } else {
            const safeUrl = _esc(att.thumb || att.url);
            inner += `<div class="event-att-item"><img src="${safeUrl}" alt="" loading="lazy" referrerpolicy="no-referrer" onclick="Uploads.openAttLightbox('${safeKey}', ${i})">`;
            if (canDelete) inner += `<button type="button" class="event-att-del" onclick="event.stopPropagation();Uploads.deleteAttachment('${safeKey}','${safeId}')" aria-label="刪除">×</button>`;
            inner += `</div>`;
          }
        });
        inner += '</div>';
      }
      if (note && note.text) {
        inner += '<div class="event-note-display"><span class="event-note-icon">📝</span><span class="event-note-text">' + _esc(note.text) + '</span></div>';
      }
      el.innerHTML = inner;
      el.style.display = inner ? '' : 'none';
    });

    root.querySelectorAll('details.event-card').forEach(card => {
      const dayKey = _getEventKeyFromEl(card);
      if (!dayKey) return;

      const total = getAttachments(dayKey).length + (getEventNote(dayKey)?.text ? 1 : 0);
      const titleEl = card.querySelector('.event-title');
      const eventTitle = titleEl ? titleEl.textContent.trim() : '';

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

  // ============================================================
  // 燈箱 / 開啟
  // ============================================================
  function openAttLightbox(dayKey, index) {
    const list = getAttachments(dayKey);
    const urls = list.filter(a => !_isPdfAttachment(a)).map(a => a.url);
    // 找出對應的圖片在過濾後的 index
    const original = list[index];
    if (!original || _isPdfAttachment(original)) return;
    const imageList = list.filter(a => !_isPdfAttachment(a));
    const imgIdx = imageList.findIndex(a => a.id === original.id);
    openLightbox(urls, imgIdx >= 0 ? imgIdx : 0);
  }

  // ⭐ 點擊 PDF → 開新視窗
  function openPdfAttachment(dayKey, index) {
    const list = getAttachments(dayKey);
    const att = list[index];
    if (!att || !att.url) return;
    _haptic(8);
    window.open(att.url, '_blank', 'noopener,noreferrer');
  }

  // ============================================================
  // Modal
  // ============================================================
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

  // ============================================================
  // 主動從雲端補一次（保險）
  // ============================================================
  async function _hydrateFromCloud() {
    if (!window.dbRef) return;
    try {
      const snap = await window.dbRef.get();
      if (!snap.exists) return;
      const data = snap.data() || {};
      let changed = false;

      if (data.attachments && typeof data.attachments === 'object') {
        if (Object.keys(data.attachments).length > 0) {
          window.cloudAttachments = data.attachments;
          changed = true;
        }
      }
      if (data.eventNotes && typeof data.eventNotes === 'object') {
        if (Object.keys(data.eventNotes).length > 0) {
          window.cloudEventNotes = data.eventNotes;
          changed = true;
        }
      }

      if (changed) {
        renderAllAttachments();
        console.log('[Uploads] v3.11 已從雲端補齊附件');
      }
    } catch (e) {
      console.warn('[Uploads] hydrate 失敗:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(_hydrateFromCloud, 2000);
    });
  } else {
    setTimeout(_hydrateFromCloud, 2000);
  }

  window.addEventListener('focus', () => {
    const u = _currentUser();
    if (u && u !== '訪客') {
      setTimeout(_hydrateFromCloud, 500);
    }
  });

  // ============================================================
  // 對外 API
  // ============================================================
  window.Uploads = {
    compress, uploadBlob, uploadFiles, openLightbox, test,
    canWrite: _canWrite, currentUser: _currentUser,
    getAttachments,
    getEventNote,
    buildAttachmentsInnerHtml,
    renderAllAttachments,
    pickAndUpload,
    pickAndUploadPdf,
    deleteAttachment,
    openAttLightbox,
    openPdfAttachment,
    openEventData,
    closeEventData,
    switchEventDataTab,
    saveEventNote,
    renderEventDataModal,
    normalizeKey: _normalizeKey,
    getOldKeyForNewId: _getOldKeyForNewId,
    getNewIdForOldKey: _getNewIdForOldKey,
    hydrateFromCloud: _hydrateFromCloud
  };

  console.log('[Uploads] v3.11（支援 PDF）載入完成');
})();