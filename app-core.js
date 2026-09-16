/* ============================================================
 * app-core.js — v7.2
 * 核心：工具函數、用戶認證、全局狀態、彈窗系統、匯率、Toast、
 *       燈箱、角色、Service Worker、可拖動 FAB、返回頂部、
 *       深色模式、緊急資訊
 * ============================================================ */

// ==================== escapeHtml ====================
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function escAttr(str) { return escapeHtml(str); }

// ==================== PIN 雜湊 ====================
const PIN_SALT = "tohoku2027_winter_";
async function hashPin(pin) {
  try {
    const data = new TextEncoder().encode(PIN_SALT + String(pin));
    const hashBuf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch(e) {
    let h = 0;
    const s = PIN_SALT + String(pin);
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return "fb_" + Math.abs(h).toString(16);
  }
}

async function verifyUserPinAsync(user, inputPin, forceFetch) {
  let pins = cloudUserPins;
  if (forceFetch || !pins || Object.keys(pins).length === 0) {
    try {
      if (window.dbRef) {
        const docSnap = await window.dbRef.get();
        if (docSnap.exists && docSnap.data().userPins) {
          pins = docSnap.data().userPins;
          cloudUserPins = pins;
        }
      }
    } catch(e) { console.warn("[verifyUserPinAsync]", e); }
  }
  if (pins && pins[user] && pins[user].hash) {
    const inputHash = await hashPin(inputPin);
    return inputHash === pins[user].hash;
  }
  return USER_PINS[user] === inputPin;
}

async function fetchUserPinsFromCloud() {
  try {
    if (!window.dbRef) return {};
    const docSnap = await window.dbRef.get();
    if (docSnap.exists && docSnap.data().userPins) {
      cloudUserPins = docSnap.data().userPins;
      return cloudUserPins;
    }
  } catch(e) { console.warn("[fetchUserPins]", e); }
  return {};
}

// ==================== 全域變數 ====================
let state = { currentMainTab: "itinerary", checkedItems: {} };
let currentUser = null;
let cloudUserData = {};
let cloudUserPins = {};
let exchangeRates = { JPY: 0.052, HKD: 1, TWD: 0.24, CNY: 1.1, USD: 7.8 };

const USER_PINS = { "余生": "1234", "bowie": "1234", "shandy": "1234", "connie": "1234" };
const USER_COLORS = {
  "余生": "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  "bowie": "linear-gradient(135deg,#f472b6,#db2777)",
  "shandy": "linear-gradient(135deg,#34d399,#059669)",
  "connie": "linear-gradient(135deg,#a78bfa,#7c3aed)",
  "訪客": "linear-gradient(135deg,#94a3b8,#475569)"
};

const tripDates = ["2027-01-21", "2027-01-22", "2027-01-23", "2027-01-24", "2027-01-25", "2027-01-26", "2027-01-27"];
const TRIP_START = new Date("2027-01-21T10:00:00+08:00").getTime();
const TRIP_END = new Date("2027-01-27T23:59:59+08:00").getTime();
const GINZAN_TARGET = new Date("2027-01-08T23:00:00+08:00").getTime();
const ZAO_TARGET = new Date("2027-01-15T23:00:00+08:00").getTime();
const ADMIN_PASSWORD = "tohoku2027admin";

let snowmanProgress = JSON.parse(localStorage.getItem("snowman_progress")) || 0;
if (!window.weatherCache) window.weatherCache = {};

window._renderedDays = new Set();

// ==================== 用戶登入 ====================
let selectedUser = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#user-grid .user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#user-grid .user-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedUser = btn.dataset.user;
      if (selectedUser === "訪客") {
        currentUser = "訪客";
        localStorage.setItem("tohoku_current_user", "訪客");
        document.getElementById('user-modal').style.display = 'none';
        showToast("👤 歡迎，訪客！", "👋");
        haptic(15);
        initAppAfterLogin();
        return;
      }
      document.getElementById('pin-area').classList.remove('hidden');
      setTimeout(() => document.getElementById('pin-input').focus(), 100);
      haptic(8);
    });
  });
  const savedUser = localStorage.getItem("tohoku_current_user");
  if (savedUser && (savedUser === "訪客" || USER_PINS[savedUser])) {
    currentUser = savedUser;
    document.getElementById('user-modal').style.display = 'none';
    initAppAfterLogin();
  }
});

async function verifyUserPin() {
  const input = document.getElementById('pin-input').value.trim();
  const inputField = document.getElementById('pin-input');
  const errorEl = document.getElementById('pin-error');
  const okBtn = document.querySelector('#pin-area button');
  if (!input) { haptic(50); return; }
  if (okBtn) { okBtn.disabled = true; okBtn.textContent = "驗證中..."; }
  try {
    const ok = await verifyUserPinAsync(selectedUser, input, true);
    if (ok) {
      currentUser = selectedUser;
      localStorage.setItem("tohoku_current_user", currentUser);
      document.getElementById('user-modal').style.display = 'none';
      errorEl.classList.add('hidden');
      showToast(`✅ 歡迎回來，${currentUser}！`, "👋");
      haptic(15);
      initAppAfterLogin();
    } else {
      errorEl.classList.remove('hidden');
      inputField.value = '';
      haptic(50);
      setTimeout(() => inputField.focus(), 50);
    }
  } catch(e) {
    errorEl.textContent = "⚠️ 驗證失敗，請稍後再試";
    errorEl.classList.remove('hidden');
  } finally {
    if (okBtn) { okBtn.disabled = false; okBtn.textContent = "確認"; }
  }
}

function cancelUserSelect() {
  selectedUser = null;
  document.getElementById('pin-area').classList.add('hidden');
  document.getElementById('pin-input').value = '';
  document.getElementById('pin-error').classList.add('hidden');
  document.querySelectorAll('#user-grid .user-btn').forEach(b => b.classList.remove('selected'));
  haptic(8);
}

function switchUser() { openAccountModal(); }
window.switchUser = switchUser;

function doLogoutAndSwitch() {
  closeAccountModal();
  setTimeout(() => {
    localStorage.removeItem("tohoku_current_user");
    currentUser = null;
    selectedUser = null;
    document.getElementById('user-modal').style.display = 'flex';
    cancelUserSelect();
    haptic(10);
  }, 150);
}

