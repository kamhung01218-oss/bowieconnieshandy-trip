/* ============================================================
 * ledger.js — 隨行記帳本主邏輯 v2.5（主題同步）
 * ============================================================ */
'use strict';

/* ============================================================
 * 一、通用工具
 * ============================================================ */
function haptic(ms = 10) { if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } }
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function escAttr(str) { return escapeHtml(str); }
function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

/* ============================================================
 * 二、權限
 * ============================================================ */
function getCurrentUser() {
  try {
    if (window.parent && window.parent !== window && window.parent.currentUser) {
      const pu = window.parent.currentUser;
      if (pu && pu !== "訪客") return pu;
    }
  } catch (e) {}
  const u = localStorage.getItem("tohoku_current_user");
  return (u && u !== "訪客") ? u : null;
}
function canWrite() { return !!getCurrentUser(); }
function ensureWriteAccess(actionFn) {
  if (canWrite()) actionFn();
  else showToast("🔒 請先登入身份才能修改", "⚠️");
}

/* ============================================================
 * 三、危險操作密碼
 * ============================================================ */
const DANGEROUS_PASSWORD = "admin2027";
let _pendingDangerousAction = null;
function ensureDangerousAccess(actionFn, title, desc) {
  if (!canWrite()) { showToast("🔒 請先登入身份", "⚠️"); return; }
  _pendingDangerousAction = actionFn;
  document.getElementById('dangerous-password-title').textContent = title || '敏感操作驗證';
  document.getElementById('dangerous-password-desc').textContent = desc || '此操作需要管理員密碼，請輸入以繼續。';
  document.getElementById('dangerous-password-modal').classList.remove('hidden');
  document.getElementById('dangerous-password-error').classList.add('hidden');
  document.getElementById('dangerous-password-input').value = '';
  setTimeout(() => document.getElementById('dangerous-password-input').focus(), 100);
}
function closeDangerousPasswordModal() {
  document.getElementById('dangerous-password-modal').classList.add('hidden');
  _pendingDangerousAction = null;
}
function verifyDangerousPassword() {
  const input = document.getElementById('dangerous-password-input').value.trim();
  if (input === DANGEROUS_PASSWORD) {
    document.getElementById('dangerous-password-modal').classList.add('hidden');
    showToast('✅ 驗證成功'); haptic(15);
    if (_pendingDangerousAction) { const a = _pendingDangerousAction; _pendingDangerousAction = null; a(); }
  } else {
    document.getElementById('dangerous-password-error').classList.remove('hidden');
    document.getElementById('dangerous-password-input').value = '';
    haptic(50);
  }
}

/* ============================================================
 * 四、Firebase 初始化
 * ============================================================ */
const firebaseConfig = (function() {
  try {
    if (window.parent && window.parent !== window && window.parent.FIREBASE_CONFIG) return window.parent.FIREBASE_CONFIG;
  } catch (e) {}
  return {
    apiKey: "AIzaSyC0VQQWW0HQCd8CG8EuAN-kqnGirZHJ__E",
    authDomain: "tohoku-winter-trip.firebaseapp.com",
    projectId: "tohoku-winter-trip",
    storageBucket: "tohoku-winter-trip.firebasestorage.app",
    messagingSenderId: "991555590088",
    appId: "1:991555590088:web:afb089890d7d546821d2fd",
    measurementId: "G-9EN9JG5F3F"
  };
})();
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
window.db = db;
window.dbRef = db.collection("tohoku_trip").doc("shared_expenses");

/* ============================================================
 * 五、匯率
 * ============================================================ */
const DEFAULT_RATES = { JPY: 0.052, HKD: 1, TWD: 0.24, CNY: 1.1, USD: 7.8 };
let exchangeRates = { ...DEFAULT_RATES };
const RATES_UPDATE_INTERVAL = 24 * 60 * 60 * 1000;
let rateFetchAttempts = 0;
async function fetchLiveRates() {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/JPY');
    const d = await r.json();
    if (d && d.rates) {
      exchangeRates.JPY = 1;
      exchangeRates.HKD = 1 / d.rates.JPY * d.rates.HKD;
      exchangeRates.TWD = 1 / d.rates.JPY * d.rates.TWD;
      exchangeRates.USD = 1 / d.rates.JPY * d.rates.USD;
      exchangeRates.CNY = 1 / d.rates.JPY * d.rates.CNY;
      localStorage.setItem('tohoku_exchange_rates', JSON.stringify({ rates: exchangeRates, updatedAt: Date.now() }));
      rateFetchAttempts = 0;
    }
  } catch (e) {
    const c = localStorage.getItem('tohoku_exchange_rates');
    if (c) { try { const d = JSON.parse(c); if (d.rates) exchangeRates = d.rates; } catch (e2) {} }
    if (rateFetchAttempts < 3) { rateFetchAttempts++; setTimeout(fetchLiveRates, rateFetchAttempts * 2000); }
  }
}
function initExchangeRates() {
  const c = localStorage.getItem('tohoku_exchange_rates');
  if (c) { try { const d = JSON.parse(c); if (d.rates) exchangeRates = d.rates; } catch (e) {} }
  fetchLiveRates();
  setInterval(fetchLiveRates, RATES_UPDATE_INTERVAL);
}

/* ============================================================
 * 六、成員
 * ============================================================ */
const members = ["余生", "bowie", "shandy", "connie"];
const memberSymbols = { "余生": "余", "bowie": "B", "shandy": "S", "connie": "C" };
const memberStyle = {
  "余生": { badge:"bg-blue-100 text-blue-800 border-blue-200", solid:"bg-blue-600 text-white border-blue-700", soft:"bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100", text:"text-blue-700", avatar:"bg-blue-500" },
  "bowie": { badge:"bg-pink-100 text-pink-800 border-pink-200", solid:"bg-pink-500 text-white border-pink-600", soft:"bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100", text:"text-pink-600", avatar:"bg-pink-400" },
  "shandy": { badge:"bg-emerald-100 text-emerald-800 border-emerald-200", solid:"bg-emerald-500 text-white border-emerald-600", soft:"bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", text:"text-emerald-600", avatar:"bg-emerald-500" },
  "connie": { badge:"bg-purple-100 text-purple-800 border-purple-200", solid:"bg-purple-500 text-white border-purple-600", soft:"bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100", text:"text-purple-600", avatar:"bg-purple-400" }
};

/* ============================================================
 * 七、旅行日期 / 類別
 * ============================================================ */
const TRIP_DATES = ["2027-01-21","2027-01-22","2027-01-23","2027-01-24","2027-01-25","2027-01-26","2027-01-27"];
const WEEK_NAMES = ["日","一","二","三","四","五","六"];

let selectedCategory = '餐飲';
function setCategory(cat) {
  selectedCategory = cat;
  document.querySelectorAll('.cat-btn-compact').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === cat));
  const sel = document.getElementById('ledger-category');
  if (sel) sel.value = cat;
  haptic(5);
}
function initCategoryGrid() { setCategory('餐飲'); }

let selectedPaymentMethod = '現金';

/* ============================================================
 * 八、快速記帳模板
 * ============================================================ */
const expenseTemplates = [
  { label: "🍽️ 午餐", desc: "午餐", category: "餐飲" },
  { label: "🍽️ 晚餐", desc: "晚餐", category: "餐飲" },
  { label: "🍜 拉麵", desc: "拉麵", category: "餐飲" },
  { label: "☕ 咖啡", desc: "咖啡點心", category: "餐飲" },
  { label: "🛒 超商", desc: "便利商店", category: "其他" },
  { label: "⛽ 加油", desc: "加油", category: "交通" },
  { label: "🅿️ 停車", desc: "停車費", category: "交通" },
  { label: "🛣️ 過路費", desc: "高速公路過路費", category: "交通" },
  { label: "🎟️ 門票", desc: "門票", category: "門票/活動" },
  { label: "🛍️ 購物", desc: "購物", category: "購物" },
  { label: "🏨 住宿", desc: "住宿", category: "住宿" },
  { label: "🎁 伴手禮", desc: "伴手禮", category: "購物" }
];
function applyTemplate(t) {
  document.getElementById('ledger-desc').value = t.desc;
  setCategory(t.category);
  state.activeSplitWith = members.map(m => ({ name: m, amount: 0 }));
  state.customSplitEnabled = false;
  document.getElementById('custom-split-toggle')?.classList.remove('active');
  document.getElementById('custom-split-inputs')?.classList.add('hidden');
  renderLedgerSelectors();
  updateEstimatedHKD();
  showToast(`✨ 已套用「${t.desc}」`, "⚡");
  haptic(8);
}

/* ============================================================
 * 九、全域狀態
 * ============================================================ */
let state = {
  expenses: [],
  history: [],
  settlementStatus: {},
  historyClearedAt: 0,
  budget: { total: 0 },
  viewingAs: "余生",
  activePayer: "余生",
  activeSplitWith: members.map(m => ({ name: m, amount: 0 })),
  customSplitEnabled: false,
  loaded: false
};
let editingExpenseId = null;
let lastExpense = null;

let pendingWrites = 0;
function incPendingWrites() {
  pendingWrites++;
  document.getElementById('sync-indicator')?.classList.add('active');
}
function decPendingWrites() {
  pendingWrites = Math.max(0, pendingWrites - 1);
  if (pendingWrites === 0) {
    setTimeout(() => {
      if (pendingWrites === 0) document.getElementById('sync-indicator')?.classList.remove('active');
    }, 300);
  }
}

/* ============================================================
 * 十、深色模式
 * ============================================================ */
const THEME_KEY = 'tohoku_ledger_theme';

