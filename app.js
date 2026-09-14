/* ============================================================
 * app.js — v5.0
 * - 米紙手帳風格
 * - 改密碼 Bug 修正（支援連續修改）
 * - 自動包裝迷你卡片
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
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  } catch(e) {
    console.warn("crypto.subtle 不可用，使用 fallback");
    let h = 0;
    const s = PIN_SALT + String(pin);
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return "fb_" + Math.abs(h).toString(16);
  }
}

// ✅ 支援 forceFetch：從未改過或記憶體空時自動從雲端拉
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
    } catch(e) {
      console.warn("[verifyUserPinAsync] 雲端讀取失敗，使用記憶體", e);
    }
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
  } catch(e) {
    console.warn("[fetchUserPins] 讀取失敗:", e);
  }
  return {};
}

// ==================== 全域變數 ====================
let state = { currentMainTab: "itinerary", checkedItems: {} };
let currentUser = null;
let cloudUserData = {};
let cloudUserPins = {};
let exchangeRates = { JPY: 0.052, HKD: 1, TWD: 0.24, CNY: 1.1, USD: 7.8 };

const USER_PINS = {
  "余生": "1234",
  "bowie": "1234",
  "shandy": "1234",
  "connie": "1234"
};
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

const WEATHER_LOCATIONS = {
  1: { name: "宮城仙台", lat: 38.2682, lon: 140.8694 },
  2: { name: "山形天童", lat: 38.3625, lon: 140.3694 },
  3: { name: "山形藏王", lat: 38.1656, lon: 140.3986 },
  4: { name: "宮城泉",   lat: 38.3189, lon: 140.8831 },
  5: { name: "宮城白石", lat: 38.0022, lon: 140.6197 },
  6: { name: "宮城仙台", lat: 38.2682, lon: 140.8694 },
  7: { name: "宮城仙台", lat: 38.2682, lon: 140.8694 }
};

let snowmanProgress = JSON.parse(localStorage.getItem("snowman_progress")) || 0;
if (!window.weatherCache) window.weatherCache = {};
const modalUIState = {
  'booking-modal': { activeTab: 'all', expanded: {} },
  'equip-modal': { activeTab: 'all', expanded: {} }
};

window._renderedDays = new Set();

// ==================== 用戶登入系統 ====================
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
    // 強制從雲端拉最新 pins，確保改過密碼後能正確登入
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
    console.error("[verifyUserPin]", e);
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

// ==================== 帳戶設定 Modal ====================
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

// ==================== 修改 PIN Modal ====================
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

// ✅ 修正：直接查雲端最新 pins，不再依賴記憶體快取
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

  // ── 基本驗證 ──
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
    // ── 直接從雲端拉最新 pins，不依賴記憶體 ──
    if (!window.dbRef) throw new Error("雲端未連線");
    const docSnap = await window.dbRef.get();
    const cloudData = docSnap.exists ? docSnap.data() : {};
    const allPins = cloudData.userPins || {};

    // ── 驗證舊密碼 ──
    let oldPinOk = false;
    if (allPins[currentUser] && allPins[currentUser].hash) {
      const oldHash = await hashPin(oldPin);
      oldPinOk = (oldHash === allPins[currentUser].hash);
    } else {
      // 從未改過密碼 → 用預設 PIN
      oldPinOk = (USER_PINS[currentUser] === oldPin);
    }

    if (!oldPinOk) {
      showErr("目前 PIN 碼錯誤");
      submitBtn.disabled = false;
      submitBtn.textContent = "確認修改";
      submitBtn.classList.remove("opacity-60", "cursor-not-allowed");
      return;
    }

    // ── 寫入新 hash ──
    submitBtn.textContent = "更新中...";
    const newHash = await hashPin(newPin);
    allPins[currentUser] = {
      hash: newHash,
      updatedAt: Date.now(),
      updatedBy: currentUser
    };
    await window.dbRef.set({ userPins: allPins, updatedAt: Date.now() }, { merge: true });

    // ── 更新記憶體快取 ──
    cloudUserPins = allPins;

    showToast("✅ PIN 碼已更新，下次登入請用新密碼", "🔑");
    haptic(20);
    closeChangePinModal();

  } catch(e) {
    console.error("[submitChangePin]", e);
    showToast("❌ 更新失敗：" + (e.message || "請稍後再試"), "⚠️");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "確認修改";
    submitBtn.classList.remove("opacity-60", "cursor-not-allowed");
  }
}

function initAppAfterLogin() {
  console.log("✅ 用戶已登入:", currentUser);
  updateUserBadge();
  loadCustomItems();
  const saved = localStorage.getItem("tohoku_checked_items");
  if (saved) { try { state.checkedItems = JSON.parse(saved); } catch(e) {} }
  fetchLiveRates();
  initSnowEffect();

  setupModalDrag([ 'booking-modal', 'equip-modal', 'drive-modal', 'ticket-modal', 'weather-modal', 'trip-overview-modal', 'shoot-tips-modal', 'vlog-plan-modal', 'common-tips-modal', 'shopping-modal', 'all-shopping-modal', 'currency-modal' ]);

  renderDayItinerary('day-section-1', winterItineraries[0]);

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
            (items || []).forEach(item => {
              total++;
              if (item.planned) done++;
            });
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

  startMainTick();
}

// ==================== ⏱️ 主定時器 ====================
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
  if (document.hidden) {
    stopMainTick();
  } else {
    if (currentUser) startMainTick();
  }
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

// ==================== 用戶資料 ====================
function getUserData() {
  if (!currentUser || currentUser === "訪客") return { equipChecked: {}, customEquip: [], shopping: {} };
  if (!cloudUserData[currentUser]) {
    cloudUserData[currentUser] = { equipChecked: {}, customEquip: [], shopping: {} };
  }
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
  } catch (e) {
    console.warn("User data save error:", e);
    showToast("❌ 儲存失敗：" + e.message, "⚠️");
  }
}

function haptic(ms = 10) { if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } }

function scrollToToday() {
  const now = Date.now();
  if (now < TRIP_START) { switchDay(1); showToast("📅 行程尚未開始，已跳到 D1", "✈️"); }
  else if (now > TRIP_END) { switchDay(7); showToast("📅 行程已結束，已跳到 D7", "🏁"); }
  else { for (let i = 0; i < tripDates.length; i++) { const dayStart = new Date(tripDates[i] + "T00:00:00+08:00").getTime(); const dayEnd = new Date(tripDates[i] + "T23:59:59+08:00").getTime(); if (now >= dayStart && now <= dayEnd) { switchDay(i + 1); showToast(`📅 已跳到 Day ${i + 1}`, "📍"); break; } } }
  haptic(12); setTimeout(() => { const tabs = document.querySelector('.day-tabs-wrapper'); if (tabs) tabs.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}
function updateTodayButtonVisibility() { const btn = document.getElementById('btn-today'); if (!btn) return; const now = Date.now(); if (now >= TRIP_START && now <= TRIP_END) { btn.classList.remove('hidden'); } else { btn.classList.add('hidden'); } }

// ==================== 時間軸狀態更新 ====================
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
    } else {
      eh = sh + 2;
      if (eh >= 24) { eh = 23; em = 59; }
    }

    const startTs = new Date(`${dateStr}T${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')}:00+08:00`).getTime();
    const endTs = new Date(`${dateStr}T${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}:00+08:00`).getTime();

    let newStatus;
    if (now > endTs) {
      newStatus = 'status-done';
    } else if (now >= startTs && now <= endTs) {
      newStatus = 'status-active';
      nextMarked = true;
    } else {
      if (!nextMarked) {
        newStatus = 'status-next';
        nextMarked = true;
      } else {
        newStatus = 'status-upcoming';
      }
    }

    if (!item.classList.contains(newStatus)) {
      item.classList.remove('status-done', 'status-active', 'status-next', 'status-upcoming');
      item.classList.add(newStatus);
    }
  });
}

// ==================== Modal 手勢關閉 ====================
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
      if (diff > 0) {
        box.style.transform = `translateY(${diff}px)`;
        modal.style.opacity = Math.max(0, 1 - diff / 400);
      }
    };
    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      const diff = currentY - startY;
      box.classList.remove('dragging');
      box.classList.add('snapping');
      if (diff > 100) {
        box.style.transform = `translateY(100%)`;
        modal.style.opacity = '0';
        haptic(15);
        setTimeout(() => {
          const closers = { 'booking-modal': closeBookingModal, 'equip-modal': closeEquipModal, 'drive-modal': closeDriveModal, 'ticket-modal': closeTicketModal, 'weather-modal': closeWeatherModal, 'trip-overview-modal': closeTripOverview, 'shoot-tips-modal': closeShootTipsModal, 'vlog-plan-modal': closeVlogPlanModal, 'common-tips-modal': closeCommonTipsModal, 'shopping-modal': closeShoppingModal, 'all-shopping-modal': closeAllShoppingModal, 'currency-modal': closeCurrencyModal };
          if (closers[id]) closers[id]();
          box.style.transform = '';
          modal.style.opacity = '';
        }, 280);
      } else {
        box.style.transform = '';
        modal.style.opacity = '';
        setTimeout(() => box.classList.remove('snapping'), 300);
      }
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
    };
    const onStart = (e) => {
      isDragging = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      currentY = startY;
      box.classList.add('dragging');
      box.classList.remove('snapping');
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

// ==================== 頁面切換 ====================
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
  setTimeout(() => { hideView.classList.add('hidden-view'); hideView.classList.remove('view-exit-left', 'view-exit-right'); if (isGoingToLedger) { const iframe = document.getElementById("ledger-iframe"); if (iframe) iframe.style.height = "calc(100dvh - 60px)"; } }, 400);
}

function setupImageFadeIn(container = document) { const imgs = container.querySelectorAll('img.lazy-fade:not(.loaded)'); imgs.forEach(img => { if (img.complete && img.naturalWidth > 0) img.classList.add('loaded'); else { img.addEventListener('load', () => img.classList.add('loaded'), { once: true }); img.addEventListener('error', () => { img.classList.add('loaded'); img.style.display = 'none'; }, { once: true }); } }); }

// ==================== 管理員密碼 ====================
function isAdminUnlocked() { return localStorage.getItem("tohoku_admin_unlocked") === "true"; }
function showPasswordModal() { const m = document.getElementById("password-modal"); m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); document.getElementById("password-error").classList.add('hidden'); document.getElementById("password-input").value = ''; setTimeout(() => document.getElementById("password-input").focus(), 100); }
function closePasswordModal() { const m = document.getElementById("password-modal"); m.classList.remove('active'); setTimeout(() => m.style.display = 'none', 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); }
function verifyPassword() { const input = document.getElementById("password-input").value.trim(); if (input === ADMIN_PASSWORD) { localStorage.setItem("tohoku_admin_unlocked", "true"); closePasswordModal(); renderBookingChecklist(); renderEquipChecklist(); showToast("✅ 已解鎖管理權限"); haptic(15); } else { document.getElementById("password-error").classList.remove("hidden"); document.getElementById("password-input").value = ''; haptic(50); } }
function lockAdmin() { localStorage.removeItem("tohoku_admin_unlocked"); renderBookingChecklist(); renderEquipChecklist(); showToast("🔒 已鎖定管理權限"); }

// ==================== 匯率 ====================
async function fetchLiveRates() { try { const response = await fetch('https://open.er-api.com/v6/latest/JPY'); const data = await response.json(); if (data && data.rates) { exchangeRates.JPY = 1; exchangeRates.HKD = 1 / data.rates.JPY * data.rates.HKD; exchangeRates.TWD = 1 / data.rates.JPY * data.rates.TWD; exchangeRates.USD = 1 / data.rates.JPY * data.rates.USD; exchangeRates.CNY = 1 / data.rates.JPY * data.rates.CNY; localStorage.setItem('tohoku_exchange_rates', JSON.stringify({ rates: exchangeRates, updatedAt: Date.now() })); updateRateHud(); } } catch(e) { const cached = localStorage.getItem('tohoku_exchange_rates'); if (cached) { try { const c = JSON.parse(cached); if (c.rates) exchangeRates = c.rates; } catch(e2) {} } } }
function updateRateHud() { const t = document.getElementById("rate-hint-text"); if (t) t.innerText = `目前匯率：1 JPY ≈ ${exchangeRates.HKD.toFixed(3)} HKD`; }
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
function convertCurrency(type) { const hkdInput = document.getElementById("calc-hkd"); const jpyInput = document.getElementById("calc-jpy"); if (!hkdInput || !jpyInput) return; if (type === "clear") { hkdInput.value = ""; jpyInput.value = ""; return; } const rate = exchangeRates.JPY || 0.052; if (type === "jpy") { const jpy = parseFloat(jpyInput.value); hkdInput.value = (isNaN(jpy) || jpy === 0) ? "" : (jpy * rate).toFixed(2); } else if (type === "hkd") { const hkd = parseFloat(hkdInput.value); jpyInput.value = (isNaN(hkd) || hkd === 0) ? "" : Math.round(hkd / rate); } }
function quickConvert(currency, amount) { const input = document.getElementById("calc-" + currency); if (input) { input.value = amount; convertCurrency(currency); } }

// ==================== Toast ====================
function showToast(message, icon = "✅") { const toast = document.getElementById("toast"); const m = document.getElementById("toast-message"); const i = document.getElementById("toast-icon"); if (toast && m && i) { const oldBtn = document.getElementById("toast-undo-btn"); if (oldBtn) oldBtn.remove(); window._undoCallback = null; m.innerText = message; i.innerText = icon; toast.classList.remove("-translate-y-24", "opacity-0"); toast.classList.add("translate-y-0", "opacity-100"); if (window.toastTimeout) clearTimeout(window.toastTimeout); window.toastTimeout = setTimeout(() => { toast.classList.remove("translate-y-0", "opacity-100"); toast.classList.add("-translate-y-24", "opacity-0"); }, 3000); } }
function showUndoToast(message, icon, onUndo) { const toast = document.getElementById("toast"); const m = document.getElementById("toast-message"); const i = document.getElementById("toast-icon"); if (!toast) return; const oldBtn = document.getElementById("toast-undo-btn"); if (oldBtn) oldBtn.remove(); m.innerText = message; i.innerText = icon; const btn = document.createElement("button"); btn.id = "toast-undo-btn"; btn.className = "ml-2 bg-white/20 hover:bg-white/30 active:scale-95 px-2.5 py-1 rounded-lg text-[11px] font-black transition shrink-0 pointer-events-auto"; btn.textContent = "撤銷"; btn.onclick = (e) => { e.stopPropagation(); if (window._undoCallback) { window._undoCallback(); window._undoCallback = null; } const t = document.getElementById("toast"); if (t) { t.classList.remove("translate-y-0", "opacity-100"); t.classList.add("-translate-y-24", "opacity-0"); } if (window.toastTimeout) clearTimeout(window.toastTimeout); haptic(15); }; toast.appendChild(btn); window._undoCallback = onUndo; toast.classList.remove("-translate-y-24", "opacity-0"); toast.classList.add("translate-y-0", "opacity-100"); if (window.toastTimeout) clearTimeout(window.toastTimeout); window.toastTimeout = setTimeout(() => { toast.classList.remove("translate-y-0", "opacity-100"); toast.classList.add("-translate-y-24", "opacity-0"); window._undoCallback = null; setTimeout(() => { const b = document.getElementById("toast-undo-btn"); if (b) b.remove(); }, 300); }, 5000); }
function copyText(text) { try { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); } catch(e) { navigator.clipboard.writeText(text).catch(() => {}); } }

// ==================== 行前預訂 ====================
const bookingList = [
  { id: "flight-outbound", category: "航班", label: "去程機票：香港 → 仙台 (SDJ)", icon: "✈️" },
  { id: "flight-inbound", category: "航班", label: "回程機票：仙台 (SDJ) → 香港", icon: "✈️" },
  { id: "flight-seat", category: "航班", label: "線上選位 / 加購行李", icon: "💺" },
  { id: "flight-checkin", category: "航班", label: "網路報到 + 下載登機證", icon: "🎫" },
  { id: "hotel-akiu", category: "住宿", label: "1/21 秋保溫泉 瑞鳳大飯店 (含自助晚餐)", icon: "🏨" },
  { id: "hotel-tendo", category: "住宿", label: "1/22-23 微笑之宿 瀧之湯 (含懷石晚餐)", icon: "🏨" },
  { id: "hotel-sendai", category: "住宿", label: "1/24-26 Hotel Grand Bach 仙台 (連住3晚)", icon: "🏨" },
  { id: "car-nippon", category: "租車", label: "Nippon Rent-A-Car 7-8人座雪地車", icon: "🚗" },
  { id: "car-safetybelt", category: "租車", label: "便攜式兒童安全帶 x2", icon: "🪑" },
  { id: "car-pickup", category: "租車", label: "1/21 15:30 機場取車", icon: "⏰" },
  { id: "car-dropoff", category: "租車", label: "1/27 13:45 機場還車", icon: "⏰" },
  { id: "insurance-travel", category: "保險", label: "旅遊平安險 / 意外險", icon: "🛡️" },
  { id: "insurance-medical", category: "保險", label: "海外突發疾病醫療險", icon: "🏥" },
  { id: "insurance-trip", category: "保險", label: "旅程不便險（班機/行李延誤）", icon: "🧳" },
  { id: "insurance-car", category: "保險", label: "租車免責補償 NOC / CDW", icon: "🚙" },
  { id: "ticket-ginzan", category: "門票", label: "銀山溫泉 Fast Pass (1/8 23:00搶票)", icon: "🎟️" },
  { id: "ticket-zao", category: "門票", label: "藏王纜車優先票 (1/15 23:00搶票)", icon: "🎟️" },
  { id: "ticket-springvalley", category: "門票", label: "Spring Valley 雪之冒險王國 (1/24)", icon: "⛷️" },
  { id: "ticket-foxvillage", category: "門票", label: "狐狸村入場 (現場購票)", icon: "🦊" },
  { id: "sim-esim", category: "通訊", label: "日本 eSIM / 上網卡", icon: "📶" },
  { id: "wifi-router", category: "通訊", label: "WiFi 分享器 (若需要)", icon: "📡" },
  { id: "other-private-bath", category: "其他", label: "瀧之湯貸切風呂 (1/23 16:30)", icon: "♨️" },
  { id: "other-strawberry", category: "其他", label: "寒河江草莓園 (1/23 14:00)", icon: "🍓" },
  { id: "other-passport", category: "其他", label: "護照效期檢查 (需剩餘 6 個月以上)", icon: "🪪" },
  { id: "other-visit-japan-web", category: "其他", label: "Visit Japan Web 登錄 + QR Code", icon: "📱" },
  { id: "other-credit-card", category: "其他", label: "信用卡通知銀行 / 開通海外交易", icon: "💳" },
  { id: "other-cash", category: "其他", label: "日幣現金準備 / 換匯", icon: "💴" }
];
let customBookingItems = [];

function renderBookingChecklist() {
  const container = document.getElementById("booking-modal-inner"); if (!container) return;
  const isAdmin = isAdminUnlocked();
  const categories = ["航班", "住宿", "租車", "保險", "門票", "通訊", "其他"];
  const allItems = [...bookingList, ...customBookingItems];
  const totalCount = allItems.length;
  const doneCount = allItems.filter(item => { const key = item.isCustom ? `custom-booking-${item.id}` : `booking-${item.id}`; return state.checkedItems[key] === true; }).length;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0; const activeTab = modalUIState['booking-modal'].activeTab;
  const modeBanner = isAdmin ? `<div class="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-3 mb-3 flex items-center gap-2.5"><span class="text-xl shrink-0">✏️</span><div class="flex-1 min-w-0"><div class="text-xs font-black text-emerald-800">編輯模式（管理員）</div><div class="text-[10px] text-emerald-600 leading-relaxed">你的修改會自動同步給所有裝置</div></div></div>` : `<div class="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 rounded-xl p-3 mb-3 flex items-center gap-2.5"><span class="text-xl shrink-0">👁️</span><div class="flex-1 min-w-0"><div class="text-xs font-black text-sky-800">唯讀模式</div><div class="text-[10px] text-sky-600 leading-relaxed">資料由管理員同步，你只能查看</div></div><button onclick="forceSyncFromCloud()" class="text-[10px] bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 px-2.5 py-1.5 rounded-lg font-bold shrink-0 transition active:scale-95 shadow-sm">🔄 重新同步</button></div>`;
  let html = modeBanner;
  html += `<div class="modal-progress-wrap"><div class="modal-progress-header"><span class="modal-progress-label">${percent === 100 ? '🎉 全部完成！' : '整體進度'}</span><span class="modal-progress-count">${doneCount} / ${totalCount}</span></div><div class="modal-progress-track"><div class="modal-progress-fill ${percent === 100 ? 'complete' : ''}" style="width:${percent}%"></div></div></div>`;
  html += `<div class="modal-tabs">`; const allDone = doneCount === totalCount && totalCount > 0;
  html += `<button class="modal-tab ${activeTab === 'all' ? 'active' : ''} ${allDone ? 'complete' : ''}" onclick="setModalTab('booking-modal','all')">全部 <span class="tab-count">${doneCount}/${totalCount}</span></button>`;
  categories.forEach(cat => { const items = bookingList.filter(i => i.category === cat); const customs = customBookingItems.filter(i => i.category === cat); const catAll = [...items, ...customs]; if (catAll.length === 0) return; const catDone = catAll.filter(item => { const key = item.isCustom ? `custom-booking-${item.id}` : `booking-${item.id}`; return state.checkedItems[key] === true; }).length; const isComplete = catDone === catAll.length; html += `<button class="modal-tab ${activeTab === cat ? 'active' : ''} ${isComplete ? 'complete' : ''}" onclick="setModalTab('booking-modal','${cat}')">${cat} <span class="tab-count">${catDone}/${catAll.length}</span></button>`; });
  html += `</div>`; const catsToRender = activeTab === 'all' ? categories : [activeTab];
  catsToRender.forEach(cat => {
    const items = bookingList.filter(i => i.category === cat); const customs = customBookingItems.filter(i => i.category === cat); const catAll = [...items, ...customs]; if (catAll.length === 0) return;
    const catDone = catAll.filter(item => { const key = item.isCustom ? `custom-booking-${item.id}` : `booking-${item.id}`; return state.checkedItems[key] === true; }).length;
    const isComplete = catDone === catAll.length; const isExpanded = modalUIState['booking-modal'].expanded[cat] !== false;
    html += `<div class="category-group ${isExpanded ? 'expanded' : ''} ${isComplete ? 'done' : ''}">`;
    html += `<button class="category-header" onclick="toggleCategory('booking-modal','${cat}')"><div class="category-title-wrap"><span class="category-title">${cat}</span><span class="category-count">${catDone}/${catAll.length}</span></div><svg class="category-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button><div class="category-body"><div class="category-body-inner">`;
    catAll.forEach(item => { const key = item.isCustom ? `custom-booking-${item.id}` : `booking-${item.id}`; const isChecked = state.checkedItems[key] === true; const disabled = isAdmin ? "" : "disabled"; html += `<label class="checklist-item ${isChecked ? 'checked' : ''} ${!isAdmin ? 'opacity-80' : ''}"><input type="checkbox" ${disabled} ${isChecked ? 'checked' : ''} onchange="toggleBookingCheck('${key}')"><span class="checklist-icon">${item.icon}</span><span class="checklist-label">${escapeHtml(item.label)}</span>${isAdmin && item.isCustom ? `<button onclick="event.preventDefault();event.stopPropagation();deleteCustomBooking('${item.id}')" class="text-red-400 hover:text-red-600 p-1 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>` : ''}</label>`; });
    html += `</div></div></div>`;
  });
  if (isAdmin) {
    html += `<div class="mt-5 pt-4 border-t border-slate-200"><h4 class="text-sm font-bold text-slate-800 mb-2">➕ 新增項目</h4><div class="flex gap-2"><input id="new-booking-label" type="text" placeholder="項目名稱" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs"><select id="new-booking-category" class="border border-slate-300 rounded-lg px-2 py-2 text-xs bg-white"><option value="航班">航班</option><option value="住宿">住宿</option><option value="租車">租車</option><option value="保險">保險</option><option value="門票">門票</option><option value="通訊">通訊</option><option value="其他">其他</option></select><button onclick="addCustomBooking()" class="bg-sky-500 hover:bg-sky-600 text-white px-3 rounded-lg text-xs font-bold">新增</button></div></div><div class="flex gap-2 mt-4"><button onclick="checkAllBooking()" class="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold py-2 rounded-lg transition">✓ 全選</button><button onclick="uncheckAllBooking()" class="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold py-2 rounded-lg transition">✗ 清除</button><button onclick="copyBookingList()" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2 rounded-lg transition">📋 複製</button></div><div class="mt-3 flex items-center justify-center gap-3 text-center flex-wrap"><button onclick="lockAdmin()" class="text-[10px] text-amber-600 hover:text-amber-800 underline">🔒 暫時鎖定</button><span class="text-[10px] text-slate-300">|</span><button onclick="releaseAdminDevice()" class="text-[10px] text-red-500 hover:text-red-700 underline">❌ 解除此裝置的管理員身分</button></div>`;
  } else {
    html += `<div class="mt-5 text-center"><button onclick="showPasswordModal()" class="text-[11px] bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-full font-bold transition">🔓 輸入密碼解鎖編輯</button><p class="text-[10px] text-slate-400 mt-2">🔒 目前為唯讀模式</p></div>`;
  }
  container.innerHTML = html;
}

function toggleBookingCheck(key) {
  if (!isAdminUnlocked()) { showToast("🔒 唯讀模式，無法修改", "⚠️"); return; }
  state.checkedItems[key] = !state.checkedItems[key];
  renderBookingChecklist();
  saveLocalCheckedItems();
  syncDataToCloud();
  haptic(5);
  if (window.AppHeader) window.AppHeader.render();
}
function checkAllBooking() { if (!isAdminUnlocked()) return; [...bookingList, ...customBookingItems].forEach(item => { const key = item.isCustom ? `custom-booking-${item.id}` : `booking-${item.id}`; state.checkedItems[key] = true; }); saveLocalCheckedItems(); syncDataToCloud(); renderBookingChecklist(); showToast("✅ 已全部勾選！"); if (window.AppHeader) window.AppHeader.render(); }
function uncheckAllBooking() { if (!isAdminUnlocked()) return; [...bookingList, ...customBookingItems].forEach(item => { const key = item.isCustom ? `custom-booking-${item.id}` : `booking-${item.id}`; state.checkedItems[key] = false; }); saveLocalCheckedItems(); syncDataToCloud(); renderBookingChecklist(); showToast("🧹 已清除所有勾選！"); if (window.AppHeader) window.AppHeader.render(); }
function copyBookingList() { let text = "📌 行前預訂 Check List\n=====================\n"; ["航班", "住宿", "租車", "保險", "門票", "通訊", "其他"].forEach(cat => { const items = bookingList.filter(i => i.category === cat); const customs = customBookingItems.filter(i => i.category === cat); const all = [...items, ...customs]; if (all.length === 0) return; text += `\n【${cat}】\n`; all.forEach(item => { const key = item.isCustom ? `custom-booking-${item.id}` : `booking-${item.id}`; text += `${state.checkedItems[key] ? "✅" : "⬜"} ${item.icon} ${item.label}\n`; }); }); copyText(text); showToast("📋 行前預訂清單已複製！"); }
function addCustomBooking() { if (!isAdminUnlocked()) return; const l = document.getElementById("new-booking-label"); const c = document.getElementById("new-booking-category"); const label = l.value.trim(); if (!label) { showToast("請輸入項目名稱", "⚠️"); return; } customBookingItems.push({ id: "custom-" + Date.now(), category: c.value, label, icon: "📌", isCustom: true }); saveCustomItems(); syncDataToCloud(); renderBookingChecklist(); l.value = ""; showToast("已新增項目！"); if (window.AppHeader) window.AppHeader.render(); }
function deleteCustomBooking(id) { if (!isAdminUnlocked()) return; const originalIndex = customBookingItems.findIndex(i => i.id === id); if (originalIndex === -1) return; const snapshot = { ...customBookingItems[originalIndex] }; customBookingItems = customBookingItems.filter(i => i.id !== id); saveCustomItems(); syncDataToCloud(); renderBookingChecklist(); if (window.AppHeader) window.AppHeader.render(); showUndoToast(`已刪除「${snapshot.label}」`, "🗑", () => { customBookingItems.splice(Math.min(originalIndex, customBookingItems.length), 0, snapshot); saveCustomItems(); syncDataToCloud(); renderBookingChecklist(); if (window.AppHeader) window.AppHeader.render(); showToast("✅ 已還原", "↩️"); }); }
function setModalTab(modalId, tab) { modalUIState[modalId].activeTab = tab; haptic(6); if (modalId === 'booking-modal') renderBookingChecklist(); else if (modalId === 'equip-modal') renderEquipChecklist(); }
function toggleCategory(modalId, cat) { const expanded = modalUIState[modalId].expanded; expanded[cat] = expanded[cat] === false ? true : false; haptic(5); if (modalId === 'booking-modal') renderBookingChecklist(); else if (modalId === 'equip-modal') renderEquipChecklist(); }

// ==================== 裝備清單 ====================
const equipmentList = [ { id: "passport", category: "重要證件", label: "身份證 / 護照（效期需剩餘6個月以上）", icon: "🪪" }, { id: "license", category: "重要證件", label: "國際車牌 / 駕駛執照", icon: "🚗" }, { id: "tickets", category: "重要證件", label: "機票 / 住宿憑證 / Visit Japan Web QR Code", icon: "✈️" }, { id: "money", category: "重要證件", label: "日幣現金與信用卡", icon: "💴" }, { id: "car-mount", category: "重要證件", label: "車用手機架", icon: "📱" }, { id: "thermal", category: "保暖衣物", label: "發熱衣 / 保暖內衣（3-4件）", icon: "👕" }, { id: "mid-layer", category: "保暖衣物", label: "中層保暖衣物（2-3件）", icon: "🧶" }, { id: "outer-coat", category: "保暖衣物", label: "防風防水厚外套 / 羽絨服", icon: "🧥" }, { id: "pants", category: "保暖衣物", label: "長褲與發熱內搭褲", icon: "👖" }, { id: "scarf", category: "保暖衣物", label: "圍巾、毛帽或耳罩", icon: "🧣" }, { id: "gloves", category: "保暖衣物", label: "觸控手套", icon: "🧤" }, { id: "boots", category: "保暖衣物", label: "防水防滑雪靴", icon: "👢" }, { id: "socks", category: "保暖衣物", label: "厚羊毛襪（3-5雙）", icon: "🧦" }, { id: "sim", category: "電子與隨身", label: "日本上網卡", icon: "📶" }, { id: "powerbank", category: "電子與隨身", label: "行動電源（僅限手提）", icon: "🔋" }, { id: "thermos", category: "電子與隨身", label: "保溫瓶", icon: "🍶" }, { id: "skincare", category: "電子與隨身", label: "保濕護膚品與潤唇膏", icon: "🧴" }, { id: "medicine", category: "電子與隨身", label: "常備藥品", icon: "💊" }, { id: "warmpack", category: "電子與隨身", label: "暖暖包", icon: "🔥" }, { id: "adult-crampons", category: "其他", label: "簡易冰爪", icon: "⛸️" }, { id: "kid-hat", category: "小孩", label: "小孩毛帽 (蓋耳)", icon: "🧢" }, { id: "kid-gloves", category: "小孩", label: "小孩手套 (備2雙)", icon: "🧤" }, { id: "kid-scarf", category: "小孩", label: "小孩圍脖", icon: "🧣" }, { id: "kid-snowpants", category: "小孩", label: "小孩防水雪褲", icon: "👖" }, { id: "kid-boots", category: "小孩", label: "小孩雪靴 (防水)", icon: "👢" }, { id: "swimwear", category: "其他", label: "泳衣 (溫泉泳池用)", icon: "🩱" }, { id: "safetybelt", category: "其他", label: "便攜式兒童安全帶", icon: "🪑" }, { id: "firstaid", category: "其他", label: "簡易急救包", icon: "🩹" } ];

function renderEquipChecklist() {
  const container = document.getElementById("equip-modal-inner"); if (!container) return;
  if (!currentUser) { container.innerHTML = '<div class="text-center py-8 text-slate-500">請先登入身份</div>'; return; }
  if (currentUser === "訪客") {
    container.innerHTML = `<div class="text-center py-12"><div class="text-5xl mb-3">🔒</div><p class="text-sm font-bold text-slate-700 mb-1">訪客無法使用專屬清單</p><p class="text-xs text-slate-500 leading-relaxed">請切換為家庭成員身份<br>才能建立自己的裝備清單</p></div>`;
    return;
  }
  const userData = getUserData();
  const customEquipItems = userData.customEquip || [];
  const categories = ["重要證件", "保暖衣物", "電子與隨身", "小孩", "其他"];
  const allItems = [...equipmentList, ...customEquipItems];
  const totalCount = allItems.length;
  const doneCount = allItems.filter(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; return userData.equipChecked[key] === true; }).length;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const activeTab = modalUIState['equip-modal'].activeTab;
  const userBanner = `<div class="bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-sky-200 rounded-xl p-3 mb-3 flex items-center gap-2.5"><div class="w-10 h-10 rounded-full text-white flex items-center justify-center font-black shrink-0" style="background:${USER_COLORS[currentUser]}">${currentUser[0].toUpperCase()}</div><div class="flex-1 min-w-0"><div class="text-xs font-black text-sky-800">${escapeHtml(currentUser)} 的專屬裝備清單</div><div class="text-[10px] text-sky-600 leading-relaxed">只有你能看到和修改</div></div></div>`;
  let html = userBanner;
  html += `<div class="modal-progress-wrap"><div class="modal-progress-header"><span class="modal-progress-label">${percent === 100 ? '🎉 全部完成！' : '整體進度'}</span><span class="modal-progress-count">${doneCount} / ${totalCount}</span></div><div class="modal-progress-track"><div class="modal-progress-fill ${percent === 100 ? 'complete' : ''}" style="width:${percent}%"></div></div></div>`;
  html += `<div class="modal-tabs">`; const allDone = doneCount === totalCount && totalCount > 0;
  html += `<button class="modal-tab ${activeTab === 'all' ? 'active' : ''} ${allDone ? 'complete' : ''}" onclick="setModalTab('equip-modal','all')">全部 <span class="tab-count">${doneCount}/${totalCount}</span></button>`;
  categories.forEach(cat => { const items = equipmentList.filter(i => i.category === cat); const customs = customEquipItems.filter(i => i.category === cat); const catAll = [...items, ...customs]; if (catAll.length === 0) return; const catDone = catAll.filter(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; return userData.equipChecked[key] === true; }).length; const isComplete = catDone === catAll.length; html += `<button class="modal-tab ${activeTab === cat ? 'active' : ''} ${isComplete ? 'complete' : ''}" onclick="setModalTab('equip-modal','${cat}')">${cat} <span class="tab-count">${catDone}/${catAll.length}</span></button>`; });
  html += `</div>`;
  const catsToRender = activeTab === 'all' ? categories : [activeTab];
  catsToRender.forEach(cat => {
    const items = equipmentList.filter(i => i.category === cat); const customs = customEquipItems.filter(i => i.category === cat); const catAll = [...items, ...customs]; if (catAll.length === 0) return;
    const catDone = catAll.filter(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; return userData.equipChecked[key] === true; }).length;
    const isComplete = catDone === catAll.length; const isExpanded = modalUIState['equip-modal'].expanded[cat] !== false;
    html += `<div class="category-group ${isExpanded ? 'expanded' : ''} ${isComplete ? 'done' : ''}">`;
    html += `<button class="category-header" onclick="toggleCategory('equip-modal','${cat}')"><div class="category-title-wrap"><span class="category-title">${cat}</span><span class="category-count">${catDone}/${catAll.length}</span></div><svg class="category-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button><div class="category-body"><div class="category-body-inner">`;
    catAll.forEach(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; const isChecked = userData.equipChecked[key] === true; html += `<label class="checklist-item ${isChecked ? 'checked' : ''}"><input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleEquipCheck('${key}')"><span class="checklist-icon">${item.icon}</span><span class="checklist-label">${escapeHtml(item.label)}</span>${item.isCustom ? `<button onclick="event.preventDefault();event.stopPropagation();deleteCustomEquip('${item.id}')" class="text-red-400 hover:text-red-600 p-1 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>` : ''}</label>`; });
    html += `</div></div></div>`;
  });
  html += `<div class="mt-5 pt-4 border-t border-slate-200"><h4 class="text-sm font-bold text-slate-800 mb-2">➕ 新增項目</h4><div class="flex gap-2"><input id="new-equip-label" type="text" placeholder="項目名稱" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs"><select id="new-equip-category" class="border border-slate-300 rounded-lg px-2 py-2 text-xs bg-white"><option value="重要證件">重要證件</option><option value="保暖衣物">保暖衣物</option><option value="電子與隨身">電子與隨身</option><option value="小孩">小孩</option><option value="其他">其他</option></select><button onclick="addCustomEquip()" class="bg-sky-500 hover:bg-sky-600 text-white px-3 rounded-lg text-xs font-bold">新增</button></div></div><div class="flex gap-2 mt-4"><button onclick="checkAllEquipment()" class="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold py-2 rounded-lg transition">✓ 全選</button><button onclick="uncheckAllEquipment()" class="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold py-2 rounded-lg transition">✗ 清除</button><button onclick="copyEquipmentList()" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2 rounded-lg transition">📋 複製</button></div>`;
  container.innerHTML = html;
}

function toggleEquipCheck(key) {
  if (!currentUser || currentUser === "訪客") { showToast("🔒 請先登入", "⚠️"); return; }
  const userData = getUserData();
  userData.equipChecked[key] = !userData.equipChecked[key];
  renderEquipChecklist();
  saveUserData();
  haptic(5);
  if (window.AppHeader) window.AppHeader.render();
}
function checkAllEquipment() { if (!currentUser || currentUser === "訪客") return; const userData = getUserData(); [...equipmentList, ...(userData.customEquip || [])].forEach(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; userData.equipChecked[key] = true; }); renderEquipChecklist(); saveUserData(); showToast("✅ 已全部勾選！"); if (window.AppHeader) window.AppHeader.render(); }
function uncheckAllEquipment() { if (!currentUser || currentUser === "訪客") return; const userData = getUserData(); [...equipmentList, ...(userData.customEquip || [])].forEach(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; userData.equipChecked[key] = false; }); renderEquipChecklist(); saveUserData(); showToast("🧹 已清除所有勾選！"); if (window.AppHeader) window.AppHeader.render(); }
function copyEquipmentList() { if (!currentUser || currentUser === "訪客") return; const userData = getUserData(); const customEquipItems = userData.customEquip || []; let text = `🎒 ${currentUser} 的裝備清單 Check List\n=====================\n`; ["重要證件", "保暖衣物", "電子與隨身", "小孩", "其他"].forEach(cat => { const items = equipmentList.filter(i => i.category === cat); const customs = customEquipItems.filter(i => i.category === cat); const all = [...items, ...customs]; if (all.length === 0) return; text += `\n【${cat}】\n`; all.forEach(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; text += `${userData.equipChecked[key] ? "✅" : "⬜"} ${item.icon} ${item.label}\n`; }); }); copyText(text); showToast("📋 裝備清單已複製！"); }
function addCustomEquip() { if (!currentUser || currentUser === "訪客") return; const l = document.getElementById("new-equip-label"); const c = document.getElementById("new-equip-category"); const label = l.value.trim(); if (!label) { showToast("請輸入項目名稱", "⚠️"); return; } const userData = getUserData(); userData.customEquip.push({ id: "custom-" + Date.now(), category: c.value, label, icon: "📦", isCustom: true }); renderEquipChecklist(); saveUserData(); l.value = ""; showToast("已新增項目！"); if (window.AppHeader) window.AppHeader.render(); }
function deleteCustomEquip(id) { if (!currentUser || currentUser === "訪客") return; const userData = getUserData(); const originalIndex = userData.customEquip.findIndex(i => i.id === id); if (originalIndex === -1) return; const snapshot = { ...userData.customEquip[originalIndex] }; userData.customEquip = userData.customEquip.filter(i => i.id !== id); renderEquipChecklist(); saveUserData(); if (window.AppHeader) window.AppHeader.render(); showUndoToast(`已刪除「${snapshot.label}」`, "🗑", () => { const ud = getUserData(); ud.customEquip.splice(Math.min(originalIndex, ud.customEquip.length), 0, snapshot); renderEquipChecklist(); saveUserData(); if (window.AppHeader) window.AppHeader.render(); showToast("✅ 已還原", "↩️"); }); }

// ==================== 購物清單 ====================
function loadShoppingItems(eventTitle) {
  if (!currentUser || currentUser === "訪客") return [];
  const userData = getUserData();
  return userData.shopping[eventTitle] || [];
}
function saveShoppingItems(eventTitle, items) {
  if (!currentUser || currentUser === "訪客") return;
  const userData = getUserData();
  userData.shopping[eventTitle] = items;
  saveUserData();
}
function openShoppingModal(eventTitle) {
  const m = document.getElementById('shopping-modal'); if (!m) return;
  m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open');
  const c = document.getElementById('shopping-content'); if (c) c.innerHTML = renderShoppingList(eventTitle);
  setTimeout(() => setupImageFadeIn(m), 50);
}
function closeShoppingModal() {
  const m = document.getElementById('shopping-modal');
  if (m) { m.classList.remove('active'); setTimeout(() => { m.style.display = 'none'; refreshCurrentDay(); }, 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); }
}
function refreshCurrentDay() {
  if (window._lastActiveDay) {
    const dayData = winterItineraries.find(d => d.day === window._lastActiveDay);
    if (dayData) {
      renderDayItinerary(`day-section-${dayData.day}`, dayData, true);
      document.querySelectorAll('.day-section').forEach(sec => { if (sec.id !== `day-section-${dayData.day}`) sec.classList.add('hidden'); });
      document.querySelectorAll("#day-tabs-container button").forEach(btn => { btn.className = "day-tab flex-shrink-0 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition"; });
      const a = document.getElementById(`tab-d${dayData.day}`); if (a) a.className = "day-tab active flex-shrink-0 transition";
    }
  }
}
function renderShoppingList(eventTitle) {
  if (!currentUser || currentUser === "訪客") {
    return `<div class="text-center py-12"><div class="text-5xl mb-3">🔒</div><p class="text-sm font-bold text-slate-700 mb-1">訪客無法使用購物清單</p><p class="text-xs text-slate-500">請切換為家庭成員身份</p></div>`;
  }
  const items = loadShoppingItems(eventTitle);
  const userBanner = `<div class="mb-3 flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl p-2.5"><div class="w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-xs shrink-0" style="background:${USER_COLORS[currentUser]}">${currentUser[0].toUpperCase()}</div><div class="text-[11px] font-bold text-sky-800">${escapeHtml(currentUser)} 的購物清單</div></div>`;
  let html = userBanner + `<h3 class="text-sm font-bold text-slate-700 mb-2">${escapeHtml(eventTitle)}</h3>`;
  if (items.length === 0) { html += `<div class="text-center text-slate-400 text-xs py-6">暫無購物項目，請在下方新增</div>`; }
  else {
    html += `<div class="space-y-2 mb-4">`;
    items.forEach((item, index) => {
      const checked = item.planned ? 'checked' : '';
      html += `<div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg"><input type="checkbox" ${checked} onchange="toggleShoppingItem(this)" data-event-title="${escAttr(eventTitle)}" data-index="${index}" class="w-4 h-4 shrink-0"><div class="flex-1 min-w-0"><strong class="text-sm text-slate-800">${escapeHtml(item.name)}</strong>${item.category ? `<span class="text-[10px] text-slate-500 ml-2">${escapeHtml(item.category)}</span>` : ''}${item.note ? `<p class="text-[10px] text-slate-400 mt-0.5 truncate">📝 ${escapeHtml(item.note)}</p>` : ''}</div><button onclick="deleteShoppingItem(this)" data-event-title="${escAttr(eventTitle)}" data-index="${index}" class="text-red-400 hover:text-red-600 p-1 shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>`;
    });
    html += `</div>`;
  }
  html += `<div class="mt-4 border-t border-slate-200 pt-4"><h4 class="text-sm font-bold text-slate-800 mb-2">新增購物項目</h4><div class="flex flex-col gap-2"><input id="new-shopping-name" type="text" placeholder="物品名稱 *" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs"><div class="flex gap-2"><input id="new-shopping-category" type="text" placeholder="類別" class="w-1/3 border border-slate-300 rounded-lg px-3 py-2 text-xs"><input id="new-shopping-note" type="text" placeholder="備註" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs"></div><button onclick="addShoppingItem(this)" data-event-title="${escAttr(eventTitle)}" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold shrink-0">新增</button></div></div>`;
  return html;
}
function addShoppingItem(btn) {
  const t = btn.dataset.eventTitle;
  if (!currentUser || currentUser === "訪客") { showToast("請先登入", "⚠️"); return; }
  const n = document.getElementById('new-shopping-name'); const c = document.getElementById('new-shopping-category'); const no = document.getElementById('new-shopping-note');
  const name = n.value.trim(); if (!name) { showToast("請輸入物品名稱", "⚠️"); return; }
  const items = loadShoppingItems(t);
  items.push({ name, category: c.value.trim(), note: no.value.trim(), planned: false });
  saveShoppingItems(t, items);
  document.getElementById('shopping-content').innerHTML = renderShoppingList(t);
  showToast("✅ 已新增購物項目"); haptic(10);
  if (window.AppHeader) window.AppHeader.render();
}
function toggleShoppingItem(el) {
  const t = el.dataset.eventTitle;
  const i = parseInt(el.dataset.index);
  const items = loadShoppingItems(t); items[i].planned = !items[i].planned; saveShoppingItems(t, items);
  document.getElementById('shopping-content').innerHTML = renderShoppingList(t); haptic(5);
  if (window.AppHeader) window.AppHeader.render();
}
function deleteShoppingItem(btn) {
  const t = btn.dataset.eventTitle;
  const i = parseInt(btn.dataset.index);
  const items = loadShoppingItems(t); const snapshot = { ...items[i] }; items.splice(i, 1); saveShoppingItems(t, items);
  document.getElementById('shopping-content').innerHTML = renderShoppingList(t);
  if (window.AppHeader) window.AppHeader.render();
  showUndoToast(`已刪除「${snapshot.name}」`, "🗑", () => { const cur = loadShoppingItems(t); cur.splice(Math.min(i, cur.length), 0, snapshot); saveShoppingItems(t, cur); document.getElementById('shopping-content').innerHTML = renderShoppingList(t); if (window.AppHeader) window.AppHeader.render(); showToast("✅ 已還原", "↩️"); });
}

// ==================== 購物清單總覽 ====================
function openAllShoppingModal() { const m = document.getElementById('all-shopping-modal'); if (!m) return; m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); renderAllShoppingContent(); haptic(8); }
function closeAllShoppingModal() { const m = document.getElementById('all-shopping-modal'); if (m) { m.classList.remove('active'); setTimeout(() => { m.style.display = 'none'; refreshCurrentDay(); }, 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); } }
function getAllShoppingItems() {
  if (!currentUser || currentUser === "訪客") return [];
  const userData = getUserData();
  const groups = [];
  winterItineraries.forEach(day => { day.events.forEach(event => { const items = userData.shopping[event.title] || []; if (items.length > 0) { groups.push({ day: day.day, dateLabel: day.dateLabel, eventTitle: event.title, eventTime: event.time, eventIndex: day.events.indexOf(event), items: items }); } }); });
  return groups;
}
function renderAllShoppingContent() {
  const container = document.getElementById('all-shopping-content'); if (!container) return;
  if (!currentUser) { container.innerHTML = '<div class="text-center py-8 text-slate-500">請先登入</div>'; return; }
  if (currentUser === "訪客") {
    container.innerHTML = `<div class="text-center py-12"><div class="text-5xl mb-3">🔒</div><p class="text-sm font-bold text-slate-700 mb-1">訪客無法使用購物清單</p><p class="text-xs text-slate-500">請切換為家庭成員身份</p></div>`;
    return;
  }
  const groups = getAllShoppingItems();
  const userBanner = `<div class="mb-3 flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl p-3"><div class="w-10 h-10 rounded-full text-white flex items-center justify-center font-black shrink-0" style="background:${USER_COLORS[currentUser]}">${currentUser[0].toUpperCase()}</div><div class="text-xs font-black text-sky-800">${escapeHtml(currentUser)} 的購物清單總覽</div></div>`;
  if (groups.length === 0) { container.innerHTML = userBanner + `<div class="text-center py-12 px-4"><div class="text-6xl mb-3">🛒</div><p class="text-sm font-bold text-slate-700 mb-1">購物清單還是空的</p><p class="text-xs text-slate-500 leading-relaxed">在行程卡片的「🛍️ 購物清單」按鈕中<br>加入你想買的東西吧！</p></div>`; return; }
  let totalItems = 0; let checkedItems = 0;
  groups.forEach(g => { g.items.forEach(item => { totalItems++; if (item.planned) checkedItems++; }); });
  const percent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  let html = userBanner + `<div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-4"><div class="flex items-center justify-between mb-2"><span class="text-xs font-bold text-emerald-800">${percent === 100 ? '🎉 全部買齊！' : '📊 購物進度'}</span><span class="text-sm font-black text-emerald-700">${checkedItems} / ${totalItems}</span></div><div class="h-2 bg-white/70 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" style="width:${percent}%"></div></div></div>`;
  groups.forEach((group, gIdx) => {
    const groupChecked = group.items.filter(i => i.planned).length; const groupTotal = group.items.length; const allDone = groupChecked === groupTotal; const safeTitle = escAttr(group.eventTitle);
    html += `<details class="mb-3 bg-white border ${allDone ? 'border-emerald-200' : 'border-slate-200'} rounded-2xl shadow-sm overflow-hidden group" ${gIdx === 0 ? 'open' : ''}><summary class="cursor-pointer px-4 py-3 hover:bg-slate-50 transition-colors list-none flex items-center gap-3"><div class="shrink-0 w-10 h-10 rounded-full ${allDone ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'} flex items-center justify-center text-xs font-black border-2 border-white shadow-sm">D${group.day}</div><div class="flex-1 min-w-0"><div class="text-[10px] font-bold text-sky-600 tracking-wide">${escapeHtml(group.dateLabel)}</div><div class="text-sm font-bold text-slate-800 truncate">${escapeHtml(group.eventTitle)}</div></div><div class="shrink-0 flex items-center gap-1.5"><span class="text-[10px] font-black ${allDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'} px-2 py-0.5 rounded-full">${groupChecked}/${groupTotal}</span><svg class="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div></summary><div class="border-t border-slate-100 bg-slate-50/50 p-3 space-y-1.5">`;
    group.items.forEach((item, idx) => {
      html += `<label class="flex items-center gap-2.5 p-2.5 bg-white border ${item.planned ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'} rounded-xl cursor-pointer transition-all hover:shadow-sm active:scale-[0.99]"><input type="checkbox" ${item.planned ? 'checked' : ''} data-event-title="${safeTitle}" data-index="${idx}" onchange="handleAllShoppingToggle(this)" class="w-4 h-4 shrink-0"><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><strong class="text-[13px] ${item.planned ? 'text-slate-500 line-through' : 'text-slate-800'} truncate">${escapeHtml(item.name)}</strong>${item.category ? `<span class="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">${escapeHtml(item.category)}</span>` : ''}</div>${item.note ? `<p class="text-[10px] text-slate-500 mt-0.5 truncate">📝 ${escapeHtml(item.note)}</p>` : ''}</div></label>`;
    });
    html += `<button onclick="jumpToEvent(${group.day}, ${group.eventIndex})" class="mt-2 w-full text-[10px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 py-2 rounded-lg transition active:scale-95">📍 前往行程查看</button></div></details>`;
  });
  container.innerHTML = html;
}

function handleAllShoppingToggle(el) {
  const eventTitle = el.dataset.eventTitle;
  const index = parseInt(el.dataset.index);
  const items = loadShoppingItems(eventTitle);
  if (!items[index]) return;
  items[index].planned = !items[index].planned;
  saveShoppingItems(eventTitle, items);
  haptic(5);

  const label = el.closest('label');
  if (label) {
    label.classList.toggle('border-emerald-200', items[index].planned);
    label.classList.toggle('bg-emerald-50/40', items[index].planned);
    const strong = label.querySelector('strong');
    if (strong) {
      strong.classList.toggle('text-slate-500', items[index].planned);
      strong.classList.toggle('line-through', items[index].planned);
      strong.classList.toggle('text-slate-800', !items[index].planned);
    }
  }

  const container = document.getElementById('all-shopping-content');
  if (container) {
    const progressBar = container.querySelector('.h-2 > div');
    const progressText = container.querySelector('.text-sm.font-black');
    if (progressBar && progressText) {
      const allGroups = getAllShoppingItems();
      let total = 0, done = 0;
      allGroups.forEach(g => g.items.forEach(i => { total++; if (i.planned) done++; }));
      const pct = total > 0 ? Math.round(done / total * 100) : 0;
      progressBar.style.width = pct + '%';
      progressText.textContent = `${done} / ${total}`;
    }
  }

  if (window.AppHeader) window.AppHeader.render();
}

function jumpToEvent(day, eventIndex) {
  closeAllShoppingModal();
  switchDay(day);
  setTimeout(() => {
    const cards = document.querySelectorAll(`#day-section-${day} details.event-card`);
    const target = cards[eventIndex];
    if (target) {
      target.open = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.style.transition = 'box-shadow 0.4s';
      target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.4)';
      setTimeout(() => { target.style.boxShadow = ''; }, 1500);
    }
  }, 400);
  haptic(8);
}

// ==================== 天氣 ====================
function weatherCodeToIcon(code) {
  if (code === 0) return "☀️";
  if (code < 5) return "⛅";
  if (code < 70) return "☁️";
  return "❄️";
}

async function fetchWeatherData() {
  const today = new Date();
  const tripStartDate = new Date(TRIP_START);
  const daysUntil = Math.floor((tripStartDate - today) / 86400000);
  if (daysUntil > 16) {
    const d = document.getElementById('weather-detail-content');
    if (d) d.innerHTML = '<div class="text-center py-8 text-slate-500 text-sm">旅行日期尚遠，天氣預報將於出發前 16 天內顯示</div>';
    return;
  }

  const dayPromises = tripDates.map(async (dateStr, idx) => {
    const loc = WEATHER_LOCATIONS[idx + 1];
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&start_date=${dateStr}&end_date=${dateStr}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.daily || !data.daily.time || data.daily.time.length === 0) return null;
      return {
        dateStr,
        location: loc.name,
        max: Math.round(data.daily.temperature_2m_max[0]),
        min: Math.round(data.daily.temperature_2m_min[0]),
        rain: data.daily.precipitation_probability_max[0] ?? 0,
        icon: weatherCodeToIcon(data.daily.weather_code[0]),
        current: data.current ? {
          temp: Math.round(data.current.temperature_2m),
          feels: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          icon: weatherCodeToIcon(data.current.weather_code)
        } : null
      };
    } catch(e) { return null; }
  });

  const results = await Promise.all(dayPromises);
  results.forEach(r => {
    if (r) window.weatherCache[r.dateStr] = { max: r.max, min: r.min, rain: r.rain, icon: r.icon, location: r.location, current: r.current };
  });

  if (window.AppHeader) window.AppHeader.render();
  if (window._lastActiveDay) {
    const dayData = winterItineraries.find(d => d.day === window._lastActiveDay);
    if (dayData) renderDayItinerary(`day-section-${dayData.day}`, dayData, true);
  }
  renderWeatherDetail();
}

function renderWeatherDetail() {
  const detail = document.getElementById('weather-detail-content');
  if (!detail) return;
  const today = new Date().toISOString().substring(0, 10);
  const todayIdx = tripDates.indexOf(today);
  const currentDayData = todayIdx >= 0 ? window.weatherCache[today] : null;
  const curLocName = todayIdx >= 0 ? WEATHER_LOCATIONS[todayIdx + 1].name : "宮城仙台";
  const curTemp = currentDayData?.current?.temp ?? (currentDayData ? Math.round((currentDayData.max + currentDayData.min) / 2) : null);
  const feels = currentDayData?.current?.feels ?? curTemp;
  const humidity = currentDayData?.current?.humidity ?? '--';
  const curIcon = currentDayData?.current?.icon ?? currentDayData?.icon ?? "⛅";

  let advice = { icon: "🧥", text: "防風外套即可" };
  if (curTemp === null) advice = { icon: "⏳", text: "天氣資料尚未取得" };
  else if (curTemp < -10) advice = { icon: "🥶", text: "極寒！羽絨 + 雪靴 + 毛帽 + 手套" };
  else if (curTemp < -5) advice = { icon: "❄️", text: "羽絨 + 雪靴 + 毛帽必備" };
  else if (curTemp < 0) advice = { icon: "🧣", text: "寒冷，圍巾 + 手套不可少" };

  const forecastRows = tripDates.map((ds, i) => {
    const w = window.weatherCache[ds];
    const d = new Date(ds);
    const week = ["日","一","二","三","四","五","六"][d.getDay()];
    const isToday = ds === today;
    const loc = WEATHER_LOCATIONS[i + 1].name;
    if (!w) return `<div class="forecast-row ${isToday ? 'today' : ''}"><div class="forecast-date">${isToday ? "今天" : ds.substring(5)} (${week})</div><div class="forecast-icon">⏳</div><div class="forecast-temp" style="color:#94a3b8;font-size:11px">${loc} · 暫無資料</div></div>`;
    return `<div class="forecast-row ${isToday ? 'today' : ''}"><div class="forecast-date">${isToday ? "今天" : ds.substring(5)} (${week})</div><div class="forecast-icon">${w.icon}</div><div class="forecast-temp"><span class="forecast-temp-max">${w.max}°</span><span class="text-slate-400 mx-1">/</span><span class="forecast-temp-min">${w.min}°</span><span style="font-size:10px;color:#94a3b8;margin-left:4px">${loc}</span></div><div class="forecast-rain">💧 ${w.rain}%</div></div>`;
  }).join('');

  detail.innerHTML = `
    <div class="weather-hero">
      <div class="weather-hero-icon">${curIcon}</div>
      <div>
        <div class="weather-hero-temp">${curTemp !== null ? curTemp + '°C' : '--'}</div>
        <div class="weather-hero-meta">${curTemp !== null ? `體感 ${feels}°C · 濕度 ${humidity}% · ${curLocName}` : curLocName}</div>
      </div>
    </div>
    <div class="weather-advice"><div class="weather-advice-icon">${advice.icon}</div><div class="weather-advice-text">${advice.text}</div></div>
    <div class="text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">7 天行程天氣預報</div>
    <div class="forecast-list">${forecastRows}</div>
  `;
}

// ==================== 行程速覽 ====================
function renderTripOverview() {
  const container = document.getElementById('overview-timeline-content'); if (!container) return;
  const days = [ { day: "D1", color: "#0ea5e9", emoji: "✈️", title: "抵達雪國", desc: "仙台機場 → 秋保溫泉 → 蟹腳 Buffet" }, { day: "D2", color: "#f59e0b", emoji: "🏮", title: "天童 + 銀山", desc: "AEON 天童 → 瀧之湯 → 銀山夜景" }, { day: "D3", color: "#6366f1", emoji: "☃️", title: "藏王樹冰", desc: "藏王纜車 → 樹冰 → 山形壽司 → 溫泉懷石" }, { day: "D4", color: "#10b981", emoji: "⛷️", title: "Spring Valley", desc: "玩雪 → 入住 Grand Bach → 伊達牛舌" }, { day: "D5", color: "#f43f5e", emoji: "🦊", title: "狐狸村", desc: "客美多早餐 → 狐狸村 → 白石溫麵" }, { day: "D6", color: "#14b8a6", emoji: "🐬", title: "水族館 / 採草莓", desc: "早餐 → 水族館或草莓 → 仔虎和牛 → Outlet" }, { day: "D7", color: "#475569", emoji: "✈️", title: "返港", desc: "仙台車站伴手禮 → 機場還車 → 起飛返港" } ];
  container.innerHTML = `<div class="overview-timeline">${days.map(d => `<div class="overview-day"><div class="overview-day-marker" style="background:${d.color}">${d.day}</div><div class="overview-day-content"><div class="overview-day-title">${d.emoji} ${d.title}</div><div class="overview-day-desc">${d.desc}</div></div></div>`).join('')}</div>`;
}

function toggleContent(day, index) { const wrapper = document.getElementById(`collapsible-${day}-${index}`); const btn = document.querySelector(`[data-expand-btn="${day}-${index}"]`); if (!wrapper) return; haptic(6); const isExpanded = wrapper.classList.toggle("expanded"); if (btn) { btn.classList.toggle("expanded", isExpanded); const label = btn.querySelector("span"); if (label) label.textContent = isExpanded ? "收合攻略" : "展開完整攻略"; } }

// ==================== 行程渲染 ====================
function buildTimePill(startTime, endTime) {
  var timeText = escapeHtml(startTime);
  var endText = (endTime && endTime !== '-') ? escapeHtml(endTime) : '';
  return '<div class="timeline-stamp">'
       +   '<span class="timeline-stamp-time">' + timeText + '</span>'
       +   (endText ? '<span class="timeline-stamp-end">– ' + endText + '</span>' : '')
       + '</div>';
}

function buildTagHtml(tag) {
  if (!tag || !tag.text) return '';
  return '<span class="tag">' + escapeHtml(tag.text) + '</span>';
}

function buildShootBtnHtml(day, index, eventTitle, shoppingCount) {
  var safeTitle = escAttr(eventTitle);
  var badge = '';
  if (shoppingCount > 0) {
    badge = ' <span class="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">' + shoppingCount + '</span>';
  }
  var html = '<div class="flex flex-wrap gap-1 mt-1">';
  html += '<button onclick="openShootTipsModal(' + day + ', ' + index + ')" class="text-[10px] bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold transition">🎬 拍攝靈感</button>';
  html += '<button onclick="openShoppingModal(this.dataset.eventTitle)" data-event-title="' + safeTitle + '" class="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold transition">🛍️ 購物清單' + badge + '</button>';
  html += '</div>';
  return html;
}

function buildEventImage(imgUrl, eventTitle) {
  if (!imgUrl) return '';
  var safeImg = escAttr(imgUrl);
  var safeAlt = escAttr(eventTitle);
  var html = '<div class="mt-2 rounded-xl overflow-hidden shadow-sm cursor-pointer" onclick="openLightbox([\'' + safeImg + '\'], 0)">';
  html += '<img src="' + safeImg + '" alt="' + safeAlt + '" width="400" height="128" class="lazy-fade w-full h-32 object-cover" loading="lazy" decoding="async" fetchpriority="low">';
  html += '</div>';
  return html;
}

function buildEventNavBtn(navUrl, eventTitle, navName) {
  var url = navUrl;
  if (!url && eventTitle) {
    url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(eventTitle);
  }
  if (!url) return '<div class="h-2"></div>';
  var label = navName || '景點';
  var html = '<a href="' + escAttr(url) + '" target="_blank" class="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold py-2 rounded-xl transition active:scale-95 shadow-sm mt-2 mb-2">';
  html += '<span>📍</span> 導航前往 ' + escapeHtml(label);
  html += '</a>';
  return html;
}

function renderDayItinerary(sectionId, dayData, force) {
  if (force === undefined) force = false;
  if (!force && window._renderedDays.has(dayData.day)) return;

  var section = document.getElementById(sectionId);
  if (!section) return;

  var dateStr = tripDates[dayData.day - 1];
  var weatherInfo = window.weatherCache[dateStr] || null;
  var weatherHtml = buildWeatherHtml(dateStr, weatherInfo);

  var headerHtml = buildDayHeaderHtml(dayData, weatherHtml);
  var eventsHtml = buildEventsHtml(dayData);
  var diaryHtml = buildDiaryHtml(dayData);

  section.innerHTML = '<div class="mb-8">' + headerHtml + '<div class="timeline">' + eventsHtml + '</div>' + diaryHtml + '</div>';

  setupImageFadeIn(section);
  setupEventImageLightbox(section);

  setTimeout(function() {
    updateExpandButtons(dayData);
    updateTimelineStatus();
    autoWrapMiniCards(dayData);   // ← 自動包裝迷你卡片
  }, 150);

  window._renderedDays.add(dayData.day);
}

function buildWeatherHtml(dateStr, weatherInfo) {
  if (!weatherInfo) return '';
  var icon = weatherInfo.icon;
  var max = weatherInfo.max;
  var min = weatherInfo.min;
  var rain = weatherInfo.rain;
  var location = weatherInfo.location || '';

  var advice = '🧥 偏涼，外套防風防水';
  if (min < -5) advice = '❄️ 極寒！羽絨+雪靴+毛帽必備';
  else if (min < 0) advice = '🧣 寒冷，圍巾手套不可少';
  if (rain > 50) advice = advice + '，攜帶雨具⚠️';

  var html = '<div class="mt-1 mb-2 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-lg px-2 py-1 flex items-center gap-1.5 text-[11px] text-slate-700 weather-card">';
  html += '<span class="text-base">' + icon + '</span>';
  html += '<span class="font-bold text-sky-700">' + dateStr.substring(5) + ' ' + location + ' 天氣：</span>';
  html += '<span>最高 ' + max + '° / 最低 ' + min + '°</span>';
  html += '<span class="text-slate-400">|</span>';
  html += '<span class="text-slate-500">💧 ' + rain + '%</span>';
  html += '<span class="ml-auto font-bold text-slate-600">' + advice + '</span>';
  html += '</div>';
  return html;
}

function buildDayHeaderHtml(dayData, weatherHtml) {
  var html = '<div class="bg-slate-50/95 py-2.5 mb-2 px-1 border-b border-slate-200/50 flex justify-between items-center">';
  html += '<div class="flex items-center gap-2.5">';
  html += '<div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center text-lg shadow-md shrink-0">' + dayData.emoji + '</div>';
  html += '<div class="flex-1">';
  html += '<span class="text-[11px] font-bold text-sky-600 tracking-wider">' + escapeHtml(dayData.dateLabel) + '</span>';
  html += '<h2 class="text-sm md:text-lg font-extrabold text-slate-800 leading-tight">' + escapeHtml(dayData.title) + '</h2>';
  if (dayData.subtitle) {
    html += '<p class="text-[10px] text-slate-500 mt-0.5">' + escapeHtml(dayData.subtitle) + '</p>';
  }
  html += weatherHtml;
  html += '</div></div>';
  html += '<button onclick="openVlogPlanModal(' + dayData.day + ')" class="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full shadow-sm shrink-0 ml-2">';
  html += '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.16 4h3.68a2 2 0 011.664.89l.812 1.22A2 2 0 0018 7h1a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
  html += '</button>';
  html += '</div>';
  return html;
}

function buildEventsHtml(dayData) {
  var html = '';
  for (var i = 0; i < dayData.events.length; i++) {
    html += buildSingleEventHtml(dayData, dayData.events[i], i);
  }
  return html;
}

function buildSingleEventHtml(dayData, event, index) {
  var isOpen = index === 0 ? 'open' : '';
  var timeParts = event.time.split(' - ');
  var startTime = timeParts[0].trim();
  var endTime = timeParts[1] ? timeParts[1].trim() : '';

  var shoppingItems = loadShoppingItems(event.title);
  var timeStamp = buildTimePill(startTime, endTime);
  var tagHtml = buildTagHtml(event.tag);
  var shootBtnHtml = buildShootBtnHtml(dayData.day, index, event.title, shoppingItems.length);
  var imageHtml = buildEventImage(event.img, event.title);
  var navBtnHtml = buildEventNavBtn(event.navUrl, event.title, event.navName);

  var html = '<div class="timeline-item" data-time="' + escapeHtml(startTime) + '" data-end-time="' + escapeHtml(endTime) + '" data-day="' + dayData.day + '">';

  html += '<div class="timeline-marker">';
  html +=   '<div class="timeline-node"></div>';
  html +=   timeStamp;
  html += '</div>';

  html += '<div class="timeline-card">';
  html += '<details ' + isOpen + ' data-day="' + dayData.day + '" data-index="' + index + '" class="group glass-card rounded-2xl relative overflow-hidden event-card">';
  html += '<div class="itinerary-cat-strip"></div>';

  html += '<summary class="flex items-start gap-3 p-3 cursor-pointer select-none hover:bg-slate-50/50 transition-colors relative list-none pl-5">';
  html += '<div class="flex-1 min-w-0 pr-8">';
  html += '<div class="flex flex-wrap items-center gap-2 mb-1">' + tagHtml + '</div>';
  html += '<h3 class="text-[13px] md:text-[15px] font-bold text-slate-800 leading-tight">' + escapeHtml(event.title) + '</h3>';
  html += shootBtnHtml;
  if (event.location) {
    html += '<div class="text-[11px] text-slate-500 mt-0.5">📍 ' + escapeHtml(event.location) + '</div>';
  }
  html += '</div>';
  html += '<div class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-open:rotate-180 transition-transform duration-300 border border-slate-100">';
  html += '<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
  html += '</div>';
  html += '</summary>';

  html += '<div class="event-content-wrapper p-3 pt-0 pb-4 border-t border-slate-50/80 bg-slate-50/30">';
  html += imageHtml;
  html += navBtnHtml;
  html += '<div class="event-collapsible" id="collapsible-' + dayData.day + '-' + index + '">' + event.content + '</div>';
  html += '<button type="button" class="expand-btn hidden" data-expand-btn="' + dayData.day + '-' + index + '" onclick="toggleContent(' + dayData.day + ', ' + index + ')">';
  html += '<span>展開完整攻略</span>';
  html += '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
  html += '</button>';
  html += '</div>';

  html += '</details>';
  html += '</div>';
  html += '</div>';
  return html;
}

function buildDiaryHtml(dayData) {
  var savedDiary = localStorage.getItem('diary_day_' + dayData.day + '_' + (currentUser || 'guest')) || '';
  var html = '<div class="mt-4 mb-6 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-3">';
  html += '<div class="flex items-center gap-2 mb-1.5">';
  html += '<span class="text-base">📖</span>';
  html += '<strong class="text-xs text-slate-800">今日旅行日記</strong>';
  html += '<button onclick="saveDiary(' + dayData.day + ')" class="ml-auto text-[10px] bg-sky-500 hover:bg-sky-600 text-white px-2 py-0.5 rounded font-bold transition">儲存</button>';
  html += '</div>';
  html += '<textarea id="diary-input-' + dayData.day + '" rows="2" placeholder="寫下今天最難忘的事…" class="w-full border border-slate-200 bg-white rounded-xl py-1.5 px-2.5 text-[11px] resize-none">' + escapeHtml(savedDiary) + '</textarea>';
  html += '</div>';
  return html;
}

function setupEventImageLightbox(section) {
  var wrappers = section.querySelectorAll('.event-content-wrapper');
  wrappers.forEach(function(wrapper) {
    var contentImgs = wrapper.querySelectorAll('.event-collapsible img');
    if (contentImgs.length === 0) return;
    var imageUrls = [];
    contentImgs.forEach(function(img) { imageUrls.push(img.src); });
    contentImgs.forEach(function(img, idx) {
      if (img.hasAttribute('onclick') || img.closest('a')) return;
      img.style.cursor = 'pointer';
      img.addEventListener('click', function() { openLightbox(imageUrls, idx); });
    });
  });
}

// ✅ 閾值從 300 提到 580，短內容直接全顯示
function updateExpandButtons(dayData) {
  dayData.events.forEach(function(_, index) {
    var wrapper = document.getElementById('collapsible-' + dayData.day + '-' + index);
    var btn = document.querySelector('[data-expand-btn="' + dayData.day + '-' + index + '"]');
    if (wrapper && btn) {
      if (wrapper.scrollHeight <= 580) {
        wrapper.classList.add('no-collapse');
        btn.classList.add('hidden');
      } else {
        wrapper.classList.remove('no-collapse');
        btn.classList.remove('hidden');
      }
    }
  });
}

// ============================================================
// 📦 自動把內容裡的彩色框包成折疊迷你卡片
// ============================================================
function autoWrapMiniCards(dayData) {
  dayData.events.forEach(function(_, index) {
    var wrapper = document.getElementById('collapsible-' + dayData.day + '-' + index);
    if (!wrapper) return;

    var contentDiv = wrapper.querySelector(':scope > div');
    if (!contentDiv) return;

    var colorClasses = ['bg-amber', 'bg-sky', 'bg-indigo', 'bg-emerald', 'bg-teal', 'bg-rose', 'bg-slate', 'bg-white'];
    var sections = Array.from(contentDiv.children).filter(function(el) {
      if (el.tagName !== 'DIV') return false;
      // ✅ 只排除「已在嵌套 details 內」的元素（data.js 寫死的 details）
      // 不能排除最外層的 details.event-card
      if (el.parentElement && el.parentElement.closest('details:not(.event-card)')) return false;
      if (el.classList.contains('mini-card')) return false;
      var cls = el.className || '';
      return colorClasses.some(function(c) { return cls.indexOf(c) > -1; });
    });

    sections.forEach(function(section) {
      var titleEl = section.querySelector('strong, h3, h4');
      if (!titleEl) return;

      var emoji = '';
      var firstText = titleEl.textContent.trim();
      var emojiMatch = firstText.match(/^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+)\s*/u);
      if (emojiMatch) {
        emoji = emojiMatch[1];
      }

      var details = document.createElement('details');
      details.className = 'mini-card';

      var summary = document.createElement('summary');
      summary.className = 'mini-card-summary';

      if (emoji) {
        var iconEl = document.createElement('span');
        iconEl.className = 'mini-card-icon';
        iconEl.textContent = emoji;
        summary.appendChild(iconEl);
      }

      var titleSpan = document.createElement('span');
      titleSpan.className = 'mini-card-title';
      var cleanTitle = firstText.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+\s*/u, '').trim();
      titleSpan.textContent = cleanTitle;
      summary.appendChild(titleSpan);

      var body = document.createElement('div');
      body.className = 'mini-card-body';

      titleEl.remove();

      while (section.firstChild) {
        body.appendChild(section.firstChild);
      }

      details.appendChild(summary);
      details.appendChild(body);

      section.parentNode.replaceChild(details, section);
    });
  });
}