function openAccountModal() {
  if (!currentUser) return;
  const m = document.getElementById('account-modal');
  if (!m) return;
  const avatar = document.getElementById('account-avatar');
  const nameEl = document.getElementById('account-username');
  nameEl.textContent = currentUser;
  if (currentUser === "訪客") {
    avatar.textContent = "👤";
    avatar.style.background = "linear-gradient(135deg, #94a3b8, #475569)";
  } else {
    avatar.textContent = currentUser[0].toUpperCase();
    avatar.style.background = USER_COLORS[currentUser] || "linear-gradient(135deg,#64748b,#475569)";
  }
  m.classList.remove('hidden');
  haptic(8);
}
function closeAccountModal() {
  document.getElementById('account-modal').classList.add('hidden');
  haptic(6);
}

function openChangePinModal() {
  if (!currentUser || currentUser === "訪客") {
    showToast("👤 訪客無法設定 PIN 碼", "⚠️");
    return;
  }
  closeAccountModal();
  setTimeout(() => {
    document.getElementById('change-pin-username').textContent = currentUser;
    document.getElementById('pin-old').value = '';
    document.getElementById('pin-new').value = '';
    document.getElementById('pin-confirm').value = '';
    document.getElementById('change-pin-error').classList.add('hidden');
    const m = document.getElementById('change-pin-modal');
    m.classList.remove('hidden');
    setTimeout(() => document.getElementById('pin-old').focus(), 100);
  }, 150);
}
function closeChangePinModal() {
  document.getElementById('change-pin-modal').classList.add('hidden');
  haptic(6);
}

async function submitChangePin() {
  const oldPin = document.getElementById('pin-old').value.trim();
  const newPin = document.getElementById('pin-new').value.trim();
  const confirmPin = document.getElementById('pin-confirm').value.trim();
  const errEl = document.getElementById('change-pin-error');
  const submitBtn = document.getElementById('change-pin-submit-btn');

  const showErr = (msg) => {
    errEl.textContent = "⚠️ " + msg;
    errEl.classList.remove('hidden');
    haptic(50);
  };

  if (!oldPin) return showErr("請輸入目前 PIN 碼");
  if (!newPin) return showErr("請輸入新 PIN 碼");
  if (newPin.length < 4) return showErr("新 PIN 碼至少需 4 個字元");
  if (newPin !== confirmPin) return showErr("兩次輸入的新 PIN 碼不一致");
  if (newPin === oldPin) return showErr("新 PIN 碼不能與舊的相同");

  errEl.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = "驗證中...";
  submitBtn.classList.add("opacity-60", "cursor-not-allowed");

  try {
    if (!window.dbRef) throw new Error("雲端未連線");
    const docSnap = await window.dbRef.get();
    const cloudData = docSnap.exists ? docSnap.data() : {};
    const allPins = cloudData.userPins || {};

    let oldPinOk = false;
    if (allPins[currentUser] && allPins[currentUser].hash) {
      const oldHash = await hashPin(oldPin);
      oldPinOk = (oldHash === allPins[currentUser].hash);
    } else {
      oldPinOk = (USER_PINS[currentUser] === oldPin);
    }

    if (!oldPinOk) {
      showErr("目前 PIN 碼錯誤");
      submitBtn.disabled = false;
      submitBtn.textContent = "確認修改";
      submitBtn.classList.remove("opacity-60", "cursor-not-allowed");
      return;
    }

    submitBtn.textContent = "更新中...";
    const newHash = await hashPin(newPin);
    allPins[currentUser] = { hash: newHash, updatedAt: Date.now(), updatedBy: currentUser };
    await window.dbRef.set({ userPins: allPins, updatedAt: Date.now() }, { merge: true });
    cloudUserPins = allPins;

    showToast("✅ PIN 碼已更新，下次登入請用新密碼", "🔑");
    haptic(20);
    closeChangePinModal();
  } catch(e) {
    showToast("❌ 更新失敗：" + (e.message || "請稍後再試"), "⚠️");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "確認修改";
    submitBtn.classList.remove("opacity-60", "cursor-not-allowed");
  }
}