function initTheme() {
  // 優先讀取主站主題 key，其次讀取記帳本自己的 key
  const saved = localStorage.getItem('tohoku_theme')
             || localStorage.getItem(THEME_KEY)
             || 'light';
  applyTheme(saved);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  // ⭐ 同步寫入兩個 key，讓主站與記帳本保持一致
  localStorage.setItem('tohoku_theme', next);
  localStorage.setItem(THEME_KEY, next);
  // ⭐ 通知主站切換
  if (window.parent && window.parent !== window) {
    try { window.parent.postMessage({ type: 'setTheme', theme: next }, '*'); } catch(e) {}
  }
  haptic(8);
}

function applyTheme(theme) {
  theme = (theme === 'dark') ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ============================================================
 * 十一、用戶 / 雲端徽章
 * ============================================================ */
function updateCurrentUserBadge() {
  const badge = document.getElementById('current-user-badge');
  if (!badge) return;
  const u = getCurrentUser();
  if (u) {
    const colorMap = { "余生":"bg-blue-100 text-blue-800 border-blue-200", "bowie":"bg-pink-100 text-pink-800 border-pink-200", "shandy":"bg-emerald-100 text-emerald-800 border-emerald-200", "connie":"bg-purple-100 text-purple-800 border-purple-200" };
    badge.className = `text-[10px] px-2 py-0.5 rounded-full font-bold border ${colorMap[u] || "bg-slate-100 text-slate-700 border-slate-200"}`;
    badge.textContent = `👤 ${u}`;
    badge.classList.remove('hidden');
  } else {
    badge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold border bg-slate-100 text-slate-500 border-slate-200';
    badge.textContent = '👤 訪客（唯讀）';
    badge.classList.remove('hidden');
  }
}
function updateCloudBadge(isConnected) {
  const badge = document.getElementById("cloud-sync-badge");
  if (!badge) return;
  if (isConnected) {
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span> 雲端連線';
    badge.classList.remove("bg-red-100","text-red-700","border-red-200","bg-slate-100","text-slate-500","border-slate-200");
    badge.classList.add("bg-sky-100","text-sky-700","border-sky-200");
  } else {
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> 連線中斷';
    badge.classList.remove("bg-sky-100","text-sky-700","border-sky-200","bg-slate-100","text-slate-500","border-slate-200");
    badge.classList.add("bg-red-100","text-red-700","border-red-200");
  }
}

/* ============================================================
 * 十二、認證 + 監聽
 * ============================================================ */
let _authPromise = null;
const initAuth = async () => {
  if (_authPromise) return _authPromise;
  _authPromise = (async () => {
    try { await auth.signInAnonymously(); updateCloudBadge(true); }
    catch (err) { console.warn("匿名登入失敗:", err); updateCloudBadge(false); }
  })();
  return _authPromise;
};
initAuth();

let _snapshotUnsub = null;
auth.onAuthStateChanged(user => {
  if (!user) { initAuth().catch(() => {}); return; }
  updateCloudBadge(true);
  if (_snapshotUnsub) return;
  _snapshotUnsub = window.dbRef.onSnapshot(docSnap => {
    if (!docSnap.exists) {
      window.dbRef.set({
        expenses: [], history: [], settlementStatus: {},
        historyClearedAt: 0, budget: { total: 0 }, updatedAt: Date.now()
      }).catch(e => console.warn("init failed:", e));
      return;
    }
    const data = docSnap.data();
    state.expenses = sanitizeExpenses(data.expenses || []);
    state.history = sanitizeHistory(data.history || []);
    state.settlementStatus = data.settlementStatus || {};
    state.historyClearedAt = data.historyClearedAt || 0;
    state.budget = data.budget || { total: 0 };
    state.loaded = true;
    document.getElementById('cloud-loading')?.classList.add('hidden-loading');
    updateLedgerUI();
  }, err => {
    console.warn("[onSnapshot error]", err);
    updateCloudBadge(false);
  });
});

/* ============================================================
 * 十三、Transaction
 * ============================================================ */
async function runTransaction(mutateFn) {
  if (!canWrite()) throw new Error("NO_PERMISSION");
  if (!auth.currentUser) await initAuth();
  incPendingWrites();
  try {
    return await db.runTransaction(async (transaction) => {
      const docRef = window.dbRef;
      const docSnap = await transaction.get(docRef);
      const current = docSnap.exists ? docSnap.data() : {
        expenses: [], history: [], settlementStatus: {}, historyClearedAt: 0, budget: { total: 0 }
      };
      const updates = mutateFn(current) || {};
      updates.updatedAt = Date.now();
      transaction.set(docRef, updates, { merge: true });
      return updates;
    });
  } finally {
    decPendingWrites();
  }
}

/* ============================================================
 * 十四、歷史記錄
 * ============================================================ */
function createHistoryEntry(type, expenseRef, details) {
  const u = getCurrentUser() || "未知";
  return {
    id: "h-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
    type,
    expenseId: expenseRef?.id || null,
    expenseDesc: expenseRef?.desc || null,
    actionBy: u,
    actionSymbol: memberSymbols[u] || (u[0] || "?").toUpperCase(),
    actionTime: new Date().toLocaleString("zh-HK"),
    timestamp: Date.now(),
    details
  };
}

/* ============================================================
 * 十五、可折疊
 * ============================================================ */
function toggleCollapsible(sectionId) {
  const s = document.getElementById(sectionId);
  const a = document.getElementById(sectionId + '-arrow');
  if (!s || !a) return;
  s.classList.toggle('collapsed'); s.classList.toggle('expanded');
  a.style.transform = s.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
  haptic(5);
}

/* ============================================================
 * 十六、篩選
 * ============================================================ */
let activeFilters = { day: 0, category: 'all' };
function toggleFilter(type, value) {
  activeFilters[type] = value;
  document.querySelectorAll(`.filter-btn[data-type="${type}"]`).forEach(btn => {
    const isActive = String(btn.dataset.value) === String(value);
    if (isActive) { btn.classList.remove('bg-slate-100','text-slate-600','border-slate-200'); btn.classList.add('bg-sky-600','text-white','border-sky-700'); }
    else { btn.classList.remove('bg-sky-600','text-white','border-sky-700'); btn.classList.add('bg-slate-100','text-slate-600','border-slate-200'); }
  });
  haptic(5);
  updateLedgerUI();
}
function clearAllFilters() {
  activeFilters = { day: 0, category: 'all' };
  document.querySelectorAll('.filter-btn').forEach(btn => { btn.classList.remove('bg-sky-600','text-white','border-sky-700'); btn.classList.add('bg-slate-100','text-slate-600','border-slate-200'); });
  updateLedgerUI();
}

/* ============================================================
 * 十七、子分頁
 * ============================================================ */
function switchLedgerSubTab(tabName) {
  ['records','balances','suggested','history'].forEach(t => document.getElementById(`subview-${t}`).classList.add('hidden'));
  const inactiveClass = "whitespace-nowrap flex-1 py-1.5 px-2 rounded-lg text-xs font-black text-slate-600 hover:bg-white/50 transition flex flex-col items-center justify-center";
  ['tab-records-btn','tab-balances-btn','tab-suggested-btn','tab-history-btn'].forEach(id => { document.getElementById(id).className = inactiveClass; });
  const activeClass = "whitespace-nowrap flex-1 py-1.5 px-2 rounded-lg text-xs font-black bg-white text-sky-900 shadow-sm transition flex flex-col items-center justify-center";
  document.getElementById(`subview-${tabName}`).classList.remove('hidden');
  const map = { records:'tab-records-btn', balances:'tab-balances-btn', suggested:'tab-suggested-btn', history:'tab-history-btn' };
  document.getElementById(map[tabName]).className = activeClass;
  haptic(6);
  if (tabName === 'suggested') renderSuggestedSettlements();
  else if (tabName === 'history') renderHistoryList();
  else if (tabName === 'balances') renderBalancesTable();
}

/* ============================================================
 * 十八、Toast / 複製
 * ============================================================ */
function showToast(message, icon = "✅") {
  const toast = document.getElementById("toast");
  const tm = document.getElementById("toast-message");
  const ti = document.getElementById("toast-icon");
  if (!toast) return;
  const oldBtn = document.getElementById("toast-undo-btn"); if (oldBtn) oldBtn.remove();
  window._undoCallback = null;
  tm.innerText = message; ti.innerText = icon;
  toast.classList.remove("-translate-y-24","opacity-0"); toast.classList.add("translate-y-0","opacity-100");
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => { toast.classList.remove("translate-y-0","opacity-100"); toast.classList.add("-translate-y-24","opacity-0"); }, 3000);
}
function showUndoToast(message, icon, onUndo) {
  const toast = document.getElementById("toast");
  const tm = document.getElementById("toast-message");
  const ti = document.getElementById("toast-icon");
  if (!toast) return;
  const oldBtn = document.getElementById("toast-undo-btn"); if (oldBtn) oldBtn.remove();
  tm.innerText = message; ti.innerText = icon;
  const btn = document.createElement("button");
  btn.id = "toast-undo-btn";
  btn.className = "ml-2 bg-white/20 hover:bg-white/30 active:scale-95 px-2.5 py-1 rounded-lg text-[11px] font-black transition shrink-0 pointer-events-auto";
  btn.textContent = "撤銷";
  btn.onclick = (e) => {
    e.stopPropagation();
    if (window._undoCallback) { window._undoCallback(); window._undoCallback = null; }
    const t = document.getElementById("toast");
    if (t) { t.classList.remove("translate-y-0","opacity-100"); t.classList.add("-translate-y-24","opacity-0"); }
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    haptic(15);
  };
  toast.appendChild(btn);
  window._undoCallback = onUndo;
  toast.classList.remove("-translate-y-24","opacity-0"); toast.classList.add("translate-y-0","opacity-100");
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("translate-y-0","opacity-100"); toast.classList.add("-translate-y-24","opacity-0");
    window._undoCallback = null;
    setTimeout(() => { const b = document.getElementById("toast-undo-btn"); if (b) b.remove(); }, 300);
  }, 5000);
}
function copyText(text) {
  try {
    const ta = document.createElement("textarea"); ta.value = text;
    document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); document.body.removeChild(ta);
    showToast("✅ 已複製");
  } catch (e) {
    navigator.clipboard.writeText(text).then(() => showToast("✅ 已複製"));
  }
}

