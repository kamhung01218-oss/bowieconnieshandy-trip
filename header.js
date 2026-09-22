/* ============================================================
 * AppHeader v16.1
 * - 品牌列：❄️ 標題 + [🔍 搜尋] + [⛅ 天氣] + [🔄 重整] + [☰ 工具]
 * - Focus Card：出發前 / 中 / 後
 * - 旅行中順序：廣播 → 天氣 → 現在 → 下一站 → CTA(購物/留言)
 *
 * v16.0 變更：
 *   - ⭐ 出發前 Focus Card 分 4 階段演化
 *   - ⭐ 準備進度改為「真實任務完成度」
 *   - ⭐ 今日任務升級為主角
 *   - ⭐ 新增：出發日天氣、搶票倒數、行李準備度、未完成清單
 *   - ⭐ 倒數計時依階段自動縮放
 *
 * v16.1 變更：
 *   - ⭐ 準備進度可點擊 → 打開「準備總覽」Modal
 *   - ⭐ 準備總覽 Modal 顯示未完成項與一鍵前往處理
 * ============================================================ */

window.AppHeader = (function () {
  let _config = null;
  let _container = null;
  let _tickTimer = null;
  let _syncConnected = true;
  let _lastRenderedPhase = null;
  let _lastPrepStage = null;
  let _lastDuringRender = 0;
  let _docClickHandler = null;
  let _escKeyHandler = null;
  let _searchDebounceTimer = null;
  let _selectedWeatherLocId = null;
  let _selectedWeatherDayKey = null;

  const ICONS = {
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>`,
    weather: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/></svg>`,
    menu:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    gear:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    overview:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4M9 11V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v16M9 11h6M15 8h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4"/></svg>`,
    ledger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
    receipt:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16v18l-4-2-4 2-4-2-4 2z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
    install:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>`,
    theme:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    emergency:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>`,
    ticket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9a2 2 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 1 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><line x1="13" y1="5" x2="13" y2="19"/></svg>`,
    drive:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 17h14M5 17v2M19 17v2M6 10l1.5-4.5A2 2 0 0 1 9.4 4h5.2a2 2 0 0 1 1.9 1.5L18 10M4 10h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="7.5" cy="14.5" r="1"/><circle cx="16.5" cy="14.5" r="1"/></svg>`,
    shoot:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    account:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
    close:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
  };

  const HOT_KEYWORDS = [
    { label: '🦊 狐狸村', kw: '狐狸村' },
    { label: '🥩 牛舌',   kw: '牛舌' },
    { label: '⛷️ 藏王',   kw: '藏王' },
    { label: '🏮 銀山',   kw: '銀山' },
    { label: '🍜 拉麵',   kw: '拉麵' },
    { label: '☃️ 樹冰',   kw: '樹冰' },
    { label: '♨️ 溫泉',   kw: '溫泉' }
  ];

  // ============================================================
  // 時間 / 階段判斷
  // ============================================================
  function getTripPhase() {
    const now = Date.now();
    if (now >= _config.tripStart && now <= _config.tripEnd) return "during";
    try {
      const testPhase = new URLSearchParams(window.location.search).get('test');
      if (testPhase === 'during' || testPhase === 'before' || testPhase === 'after') return testPhase;
    } catch (e) {}
    if (now < _config.tripStart) return "before";
    if (now > _config.tripEnd) return "after";
    return "during";
  }

  function getPrepStage(days) {
    if (days <= 7) return "final";
    if (days <= 30) return "sprint";
    if (days <= 90) return "prep";
    return "seed";
  }

  function getCurrentDayIndex() {
    const now = Date.now();
    if (now >= _config.tripStart && now <= _config.tripEnd) {
      for (let i = 0; i < _config.tripDates.length; i++) {
        const dayStart = new Date(_config.tripDates[i] + "T00:00:00+08:00").getTime();
        const dayEnd = new Date(_config.tripDates[i] + "T23:59:59+08:00").getTime();
        if (now >= dayStart && now <= dayEnd) return i;
      }
      return -1;
    }
    try {
      const testDay = new URLSearchParams(window.location.search).get('day');
      if (testDay) {
        const idx = parseInt(testDay) - 1;
        if (idx >= 0 && idx < _config.tripDates.length) return idx;
      }
    } catch (e) {}
    for (let i = 0; i < _config.tripDates.length; i++) {
      const dayStart = new Date(_config.tripDates[i] + "T00:00:00+08:00").getTime();
      const dayEnd = new Date(_config.tripDates[i] + "T23:59:59+08:00").getTime();
      if (now >= dayStart && now <= dayEnd) return i;
    }
    return -1;
  }

  function getNowMinutes() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const timeParam = urlParams.get('time');
      if (timeParam) {
        const m = timeParam.match(/^(\d{1,2}):(\d{2})$/);
        if (m) {
          const h = parseInt(m[1], 10);
          const min = parseInt(m[2], 10);
          if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
            return h * 60 + min;
          }
        }
      }
      if (urlParams.get('test') === 'during') {
        return 10 * 60 + 30;
      }
    } catch (e) {}
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  // ============================================================
  // 出發前：任務 / 進度
  // ============================================================
  function getNextBigTask() {
    const now = Date.now();
    const cb = _config.callbacks || {};
    const ticketTasks = [
      { time: _config.ginzanTarget, label: "銀山 Fast Pass 搶票", emoji: "🎟️" },
      { time: _config.zaoTarget, label: "藏王纜車優先票", emoji: "🚠" }
    ].filter(t => {
      if (t.time <= now) return false;
      return (t.time - now) / 86400000 <= 14;
    }).sort((a, b) => a.time - b.time);
    if (ticketTasks.length > 0) {
      const t = ticketTasks[0];
      const daysLeft = Math.ceil((t.time - now) / 86400000);
      return { emoji: t.emoji, label: t.label, hint: `${daysLeft} 天後開賣，記得設鬧鐘`, type: "ticket" };
    }
    if (cb.getNextPendingBooking) {
      try {
        const booking = cb.getNextPendingBooking();
        if (booking) return { emoji: booking.icon, label: booking.label, hint: `還有 ${booking.remaining} 項未完成 · 點擊查看`, type: "booking" };
      } catch (e) {}
    }
    if (now < _config.tripStart) {
      const daysLeft = Math.ceil((_config.tripStart - now) / 86400000);
      return { emoji: "✈️", label: "出發前往仙台", hint: `還有 ${daysLeft} 天 · 所有預訂已完成！`, type: "trip" };
    }
    return null;
  }

  // ============================================================
  // 天氣判斷
  // ============================================================
  function getWeatherAdvice(temp, rain) {
    if (temp < -10) return "🥶 極寒！小孩勿久留戶外";
    if (temp < -5) return "❄️ 羽絨 + 雪靴 + 毛帽";
    if (temp < 0) return "🧣 圍巾手套不可少";
    if (rain >= 70) return "🌨️ 降雪中，路面濕滑";
    return "🧥 防風外套即可";
  }

  function getAlertLine(weather) {
    if (!weather) return null;
    const { min, rain } = weather;
    if (typeof min === 'number' && min <= -10) {
      return { level: 'danger', text: `⚠️ 極寒 ${min}°C，小孩勿久留戶外` };
    }
    if (typeof rain === 'number' && rain >= 80) {
      return { level: 'warn', text: `🌨️ 降雪 ${rain}%，纜車可能停駛` };
    }
    if (typeof min === 'number' && min <= -5) {
      return { level: 'warn', text: `❄️ 寒冷 ${min}°C，羽絨+雪靴必備` };
    }
    if (typeof rain === 'number' && rain >= 60) {
      return { level: 'warn', text: `🌧️ 降雪 ${rain}%，帶防水外套` };
    }
    return null;
  }

  // ============================================================
  // 通用工具
  // ============================================================
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function haptic(ms = 10) {
    if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} }
  }

  function getProgressData(type) {
    const cb = _config.callbacks || {};
    try {
      if (type === "booking" && cb.getBookingProgress) return cb.getBookingProgress();
      if (type === "equip" && cb.getEquipProgress) return cb.getEquipProgress();
      if (type === "shopping" && cb.getShoppingProgress) return cb.getShoppingProgress();
    } catch (e) {}
    return { done: 0, total: 0 };
  }

  function isGuestUser() {
    try { return localStorage.getItem("tohoku_current_user") === "訪客"; } catch(e) { return false; }
  }
  function getCurrentUser() {
    try { return localStorage.getItem("tohoku_current_user") || ""; } catch(e) { return ""; }
  }

  function getTicketCountdown() {
    const now = Date.now();
    const candidates = [];
    if (_config.ginzanTarget - now > 0) candidates.push(_config.ginzanTarget - now);
    if (_config.zaoTarget - now > 0) candidates.push(_config.zaoTarget - now);
    if (candidates.length === 0) return null;
    const nearest = Math.min(...candidates);
    const days = Math.floor(nearest / 86400000);
    if (days > 0) return `${days}天`;
    const hours = Math.floor(nearest / 3600000);
    if (hours > 0) return `${hours}時`;
    return `${Math.max(1, Math.floor(nearest / 60000))}分`;
  }

  // ============================================================
  // 出發前 Focus Card 輔助函式
  // ============================================================
  function formatCountdownShort(ms) {
    if (ms <= 0) return "已開賣";
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (days > 0) return `${days}天 ${hours}時`;
    if (hours > 0) return `${hours}時 ${minutes}分`;
    return `${minutes}分`;
  }

  function buildDepartureWeatherHtml(weather, location) {
    if (!weather) return '';
    const locName = location ? location.shortName || location.name : '仙台';
    const icon = weather.icon || '🌨️';
    const max = weather.max;
    const min = weather.min;
    const rain = weather.rain;
    return `<div class="focus-departure-weather">
      <span class="fdw-icon">${icon}</span>
      <span class="fdw-loc">${escapeHtml(locName)}</span>
      <span class="fdw-temp">${min}° ~ ${max}°</span>
      <span class="fdw-rain">💧 ${rain}%</span>
    </div>`;
  }

  function buildTicketCountdownHtml() {
    const now = Date.now();
    const items = [];

    if (_config.ginzanTarget > now) {
      const diff = _config.ginzanTarget - now;
      items.push({
        icon: '🎟️',
        label: '銀山 Fast Pass',
        time: formatCountdownShort(diff),
        urgent: diff < 3 * 86400000
      });
    }
    if (_config.zaoTarget > now) {
      const diff = _config.zaoTarget - now;
      items.push({
        icon: '🚠',
        label: '藏王纜車優先票',
        time: formatCountdownShort(diff),
        urgent: diff < 3 * 86400000
      });
    }

    if (items.length === 0) return '';

    return `<div class="focus-ticket-countdown">
      ${items.map(item => `
        <div class="ftc-item ${item.urgent ? 'urgent' : ''}">
          <span class="ftc-icon">${item.icon}</span>
          <span class="ftc-label">${escapeHtml(item.label)}</span>
          <span class="ftc-time">${item.time}</span>
        </div>
      `).join('')}
    </div>`;
  }

  // 準備進度 HTML（真實完成度 + 可點擊）
  function buildPrepProgressHtml(bookingP, equipP, totalPrep, donePrep, prepPercent) {
    if (totalPrep === 0) return '';
    const pending = totalPrep - donePrep;
    const allDone = pending === 0;
    return `<button type="button" class="focus-progress-row focus-progress-clickable ${allDone ? 'all-done' : ''}" data-action="prep-overview" aria-label="查看準備總覽">
      <div class="focus-progress-header">
        <span class="focus-progress-title">📋 準備進度</span>
        <span class="focus-progress-count">${donePrep} / ${totalPrep}</span>
      </div>
      <div class="focus-progress-track">
        <div class="focus-progress-fill" style="width: ${prepPercent}%"></div>
      </div>
      <div class="focus-progress-footer">
        <span>${allDone ? '🎉 全部完成' : `✅ ${donePrep} 項完成`}</span>
        <span>${allDone ? '' : `⏳ ${pending} 項待處理`}</span>
      </div>
      <span class="focus-progress-arrow">›</span>
    </button>`;
  }

  function buildLuggageProgressHtml(equipP) {
    if (!equipP || equipP.total === 0) return '';
    const percent = Math.round((equipP.done / equipP.total) * 100);
    const allDone = equipP.done === equipP.total;
    return `<div class="focus-luggage-progress ${allDone ? 'done' : ''}">
      <div class="flp-header">
        <span>🎒 行李準備度</span>
        <span class="flp-count">${equipP.done} / ${equipP.total}</span>
      </div>
      <div class="flp-track">
        <div class="flp-fill" style="width: ${percent}%"></div>
      </div>
    </div>`;
  }

  function buildPendingListHtml(bookingP, equipP) {
    const items = [];

    const pendingBooking = bookingP.total - bookingP.done;
    if (pendingBooking > 0) {
      const cb = _config.callbacks || {};
      if (cb.getNextPendingBooking) {
        try {
          const next = cb.getNextPendingBooking();
          if (next && next.label) {
            items.push(`${next.icon || '📌'} ${next.label}（還有 ${next.remaining} 項）`);
          } else {
            items.push(`📌 行前預訂還有 ${pendingBooking} 項`);
          }
        } catch (e) {
          items.push(`📌 行前預訂還有 ${pendingBooking} 項`);
        }
      } else {
        items.push(`📌 行前預訂還有 ${pendingBooking} 項`);
      }
    }

    const pendingEquip = equipP.total - equipP.done;
    if (pendingEquip > 0) {
      items.push(`🎒 裝備清單還有 ${pendingEquip} 項`);
    }

    if (items.length === 0) {
      return `<div class="focus-pending-list all-done">
        <div class="fpl-title">✅ 全部完成！準備出發</div>
      </div>`;
    }

    return `<div class="focus-pending-list">
      <div class="fpl-title">⚠️ 尚未完成</div>
      <ul>
        ${items.slice(0, 3).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>`;
  }

  function buildTaskHtml(task) {
    if (!task) return '';
    const action = task.type === 'booking' ? 'booking'
                 : task.type === 'ticket' ? 'ticket'
                 : 'overview';
    return `<div class="focus-task focus-task-primary" data-action="${action}">
      <div class="focus-task-icon">${task.emoji}</div>
      <div class="focus-task-body">
        <div class="focus-task-title">${escapeHtml(task.label)}</div>
        <div class="focus-task-hint">${escapeHtml(task.hint)}</div>
      </div>
      <div class="focus-task-arrow">›</div>
    </div>`;
  }

  // ============================================================
  // ⭐ v16.1：準備總覽 Modal
  // ============================================================
  function openPrepOverviewModal() {
    const m = document.getElementById('prep-overview-modal');
    if (!m) return;
    const content = document.getElementById('prep-overview-content');
    if (!content) return;

    const cb = _config.callbacks || {};
    const bookingP = getProgressData("booking");
    const equipP = getProgressData("equip");
    const totalPrep = bookingP.total + equipP.total;
    const donePrep = bookingP.done + equipP.done;
    const prepPercent = totalPrep > 0 ? Math.round((donePrep / totalPrep) * 100) : 0;

    let pendingBooking = [];
    let pendingEquip = [];
    if (cb.getPendingBookingItems) {
      try { pendingBooking = cb.getPendingBookingItems() || []; } catch (e) {}
    }
    if (cb.getPendingEquipItems) {
      try { pendingEquip = cb.getPendingEquipItems() || []; } catch (e) {}
    }

    const bookingHtml = buildPrepSectionHtml('📌', '行前預訂', bookingP, pendingBooking, 'booking');
    const equipHtml = buildPrepSectionHtml('🎒', '我的裝備', equipP, pendingEquip, 'equip');

    content.innerHTML = `
      <div class="prep-overview-hero">
        <div class="prep-overview-percent">${prepPercent}%</div>
        <div class="prep-overview-track">
          <div class="prep-overview-fill" style="width: ${prepPercent}%"></div>
        </div>
        <div class="prep-overview-meta">${donePrep} / ${totalPrep} 項完成</div>
      </div>
      ${bookingHtml}
      ${equipHtml}
    `;

    content.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', () => {
        const action = el.dataset.action;
        closePrepOverviewModal();
        setTimeout(() => {
          if (action === 'booking' && cb.onBooking) cb.onBooking();
          else if (action === 'equip' && cb.onEquip) cb.onEquip();
        }, 250);
      });
    });

    m.style.display = 'flex';
    m.classList.add('active');
    document.body.classList.add('modal-open');
    haptic(8);
  }

  function buildPrepSectionHtml(icon, title, progress, pendingItems, action) {
    const pending = progress.total - progress.done;
    const allDone = pending === 0;

    if (allDone) {
      return `<div class="prep-section prep-section-done">
        <div class="prep-section-header">
          <span class="prep-section-icon">${icon}</span>
          <span class="prep-section-title">${title}</span>
          <span class="prep-section-count">${progress.done} / ${progress.total}</span>
        </div>
        <div class="prep-section-all-done">✅ 全部完成</div>
      </div>`;
    }

    let listHtml = '';
    if (pendingItems.length > 0) {
      const itemsHtml = pendingItems.slice(0, 5).map(item => `
        <li class="prep-item">
          <span class="prep-item-icon">${item.icon || '•'}</span>
          <span class="prep-item-label">${escapeHtml(item.label || item)}</span>
        </li>
      `).join('');
      const moreHtml = pendingItems.length > 5
        ? `<li class="prep-item prep-item-more">...還有 ${pendingItems.length - 5} 項</li>`
        : '';
      listHtml = `<ul class="prep-pending-list">${itemsHtml}${moreHtml}</ul>`;
    } else {
      listHtml = `<div class="prep-section-pending">⏳ 還有 ${pending} 項未完成</div>`;
    }

    return `<div class="prep-section">
      <div class="prep-section-header">
        <span class="prep-section-icon">${icon}</span>
        <span class="prep-section-title">${title}</span>
        <span class="prep-section-count">${progress.done} / ${progress.total}</span>
      </div>
      ${listHtml}
      <button type="button" class="prep-section-cta" data-action="${action}">
        前往處理 <span class="prep-cta-arrow">›</span>
      </button>
    </div>`;
  }

  function closePrepOverviewModal() {
    const m = document.getElementById('prep-overview-modal');
    if (!m) return;
    m.classList.remove('active');
    setTimeout(() => { m.style.display = 'none'; }, 300);
    const a = document.querySelector('.modal-overlay.active');
    if (!a) document.body.classList.remove('modal-open');
    haptic(6);
  }

  // ============================================================
  // 重整頁面
  // ============================================================
  async function hardReload() {
    const btn = _container?.querySelector("#app-header-reload");
    if (btn && btn.classList.contains('refreshing')) return;
    if (btn) btn.classList.add('refreshing');
    haptic(12);

    if (typeof showToast === 'function') {
      showToast('🔄 正在重整頁面…', '⏳');
    }

    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.update().catch(() => {})));
      }
    } catch (e) {
      console.warn('[hardReload] SW update 失敗', e);
    }

    setTimeout(() => {
      try {
        window.location.reload();
      } catch (e) {
        const url = new URL(window.location.href);
        url.searchParams.set('_r', Date.now());
        window.location.replace(url.toString());
      }
    }, 350);
  }
  window._AppHeader_hardReload = hardReload;

  // ============================================================
  // 同步所有資料
  // ============================================================
  async function syncAllData() {
    console.log('[sync] 🚀 開始同步');
    haptic(12);

    let okCount = 0;
    let failCount = 0;

    if (typeof window.fetchWeatherData === 'function') {
      try {
        console.log('[sync] → 天氣…');
        await window.fetchWeatherData();
        okCount++;
        console.log('[sync] ✓ 天氣');
      } catch (e) {
        failCount++;
        console.warn('[sync] ✗ 天氣', e);
      }
    }

    if (typeof window.fetchLiveRates === 'function') {
      try {
        console.log('[sync] → 匯率…');
        await window.fetchLiveRates();
        okCount++;
        console.log('[sync] ✓ 匯率');
      } catch (e) {
        failCount++;
        console.warn('[sync] ✗ 匯率', e);
      }
    }

    if (window.dbRef) {
      try {
        console.log('[sync] → 雲端…');
        const docSnap = await window.dbRef.get();
        if (docSnap.exists) {
          const cloudData = docSnap.data() || {};

          try {
            const localNonBooking = {};
            const curChecked = (typeof state !== 'undefined' && state.checkedItems) || {};
            Object.keys(curChecked).forEach(k => {
              if (!k.startsWith('booking-') && !k.startsWith('custom-booking-')) {
                localNonBooking[k] = curChecked[k];
              }
            });
            if (cloudData.checkedItems && typeof state !== 'undefined') {
              state.checkedItems = { ...cloudData.checkedItems, ...localNonBooking };
            }
          } catch (e) { console.warn('[sync] checkedItems', e); }

          if (Array.isArray(cloudData.customBookingItems)) {
            try {
              window.customBookingItems = cloudData.customBookingItems.slice();
              if (typeof customBookingItems !== 'undefined') {
                customBookingItems = window.customBookingItems;
              }
              localStorage.setItem("custom_booking_items", JSON.stringify(cloudData.customBookingItems));
            } catch (e) { console.warn('[sync] customBookingItems', e); }
          }

          if (cloudData.userData) {
            try {
              window.cloudUserData = cloudData.userData;
              if (typeof cloudUserData !== 'undefined') cloudUserData = cloudData.userData;
            } catch (e) {}
          }
          if (cloudData.userPins) {
            try {
              window.cloudUserPins = cloudData.userPins;
              if (typeof cloudUserPins !== 'undefined') cloudUserPins = cloudData.userPins;
            } catch (e) {}
          }

          if (typeof window.saveLocalCheckedItems === 'function') window.saveLocalCheckedItems();
          if (typeof window.renderBookingChecklist === 'function') window.renderBookingChecklist();
          if (typeof window.renderEquipChecklist === 'function') window.renderEquipChecklist();
          if (typeof window.renderAllShoppingContent === 'function') window.renderAllShoppingContent();
        }
        okCount++;
        console.log('[sync] ✓ 雲端');
      } catch (e) {
        failCount++;
        console.warn('[sync] ✗ 雲端', e);
      }
    } else {
      console.warn('[sync] ⚠️ window.dbRef 不存在');
    }

    console.log(`[sync] 🏁 完成 ok=${okCount} fail=${failCount}`);

    try {
      _lastRenderedPhase = null;
      _lastPrepStage = null;
      renderFocusCard(true);

      if (window._lastActiveDay && typeof window.renderDayItinerary === 'function') {
        const dayData = window.winterItineraries?.find(d => d.day === window._lastActiveDay);
        if (dayData) {
          window.renderDayItinerary(`day-section-${dayData.day}`, dayData, true);
        }
      }
    } catch (e) {
      console.warn('[sync] 重繪失敗', e);
    }

    try {
      const focusEl = _container?.querySelector("#app-header-focus");
      if (focusEl) {
        focusEl.classList.add('sync-flash');
        setTimeout(() => focusEl.classList.remove('sync-flash'), 900);
      }
    } catch (e) {}

    haptic(15);

    if (failCount > 0) {
      throw new Error(`部分同步失敗 (${failCount} 項)`);
    }
  }
  window._AppHeader_syncAll = syncAllData;

  // ============================================================
  // 出發前：倒數更新
  // ============================================================
  function updateCountdownNumbers() {
    if (!_container) return;
    const focusEl = _container.querySelector("#app-header-focus");
    if (!focusEl) return;
    const diff = _config.tripStart - Date.now();
    if (diff <= 0) return;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const inlineEl = focusEl.querySelector("#focus-countdown-inline");
    if (inlineEl) {
      const dayEl = inlineEl.querySelector('[data-inline="days"]');
      const hourEl = inlineEl.querySelector('[data-inline="hours"]');
      const minEl = inlineEl.querySelector('[data-inline="minutes"]');
      if (dayEl && dayEl.textContent !== String(days)) dayEl.textContent = String(days);
      if (hourEl && hourEl.textContent !== String(hours).padStart(2, "0")) hourEl.textContent = String(hours).padStart(2, "0");
      if (minEl && minEl.textContent !== String(minutes).padStart(2, "0")) minEl.textContent = String(minutes).padStart(2, "0");
    }
  }

  // ============================================================
  // 搜尋
  // ============================================================
  function stripHtml(html) {
    if (!html) return "";
    return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function searchItinerary(keyword) {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return [];
    const results = [];
    (_config.itineraries || []).forEach(day => {
      const dayTitle = (day.title || "").toLowerCase();
      const daySubtitle = (day.subtitle || "").toLowerCase();
      if (dayTitle.includes(kw) || daySubtitle.includes(kw)) {
        results.push({ day: day.day, eventIndex: -1, title: day.title, location: "", time: day.dateLabel, emoji: day.emoji || "📅" });
      }
      (day.events || []).forEach((evt, idx) => {
        const fields = [evt.title || "", evt.location || "", evt.tag?.text || "", stripHtml(evt.content || "")];
        if (fields.some(f => f.toLowerCase().includes(kw))) {
          results.push({ day: day.day, eventIndex: idx, title: evt.title, location: evt.location || "", time: evt.time, emoji: "📍" });
        }
      });
    });
    return results;
  }

  function openSearchModal() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    const input = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    if (input) input.value = "";
    if (resultsEl) { resultsEl.innerHTML = renderSearchEmpty(); bindHotTagClicks(); }
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    setTimeout(() => { if (input) input.focus(); }, 150);
    haptic(8);
  }

  function closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 250);
    if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('modal-open');
    haptic(6);
  }

  function renderSearchEmpty() {
    const tagsHtml = HOT_KEYWORDS.map(t => `<button type="button" class="search-hot-tag" data-hot-kw="${escapeHtml(t.kw)}">${t.label}</button>`).join('');
    return `<div class="search-empty">
      <div style="font-size:36px;margin-bottom:8px">🔍</div>
      <div style="font-size:13px;font-weight:700;color:#64748b">輸入關鍵字開始搜尋</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:6px">或點選熱門關鍵字</div>
      <div class="search-hot-tags">${tagsHtml}</div>
    </div>`;
  }

  function bindHotTagClicks() {
    const resultsEl = document.getElementById('search-results');
    if (!resultsEl) return;
    resultsEl.querySelectorAll('[data-hot-kw]').forEach(btn => {
      btn.addEventListener('click', () => {
        const kw = btn.dataset.hotKw;
        const input = document.getElementById('search-input');
        if (input) { input.value = kw; input.focus(); handleSearchInput(kw); }
        haptic(5);
      });
    });
  }

  function renderSearchResults(results, kw) {
    if (results.length === 0) return `<div class="search-empty"><div style="font-size:36px;margin-bottom:8px">😕</div><div style="font-size:13px;font-weight:700;color:#64748b">找不到「${escapeHtml(kw)}」</div></div>`;
    const grouped = {};
    results.forEach(r => { if (!grouped[r.day]) grouped[r.day] = []; grouped[r.day].push(r); });
    const dayNums = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    let html = `<div style="font-size:11px;color:#64748b;font-weight:700;padding:6px 4px 8px">找到 <span style="color:#0284c7;font-weight:900">${results.length}</span> 個結果</div>`;
    dayNums.forEach(day => {
      html += `<div class="search-day-group"><div class="search-day-label">Day ${day}</div>`;
      grouped[day].forEach(item => {
        const highlight = (text) => {
          if (!text) return "";
          const escaped = escapeHtml(text);
          const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          return escaped.replace(regex, '<mark>$1</mark>');
        };
        html += `<button type="button" class="search-result-item" data-day="${item.day}" data-event-index="${item.eventIndex}">
          <div class="search-result-icon">${item.emoji}</div>
          <div class="search-result-main">
            <div class="search-result-title">${highlight(item.title)}</div>
            <div class="search-result-meta">
              ${item.location ? `<span>📍 ${escapeHtml(item.location)}</span>` : ''}
              ${item.time ? `<span>⏰ ${escapeHtml(item.time)}</span>` : ''}
            </div>
          </div>
          <div class="search-result-arrow">›</div>
        </button>`;
      });
      html += `</div>`;
    });
    return html;
  }

  function handleSearchInput(kw) {
    const resultsEl = document.getElementById('search-results');
    if (!resultsEl) return;
    if (!kw.trim()) { resultsEl.innerHTML = renderSearchEmpty(); bindHotTagClicks(); return; }
    resultsEl.innerHTML = renderSearchResults(searchItinerary(kw), kw);
    resultsEl.querySelectorAll('.search-result-item').forEach(btn => {
      btn.addEventListener('click', () => {
        closeSearchModal();
        setTimeout(() => jumpToSearchResult(parseInt(btn.dataset.day), parseInt(btn.dataset.eventIndex)), 300);
      });
    });
  }

  function jumpToSearchResult(day, eventIndex) {
    if (typeof window.switchDay === "function") window.switchDay(day);
    else if (_config.callbacks.onScrollToDay) _config.callbacks.onScrollToDay(day);
    setTimeout(() => {
      if (eventIndex < 0) {
        const section = document.getElementById('day-section-' + day);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const section = document.getElementById('day-section-' + day);
      if (!section) return;
      const target = section.querySelectorAll('details.event-card')[eventIndex];
      if (!target) return;
      target.open = true;
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
        target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.55), 0 12px 32px -8px rgba(14, 165, 233, 0.5)';
        target.style.borderColor = 'rgba(14, 165, 233, 0.8)';
        setTimeout(() => { target.style.boxShadow = ''; target.style.borderColor = ''; }, 2000);
      }, 200);
    }, 350);
    haptic(12);
  }

  // ============================================================
  // 多地點天氣
  // ============================================================
  function getWeatherLocationsForDay(dayIdx) {
    if (!_config.weatherLocations) return [];
    return _config.weatherLocations[dayIdx + 1] || [];
  }

  function getActiveWeatherLoc(dayIdx, dateStr) {
    const locs = getWeatherLocationsForDay(dayIdx);
    if (locs.length === 0) return null;
    if (locs.length === 1) return locs[0];

    const dayKey = dateStr;
    if (_selectedWeatherLocId && _selectedWeatherDayKey === dayKey) {
      const selected = locs.find(l => l.id === _selectedWeatherLocId);
      if (selected) return selected;
    }

    const checkMin = getNowMinutes();

    for (const loc of locs) {
      const [fh, fm] = loc.timeFrom.split(':').map(Number);
      const [th, tm] = loc.timeTo.split(':').map(Number);
      const from = fh * 60 + fm;
      const to = th * 60 + tm;
      const isAllDay = (from === 0 && to >= 23 * 60 + 59);
      if (isAllDay) continue;
      if (checkMin >= from && checkMin <= to) return loc;
    }

    for (const loc of locs) {
      const [fh, fm] = loc.timeFrom.split(':').map(Number);
      const [th, tm] = loc.timeTo.split(':').map(Number);
      const from = fh * 60 + fm;
      const to = th * 60 + tm;
      if (from === 0 && to >= 23 * 60 + 59) return loc;
    }

    return locs[0];
  }

  function getWeatherForLoc(dateStr, locId) {
    if (!window.weatherCache) return null;
    return window.weatherCache[dateStr + '|' + locId] || null;
  }

  function renderWeatherRow(dayIdx, dateStr) {
    const locs = getWeatherLocationsForDay(dayIdx);
    if (locs.length === 0) return '';

    const activeLoc = getActiveWeatherLoc(dayIdx, dateStr);
    if (!activeLoc) return '';

    const weather = getWeatherForLoc(dateStr, activeLoc.id);
    const temp = weather ? Math.round((weather.max + weather.min) / 2) : null;
    const advice = weather ? getWeatherAdvice(temp, weather.rain) : '載入中...';

    let tabsHtml = '';
    if (locs.length > 1) {
      tabsHtml = `<div class="focus-weather-tabs">` + locs.map(loc => {
        const isActive = loc.id === activeLoc.id;
        return `<button type="button" class="focus-weather-tab ${isActive ? 'active' : ''}" 
          data-loc-id="${escapeHtml(loc.id)}" 
          onclick="event.stopPropagation();window._AppHeader_switchWeatherLoc('${escapeHtml(loc.id)}','${escapeHtml(dateStr)}',${dayIdx})">
          ${escapeHtml(loc.shortName || loc.name)}
        </button>`;
      }).join('') + `</div>`;
    }

    const alert = getAlertLine(weather);
    const alertHtml = alert
      ? `<div class="focus-weather-alert ${alert.level}">${alert.text}</div>`
      : '';

    let line1Html = '';
    if (weather) {
      line1Html = `
        <span class="fw-icon" data-wcat="${weather.wcat || 'cloud'}">${weather.icon}</span>
        <span class="fw-temp">${weather.min}°~${weather.max}°</span>
        <span class="fw-advice">${escapeHtml(advice)}</span>`;
    } else {
      line1Html = `<span class="fw-icon">⛅</span><span class="fw-advice">天氣載入中...</span>`;
    }

    let sunHtml = '';
    if (weather && (weather.sunrise || weather.sunset)) {
      sunHtml = `<div class="focus-weather-line2">
        <span class="fw-sun">🌅 日出 ${weather.sunrise || '--'}</span>
        <span class="fw-sun-sep">·</span>
        <span class="fw-sun">🌇 日落 ${weather.sunset || '--'}</span>
        ${weather.isClimate ? `<span class="fw-sun-note">參考</span>` : ''}
      </div>`;
    }

    return `
      <div class="focus-weather-row">
        ${tabsHtml}
        <div class="focus-weather-line1">${line1Html}</div>
        ${alertHtml}
        ${sunHtml}
      </div>
    `;
  }

  window._AppHeader_switchWeatherLoc = function (locId, dateStr, dayIdx) {
    _selectedWeatherLocId = locId;
    _selectedWeatherDayKey = dateStr;
    haptic(6);
    renderFocusCard(true);
  };

  // ============================================================
  // 當前 / 下一站事件
  // ============================================================
  function getCurrentEventInfo(dayData) {
    if (!dayData || !dayData.events) return null;
    const nowMin = getNowMinutes();

    for (let i = 0; i < dayData.events.length; i++) {
      const evt = dayData.events[i];
      const startStr = evt.time.split(" - ")[0].trim();
      const endStr = evt.time.split(" - ")[1];
      const [sh, sm] = startStr.split(":").map(Number);
      if (isNaN(sh)) continue;

      const start = sh * 60 + sm;
      let end = start + 120;
      if (endStr) {
        const [eh, em] = endStr.trim().split(":").map(Number);
        if (!isNaN(eh)) end = eh * 60 + em;
        if (end < start) end = 23 * 60 + 59;
      }

      if (nowMin >= start && nowMin <= end) {
        const total = end - start;
        const elapsed = nowMin - start;
        const percent = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;
        return {
          event: evt,
          eventIndex: i,
          startTime: startStr,
          endTime: endStr ? endStr.trim() : '',
          remainMin: end - nowMin,
          totalMin: total,
          percent
        };
      }
    }
    return null;
  }

  function getNextEventInfo(dayData) {
    if (!dayData || !dayData.events) return null;
    const nowMin = getNowMinutes();

    for (let i = 0; i < dayData.events.length; i++) {
      const evt = dayData.events[i];
      const startStr = evt.time.split(" - ")[0].trim();
      const [h, m] = startStr.split(":").map(Number);
      if (isNaN(h)) continue;
      const start = h * 60 + m;
      if (start > nowMin) {
        return {
          event: evt,
          eventIndex: i,
          startTime: startStr,
          remainMin: start - nowMin
        };
      }
    }
    return null;
  }

  function formatRemainMin(min) {
    if (min <= 0) return '即將結束';
    if (min < 60) return `${min} 分鐘`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h} 小時 ${m} 分` : `${h} 小時`;
  }

  // ============================================================
  // 廣播分級
  // ============================================================
  function buildBroadcastHTML() {
    if (!window.Messages) return '';
    const list = window.Messages.getAll ? window.Messages.getAll() : [];
    const canWrite = window.Messages.canWrite();
    const count = list.length;

    if (count === 0) {
      const emptyText = canWrite ? '尚無留言，點此發送第一則' : '訪客僅能閱讀';
      return `
        <div class="broadcast-block" id="broadcast-block" onclick="openMessagesModal()" style="cursor:pointer">
          <div class="broadcast-header">
            <span class="broadcast-title">📢 家庭廣播</span>
            <span class="broadcast-open-hint">點擊查看 →</span>
          </div>
          <div class="broadcast-empty">${emptyText}</div>
        </div>`;
    }

    const pinned = list.filter(m => m.pinned);
    const unpinned = list.filter(m => !m.pinned);

    let rowsHtml = '';

    pinned.slice(0, 2).forEach(m => {
      rowsHtml += renderBroadcastPinnedRow(m);
    });

    if (pinned.length > 2) {
      rowsHtml += `<button class="broadcast-more-btn" onclick="event.stopPropagation();openMessagesModal()">
        <span>📌</span>
        <span>還有 ${pinned.length - 2} 則置頂訊息</span>
        <span class="broadcast-more-arrow">›</span>
      </button>`;
    }

    if (unpinned.length > 0) {
      const first = unpinned[0];
      const others = unpinned.length - 1;
      rowsHtml += `
        <button class="broadcast-unpinned-row" onclick="event.stopPropagation();openMessagesModal()">
          <span class="broadcast-unpinned-dot">⚪</span>
          <div class="broadcast-unpinned-body">
            <div class="broadcast-unpinned-text">
              <strong>${escapeHtml(first.author)}</strong>：${escapeHtml(first.text)}
            </div>
            <div class="broadcast-unpinned-meta">${formatMsgTimeAgo(first.createdAt)}</div>
          </div>
          ${others > 0 ? `<span class="broadcast-unpinned-more">+${others}</span>` : ''}
        </button>`;
    }

    return `
      <div class="broadcast-block" id="broadcast-block" onclick="openMessagesModal()" style="cursor:pointer">
        <div class="broadcast-header">
          <span class="broadcast-title">📢 家庭廣播</span>
          ${count > 0 ? `<span class="broadcast-count">${count}</span>` : ''}
          <span class="broadcast-open-hint">點擊查看 →</span>
        </div>
        ${rowsHtml}
      </div>`;
  }

  function renderBroadcastPinnedRow(m) {
    const isLoc = m.type === 'location' && m.location && typeof m.location.lat === 'number';
    const mapUrl = isLoc ? `https://www.google.com/maps?q=${m.location.lat},${m.location.lng}` : '';
    const expire = m.expiresAt ? m.expiresAt - Date.now() : null;
    const countdownHtml = (expire && expire > 0)
      ? `<span class="broadcast-countdown" data-broadcast-countdown="${m.expiresAt}">還有 ${formatMsgCountdown(expire)}</span>`
      : '';
    const dayTag = (m.day >= 1 && m.day <= 7)
      ? `<button type="button" class="message-day-tag" onclick="event.stopPropagation();window._Messages_jumpToDay(${m.day})">D${m.day}</button>`
      : '';

    return `
      <div class="broadcast-pinned-row">
        <div class="broadcast-pinned-main">
          <span class="broadcast-pin">📌</span>
          <span class="broadcast-pinned-text">${escapeHtml(m.text)}</span>
        </div>
        <div class="broadcast-pinned-meta">
          ${dayTag}
          ${countdownHtml}
          ${isLoc ? `<a href="${mapUrl}" target="_blank" rel="noopener" class="broadcast-mini-nav" onclick="event.stopPropagation()">📍 導航</a>` : ''}
        </div>
      </div>`;
  }

  function updateBroadcastCountdowns() {
    const els = document.querySelectorAll('[data-broadcast-countdown]');
    els.forEach(el => {
      const expiresAt = parseInt(el.dataset.broadcastCountdown, 10);
      if (!expiresAt) return;
      const remain = expiresAt - Date.now();
      if (remain <= 0) {
        el.textContent = '已到時間';
        el.classList.add('urgent');
      } else {
        el.textContent = `還有 ${formatMsgCountdown(remain)}`;
        if (remain < 15 * 60 * 1000) {
          el.classList.add('urgent');
        } else {
          el.classList.remove('urgent');
        }
      }
    });
  }

  // ============================================================
  // Focus Card 主渲染
  // ============================================================
  function renderFocusCard(force) {
    if (!_container) return;
    const focusEl = _container.querySelector("#app-header-focus");
    if (!focusEl) return;
    const phase = getTripPhase();
    const cb = _config.callbacks || {};

    let currentStage = null;
    if (phase === "before") {
      const days = Math.floor((_config.tripStart - Date.now()) / 86400000);
      currentStage = getPrepStage(days);
    }

    const stageChanged = (phase === "before" && currentStage !== _lastPrepStage);

    if (force || _lastRenderedPhase !== phase || stageChanged) {
      _lastRenderedPhase = phase;
      if (phase === "before") _lastPrepStage = currentStage;
      let innerHTML = "";

      if (phase === "before") {
        const now = Date.now();
        const diff = _config.tripStart - now;
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        const stage = currentStage || "seed";

        const bookingP = getProgressData("booking");
        const equipP = getProgressData("equip");
        const totalPrep = bookingP.total + equipP.total;
        const donePrep = bookingP.done + equipP.done;
        const prepPercent = totalPrep > 0 ? Math.round((donePrep / totalPrep) * 100) : 0;

        const departureDate = _config.tripDates[0];
        const departureWeather = window.weatherCache?.[departureDate];
        const departureLoc = getWeatherLocationsForDay(0)[0] || null;
        const weatherHtml = departureWeather ? buildDepartureWeatherHtml(departureWeather, departureLoc) : '';

        const ticketCountdownHtml = (stage === "sprint" || stage === "final")
          ? buildTicketCountdownHtml() : '';

        const luggageHtml = (stage === "sprint" || stage === "final")
          ? buildLuggageProgressHtml(equipP) : '';

        const pendingHtml = (stage === "final")
          ? buildPendingListHtml(bookingP, equipP) : '';

        const progressHtml = (stage !== "final")
          ? buildPrepProgressHtml(bookingP, equipP, totalPrep, donePrep, prepPercent) : '';

        const task = getNextBigTask();
        const taskHtml = (stage !== "seed" && task) ? buildTaskHtml(task) : '';

        innerHTML = `<div class="focus-inner">
          <div class="focus-label">
            <span class="focus-label-dot"></span>
            <span class="focus-label-text">距離出發還有</span>
          </div>

          <div class="countdown-inline" id="focus-countdown-inline">
            <span class="countdown-inline-num" data-inline="days">${days}</span>
            <span class="countdown-inline-unit">天</span>
            <span class="countdown-inline-num-sm" data-inline="hours">${String(hours).padStart(2, "0")}</span>
            <span class="countdown-inline-unit-sm">時</span>
            <span class="countdown-inline-num-sm" data-inline="minutes">${String(minutes).padStart(2, "0")}</span>
            <span class="countdown-inline-unit-sm">分</span>
          </div>

          ${weatherHtml}
          ${progressHtml}
          ${ticketCountdownHtml}
          ${luggageHtml}
          ${pendingHtml}
          ${taskHtml}

          <div class="focus-cta-row">
            <button type="button" class="focus-cta focus-cta-primary" data-action="overview">
              <span>📋</span> 行程速覽
            </button>
            <button type="button" class="focus-cta focus-cta-secondary" data-action="booking">
              <span>📌</span> 行前預訂
            </button>
            <button type="button" class="focus-cta focus-cta-secondary" data-action="equip">
              <span>🎒</span> 裝備
            </button>
          </div>
        </div>`;

        if (_container) {
          _container.setAttribute('data-phase-stage', stage);
          _container.setAttribute('data-days-left',
            days > 90 ? 'large' : days > 30 ? 'medium' : 'small');
        }
      }
      else if (phase === "during") {
        const dayIdx = getCurrentDayIndex();
        const actualDayIdx = dayIdx >= 0 ? dayIdx : 0;
        const dayData = _config.itineraries[actualDayIdx];
        const dateStr = _config.tripDates[actualDayIdx];
        const dayNum = actualDayIdx + 1;
        const msgCount = window.Messages ? window.Messages.getCount() : 0;

        const broadcastHTML = buildBroadcastHTML();
        const weatherRowHtml = renderWeatherRow(actualDayIdx, dateStr);
        const currentInfo = getCurrentEventInfo(dayData);
        const nextInfo = getNextEventInfo(dayData);

        let currentBlockHtml = '';
        if (currentInfo) {
          const timeRange = currentInfo.endTime
            ? `${currentInfo.startTime} – ${currentInfo.endTime}`
            : `${currentInfo.startTime} 起`;
          const isUrgent = currentInfo.remainMin <= 10;
          const urgentClass = isUrgent ? ' urgent' : '';
          const endingTag = isUrgent ? '<span class="focus-now-ending">⏰ 即將結束</span>' : '';
          currentBlockHtml = `
            <button type="button" class="focus-now-block focus-jumpable"
                    data-jump-day="${dayNum}"
                    data-jump-event="${currentInfo.eventIndex}"
                    aria-label="跳到行程">
              <div class="focus-now-label">🎯 現在進行</div>
              <div class="focus-now-title">${escapeHtml(currentInfo.event.title)}${endingTag}</div>
              <div class="focus-now-time">${escapeHtml(timeRange)} · 還有 ${formatRemainMin(currentInfo.remainMin)}</div>
              <div class="focus-now-progress">
                <div class="focus-now-progress-fill${urgentClass}" style="width:${currentInfo.percent}%"></div>
              </div>
            </button>
          `;
        } else {
          currentBlockHtml = `
            <div class="focus-now-block focus-now-idle">
              <div class="focus-now-label">🎯 現在</div>
              <div class="focus-now-title focus-now-idle-text">空檔 · 自由時間</div>
            </div>
          `;
        }

        let nextBlockHtml = '';
        if (nextInfo) {
          nextBlockHtml = `
            <button type="button" class="focus-next-block focus-jumpable"
                    data-jump-day="${dayNum}"
                    data-jump-event="${nextInfo.eventIndex}"
                    aria-label="跳到行程">
              <div class="focus-next-label">⏭️ 下一站</div>
              <div class="focus-next-title">${escapeHtml(nextInfo.startTime)} · ${escapeHtml(nextInfo.event.title)}</div>
              <div class="focus-next-row">
                <span class="focus-next-remain">還有 ${formatRemainMin(nextInfo.remainMin)}</span>
                <span class="focus-next-arrow">›</span>
              </div>
            </button>
          `;
        } else {
          nextBlockHtml = `
            <div class="focus-next-block">
              <div class="focus-next-label">⏭️ 下一站</div>
              <div class="focus-next-title focus-next-done">今日行程已結束</div>
            </div>
          `;
        }

        innerHTML = `<div class="focus-inner">
          ${broadcastHTML}
          ${weatherRowHtml}
          <div class="focus-status">
            ${currentBlockHtml}
            ${nextBlockHtml}
          </div>
          <div class="focus-cta-row focus-cta-row-during">
            <button type="button" class="focus-cta focus-cta-secondary" data-action="shopping"><span>🛍️</span> 購物</button>
            <button type="button" class="focus-cta focus-cta-secondary" data-action="messages"><span>💬</span> 留言${msgCount > 0 ? `<span class="broadcast-badge">${msgCount}</span>` : ''}</button>
          </div>
        </div>`;
      }
      else {
        let totalExpenses = 0;
        if (cb.getExpenseCount) { try { totalExpenses = cb.getExpenseCount() || 0; } catch (e) {} }
        const shoppingP = getProgressData("shopping");
        innerHTML = `<div class="focus-inner">
          <div class="focus-label">旅程圓滿結束</div>
          <div class="focus-title">🎉 感謝這趟美好的雪國之旅</div>
          <div class="focus-subtitle">7 天 · 4 大 2 小 · 無數美好回憶</div>
          <div class="focus-stats">
            <div class="focus-stat"><div class="num">7</div><div class="lbl">旅行天數</div></div>
            <div class="focus-stat"><div class="num">${totalExpenses}</div><div class="lbl">記帳筆數</div></div>
            <div class="focus-stat"><div class="num">${shoppingP.done}</div><div class="lbl">購物項目</div></div>
          </div>
          <div class="focus-cta-row">
            <button type="button" class="focus-cta focus-cta-primary" data-action="overview"><span>📖</span> 回顧旅程</button>
            <button type="button" class="focus-cta focus-cta-secondary" data-action="switchLedger"><span>💰</span> 查看記帳</button>
          </div>
        </div>`;
      }

      focusEl.innerHTML = innerHTML;
      bindFocusActions(focusEl, cb);
      if (phase === "during") {
        _lastDuringRender = Date.now();
        updateBroadcastCountdowns();
      }
    }
  }

  function bindFocusActions(focusEl, cb) {
    focusEl.querySelectorAll("[data-action]").forEach(el => {
      el.addEventListener("click", () => {
        const action = el.dataset.action;
        switch (action) {
          case "booking":        cb.onBooking && cb.onBooking();     break;
          case "equip":          cb.onEquip && cb.onEquip();         break;
          case "shopping":       cb.onShopping && cb.onShopping();   break;
          case "ticket":         cb.onTicket && cb.onTicket();       break;
          case "weather":        cb.onWeather && cb.onWeather();     break;
          case "overview":       cb.onOverview && cb.onOverview();   break;
          case "switchLedger":   cb.onSwitchTab && cb.onSwitchTab("ledger"); break;
          case "navigate":       openNavigateMenu(); break;
          case "messages":       openMessagesModal(); break;
          case "shoot":          cb.onShoot && cb.onShoot();         break;
          case "prep-overview":  openPrepOverviewModal();            break;
          case "scrollToDay": {
            const idx = getCurrentDayIndex();
            const day = idx >= 0 ? idx + 1 : 1;
            cb.onScrollToDay && cb.onScrollToDay(day);
            break;
          }
        }
      });
    });

    focusEl.querySelectorAll("[data-jump-day]").forEach(el => {
      el.addEventListener("click", () => {
        const day = parseInt(el.dataset.jumpDay, 10);
        const eventIdx = parseInt(el.dataset.jumpEvent, 10);
        if (isNaN(day)) return;
        haptic(10);

        closeToolsMenu();

        if (typeof window.switchDay === "function") {
          window.switchDay(day);
        } else if (cb.onScrollToDay) {
          cb.onScrollToDay(day);
        }

        setTimeout(() => {
          const section = document.getElementById('day-section-' + day);
          if (!section) return;
          const target = section.querySelectorAll('details.event-card')[eventIdx];
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
      });
    });
  }

  // ============================================================
  // 工具選單
  // ============================================================
  function openToolsMenu() {
    const panel = _container?.querySelector("#tools-menu-panel");
    const backdrop = _container?.querySelector("#tools-menu-backdrop");
    const toggle = _container?.querySelector("#tools-toggle");
    if (!panel || !backdrop || !toggle) return;
    renderToolsMenu();
    panel.classList.add("active");
    backdrop.classList.add("active");
    toggle.classList.add("active");
    haptic(6);
  }
  function closeToolsMenu() {
    const panel = _container?.querySelector("#tools-menu-panel");
    const backdrop = _container?.querySelector("#tools-menu-backdrop");
    const toggle = _container?.querySelector("#tools-toggle");
    if (!panel || !backdrop || !toggle) return;
    panel.classList.remove("active");
    backdrop.classList.remove("active");
    toggle.classList.remove("active");
  }
  function toggleToolsMenu() {
    const panel = _container?.querySelector("#tools-menu-panel");
    if (!panel) return;
    if (panel.classList.contains("active")) closeToolsMenu();
    else openToolsMenu();
  }

  function renderToolsMenu() {
    const panel = _container?.querySelector("#tools-menu-panel");
    if (!panel) return;
    const phase = getTripPhase();
    const cb = _config.callbacks || {};
    const guest = isGuestUser();
    const currentUser = getCurrentUser();
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    const progressItems = [];
    const bookingP = getProgressData("booking");
    if (bookingP.total > 0) progressItems.push({ icon: "📌", label: "行前預訂", done: bookingP.done, total: bookingP.total, action: "booking" });
    if (!guest) {
      const equipP = getProgressData("equip");
      progressItems.push({ icon: "🎒", label: "我的裝備", done: equipP.done, total: equipP.total, action: "equip" });
      const shoppingP = getProgressData("shopping");
      progressItems.push({ icon: "🛍️", label: "我的購物", done: shoppingP.done, total: shoppingP.total, action: "shopping" });
    }

    const progressHTML = progressItems.map(it => {
      const done = it.done === it.total && it.total > 0;
      const badgeHTML = it.total === 0
        ? `<span class="tools-item-tag new">＋ 加入</span>`
        : `<span class="tools-item-progress ${done ? 'done' : ''}">${done ? '✓ ' : ''}${it.done}/${it.total}</span>`;
      return `<button type="button" class="tools-item ${done ? 'complete' : ''}" data-tool-action="${it.action}">
        <span class="tools-item-icon">${it.icon}</span>
        <span class="tools-item-label">${escapeHtml(it.label)}</span>
        ${badgeHTML}
        <span class="tools-item-arrow">›</span>
      </button>`;
    }).join("");

    const isConnected = _syncConnected;
    const ticketCd = getTicketCountdown();
    const showInstall = (typeof window.isInstallAvailable === "function") && window.isInstallAvailable();
    const isDark = currentTheme === 'dark';

    panel.innerHTML = `
      ${progressItems.length > 0 ? `<div class="tools-section"><div class="tools-section-label"><span>📊</span> 我的清單</div>${progressHTML}</div>` : ""}
      <div class="tools-section">
        <div class="tools-section-label"><span>⚡</span> 快速操作</div>
        <button type="button" class="tools-item" data-tool-action="search"><span class="tools-item-icon">${ICONS.search}</span><span class="tools-item-label">搜尋行程</span><span class="tools-item-arrow">›</span></button>
        <button type="button" class="tools-item" data-tool-action="overview"><span class="tools-item-icon">${ICONS.overview}</span><span class="tools-item-label">行程速覽</span><span class="tools-item-arrow">›</span></button>
        <button type="button" class="tools-item" data-tool-action="ledger"><span class="tools-item-icon">${ICONS.ledger}</span><span class="tools-item-label">快速記帳</span><span class="tools-item-arrow">›</span></button>
        <button type="button" class="tools-item" data-tool-action="receipts"><span class="tools-item-icon">${ICONS.receipt}</span><span class="tools-item-label">共享收據/憑證</span><span class="tools-item-tag new">新增</span><span class="tools-item-arrow">›</span></button>
      </div>
      ${showInstall ? `<div class="tools-section"><div class="tools-section-label"><span>📲</span> 應用程式</div>
        <button type="button" class="tools-item" data-tool-action="install"><span class="tools-item-icon">${ICONS.install}</span><span class="tools-item-label">安裝 App 到桌面</span><span class="tools-item-tag new">推薦</span><span class="tools-item-arrow">›</span></button>
      </div>` : ""}
      <div class="tools-section">
        <div class="tools-section-label"><span>🎨</span> 顯示與安全</div>
        <button type="button" class="tools-item" data-tool-action="theme"><span class="tools-item-icon">${ICONS.theme}</span><span class="tools-item-label">${isDark ? '淺色模式' : '深色模式'}</span><span class="tools-item-arrow">›</span></button>
        <button type="button" class="tools-item" data-tool-action="emergency"><span class="tools-item-icon">${ICONS.emergency}</span><span class="tools-item-label">緊急資訊</span><span class="tools-item-arrow">›</span></button>
      </div>
      <div class="tools-section">
        <div class="tools-section-label"><span>📚</span> 攻略參考</div>
        ${phase !== "after" ? `<button type="button" class="tools-item" data-tool-action="ticket">
          <span class="tools-item-icon">${ICONS.ticket}</span>
          <span class="tools-item-label">搶票攻略</span>
          ${ticketCd ? `<span class="tools-item-tag hot">⏰ ${ticketCd}</span>` : ""}
          <span class="tools-item-arrow">›</span>
        </button>` : ""}
        <button type="button" class="tools-item" data-tool-action="drive"><span class="tools-item-icon">${ICONS.drive}</span><span class="tools-item-label">雪地攻略</span><span class="tools-item-arrow">›</span></button>
        <button type="button" class="tools-item" data-tool-action="shoot"><span class="tools-item-icon">${ICONS.shoot}</span><span class="tools-item-label">拍攝技巧</span><span class="tools-item-arrow">›</span></button>
      </div>
      <div class="tools-section">
        <div class="tools-section-label"><span>⚙️</span> 帳戶</div>
        <button type="button" class="tools-item" data-tool-action="ledger"><span class="tools-item-icon">${ICONS.ledger}</span><span class="tools-item-label">隨行記帳本</span><span class="tools-item-arrow">›</span></button>
        ${currentUser ? `<button type="button" class="tools-item" data-tool-action="account">
          <span class="tools-item-icon">${ICONS.account}</span>
          <span class="tools-item-label">${escapeHtml(currentUser)} · 帳戶設定</span>
          <span class="tools-item-arrow">›</span>
        </button>` : ""}
      </div>
      <div class="tools-section">
        <div class="tools-sync-status ${isConnected ? '' : 'disconnected'}">
          <span class="tools-sync-dot"></span>
          <span>${isConnected ? '雲端已連線' : '連線中斷'}</span>
        </div>
      </div>
    `;

    panel.querySelectorAll("[data-tool-action]").forEach(el => {
      el.addEventListener("click", () => {
        const action = el.dataset.toolAction;
        closeToolsMenu();
        setTimeout(() => {
          if (action === "search")  { openSearchModal(); return; }
          if (action === "install") { if (typeof window.triggerInstall === "function") window.triggerInstall(); return; }
          const map = {
            booking: cb.onBooking, equip: cb.onEquip, shopping: cb.onShopping,
            ticket: cb.onTicket, drive: cb.onDrive, shoot: cb.onShoot, weather: cb.onWeather,
            overview: () => { cb.onOverview && cb.onOverview(); },
            ledger: () => cb.onSwitchTab && cb.onSwitchTab("ledger"),
            account: () => { if (typeof window.switchUser === "function") window.switchUser(); },
            theme: () => { if (typeof window.toggleAppTheme === "function") window.toggleAppTheme(); },
            emergency: () => { if (typeof window.openEmergencyModal === "function") window.openEmergencyModal(); },
            receipts: () => { if (typeof window.openReceiptModal === "function") window.openReceiptModal(); }
          };
          if (map[action]) map[action]();
        }, 180);
      });
    });
  }

  window.openSearchModal = openSearchModal;
  window.closeSearchModal = closeSearchModal;
  window.openPrepOverviewModal = openPrepOverviewModal;
  window.closePrepOverviewModal = closePrepOverviewModal;

  // ============================================================
  // 對外 API
  // ============================================================
  return {
    init(config) {
      _config = config;
      _container = document.getElementById(config.containerId);
      if (!_container) { console.warn("[AppHeader] container not found:", config.containerId); return; }
      _lastRenderedPhase = null;
      _lastPrepStage = null;
      _lastDuringRender = 0;
      _selectedWeatherLocId = null;
      _selectedWeatherDayKey = null;

      _container.innerHTML = `
        <div class="brand-bar">
          <div class="brand-title-wrap">
            <span style="font-size:16px;flex-shrink:0">❄️</span>
            <span class="brand-title">東北冬季親子自駕 2027</span>
          </div>
          <div class="brand-actions">
            <button type="button" id="app-header-search" class="tools-toggle" title="搜尋行程" aria-label="搜尋行程">
              <span class="tools-toggle-icon">${ICONS.search}</span>
              <span class="tools-toggle-text">搜尋</span>
            </button>
            <button type="button" id="app-header-weather" class="tools-toggle" title="天氣預報" aria-label="天氣預報">
              <span class="tools-toggle-icon">${ICONS.weather}</span>
              <span class="tools-toggle-text">天氣</span>
            </button>
            <button type="button" id="app-header-reload" class="tools-toggle" title="重整頁面" aria-label="重整頁面">
              <span class="tools-toggle-icon">${ICONS.refresh}</span>
              <span class="tools-toggle-text">重整</span>
            </button>
            <button type="button" id="tools-toggle" class="tools-toggle" title="工具選單" aria-label="工具選單">
              <span class="tools-toggle-icon icon-gear">${ICONS.gear}</span>
              <span class="tools-toggle-text">工具</span>
            </button>
          </div>
        </div>
        <div class="focus-card">
          <div id="app-header-focus" class="focus-inner">
            <div class="focus-loading"><div class="focus-spinner"></div></div>
          </div>
        </div>
        <div class="tools-menu-backdrop" id="tools-menu-backdrop"></div>
        <div class="tools-menu-panel" id="tools-menu-panel"></div>
      `;

      _container.querySelector("#app-header-search")?.addEventListener("click", (e) => { e.stopPropagation(); openSearchModal(); });
      _container.querySelector("#app-header-weather")?.addEventListener("click", (e) => {
        e.stopPropagation();
        const cb = _config.callbacks || {};
        if (cb.onWeather) cb.onWeather();
        haptic(10);
      });

      _container.querySelector("#app-header-reload")?.addEventListener("click", (e) => {
        e.stopPropagation();
        hardReload();
      });

      const toggleBtn = _container.querySelector("#tools-toggle");
      if (toggleBtn) toggleBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleToolsMenu(); });

      const backdrop = _container.querySelector("#tools-menu-backdrop");
      if (backdrop) backdrop.addEventListener("click", () => closeToolsMenu());

      _docClickHandler = (e) => {
        const panel = _container?.querySelector("#tools-menu-panel");
        if (!panel || !panel.classList.contains("active")) return;
        if (panel.contains(e.target)) return;
        if (toggleBtn && toggleBtn.contains(e.target)) return;
        closeToolsMenu();
      };
      document.addEventListener("click", _docClickHandler);

      _escKeyHandler = (e) => {
        if (e.key === "Escape") { closeToolsMenu(); closeSearchModal(); }
      };
      document.addEventListener("keydown", _escKeyHandler);

      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          clearTimeout(_searchDebounceTimer);
          _searchDebounceTimer = setTimeout(() => handleSearchInput(e.target.value), 150);
        });
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(_searchDebounceTimer);
            const first = document.querySelector('.search-result-item');
            if (first) first.click();
          }
        });
      }
      document.getElementById('search-close')?.addEventListener('click', () => closeSearchModal());
      const searchBackdrop = document.getElementById('search-modal');
      if (searchBackdrop) {
        searchBackdrop.addEventListener('click', (e) => { if (e.target === searchBackdrop) closeSearchModal(); });
      }

      renderFocusCard();

      if (_tickTimer) clearInterval(_tickTimer);
      _tickTimer = setInterval(() => {
        if (document.hidden) return;
        const phase = getTripPhase();
        if (phase !== _lastRenderedPhase) { renderFocusCard(); return; }

        if (phase === "before") {
          const days = Math.floor((_config.tripStart - Date.now()) / 86400000);
          const stage = getPrepStage(days);
          if (stage !== _lastPrepStage) {
            renderFocusCard(true);
          } else {
            updateCountdownNumbers();
          }
        }

        if (phase === "during") {
          updateBroadcastCountdowns();
          const now = Date.now();
          if (now - _lastDuringRender >= 60000) {
            _lastDuringRender = now;
            renderFocusCard(true);
          }
        }
      }, 1000);
    },

    render() { _lastRenderedPhase = null; _lastPrepStage = null; renderFocusCard(); },
    getPhase() { return getTripPhase(); },
    syncAll() { return syncAllData(); },
    reload()  { return hardReload(); },

    setSyncState(connected) {
      _syncConnected = !!connected;
      const panel = _container?.querySelector("#tools-menu-panel");
      if (!panel || !panel.classList.contains("active")) return;
      renderToolsMenu();
    },

    refreshBroadcast() {
      if (!_container) return;
      const block = _container.querySelector("#broadcast-block");
      if (!block) return;
      const parent = block.parentElement;
      if (!parent) return;
      const temp = document.createElement('div');
      temp.innerHTML = buildBroadcastHTML();
      const newBlock = temp.firstElementChild;
      if (newBlock) parent.replaceChild(newBlock, block);
      updateBroadcastCountdowns();
    },

    destroy() {
      if (_tickTimer) { clearInterval(_tickTimer); _tickTimer = null; }
      if (_docClickHandler) { document.removeEventListener("click", _docClickHandler); _docClickHandler = null; }
      if (_escKeyHandler) { document.removeEventListener("keydown", _escKeyHandler); _escKeyHandler = null; }
      if (_searchDebounceTimer) { clearTimeout(_searchDebounceTimer); _searchDebounceTimer = null; }
      if (_container) _container.innerHTML = "";
      _config = null; _container = null;
      _lastRenderedPhase = null; _lastPrepStage = null;
      _lastDuringRender = 0;
      _selectedWeatherLocId = null;
      _selectedWeatherDayKey = null;
    },

    _getConfig: () => _config
  };
})();