// ==================== 應用初始化 ====================
function initAppAfterLogin() {
  initAppTheme();
  updateUserBadge();
  loadCustomItems();
  const saved = localStorage.getItem("tohoku_checked_items");
  if (saved) { try { state.checkedItems = JSON.parse(saved); } catch(e) {} }
  fetchLiveRates();
  initSnowEffect();

  setupModalDrag(['booking-modal', 'equip-modal', 'drive-modal', 'ticket-modal', 'weather-modal', 'trip-overview-modal', 'shoot-tips-modal', 'vlog-plan-modal', 'common-tips-modal', 'shopping-modal', 'all-shopping-modal', 'currency-modal', 'emergency-modal']);

  // ⭐ 讀取上次選的 Day
  const savedDay = parseInt(localStorage.getItem('tohoku_last_day')) || 1;
  if (savedDay >= 1 && savedDay <= winterItineraries.length) {
    window._lastActiveDay = savedDay;
  } else {
    window._lastActiveDay = 1;
  }
  renderDayItinerary(`day-section-${window._lastActiveDay}`, winterItineraries[window._lastActiveDay - 1]);
  setupImageFadeIn();

  if (window.AppHeader) {
    AppHeader.init({
      containerId: "app-header",
      tripStart: TRIP_START, tripEnd: TRIP_END, tripDates: tripDates,
      ginzanTarget: GINZAN_TARGET, zaoTarget: ZAO_TARGET,
      itineraries: winterItineraries,
      weatherCache: () => window.weatherCache,
      callbacks: {
        onBooking: () => toggleBookingModal(),
        onEquip: () => toggleEquipModal(),
        onShopping: () => openAllShoppingModal(),
        onDrive: () => toggleDriveModal(),
        onShoot: () => openCommonTipsModal(),
        onTicket: () => toggleTicketModal(),
        onWeather: () => openWeatherModal(),
        onOverview: () => openTripOverview(),
        onCurrency: () => openCurrencyModal(),
        onSwitchTab: (tab) => switchMainTab(tab),
        onScrollToDay: (day) => { switchDay(day); setTimeout(() => { const el = document.getElementById("day-section-" + day); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 120); },
        getExpenseCount: () => { try { const s = localStorage.getItem("tohoku_expenses_2027"); return s ? JSON.parse(s).length : 0; } catch (e) { return 0; } },
        getBookingProgress: () => {
          const all = [...bookingList, ...customBookingItems];
          const done = all.filter(item => {
            const key = item.isCustom ? `custom-booking-${item.id}` : `booking-${item.id}`;
            return state.checkedItems[key] === true;
          }).length;
          return { done, total: all.length };
        },
        getEquipProgress: () => {
          if (!currentUser || currentUser === "訪客") return { done: 0, total: 0 };
          const userData = getUserData();
          const all = [...equipmentList, ...(userData.customEquip || [])];
          const done = all.filter(item => {
            const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`;
            return userData.equipChecked[key] === true;
          }).length;
          return { done, total: all.length };
        },
        getShoppingProgress: () => {
          if (!currentUser || currentUser === "訪客") return { done: 0, total: 0 };
          const userData = getUserData();
          let total = 0, done = 0;
          Object.values(userData.shopping || {}).forEach(items => {
            (items || []).forEach(item => { total++; if (item.planned) done++; });
          });
          return { done, total };
        }
      }
    });
  }
  checkWelcomeModal();
  fetchWeatherData();
  initRandomCharacters();
  renderBookingChecklist();
  renderEquipChecklist();
  renderAllShoppingContent();
  updateSnowmanVisual();
  if (window.updateDayProgressDots) window.updateDayProgressDots();
  startMainTick();
}

let _mainTickTimer = null;
let _mainTickCount = 0;
function startMainTick() {
  if (_mainTickTimer) return;
  _mainTickCount = 0;
  _mainTickTimer = setInterval(() => {
    if (document.hidden) return;
    _mainTickCount++;
    updateTodayButtonVisibility();
    if (_mainTickCount % 2 === 0) updateTimelineStatus();
  }, 60000);
}
function stopMainTick() {
  if (_mainTickTimer) { clearInterval(_mainTickTimer); _mainTickTimer = null; }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopMainTick();
  else if (currentUser) startMainTick();
});

function updateUserBadge() {
  setTimeout(() => {
    const badge = document.getElementById('user-badge');
    const avatarEl = document.getElementById('user-badge-avatar');
    const nameEl = document.getElementById('user-badge-name');
    if (!badge || !avatarEl || !nameEl || !currentUser) return;
    nameEl.textContent = currentUser;
    nameEl.style.color = "white";
    avatarEl.textContent = currentUser === "訪客" ? "👤" : currentUser[0].toUpperCase();
    avatarEl.style.background = USER_COLORS[currentUser] || "linear-gradient(135deg,#64748b,#475569)";
    badge.style.display = 'inline-flex';
    badge.style.alignItems = 'center';
  }, 150);
}
window.updateUserBadge = updateUserBadge;

function getUserData() {
  if (!currentUser || currentUser === "訪客") return { equipChecked: {}, customEquip: [], shopping: {} };
  if (!cloudUserData[currentUser]) cloudUserData[currentUser] = { equipChecked: {}, customEquip: [], shopping: {} };
  const u = cloudUserData[currentUser];
  if (!u.equipChecked) u.equipChecked = {};
  if (!u.customEquip) u.customEquip = [];
  if (!u.shopping) u.shopping = {};
  return u;
}

async function saveUserData() {
  if (!currentUser || currentUser === "訪客") return;
  if (typeof firebase === 'undefined' || !window.dbRef) { showToast("⏳ 雲端未連線", "⚠️"); return; }
  try {
    const docSnap = await window.dbRef.get();
    const cloudData = docSnap.exists ? docSnap.data() : {};
    const allUserData = cloudData.userData || {};
    allUserData[currentUser] = { ...getUserData(), updatedAt: Date.now() };
    await window.dbRef.set({ userData: allUserData, updatedAt: Date.now() }, { merge: true });
  } catch (e) { showToast("❌ 儲存失敗：" + e.message, "⚠️"); }
}

function haptic(ms = 10) { if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } }

function scrollToToday() {
  const now = Date.now();
  if (now < TRIP_START) { switchDay(1); showToast("📅 行程尚未開始，已跳到 D1", "✈️"); }
  else if (now > TRIP_END) { switchDay(7); showToast("📅 行程已結束，已跳到 D7", "🏁"); }
  else { for (let i = 0; i < tripDates.length; i++) { const dayStart = new Date(tripDates[i] + "T00:00:00+08:00").getTime(); const dayEnd = new Date(tripDates[i] + "T23:59:59+08:00").getTime(); if (now >= dayStart && now <= dayEnd) { switchDay(i + 1); showToast(`📅 已跳到 Day ${i + 1}`, "📍"); break; } } }
  haptic(12); setTimeout(() => { const tabs = document.querySelector('.day-tabs-wrapper'); if (tabs) tabs.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}
function updateTodayButtonVisibility() { const btn = document.getElementById('btn-today'); if (!btn) return; const now = Date.now(); if (now >= TRIP_START && now <= TRIP_END) btn.classList.remove('hidden'); else btn.classList.add('hidden'); }

function updateTimelineStatus() {
  const now = Date.now();
  const activeSection = document.querySelector('.day-section:not(.hidden)');
  if (!activeSection) return;
  const items = activeSection.querySelectorAll('.timeline-item[data-time]');
  let nextMarked = false;
  items.forEach(item => {
    const day = parseInt(item.dataset.day);
    const startTime = item.dataset.time || '';
    const endTime = item.dataset.endTime || '';
    if (!tripDates[day - 1]) return;
    const dateStr = tripDates[day - 1];
    const [sh, sm] = startTime.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm)) return;
    let eh = sh, em = sm;
    if (endTime && endTime.trim() && endTime.trim() !== '-') {
      const [h, m] = endTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) { eh = h; em = m; }
    } else { eh = sh + 2; if (eh >= 24) { eh = 23; em = 59; } }
    const startTs = new Date(`${dateStr}T${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')}:00+08:00`).getTime();
    const endTs = new Date(`${dateStr}T${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}:00+08:00`).getTime();
    let newStatus;
    if (now > endTs) { newStatus = 'status-done'; }
    else if (now >= startTs && now <= endTs) { newStatus = 'status-active'; nextMarked = true; }
    else { if (!nextMarked) { newStatus = 'status-next'; nextMarked = true; } else { newStatus = 'status-upcoming'; } }
    if (!item.classList.contains(newStatus)) {
      item.classList.remove('status-done', 'status-active', 'status-next', 'status-upcoming');
      item.classList.add(newStatus);
    }
  });
}

function setupModalDrag(modals) {
  modals.forEach(id => {
    const modal = document.getElementById(id); if (!modal) return;
    const box = modal.querySelector('.modal-box');
    const handleArea = modal.querySelector('[data-drag-handle]');
    if (!box || !handleArea) return;
    let startY = 0, currentY = 0, isDragging = false;
    const onMove = (e) => {
      if (!isDragging) return;
      currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const diff = currentY - startY;
      if (diff > 0) { box.style.transform = `translateY(${diff}px)`; modal.style.opacity = Math.max(0, 1 - diff / 400); }
    };
    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      const diff = currentY - startY;
      box.classList.remove('dragging'); box.classList.add('snapping');
      if (diff > 100) {
        box.style.transform = `translateY(100%)`; modal.style.opacity = '0';
        haptic(15);
        setTimeout(() => {
          const closers = {
            'booking-modal': window.closeBookingModal,
            'equip-modal': window.closeEquipModal,
            'drive-modal': window.closeDriveModal,
            'ticket-modal': window.closeTicketModal,
            'weather-modal': window.closeWeatherModal,
            'trip-overview-modal': window.closeTripOverview,
            'shoot-tips-modal': window.closeShootTipsModal,
            'vlog-plan-modal': window.closeVlogPlanModal,
            'common-tips-modal': window.closeCommonTipsModal,
            'shopping-modal': window.closeShoppingModal,
            'all-shopping-modal': window.closeAllShoppingModal,
            'currency-modal': window.closeCurrencyModal,
            'emergency-modal': window.closeEmergencyModal
          };
          if (closers[id]) closers[id]();
          box.style.transform = ''; modal.style.opacity = '';
        }, 280);
      } else {
        box.style.transform = ''; modal.style.opacity = '';
        setTimeout(() => box.classList.remove('snapping'), 300);
      }
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
    };
    const onStart = (e) => {
      isDragging = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      currentY = startY;
      box.classList.add('dragging'); box.classList.remove('snapping');
      haptic(5);
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
    };
    handleArea.addEventListener('touchstart', onStart, { passive: true });
    handleArea.addEventListener('touchmove', onMove, { passive: true });
    handleArea.addEventListener('touchend', onEnd);
    handleArea.addEventListener('touchcancel', onEnd);
    handleArea.addEventListener('mousedown', onStart);
  });
}

function switchMainTab(tab) {
  if (state.currentMainTab === tab) return; const isGoingToLedger = tab === 'ledger';
  const itineraryView = document.getElementById("main-itinerary-view"); const ledgerFrameContainer = document.getElementById("ledger-frame-container"); const header = document.getElementById("app-header"); const navItineraryBtn = document.getElementById("nav-itinerary-btn"); const navLedgerBtn = document.getElementById("nav-ledger-btn");
  state.currentMainTab = tab; haptic(10);
  if (tab === "itinerary") { navItineraryBtn.classList.add("active"); navLedgerBtn.classList.remove("active"); if (header) header.style.display = 'block'; }
  else { navLedgerBtn.classList.add("active"); navItineraryBtn.classList.remove("active"); if (header) header.style.display = 'none'; }
  const showView = isGoingToLedger ? ledgerFrameContainer : itineraryView; const hideView = isGoingToLedger ? itineraryView : ledgerFrameContainer;
  hideView.classList.remove('view-active'); hideView.classList.add(isGoingToLedger ? 'view-exit-left' : 'view-exit-right');
  showView.classList.remove('hidden-view'); showView.classList.add(isGoingToLedger ? 'view-enter-from-right' : 'view-enter-from-left');
  void showView.offsetWidth; requestAnimationFrame(() => { showView.classList.remove('view-enter-from-right', 'view-enter-from-left'); showView.classList.add('view-active'); });
  setTimeout(() => {
    hideView.classList.add('hidden-view'); hideView.classList.remove('view-exit-left', 'view-exit-right');
    if (isGoingToLedger) {
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      const iframe = document.getElementById("ledger-iframe");
      if (iframe) {
        iframe.style.height = "calc(100dvh - 60px)";
        try { iframe.contentWindow.postMessage({ type: 'setTheme', theme }, '*'); } catch(e) {}
      }
    }
  }, 400);
}

function setupImageFadeIn(container = document) { const imgs = container.querySelectorAll('img.lazy-fade:not(.loaded)'); imgs.forEach(img => { if (img.complete && img.naturalWidth > 0) img.classList.add('loaded'); else { img.addEventListener('load', () => img.classList.add('loaded'), { once: true }); img.addEventListener('error', () => { img.classList.add('loaded'); img.style.display = 'none'; }, { once: true }); } }); }

function isAdminUnlocked() { return localStorage.getItem("tohoku_admin_unlocked") === "true"; }
function showPasswordModal() { const m = document.getElementById("password-modal"); m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); document.getElementById("password-error").classList.add('hidden'); document.getElementById("password-input").value = ''; setTimeout(() => document.getElementById("password-input").focus(), 100); }
function closePasswordModal() { const m = document.getElementById("password-modal"); m.classList.remove('active'); setTimeout(() => m.style.display = 'none', 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); }
function verifyPassword() { const input = document.getElementById("password-input").value.trim(); if (input === ADMIN_PASSWORD) { localStorage.setItem("tohoku_admin_unlocked", "true"); closePasswordModal(); renderBookingChecklist(); renderEquipChecklist(); showToast("✅ 已解鎖管理權限"); haptic(15); } else { document.getElementById("password-error").classList.remove("hidden"); document.getElementById("password-input").value = ''; haptic(50); } }
function lockAdmin() { localStorage.removeItem("tohoku_admin_unlocked"); renderBookingChecklist(); renderEquipChecklist(); showToast("🔒 已鎖定管理權限"); }

// ==================== 匯率 ====================
async function fetchLiveRates() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/JPY');
    const data = await response.json();
    if (data && data.rates) {
      exchangeRates.JPY = 1;
      exchangeRates.HKD = 1 / data.rates.JPY * data.rates.HKD;
      exchangeRates.TWD = 1 / data.rates.JPY * data.rates.TWD;
      exchangeRates.USD = 1 / data.rates.JPY * data.rates.USD;
      exchangeRates.CNY = 1 / data.rates.JPY * data.rates.CNY;
      localStorage.setItem('tohoku_exchange_rates', JSON.stringify({ rates: exchangeRates, updatedAt: Date.now() }));
      updateRateHud();
    }
  } catch(e) {
    const cached = localStorage.getItem('tohoku_exchange_rates');
    if (cached) { try { const c = JSON.parse(cached); if (c.rates) exchangeRates = c.rates; } catch(e2) {} }
  }
}
function updateRateHud() {
  const t = document.getElementById("rate-hint-text");
  if (t) t.innerText = `1 JPY ≈ ${exchangeRates.HKD.toFixed(3)} HKD`;
}
function openCurrencyModal() {
  const m = document.getElementById('currency-modal');
  if (!m) return;
  m.style.display = 'flex';
  m.classList.add('active');
  document.body.classList.add('modal-open');
  updateRateHud();
  haptic(8);
}
function closeCurrencyModal() {
  const m = document.getElementById('currency-modal');
  if (!m) return;
  m.classList.remove('active');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  const a = document.querySelector('.modal-overlay.active');
  if (!a) document.body.classList.remove('modal-open');
}
function toggleCurrencyWidget() { openCurrencyModal(); }
window.openCurrencyModal = openCurrencyModal;
window.closeCurrencyModal = closeCurrencyModal;

function convertCurrency(type) {
  const hkdInput = document.getElementById("calc-hkd");
  const jpyInput = document.getElementById("calc-jpy");
  if (!hkdInput || !jpyInput) return;
  if (type === "clear") {
    jpyInput.value = "";
    hkdInput.value = "";
    return;
  }
  const rate = exchangeRates.HKD || 0.052;
  if (type === "jpy") {
    const jpy = parseFloat(jpyInput.value.replace(/,/g, ""));
    hkdInput.value = (isNaN(jpy) || jpy === 0) ? "" : (jpy * rate).toFixed(2);
  } else if (type === "hkd") {
    const hkd = parseFloat(hkdInput.value.replace(/,/g, ""));
    jpyInput.value = (isNaN(hkd) || hkd === 0) ? "" : Math.round(hkd / rate).toString();
  }
}
window.convertCurrency = convertCurrency;

function swapCurrency() {
  const hkdInput = document.getElementById("calc-hkd");
  const jpyInput = document.getElementById("calc-jpy");
  if (!hkdInput || !jpyInput) return;
  const hkdValue = parseFloat(hkdInput.value);
  if (!isNaN(hkdValue) && hkdValue !== 0) {
    jpyInput.value = Math.round(hkdValue / (exchangeRates.HKD || 0.052)).toString();
    convertCurrency("jpy");
  } else {
    jpyInput.focus();
  }
  haptic(8);
}
window.swapCurrency = swapCurrency;

function quickConvert(currency, amount) {
  const input = document.getElementById("calc-" + currency);
  if (!input) return;
  input.value = amount.toString();
  convertCurrency(currency);
  haptic(6);
}
window.quickConvert = quickConvert;

// ==================== Toast ====================
function showToast(message, icon = "✅") { const toast = document.getElementById("toast"); const m = document.getElementById("toast-message"); const i = document.getElementById("toast-icon"); if (toast && m && i) { const oldBtn = document.getElementById("toast-undo-btn"); if (oldBtn) oldBtn.remove(); window._undoCallback = null; m.innerText = message; i.innerText = icon; toast.classList.remove("-translate-y-24", "opacity-0"); toast.classList.add("translate-y-0", "opacity-100"); if (window.toastTimeout) clearTimeout(window.toastTimeout); window.toastTimeout = setTimeout(() => { toast.classList.remove("translate-y-0", "opacity-100"); toast.classList.add("-translate-y-24", "opacity-0"); }, 3000); } }
function showUndoToast(message, icon, onUndo) { const toast = document.getElementById("toast"); const m = document.getElementById("toast-message"); const i = document.getElementById("toast-icon"); if (!toast) return; const oldBtn = document.getElementById("toast-undo-btn"); if (oldBtn) oldBtn.remove(); m.innerText = message; i.innerText = icon; const btn = document.createElement("button"); btn.id = "toast-undo-btn"; btn.className = "ml-2 bg-white/20 hover:bg-white/30 active:scale-95 px-2.5 py-1 rounded-lg text-[11px] font-black transition shrink-0 pointer-events-auto"; btn.textContent = "撤銷"; btn.onclick = (e) => { e.stopPropagation(); if (window._undoCallback) { window._undoCallback(); window._undoCallback = null; } const t = document.getElementById("toast"); if (t) { t.classList.remove("translate-y-0", "opacity-100"); t.classList.add("-translate-y-24", "opacity-0"); } if (window.toastTimeout) clearTimeout(window.toastTimeout); haptic(15); }; toast.appendChild(btn); window._undoCallback = onUndo; toast.classList.remove("-translate-y-24", "opacity-0"); toast.classList.add("translate-y-0", "opacity-100"); if (window.toastTimeout) clearTimeout(window.toastTimeout); window.toastTimeout = setTimeout(() => { toast.classList.remove("translate-y-0", "opacity-100"); toast.classList.add("-translate-y-24", "opacity-0"); window._undoCallback = null; setTimeout(() => { const b = document.getElementById("toast-undo-btn"); if (b) b.remove(); }, 300); }, 5000); }
function copyText(text) { try { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); } catch(e) { navigator.clipboard.writeText(text).catch(() => {}); } }

// ==================== 燈箱 ====================
let lightboxImages = [], lightboxIndex = 0;
function openLightbox(images, index) { lightboxImages = images || []; lightboxIndex = index || 0; const lb = document.getElementById("lightbox"); const img = document.getElementById("lightbox-img"); if (lightboxImages.length === 0) return; img.src = lightboxImages[lightboxIndex]; document.getElementById("lightbox-caption").innerText = `${lightboxIndex + 1} / ${lightboxImages.length}`; lb.classList.add("active"); document.body.style.overflow = "hidden"; }
function closeLightbox() { document.getElementById("lightbox").classList.remove("active"); document.body.style.overflow = ""; }
function changeLightbox(d) { lightboxIndex += d; if (lightboxIndex < 0) lightboxIndex = lightboxImages.length - 1; if (lightboxIndex >= lightboxImages.length) lightboxIndex = 0; document.getElementById("lightbox-img").src = lightboxImages[lightboxIndex]; document.getElementById("lightbox-caption").innerText = `${lightboxIndex + 1} / ${lightboxImages.length}`; }
let touchStartX = 0;
const lightboxEl = document.getElementById("lightbox");
if (lightboxEl) { lightboxEl.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true }); lightboxEl.addEventListener("touchend", e => { const diff = touchStartX - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) changeLightbox(diff > 0 ? 1 : -1); }, { passive: true }); }
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.changeLightbox = changeLightbox;