function saveDiary(day) { const input = document.getElementById(`diary-input-${day}`); if (input) { localStorage.setItem(`diary_day_${day}_${currentUser || 'guest'}`, input.value); showToast("📖 日記已儲存！", "✅"); haptic(10); } }

function collapseAllItineraries() {
  const details = document.querySelectorAll('details.event-card[open]');
  const btnIcon = document.getElementById('collapse-icon');
  const btnText = document.getElementById('collapse-text');
  haptic(8);
  if (details.length > 0) {
    details.forEach(detail => detail.open = false);
    if (btnIcon) btnIcon.textContent = '⬆️';
    if (btnText) btnText.textContent = '展開';
    showToast("✅ 已收合所有行程", "⬇️");
  } else {
    document.querySelectorAll('details.event-card').forEach(detail => detail.open = true);
    if (btnIcon) btnIcon.textContent = '⬇️';
    if (btnText) btnText.textContent = '收合';
    showToast("✅ 已展開所有行程", "⬆️");
  }
}
window.collapseAllItineraries = collapseAllItineraries;

// ==================== 燈箱 ====================
let lightboxImages = [], lightboxIndex = 0;
function openLightbox(images, index) { lightboxImages = images || []; lightboxIndex = index || 0; const lb = document.getElementById("lightbox"); const img = document.getElementById("lightbox-img"); if (lightboxImages.length === 0) return; img.src = lightboxImages[lightboxIndex]; document.getElementById("lightbox-caption").innerText = `${lightboxIndex + 1} / ${lightboxImages.length}`; lb.classList.add("active"); document.body.style.overflow = "hidden"; }
function closeLightbox() { document.getElementById("lightbox").classList.remove("active"); document.body.style.overflow = ""; }
function changeLightbox(d) { lightboxIndex += d; if (lightboxIndex < 0) lightboxIndex = lightboxImages.length - 1; if (lightboxIndex >= lightboxImages.length) lightboxIndex = 0; document.getElementById("lightbox-img").src = lightboxImages[lightboxIndex]; document.getElementById("lightbox-caption").innerText = `${lightboxIndex + 1} / ${lightboxImages.length}`; }
let touchStartX = 0;
const lightboxEl = document.getElementById("lightbox");
if (lightboxEl) { lightboxEl.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true }); lightboxEl.addEventListener("touchend", e => { const diff = touchStartX - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) changeLightbox(diff > 0 ? 1 : -1); }, { passive: true }); }

