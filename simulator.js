/* ============================================================
 * simulator.js — 旅行模擬控制器 v1.1
 *
 * v1.1 變更：
 *   - 面板預設收起，只顯示狀態藥丸
 *   - 點外部自動關閉面板
 *   - 藥丸文字顯示當前狀態（D1~D7 或「模擬」）
 * ============================================================ */
(function () {
  const TRIP_START = new Date('2027-01-21T00:00:00+08:00').getTime();
  const TRIP_END = new Date('2027-01-27T23:59:59+08:00').getTime();
  const TRIP_DAYS = 7;

  function isTripActive() {
    const now = Date.now();
    return now >= TRIP_START && now <= TRIP_END;
  }

  function getCurrentTest() {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        test: params.get('test'),
        day: parseInt(params.get('day')) || null
      };
    } catch (e) {
      return { test: null, day: null };
    }
  }

  function buildUrl(test, day) {
    const url = new URL(window.location.href);
    if (test) url.searchParams.set('test', test);
    else url.searchParams.delete('test');
    if (day) url.searchParams.set('day', day);
    else url.searchParams.delete('day');
    return url.pathname + url.search + url.hash;
  }

  function updateToggleText() {
    const toggle = document.querySelector('.simulator-toggle');
    if (!toggle) return;
    const cur = getCurrentTest();
    if (cur.test === 'during' && cur.day) {
      toggle.innerHTML = `🧪 D${cur.day}`;
      toggle.classList.add('active');
    } else if (cur.test) {
      toggle.innerHTML = `🧪 ${cur.test}`;
      toggle.classList.add('active');
    } else {
      toggle.innerHTML = `🧪 模擬`;
      toggle.classList.remove('active');
    }
  }

  function init() {
    if (isTripActive()) return;

    const widget = document.getElementById('simulator-widget');
    if (!widget) return;
    widget.classList.remove('hidden');

    const daysEl = document.getElementById('simulator-days');
    if (daysEl) {
      const current = getCurrentTest();
      let html = '';
      for (let i = 1; i <= TRIP_DAYS; i++) {
        const active = current.test === 'during' && current.day === i;
        html += `<button class="sim-day ${active ? 'active' : ''}" onclick="Simulator.go(${i})">D${i}</button>`;
      }
      daysEl.innerHTML = html;
    }

    updateToggleText();
    // ⭐ v1.1：不自動展開面板
  }

  function togglePanel() {
    const panel = document.getElementById('simulator-panel');
    if (!panel) return;
    panel.classList.toggle('active');
  }

  function closePanel() {
    const panel = document.getElementById('simulator-panel');
    if (panel) panel.classList.remove('active');
  }

  function go(day) {
    window.location.href = buildUrl('during', day);
  }

  function close() {
    window.location.href = buildUrl(null, null);
  }

  // 點面板外部自動關閉
  document.addEventListener('click', (e) => {
    const widget = document.getElementById('simulator-widget');
    if (!widget || widget.classList.contains('hidden')) return;
    if (widget.contains(e.target)) return;
    closePanel();
  });

  window.Simulator = { go, close, togglePanel, closePanel };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();