// ==================== 歡迎 / 角色 ====================
function closeWelcomeModal(skipForever = false) { const m = document.getElementById("welcome-modal"); if (m) { m.style.opacity = "0"; setTimeout(() => { m.style.display = "none"; }, 300); } if (skipForever) localStorage.setItem("tohoku_welcome_dismissed", "true"); haptic(10); }
function checkWelcomeModal() { if (localStorage.getItem("tohoku_welcome_dismissed") === "true") { const m = document.getElementById("welcome-modal"); if (m) m.style.display = "none"; } }
let characterTimeout = null;
function spawnCharacters() {
  clearTimeout(characterTimeout);
  const s = document.getElementById('snowman'), f = document.getElementById('fox');
  if (!s || !f) return;
  if (document.hidden) { characterTimeout = setTimeout(spawnCharacters, 8000); return; }
  s.classList.remove('show', 'greet'); f.classList.remove('show', 'greet');
  s.classList.add('hide'); f.classList.add('hide');
  if (Math.random() < 0.5) { characterTimeout = setTimeout(spawnCharacters, Math.random() * 8000 + 8000); return; }
  const c = Math.random() < 0.5 ? s : f;
  c.classList.remove('hide'); c.classList.add('show');
  setTimeout(() => c.classList.add('greet'), 600);
  characterTimeout = setTimeout(() => { c.classList.remove('show', 'greet'); c.classList.add('hide'); setTimeout(spawnCharacters, Math.random() * 8000 + 6000); }, 3500);
}
function jump(id) { const c = document.getElementById(id); if (c) { c.classList.add('jumping'); setTimeout(() => c.classList.remove('jumping'), 600); haptic(10); if (id === 'snowman') { snowmanProgress = Math.min(snowmanProgress + 1, 5); localStorage.setItem("snowman_progress", JSON.stringify(snowmanProgress)); updateSnowmanVisual(); snowParticles(); showToast(`雪人成長度：${snowmanProgress}/5！`, "⛄"); } else showToast(`你點了一下狐狸！`, "🦊"); } }
function updateSnowmanVisual() { const s = document.getElementById("snowman"); if (!s) return; let color = "#ef4444"; if (snowmanProgress >= 1) color = "#f97316"; if (snowmanProgress >= 2) color = "#facc15"; if (snowmanProgress >= 3) color = "#4ade80"; if (snowmanProgress >= 4) color = "#38bdf8"; if (snowmanProgress >= 5) color = "#a78bfa"; const hp = s.querySelector('#hatGrad stop:first-child'); if (hp) hp.setAttribute('stop-color', color); }
function initRandomCharacters() { setTimeout(spawnCharacters, 2000); }
function snowParticles() { const p = document.createElement("div"); p.className = "particle"; const colors = ["#ffffff", "#e0f2fe", "#bae6fd", "#38bdf8", "#a78bfa"]; for (let i = 0; i < 30; i++) { const el = document.createElement("div"); el.style.width = `${Math.random() * 10 + 5}px`; el.style.height = el.style.width; el.style.background = colors[Math.floor(Math.random() * colors.length)]; el.style.left = `${Math.random() * 100}vw`; el.style.top = `${Math.random() * 20 - 10}vh`; el.style.opacity = Math.random(); el.style.animation = `snowfall ${Math.random() * 3 + 2}s linear forwards`; p.appendChild(el); } document.body.appendChild(p); setTimeout(() => p.remove(), 5000); }
window.jump = jump;