// ==================== 歡迎/角色 ====================
function closeWelcomeModal(skipForever = false) { const m = document.getElementById("welcome-modal"); if (m) { m.style.opacity = "0"; setTimeout(() => { m.style.display = "none"; }, 300); } if (skipForever) localStorage.setItem("tohoku_welcome_dismissed", "true"); haptic(10); }
function checkWelcomeModal() { if (localStorage.getItem("tohoku_welcome_dismissed") === "true") { const m = document.getElementById("welcome-modal"); if (m) m.style.display = "none"; } }
let characterTimeout = null;

function spawnCharacters() {
  clearTimeout(characterTimeout);
  const s = document.getElementById('snowman'), f = document.getElementById('fox');
  if (!s || !f) return;

  if (document.hidden) {
    characterTimeout = setTimeout(spawnCharacters, 8000);
    return;
  }

  s.classList.remove('show', 'greet'); f.classList.remove('show', 'greet');
  s.classList.add('hide'); f.classList.add('hide');
  if (Math.random() < 0.5) {
    characterTimeout = setTimeout(spawnCharacters, Math.random() * 8000 + 8000);
    return;
  }
  const c = Math.random() < 0.5 ? s : f;
  c.classList.remove('hide'); c.classList.add('show');
  setTimeout(() => c.classList.add('greet'), 600);
  characterTimeout = setTimeout(() => {
    c.classList.remove('show', 'greet'); c.classList.add('hide');
    setTimeout(spawnCharacters, Math.random() * 8000 + 6000);
  }, 3500);
}
function jump(id) { const c = document.getElementById(id); if (c) { c.classList.add('jumping'); setTimeout(() => c.classList.remove('jumping'), 600); haptic(10); if (id === 'snowman') { snowmanProgress = Math.min(snowmanProgress + 1, 5); localStorage.setItem("snowman_progress", JSON.stringify(snowmanProgress)); updateSnowmanVisual(); snowParticles(); showToast(`雪人成長度：${snowmanProgress}/5！`, "⛄"); } else showToast(`你點了一下狐狸！`, "🦊"); } }
function updateSnowmanVisual() { const s = document.getElementById("snowman"); if (!s) return; let color = "#ef4444"; if (snowmanProgress >= 1) color = "#f97316"; if (snowmanProgress >= 2) color = "#facc15"; if (snowmanProgress >= 3) color = "#4ade80"; if (snowmanProgress >= 4) color = "#38bdf8"; if (snowmanProgress >= 5) color = "#a78bfa"; const hp = s.querySelector('#hatGrad stop:first-child'); if (hp) hp.setAttribute('stop-color', color); }
function initRandomCharacters() { setTimeout(spawnCharacters, 2000); }
function snowParticles() { const p = document.createElement("div"); p.className = "particle"; const colors = ["#ffffff", "#e0f2fe", "#bae6fd", "#38bdf8", "#a78bfa"]; for (let i = 0; i < 30; i++) { const el = document.createElement("div"); el.style.width = `${Math.random() * 10 + 5}px`; el.style.height = el.style.width; el.style.background = colors[Math.floor(Math.random() * colors.length)]; el.style.left = `${Math.random() * 100}vw`; el.style.top = `${Math.random() * 20 - 10}vh`; el.style.opacity = Math.random(); el.style.animation = `snowfall ${Math.random() * 3 + 2}s linear forwards`; p.appendChild(el); } document.body.appendChild(p); setTimeout(() => p.remove(), 5000); }

