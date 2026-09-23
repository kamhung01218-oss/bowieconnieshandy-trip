/* ============================================================
 * attachments-overview.js — 附件總覽 v1.2
 *
 * v1.1 新增：
 *   - ⭐ 整合記帳收據（state.expenses[].receipts）
 *   - ⭐ 記帳收據點擊 → 開燈箱
 *   - ⭐ 記帳收據標題 → 跳記帳本
 *
 * v1.2 新增：
 *   - ⭐ _buildKeyLookup 加入快取（用結構簽名偵測變化）
 *   - ⭐ 避免每次 render 都重建 lookup table
 * ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // 工具
  // ============================================================
  function _esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function _haptic(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms || 8); } catch (e) {} }
  }
  function _currentUser() {
    try { return window.currentUser || localStorage.getItem('tohoku_current_user') || '訪客'; }
    catch (e) { return '訪客'; }
  }
  function _canWrite() {
    const u = _currentUser();
    return !!u && u !== '訪客';
  }
  function _isAdmin() {
    try { return typeof window.isAdminUnlocked === 'function' && window.isAdminUnlocked(); }
    catch (e) { return false; }
  }
  function _getExpenses() {
    try {
      if (typeof state !== 'undefined' && Array.isArray(state.expenses)) return state.expenses;
      if (window.state && Array.isArray(window.state.expenses)) return window.state.expenses;
    } catch (e) {}
    return [];
  }
  function _getItineraries() {
    return (typeof winterItineraries !== 'undefined')
      ? winterItineraries
      : (window.winterItineraries || []);
  }

  // ============================================================
  // ⭐ v1.2：行程結構簽名（用於快取失效偵測）
  // 只要 days 數、events 數、或任何 event.id 有變化，簽名就會不同
  // ============================================================
  function _computeItinerarySignature(itineraries) {
    let sig = '';
    for (let i = 0; i < itineraries.length; i++) {
      const day = itineraries[i];
      sig += day.day + ':' + day.events.length + ';';
      for (let j = 0; j < day.events.length; j++) {
        const evt = day.events[j];
        // 用 id（若無則用 title）的長度 + 前 4 字元當簽名
        const key = evt.id || evt.title || '';
        sig += key.length + '#' + key.substring(0, 4) + ',';
      }
      sig += '|';
    }
    return sig;
  }

  // ============================================================
  // ⭐ v1.2：lookup 快取
  // ============================================================
  let _cachedLookup = null;
  let _cachedSignature = '';

  function _buildKeyLookup() {
    const itineraries = _getItineraries();

    // 計算目前簽名
    const sig = _computeItinerarySignature(itineraries);

    // 簽名一致 → 直接回傳快取
    if (_cachedLookup && _cachedSignature === sig) {
      return _cachedLookup;
    }

    // 重建 lookup
    const lookup = {};
    itineraries.forEach(day => {
      day.events.forEach((evt, idx) => {
        const entry = { day: day.day, index: idx, title: evt.title };
        // 舊格式永遠存在
        lookup[`d${day.day}-e${idx}`] = entry;
        // 新格式（若 data.js 已加 id）
        if (evt.id) lookup[evt.id] = entry;
      });
    });

    _cachedLookup = lookup;
    _cachedSignature = sig;

    console.log('[附件總覽] lookup 重建（事件數：' + Object.keys(lookup).length + '）');
    return lookup;
  }

  // ⭐ 讓外部可手動清快取（萬一 data.js 熱更新）
  function invalidateLookupCache() {
    _cachedLookup = null;
    _cachedSignature = '';
  }

  // ============================================================
  // 聚合所有附件（行程 + 記帳收據），依 Day 分組
  // ============================================================
  function _getAllAttachmentsGrouped() {
    const attachments = window.cloudAttachments || {};
    const lookup = _buildKeyLookup();
    const grouped = {};

    // 1. 行程附件
    Object.keys(attachments).forEach(eventKey => {
      const list = attachments[eventKey];
      if (!Array.isArray(list) || list.length === 0) return;

      const meta = lookup[eventKey];
      if (!meta) {
        console.warn('[附件總覽] 找不到對應行程：', eventKey);
        return;
      }

      const day = meta.day;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push({
        eventKey,
        eventTitle: meta.title,
        eventIndex: meta.index,
        isExpense: false,
        items: list
      });
    });

    // 2. 記帳收據
    const expenses = _getExpenses();
    expenses.forEach(exp => {
      if (!Array.isArray(exp.receipts) || exp.receipts.length === 0) return;
      const day = parseInt(exp.day) || 1;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push({
        eventKey: `expense-${exp.id}`,
        eventTitle: `🧾 ${exp.desc || '未命名'}（${exp.amount} ${exp.currency}）`,
        eventIndex: -1,
        isExpense: true,
        expenseId: exp.id,
        items: exp.receipts
      });
    });

    // 3. 排序：行程在前，記帳在後
    Object.values(grouped).forEach(arr => {
      arr.sort((a, b) => {
        if (a.isExpense && !b.isExpense) return 1;
        if (!a.isExpense && b.isExpense) return -1;
        return a.eventIndex - b.eventIndex;
      });
    });

    return grouped;
  }

  let _attFilter = 'all';

  // ============================================================
  // 渲染
  // ============================================================
  function renderAttachmentsOverview() {
    const container = document.getElementById('attachments-overview-content');
    if (!container) return;

    const grouped = _getAllAttachmentsGrouped();
    const me = _currentUser();

    let totalAll = 0, totalMine = 0;
    Object.values(grouped).forEach(arr => {
      arr.forEach(g => {
        totalAll += g.items.length;
        totalMine += g.items.filter(a => a.uploader === me).length;
      });
    });

    const elAll = document.getElementById('att-count-all');
    const elMine = document.getElementById('att-count-mine');
    if (elAll) elAll.textContent = totalAll;
    if (elMine) elMine.textContent = totalMine;

    if (totalAll === 0) {
      container.innerHTML = `
        <div class="att-empty">
          <div class="att-empty-icon">📎</div>
          <div class="att-empty-title">還沒有任何附件</div>
          <div class="att-empty-desc">
            在行程卡片的「📎 資料」中<br>
            上傳收據、車票、訂單截圖
          </div>
        </div>`;
      return;
    }

    if (_attFilter === 'mine' && totalMine === 0) {
      container.innerHTML = `
        <div class="att-empty">
          <div class="att-empty-icon">👤</div>
          <div class="att-empty-title">你還沒有上傳任何附件</div>
          <div class="att-empty-desc">試著在行程卡片上傳第一張吧</div>
        </div>`;
      return;
    }

    let html = '';
    const dayNums = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    dayNums.forEach(dayNum => {
      const events = grouped[dayNum];

      const filteredEvents = events.map(g => {
        const items = _attFilter === 'mine'
          ? g.items.filter(a => a.uploader === me)
          : g.items;
        return { ...g, items };
      }).filter(g => g.items.length > 0);

      if (filteredEvents.length === 0) return;

      const dayTotal = filteredEvents.reduce((s, g) => s + g.items.length, 0);

      html += `<div class="att-day-group">`;
      html += `<div class="att-day-header">`;
      html += `<span class="att-day-badge">D${dayNum}</span>`;
      html += `<span class="att-day-count">${dayTotal} 張</span>`;
      html += `</div>`;

      filteredEvents.forEach(g => {
        const safeKey = _esc(g.eventKey);

        html += `<div class="att-event-block">`;

        if (g.isExpense) {
          html += `<button type="button" class="att-event-title att-event-title-expense" onclick="jumpToLedgerFromAttachments()">`;
          html += `<span class="att-event-title-text">${_esc(g.eventTitle)}</span>`;
          html += `<span class="att-event-title-arrow">›</span>`;
          html += `</button>`;
        } else {
          html += `<button type="button" class="att-event-title" onclick="jumpToEventFromAttachments(${dayNum}, ${g.eventIndex})">`;
          html += `<span class="att-event-title-text">${_esc(g.eventTitle)}</span>`;
          html += `<span class="att-event-title-arrow">›</span>`;
          html += `</button>`;
        }

        html += `<div class="att-thumb-grid">`;

        g.items.forEach((att, i) => {
          const safeId = _esc(att.id);
          const canDelete = _canWrite() && (att.uploader === me || _isAdmin());

          html += `<div class="att-thumb">`;
          if (g.isExpense) {
            html += `<img src="${_esc(att.thumb || att.url)}" alt="" loading="lazy" decoding="async"`;
            html += ` onclick="openExpenseReceiptLightbox('${_esc(g.expenseId)}', ${i})">`;
          } else {
            html += `<img src="${_esc(att.thumb || att.url)}" alt="" loading="lazy" decoding="async"`;
            html += ` onclick="Uploads.openAttLightbox('${safeKey}', ${i})">`;
          }

          if (canDelete) {
            html += `<button type="button" class="att-thumb-del"`;
            if (g.isExpense) {
              html += ` onclick="event.stopPropagation();deleteExpenseReceiptFromOverview('${_esc(g.expenseId)}','${safeId}')"`;
            } else {
              html += ` onclick="event.stopPropagation();Uploads.deleteAttachment('${safeKey}','${safeId}');setTimeout(renderAttachmentsOverview,300)"`;
            }
            html += ` aria-label="刪除">×</button>`;
          }
          html += `</div>`;
        });

        html += `</div></div>`;
      });

      html += `</div>`;
    });

    container.innerHTML = html;
  }

  function setAttFilter(filter) {
    _attFilter = filter === 'mine' ? 'mine' : 'all';
    document.querySelectorAll('.att-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === _attFilter);
    });
    renderAttachmentsOverview();
    _haptic(6);
  }

  function openAttachmentsOverview() {
    const m = document.getElementById('attachments-overview-modal');
    if (!m) {
      console.warn('[附件總覽] 找不到 #attachments-overview-modal');
      return;
    }

    _attFilter = 'all';
    document.querySelectorAll('.att-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === 'all');
    });

    renderAttachmentsOverview();

    m.style.display = 'flex';
    m.classList.add('active');
    document.body.classList.add('modal-open');
    _haptic(8);
  }

  function closeAttachmentsOverview() {
    const m = document.getElementById('attachments-overview-modal');
    if (!m) return;
    m.classList.remove('active');
    setTimeout(() => { m.style.display = 'none'; }, 300);
    const a = document.querySelector('.modal-overlay.active');
    if (!a) document.body.classList.remove('modal-open');
    _haptic(6);
  }

  function jumpToEventFromAttachments(day, eventIndex) {
    closeAttachmentsOverview();
    setTimeout(() => {
      if (typeof window.switchDay === 'function') window.switchDay(day);
      setTimeout(() => {
        const section = document.getElementById('day-section-' + day);
        if (!section) return;
        const target = section.querySelectorAll('details.event-card')[eventIndex];
        if (target) {
          target.open = true;
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
            target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.55), 0 12px 32px -8px rgba(14, 165, 233, 0.5)';
            target.style.borderColor = 'rgba(14, 165, 233, 0.8)';
            setTimeout(() => {
              target.style.boxShadow = '';
              target.style.borderColor = '';
            }, 2200);
          }, 220);
        } else {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 380);
    }, 250);
    _haptic(12);
  }

  function jumpToLedgerFromAttachments() {
    closeAttachmentsOverview();
    setTimeout(() => {
      if (typeof window.switchMainTab === 'function') {
        window.switchMainTab('ledger');
      }
    }, 250);
    _haptic(12);
  }

  function openExpenseReceiptLightbox(expenseId, index) {
    const expenses = _getExpenses();
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp) return;
    const urls = (exp.receipts || []).map(r => r.url);
    if (typeof window.openLightbox === 'function') {
      window.openLightbox(urls, index);
    }
  }

  function deleteExpenseReceiptFromOverview(expenseId, receiptId) {
    if (!_canWrite()) return;
    if (typeof window.deleteReceipt === 'function') {
      window.deleteReceipt(expenseId, receiptId);
      setTimeout(renderAttachmentsOverview, 800);
    } else {
      console.warn('[附件總覽] deleteReceipt 未載入');
      if (typeof window.showToast === 'function') {
        window.showToast('⚠️ 無法刪除記帳收據', '⚠️');
      }
    }
  }

  // ============================================================
  // 匯出
  // ============================================================
  window.openAttachmentsOverview = openAttachmentsOverview;
  window.closeAttachmentsOverview = closeAttachmentsOverview;
  window.setAttFilter = setAttFilter;
  window.jumpToEventFromAttachments = jumpToEventFromAttachments;
  window.jumpToLedgerFromAttachments = jumpToLedgerFromAttachments;
  window.openExpenseReceiptLightbox = openExpenseReceiptLightbox;
  window.deleteExpenseReceiptFromOverview = deleteExpenseReceiptFromOverview;
  window.renderAttachmentsOverview = renderAttachmentsOverview;
  // ⭐ v1.2：對外暴露清快取 API
  window.invalidateAttachmentsLookupCache = invalidateLookupCache;

  console.log('[附件總覽] v1.2 載入完成（含快取）');
})();