function initSnowEffect() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.getElementById("snow-fall");
  if (!c) return;
  c.innerHTML = "";
  const isMobile = window.innerWidth < 768;
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const count = isLowEnd ? 8 : (isMobile ? 14 : 22);
  const anims = ["snowfall", "snowfall-small"];
  const colors = ["#ffffff", "#f0f9ff"];
  for (let i = 0; i < count; i++) {
    const f = document.createElement("div");
    f.className = "snowflake";
    const size = Math.random() * 6 + 3;
    f.style.cssText = `left:${Math.random()*100}%;width:${size}px;height:${size}px;background:${colors[i%2]};animation:${anims[i%2]} ${Math.random()*10+10}s linear infinite;animation-delay:${Math.random()*-12}s;`;
    c.appendChild(f);
  }
  if (!window._snowVisibilityBound) {
    window._snowVisibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      const sf = document.getElementById('snow-fall');
      if (!sf) return;
      const state = document.hidden ? 'paused' : 'running';
      sf.querySelectorAll('.snowflake').forEach(el => { el.style.animationPlayState = state; });
    });
  }
}

// ==================== 彈窗顯示/隱藏 ====================
function showModal(id) { const overlay = document.getElementById(id); if (overlay) { overlay.classList.add('active'); overlay.style.display = 'flex'; document.body.style.overflow = 'hidden'; document.body.classList.add('modal-open'); haptic(8); } }
function hideModal(id) { const overlay = document.getElementById(id); if (overlay) { overlay.classList.remove('active'); setTimeout(() => { overlay.style.display = 'none'; }, 300); const anyOpen = document.querySelector('.modal-overlay.active'); if (!anyOpen) { document.body.style.overflow = ''; document.body.classList.remove('modal-open'); } } }
window.showModal = showModal;
window.hideModal = hideModal;