// ==================== 儲存 ====================
function saveLocalCheckedItems() { localStorage.setItem("tohoku_checked_items", JSON.stringify(state.checkedItems)); localStorage.setItem("custom_booking_items", JSON.stringify(customBookingItems)); }
function saveCustomItems() { localStorage.setItem("custom_booking_items", JSON.stringify(customBookingItems)); }
function loadCustomItems() { const b = localStorage.getItem("custom_booking_items"); if (b) { try { customBookingItems = JSON.parse(b); } catch(e) {} } }
function restoreChecklistUI() { renderBookingChecklist(); renderEquipChecklist(); renderAllShoppingContent(); }

// ==================== 雪花 ====================
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
      sf.querySelectorAll('.snowflake').forEach(el => {
        el.style.animationPlayState = state;
      });
    });
  }
}

// ==================== Modal 開關 ====================
function showModal(id) { const overlay = document.getElementById(id); if (overlay) { overlay.classList.add('active'); overlay.style.display = 'flex'; document.body.style.overflow = 'hidden'; document.body.classList.add('modal-open'); haptic(8); } }
function hideModal(id) { const overlay = document.getElementById(id); if (overlay) { overlay.classList.remove('active'); setTimeout(() => { overlay.style.display = 'none'; }, 300); const anyOpen = document.querySelector('.modal-overlay.active'); if (!anyOpen) { document.body.style.overflow = ''; document.body.classList.remove('modal-open'); } } }
function toggleBookingModal() { const modal = document.getElementById('booking-modal'); if (modal.classList.contains('hidden')) { showModal('booking-modal'); modal.classList.remove('hidden'); renderBookingChecklist(); } else { hideModal('booking-modal'); setTimeout(() => modal.classList.add('hidden'), 300); } }
function closeBookingModal() { hideModal('booking-modal'); setTimeout(() => document.getElementById('booking-modal').classList.add('hidden'), 300); }
function toggleEquipModal() { const modal = document.getElementById('equip-modal'); if (modal.classList.contains('hidden')) { showModal('equip-modal'); modal.classList.remove('hidden'); renderEquipChecklist(); } else { hideModal('equip-modal'); setTimeout(() => modal.classList.add('hidden'), 300); } }
function closeEquipModal() { hideModal('equip-modal'); setTimeout(() => document.getElementById('equip-modal').classList.add('hidden'), 300); }
function toggleDriveModal() { const modal = document.getElementById('drive-modal'); if (modal.classList.contains('hidden')) { showModal('drive-modal'); modal.classList.remove('hidden'); setDriveTab('basic'); } else { hideModal('drive-modal'); setTimeout(() => modal.classList.add('hidden'), 300); } }
function closeDriveModal() { hideModal('drive-modal'); setTimeout(() => document.getElementById('drive-modal').classList.add('hidden'), 300); }
function toggleTicketModal() { const modal = document.getElementById('ticket-modal'); if (modal.classList.contains('hidden')) { showModal('ticket-modal'); modal.classList.remove('hidden'); renderTicketContent(); if (window._ticketTimer) clearInterval(window._ticketTimer); window._ticketTimer = setInterval(() => { if (!modal.classList.contains('hidden')) renderTicketContent(); else clearInterval(window._ticketTimer); }, 1000); } else { hideModal('ticket-modal'); setTimeout(() => modal.classList.add('hidden'), 300); if (window._ticketTimer) clearInterval(window._ticketTimer); } }
function closeTicketModal() { hideModal('ticket-modal'); setTimeout(() => document.getElementById('ticket-modal').classList.add('hidden'), 300); if (window._ticketTimer) clearInterval(window._ticketTimer); }
function openTripOverview() { const m = document.getElementById('trip-overview-modal'); if (m) { m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); renderTripOverview(); } }
function closeTripOverview() { const m = document.getElementById('trip-overview-modal'); if (m) { m.classList.remove('active'); setTimeout(() => { m.style.display = 'none'; }, 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); } }
function openWeatherModal() { const modal = document.getElementById('weather-modal'); showModal('weather-modal'); modal.classList.remove('hidden'); document.getElementById('weather-detail-content').innerHTML = ''; fetchWeatherData(); }
function closeWeatherModal() { hideModal('weather-modal'); setTimeout(() => document.getElementById('weather-modal').classList.add('hidden'), 300); }