/* ============================================================
 * 十九、預算
 * ============================================================ */
function openBudgetModal() {
  if (!canWrite()) { showToast("🔒 請先登入身份", "⚠️"); return; }
  const m = document.getElementById('budget-modal');
  const b = document.getElementById('budget-modal-backdrop');
  const input = document.getElementById('budget-input');
  if (!m || !b || !input) return;
  input.value = state.budget.total > 0 ? state.budget.total : '';
  b.classList.remove('hidden'); m.classList.remove('hidden');
  void m.offsetWidth;
  b.classList.remove('opacity-0'); m.classList.remove('opacity-0','scale-95');
  m.classList.add('opacity-100','scale-100');
  document.body.classList.add('modal-open');
  setTimeout(() => input.focus(), 100);
  haptic(8);
}
function closeBudgetModal() {
  const m = document.getElementById('budget-modal');
  const b = document.getElementById('budget-modal-backdrop');
  if (!m || !b) return;
  b.classList.add('opacity-0'); m.classList.remove('opacity-100','scale-100');
  m.classList.add('opacity-0','scale-95');
  setTimeout(() => { b.classList.add('hidden'); m.classList.add('hidden'); document.body.classList.remove('modal-open'); }, 300);
}
async function saveBudget() {
  const input = document.getElementById('budget-input');
  const val = parseFloat(input.value.replace(/,/g, ''));
  if (isNaN(val) || val < 0) { showToast("請輸入有效數字", "⚠️"); return; }
  try {
    await runTransaction(() => ({ budget: { total: round2(val) } }));
    closeBudgetModal();
    showToast("✅ 已儲存預算");
    haptic(15);
  } catch (e) {
    showToast("❌ 儲存失敗", "⚠️");
  }
}
async function clearBudget() {
  try {
    await runTransaction(() => ({ budget: { total: 0 } }));
    closeBudgetModal();
    showToast("🗑 已清除預算");
  } catch (e) {
    showToast("❌ 操作失敗", "⚠️");
  }
}
function renderBudgetBar(totalHKD) {
  const bar = document.getElementById('budget-bar');
  if (!bar) return;
  const total = state.budget.total || 0;
  if (total <= 0) { bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');
  const pct = Math.min(999, Math.round((totalHKD / total) * 100));
  const remain = total - totalHKD;
  const fill = document.getElementById('budget-fill');
  const pctText = document.getElementById('budget-pct-text');
  document.getElementById('budget-total-text').textContent = `$${total.toLocaleString('en-US')}`;
  document.getElementById('budget-used-text').textContent = `已用 $${totalHKD.toFixed(0)}`;
  document.getElementById('budget-remain-text').textContent = remain >= 0
    ? `剩餘 $${remain.toFixed(0)}`
    : `超支 $${Math.abs(remain).toFixed(0)}`;
  pctText.textContent = pct + '%';
  pctText.classList.remove('warning','danger');
  fill.classList.remove('warning','danger');
  fill.style.width = Math.min(100, pct) + '%';
  if (pct >= 100) { pctText.classList.add('danger'); fill.classList.add('danger'); }
  else if (pct >= 80) { pctText.classList.add('warning'); fill.classList.add('warning'); }
}

/* ============================================================
 * 二十、圖表
 * ============================================================ */
const CAT_COLORS = {
  '餐飲': '#f97316',
  '交通': '#3b82f6',
  '住宿': '#8b5cf6',
  '購物': '#ec4899',
  '門票/活動': '#14b8a6',
  '其他': '#64748b'
};
function renderCategoryPie() {
  const wrap = document.getElementById('category-pie');
  if (!wrap) return;
  const sums = {};
  state.expenses.forEach(e => {
    sums[e.category] = (sums[e.category] || 0) + e.amountInHKD;
  });
  const total = Object.values(sums).reduce((s, v) => s + v, 0);
  if (total <= 0) {
    wrap.innerHTML = '<div class="category-pie-empty">尚無資料</div>';
    return;
  }
  const entries = Object.entries(sums).sort((a, b) => b[1] - a[1]);
  let angle = 0;
  const gradients = [];
  entries.forEach(([cat, amt]) => {
    const pct = (amt / total) * 100;
    const color = CAT_COLORS[cat] || '#94a3b8';
    gradients.push(`${color} ${angle}% ${angle + pct}%`);
    angle += pct;
  });
  const legendHTML = entries.map(([cat, amt]) => {
    const pct = (amt / total) * 100;
    return `<div class="category-legend-item">
      <span class="category-legend-dot" style="background:${CAT_COLORS[cat] || '#94a3b8'}"></span>
      <span class="category-legend-label">${escapeHtml(cat)} <span style="color:#94a3b8;font-weight:600">${pct.toFixed(0)}%</span></span>
      <span class="category-legend-amt">$${amt.toFixed(0)}</span>
    </div>`;
  }).join('');
  wrap.innerHTML = `
    <div class="category-pie-circle" style="background:conic-gradient(${gradients.join(', ')})"></div>
    <div class="category-legend">${legendHTML}</div>
  `;
}
function renderDailyChart() {
  const wrap = document.getElementById('daily-chart');
  if (!wrap) return;
  const sums = {};
  for (let d = 1; d <= 7; d++) sums[d] = 0;
  state.expenses.forEach(e => { sums[e.day] = (sums[e.day] || 0) + e.amountInHKD; });
  const max = Math.max(...Object.values(sums), 1);
  const todayIdx = (() => {
    const today = new Date().toISOString().slice(0, 10);
    const idx = TRIP_DATES.indexOf(today);
    return idx >= 0 ? idx + 1 : -1;
  })();
  wrap.innerHTML = [1,2,3,4,5,6,7].map(d => {
    const amt = sums[d] || 0;
    const h = max > 0 ? Math.max(2, (amt / max) * 90) : 2;
    const isToday = d === todayIdx;
    return `<div class="daily-bar-wrap">
      <span class="daily-bar-amt">${amt > 0 ? '$' + amt.toFixed(0) : ''}</span>
      <div class="daily-bar ${isToday ? 'today' : ''}" style="height:${h}px"></div>
      <span class="daily-bar-label">D${d}</span>
    </div>`;
  }).join('');
}

/* ============================================================
 * 二十一、記帳彈窗
 * ============================================================ */
function openExpenseModal() {
  editingExpenseId = null;
  const backdrop = document.getElementById("expense-modal-backdrop");
  const modal = document.getElementById("expense-modal");
  backdrop.classList.remove("hidden"); modal.classList.remove("hidden"); modal.offsetWidth;
  backdrop.classList.remove("opacity-0"); modal.classList.add("opacity-100");
  modal.classList.remove("translate-y-full","md:translate-y-8","md:scale-95","opacity-0");
  modal.classList.add("translate-y-0","md:translate-y-0","md:scale-100","opacity-100");
  document.body.classList.add("modal-open");
  
  const daySelect = document.getElementById("ledger-day");
  if (activeFilters.day !== 0) daySelect.value = activeFilters.day;
  
  if (!editingExpenseId) {
    setCategory('餐飲');
    document.getElementById('payment-method-select').value = '現金';
    state.activePayer = getCurrentUser() || members[0];
    state.activeSplitWith = members.map(m => ({ name: m, amount: 0 }));
    state.customSplitEnabled = false;
    document.getElementById('custom-split-toggle')?.classList.remove('active');
    document.getElementById('custom-split-inputs')?.classList.add('hidden');
  }
  
  renderLedgerSelectors();
  updateEstimatedHKD();
  haptic(8);
}
function closeExpenseModal() {
  const backdrop = document.getElementById("expense-modal-backdrop");
  const modal = document.getElementById("expense-modal");
  backdrop.classList.remove("opacity-100"); backdrop.classList.add("opacity-0");
  modal.classList.remove("translate-y-0","md:translate-y-0","md:scale-100","opacity-100");
  modal.classList.add("translate-y-full","md:translate-y-8","md:scale-95","opacity-0");
  setTimeout(() => { backdrop.classList.add("hidden"); modal.classList.add("hidden"); cancelEdit(); document.body.classList.remove("modal-open"); }, 300);
  if (window.parent !== window) window.parent.postMessage({ type: 'closeExpenseModal' }, '*');
}
function cancelEdit() {
  document.getElementById("ledger-desc").value = "";
  document.getElementById("ledger-amount").value = "";
  document.getElementById("ledger-remark").value = "";
  updateEstimatedHKD();
  editingExpenseId = null;
  setTimeout(() => {
    document.querySelector("#expense-modal h3").innerHTML = '<span class="bg-sky-100 text-sky-700 w-8 h-8 rounded-full flex items-center justify-center text-base">✏️</span> 記帳';
    document.getElementById("btn-save-expense").innerHTML = '<span>儲存</span><span class="text-lg">✓</span>';
  }, 300);
}
function openEditExpenseModal(expenseId) {
  ensureWriteAccess(() => {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;
    editingExpenseId = expenseId;
    document.getElementById("ledger-day").value = expense.day;
    setCategory(expense.category);
    document.getElementById("payment-method-select").value = expense.paymentMethod || '現金';
    document.getElementById("ledger-desc").value = expense.desc;
    document.getElementById("ledger-remark").value = expense.remark || "";
    document.getElementById("ledger-amount").value = expense.amount;
    document.getElementById("ledger-currency").value = expense.currency;
    state.activePayer = expense.payer;
    state.activeSplitWith = normalizeSplitWith(expense.splitWith, expense.amountInHKD);
    state.customSplitEnabled = Array.isArray(expense.splitWith) && expense.splitWith.length > 0 && typeof expense.splitWith[0] === 'object' && expense.splitWith.some(s => s.amount !== expense.amountInHKD / expense.splitWith.length);
    
    renderLedgerSelectors();
    updateEstimatedHKD();
    
    const backdrop = document.getElementById("expense-modal-backdrop");
    const modal = document.getElementById("expense-modal");
    backdrop.classList.remove("hidden"); modal.classList.remove("hidden"); modal.offsetWidth;
    backdrop.classList.remove("opacity-0"); modal.classList.add("opacity-100");
    modal.classList.remove("translate-y-full","md:translate-y-8","md:scale-95","opacity-0");
    modal.classList.add("translate-y-0","md:translate-y-0","md:scale-100","opacity-100");
    document.body.classList.add("modal-open");
    document.querySelector("#expense-modal h3").innerHTML = '<span class="bg-sky-100 text-sky-700 w-8 h-8 rounded-full flex items-center justify-center text-base">✏️</span> 編輯支出';
    document.getElementById("btn-save-expense").innerHTML = '<span>更新</span><span class="text-lg">✓</span>';
  });
}

/* 分攤資料標準化 */
function normalizeSplitWith(raw, totalHKD) {
  if (!Array.isArray(raw) || raw.length === 0) return members.map(m => ({ name: m, amount: 0 }));
  if (typeof raw[0] === 'string') {
    const share = round2(totalHKD / raw.length);
    return raw.map(name => ({ name, amount: share }));
  }
  return raw.map(x => ({ name: x.name, amount: round2(Number(x.amount) || 0) }));
}

function renderLedgerSelectors() {
  // 付款人
  const payerGrid = document.getElementById("payer-grid");
  if (payerGrid) {
    payerGrid.innerHTML = "";
    members.forEach(member => {
      const style = memberStyle[member] || memberStyle["余生"];
      const symbol = memberSymbols[member] || "";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.onclick = () => { state.activePayer = member; renderLedgerSelectors(); haptic(5); };
      btn.className = `py-1.5 px-1 text-xs rounded-xl font-bold transition border text-center min-h-[48px] flex flex-col items-center justify-center gap-0.5 ${state.activePayer === member ? style.solid + " shadow-sm scale-105" : style.soft}`;
      btn.innerHTML = `<div class="w-5 h-5 rounded-full ${state.activePayer === member ? "bg-white/20 text-white" : style.avatar + " text-white"} flex items-center justify-center text-[10px] font-black shadow-sm">${escapeHtml(member[0].toUpperCase())}</div><span class="${state.activePayer === member ? "text-white" : style.text} text-[10px]">${escapeHtml(member)} ${escapeHtml(symbol)}</span>`;
      payerGrid.appendChild(btn);
    });
  }
  // 分攤成員
  const splittersGrid = document.getElementById("splitters-grid");
  if (splittersGrid) {
    splittersGrid.innerHTML = "";
    members.forEach(member => {
      const style = memberStyle[member] || memberStyle["余生"];
      const symbol = memberSymbols[member] || "";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.onclick = () => { toggleSplitter(member); haptic(5); };
      const entry = state.activeSplitWith.find(s => s.name === member);
      const isActive = !!entry;
      btn.className = `py-1.5 px-1 text-xs rounded-lg font-bold transition border text-center min-h-[40px] flex items-center justify-center gap-1.5 ${isActive ? style.solid + " shadow-sm" : style.soft}`;
      btn.innerHTML = `<div class="w-3.5 h-3.5 rounded-full border border-white/60 ${isActive ? "bg-white" : "bg-white/50"} flex items-center justify-center shrink-0 shadow-inner"><div class="w-2 h-2 rounded-full ${isActive ? style.avatar : "bg-transparent"}"></div></div><span>${escapeHtml(member)} ${escapeHtml(symbol)}</span>`;
      splittersGrid.appendChild(btn);
    });
  }
  // 自訂分攤輸入框
  const customInputs = document.getElementById('custom-split-inputs');
  if (customInputs) {
    if (state.customSplitEnabled) {
      customInputs.classList.remove('hidden');
      customInputs.innerHTML = state.activeSplitWith.map(s => {
        const style = memberStyle[s.name] || memberStyle["余生"];
        return `<div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full ${style.avatar} text-white flex items-center justify-center text-[10px] font-black shrink-0">${escapeHtml(s.name[0].toUpperCase())}</div>
          <span class="text-[11px] font-bold text-slate-700 w-14 shrink-0">${escapeHtml(s.name)}</span>
          <input type="number" inputmode="decimal" step="1" min="0" data-split-name="${escAttr(s.name)}" value="${s.amount || 0}" class="flex-1 min-w-0 border border-slate-300 bg-white rounded-lg py-1.5 px-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/50">
          <span class="text-[10px] text-slate-400 font-bold w-6 shrink-0">HKD</span>
        </div>`;
      }).join('');
      customInputs.querySelectorAll('input[data-split-name]').forEach(inp => {
        inp.addEventListener('input', () => {
          const name = inp.dataset.splitName;
          const entry = state.activeSplitWith.find(s => s.name === name);
          if (entry) entry.amount = round2(parseFloat(inp.value) || 0);
          updateCustomSplitHint();
        });
      });
      updateCustomSplitHint();
    } else {
      customInputs.classList.add('hidden');
      updateCustomSplitHint();
    }
  }
}
function updateCustomSplitHint() {
  const hint = document.getElementById('split-sum-hint');
  if (!hint) return;
  const amt = parseFloat(document.getElementById('ledger-amount').value) || 0;
  const cur = document.getElementById('ledger-currency').value;
  const rate = exchangeRates[cur] || 0.052;
  const totalHKD = round2(amt * rate);
  if (state.customSplitEnabled) {
    const sum = state.activeSplitWith.reduce((s, x) => s + (Number(x.amount) || 0), 0);
    const diff = round2(sum - totalHKD);
    if (Math.abs(diff) < 1) { hint.textContent = `✓ 已分配 $${sum.toFixed(2)}`; hint.className = 'text-[10px] font-bold text-emerald-600'; }
    else { hint.textContent = diff > 0 ? `超出 $${diff.toFixed(2)}` : `尚差 $${Math.abs(diff).toFixed(2)}`; hint.className = 'text-[10px] font-bold text-red-500'; }
  } else {
    if (state.activeSplitWith.length > 0 && totalHKD > 0) {
      const share = round2(totalHKD / state.activeSplitWith.length);
      hint.textContent = `${state.activeSplitWith.length}人均分 · $${share.toFixed(2)}/人`;
      hint.className = 'text-[10px] font-bold text-slate-400';
    } else {
      hint.textContent = '';
    }
  }
}
function toggleSplitter(member) {
  const idx = state.activeSplitWith.findIndex(s => s.name === member);
  if (idx > -1) {
    if (state.activeSplitWith.length > 1) state.activeSplitWith.splice(idx, 1);
  } else {
    state.activeSplitWith.push({ name: member, amount: 0 });
  }
  renderLedgerSelectors();
}
function toggleCustomSplit() {
  state.customSplitEnabled = !state.customSplitEnabled;
  const btn = document.getElementById('custom-split-toggle');
  if (btn) btn.classList.toggle('active', state.customSplitEnabled);
  if (state.customSplitEnabled) {
    const amt = parseFloat(document.getElementById('ledger-amount').value) || 0;
    const cur = document.getElementById('ledger-currency').value;
    const rate = exchangeRates[cur] || 0.052;
    const totalHKD = round2(amt * rate);
    const share = state.activeSplitWith.length > 0 ? round2(totalHKD / state.activeSplitWith.length) : 0;
    state.activeSplitWith.forEach(s => { if (!s.amount) s.amount = share; });
  }
  renderLedgerSelectors();
  haptic(6);
}
function setSplitPreset(preset) {
  if (preset === 'all') state.activeSplitWith = members.map(m => ({ name: m, amount: 0 }));
  state.customSplitEnabled = false;
  document.getElementById('custom-split-toggle')?.classList.remove('active');
  document.getElementById('custom-split-inputs')?.classList.add('hidden');
  renderLedgerSelectors();
  haptic(5);
}
function useLastExpense() {
  if (!lastExpense) { showToast("尚無上次記錄", "⚠️"); return; }
  document.getElementById("ledger-day").value = lastExpense.day;
  setCategory(lastExpense.category);
  document.getElementById("payment-method-select").value = lastExpense.paymentMethod || '現金';
  document.getElementById("ledger-desc").value = lastExpense.desc;
  document.getElementById("ledger-remark").value = lastExpense.remark || "";
  document.getElementById("ledger-amount").value = lastExpense.amount;
  document.getElementById("ledger-currency").value = lastExpense.currency;
  state.activePayer = lastExpense.payer;
  state.activeSplitWith = normalizeSplitWith(lastExpense.splitWith, lastExpense.amountInHKD);
  state.customSplitEnabled = false;
  document.getElementById('custom-split-toggle')?.classList.remove('active');
  document.getElementById('custom-split-inputs')?.classList.add('hidden');
  renderLedgerSelectors();
  updateEstimatedHKD();
  showToast("📋 已沿用上次記錄"); haptic(8);
}
function updateEstimatedHKD() {
  const a = document.getElementById("ledger-amount");
  const c = document.getElementById("ledger-currency");
  const t = document.getElementById("estimated-hkd-text");
  if (!a || !c || !t) return;
  const amount = parseFloat(a.value.replace(/,/g, "")) || 0;
  const rate = exchangeRates[c.value] || 0.052;
  t.innerText = `約合 ${(amount * rate).toFixed(2)} HKD`;
  updateCustomSplitHint();
  if (state.customSplitEnabled && amount > 0 && state.activeSplitWith.length > 0) {
    if (!state._customSplitTouched) {
      const totalHKD = round2(amount * rate);
      const share = round2(totalHKD / state.activeSplitWith.length);
      state.activeSplitWith.forEach(s => { s.amount = share; });
      renderLedgerSelectors();
    }
  }
}

/* ============================================================
 * 二十二、儲存支出
 * ============================================================ */
async function saveExpense() {
  const day = document.getElementById("ledger-day");
  const desc = document.getElementById("ledger-desc");
  const amount = document.getElementById("ledger-amount");
  const currency = document.getElementById("ledger-currency");
  const remark = document.getElementById("ledger-remark").value.trim();
  const descValue = desc.value.trim();
  const amountValue = parseFloat(amount.value.replace(/,/g, ""));
  if (!descValue || isNaN(amountValue) || amountValue <= 0) { showToast("請輸入說明與金額", "⚠️"); haptic(50); return; }
  if (!canWrite()) { showToast("🔒 請先登入身份才能修改", "⚠️"); return; }
  if (state.activeSplitWith.length === 0) { showToast("請至少選一位分攤成員", "⚠️"); return; }

  const rate = exchangeRates[currency.value] || 0.052;
  const amountInHKD = round2(amountValue * rate);

  let splitWith;
  if (state.customSplitEnabled) {
    const sum = state.activeSplitWith.reduce((s, x) => s + (Number(x.amount) || 0), 0);
    if (Math.abs(sum - amountInHKD) > 1) {
      showToast(`分攤金額不符：Σ$${sum.toFixed(2)} vs 總額$${amountInHKD.toFixed(2)}`, "⚠️");
      return;
    }
    splitWith = state.activeSplitWith.map(s => ({ name: s.name, amount: round2(s.amount) }));
  } else {
    const share = round2(amountInHKD / state.activeSplitWith.length);
    splitWith = state.activeSplitWith.map(s => ({ name: s.name, amount: share }));
  }

  const now = Date.now();
  const currentTime = new Date(now).toLocaleString("zh-HK");
  const expenseData = {
    day: parseInt(day.value), category: selectedCategory, desc: descValue, remark,
    amount: amountValue, currency: currency.value, amountInHKD,
    payer: state.activePayer, splitWith,
    paymentMethod: selectedPaymentMethod,
    createdAt: now, updatedAt: now, createdBy: state.activePayer, createdTime: currentTime, updatedBy: state.activePayer
  };

  const isEditing = !!editingExpenseId;
  const editingId = editingExpenseId;

  try {
    await runTransaction(current => {
      let expenses = [...(current.expenses || [])];
      let history = [...(current.history || [])];
      if (isEditing) {
        const idx = expenses.findIndex(e => e.id === editingId);
        if (idx > -1) {
          const old = expenses[idx];
          history.unshift(createHistoryEntry("edit", old, `修改了「${escapeHtml(old.desc)}」`));
          expenses[idx] = { ...old, ...expenseData };
        }
      } else {
        const newEntry = { id: "exp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5), ...expenseData };
        expenses.push(newEntry);
        lastExpense = newEntry;
        history.unshift(createHistoryEntry("add", newEntry, `新增了「${escapeHtml(newEntry.desc)}」(${newEntry.amount} ${newEntry.currency})`));
      }
      history = history.slice(0, 200);
      return { expenses, history };
    });
    editingExpenseId = null;
    closeExpenseModal();
    showToast(isEditing ? "✅ 已更新支出" : "✅ 已新增支出");
    if (!isEditing) showConfetti();
    haptic(10);
    setTimeout(() => {
      document.querySelector("#expense-modal h3").innerHTML = '<span class="bg-sky-100 text-sky-700 w-8 h-8 rounded-full flex items-center justify-center text-base">✏️</span> 記帳';
      document.getElementById("btn-save-expense").innerHTML = '<span>儲存</span><span class="text-lg">✓</span>';
    }, 300);
  } catch (e) {
    console.error("[saveExpense]", e);
    if (e.message === "NO_PERMISSION") showToast("🔒 請先登入身份", "⚠️");
    else showToast("❌ 儲存失敗，請稍後再試", "⚠️");
  }
}

/* ============================================================
 * 二十三、刪除
 * ============================================================ */
async function deleteExpense(expenseId) {
  ensureWriteAccess(async () => {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;
    const snapshot = JSON.parse(JSON.stringify(expense));
    try {
      await runTransaction(current => {
        const expenses = (current.expenses || []).filter(e => e.id !== expenseId);
        let history = [...(current.history || [])];
        history.unshift(createHistoryEntry("delete", snapshot, `刪除了「${escapeHtml(snapshot.desc)}」(${snapshot.amount} ${snapshot.currency})`));
        history = history.slice(0, 200);
        return { expenses, history };
      });
      showToast("🗑 已刪除"); haptic(10);
      showUndoToast(`已刪除「${snapshot.desc}」`, "🗑", async () => {
        try {
          await runTransaction(current => {
            const expenses = [...(current.expenses || [])];
            if (expenses.some(e => e.id === snapshot.id)) return {};
            expenses.push(snapshot);
            let history = [...(current.history || [])];
            history.unshift(createHistoryEntry("add", snapshot, `還原了「${escapeHtml(snapshot.desc)}」`));
            history = history.slice(0, 200);
            return { expenses, history };
          });
          showToast("✅ 已還原", "↩️");
        } catch (e) { showToast("❌ 還原失敗", "⚠️"); }
      });
    } catch (e) {
      console.error("[deleteExpense]", e);
      showToast("❌ 刪除失敗", "⚠️");
    }
  });
}

/* ============================================================
 * 二十四、彩帶
 * ============================================================ */
function showConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  const colors = ['#0ea5e9','#38bdf8','#7dd3fc','#bae6fd','#a78bfa','#f472b6','#facc15'];
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.width = Math.random() * 10 + 6 + 'px';
    piece.style.height = Math.random() * 12 + 8 + 'px';
    container.appendChild(piece);
  }
  setTimeout(() => container.remove(), 3000);
}

