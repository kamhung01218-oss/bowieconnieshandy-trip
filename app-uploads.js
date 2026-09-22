/* ============================================================
 * app-uploads.js — 通用上傳 + 行程附件 v2.1（Phase 2）
 *
 * v2.1 變更：
 *   - ⭐ 更換 imgbb API Key
 *   - ⭐ 修復手機點擊無反應（改用 position:fixed 取代 display:none）
 *   - ⭐ 加入 Console log 方便除錯
 *
 * 資料結構（Firestore: tohoku_trip/shared_expenses）
 *   attachments: {
 *     "d1-e2": [
 *       { id, url, thumb, deleteUrl, uploader, uploadedAt }
 *     ]
 *   }
 * ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // 設定
  // ============================================================
  const IMGBB_API_KEY = 'c810acea8fd53f787b34d7e81e6f759a';
  const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';
  const MAX_EDGE = 1600;
  const QUALITY = 0.82;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // 全域附件快取
  if (!window.cloudAttachments) window.cloudAttachments = {};

  // ============================================================
  // 工具
  // ============================================================
  function _currentUser() {
    try {
      return window.currentUser
        || localStorage.getItem('tohoku_current_user')
        || '訪客';
    } catch (e) { return '訪客'; }
  }

  function _canWrite() {
    const u = _currentUser();
    return !!u && u !== '訪客';
  }

  function _isAdmin() {
    try {
      return typeof window.isAdminUnlocked === 'function' && window.isAdminUnlocked();
    } catch (e) { return false; }
  }

  function _toast(msg, icon) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, icon || '✅');
    } else {
      console.log('[Uploads]', msg);
    }
  }

  function _haptic(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms || 8); } catch (e) {} }
  }

  function _esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function _genId() {
    return 'ph-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  }

  // ============================================================
  // 圖片壓縮
  // ============================================================
  function compress(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type || !file.type.startsWith('image/')) {
        reject(new Error('不是圖片檔案'));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`檔案過大（${Math.round(file.size / 1024 / 1024)}MB）`));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('讀取失敗'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('解碼失敗'));
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > MAX_EDGE) {
            height = Math.round((height * MAX_EDGE) / width);
            width = MAX_EDGE;
          } else if (height > MAX_EDGE) {
            width = Math.round((width * MAX_EDGE) / height);
            height = MAX_EDGE;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('壓縮失敗')),
            'image/jpeg',
            QUALITY
          );
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
        if (!base64) reject(new Error('Base64 為空'));
        else resolve(base64);
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

    console.log('[Uploads] 開始上傳到 imgbb，base64 長度:', base64.length);

    const res = await fetch(IMGBB_ENDPOINT, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    console.log('[Uploads] imgbb 回應:', json);

    if (!json || !json.success || !json.data) {
      throw new Error((json && json.error && json.error.message) || 'imgbb 失敗');
    }

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

  // ============================================================
  // 批次上傳
  // ============================================================
  async function uploadFiles(files, opts = {}) {
    if (!_canWrite()) {
      _toast('🔒 訪客無法上傳', '⚠️');
      return { success: [], failed: [] };
    }
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
        console.warn('[Uploads] failed:', file && file.name, e);
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
    if (typeof window.openLightbox === 'function') {
      window.openLightbox(urls, idx);
    } else {
      window.open(urls[idx], '_blank');
    }
  }

  // ============================================================
  // ⭐ Phase 2：附件讀取
  // ============================================================
  function getAttachments(dayKey) {
    if (!dayKey) return [];
    const list = window.cloudAttachments && window.cloudAttachments[dayKey];
    return Array.isArray(list) ? list : [];
  }

  function _countAttachments(dayKey) {
    return getAttachments(dayKey).length;
  }

  // ============================================================
  // ⭐ Phase 2：附件寫入 Firestore
  // ============================================================
  async function _saveAttachments(dayKey, list) {
    if (!window.dbRef) throw new Error('雲端未連線');
    const docSnap = await window.dbRef.get();
    const cloudData = docSnap.exists ? docSnap.data() : {};
    const attachments = { ...(cloudData.attachments || {}) };
    attachments[dayKey] = list;
    await window.dbRef.set({
      attachments,
      updatedAt: Date.now()
    }, { merge: true });
  }

  // ============================================================
  // ⭐ Phase 2：上傳流程（v2.1 修復手機點擊問題）
  // ============================================================
  function pickAndUpload(dayKey) {
    console.log('[Uploads] pickAndUpload 被呼叫, dayKey:', dayKey, 'canWrite:', _canWrite());

    if (!_canWrite()) {
      _toast('🔒 訪客無法上傳', '⚠️');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    // ⭐ 關鍵修復：不用 display:none，改用「移出畫面」的方式
    // 解決 iOS Safari / 部分 Android 瀏覽器點擊無反應
    input.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
    input.setAttribute('aria-hidden', 'true');
    document.body.appendChild(input);

    input.addEventListener('change', async () => {
      const files = Array.from(input.files || []);
      console.log('[Uploads] 使用者選擇了', files.length, '個檔案');
      setTimeout(() => {
        try { document.body.removeChild(input); } catch (e) {}
      }, 100);
      if (files.length === 0) return;
      await _doUpload(dayKey, files);
    });

    // ⭐ 用 setTimeout 確保 iOS 認得是「使用者手勢」觸發
    setTimeout(() => {
      try {
        input.click();
      } catch (e) {
        console.error('[Uploads] input.click() 失敗:', e);
        _toast('無法開啟檔案選擇器', '⚠️');
      }
    }, 0);
  }

  async function _doUpload(dayKey, files) {
    const total = files.length;
    _toast(`⏳ 處理 ${total} 張…`, '📤');
    console.log('[Uploads] 開始處理', total, '張圖片');

    const result = await uploadFiles(files, {
      onProgress: ({ phase, current, total: t }) => {
        if (current === t || current % 3 === 0) {
          const label = phase === 'compress' ? '壓縮' : phase === 'upload' ? '上傳' : '完成';
          _toast(`⏳ ${label} ${current}/${t}`, '📤');
        }
      }
    });

    console.log('[Uploads] 上傳結果:', result);

    if (result.success.length === 0) {
      _toast(`❌ 全部失敗（${result.failed.length} 張）`, '⚠️');
      return;
    }

    // 寫入 Firestore
    try {
      const existing = getAttachments(dayKey);
      const merged = [...result.success, ...existing];
      await _saveAttachments(dayKey, merged);
      _toast(`✅ 已加入 ${result.success.length} 張附件`, '📎');
      console.log('[Uploads] 已寫入 Firestore');
    } catch (e) {
      console.error('[Uploads] save failed:', e);
      _toast('❌ 儲存失敗：' + e.message, '⚠️');
    }

    if (result.failed.length > 0) {
      setTimeout(() => _toast(`⚠️ ${result.failed.length} 張上傳失敗`, '⚠️'), 1500);
    }
  }

  // ============================================================
  // ⭐ Phase 2：刪除附件
  // ============================================================
  async function deleteAttachment(dayKey, attId) {
    if (!_canWrite()) { _toast('🔒 訪客無法刪除', '⚠️'); return; }

    const list = getAttachments(dayKey);
    const att = list.find(a => a.id === attId);
    if (!att) return;

    const isOwner = att.uploader === _currentUser();
    if (!isOwner && !_isAdmin()) {
      _toast('🔒 只能刪除自己上傳的附件', '⚠️');
      return;
    }

    if (!confirm('確定要從這個行程移除這張附件嗎？')) return;

    const next = list.filter(a => a.id !== attId);
    try {
      await _saveAttachments(dayKey, next);
      _toast('🗑 已移除', '📎');
      _haptic(10);
    } catch (e) {
      _toast('❌ 刪除失敗', '⚠️');
    }
  }

  // ============================================================
  // ⭐ Phase 2：附件區 HTML 生成
  // ============================================================
  function buildAttachmentsInnerHtml(dayKey) {
    const list = getAttachments(dayKey);
    const writable = _canWrite();
    const me = _currentUser();
    const admin = _isAdmin();

    let html = '';

    // 標題列
    html += '<div class="event-att-header">';
    html += '<span class="event-att-title">📎 附件</span>';
    if (list.length > 0) {
      html += `<span class="event-att-count">${list.length}</span>`;
    }
    html += '</div>';

    // 縮圖牆
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
          ${canDelete
            ? `<button type="button" class="event-att-del"
                 onclick="event.stopPropagation();Uploads.deleteAttachment('${safeKey}','${safeId}')"
                 aria-label="刪除">×</button>`
            : ''}
        </div>`;
    });

    // 上傳按鈕
    if (writable) {
      const safeKey = _esc(dayKey);
      html += `
        <button type="button" class="event-att-add"
                onclick="event.preventDefault();event.stopPropagation();Uploads.pickAndUpload('${safeKey}')"
                aria-label="加入附件">
          <span class="event-att-add-icon">＋</span>
          <span class="event-att-add-text">加入</span>
        </button>`;
    }
    html += '</div>';

    // 空狀態（有按鈕時不顯示）
    if (list.length === 0 && !writable) {
      html += '<div class="event-att-empty">尚無附件</div>';
    }

    return html;
  }

  // ============================================================
  // ⭐ Phase 2：重新渲染所有附件區 + 徽章
  // ============================================================
  function renderAllAttachments() {
    // 1. 更新所有附件區
    document.querySelectorAll('.event-attachments').forEach(el => {
      const day = el.dataset.day;
      const index = el.dataset.index;
      if (day == null || index == null) return;
      const dayKey = `d${day}-e${index}`;
      el.innerHTML = buildAttachmentsInnerHtml(dayKey);
    });

    // 2. 更新徽章
    document.querySelectorAll('details.event-card').forEach(card => {
      const day = card.dataset.day;
      const index = card.dataset.index;
      if (day == null || index == null) return;
      const dayKey = `d${day}-e${index}`;
      const count = _countAttachments(dayKey);
      let badge = card.querySelector('.event-att-badge');
      const tagRow = card.querySelector('.event-tag-row');

      if (count > 0) {
        if (badge) {
          badge.textContent = `📎 ${count}`;
        } else if (tagRow) {
          badge = document.createElement('span');
          badge.className = 'event-att-badge';
          badge.textContent = `📎 ${count}`;
          tagRow.appendChild(badge);
        }
      } else if (badge) {
        badge.remove();
      }
    });
  }

  // ============================================================
  // ⭐ Phase 2：從附件區開燈箱
  // ============================================================
  function openAttLightbox(dayKey, index) {
    const list = getAttachments(dayKey);
    const urls = list.map(a => a.url);
    openLightbox(urls, index);
  }

  // ============================================================
  // 測試 UI（Phase 1 保留）
  // ============================================================
  function test() {
    const existing = document.getElementById('__uploads-test-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = '__uploads-test-modal';
    modal.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'background:rgba(15,23,42,0.8)',
      'backdrop-filter:blur(8px)', '-webkit-backdrop-filter:blur(8px)',
      'display:flex', 'align-items:center', 'justify-content:center', 'padding:20px'
    ].join(';');

    modal.innerHTML = `
      <div style="
        background:#fff;border-radius:20px;padding:24px;max-width:420px;width:100%;
        font-family:-apple-system,BlinkMacSystemFont,'Noto Sans TC',sans-serif;
        box-shadow:0 20px 60px rgba(0,0,0,0.4);max-height:85vh;overflow-y:auto;
      ">
        <h3 style="font-size:18px;font-weight:900;margin:0 0 6px;color:#0f172a;">🧪 上傳測試</h3>
        <p style="font-size:12px;color:#64748b;margin:0 0 16px;line-height:1.6;">
          上傳成功會顯示 imgbb URL，不會寫入 Firestore。
        </p>
        <div id="__ut-status" style="padding:10px 12px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;font-size:12px;font-weight:700;color:#0369a1;margin-bottom:12px;line-height:1.5;">準備就緒</div>
        <input id="__ut-input" type="file" accept="image/*" multiple style="display:block;width:100%;font-size:12px;margin-bottom:12px;">
        <div id="__ut-progress" style="display:none;margin-bottom:12px;">
          <div style="height:6px;background:#e0f2fe;border-radius:999px;overflow:hidden;">
            <div id="__ut-progress-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#38bdf8,#0284c7);transition:width 0.3s;"></div>
          </div>
          <div id="__ut-progress-text" style="font-size:11px;color:#0369a1;font-weight:700;text-align:center;margin-top:6px;">0%</div>
        </div>
        <div id="__ut-results"></div>
        <div style="display:flex;gap:8px;margin-top:16px;">
          <button id="__ut-close" style="flex:1;padding:12px;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;color:#475569;font-weight:900;font-size:13px;font-family:inherit;cursor:pointer;">關閉</button>
          <button id="__ut-clear" style="flex:1;padding:12px;border-radius:12px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;font-weight:900;font-size:13px;font-family:inherit;cursor:pointer;">清空結果</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const statusEl = modal.querySelector('#__ut-status');
    const inputEl = modal.querySelector('#__ut-input');
    const progressWrap = modal.querySelector('#__ut-progress');
    const progressFill = modal.querySelector('#__ut-progress-fill');
    const progressText = modal.querySelector('#__ut-progress-text');
    const resultsEl = modal.querySelector('#__ut-results');

    modal.querySelector('#__ut-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    modal.querySelector('#__ut-clear').addEventListener('click', () => {
      resultsEl.innerHTML = '';
      statusEl.textContent = '準備就緒';
      statusEl.style.cssText = 'padding:10px 12px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;font-size:12px;font-weight:700;color:#0369a1;margin-bottom:12px;line-height:1.5;';
    });

    inputEl.addEventListener('change', async () => {
      const files = Array.from(inputEl.files || []);
      inputEl.value = '';
      if (files.length === 0) return;

      statusEl.textContent = `處理 ${files.length} 張…`;
      progressWrap.style.display = 'block';
      progressFill.style.width = '0%';
      progressText.textContent = '0%';

      const result = await uploadFiles(files, {
        category: 'other',
        onProgress: ({ phase, current, total }) => {
          const pct = Math.round((current / total) * 100);
          progressFill.style.width = pct + '%';
          const label = phase === 'compress' ? '壓縮中' : phase === 'upload' ? '上傳中' : '完成';
          progressText.textContent = `${label} ${current}/${total} (${pct}%)`;
        }
      });

      const okCount = result.success.length;
      const failCount = result.failed.length;

      if (failCount === 0) {
        statusEl.textContent = `✅ 全部成功（${okCount} 張）`;
        statusEl.style.cssText = 'padding:10px 12px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;font-size:12px;font-weight:700;color:#047857;margin-bottom:12px;line-height:1.5;';
      } else if (okCount === 0) {
        statusEl.textContent = `❌ 全部失敗（${failCount} 張）`;
        statusEl.style.cssText = 'padding:10px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;font-size:12px;font-weight:700;color:#b91c1c;margin-bottom:12px;line-height:1.5;';
      } else {
        statusEl.textContent = `⚠️ 部分成功（成功 ${okCount} / 失敗 ${failCount}）`;
        statusEl.style.cssText = 'padding:10px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;font-size:12px;font-weight:700;color:#b45309;margin-bottom:12px;line-height:1.5;';
      }

      let html = '';
      result.success.forEach((m, i) => {
        html += `
          <div style="display:flex;gap:8px;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-top:6px;font-size:11px;align-items:center;">
            <img src="${m.thumb}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;flex-shrink:0;">
            <div style="flex:1;min-width:0;">
              <div style="font-weight:900;color:#0f172a;">#${i + 1} 上傳成功</div>
              <a href="${m.url}" target="_blank" rel="noopener" style="font-size:10px;color:#0284c7;word-break:break-all;text-decoration:underline;">${m.url.slice(0, 50)}…</a>
            </div>
          </div>
        `;
      });
      result.failed.forEach((f) => {
        html += `
          <div style="padding:8px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-top:6px;font-size:11px;">
            <div style="font-weight:900;color:#b91c1c;">❌ ${_esc(f.file)}</div>
            <div style="color:#7f1d1d;font-size:10px;">${_esc(f.error)}</div>
          </div>
        `;
      });
      resultsEl.innerHTML = html;
    });
  }

  // ============================================================
  // 掛到 window
  // ============================================================
  window.Uploads = {
    // Phase 1
    compress,
    uploadBlob,
    uploadFiles,
    openLightbox,
    test,
    canWrite: _canWrite,
    currentUser: _currentUser,
    // Phase 2
    getAttachments,
    buildAttachmentsInnerHtml,
    renderAllAttachments,
    pickAndUpload,
    deleteAttachment,
    openAttLightbox
  };

  console.log('[Uploads] v2.1（Phase 2 + 手機修復）載入完成');
})();