// ==================== 雪地攻略 ====================
let driveTabState = 'basic';
function setDriveTab(tab) { driveTabState = tab; haptic(6); document.querySelectorAll('[data-drive-tab]').forEach(btn => { btn.classList.toggle('active', btn.dataset.driveTab === tab); }); renderDriveContent(); }
function renderDriveContent() { const container = document.getElementById('drive-content'); if (!container) return; const data = { basic: [ { title: "全程使用 4WD + 雪胎", desc: "出發前確認車輛配置，並檢查雪胎深度（建議 ≥ 5mm）與胎壓", type: "success" }, { title: "保持 3 秒以上車距", desc: "雪地煞車距離約為乾地的 3-5 倍", type: "success" }, { title: "避免急煞、急加速、急轉彎", desc: "所有動作放慢 2 倍", type: "warn" }, { title: "下坡善用低速檔", desc: "用引擎煞車取代腳踩煞車", type: "success" }, { title: "轉彎前先減速", desc: "彎中不踩煞車", type: "warn" } ], road: [ { title: "Black Ice 最危險", desc: "看似乾燥的柏油路面其實結冰", type: "danger" }, { title: "橋樑與陰影處優先結冰", desc: "通過前先減速", type: "warn" }, { title: "山區連續彎道", desc: "減速至 20-30 km/h", type: "warn" }, { title: "除雪車後方保持距離", desc: "保持 50m 以上距離", type: "success" }, { title: "隧道兩端注意", desc: "進出時提前減速", type: "warn" } ], emergency: [ { title: "備用保暖衣物與毯子", desc: "保暖是第一優先", type: "success" }, { title: "行動電源 2 個 + 車充", desc: "手機沒電等於失去導航", type: "success" }, { title: "食物與飲水", desc: "餅乾、巧克力、保溫瓶裝熱水", type: "success" }, { title: "小鏟子 + 拖車繩 + 三角牌", desc: "車輪陷入雪中時可自救", type: "success" }, { title: "緊急聯絡資訊", desc: "日本道路緊急電話 #9910", type: "warn" } ] }; const items = data[driveTabState] || []; container.innerHTML = items.map((item, i) => `<div class="numbered-card ${item.type}" style="margin-bottom:8px"><div class="numbered-index">${i + 1}</div><div class="numbered-content"><div class="numbered-title">${item.title}</div><div class="numbered-desc">${item.desc}</div></div></div>`).join(''); }