/* ============================================================
 * 二十五、歷史渲染
 * ============================================================ */
function renderHistoryList() {
  const container = document.getElementById("history-list-container");
  const countBadge = document.getElementById("history-count-badge");
  if (!container) return;
  if (countBadge) countBadge.textContent = `${state.history.length} 筆`;
  container.innerHTML = "";
  if (!state.history || state.history.length === 0) {
    container.innerHTML = '<div class="text-slate-400 text-xs italic text-center py-12">尚無變更記錄</div>';
    return;
  }
  state.history.slice(0, 100).forEach(item => {
    const typeColor = item.type === "add" ? "bg-emerald-100 text-emerald-800" : item.type === "edit" ? "bg-amber-100 text-amber-800" : item.type === "clear" ? "bg-sky-100 text-sky-800" : "bg-red-100 text-red-800";
    const typeText = item.type === "add" ? "新增" : item.type === "edit" ? "修改" : item.type === "clear" ? "清空" : "刪除";
    const card = document.createElement("div");
    card.className = "bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2";
    card.innerHTML = `<span class="text-xl">${escapeHtml(item.actionSymbol || "📝")}</span><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1 flex-wrap"><span class="text-[10px] font-black px-2 py-0.5 rounded-full ${typeColor}">${typeText}</span><span class="text-[10px] font-bold text-slate-700">${escapeHtml(item.actionBy)}</span><span class="text-[9px] text-slate-400">${escapeHtml(item.actionTime)}</span></div><p class="text-[11px] text-slate-600">${item.details}</p></div>`;
    container.appendChild(card);
  });
}