// ==================== Service Worker ====================
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').then(reg => { reg.update(); reg.addEventListener('updatefound', () => { const newWorker = reg.installing; if (!newWorker) return; newWorker.addEventListener('statechange', () => { if (newWorker.state === 'installed' && navigator.serviceWorker.controller) { showUpdateAvailable(newWorker); } }); }); setInterval(() => reg.update().catch(() => {}), 60 * 1000); }).catch(err => console.log('SW failed:', err)); }); let refreshing = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; window.location.reload(); }); }
function showUpdateAvailable(worker) { const toast = document.getElementById("toast"); const m = document.getElementById("toast-message"); const i = document.getElementById("toast-icon"); if (!toast || !m || !i) return; const oldUpdateBtn = document.getElementById("update-btn"); if (oldUpdateBtn) oldUpdateBtn.remove(); i.innerText = "✨"; m.innerText = "有新版本可用"; const btn = document.createElement("button"); btn.id = "update-btn"; btn.className = "ml-2 bg-white/20 hover:bg-white/30 active:scale-95 px-2.5 py-1 rounded-lg text-[11px] font-black transition shrink-0 pointer-events-auto"; btn.textContent = "立即更新"; btn.onclick = (e) => { e.stopPropagation(); worker.postMessage({ type: 'SKIP_WAITING' }); btn.textContent = "更新中..."; btn.disabled = true; haptic(15); }; toast.appendChild(btn); toast.classList.remove("-translate-y-24", "opacity-0"); toast.classList.add("translate-y-0", "opacity-100"); }