// ==================== 搶票攻略 ====================
function renderTicketContent() { const container = document.getElementById('ticket-content'); if (!container) return; const now = Date.now(); const ginzanDiff = GINZAN_TARGET - now; const zaoDiff = ZAO_TARGET - now; function formatCountdown(ms) { if (ms <= 0) return '🎉 已開賣'; const days = Math.floor(ms / 86400000); const hours = Math.floor((ms % 86400000) / 3600000); const minutes = Math.floor((ms % 3600000) / 60000); if (days > 0) return `${days}天 ${hours}時 ${minutes}分`; if (hours > 0) return `${hours}時 ${minutes}分`; return `${minutes}分`; } container.innerHTML = `<div class="ticket-card"><div class="ticket-header"><div class="ticket-title"><span>🎟️</span> 銀山溫泉 Fast Pass</div><span class="ticket-badge">首選方案</span></div><div class="ticket-countdown-row"><span class="ticket-countdown-label">倒數</span><span class="ticket-countdown">${formatCountdown(ginzanDiff)}</span></div><div class="ticket-meta"><div class="ticket-meta-item"><div class="label">開賣時間</div><div class="value">1/8 香港 23:00</div></div><div class="ticket-meta-item"><div class="label">目標</div><div class="value">4 張成人票</div></div><div class="ticket-meta-item"><div class="label">價格</div><div class="value">¥1,500 / 人</div></div><div class="ticket-meta-item"><div class="label">平台</div><div class="value">Asoview!</div></div></div><div class="ticket-steps"><div class="ticket-step"><div class="ticket-step-dot">1</div><span>提前註冊 Asoview! 帳號並綁定信用卡</span></div><div class="ticket-step"><div class="ticket-step-dot">2</div><span>1/8 22:55 設定鬧鐘，提前 5 分鐘登入</span></div><div class="ticket-step"><div class="ticket-step-dot">3</div><span>開賣後直接鎖定 15:30-19:15 時段</span></div></div></div><div class="ticket-card zao"><div class="ticket-header"><div class="ticket-title"><span>🚠</span> 藏王纜車優先票</div><span class="ticket-badge">必搶</span></div><div class="ticket-countdown-row"><span class="ticket-countdown-label">倒數</span><span class="ticket-countdown">${formatCountdown(zaoDiff)}</span></div><div class="ticket-meta"><div class="ticket-meta-item"><div class="label">開賣時間</div><div class="value">1/15 香港 23:00</div></div><div class="ticket-meta-item"><div class="label">目標</div><div class="value">成人 2 + 兒童 2</div></div><div class="ticket-meta-item"><div class="label">價格</div><div class="value">¥5,500 / ¥3,500</div></div><div class="ticket-meta-item"><div class="label">平台</div><div class="value">Asoview! / 官網</div></div></div><div class="ticket-steps"><div class="ticket-step"><div class="ticket-step-dot">1</div><span>系統於搭乘日前 7 天日本時間 00:00 釋出</span></div><div class="ticket-step"><div class="ticket-step-dot">2</div><span>開賣後鎖定 <strong>08:30 或 09:00</strong> 最早時段</span></div><div class="ticket-step"><div class="ticket-step-dot">3</div><span>週六優先票通常 <strong>5 分鐘內秒殺</strong></span></div></div></div>`; }