/* ============================================================
 * 二十六、清空歷史
 * ============================================================ */
function openClearHistoryConfirm() {
  if (!canWrite()) { showToast("🔒 請先登入身份", "⚠️"); return; }
  if (state.history.length === 0) { showToast("尚無歷史記錄", "ℹ️"); return; }
  const count = state.history.length;
  ensureDangerousAccess(async () => {
    try {
      await runTransaction(() => ({ history: [], historyClearedAt: Date.now() }));
      showToast(`🗑 已清空 ${count} 筆歷史紀錄`); haptic(20);
    } catch (e) { showToast("❌ 清空失敗", "⚠️"); }
  }, "清空歷史記錄", `即將刪除 ${count} 筆歷史記錄。此操作無法復原，請輸入管理員密碼。`);
}

/* ============================================================
 * 二十七、更新介面
 * ============================================================ */
function updateLedgerUI() {
  let total = 0;
  state.expenses.forEach(e => total += e.amountInHKD);
  document.getElementById("stat-total").innerText = `${total.toLocaleString('en-US', {minimumFractionDigits: 2})} HKD`;
  document.getElementById("stat-count").innerText = `${state.expenses.length} 筆`;
  const statDayValue = document.getElementById("stat-day-value");
  const statDayLabel = document.getElementById("stat-day-label");
  if (statDayValue && statDayLabel) {
    if (activeFilters.day === 0) {
      const uniqueDays = new Set(state.expenses.map(e => e.day)).size || 1;
      const avgPerDay = total / uniqueDays;
      statDayLabel.textContent = "平均每日";
      statDayValue.innerText = `${avgPerDay.toLocaleString('en-US', {minimumFractionDigits: 2})} HKD`;
    } else {
      const dayTotal = state.expenses.filter(e => e.day === activeFilters.day).reduce((s, e) => s + e.amountInHKD, 0);
      statDayLabel.textContent = `Day ${activeFilters.day} 支出`;
      statDayValue.innerText = `${dayTotal.toLocaleString('en-US', {minimumFractionDigits: 2})} HKD`;
    }
  }
  renderBudgetBar(total);
  renderCharts();
  renderExpensesList();
  renderBalancesTable();
  renderSuggestedSettlements();
  renderHistoryList();
}
function renderCharts() {
  renderCategoryPie();
  renderDailyChart();
}

