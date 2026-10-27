/* ============================================================
 * simulator.js — 旅行模擬控制器 v1.2 (8天7夜版)
 * ============================================================ */
(function () {
  const TRIP_START = new Date('2027-01-21T00:00:00+08:00').getTime();
  // ⭐ 修改：TRIP_END 改為 1/28
  const TRIP_END = new Date('2027-01-28T23:59:59+08:00').getTime();
  // ⭐ 修改：TRIP_DAYS 改為 8
  const TRIP_DAYS = 8;

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