window.addEventListener('message', (event) => { if (event.data && event.data.type === 'closeExpenseModal') { const lc = document.getElementById('ledger-frame-container'); if (lc) { lc.style.cssText = ''; if (state.currentMainTab === 'ledger') { lc.classList.remove('hidden-view'); lc.classList.add('view-active'); } else { lc.classList.add('hidden-view'); lc.classList.remove('view-active'); } } } });

// ==================== 雲端同步 ====================
function forceSyncFromCloud() {
  if (!window.dbRef) { showToast("⚠️ 未連線", "⚠️"); return; }
  showToast("🔄 同步中...", "☁️"); haptic(8);
  window.dbRef.get().then(docSnap => {
    if (!docSnap.exists) { showToast("📭 雲端尚無資料", "📭"); return; }
    const cloudData = docSnap.data();
    const localNonBooking = {};
    Object.keys(state.checkedItems).forEach(k => { if (!k.startsWith('booking-') && !k.startsWith('custom-booking-')) { localNonBooking[k] = state.checkedItems[k]; } });
    if (cloudData.checkedItems) { state.checkedItems = { ...cloudData.checkedItems, ...localNonBooking }; }
    if (Array.isArray(cloudData.customBookingItems)) { customBookingItems = cloudData.customBookingItems.slice(); localStorage.setItem("custom_booking_items", JSON.stringify(customBookingItems)); }
    if (cloudData.userData) { cloudUserData = cloudData.userData; }
    if (cloudData.userPins) { cloudUserPins = cloudData.userPins; }
    saveLocalCheckedItems(); renderBookingChecklist(); renderEquipChecklist(); renderAllShoppingContent();
    if (window.AppHeader) window.AppHeader.render();
    showToast("✅ 已同步最新資料", "☁️"); haptic(10);
  }).catch(e => { showToast("❌ 同步失敗", "⚠️"); });
}
function releaseAdminDevice() { if (!confirm("確定要解除這台裝置的管理員身分嗎？")) return; localStorage.removeItem("tohoku_admin_unlocked"); renderBookingChecklist(); renderEquipChecklist(); showToast("👁️ 已轉為唯讀模式", "🔒"); haptic(15); }

// ==================== 可拖動匯率 FAB ====================
(function setupDraggableCurrencyFab() {
  const fab = document.getElementById('currency-fab');
  if (!fab) return;
  const FAB_SIZE = 56; const PADDING = 12; const SAFE_TOP = 12; const SAFE_BOTTOM = 88; const MOVE_THRESHOLD = 6; const STORAGE_KEY = 'tohoku_currency_fab_pos';
  let isDragging = false; let startX = 0, startY = 0; let currentX = 0, currentY = 0; let moved = false; let hasCustomPosition = false;
  function getBounds() { return { minX: PADDING, maxX: window.innerWidth - FAB_SIZE - PADDING, minY: SAFE_TOP, maxY: window.innerHeight - SAFE_BOTTOM - FAB_SIZE }; }
  function clampPosition(x, y) { const b = getBounds(); return { x: Math.max(b.minX, Math.min(b.maxX, x)), y: Math.max(b.minY, Math.min(b.maxY, y)) }; }
  function switchToAbsolutePosition() { if (hasCustomPosition) return; const rect = fab.getBoundingClientRect(); currentX = rect.left; currentY = rect.top; fab.style.left = currentX + 'px'; fab.style.top = currentY + 'px'; fab.style.right = 'auto'; fab.style.bottom = 'auto'; hasCustomPosition = true; }
  function setPosition(x, y) { currentX = x; currentY = y; fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto'; fab.style.bottom = 'auto'; hasCustomPosition = true; }
  function getStoredPosition() { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const pos = JSON.parse(saved); if (typeof pos.x === 'number' && typeof pos.y === 'number') return pos; } } catch (e) {} return null; }
  function savePosition(x, y) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y })); } catch(e) {} }
  function initPosition() { const stored = getStoredPosition(); if (stored) { const pos = clampPosition(stored.x, stored.y); setPosition(pos.x, pos.y); } else { const rect = fab.getBoundingClientRect(); currentX = rect.left; currentY = rect.top; } }
  function snapToEdge() { switchToAbsolutePosition(); const centerX = currentX + FAB_SIZE / 2; const snapLeft = centerX < window.innerWidth / 2; const targetX = snapLeft ? PADDING : window.innerWidth - FAB_SIZE - PADDING; const clamped = clampPosition(targetX, currentY); fab.classList.add('snapping'); setPosition(clamped.x, clamped.y); savePosition(clamped.x, clamped.y); setTimeout(() => fab.classList.remove('snapping'), 380); haptic(8); }
  fab.addEventListener('pointerdown', (e) => { isDragging = true; moved = false; switchToAbsolutePosition(); startX = e.clientX; startY = e.clientY; fab.classList.add('dragging'); try { fab.setPointerCapture(e.pointerId); } catch(err) {} });
  fab.addEventListener('pointermove', (e) => { if (!isDragging) return; const dx = e.clientX - startX; const dy = e.clientY - startY; if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) { moved = true; } if (moved) { const clamped = clampPosition(currentX + dx, currentY + dy); setPosition(clamped.x, clamped.y); startX = e.clientX; startY = e.clientY; } });
  function onPointerUp(e) { if (!isDragging) return; isDragging = false; fab.classList.remove('dragging'); try { fab.releasePointerCapture(e.pointerId); } catch(err) {} if (moved) { snapToEdge(); } else { if (typeof window.openCurrencyModal === 'function') window.openCurrencyModal(); haptic(10); } }
  fab.addEventListener('pointerup', onPointerUp);
  fab.addEventListener('pointercancel', (e) => { if (!isDragging) return; isDragging = false; fab.classList.remove('dragging'); try { fab.releasePointerCapture(e.pointerId); } catch(err) {} if (moved) snapToEdge(); });
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!hasCustomPosition) return; const clamped = clampPosition(currentX, currentY); setPosition(clamped.x, clamped.y); savePosition(clamped.x, clamped.y); }, 150); });
  requestAnimationFrame(() => { requestAnimationFrame(() => { initPosition(); }); });
  const HINT_KEY = 'tohoku_fab_hint_shown';
  if (!localStorage.getItem(HINT_KEY)) { setTimeout(() => { const hint = document.createElement('div'); hint.className = 'currency-fab-hint'; hint.textContent = '💡 可拖動我，點擊開啟匯率'; document.body.appendChild(hint); const rect = fab.getBoundingClientRect(); hint.style.left = Math.max(12, Math.min(rect.left - 60, window.innerWidth - 200)) + 'px'; hint.style.top = (rect.top - 44) + 'px'; requestAnimationFrame(() => hint.classList.add('show')); setTimeout(() => { hint.classList.remove('show'); setTimeout(() => hint.remove(), 400); }, 3500); localStorage.setItem(HINT_KEY, '1'); }, 2000); }
})();