/* ============================================================
 * 二十八、列表渲染（無滑動刪除）
 * ============================================================ */
function renderExpensesList() {
  const container = document.getElementById("records-list-container");
  if (!container) return;
  container.innerHTML = "";
  if (state.expenses.length === 0) {
    container.innerHTML = '<div class="text-slate-400 text-xs italic text-center py-12">尚無記錄</div>';
    return;
  }
  let filtered = [...state.expenses];
  const search = document.getElementById("search-input").value.trim().toLowerCase();
  if (search) filtered = filtered.filter(e => e.desc.toLowerCase().includes(search) || e.category.toLowerCase().includes(search) || e.payer.toLowerCase().includes(search) || (e.remark && e.remark.toLowerCase().includes(search)));
  if (activeFilters.day !== 0) filtered = filtered.filter(e => e.day === activeFilters.day);
  if (activeFilters.category !== 'all') filtered = filtered.filter(e => e.category === activeFilters.category);
  const sort = document.getElementById("sort-select").value;
  filtered.sort((a, b) => {
    if (sort === "oldest") return a.createdAt - b.createdAt;
    if (sort === "amountHigh") return b.amountInHKD - a.amountInHKD;
    if (sort === "amountLow") return a.amountInHKD - b.amountInHKD;
    return b.createdAt - a.createdAt;
  });
  if (filtered.length === 0) {
    container.innerHTML = '<div class="text-slate-400 text-xs italic text-center py-12">沒有符合條件的記錄</div>';
    return;
  }
  const viewSelect = document.getElementById("ledger-view-as");
  if (viewSelect) viewSelect.value = state.viewingAs;
  const categoryColors = { '餐飲':'bg-orange-400', '交通':'bg-blue-400', '住宿':'bg-purple-400', '購物':'bg-pink-400', '門票/活動':'bg-teal-400', '其他':'bg-slate-400' };

  const grouped = {};
  filtered.forEach(e => { if (!grouped[e.day]) grouped[e.day] = []; grouped[e.day].push(e); });
  const sortedDays = Object.keys(grouped).map(Number).sort((a, b) => b - a);
  const fragment = document.createDocumentFragment();

  sortedDays.forEach(day => {
    const dayList = grouped[day];
    const dayTotal = dayList.reduce((s, e) => s + e.amountInHKD, 0);
    const dateStr = TRIP_DATES[day - 1] || "";
    let dateLabel = "";
    if (dateStr) {
      const d = new Date(dateStr);
      dateLabel = `${parseInt(dateStr.substring(5, 7))}/${parseInt(dateStr.substring(8, 10))} (週${WEEK_NAMES[d.getDay()]})`;
    }
    const header = document.createElement("div");
    header.className = "day-group-header";
    header.innerHTML = `
      <div class="flex items-center gap-2 min-w-0">
        <span class="day-badge">D${day}</span>
        <span class="text-xs font-bold text-slate-700">${escapeHtml(dateLabel)}</span>
        <span class="text-[10px] text-slate-400">· ${dayList.length} 筆</span>
      </div>
      <span class="day-subtotal">$${dayTotal.toFixed(2)}</span>
    `;
    fragment.appendChild(header);

    dayList.forEach(expense => {
      const totalHKD = expense.amountInHKD;
      const viewName = state.viewingAs;
      let paidByMe = expense.payer === viewName ? totalHKD : 0;
      let myShare = 0;
      const splitArr = normalizeSplitWith(expense.splitWith, totalHKD);
      const myEntry = splitArr.find(s => s.name === viewName);
      if (myEntry) myShare = myEntry.amount;
      const balance = paidByMe - myShare;
      let balanceHtml = ""; let cardBorder = "border-slate-200"; let cardBg = "bg-slate-50 hover:bg-slate-100";
      if (Math.abs(balance) > 0.01) {
        if (balance > 0) { balanceHtml = `<span class="text-emerald-700 font-black text-sm">+$${balance.toFixed(2)}</span>`; cardBorder = "border-emerald-200"; cardBg = "bg-emerald-50/40 hover:bg-emerald-50/80"; }
        else { balanceHtml = `<span class="text-red-600 font-black text-sm">-$${Math.abs(balance).toFixed(2)}</span>`; cardBorder = "border-rose-100"; cardBg = "bg-rose-50/40 hover:bg-rose-50/80"; }
      } else { balanceHtml = '<span class="text-slate-400 font-medium text-[11px]">收支 / 平衡</span>'; }

      const payerStyle = memberStyle[expense.payer] || memberStyle["余生"];
      const symbol = memberSymbols[expense.payer] || "";
      const timeStr = expense.createdTime || new Date(expense.createdAt).toLocaleString("zh-HK");
      const catColor = categoryColors[expense.category] || 'bg-slate-400';
      const remarkHtml = expense.remark ? `<div class="flex items-center gap-1 mt-1 text-[10px] text-slate-500 bg-slate-100 rounded px-1.5 py-0.5"><span>📌</span><span class="truncate">${escapeHtml(expense.remark)}</span></div>` : '';
      const payMethodHtml = expense.paymentMethod ? `<span class="bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">${escapeHtml(expense.paymentMethod)}</span>` : '';
      const customSplitTag = splitArr.some((s, i) => i > 0 && Math.abs(s.amount - splitArr[0].amount) > 0.01) ? `<span class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">自訂分攤</span>` : '';

      const card = document.createElement("div");
      card.className = `relative ${cardBg} p-2 pl-4 rounded-xl border ${cardBorder} flex justify-between items-center text-xs transition shadow-sm hover:shadow`;
      card.innerHTML = `
        <div class="cat-strip ${catColor}"></div>
        <div class="flex items-center gap-2 flex-1 min-w-0 pr-2">
          <div class="w-8 h-8 rounded-full ${payerStyle.avatar} text-white font-black flex items-center justify-center shrink-0 border-2 border-white shadow-sm text-sm">${escapeHtml(expense.payer[0].toUpperCase())}</div>
          <div class="space-y-0.5 flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <strong class="text-slate-900 text-[13px] truncate">${escapeHtml(expense.desc)}</strong>
              <span class="text-[10px]">${escapeHtml(symbol)}</span>
            </div>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap mt-0.5">
              <span class="bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">${escapeHtml(expense.category)}</span>
              ${payMethodHtml}
              ${customSplitTag}
              <span class="flex items-center gap-1">付: <span class="${payerStyle.badge} px-1.5 py-0.5 rounded font-bold border">${escapeHtml(expense.payer)}</span></span>
              <span class="text-slate-400">🕘 ${escapeHtml(timeStr)}</span>
            </div>
            ${remarkHtml}
          </div>
        </div>
        <div class="text-right flex items-center gap-2 shrink-0 pl-2">
          <div class="flex flex-col items-end justify-center h-full">${balanceHtml}<span class="text-[9px] text-slate-400 font-medium mt-0.5" title="原幣 ${expense.amount} ${expense.currency}">合: $${expense.amountInHKD.toFixed(1)}</span></div>
          <div class="flex flex-col gap-1">
            <button onclick="openEditExpenseModal('${expense.id}')" class="text-slate-300 hover:text-sky-500 p-1.5 transition bg-white/50 hover:bg-white rounded-lg border border-slate-100 shadow-sm" title="編輯">✏️</button>
            <button onclick="deleteExpense('${expense.id}')" class="text-slate-300 hover:text-red-500 p-1.5 transition bg-white/50 hover:bg-white rounded-lg border border-slate-100 shadow-sm" title="刪除">🗑</button>
          </div>
        </div>
      `;
      fragment.appendChild(card);
    });
  });
  container.appendChild(fragment);
}

/* ============================================================
 * 二十九、結算
 * ============================================================ */