/* ============================================================
 * 🧭 導航選單
 * ============================================================ */
function openNavigateMenu() {
  const cfg = window.AppHeader._getConfig();
  if (!cfg) return;
  const now = Date.now();
  let dayIdx = -1;
  for (let i = 0; i < cfg.tripDates.length; i++) {
    const s = new Date(cfg.tripDates[i] + "T00:00:00+08:00").getTime();
    const e = new Date(cfg.tripDates[i] + "T23:59:59+08:00").getTime();
    if (now >= s && now <= e) { dayIdx = i; break; }
  }
  if (dayIdx < 0) {
    try {
      const testDay = new URLSearchParams(window.location.search).get('day');
      if (testDay) {
        const idx = parseInt(testDay) - 1;
        if (idx >= 0 && idx < cfg.tripDates.length) dayIdx = idx;
      }
    } catch (e) {}
  }
  const dayData = cfg.itineraries[dayIdx >= 0 ? dayIdx : 0];
  if (!dayData || !dayData.events) return;

  const nowMin = (function() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const timeParam = urlParams.get('time');
      if (timeParam) {
        const m = timeParam.match(/^(\d{1,2}):(\d{2})$/);
        if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
      }
      if (urlParams.get('test') === 'during') return 10 * 60 + 30;
    } catch (e) {}
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  })();

  let curIdx = -1;
  for (let i = 0; i < dayData.events.length; i++) {
    const evt = dayData.events[i];
    const [h, m] = evt.time.split(" - ")[0].trim().split(":").map(Number);
    if (isNaN(h)) continue;
    const start = h * 60 + m;
    const endStr = evt.time.split(" - ")[1];
    let end = start + 120;
    if (endStr) {
      const [eh, em] = endStr.trim().split(":").map(Number);
      if (!isNaN(eh)) end = eh * 60 + em;
    }
    if (nowMin >= start && nowMin <= end) { curIdx = i; break; }
  }
  if (curIdx < 0) {
    for (let i = 0; i < dayData.events.length; i++) {
      const [h, m] = dayData.events[i].time.split(" - ")[0].trim().split(":").map(Number);
      if (!isNaN(h) && h * 60 + m > nowMin) { curIdx = i; break; }
    }
  }
  if (curIdx < 0) curIdx = 0;

  const opts = [];
  for (let i = curIdx; i < Math.min(curIdx + 3, dayData.events.length); i++) {
    const evt = dayData.events[i];
    opts.push({
      label: i === curIdx ? '▶ 當前' : (i === curIdx + 1 ? '下一個' : '下下個'),
      time: evt.time, title: evt.title, navUrl: evt.navUrl
    });
  }

  const content = document.getElementById("navigate-menu-content");
  if (!content) return;
  content.innerHTML = opts.map(opt => {
    const url = opt.navUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(opt.title)}`;
    return `<a href="${url}" target="_blank" rel="noopener" class="navigate-option ${opt.label.startsWith('▶') ? 'current' : ''}" onclick="closeNavigateMenu()">
      <div class="navigate-option-label">${opt.label}</div>
      <div class="navigate-option-title">${opt.title}</div>
      <div class="navigate-option-time">${opt.time}</div>
      <div class="navigate-option-arrow">›</div>
    </a>`;
  }).join('');

  const m = document.getElementById("navigate-menu-modal");
  if (m) { m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); }
  if (navigator.vibrate) navigator.vibrate(8);
}
function closeNavigateMenu() {
  const m = document.getElementById("navigate-menu-modal");
  if (m) {
    m.classList.remove('active');
    setTimeout(() => { m.style.display = 'none'; }, 250);
    if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('modal-open');
  }
}

/* ============================================================
 * 💬 家庭廣播
 * ============================================================ */
function openMessagesModal() {
  const m = document.getElementById("messages-modal");
  if (!m) return;
  renderMessagesModal();
  m.style.display = 'flex';
  m.classList.add('active');
  document.body.classList.add('modal-open');

  const canWrite = window.Messages ? window.Messages.canWrite() : false;
  const quickRow = m.querySelector('.msg-quick-row');
  const textarea = m.querySelector('#messages-input');
  const options = m.querySelector('.msg-options');
  const sendBtn = m.querySelector('#messages-send-btn');
  const guestNotice = m.querySelector('.msg-guest-notice');

  if (canWrite) {
    if (quickRow) quickRow.style.display = '';
    if (textarea) textarea.style.display = '';
    if (options) options.style.display = '';
    if (sendBtn) sendBtn.style.display = '';
    if (guestNotice) guestNotice.style.display = 'none';
  } else {
    if (quickRow) quickRow.style.display = 'none';
    if (textarea) textarea.style.display = 'none';
    if (options) options.style.display = 'none';
    if (sendBtn) sendBtn.style.display = 'none';
    if (guestNotice) guestNotice.style.display = 'flex';
  }

  const btn = document.getElementById("messages-send-btn");
  const input = document.getElementById("messages-input");
  const pinOpt = document.getElementById("msg-opt-pin");
  const expireOpt = document.getElementById("msg-opt-expire");
  const expireLabel = document.getElementById("msg-opt-expire-label");

  if (input) input.value = '';
  if (pinOpt) pinOpt.checked = false;
  if (expireOpt) { expireOpt.checked = false; expireOpt.dataset.minutes = '30'; }
  if (expireLabel) expireLabel.textContent = '⏱️ 30 分鐘後自動隱藏';
  if (btn) { btn.disabled = true; btn.classList.add('opacity-50'); }

  m.querySelectorAll('[data-template]').forEach(tbtn => {
    tbtn.onclick = () => applyMessageTemplate(tbtn.dataset.template);
  });

  if (input && btn) {
    input.oninput = () => {
      const hasText = !!input.value.trim();
      btn.disabled = !hasText;
      btn.classList.toggle('opacity-50', !hasText);
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!btn.disabled) btn.click();
      }
    };
  }

  if (btn) btn.onclick = sendMessageFromModal;

  if (expireOpt && expireLabel) {
    expireOpt.onchange = () => {
      if (expireOpt.checked) {
        const mins = parseInt(expireOpt.dataset.minutes || '30');
        const label = mins >= 60 ? `${(mins / 60).toFixed(mins % 60 === 0 ? 0 : 1)} 小時` : `${mins} 分鐘`;
        expireLabel.textContent = `⏱️ ${label}後自動隱藏`;
      } else {
        expireLabel.textContent = '⏱️ 不過期';
      }
    };
  }

  if (navigator.vibrate) navigator.vibrate(8);
}

function applyMessageTemplate(type) {
  const input = document.getElementById("messages-input");
  const pinOpt = document.getElementById("msg-opt-pin");
  const expireOpt = document.getElementById("msg-opt-expire");
  const expireLabel = document.getElementById("msg-opt-expire-label");
  const btn = document.getElementById("messages-send-btn");
  if (!input) return;

  const now = new Date();
  const t = new Date(now.getTime() + 15 * 60 * 1000);
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');

  let duration = 30;
  let label = '30 分鐘';

  switch (type) {
    case 'meetup':
      input.value = `${hh}:${mm} 在 ___ 集合`;
      if (pinOpt) pinOpt.checked = true;
      duration = 30; label = '30 分鐘';
      break;
    case 'remind':
      input.value = '記得帶 ___';
      if (pinOpt) pinOpt.checked = false;
      duration = 0;
      break;
    case 'urgent':
      input.value = '緊急！___';
      if (pinOpt) pinOpt.checked = true;
      duration = 120; label = '2 小時';
      break;
    case 'location':
      shareMyLocation();
      return;
  }

  if (expireOpt) {
    expireOpt.checked = duration > 0;
    expireOpt.dataset.minutes = String(duration || 30);
  }
  if (expireLabel) {
    expireLabel.textContent = duration > 0 ? `⏱️ ${label}後自動隱藏` : '⏱️ 不過期';
  }

  input.focus();
  const pos = input.value.indexOf('___');
  if (pos >= 0) input.setSelectionRange(pos, pos + 3);
  else input.setSelectionRange(input.value.length, input.value.length);

  if (btn && input.value.trim()) {
    btn.disabled = false;
    btn.classList.remove('opacity-50');
  }
  if (navigator.vibrate) navigator.vibrate(6);
}

function shareMyLocation() {
  if (!window.Messages || !window.Messages.canWrite()) {
    if (typeof showToast === 'function') showToast('🔒 訪客無法分享位置', '⚠️');
    return;
  }
  if (!navigator.geolocation) {
    if (typeof showToast === 'function') showToast('此裝置不支援定位', '⚠️');
    return;
  }

  const btn = document.querySelector('[data-template="location"]');
  const originalHTML = btn ? btn.innerHTML : '';
  if (btn) { btn.innerHTML = '📡 取得位置中...'; btn.disabled = true; btn.style.opacity = '0.6'; }
  if (navigator.vibrate) navigator.vibrate(10);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      if (btn) { btn.innerHTML = originalHTML; btn.disabled = false; btn.style.opacity = ''; }
      const location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null
      };
      await window.Messages.send('📍 我在這裡', {
        type: 'location', location, pinned: true, duration: 30 * 60 * 1000
      });
      if (typeof closeMessagesModal === 'function') setTimeout(() => closeMessagesModal(), 300);
    },
    (err) => {
      if (btn) { btn.innerHTML = originalHTML; btn.disabled = false; btn.style.opacity = ''; }
      let msg = '定位失敗';
      if (err.code === 1) msg = '請允許使用位置權限';
      else if (err.code === 2) msg = '無法取得位置（訊號弱）';
      else if (err.code === 3) msg = '定位逾時，請再試';
      if (typeof showToast === 'function') showToast('📍 ' + msg, '⚠️');
      if (navigator.vibrate) navigator.vibrate(50);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}
window.shareMyLocation = shareMyLocation;

function sendMessageFromModal() {
  const input = document.getElementById("messages-input");
  const pinOpt = document.getElementById("msg-opt-pin");
  const expireOpt = document.getElementById("msg-opt-expire");
  if (!input || !window.Messages) return;
  const text = input.value.trim();
  if (!text) return;

  const opts = { pinned: pinOpt ? pinOpt.checked : false, duration: null };
  if (expireOpt && expireOpt.checked) {
    const mins = parseInt(expireOpt.dataset.minutes || '30');
    opts.duration = mins * 60 * 1000;
  }
  window.Messages.send(text, opts);

  input.value = '';
  if (pinOpt) pinOpt.checked = false;
  if (expireOpt) { expireOpt.checked = false; expireOpt.dataset.minutes = '30'; }
  const expireLabel = document.getElementById("msg-opt-expire-label");
  if (expireLabel) expireLabel.textContent = '⏱️ 30 分鐘後自動隱藏';

  const btn = document.getElementById("messages-send-btn");
  if (btn) { btn.disabled = true; btn.classList.add('opacity-50'); }
  input.focus();
}

function closeMessagesModal() {
  const m = document.getElementById("messages-modal");
  if (m) {
    m.classList.remove('active');
    setTimeout(() => { m.style.display = 'none'; }, 250);
    if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('modal-open');
  }
}

function renderMessagesModal() {
  const listEl = document.getElementById("messages-list");
  if (!listEl || !window.Messages) return;

  let summaryHTML = '';
  try {
    const summary = window.Messages.getTodaySummary();
    if (summary.items.length > 0) {
      const itemRows = summary.items.map(m => {
        const dot = m.pinned ? '🔴' : '⚪';
        const cd = m.expiresAt ? ` · 還有 ${formatMsgCountdown(m.expiresAt - Date.now())}` : '';
        return `<div class="today-summary-item">
          <span class="today-summary-dot">${dot}</span>
          <div class="today-summary-body">
            <div class="today-summary-text"><strong>${escapeHtml(m.author)}</strong>：${escapeHtml(m.text)}</div>
            <div class="today-summary-meta">${formatMsgTimeAgo(m.createdAt)}${cd}</div>
          </div>
        </div>`;
      }).join('');

      summaryHTML = `
        <div class="today-summary">
          <div class="today-summary-header">
            <span>📌 重要提醒</span>
            <span class="today-summary-count">${summary.items.length}</span>
          </div>
          ${itemRows}
        </div>
      `;
    }
  } catch (e) {
    console.warn('[Messages] 摘要失敗', e);
  }

  listEl.innerHTML = summaryHTML + window.Messages.renderFull();
}

function formatMsgTimeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return '剛剛';
  if (d < 3600000) return Math.floor(d/60000) + ' 分鐘前';
  if (d < 86400000) return Math.floor(d/3600000) + ' 小時前';
  return Math.floor(d/86400000) + ' 天前';
}
function formatMsgCountdown(ms) {
  if (ms <= 0) return '已到時間';
  const s = Math.floor(ms/1000);
  const h = Math.floor(s/3600);
  const m = Math.floor((s%3600)/60);
  if (h > 0) return h + '時' + String(m).padStart(2,'0') + '分';
  if (m > 0) return m + '分' + String(s%60).padStart(2,'0') + '秒';
  return s + '秒';
}

window._Messages_jumpToDay = function (day) {
  if (!day || day < 1 || day > 7) return;
  closeMessagesModal();
  setTimeout(() => {
    if (typeof window.switchDay === 'function') {
      window.switchDay(day);
      setTimeout(() => {
        const section = document.getElementById('day-section-' + day);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, 250);
  if (navigator.vibrate) navigator.vibrate(10);
};

window.openNavigateMenu = openNavigateMenu;
window.closeNavigateMenu = closeNavigateMenu;
window.openMessagesModal = openMessagesModal;
window.closeMessagesModal = closeMessagesModal;

/* ============================================================
 * 留言訂閱（局部刷新廣播區塊）
 * ============================================================ */
if (window.Messages) {
  window.Messages.subscribe(() => {
    if (window.AppHeader && window.AppHeader.getPhase && window.AppHeader.getPhase() === 'during') {
      if (window.AppHeader.refreshBroadcast) {
        window.AppHeader.refreshBroadcast();
      }
      const msgBtn = document.querySelector('[data-action="messages"]');
      if (msgBtn) {
        const count = window.Messages.getCount();
        const base = `<span>💬</span> 留言`;
        msgBtn.innerHTML = count > 0 ? `${base}<span class="broadcast-badge">${count}</span>` : base;
      }
    }
    const modal = document.getElementById("messages-modal");
    if (modal && modal.classList.contains('active')) renderMessagesModal();
  });
}

/* ============================================================
 * ☁️ 下拉同步資料（頁面頂部下拉觸發）
 * ============================================================ */
(function setupPullToSync() {
  const THRESHOLD = 75;
  const MAX_PULL  = 120;
  const DAMPING   = 0.55;

  let startY = 0;
  let pullDistance = 0;
  let pulling = false;
  let triggered = false;

  const indicator = document.createElement('div');
  indicator.id = 'pull-sync-indicator';
  indicator.innerHTML = `
    <div class="pull-sync-inner">
      <span class="pull-sync-icon">⬇️</span>
      <span class="pull-sync-text">下拉同步資料</span>
    </div>
  `;
  document.body.appendChild(indicator);

  const iconEl = indicator.querySelector('.pull-sync-icon');
  const textEl = indicator.querySelector('.pull-sync-text');

  const isModalOpen = () => !!document.querySelector('.modal-overlay.active');
  const getScrollY = () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

  function updateIndicator() {
    indicator.classList.add('active');
    indicator.style.transform = `translateX(-50%) translateY(${pullDistance}px)`;
    indicator.style.opacity = String(Math.min(1, pullDistance / 40));
    if (pullDistance >= THRESHOLD) {
      iconEl.textContent = '☁️';
      textEl.textContent = '放開即可同步';
    } else {
      iconEl.textContent = '⬇️';
      textEl.textContent = '下拉同步資料';
    }
  }

  function resetIndicator() {
    indicator.style.transition = 'transform 0.25s ease, opacity 0.2s ease';
    indicator.style.transform = 'translateX(-50%) translateY(0)';
    indicator.style.opacity = '0';
    setTimeout(() => {
      indicator.classList.remove('active');
      iconEl.classList.remove('spinning');
      iconEl.textContent = '⬇️';
      textEl.textContent = '下拉同步資料';
      indicator.style.transition = '';
    }, 250);
    pullDistance = 0;
    triggered = false;
  }

  async function triggerSync() {
    console.log('[pull-sync] 觸發同步');
    indicator.style.transition = 'transform 0.2s ease';
    indicator.style.transform = `translateX(-50%) translateY(${THRESHOLD}px)`;
    indicator.style.opacity = '1';
    iconEl.textContent = '⏳';
    iconEl.classList.add('spinning');
    textEl.textContent = '正在同步…';

    try {
      if (typeof window._AppHeader_syncAll === 'function') {
        await window._AppHeader_syncAll();
      } else {
        console.warn('[pull-sync] _AppHeader_syncAll 不存在，改用 fallback');
        if (typeof window.fetchWeatherData === 'function') {
          await window.fetchWeatherData().catch(e => console.warn(e));
        }
        if (typeof window.fetchLiveRates === 'function') {
          await window.fetchLiveRates().catch(e => console.warn(e));
        }
      }
      iconEl.classList.remove('spinning');
      iconEl.textContent = '✅';
      textEl.textContent = '同步完成';

      if (typeof showToast === 'function') showToast('✅ 已同步最新資料', '☁️');
    } catch (e) {
      console.warn('[pull-sync] failed', e);
      iconEl.classList.remove('spinning');
      iconEl.textContent = '⚠️';
      textEl.textContent = '部分同步失敗';
      if (typeof showToast === 'function') showToast('⚠️ ' + (e.message || '同步失敗'), '⚠️');
    }

    setTimeout(resetIndicator, 900);
  }

  window.addEventListener('touchstart', (e) => {
    if (isModalOpen()) return;
    if (getScrollY() > 5) return;
    if (e.touches.length !== 1) return;
    startY = e.touches[0].clientY;
    pulling = true;
    pullDistance = 0;
    triggered = false;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    if (isModalOpen()) { pulling = false; resetIndicator(); return; }
    if (getScrollY() > 5) { pulling = false; resetIndicator(); return; }

    const diff = e.touches[0].clientY - startY;
    if (diff <= 0) {
      pullDistance = 0;
      if (!triggered) resetIndicator();
      return;
    }
    pullDistance = Math.min(MAX_PULL, diff * DAMPING);
    if (pullDistance > 5) {
      indicator.style.transition = '';
      updateIndicator();
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (!pulling) return;
    pulling = false;
    if (pullDistance >= THRESHOLD) {
      triggered = true;
      triggerSync();
    } else {
      resetIndicator();
    }
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    if (!pulling) return;
    pulling = false;
    resetIndicator();
  }, { passive: true });

  console.log('[pull-sync] 已註冊下拉同步手勢');
})();