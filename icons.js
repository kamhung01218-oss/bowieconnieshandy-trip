/* ============================================================
 * icons.js — 全域 SVG 圖示庫 v1.0
 *
 * 用法：
 *   1. HTML 內：<span data-icon="pin" data-icon-size="22"></span>
 *   2. JS 內：window.ICON('pin', 20)   // 回傳 SVG 字串
 *
 * 所有圖示使用 currentColor，自動跟隨文字顏色
 * ============================================================ */

(function () {
  'use strict';

  function S(paths, opts) {
    opts = opts || {};
    const fill = opts.fill || 'none';
    const stroke = opts.stroke || 'currentColor';
    const w = opts.w || 2;
    return `<svg viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  window.ICONS = {
    // ============ 主要功能圖示 ============
    pin: S('<path d="M12 21s-7-6-7-12a7 7 0 1 1 14 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
    backpack: S('<path d="M6 8a6 6 0 0 1 12 0v12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9 13h6"/>'),
    alert: S('<path d="M12 3 2 21h20L12 3z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/>'),
    ticket: S('<path d="M3 9a2 2 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 1 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><line x1="13" y1="5" x2="13" y2="19"/>'),
    chart: S('<path d="M3 3v18h18"/><path d="M7 15l3-4 3 3 5-7"/>'),
    list: S('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>'),
    video: S('<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>'),
    camera: S('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
    bag: S('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
    lock: S('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    emergency: S('<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'),
    attach: S('<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>'),
    note: S('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>'),
    map: S('<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>'),
    wallet: S('<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>'),
    target: S('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
    user: S('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    users: S('<circle cx="9" cy="8" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    settings: S('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),

    // ============ 通用 UI 圖示 ============
    check: S('<polyline points="20 6 9 17 4 12"/>'),
    x: S('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
    plus: S('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
    chevronDown: S('<polyline points="6 9 12 15 18 9"/>'),
    chevronRight: S('<polyline points="9 18 15 12 9 6"/>'),
    arrowUp: S('<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'),
    arrowRight: S('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
    search: S('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>'),
    refresh: S('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/>'),
    gear: S('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
    sun: S('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
    moon: S('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
    calendar: S('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
    clock: S('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    location: S('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    phone: S('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
    hotel: S('<path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"/><path d="M3 21h18"/><path d="M9 21v-6h6v6"/><circle cx="8" cy="11" r="0.6" fill="currentColor" stroke="none"/><circle cx="12" cy="11" r="0.6" fill="currentColor" stroke="none"/><circle cx="16" cy="11" r="0.6" fill="currentColor" stroke="none"/>'),
    car: S('<path d="M5 17h14M5 17v2M19 17v2M6 10l1.5-4.5A2 2 0 0 1 9.4 4h5.2a2 2 0 0 1 1.9 1.5L18 10M4 10h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="7.5" cy="14.5" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="14.5" r="1" fill="currentColor" stroke="none"/>'),
    plane: S('<path d="M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-1 1.7l5.2 3.9-3 3-2.4-.6a1 1 0 0 0-1 1.6l3 2.4 2.4 3a1 1 0 0 0 1.6-1l-.6-2.4 3-3 3.9 5.2a1 1 0 0 0 1.7-1z"/>'),
    food: S('<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="11" x2="7" y2="22"/><line x1="14" y1="2" x2="14" y2="22"/><path d="M20 6c0-2-2-4-2-4v9h4V6a2 2 0 0 0-2-2z"/>'),
    snow: S('<line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>'),
    coin: S('<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>'),
    broadcast: S('<path d="M3 11l19-9-9 19-2-8-8-2z"/>'),
    trash: S('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>'),
    edit: S('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
    image: S('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
    shopping: S('<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
    shoot: S('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
    navigate: S('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    bookmark: S('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'),
    info: S('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>'),
    thermometer: S('<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>'),
    wallet2: S('<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="18" cy="15" r="1" fill="currentColor" stroke="none"/>'),
    backup: S('<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  };

  /**
   * 取得圖示 SVG 字串
   * @param {string} key - 圖示名稱
   * @param {number} size - 尺寸（px），預設 16
   * @returns {string} SVG HTML
   */
  window.ICON = function (key, size) {
    const raw = window.ICONS[key];
    if (!raw) {
      console.warn('[ICON] 找不到圖示：', key);
      return '';
    }
    size = size || 16;
    return raw.replace('<svg ', `<svg width="${size}" height="${size}" `);
  };

  /**
   * 掃描 DOM 中所有 [data-icon]，自動注入 SVG
   * @param {HTMLElement|Document} root - 範圍，預設 document
   */
  window.injectIcons = function (root) {
    root = root || document;
    root.querySelectorAll('[data-icon]').forEach(el => {
      if (el.dataset.iconDone === '1') return;
      const key = el.dataset.icon;
      const raw = window.ICONS[key];
      if (!raw) return;
      const size = parseInt(el.dataset.iconSize, 10) || 20;
      el.innerHTML = raw.replace('<svg ', `<svg width="${size}" height="${size}" `);
      el.dataset.iconDone = '1';
      // 讓 SVG 對齊文字
      el.style.display = 'inline-flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.flexShrink = '0';
    });
  };

  // 初次載入時自動注入
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.injectIcons());
  } else {
    window.injectIcons();
  }

  console.log('[Icons] v1.0 已載入，' + Object.keys(window.ICONS).length + ' 個圖示');
})();