function calculateBalances() {
  const paidMap = {}; const owedMap = {};
  members.forEach(m => { paidMap[m] = 0; owedMap[m] = 0; });
  state.expenses.forEach(expense => {
    const totalHKD = expense.amountInHKD;
    if (paidMap[expense.payer] !== undefined) paidMap[expense.payer] += totalHKD;
    const splitArr = normalizeSplitWith(expense.splitWith, totalHKD);
    splitArr.forEach(s => {
      if (owedMap[s.name] !== undefined) owedMap[s.name] += (Number(s.amount) || 0);
    });
  });
  const balances = {};
  members.forEach(m => { balances[m] = round2(paidMap[m] - owedMap[m]); });
  return { paidMap, owedMap, balances };
}
function renderBalancesTable() {
  const tbody = document.getElementById("balances-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";
  const { paidMap, owedMap, balances } = calculateBalances();
  members.forEach(member => {
    const paid = paidMap[member].toFixed(2);
    const owed = owedMap[member].toFixed(2);
    const balance = balances[member];
    const balanceText = balance > 0 ? `+${balance.toFixed(2)}` : balance.toFixed(2);
    const balanceClass = balance > 0 ? "text-emerald-600 font-bold" : balance < 0 ? "text-red-500 font-bold" : "text-slate-400";
    const style = memberStyle[member] || memberStyle["余生"];
    const symbol = memberSymbols[member] || "";
    tbody.innerHTML += `<tr class="border-b border-slate-100 hover:bg-slate-50 transition"><td class="py-2 font-bold text-slate-800 flex items-center gap-2"><div class="w-5 h-5 rounded-full ${style.avatar} text-white font-black flex items-center justify-center text-[9px] border border-white shadow-sm">${escapeHtml(member[0].toUpperCase())}</div>${escapeHtml(member)} ${escapeHtml(symbol)}</td><td class="py-2 text-right text-slate-600 font-medium">$${paid}</td><td class="py-2 text-right text-slate-600 font-medium">$${owed}</td><td class="py-2 text-right ${balanceClass}">$${balanceText}</td></tr>`;
  });
}

/* ============================================================
 * 三十、建議還款
 * ============================================================ */
let _lastSettlements = [];
function renderSuggestedSettlements() {
  const container = document.getElementById("suggested-settle-container");
  const badge = document.getElementById("debt-count-badge");
  if (!container) return;
  container.innerHTML = "";
  const { balances } = calculateBalances();
  let debtors = [], creditors = [];
  Object.keys(balances).forEach(name => {
    const amount = round2(balances[name]);
    if (amount < -0.01) debtors.push({ name, amount: -amount });
    else if (amount > 0.01) creditors.push({ name, amount });
  });
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  const settlements = [];
  let d = 0, c = 0;
  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d]; const creditor = creditors[c];
    const transfer = Math.min(debtor.amount, creditor.amount);
    settlements.push({ from: debtor.name, to: creditor.name, amount: transfer.toFixed(2) });
    debtor.amount -= transfer; creditor.amount -= transfer;
    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }
  _lastSettlements = settlements;
  const totalDebt = debtors.reduce((sum, d) => sum + d.amount, 0).toFixed(2);
  const totalCredit = creditors.reduce((sum, c) => sum + c.amount, 0).toFixed(2);
  
  document.getElementById("debt-total").innerText = `$${totalDebt}`;
  document.getElementById("credit-total").innerText = `$${totalCredit}`;
  document.getElementById("settled-total").innerText = `${settlements.length} 筆`;
  
  if (badge) {
    if (settlements.length > 0) { badge.innerText = settlements.length; badge.classList.remove("hidden"); }
    else badge.classList.add("hidden");
  }
  if (settlements.length === 0) {
    container.innerHTML = '<div class="text-slate-400 text-xs italic text-center py-8">🎉 所有帳目都已平衡！</div>';
    return;
  }
  
  settlements.forEach(s => {
    const fromStyle = memberStyle[s.from] || memberStyle["余生"];
    const toStyle = memberStyle[s.to] || memberStyle["余生"];
    const fromSymbol = memberSymbols[s.from] || "";
    const toSymbol = memberSymbols[s.to] || "";
    container.innerHTML += `<div class="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs shadow-sm"><div class="flex items-center gap-1.5 md:gap-2"><div class="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm"><div class="w-5 h-5 rounded-full ${fromStyle.avatar} text-white flex items-center justify-center text-[9px] font-black">${escapeHtml(s.from[0].toUpperCase())}</div><span class="font-bold text-slate-700 hidden sm:inline">${escapeHtml(s.from)} ${escapeHtml(fromSymbol)}</span></div><span class="text-slate-400 text-[10px] font-bold flex flex-col items-center px-1"><span>轉帳</span><span class="text-[8px] mt-0.5 text-slate-300">→</span></span><div class="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm"><div class="w-5 h-5 rounded-full ${toStyle.avatar} text-white flex items-center justify-center text-[9px] font-black">${escapeHtml(s.to[0].toUpperCase())}</div><span class="font-bold text-slate-700 hidden sm:inline">${escapeHtml(s.to)} ${escapeHtml(toSymbol)}</span></div></div><div class="text-right"><span class="block text-[9px] text-slate-400 mb-0.5 font-medium">金額</span><strong class="text-sm md:text-base font-black text-rose-600">$${escapeHtml(s.amount)}</strong></div></div>`;
  });
}
function toggleSettlementDone() { showToast("ℹ️ 無需標記，資料為即時計算", "ℹ️"); }

function copySettlementPlan() {
  if (!_lastSettlements || _lastSettlements.length === 0) { showToast("目前沒有待還款計畫", "⚠️"); return; }
  let plan = "📋 建議還款 (HKD)\n=====================\n";
  _lastSettlements.forEach(s => { plan += `${s.from} → ${s.to} : $${s.amount}\n`; });
  plan += `\n共 ${_lastSettlements.length} 筆轉帳`;
  copyText(plan); showToast("📋 已複製還款計畫");
}
function changeViewAs(member) { state.viewingAs = member; renderExpensesList(); }

/* ============================================================
 * 三十一、匯出
 * ============================================================ */
