/* ============================================================
 * attachments-overview.js — 附件總覽 v1.0
 *
 * 功能：
 *   - 聚合 Firestore 所有附件（cloudAttachments）
 *   - 依 Day 分組、可篩選「我上傳的」
 *   - 點標題跳回行程卡片
 *   - 相簿快速入口
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

  // ============================================================
  // 建立 eventKey → { day, index, title } 對照表
  // 同時支援新格式（event.id）與舊格式（d{day}-e{index}）
  // ============================================================
  function _buildKeyLookup() {
    const lookup = {};
    const itineraries = window.winterItineraries || [];
    itineraries.forEach(day => {
      day.events.forEach((evt, idx) => {
        const entry = { day: day.day, index: idx, title: evt.title };
        // 舊格式永遠存在
        lookup[`d${day.day}-e${idx}`] = entry;
        // 新格式（若 data.js 已加 id）
        if (evt.id) lookup[evt.id] = entry;
      });
    });
    return lookup;
  }

  // ============================================================
  // 聚合所有附件，依 Day 分組
  // ============================================================
  function _getAllAttachmentsGrouped() {
    const attachments = window.cloudAttachments || {};
    const lookup = _buildKeyLookup();
    const grouped = {}; // { dayNum: [ { eventKey, title, index, items } ] }

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
        items: list
      });
    });

    // 依 index 排序
    Object.values(grouped).forEach(arr => {
      arr.sort((a, b) => a.eventIndex - b.eventIndex);
    });

    return grouped;
  }

  // ============================================================
  // 篩選狀態
  // ============================================================
  let _attFilter = 'all';

  // ============================================================
  // 渲染
  // ============================================================
  function renderAttachmentsOverview() {
    const container = document.getElementById('attachments-overview-content');
    if (!container) return;

    const grouped = _getAllAttachmentsGrouped();
    const me = _currentUser();

    // 統計
    let totalAll = 0;
    let totalMine = 0;
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

    // 空狀態
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

    // 若選「我上傳的」但沒有 → 提示
    if (_attFilter === 'mine' && totalMine === 0) {
      container.innerHTML = `
        <div class="att-empty">
          <div class="att-empty-icon">👤</div>
          <div class="att-empty-title">你還沒有上傳任何附件</div>
          <div class="att-empty-desc">試著在行程卡片上傳第一張吧</div>
        </div>`;
      return;
    }

    // 渲染
    let html = '';
    const dayNums = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    dayNums.forEach(dayNum => {
      const events = grouped[dayNum];

      // 套用篩選
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
        html += `<button type="button" class="att-event-title" onclick="jumpToEventFromAttachments(${dayNum}, ${g.eventIndex})">`;
        html += `<span class="att-event-title-text">${_esc(g.eventTitle)}</span>`;
        html += `<span class="att-event-title-arrow">›</span>`;
        html += `</button>`;
        html += `<div class="att-thumb-grid">`;

        g.items.forEach((att, i) => {
          const safeId = _esc(att.id);
          const canDelete = _canWrite() && (att.uploader === me || _isAdmin());

          html += `<div class="att-thumb">`;
          html += `<img src="${_esc(att.thumb || att.url)}" alt="" loading="lazy" decoding="async"`;
          html += ` onclick="Uploads.openAttLightbox('${safeKey}', ${i})">`;
          if (canDelete) {
            html += `<button type="button" class="att-thumb-del"`;
            html += ` onclick="event.stopPropagation();Uploads.deleteAttachment('${safeKey}','${safeId}');setTimeout(renderAttachmentsOverview,300)"`;
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

  // ============================================================
  // 篩選切換
  // ============================================================
  function setAttFilter(filter) {
    _attFilter = filter === 'mine' ? 'mine' : 'all';
    document.querySelectorAll('.att-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === _attFilter);
    });
    renderAttachmentsOverview();
    _haptic(6);
  }

  // ============================================================
  // 開啟 / 關閉
  // ============================================================
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

  // ============================================================
  // 跳回行程卡片
  // ============================================================
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

  // ============================================================
  // 匯出
  // ============================================================
  window.openAttachmentsOverview = openAttachmentsOverview;
  window.closeAttachmentsOverview = closeAttachmentsOverview;
  window.setAttFilter = setAttFilter;
  window.jumpToEventFromAttachments = jumpToEventFromAttachments;
  window.renderAttachmentsOverview = renderAttachmentsOverview;

  console.log('[附件總覽] v1.0 載入完成');
})();