// ==================== 拍攝靈感 ====================
function openShootTipsModal(day, eventIndex) { const dayData = winterItineraries.find(d => d.day === day); if (!dayData) return; const event = dayData.events[eventIndex]; if (!event) return; const tips = shootTips[event.title]; const content = document.getElementById("shoot-tips-content"); let html = ""; if (tips) { const pa = tips["拍照建議"] || ""; html += `<div class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-orange-800 mb-2">📷 拍照建議</h3><p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(pa)}</p></div>`; if (tips["參考照片"] && tips["參考照片"].length > 0) { const imgHtml = tips["參考照片"].map(url => `<img src="${escAttr(url)}" class="lazy-fade w-32 h-24 object-cover rounded-lg cursor-pointer border border-slate-200" onclick="openLightbox(['${escAttr(url)}'], 0)" loading="lazy" decoding="async">`).join(""); html += `<div class="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-pink-800 mb-2">📷 參考照片</h3><div class="flex gap-2 overflow-x-auto scrollbar-none pb-2">${imgHtml}</div></div>`; } html += `<details class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3"><summary class="cursor-pointer text-sm font-black text-slate-700 mb-2">📸 展開詳細拍攝建議</summary><div class="space-y-3 mt-2">`; if (tips["Pocket 3 參數"]) html += `<div class="bg-sky-50 border border-sky-200 rounded-xl p-3"><h3 class="text-sm font-black text-sky-800 mb-1">📸 Pocket 3 參數</h3><p class="text-sm text-slate-700">${escapeHtml(tips["Pocket 3 參數"])}</p></div>`; if (tips["Vlog 必拍鏡頭"] && tips["Vlog 必拍鏡頭"].length > 0) html += `<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3"><h3 class="text-sm font-black text-emerald-800 mb-2">🎬 Vlog 必拍鏡頭</h3><ul class="list-disc pl-4 space-y-1">${tips["Vlog 必拍鏡頭"].map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`; if (tips["最佳拍攝時間"] || tips["拍攝時長"]) { let ti = ""; if (tips["最佳拍攝時間"]) ti += `<span class="block mb-1">⏰ ${escapeHtml(tips["最佳拍攝時間"])}</span>`; if (tips["拍攝時長"]) ti += `<span class="block">⏳ ${escapeHtml(tips["拍攝時長"])}</span>`; html += `<div class="bg-amber-50 border border-amber-200 rounded-xl p-3"><h3 class="text-sm font-black text-amber-800 mb-2">⏱️ 拍攝時間建議</h3><p class="text-sm text-slate-700">${ti}</p></div>`; } if (tips["拍攝角度"] && tips["拍攝角度"].length > 0) html += `<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3"><h3 class="text-sm font-black text-indigo-800 mb-2">🎯 拍攝角度</h3><ul class="list-disc pl-4 space-y-1">${tips["拍攝角度"].map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`; if (tips["人物動作建議"] && tips["人物動作建議"].length > 0) html += `<div class="bg-rose-50 border border-rose-200 rounded-xl p-3"><h3 class="text-sm font-black text-rose-800 mb-2">🧍 人物動作建議</h3><ul class="list-disc pl-4 space-y-1">${tips["人物動作建議"].map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`; html += `</div></details>`; } else { html = `<div class="text-center py-8 text-slate-500 text-sm">暫時沒有這個景點的拍攝建議。</div>`; } content.innerHTML = html; showModal('shoot-tips-modal'); document.getElementById('shoot-tips-modal').classList.remove('hidden'); setTimeout(() => setupImageFadeIn(content), 50); }
function closeShootTipsModal() { hideModal('shoot-tips-modal'); setTimeout(() => document.getElementById('shoot-tips-modal').classList.add('hidden'), 300); }
function openCommonTipsModal() { const m = document.getElementById('common-tips-modal'); if (!m) return; m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); const c = document.getElementById('common-tips-content'); if (c && typeof shootTipsCommon !== 'undefined') { let html = ''; Object.keys(shootTipsCommon).forEach(title => { const tips = shootTipsCommon[title]; html += `<div class="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-4"><h3 class="text-sm font-black text-slate-800 mb-2">${escapeHtml(title)}</h3>`; if (tips['拍照建議']) html += `<div class="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-2 text-xs text-slate-700"><strong class="text-sky-800 block mb-1">📷 拍照建議</strong>${escapeHtml(tips['拍照建議'])}</div>`; html += `</div>`; }); c.innerHTML = html; } }
function closeCommonTipsModal() { const m = document.getElementById('common-tips-modal'); if (m) { m.classList.remove('active'); setTimeout(() => m.style.display = 'none', 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); } }