function exportLedgerText() {
  if (state.expenses.length === 0) { showToast("尚無記帳資料", "⚠️"); return; }
  let text = "🧾 記帳資料匯出\n"; text += "=".repeat(30) + "\n\n";
  const { paidMap, owedMap, balances } = calculateBalances();
  let totalHKD = 0; state.expenses.forEach(e => totalHKD += e.amountInHKD);
  text += `總支出: $${totalHKD.toFixed(2)} HKD\n`;
  text += `人均支出: $${(totalHKD / members.length).toFixed(2)} HKD\n\n`;
  text += "個人結算\n";
  members.forEach(m => {
    const sign = balances[m] > 0 ? "應收(墊付多)" : balances[m] < 0 ? "應付(墊付少)" : "收支平衡";
    text += `${m}: 已付 $${paidMap[m].toFixed(2)} / 應分 $${owedMap[m].toFixed(2)} / ${sign} $${Math.abs(balances[m]).toFixed(2)}\n`;
  });
  text += "\n記錄明細\n";
  [...state.expenses].sort((a, b) => a.day - b.day || b.createdAt - a.createdAt).forEach(e => {
    const splitArr = normalizeSplitWith(e.splitWith, e.amountInHKD);
    const splitStr = splitArr.map(s => `${s.name}($${s.amount.toFixed(0)})`).join("/");
    text += `D${e.day} | ${e.category} | ${e.desc} | ${e.amount} ${e.currency} (合$${e.amountInHKD.toFixed(2)} HKD) | 付:${e.payer} | 分:${splitStr} | 付款:${e.paymentMethod || '現金'} | 備註:${e.remark || ""}\n`;
  });
  copyText(text); showToast("✅ 已匯出文字格式");
}
function exportCSV() {
  if (state.expenses.length === 0) { showToast("尚無記帳資料", "⚠️"); return; }
  const header = ["日期(Day)", "日期", "類別", "說明", "金額", "幣別", "合計HKD", "付款人", "分攤明細", "付款方式", "備註", "建立時間"];
  const rows = [header];
  [...state.expenses].sort((a, b) => a.day - b.day || a.createdAt - b.createdAt).forEach(e => {
    const splitArr = normalizeSplitWith(e.splitWith, e.amountInHKD);
    const splitStr = splitArr.map(s => `${s.name}:${s.amount.toFixed(2)}`).join(" / ");
    rows.push([
      "D" + e.day,
      TRIP_DATES[e.day - 1] || "",
      e.category,
      e.desc,
      e.amount,
      e.currency,
      e.amountInHKD.toFixed(2),
      e.payer,
      splitStr,
      e.paymentMethod || "現金",
      e.remark || "",
      e.createdTime || ""
    ]);
  });
  const csv = rows.map(r => r.map(cell => {
    const s = String(cell == null ? "" : cell);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `記帳_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("📊 已下載 CSV 檔案");
  haptic(15);
}

/* ============================================================
 * 三十二、清空確認
 * ============================================================ */
function openConfirmModal() {
  if (!canWrite()) { showToast("🔒 請先登入身份", "⚠️"); return; }
  const backdrop = document.getElementById("confirm-modal-backdrop");
  const modal = document.getElementById("confirm-modal");
  backdrop.classList.remove("hidden"); modal.classList.remove("hidden"); modal.offsetWidth;
  backdrop.classList.remove("opacity-0"); modal.classList.remove("opacity-0","scale-95");
  modal.classList.add("opacity-100","scale-100"); haptic(8);
}
function closeConfirmModal() {
  const backdrop = document.getElementById("confirm-modal-backdrop");
  const modal = document.getElementById("confirm-modal");
  backdrop.classList.add("opacity-0"); modal.classList.remove("opacity-100","scale-100");
  modal.classList.add("opacity-0","scale-95");
  setTimeout(() => { backdrop.classList.add("hidden"); modal.classList.add("hidden"); }, 300);
}
function confirmAndClearExpenses() {
  closeConfirmModal();
  ensureDangerousAccess(async () => {
    try {
      await runTransaction(current => {
        const count = (current.expenses || []).length;
        const historyEntry = createHistoryEntry("clear", null, `清空了所有記帳資料（原有 ${count} 筆）`);
        const history = [historyEntry, ...(current.history || [])].slice(0, 200);
        return { expenses: [], settlementStatus: {}, history };
      });
      showToast("🗑 已清空所有記帳"); haptic(20);
    } catch (e) { showToast("❌ 清空失敗", "⚠️"); }
  }, "清空所有記帳", "此操作將刪除所有記帳與清償狀態，無法復原。請輸入管理員密碼。");
}

/* ============================================================
 * 三十三、角色 / 雪花
 * ============================================================ */
let characterTimeout = null;
function spawnCharacters() {
  clearTimeout(characterTimeout);
  const s = document.getElementById('snowman');
  const f = document.getElementById('fox');
  if (!s || !f) return;
  s.classList.remove('show','greet'); f.classList.remove('show','greet');
  s.classList.add('hide'); f.classList.add('hide');
  if (Math.random() < 0.5) { characterTimeout = setTimeout(spawnCharacters, Math.random() * 5000 + 4000); return; }
  const c = Math.random() < 0.5 ? s : f;
  c.classList.remove('hide'); c.classList.add('show');
  setTimeout(() => { c.classList.add('greet'); }, 600);
  characterTimeout = setTimeout(() => {
    c.classList.remove('show','greet'); c.classList.add('hide');
    setTimeout(spawnCharacters, Math.random() * 5000 + 3000);
  }, 4000);
}
function jump(id) {
  const c = document.getElementById(id);
  if (c) {
    c.classList.add('jumping'); setTimeout(() => c.classList.remove('jumping'), 600); haptic(10);
    showToast(`你點了一下${id === 'snowman' ? '雪人' : '狐狸'}！`, "❄️");
  }
}
function initRandomCharacters() { setTimeout(spawnCharacters, 2000); }
function initSnowEffect() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.getElementById("snow-fall");
  if (!c) return;
  c.innerHTML = "";
  const count = window.innerWidth < 768 ? 15 : 30;
  const anims = ["snowfall","snowfall-small","snowfall-medium","snowfall-large"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "snowflake";
    const size = Math.random() * 7 + 3;
    s.style.cssText = `left: ${Math.random() * 100}%; width: ${size}px; height: ${size}px; opacity: ${Math.random() * 0.4 + 0.3}; animation: ${anims[Math.floor(Math.random() * anims.length)]} ${Math.random() * 12 + 8}s linear infinite; animation-delay: ${Math.random() * -12}s;`;
    c.appendChild(s);
  }
}

/* ============================================================
 * 三十四、Modal 拖動
 * ============================================================ */
(function setupExpenseModalDrag() {
  const modal = document.getElementById('expense-modal');
  const backdrop = document.getElementById('expense-modal-backdrop');
  const handle = document.getElementById('expense-modal-handle');
  if (!modal || !handle) return;
  let startY = 0, currentY = 0, isDragging = false;
  const onMove = (e) => {
    if (!isDragging) return;
    currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const diff = currentY - startY;
    if (diff > 0) { modal.style.transform = `translateY(${diff}px)`; backdrop.style.opacity = String(Math.max(0, 1 - diff / 400)); }
  };
  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    const diff = currentY - startY;
    modal.classList.remove('dragging'); modal.classList.add('snapping');
    if (diff > 100) {
      modal.style.transform = ''; backdrop.style.opacity = '';
      setTimeout(() => { modal.classList.remove('snapping'); closeExpenseModal(); }, 50);
    } else {
      modal.style.transform = ''; backdrop.style.opacity = '';
      setTimeout(() => modal.classList.remove('snapping'), 300);
    }
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
  };
  const onStart = (e) => {
    isDragging = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    currentY = startY;
    modal.classList.add('dragging'); modal.classList.remove('snapping');
    haptic(5);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  };
  handle.addEventListener('touchstart', onStart, { passive: true });
  handle.addEventListener('touchmove', onMove, { passive: true });
  handle.addEventListener('touchend', onEnd);
  handle.addEventListener('touchcancel', onEnd);
  handle.addEventListener('mousedown', onStart);
})();

/* ============================================================
 * 三十五、Service Worker
 * ============================================================ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered:', reg.scope)).catch(err => console.log('SW failed:', err));
  });
}

/* ============================================================
 * 三十六、清理舊資料
 * ============================================================ */
try {
  localStorage.removeItem('tohoku_expenses_2027');
  localStorage.removeItem('tohoku_history_2027');
  localStorage.removeItem('settlement_status');
  localStorage.removeItem('tohoku_pending_deletes');
  localStorage.removeItem('tohoku_history_cleared_at');
} catch (e) {}

/* ============================================================
 * 三十七、資料清理
 * ============================================================ */
function sanitizeExpenses(e) {
  return Array.isArray(e) ? e.filter(item => item !== null && typeof item === "object").map(item => {
    const amountInHKD = Number(item.amountInHKD) || 0;
    return {
      ...item,
      id: item.id || "exp-" + Math.random().toString(36).substr(2, 9),
      day: parseInt(item.day) || 1,
      desc: item.desc || "未命名支出",
      remark: item.remark || "",
      category: item.category || "其他",
      amount: Number(item.amount) || 0,
      currency: item.currency || "JPY",
      amountInHKD,
      payer: item.payer || members[0],
      splitWith: normalizeSplitWith(item.splitWith, amountInHKD),
      paymentMethod: item.paymentMethod || "現金",
      createdAt: item.createdAt || Date.now(),
      createdTime: item.createdTime || "",
      createdBy: item.createdBy || "",
      updatedAt: item.updatedAt || Date.now(),
      updatedBy: item.updatedBy || ""
    };
  }) : [];
}
function sanitizeHistory(h) {
  return Array.isArray(h) ? h.filter(item => item !== null && typeof item === "object").map(item => ({
    ...item,
    id: item.id || "h-" + Math.random().toString(36).substr(2, 9),
    type: item.type || "add",
    expenseId: item.expenseId || null,
    expenseDesc: item.expenseDesc || null,
    actionBy: item.actionBy || "未知",
    actionSymbol: item.actionSymbol || "?",
    actionTime: item.actionTime || "",
    timestamp: item.timestamp || Date.now(),
    details: item.details || ""
  })) : [];
}

/* ============================================================
 * 三十八、返回頂部
 * ============================================================ */
function scrollToTop() {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    window.scrollTo(0, 0);
  }
  haptic(10);
}
window.scrollToTop = scrollToTop;

(function setupBackToTopLedger() {
  const btn = document.getElementById('back-to-top-ledger');
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
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
  function getMaxScroll() {
    const doc = document.documentElement;
    return Math.max(1, (doc.scrollHeight || document.body.scrollHeight) - window.innerHeight);
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

/* ============================================================
 * 三十九、初始化
 * ============================================================ */
window.addEventListener("DOMContentLoaded", () => {
  // ⭐ 通知主站「記帳本已就緒」，請求同步主題
  if (window.parent && window.parent !== window) {
    try { window.parent.postMessage({ type: 'ledgerReady' }, '*'); } catch (e) {}
  }

  initTheme();
  updateCurrentUserBadge();
  initCategoryGrid();
  initSnowEffect();
  initRandomCharacters();
  initExchangeRates();

  // 付款方式下拉選單監聽
  const paySelect = document.getElementById('payment-method-select');
  if (paySelect) {
    paySelect.addEventListener('change', (e) => { selectedPaymentMethod = e.target.value; haptic(5); });
  }

  // ⭐ 模板按鈕監聽
  document.querySelectorAll('.template-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.templateIdx);
      if (!isNaN(idx) && expenseTemplates[idx]) applyTemplate(expenseTemplates[idx]);
    });
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'tohoku_current_user') updateCurrentUserBadge();
    if (e.key === 'tohoku_theme') {
      const t = e.newValue || 'light';
      applyTheme(t);
    }
  });
  setInterval(updateCurrentUserBadge, 2000);

  // ⭐ 接收主站傳來的主题切換
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'setTheme') {
      applyTheme(e.data.theme);
      localStorage.setItem(THEME_KEY, e.data.theme);
    }
  });
});

/* ============================================================
 * 四十、全域匯出
 * ============================================================ */
window.openExpenseModal = openExpenseModal;
window.closeExpenseModal = closeExpenseModal;
window.openEditExpenseModal = openEditExpenseModal;
window.saveExpense = saveExpense;
window.deleteExpense = deleteExpense;
window.setCategory = setCategory;
window.updateEstimatedHKD = updateEstimatedHKD;
window.toggleCollapsible = toggleCollapsible;
window.toggleFilter = toggleFilter;
window.clearAllFilters = clearAllFilters;
window.switchLedgerSubTab = switchLedgerSubTab;
window.changeViewAs = changeViewAs;
window.exportLedgerText = exportLedgerText;
window.exportCSV = exportCSV;
window.openConfirmModal = openConfirmModal;
window.closeConfirmModal = closeConfirmModal;
window.confirmAndClearExpenses = confirmAndClearExpenses;
window.toggleSettlementDone = toggleSettlementDone;
window.copySettlementPlan = copySettlementPlan;
window.openClearHistoryConfirm = openClearHistoryConfirm;
window.verifyDangerousPassword = verifyDangerousPassword;
window.closeDangerousPasswordModal = closeDangerousPasswordModal;
window.jump = jump;
window.toggleCustomSplit = toggleCustomSplit;
window.setSplitPreset = setSplitPreset;
window.useLastExpense = useLastExpense;
window.toggleTheme = toggleTheme;
window.openBudgetModal = openBudgetModal;
window.closeBudgetModal = closeBudgetModal;
window.saveBudget = saveBudget;
window.clearBudget = clearBudget;
window.scrollToTop = scrollToTop;