// ==================== ⭐ 主題切換（主站深色模式） ====================
const THEME_KEY = 'tohoku_theme';

function initAppTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyAppTheme(saved);
}

function applyAppTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-menu-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  const label = document.getElementById('theme-menu-label');
  if (label) label.textContent = theme === 'dark' ? '淺色模式' : '深色模式';
  const iframe = document.getElementById('ledger-iframe');
  if (iframe && iframe.contentWindow) {
    try { iframe.contentWindow.postMessage({ type: 'setTheme', theme }, '*'); } catch(e) {}
  }
}

function toggleAppTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  applyAppTheme(next);
  localStorage.setItem(THEME_KEY, next);
  haptic(8);
  showToast(next === 'dark' ? '🌙 已切換深色模式' : '☀️ 已切換淺色模式');
  if (window.AppHeader) window.AppHeader.render();
}
window.toggleAppTheme = toggleAppTheme;

// ==================== ⭐ 緊急資訊 Modal ====================
function openEmergencyModal() {
  const m = document.getElementById('emergency-modal');
  if (!m) return;
  renderEmergencyContent();
  m.style.display = 'flex';
  m.classList.add('active');
  document.body.classList.add('modal-open');
  haptic(8);
}
function closeEmergencyModal() {
  const m = document.getElementById('emergency-modal');
  if (!m) return;
  m.classList.remove('active');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  const a = document.querySelector('.modal-overlay.active');
  if (!a) document.body.classList.remove('modal-open');
}
window.openEmergencyModal = openEmergencyModal;
window.closeEmergencyModal = closeEmergencyModal;

function renderEmergencyContent() {
  const c = document.getElementById('emergency-content');
  if (!c || typeof EMERGENCY_DATA === 'undefined') return;
  const D = EMERGENCY_DATA;

  const hotlineHTML = D.hotlines.map(h => `
    <a href="tel:${h.tel.replace(/[^0-9+#]/g, '')}" class="emergency-call-btn">
      <span class="emergency-call-icon">${h.icon}</span>
      <div class="emergency-call-info">
        <span class="emergency-call-label">${h.label}</span>
        <span class="emergency-call-desc">${h.desc || ''}</span>
      </div>
      <span class="emergency-call-tel">${h.tel}</span>
    </a>
  `).join('');

  const hotelsHTML = D.hotels.map(h => `
    <a href="tel:${h.tel.replace(/[^0-9+#]/g, '')}" class="emergency-hotel-row">
      <div class="emergency-hotel-day">${h.day}<br><span>${h.date}</span></div>
      <div class="emergency-hotel-info">
        <div class="emergency-hotel-name">${h.name}</div>
        <div class="emergency-hotel-note">${h.note || ''}</div>
      </div>
      <div class="emergency-hotel-tel">📞 ${h.tel}</div>
    </a>
  `).join('');

  const transportHTML = D.transport.map(t => `
    <a href="tel:${t.tel.replace(/[^0-9+#]/g, '')}" class="emergency-call-btn small">
      <span class="emergency-call-icon">${t.icon}</span>
      <div class="emergency-call-info">
        <span class="emergency-call-label">${t.label}</span>
        <span class="emergency-call-desc">${t.desc || ''}</span>
      </div>
      <span class="emergency-call-tel">${t.tel}</span>
    </a>
  `).join('');

  const guidesHTML = D.guides.map((g, i) => `
    <details class="emergency-guide ${i === 0 ? 'open' : ''}">
      <summary><span>${g.icon}</span> ${g.label}</summary>
      <ol class="emergency-steps">
        ${g.steps.map(s => `<li>${s}</li>`).join('')}
      </ol>
    </details>
  `).join('');

  c.innerHTML = `
    <div class="emergency-section">
      <div class="emergency-section-title">🆘 緊急熱線（點擊直接撥號）</div>
      ${hotlineHTML}
    </div>
    <div class="emergency-section">
      <div class="emergency-section-title">🏨 住宿電話</div>
      ${hotelsHTML}
    </div>
    <div class="emergency-section">
      <div class="emergency-section-title">🚗 租車 / 醫療</div>
      ${transportHTML}
    </div>
    <div class="emergency-section">
      <div class="emergency-section-title">📋 應變指南</div>
      ${guidesHTML}
    </div>
    <div class="emergency-tip">
      💡 建議截圖存到手機相簿，深山自駕時無訊號也能查看
    </div>
  `;
}

// ==================== ⭐ 返回頂部（IG 風格） ====================
function scrollToTop() {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    window.scrollTo(0, 0);
  }
  haptic(10);
}
window.scrollToTop = scrollToTop;

(function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const ring = btn.querySelector('.btt-ring-progress');
  const SHOW_AT = Math.max(300, window.innerHeight * 0.55);
  const RING_CIRC = ring ? ring.r.baseVal.value * 2 * Math.PI : 0;

  if (ring && RING_CIRC > 0) {
    ring.style.strokeDasharray = `${RING_CIRC}`;
    ring.style.strokeDashoffset = `${RING_CIRC}`;
  }

  let ticking = false;
  let scrollingTimer = null;

  function getScrollY() {
    return window.scrollY
      || window.pageYOffset
      || document.documentElement.scrollTop
      || document.body.scrollTop
      || 0;
  }
  function getMaxScroll() {
    const doc = document.documentElement;
    return Math.max(
      1,
      (doc.scrollHeight || document.body.scrollHeight) - window.innerHeight
    );
  }

  function update() {
    const y = getScrollY();
    const max = getMaxScroll();

    btn.classList.toggle('visible', y > SHOW_AT);

    if (ring && RING_CIRC > 0) {
      const p = Math.min(1, Math.max(0, y / max));
      ring.style.strokeDashoffset = `${RING_CIRC * (1 - p)}`;
    }

    btn.classList.add('scrolling');
    clearTimeout(scrollingTimer);
    scrollingTimer = setTimeout(() => btn.classList.remove('scrolling'), 220);

    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  update();
})();