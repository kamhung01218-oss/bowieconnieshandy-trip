/* ============================================================
 * AppHeader v6.8
 * - 品牌列：❄️ 標題 + [🔍 搜尋] + [⛅ 天氣] + [⚙️ 工具]
 * - Focus Card：出發前/中/後
 * - 工具選單：功能入口 + 安裝 App
 *
 * v6.8 變更：
 *   - 我的清單：裝備/購物即使 0 項也顯示（方便進入新增）
 * ============================================================ */

window.AppHeader = (function () {
  let _config = null;
  let _container = null;
  let _tickTimer = null;
  let _syncConnected = true;
  let _lastRenderedPhase = null;
  let _nextEventStartMs = null;
  let _lastDuringRender = 0;
  let _docClickHandler = null;
  let _escKeyHandler = null;

  function getTripPhase() {
    const now = Date.now();
    if (now < _config.tripStart) return "before";
    if (now > _config.tripEnd) return "after";
    return "during";
  }
  function getCurrentDayIndex() {
    const now = Date.now();
    for (let i = 0; i < _config.tripDates.length; i++) {
      const dayStart = new Date(_config.tripDates[i] + "T00:00:00+08:00").getTime();
      const dayEnd = new Date(_config.tripDates[i] + "T23:59:59+08:00").getTime();
      if (now >= dayStart && now <= dayEnd) return i;
    }
    return -1;
  }
  function getNextEvent(dayData) {
    if (!dayData) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const evt of dayData.events) {
      const start = evt.time.split(" - ")[0].trim();
      const [h, m] = start.split(":").map(Number);
      if (!isNaN(h) && h * 60 + m > currentMinutes) return evt;
    }
    return dayData.events[dayData.events.length - 1];
  }
  function getNextBigTask() {
    const now = Date.now();
    const cb = _config.callbacks || {};

    const ticketTasks = [
      { time: _config.ginzanTarget, label: "銀山 Fast Pass 搶票", emoji: "🎟️" },
      { time: _config.zaoTarget, label: "藏王纜車優先票", emoji: "🚠" }
    ].filter(t => {
      if (t.time <= now) return false;
      const daysLeft = (t.time - now) / 86400000;
      return daysLeft <= 14;
    }).sort((a, b) => a.time - b.time);

    if (ticketTasks.length > 0) {
      const t = ticketTasks[0];
      const daysLeft = Math.ceil((t.time - now) / 86400000);
      return {
        emoji: t.emoji,
        label: t.label,
        hint: `${daysLeft} 天後開賣，記得設鬧鐘`,
        type: "ticket"
      };
    }

    if (cb.getNextPendingBooking) {
      try {
        const booking = cb.getNextPendingBooking();
        if (booking) {
          return {
            emoji: booking.icon,
            label: booking.label,
            hint: `還有 ${booking.remaining} 項未完成 · 點擊查看`,
            type: "booking"
          };
        }
      } catch (e) { console.warn("[AppHeader] getNextPendingBooking error:", e); }
    }

    if (now < _config.tripStart) {
      const daysLeft = Math.ceil((_config.tripStart - now) / 86400000);
      return {
        emoji: "✈️",
        label: "出發前往仙台",
        hint: `還有 ${daysLeft} 天 · 所有預訂已完成！`,
        type: "trip"
      };
    }

    return null;
  }
  function getPrepProgress() {
    const now = Date.now();
    const PREP_START = _config.tripStart - 180 * 86400000;
    if (now <= PREP_START) return 0;
    if (now >= _config.tripStart) return 100;
    return Math.min(100, Math.max(0, ((now - PREP_START) / (_config.tripStart - PREP_START)) * 100));
  }
  function getWeatherAdvice(temp, rain) {
    if (temp < -10) return "🥶 極寒！小孩勿久留戶外";
    if (temp < -5) return "❄️ 羽絨 + 雪靴 + 毛帽";
    if (temp < 0) return "🧣 圍巾手套不可少";
    if (rain >= 70) return "🌨️ 降雪中，路面濕滑";
    return "🧥 防風外套即可";
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
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
    } catch (e) { console.warn("[AppHeader] progress callback error:", e); }
    return { done: 0, total: 0 };
  }

  function renderProgressList(items) {
    const valid = items.filter(it => {
      const p = getProgressData(it.type);
      return p.total > 0;
    });
    if (valid.length === 0) return "";
    const rows = valid.map(it => {
      const p = getProgressData(it.type);
      const percent = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
      const done = p.done === p.total && p.total > 0;
      return `
        <button type="button" class="progress-item ${done ? 'done' : ''}" data-action="${it.action}">
          <span class="progress-icon">${it.icon}</span>
          <span class="progress-label">${escapeHtml(it.label)}</span>
          <span class="progress-bar-mini">
            <span class="progress-bar-mini-fill" style="width:${percent}%"></span>
          </span>
          <span class="progress-count">${p.done}/${p.total}</span>
          <span class="progress-arrow">›</span>
        </button>
      `;
    }).join("");
    return `<div class="progress-list">${rows}</div>`;
  }

  function isGuestUser() {
    try { return localStorage.getItem("tohoku_current_user") === "訪客"; } catch(e) { return false; }
  }
  function getCurrentUser() {
    try { return localStorage.getItem("tohoku_current_user") || ""; } catch(e) { return ""; }
  }

  function getTicketCountdown() {
    const now = Date.now();
    const ginzan = _config.ginzanTarget - now;
    const zao = _config.zaoTarget - now;
    const candidates = [];
    if (ginzan > 0) candidates.push(ginzan);
    if (zao > 0) candidates.push(zao);
    if (candidates.length === 0) return null;
    const nearest = Math.min(...candidates);
    const days = Math.floor(nearest / 86400000);
    if (days > 0) return `${days}天`;
    const hours = Math.floor(nearest / 3600000);
    if (hours > 0) return `${hours}時`;
    const mins = Math.max(1, Math.floor(nearest / 60000));
    return `${mins}分`;
  }

  function updateCountdownNumbers() {
    if (!_container) return;
    const focusEl = _container.querySelector("#app-header-focus");
    if (!focusEl) return;
    const diff = _config.tripStart - Date.now();
    if (diff <= 0) return;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    updateCell(focusEl, "days", String(days));
    updateCell(focusEl, "hours", String(hours).padStart(2, "0"));
    updateCell(focusEl, "minutes", String(minutes).padStart(2, "0"));
    updateCell(focusEl, "seconds", String(seconds).padStart(2, "0"));

    const inlineEl = focusEl.querySelector("#focus-countdown-inline");
    if (inlineEl) {
      const dayEl = inlineEl.querySelector('[data-inline="days"]');
      const hourEl = inlineEl.querySelector('[data-inline="hours"]');
      const minEl = inlineEl.querySelector('[data-inline="minutes"]');
      if (dayEl && dayEl.textContent !== String(days)) dayEl.textContent = String(days);
      if (hourEl && hourEl.textContent !== String(hours).padStart(2, "0")) hourEl.textContent = String(hours).padStart(2, "0");
      if (minEl && minEl.textContent !== String(minutes).padStart(2, "0")) minEl.textContent = String(minutes).padStart(2, "0");
    }

    if (seconds % 30 === 0) {
      const fill = focusEl.querySelector(".focus-progress-fill");
      if (fill) fill.style.width = getPrepProgress() + "%";
      const label = focusEl.querySelector(".focus-progress-label");
      if (label) label.textContent = `準備進度 ${Math.round(getPrepProgress())}%`;
    }
  }

  function updateCell(focusEl, name, newText) {
    const el = focusEl.querySelector(`.countdown-value[data-cell="${name}"]`);
    if (!el) return;
    if (el.textContent === newText) return;
    el.textContent = newText;
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
  }

  function updateNextEventCountdown() {
    if (!_container) return;
    const el = _container.querySelector("#focus-next-countdown");
    if (!el || !_nextEventStartMs) return;
    const remain = _nextEventStartMs - Date.now();
    if (remain > 0) {
      const totalSec = Math.floor(remain / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      el.textContent = h > 0
        ? `⏱ ${h}時${String(m).padStart(2, "0")}分後`
        : `⏱ ${m}分${String(s).padStart(2, "0")}秒後`;
    } else {
      el.textContent = "🎬 即將開始";
    }
  }

  function stripHtml(html) {
    if (!html) return "";
    return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function searchItinerary(keyword) {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return [];
    const results = [];
    const itineraries = _config.itineraries || [];

    itineraries.forEach(day => {
      const dayTitle = (day.title || "").toLowerCase();
      const daySubtitle = (day.subtitle || "").toLowerCase();
      if (dayTitle.includes(kw) || daySubtitle.includes(kw)) {
        results.push({
          day: day.day,
          eventIndex: -1,
          title: day.title,
          location: "",
          time: day.dateLabel,
          match: "行程標題",
          emoji: day.emoji || "📅"
        });
      }

      (day.events || []).forEach((evt, idx) => {
        const fields = [
          evt.title || "",
          evt.location || "",
          evt.tag?.text || "",
          stripHtml(evt.content || "")
        ];
        const hit = fields.some(f => f.toLowerCase().includes(kw));
        if (hit) {
          results.push({
            day: day.day,
            eventIndex: idx,
            title: evt.title,
            location: evt.location || "",
            time: evt.time,
            match: (evt.tag?.text || ""),
            emoji: "📍"
          });
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
    if (resultsEl) resultsEl.innerHTML = renderSearchEmpty();

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
    const anyOpen = document.querySelector('.modal-overlay.active');
    if (!anyOpen) document.body.classList.remove('modal-open');
    haptic(6);
  }

  function renderSearchEmpty() {
    return `
      <div class="search-empty">
        <div style="font-size:36px;margin-bottom:8px">🔍</div>
        <div style="font-size:13px;font-weight:700;color:#64748b">輸入關鍵字開始搜尋</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px">例如：狐狸村、牛舌、藏王、拉麵</div>
      </div>`;
  }

  function renderSearchNoResult(kw) {
    return `
      <div class="search-empty">
        <div style="font-size:36px;margin-bottom:8px">😕</div>
        <div style="font-size:13px;font-weight:700;color:#64748b">找不到「${escapeHtml(kw)}」</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px">試試其他關鍵字</div>
      </div>`;
  }

  function renderSearchResults(results, kw) {
    if (results.length === 0) return renderSearchNoResult(kw);

    const grouped = {};
    results.forEach(r => {
      if (!grouped[r.day]) grouped[r.day] = [];
      grouped[r.day].push(r);
    });
    const dayNums = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    let html = `<div style="font-size:11px;color:#64748b;font-weight:700;padding:6px 4px 8px">
      找到 <span style="color:#0284c7;font-weight:900">${results.length}</span> 個結果
    </div>`;

    dayNums.forEach(day => {
      const items = grouped[day];
      html += `<div class="search-day-group">`;
      html += `<div class="search-day-label">Day ${day}</div>`;
      items.forEach(item => {
        const highlight = (text) => {
          if (!text) return "";
          const escaped = escapeHtml(text);
          const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          return escaped.replace(regex, '<mark>$1</mark>');
        };
        html += `<button type="button" class="search-result-item"
          data-day="${item.day}" data-event-index="${item.eventIndex}">
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
    if (!kw.trim()) {
      resultsEl.innerHTML = renderSearchEmpty();
      return;
    }
    const results = searchItinerary(kw);
    resultsEl.innerHTML = renderSearchResults(results, kw);

    resultsEl.querySelectorAll('.search-result-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day);
        const eventIndex = parseInt(btn.dataset.eventIndex);
        closeSearchModal();
        setTimeout(() => jumpToSearchResult(day, eventIndex), 300);
      });
    });
  }

  function jumpToSearchResult(day, eventIndex) {
    if (typeof window.switchDay === "function") {
      window.switchDay(day);
    } else if (_config.callbacks.onScrollToDay) {
      _config.callbacks.onScrollToDay(day);
    }

    setTimeout(() => {
      if (eventIndex < 0) {
        const section = document.getElementById('day-section-' + day);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const section = document.getElementById('day-section-' + day);
      if (!section) return;
      const cards = section.querySelectorAll('details.event-card');
      const target = cards[eventIndex];
      if (!target) return;

      target.open = true;

      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
        target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.55), 0 12px 32px -8px rgba(14, 165, 233, 0.5)';
        target.style.borderColor = 'rgba(14, 165, 233, 0.8)';
        setTimeout(() => {
          target.style.boxShadow = '';
          target.style.borderColor = '';
        }, 2000);
      }, 200);
    }, 350);

    haptic(12);
  }

  function renderFocusCard() {
    if (!_container) return;
    const focusEl = _container.querySelector("#app-header-focus");
    if (!focusEl) return;
    const phase = getTripPhase();
    const cb = _config.callbacks || {};

    if (_lastRenderedPhase !== phase) {
      _lastRenderedPhase = phase;
      let innerHTML = "";

      if (phase === "before") {
        const now = Date.now();
        const diff = _config.tripStart - now;
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        const progress = getPrepProgress();
        const task = getNextBigTask();
        const progressRows = renderProgressList([
          { type: "booking", icon: "📌", label: "行前預訂", action: "booking" },
          { type: "equip",   icon: "🎒", label: "我的裝備", action: "equip"   }
        ]);

        innerHTML = `
          <div class="focus-inner">
            <div class="focus-label">距離出發還有</div>

            <div class="countdown-inline" id="focus-countdown-inline">
              <span class="countdown-inline-num" data-inline="days">${days}</span>
              <span class="countdown-inline-unit">天</span>
              <span class="countdown-inline-num-sm" data-inline="hours">${String(hours).padStart(2, "0")}</span>
              <span class="countdown-inline-unit-sm">時</span>
              <span class="countdown-inline-num-sm" data-inline="minutes">${String(minutes).padStart(2, "0")}</span>
              <span class="countdown-inline-unit-sm">分</span>
            </div>

            <div class="countdown-grid">
              <div class="countdown-cell"><div class="countdown-value" data-cell="days">${days}</div><div class="countdown-unit">天</div></div>
              <div class="countdown-cell"><div class="countdown-value" data-cell="hours">${String(hours).padStart(2, "0")}</div><div class="countdown-unit">時</div></div>
              <div class="countdown-cell"><div class="countdown-value" data-cell="minutes">${String(minutes).padStart(2, "0")}</div><div class="countdown-unit">分</div></div>
              <div class="countdown-cell" data-cell-block="seconds"><div class="countdown-value" data-cell="seconds">${String(seconds).padStart(2, "0")}</div><div class="countdown-unit">秒</div></div>
            </div>

            <div class="focus-progress-row">
              <div class="focus-progress-track"><div class="focus-progress-fill" style="width:${progress}%"></div></div>
              <div class="focus-progress-label">準備進度 ${Math.round(progress)}%</div>
            </div>

            ${progressRows}

            ${task ? `
              <div class="focus-task" data-action="${task.type === 'booking' ? 'booking' : task.type === 'ticket' ? 'ticket' : 'overview'}" style="cursor:pointer">
                <span class="focus-task-icon">${task.emoji}</span>
                <div style="flex:1;min-width:0">
                  <div class="focus-task-text">下一個任務：${escapeHtml(task.label)}</div>
                  <div style="font-size:11px;color:rgba(146,64,14,0.75);margin-top:2px">${escapeHtml(task.hint)}</div>
                </div>
                <span style="color:#92400e;font-size:16px;font-weight:900;flex-shrink:0">›</span>
              </div>
            ` : ""}

            <div class="focus-cta-row" style="flex-wrap:wrap">
              <button type="button" class="focus-cta focus-cta-primary" data-action="overview" style="flex:1 1 100%">
                <span>📋</span> 行程速覽
              </button>
              <button type="button" class="focus-cta focus-cta-secondary" data-action="shopping" style="flex:1">
                <span>🛍️</span> 購物
              </button>
              <button type="button" class="focus-cta focus-cta-secondary" data-action="ticket" style="flex:1">
                <span>⚔️</span> 搶票
              </button>
            </div>
          </div>
        `;
      } else if (phase === "during") {
        const dayIdx = getCurrentDayIndex();
        const dayData = dayIdx >= 0 ? _config.itineraries[dayIdx] : _config.itineraries[0];
        const weatherMap = _config.weatherCache ? _config.weatherCache() : {};
        const weather = weatherMap[_config.tripDates[dayIdx >= 0 ? dayIdx : 0]];
        const nextEvt = getNextEvent(dayData);
        const totalEvents = dayData.events.length;
        const doneEvents = nextEvt ? dayData.events.indexOf(nextEvt) : totalEvents;
        const progress = totalEvents > 0 ? Math.round((doneEvents / totalEvents) * 100) : 0;
        const temp = weather ? Math.round((weather.max + weather.min) / 2) : null;
        const advice = weather ? getWeatherAdvice(temp, weather.rain) : "載入中...";
        _nextEventStartMs = null;
        if (nextEvt) {
          const startStr = nextEvt.time.split(" - ")[0].trim();
          const [hh, mm] = startStr.split(":").map(Number);
          if (!isNaN(hh) && !isNaN(mm)) {
            const baseDate = new Date(_config.tripDates[dayIdx >= 0 ? dayIdx : 0]);
            baseDate.setHours(hh, mm, 0, 0);
            _nextEventStartMs = baseDate.getTime();
          }
        }
        const progressRows = renderProgressList([
          { type: "shopping", icon: "🛍️", label: "我的購物", action: "shopping" }
        ]);

        innerHTML = `
          <div class="focus-inner">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
              <div style="flex:1;min-width:0">
                <div class="focus-label" style="margin-bottom:4px">${escapeHtml(dayData.dateLabel)}</div>
                <div class="focus-title">${escapeHtml(dayData.title)}</div>
                ${dayData.subtitle ? `<div class="focus-subtitle">${escapeHtml(dayData.subtitle)}</div>` : ""}
              </div>
              <div style="font-size:30px;flex-shrink:0">${dayData.emoji}</div>
            </div>
            <div class="focus-weather-grid">
              <div class="focus-weather-cell">
                <div class="label">⛅ 天氣</div>
                <div class="value">${weather ? `${weather.icon} ${weather.min}°~${weather.max}°` : "--"}</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px;line-height:1.3">${advice}</div>
              </div>
              <div class="focus-weather-cell">
                <div class="label">⏰ 下個行程</div>
                <div class="value" style="font-size:13px;line-height:1.3">${nextEvt ? nextEvt.time.split(" - ")[0] : "--"}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${nextEvt ? escapeHtml(nextEvt.title) : "--"}</div>
                <div id="focus-next-countdown" style="font-size:11px;color:#0284c7;margin-top:3px;font-weight:800">--</div>
              </div>
            </div>
            <div class="focus-progress-track" style="margin-top:10px"><div class="focus-progress-fill" style="width:${progress}%"></div></div>
            <div class="focus-progress-label">今日進度 ${progress}% · 已完成 ${doneEvents} / ${totalEvents} 個行程</div>
            ${progressRows}
            <div class="focus-cta-row">
              <button type="button" class="focus-cta focus-cta-primary" data-action="overview"><span>📋</span> 行程速覽</button>
              ${nextEvt && nextEvt.navUrl
                ? `<a href="${escapeHtml(nextEvt.navUrl)}" target="_blank" class="focus-cta focus-cta-secondary"><span>📍</span> 導航</a>`
                : `<button type="button" class="focus-cta focus-cta-secondary" data-action="weather"><span>⛅</span> 天氣</button>`}
            </div>
          </div>
        `;
      } else {
        let totalExpenses = 0;
        if (cb.getExpenseCount) { try { totalExpenses = cb.getExpenseCount() || 0; } catch (e) {} }
        const shoppingP = getProgressData("shopping");
        innerHTML = `
          <div class="focus-inner">
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
          </div>
        `;
      }

      focusEl.innerHTML = innerHTML;
      bindFocusActions(focusEl, cb);
      if (phase === "during") { updateNextEventCountdown(); _lastDuringRender = Date.now(); }
    }
  }

  function bindFocusActions(focusEl, cb) {
    focusEl.querySelectorAll("[data-action]").forEach(el => {
      el.addEventListener("click", () => {
        const action = el.dataset.action;
        switch (action) {
          case "booking":      cb.onBooking && cb.onBooking();     break;
          case "equip":        cb.onEquip && cb.onEquip();         break;
          case "shopping":     cb.onShopping && cb.onShopping();   break;
          case "ticket":       cb.onTicket && cb.onTicket();       break;
          case "weather":      cb.onWeather && cb.onWeather();     break;
          case "overview":     cb.onOverview && cb.onOverview();   break;
          case "switchLedger": cb.onSwitchTab && cb.onSwitchTab("ledger"); break;
          case "scrollToDay": {
            const idx = getCurrentDayIndex();
            const day = idx >= 0 ? idx + 1 : 1;
            cb.onScrollToDay && cb.onScrollToDay(day);
            break;
          }
        }
      });
    });
  }

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

    // ⭐ v6.8：即使 0 項也顯示「我的裝備」「我的購物」（讓使用者知道有入口）
    const progressItems = [];
    const bookingP = getProgressData("booking");
    if (bookingP.total > 0) {
      progressItems.push({ icon: "📌", label: "行前預訂", done: bookingP.done, total: bookingP.total, action: "booking" });
    }
    if (!guest) {
      const equipP = getProgressData("equip");
      progressItems.push({ icon: "🎒", label: "我的裝備", done: equipP.done, total: equipP.total, action: "equip" });
      const shoppingP = getProgressData("shopping");
      progressItems.push({ icon: "🛍️", label: "我的購物", done: shoppingP.done, total: shoppingP.total, action: "shopping" });
    }

    const progressHTML = progressItems.map(it => {
      const done = it.done === it.total && it.total > 0;
      // ⭐ 若 total === 0，顯示「＋ 加入」
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

    panel.innerHTML = `
      ${progressItems.length > 0 ? `
        <div class="tools-section">
          <div class="tools-section-label"><span>📊</span> 我的清單</div>
          ${progressHTML}
        </div>
      ` : ""}

      <div class="tools-section">
        <div class="tools-section-label"><span>⚡</span> 快速操作</div>
        <button type="button" class="tools-item" data-tool-action="search">
          <span class="tools-item-icon">🔍</span>
          <span class="tools-item-label">搜尋行程</span>
          <span class="tools-item-arrow">›</span>
        </button>
        <button type="button" class="tools-item" data-tool-action="overview">
          <span class="tools-item-icon">📋</span>
          <span class="tools-item-label">行程速覽</span>
          <span class="tools-item-arrow">›</span>
        </button>
        <button type="button" class="tools-item" data-tool-action="ledger">
          <span class="tools-item-icon">📝</span>
          <span class="tools-item-label">快速記帳</span>
          <span class="tools-item-arrow">›</span>
        </button>
      </div>

      ${showInstall ? `
        <div class="tools-section">
          <div class="tools-section-label"><span>📲</span> 應用程式</div>
          <button type="button" class="tools-item" data-tool-action="install">
            <span class="tools-item-icon">📲</span>
            <span class="tools-item-label">安裝 App 到桌面</span>
            <span class="tools-item-tag new">推薦</span>
            <span class="tools-item-arrow">›</span>
          </button>
        </div>
      ` : ""}

      <div class="tools-section">
        <div class="tools-section-label"><span>🎨</span> 顯示與安全</div>
        <button type="button" class="tools-item" data-tool-action="theme">
          <span class="tools-item-icon" id="theme-menu-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
          <span class="tools-item-label" id="theme-menu-label">${currentTheme === 'dark' ? '淺色模式' : '深色模式'}</span>
          <span class="tools-item-arrow">›</span>
        </button>
        <button type="button" class="tools-item" data-tool-action="emergency">
          <span class="tools-item-icon">🆘</span>
          <span class="tools-item-label">緊急資訊</span>
          <span class="tools-item-arrow">›</span>
        </button>
      </div>

      <div class="tools-section">
        <div class="tools-section-label"><span>📚</span> 攻略參考</div>
        ${phase !== "after" ? `
          <button type="button" class="tools-item" data-tool-action="ticket">
            <span class="tools-item-icon">⚔️</span>
            <span class="tools-item-label">搶票攻略</span>
            ${ticketCd ? `<span class="tools-item-tag hot">⏰ ${ticketCd}</span>` : ""}
            <span class="tools-item-arrow">›</span>
          </button>
        ` : ""}
        <button type="button" class="tools-item" data-tool-action="drive">
          <span class="tools-item-icon">⚠️</span>
          <span class="tools-item-label">雪地攻略</span>
          <span class="tools-item-arrow">›</span>
        </button>
        <button type="button" class="tools-item" data-tool-action="shoot">
          <span class="tools-item-icon">📷</span>
          <span class="tools-item-label">拍攝技巧</span>
          <span class="tools-item-arrow">›</span>
        </button>
      </div>

      <div class="tools-section">
        <div class="tools-section-label"><span>⚙️</span> 帳戶</div>
        <button type="button" class="tools-item" data-tool-action="ledger">
          <span class="tools-item-icon">💰</span>
          <span class="tools-item-label">隨行記帳本</span>
          <span class="tools-item-arrow">›</span>
        </button>
        ${currentUser ? `
          <button type="button" class="tools-item" data-tool-action="account">
            <span class="tools-item-icon">${guest ? "👤" : "🙋"}</span>
            <span class="tools-item-label">${escapeHtml(currentUser)} · 帳戶設定</span>
            <span class="tools-item-arrow">›</span>
          </button>
        ` : ""}
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
            booking: cb.onBooking,
            equip: cb.onEquip,
            shopping: cb.onShopping,
            ticket: cb.onTicket,
            drive: cb.onDrive,
            shoot: cb.onShoot,
            weather: cb.onWeather,
            overview: () => { cb.onOverview && cb.onOverview(); },
            ledger: () => cb.onSwitchTab && cb.onSwitchTab("ledger"),
            account: () => { if (typeof window.switchUser === "function") window.switchUser(); },
            theme: () => { if (typeof window.toggleAppTheme === "function") window.toggleAppTheme(); },
            emergency: () => { if (typeof window.openEmergencyModal === "function") window.openEmergencyModal(); }
          };
          if (map[action]) map[action]();
        }, 180);
      });
    });
  }

  window.openSearchModal = openSearchModal;
  window.closeSearchModal = closeSearchModal;

  return {
    init(config) {
      _config = config;
      _container = document.getElementById(config.containerId);
      if (!_container) { console.warn("[AppHeader] container not found:", config.containerId); return; }
      _lastRenderedPhase = null;
      _nextEventStartMs = null;
      _lastDuringRender = 0;

      _container.innerHTML = `
        <div class="brand-bar">
          <div class="brand-title-wrap">
            <span style="font-size:16px;flex-shrink:0">❄️</span>
            <span class="brand-title">東北冬季親子自駕 2027</span>
          </div>
          <div class="brand-actions">
            <button type="button" id="app-header-search" class="tools-toggle" title="搜尋行程">
              <span class="tools-toggle-icon">🔍</span>
              <span class="tools-toggle-text">搜尋</span>
            </button>
            <button type="button" id="app-header-weather" class="tools-toggle" title="天氣預報">
              <span class="tools-toggle-icon">⛅</span>
              <span class="tools-toggle-text">天氣</span>
            </button>
            <button type="button" id="tools-toggle" class="tools-toggle" title="工具選單">
              <span class="tools-toggle-icon icon-gear">⚙️</span>
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

      const searchBtn = _container.querySelector("#app-header-search");
      if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openSearchModal();
        });
      }

      const weatherBtn = _container.querySelector("#app-header-weather");
      if (weatherBtn) {
        weatherBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const cb = _config.callbacks || {};
          if (cb.onWeather) cb.onWeather();
          haptic(10);
        });
      }

      const toggleBtn = _container.querySelector("#tools-toggle");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleToolsMenu();
        });
      }

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
        if (e.key === "Escape") {
          closeToolsMenu();
          closeSearchModal();
        }
      };
      document.addEventListener("keydown", _escKeyHandler);

      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          handleSearchInput(e.target.value);
        });
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const firstResult = document.querySelector('.search-result-item');
            if (firstResult) firstResult.click();
          }
        });
      }

      const searchClose = document.getElementById('search-close');
      if (searchClose) {
        searchClose.addEventListener('click', () => closeSearchModal());
      }

      const searchBackdrop = document.getElementById('search-modal');
      if (searchBackdrop) {
        searchBackdrop.addEventListener('click', (e) => {
          if (e.target === searchBackdrop) closeSearchModal();
        });
      }

      renderFocusCard();

      if (_tickTimer) clearInterval(_tickTimer);
      _tickTimer = setInterval(() => {
        const phase = getTripPhase();
        if (phase !== _lastRenderedPhase) { renderFocusCard(); return; }
        if (phase === "before") updateCountdownNumbers();
        if (phase === "during") {
          updateNextEventCountdown();
          const now = Date.now();
          if (now - _lastDuringRender >= 60000) {
            _lastDuringRender = now;
            renderFocusCard();
          }
        }
      }, 1000);
    },

    render() { _lastRenderedPhase = null; renderFocusCard(); },
    getPhase() { return getTripPhase(); },

    setSyncState(connected) {
      _syncConnected = !!connected;
      const panel = _container?.querySelector("#tools-menu-panel");
      if (!panel || !panel.classList.contains("active")) return;
      renderToolsMenu();
    },

    destroy() {
      if (_tickTimer) { clearInterval(_tickTimer); _tickTimer = null; }
      if (_docClickHandler) { document.removeEventListener("click", _docClickHandler); _docClickHandler = null; }
      if (_escKeyHandler) { document.removeEventListener("keydown", _escKeyHandler); _escKeyHandler = null; }
      if (_container) _container.innerHTML = "";
      _config = null; _container = null;
      _lastRenderedPhase = null; _nextEventStartMs = null; _lastDuringRender = 0;
    }
  };
})();