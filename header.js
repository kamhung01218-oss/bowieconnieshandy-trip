/* ============================================================
 * AppHeader 獨立元件 v2.4
 * Chip 列加入「購物清單」按鈕 + 漸層遮罩（方案 C）
 *
 * 使用方式：
 *   AppHeader.init({
 *     containerId: 'app-header',
 *     tripStart:   1234567890000,
 *     tripEnd:     1234567890000,
 *     tripDates:   ['2027-01-21', ...],
 *     ginzanTarget: 1234567890000,
 *     zaoTarget:    1234567890000,
 *     itineraries: winterItineraries,
 *     weatherCache: () => window.weatherCache,
 *     callbacks: {
 *       onBooking, onEquip, onShopping, onDrive, onShoot, onTicket,
 *       onWeather, onOverview, onScrollToDay, onSwitchTab,
 *       getExpenseCount
 *     }
 *   });
 *
 * 公開方法：
 *   AppHeader.render()           // 手動重繪焦點卡片
 *   AppHeader.getPhase()         // 取得目前階段 (before/during/after)
 *   AppHeader.setSyncState(bool) // 設定雲端同步狀態
 *   AppHeader.destroy()          // 銷毀元件
 * ============================================================ */

window.AppHeader = (function () {
  // ---------- 私有狀態 ----------
  let _config = null;
  let _container = null;
  let _tickTimer = null;
  let _syncConnected = true;
  let _lastRenderedPhase = null;

  // ---------- 私有工具 ----------
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
    const tasks = [
      { time: _config.ginzanTarget, label: "銀山 Fast Pass 搶票", emoji: "🎟️", hint: "Asoview! 開賣" },
      { time: _config.zaoTarget, label: "藏王纜車優先票", emoji: "🚠", hint: "鎖定 08:30 時段" },
      { time: _config.tripStart, label: "出發前往仙台", emoji: "✈️", hint: "記得帶護照" }
    ].filter(t => t.time > now).sort((a, b) => a.time - b.time);
    return tasks[0] || null;
  }

  // 準備進度：從「提前 180 天」開始計算到出發日
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

  // ---------- 倒計時數字更新 ----------
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

    // 每 30 秒更新一次進度條
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

  // ---------- 焦點卡片渲染 ----------
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

        innerHTML = `
          <div class="focus-inner">
            <div class="focus-label">距離出發還有</div>

            <div class="countdown-grid">
              <div class="countdown-cell">
                <div class="countdown-value" data-cell="days">${days}</div>
                <div class="countdown-unit">天</div>
              </div>
              <div class="countdown-cell">
                <div class="countdown-value" data-cell="hours">${String(hours).padStart(2, "0")}</div>
                <div class="countdown-unit">時</div>
              </div>
              <div class="countdown-cell">
                <div class="countdown-value" data-cell="minutes">${String(minutes).padStart(2, "0")}</div>
                <div class="countdown-unit">分</div>
              </div>
              <div class="countdown-cell" data-cell-block="seconds">
                <div class="countdown-value" data-cell="seconds">${String(seconds).padStart(2, "0")}</div>
                <div class="countdown-unit">秒</div>
              </div>
            </div>

            <div class="focus-progress-row">
              <div class="focus-progress-track">
                <div class="focus-progress-fill" style="width:${progress}%"></div>
              </div>
              <div class="focus-progress-label">準備進度 ${Math.round(progress)}%</div>
            </div>

            ${task ? `
              <div class="focus-task">
                <span class="focus-task-icon">${task.emoji}</span>
                <div style="flex:1;min-width:0">
                  <div class="focus-task-text">下一個任務：${escapeHtml(task.label)}</div>
                  <div style="font-size:10px;color:rgba(253,230,138,0.7);margin-top:2px">${escapeHtml(task.hint)}</div>
                </div>
              </div>
            ` : ""}

            <div style="display:flex;gap:8px;margin-top:12px">
              <button type="button" class="focus-cta focus-cta-primary" data-action="booking">
                <span>📌</span> 查看行前準備
              </button>
              <button type="button" class="focus-cta focus-cta-secondary" data-action="ticket">
                <span>⚔️</span> 搶票攻略
              </button>
            </div>
          </div>
        `;
      } else if (phase === "during") {
        const dayIdx = getCurrentDayIndex();
        const dayData = dayIdx >= 0
          ? _config.itineraries[dayIdx]
          : _config.itineraries[0];
        const weatherMap = _config.weatherCache ? _config.weatherCache() : {};
        const weather = weatherMap[_config.tripDates[dayIdx >= 0 ? dayIdx : 0]];
        const nextEvt = getNextEvent(dayData);
        const totalEvents = dayData.events.length;
        const doneEvents = nextEvt ? dayData.events.indexOf(nextEvt) : totalEvents;
        const progress = Math.round((doneEvents / totalEvents) * 100);

        const temp = weather ? Math.round((weather.max + weather.min) / 2) : null;
        const advice = weather ? getWeatherAdvice(temp, weather.rain) : "載入中...";

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
                <div style="font-size:9px;color:rgba(186,230,253,0.8);margin-top:2px;line-height:1.3">${advice}</div>
              </div>
              <div class="focus-weather-cell">
                <div class="label">⏰ 下個行程</div>
                <div class="value" style="font-size:12px;line-height:1.3">${nextEvt ? nextEvt.time.split(" - ")[0] : "--"}</div>
                <div style="font-size:9px;color:#cbd5e1;margin-top:2px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${nextEvt ? escapeHtml(nextEvt.title) : "--"}</div>
              </div>
            </div>

            <div class="focus-progress-track" style="margin-top:10px">
              <div class="focus-progress-fill" style="width:${progress}%"></div>
            </div>
            <div class="focus-progress-label">今日進度 ${progress}% · 已完成 ${doneEvents} / ${totalEvents} 個行程</div>

            <div style="display:flex;gap:8px;margin-top:12px">
              <button type="button" class="focus-cta focus-cta-primary" data-action="scrollToDay">
                <span>📋</span> 查看今日行程
              </button>
              ${nextEvt && nextEvt.navUrl ? `
                <a href="${escapeHtml(nextEvt.navUrl)}" target="_blank" class="focus-cta focus-cta-secondary">
                  <span>📍</span> 導航
                </a>
              ` : `
                <button type="button" class="focus-cta focus-cta-secondary" data-action="weather">
                  <span>⛅</span> 天氣
                </button>
              `}
            </div>
          </div>
        `;
      } else {
        let totalExpenses = 0;
        if (cb.getExpenseCount) {
          try { totalExpenses = cb.getExpenseCount() || 0; } catch (e) {}
        }
        innerHTML = `
          <div class="focus-inner">
            <div class="focus-label">旅程圓滿結束</div>
            <div class="focus-title">🎉 感謝這趟美好的雪國之旅</div>
            <div class="focus-subtitle">7 天 · 4 大 2 小 · 無數美好回憶</div>

            <div class="focus-stats">
              <div class="focus-stat"><div class="num">7</div><div class="lbl">旅行天數</div></div>
              <div class="focus-stat"><div class="num">${totalExpenses}</div><div class="lbl">記帳筆數</div></div>
              <div class="focus-stat"><div class="num">23</div><div class="lbl">造訪景點</div></div>
            </div>

            <div style="display:flex;gap:8px;margin-top:12px">
              <button type="button" class="focus-cta focus-cta-primary" data-action="overview">
                <span>📖</span> 回顧旅程
              </button>
              <button type="button" class="focus-cta focus-cta-secondary" data-action="switchLedger">
                <span>💰</span> 查看記帳
              </button>
            </div>
          </div>
        `;
      }

      focusEl.innerHTML = innerHTML;
      bindFocusActions(focusEl, cb);
    }
  }

  // ---------- 事件綁定 ----------
  function bindFocusActions(focusEl, cb) {
    focusEl.querySelectorAll("[data-action]").forEach(el => {
      el.addEventListener("click", () => {
        const action = el.dataset.action;
        switch (action) {
          case "booking":     cb.onBooking && cb.onBooking();     break;
          case "ticket":      cb.onTicket && cb.onTicket();       break;
          case "weather":     cb.onWeather && cb.onWeather();     break;
          case "overview":    cb.onOverview && cb.onOverview();   break;
          case "switchLedger":cb.onSwitchTab && cb.onSwitchTab("ledger"); break;
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

  function bindChipActions() {
    if (!_container) return;
    const cb = _config.callbacks || {};
    _container.querySelectorAll("[data-chip-action]").forEach(el => {
      el.addEventListener("click", () => {
        const action = el.dataset.chipAction;
        const map = {
          booking:  cb.onBooking,
          equip:    cb.onEquip,
          shopping: cb.onShopping,   // ✅ 新增：購物清單
          drive:    cb.onDrive,
          shoot:    cb.onShoot
        };
        if (map[action]) map[action]();
      });
    });
  }

  function bindBrandActions() {
    if (!_container) return;
    const cb = _config.callbacks || {};

    const syncBtn = _container.querySelector("#app-header-sync");
    if (syncBtn) {
      syncBtn.addEventListener("click", () => {
        const phase = getTripPhase();
        const phaseLabel = { before: "行程前", during: "行程中", after: "行程後" }[phase];
        if (typeof window.showToast === "function") {
          window.showToast(`🔄 雲端已連線 · ${phaseLabel}`, "☁️");
        }
      });
    }

    const weatherBtn = _container.querySelector("#app-header-weather");
    if (weatherBtn) {
      weatherBtn.addEventListener("click", () => {
        if (cb.onWeather) cb.onWeather();
      });
    }

    const overviewBtn = _container.querySelector("#app-header-overview");
    if (overviewBtn) {
      overviewBtn.addEventListener("click", () => {
        if (cb.onOverview) cb.onOverview();
      });
    }
  }

  // ---------- 公開 API ----------
  return {
    init(config) {
      _config = config;
      _container = document.getElementById(config.containerId);
      if (!_container) {
        console.warn("[AppHeader] container not found:", config.containerId);
        return;
      }
      _lastRenderedPhase = null;

      _container.innerHTML = `
        <div class="brand-bar">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1">
            <span style="font-size:16px;flex-shrink:0">❄️</span>
            <span class="brand-title">東北冬季親子自駕 2027</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            <button type="button" id="app-header-weather" class="brand-icon-btn" title="天氣">⛅</button>
            <button type="button" id="app-header-overview" class="brand-icon-btn" title="行程速覽">📋</button>
            <button type="button" id="app-header-sync" class="sync-badge">
              <span class="sync-dot"></span>
              <span id="app-header-sync-text">已同步</span>
            </button>
          </div>
        </div>

        <div class="focus-card">
          <div id="app-header-focus" class="focus-inner">
            <div class="focus-loading"><div class="focus-spinner"></div></div>
          </div>
        </div>

        <div class="chip-bar-scroll-wrap">
          <div class="chip-bar">
            <button type="button" class="chip" data-chip-action="booking"><span>📌</span> 行前預訂</button>
            <button type="button" class="chip" data-chip-action="equip"><span>🎒</span> 裝備</button>
            <button type="button" class="chip" data-chip-action="shopping"><span>🛍️</span> 購物清單</button>
            <button type="button" class="chip" data-chip-action="drive"><span>⚠️</span> 雪地攻略</button>
            <button type="button" class="chip" data-chip-action="shoot"><span>📷</span> 拍攝</button>
          </div>
        </div>
      `;

      bindBrandActions();
      bindChipActions();
      renderFocusCard();

      if (_tickTimer) clearInterval(_tickTimer);
      _tickTimer = setInterval(() => {
        const phase = getTripPhase();
        if (phase === "before") {
          updateCountdownNumbers();
        }
      }, 1000);
    },

    render() {
      _lastRenderedPhase = null;
      renderFocusCard();
    },

    getPhase() {
      return getTripPhase();
    },

    setSyncState(connected) {
      _syncConnected = !!connected;
      if (!_container) return;
      const badge = _container.querySelector("#app-header-sync");
      const text = _container.querySelector("#app-header-sync-text");
      if (!badge) return;
      if (_syncConnected) {
        badge.classList.remove("disconnected");
        if (text) text.textContent = "已同步";
      } else {
        badge.classList.add("disconnected");
        if (text) text.textContent = "連線中斷";
      }
    },

    destroy() {
      if (_tickTimer) { clearInterval(_tickTimer); _tickTimer = null; }
      if (_container) _container.innerHTML = "";
      _config = null;
      _container = null;
      _lastRenderedPhase = null;
    }
  };
})();