// ==================== Vlog 構思 ====================
function openVlogPlanModal(day) { const plan = vlogPlan["D" + day]; const content = document.getElementById("vlog-plan-content"); let html = ""; if (plan) { if (plan["整支Vlog構思"]) html += `<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-indigo-800 mb-2">🎬 整支 Vlog 構思</h3><p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(plan["整支Vlog構思"])}</p></div>`; if (plan["人物構圖"]) html += `<div class="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-sky-800 mb-2">🧍 人物構圖</h3><ul class="list-disc pl-4 space-y-1">${plan["人物構圖"].map(i=>`<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`; if (plan["風景構圖"]) html += `<div class="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-teal-800 mb-2">🏞️ 風景構圖</h3><ul class="list-disc pl-4 space-y-1">${plan["風景構圖"].map(i=>`<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`; } else { html = `<div class="text-center py-8 text-slate-500 text-sm">暫時未填寫今天的 Vlog 構思。</div>`; } content.innerHTML = html; showModal('vlog-plan-modal'); document.getElementById('vlog-plan-modal').classList.remove('hidden'); }
function closeVlogPlanModal() { hideModal('vlog-plan-modal'); setTimeout(() => document.getElementById('vlog-plan-modal').classList.add('hidden'), 300); }

// ==================== 記帳本 ====================
function openLedgerAdd() { const lc = document.getElementById('ledger-frame-container'); const iframe = document.getElementById('ledger-iframe'); if (lc && iframe) { haptic(12); lc.classList.remove('hidden-view'); lc.style.cssText = 'position: fixed; inset: 0; z-index: 9990; background: #f8fafc; overflow: auto;'; let attempts = 0; const tryOpen = () => { if (iframe.contentWindow && iframe.contentWindow.openExpenseModal) { iframe.contentWindow.openExpenseModal(); } else if (attempts < 10) { attempts++; setTimeout(tryOpen, 200); } else { showToast('記帳本載入失敗', '⚠️'); } }; tryOpen(); } }

// ==================== 切換 Day ====================
function switchDay(day) {
  window._lastActiveDay = day;
  haptic(6);

  const dayData = winterItineraries.find(d => d.day === day);
  if (dayData && !window._renderedDays.has(day)) {
    renderDayItinerary(`day-section-${day}`, dayData);
  }

  document.querySelectorAll("#day-tabs-container button").forEach(btn => { btn.className = "day-tab flex-shrink-0 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition"; });
  const activeTab = document.getElementById("tab-d" + day);
  if (activeTab) activeTab.className = "day-tab active flex-shrink-0 transition";

  document.querySelectorAll(".day-section").forEach(s => s.classList.add("hidden"));
  const targetSection = document.getElementById("day-section-" + day);
  if (targetSection) {
    targetSection.classList.remove("hidden");
    targetSection.style.opacity = '0';
    targetSection.style.transform = 'translateY(8px)';
    requestAnimationFrame(() => {
      targetSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      targetSection.style.opacity = '1';
      targetSection.style.transform = 'translateY(0)';
    });
  }
  setTimeout(updateTimelineStatus, 50);
}

// ==================== Service Worker ====================
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').then(reg => { reg.update(); reg.addEventListener('updatefound', () => { const newWorker = reg.installing; if (!newWorker) return; newWorker.addEventListener('statechange', () => { if (newWorker.state === 'installed' && navigator.serviceWorker.controller) { showUpdateAvailable(newWorker); } }); }); setInterval(() => reg.update().catch(() => {}), 60 * 1000); }).catch(err => console.log('SW failed:', err)); }); let refreshing = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; window.location.reload(); }); }
function showUpdateAvailable(worker) { const toast = document.getElementById("toast"); const m = document.getElementById("toast-message"); const i = document.getElementById("toast-icon"); if (!toast || !m || !i) return; const oldUpdateBtn = document.getElementById("update-btn"); if (oldUpdateBtn) oldUpdateBtn.remove(); i.innerText = "✨"; m.innerText = "有新版本可用"; const btn = document.createElement("button"); btn.id = "update-btn"; btn.className = "ml-2 bg-white/20 hover:bg-white/30 active:scale-95 px-2.5 py-1 rounded-lg text-[11px] font-black transition shrink-0 pointer-events-auto"; btn.textContent = "立即更新"; btn.onclick = (e) => { e.stopPropagation(); worker.postMessage({ type: 'SKIP_WAITING' }); btn.textContent = "更新中..."; btn.disabled = true; haptic(15); }; toast.appendChild(btn); toast.classList.remove("-translate-y-24", "opacity-0"); toast.classList.add("translate-y-0", "opacity-100"); }
window.addEventListener('message', (event) => { if (event.data && event.data.type === 'closeExpenseModal') { const lc = document.getElementById('ledger-frame-container'); if (lc) { lc.style.cssText = ''; if (state.currentMainTab === 'ledger') { lc.classList.remove('hidden-view'); lc.classList.add('view-active'); } else { lc.classList.add('hidden-view'); lc.classList.remove('view-active'); } } } });

// ==================== 雲端同步輔助 ====================
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

  const FAB_SIZE = 56;
  const PADDING = 12;
  const SAFE_TOP = 12;
  const SAFE_BOTTOM = 88;
  const MOVE_THRESHOLD = 6;
  const STORAGE_KEY = 'tohoku_currency_fab_pos';

  let isDragging = false;
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;
  let moved = false;
  let hasCustomPosition = false;

  function getBounds() {
    return {
      minX: PADDING,
      maxX: window.innerWidth - FAB_SIZE - PADDING,
      minY: SAFE_TOP,
      maxY: window.innerHeight - SAFE_BOTTOM - FAB_SIZE
    };
  }
  function clampPosition(x, y) {
    const b = getBounds();
    return {
      x: Math.max(b.minX, Math.min(b.maxX, x)),
      y: Math.max(b.minY, Math.min(b.maxY, y))
    };
  }
  function switchToAbsolutePosition() {
    if (hasCustomPosition) return;
    const rect = fab.getBoundingClientRect();
    currentX = rect.left;
    currentY = rect.top;
    fab.style.left = currentX + 'px';
    fab.style.top = currentY + 'px';
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
    hasCustomPosition = true;
  }
  function setPosition(x, y) {
    currentX = x;
    currentY = y;
    fab.style.left = x + 'px';
    fab.style.top = y + 'px';
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
    hasCustomPosition = true;
  }
  function getStoredPosition() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const pos = JSON.parse(saved);
        if (typeof pos.x === 'number' && typeof pos.y === 'number') return pos;
      }
    } catch (e) {}
    return null;
  }
  function savePosition(x, y) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y })); } catch(e) {}
  }
  function initPosition() {
    const stored = getStoredPosition();
    if (stored) {
      const pos = clampPosition(stored.x, stored.y);
      setPosition(pos.x, pos.y);
    } else {
      const rect = fab.getBoundingClientRect();
      currentX = rect.left;
      currentY = rect.top;
    }
  }
  function snapToEdge() {
    switchToAbsolutePosition();
    const centerX = currentX + FAB_SIZE / 2;
    const snapLeft = centerX < window.innerWidth / 2;
    const targetX = snapLeft ? PADDING : window.innerWidth - FAB_SIZE - PADDING;
    const clamped = clampPosition(targetX, currentY);
    fab.classList.add('snapping');
    setPosition(clamped.x, clamped.y);
    savePosition(clamped.x, clamped.y);
    setTimeout(() => fab.classList.remove('snapping'), 380);
    haptic(8);
  }

  fab.addEventListener('pointerdown', (e) => {
    isDragging = true;
    moved = false;
    switchToAbsolutePosition();
    startX = e.clientX;
    startY = e.clientY;
    fab.classList.add('dragging');
    try { fab.setPointerCapture(e.pointerId); } catch(err) {}
  });

  fab.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
      moved = true;
    }
    if (moved) {
      const clamped = clampPosition(currentX + dx, currentY + dy);
      setPosition(clamped.x, clamped.y);
      startX = e.clientX;
      startY = e.clientY;
    }
  });

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    fab.classList.remove('dragging');
    try { fab.releasePointerCapture(e.pointerId); } catch(err) {}
    if (moved) {
      snapToEdge();
    } else {
      if (typeof window.openCurrencyModal === 'function') window.openCurrencyModal();
      haptic(10);
    }
  }
  fab.addEventListener('pointerup', onPointerUp);
  fab.addEventListener('pointercancel', (e) => {
    if (!isDragging) return;
    isDragging = false;
    fab.classList.remove('dragging');
    try { fab.releasePointerCapture(e.pointerId); } catch(err) {}
    if (moved) snapToEdge();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!hasCustomPosition) return;
      const clamped = clampPosition(currentX, currentY);
      setPosition(clamped.x, clamped.y);
      savePosition(clamped.x, clamped.y);
    }, 150);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { initPosition(); });
  });

  const HINT_KEY = 'tohoku_fab_hint_shown';
  if (!localStorage.getItem(HINT_KEY)) {
    setTimeout(() => {
      const hint = document.createElement('div');
      hint.className = 'currency-fab-hint';
      hint.textContent = '💡 可拖動我，點擊開啟匯率';
      document.body.appendChild(hint);
      const rect = fab.getBoundingClientRect();
      hint.style.left = Math.max(12, Math.min(rect.left - 60, window.innerWidth - 200)) + 'px';
      hint.style.top = (rect.top - 44) + 'px';
      requestAnimationFrame(() => hint.classList.add('show'));
      setTimeout(() => {
        hint.classList.remove('show');
        setTimeout(() => hint.remove(), 400);
      }, 3500);
      localStorage.setItem(HINT_KEY, '1');
    }, 2000);
  }
})();