/* ============================================================
 * app-lists.js — v7.6
 * 清單：行前預訂清單、裝備清單、購物清單、購物總覽
 *
 * v7.4：購物總覽加「＋ 新增物品」按鈕
 * v7.5：新增 updateShoppingBadges
 * v7.6：
 *   - ⭐ 去 Emoji 化（UI 層）：
 *       標題圖示、按鈕圖示、分類徽章改用 SVG
 *       清單項目 emoji、類別選擇 emoji 保留（內容型）
 * ============================================================ */

// ⭐ v7.6：SVG helper
function _svgIcon(name, size) {
  if (typeof window.ICON === 'function') return window.ICON(name, size || 16);
  return '';
}

// ==================== Modal 狀態 ====================
const modalUIState = {
  'booking-modal': { activeTab: 'all', expanded: {} },
  'equip-modal': { activeTab: 'all', expanded: {} }
};

let shoppingViewMode = 'byEvent';
let addShoppingFormOpen = false;

const SHOPPING_CATEGORIES = [
  { value: "餐飲",   label: "🍜 餐飲" },
  { value: "伴手禮", label: "🎁 伴手禮" },
  { value: "藥妝",   label: "💊 藥妝" },
  { value: "衣物",   label: "👕 衣物" },
  { value: "玩具",   label: "🎮 玩具" },
  { value: "電子",   label: "📱 電子" },
  { value: "日用",   label: "🏠 日用" },
  { value: "其他",   label: "📦 其他" }
];

const TEMP_PURCHASE_TITLE = "臨時購買";

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
  const modeBanner = isAdmin ? `<div class="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-3 mb-3 flex items-center gap-2.5"><span class="text-xl shrink-0">✏️</span><div class="flex-1 min-w-0"><div class="text-xs font-black text-emerald-800">編輯模式（管理員）</div><div class="text-[10px] text-emerald-600 leading-relaxed">你的修改會自動同步給所有裝置</div></div></div>` : `<div class="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 rounded-xl p-3 mb-3 flex items-center gap-2.5"><span class="text-xl shrink-0">👁️</span><div class="flex-1 min-w-0"><div class="text-xs font-black text-sky-800">唯讀模式</div><div class="text-[10px] text-sky-600 leading-relaxed">資料由管理員同步，你只能查看</div></div><button onclick="forceSyncFromCloud()" class="text-[10px] bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 px-2.5 py-1.5 rounded-lg font-bold shrink-0 transition active:scale-95 shadow-sm flex items-center gap-1"><span style="display:inline-flex">${_svgIcon('refresh', 12)}</span> 重新同步</button></div>`;
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
    html += `<div class="mt-5 pt-4 border-t border-slate-200"><h4 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">${_svgIcon('plus', 15)} 新增項目</h4><div class="flex gap-2"><input id="new-booking-label" type="text" placeholder="項目名稱" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs"><select id="new-booking-category" class="border border-slate-300 rounded-lg px-2 py-2 text-xs bg-white"><option value="航班">航班</option><option value="住宿">住宿</option><option value="租車">租車</option><option value="保險">保險</option><option value="門票">門票</option><option value="通訊">通訊</option><option value="其他">其他</option></select><button onclick="addCustomBooking()" class="bg-sky-500 hover:bg-sky-600 text-white px-3 rounded-lg text-xs font-bold">新增</button></div></div><div class="flex gap-2 mt-4"><button onclick="checkAllBooking()" class="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1">${_svgIcon('check', 13)} 全選</button><button onclick="uncheckAllBooking()" class="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1">${_svgIcon('x', 13)} 清除</button><button onclick="copyBookingList()" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1">${_svgIcon('note', 13)} 複製</button></div><div class="mt-3 flex items-center justify-center gap-3 text-center flex-wrap"><button onclick="lockAdmin()" class="text-[10px] text-amber-600 hover:text-amber-800 underline flex items-center gap-1">${_svgIcon('lock', 11)} 暫時鎖定</button><span class="text-[10px] text-slate-300">|</span><button onclick="releaseAdminDevice()" class="text-[10px] text-red-500 hover:text-red-700 underline flex items-center gap-1">${_svgIcon('x', 11)} 解除此裝置的管理員身分</button></div>`;
  } else {
    html += `<div class="mt-5 text-center"><button onclick="showPasswordModal()" class="text-[11px] bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-full font-bold transition inline-flex items-center gap-1">${_svgIcon('lock', 12)} 輸入密碼解鎖編輯</button><p class="text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">${_svgIcon('lock', 10)} 目前為唯讀模式</p></div>`;
  }
  container.innerHTML = html;
}

function toggleBookingCheck(key) { if (!isAdminUnlocked()) { showToast("🔒 唯讀模式，無法修改", "⚠️"); return; } state.checkedItems[key] = !state.checkedItems[key]; renderBookingChecklist(); saveLocalCheckedItems(); syncDataToCloud(); haptic(5); if (window.AppHeader) window.AppHeader.render(); }
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
  if (currentUser === "訪客") { container.innerHTML = `<div class="text-center py-12"><div class="text-5xl mb-3">🔒</div><p class="text-sm font-bold text-slate-700 mb-1">訪客無法使用專屬清單</p><p class="text-xs text-slate-500 leading-relaxed">請切換為家庭成員身份<br>才能建立自己的裝備清單</p></div>`; return; }
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
  html += `<div class="mt-5 pt-4 border-t border-slate-200"><h4 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">${_svgIcon('plus', 15)} 新增項目</h4><div class="flex gap-2"><input id="new-equip-label" type="text" placeholder="項目名稱" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs"><select id="new-equip-category" class="border border-slate-300 rounded-lg px-2 py-2 text-xs bg-white"><option value="重要證件">重要證件</option><option value="保暖衣物">保暖衣物</option><option value="電子與隨身">電子與隨身</option><option value="小孩">小孩</option><option value="其他">其他</option></select><button onclick="addCustomEquip()" class="bg-sky-500 hover:bg-sky-600 text-white px-3 rounded-lg text-xs font-bold">新增</button></div></div><div class="flex gap-2 mt-4"><button onclick="checkAllEquipment()" class="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1">${_svgIcon('check', 13)} 全選</button><button onclick="uncheckAllEquipment()" class="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1">${_svgIcon('x', 13)} 清除</button><button onclick="copyEquipmentList()" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1">${_svgIcon('note', 13)} 複製</button></div>`;
  container.innerHTML = html;
}

function toggleEquipCheck(key) { if (!currentUser || currentUser === "訪客") { showToast("🔒 請先登入", "⚠️"); return; } const userData = getUserData(); userData.equipChecked[key] = !userData.equipChecked[key]; renderEquipChecklist(); saveUserData(); haptic(5); if (window.AppHeader) window.AppHeader.render(); }
function checkAllEquipment() { if (!currentUser || currentUser === "訪客") return; const userData = getUserData(); [...equipmentList, ...(userData.customEquip || [])].forEach(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; userData.equipChecked[key] = true; }); renderEquipChecklist(); saveUserData(); showToast("✅ 已全部勾選！"); if (window.AppHeader) window.AppHeader.render(); }
function uncheckAllEquipment() { if (!currentUser || currentUser === "訪客") return; const userData = getUserData(); [...equipmentList, ...(userData.customEquip || [])].forEach(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; userData.equipChecked[key] = false; }); renderEquipChecklist(); saveUserData(); showToast("🧹 已清除所有勾選！"); if (window.AppHeader) window.AppHeader.render(); }
function copyEquipmentList() { if (!currentUser || currentUser === "訪客") return; const userData = getUserData(); const customEquipItems = userData.customEquip || []; let text = `🎒 ${currentUser} 的裝備清單 Check List\n=====================\n`; ["重要證件", "保暖衣物", "電子與隨身", "小孩", "其他"].forEach(cat => { const items = equipmentList.filter(i => i.category === cat); const customs = customEquipItems.filter(i => i.category === cat); const all = [...items, ...customs]; if (all.length === 0) return; text += `\n【${cat}】\n`; all.forEach(item => { const key = item.isCustom ? `custom-equip-${item.id}` : `equip-${item.id}`; text += `${userData.equipChecked[key] ? "✅" : "⬜"} ${item.icon} ${item.label}\n`; }); }); copyText(text); showToast("📋 裝備清單已複製！"); }
function addCustomEquip() { if (!currentUser || currentUser === "訪客") return; const l = document.getElementById("new-equip-label"); const c = document.getElementById("new-equip-category"); const label = l.value.trim(); if (!label) { showToast("請輸入項目名稱", "⚠️"); return; } const userData = getUserData(); userData.customEquip.push({ id: "custom-" + Date.now(), category: c.value, label, icon: "📦", isCustom: true }); renderEquipChecklist(); saveUserData(); l.value = ""; showToast("已新增項目！"); if (window.AppHeader) window.AppHeader.render(); }
function deleteCustomEquip(id) { if (!currentUser || currentUser === "訪客") return; const userData = getUserData(); const originalIndex = userData.customEquip.findIndex(i => i.id === id); if (originalIndex === -1) return; const snapshot = { ...userData.customEquip[originalIndex] }; userData.customEquip = userData.customEquip.filter(i => i.id !== id); renderEquipChecklist(); saveUserData(); if (window.AppHeader) window.AppHeader.render(); showUndoToast(`已刪除「${snapshot.label}」`, "🗑", () => { const ud = getUserData(); ud.customEquip.splice(Math.min(originalIndex, ud.customEquip.length), 0, snapshot); renderEquipChecklist(); saveUserData(); if (window.AppHeader) window.AppHeader.render(); showToast("✅ 已還原", "↩️"); }); }

// ==================== 購物清單 ====================
function loadShoppingItems(eventTitle) { if (!currentUser || currentUser === "訪客") return []; const userData = getUserData(); return userData.shopping[eventTitle] || []; }
function saveShoppingItems(eventTitle, items) { if (!currentUser || currentUser === "訪客") return; const userData = getUserData(); userData.shopping[eventTitle] = items; saveUserData(); }
function openShoppingModal(eventTitle) { const m = document.getElementById('shopping-modal'); if (!m) return; m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); const c = document.getElementById('shopping-content'); if (c) c.innerHTML = renderShoppingList(eventTitle); setTimeout(() => setupImageFadeIn(m), 50); }
function closeShoppingModal() { const m = document.getElementById('shopping-modal'); if (m) { m.classList.remove('active'); setTimeout(() => { m.style.display = 'none'; refreshCurrentDay(); }, 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); } }
function refreshCurrentDay() {
  if (!window._lastActiveDay) return;
  const day = window._lastActiveDay;
  const section = document.getElementById('day-section-' + day);
  if (!section) return;

  if (window.Uploads && typeof window.Uploads.renderAllAttachments === 'function') {
    window.Uploads.renderAllAttachments(section);
  }

  if (typeof window.updateShoppingBadges === 'function') {
    window.updateShoppingBadges(day);
  }
}

function renderShoppingList(eventTitle) {
  if (!currentUser || currentUser === "訪客") { return `<div class="text-center py-12"><div class="text-5xl mb-3">🔒</div><p class="text-sm font-bold text-slate-700 mb-1">訪客無法使用購物清單</p><p class="text-xs text-slate-500">請切換為家庭成員身份</p></div>`; }
  const items = loadShoppingItems(eventTitle);
  const userBanner = `<div class="mb-3 flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl p-2.5"><div class="w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-xs shrink-0" style="background:${USER_COLORS[currentUser]}">${currentUser[0].toUpperCase()}</div><div class="text-[11px] font-bold text-sky-800">${escapeHtml(currentUser)} 的購物清單</div></div>`;
  let html = userBanner + `<h3 class="text-sm font-bold text-slate-700 mb-2">${escapeHtml(eventTitle)}</h3>`;
  if (items.length === 0) { html += `<div class="text-center text-slate-400 text-xs py-6">暫無購物項目，請在下方新增</div>`; }
  else {
    html += `<div class="space-y-2 mb-4">`;
    items.forEach((item, index) => { const checked = item.planned ? 'checked' : ''; html += `<div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg"><input type="checkbox" ${checked} onchange="toggleShoppingItem(this)" data-event-title="${escAttr(eventTitle)}" data-index="${index}" class="w-4 h-4 shrink-0"><div class="flex-1 min-w-0"><strong class="text-sm text-slate-800">${escapeHtml(item.name)}</strong>${item.category ? `<span class="text-[10px] text-slate-500 ml-2">${escapeHtml(item.category)}</span>` : ''}${item.note ? `<p class="text-[10px] text-slate-400 mt-0.5 truncate">📝 ${escapeHtml(item.note)}</p>` : ''}</div><button onclick="deleteShoppingItem(this)" data-event-title="${escAttr(eventTitle)}" data-index="${index}" class="text-red-400 hover:text-red-600 p-1 shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>`; });
    html += `</div>`;
  }

  let optionsHtml = `<option value="">— 選擇類別 —</option>`;
  SHOPPING_CATEGORIES.forEach(cat => {
    optionsHtml += `<option value="${escAttr(cat.value)}">${cat.label}</option>`;
  });

  html += `<div class="mt-4 border-t border-slate-200 pt-4"><h4 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">${_svgIcon('plus', 15)} 新增購物項目</h4>`;
  html += `<div class="flex flex-col gap-2">`;
  html += `<input id="new-shopping-name" type="text" placeholder="物品名稱 *" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs">`;
  html += `<div class="flex gap-2">`;
  html += `<select id="new-shopping-category" class="w-2/5 border border-slate-300 rounded-lg px-2 py-2 text-xs bg-white">${optionsHtml}</select>`;
  html += `<input id="new-shopping-note" type="text" placeholder="備註（選填）" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs">`;
  html += `</div>`;
  html += `<button onclick="addShoppingItem(this)" data-event-title="${escAttr(eventTitle)}" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold shrink-0 w-full flex items-center justify-center gap-1">${_svgIcon('plus', 13)} 新增</button>`;
  html += `</div></div>`;

  return html;
}

function addShoppingItem(btn) { const t = btn.dataset.eventTitle; if (!currentUser || currentUser === "訪客") { showToast("請先登入", "⚠️"); return; } const n = document.getElementById('new-shopping-name'); const c = document.getElementById('new-shopping-category'); const no = document.getElementById('new-shopping-note'); const name = n.value.trim(); if (!name) { showToast("請輸入物品名稱", "⚠️"); return; } const items = loadShoppingItems(t); items.push({ name, category: c.value.trim(), note: no.value.trim(), planned: false }); saveShoppingItems(t, items); document.getElementById('shopping-content').innerHTML = renderShoppingList(t); showToast("✅ 已新增購物項目"); haptic(10); if (window.AppHeader) window.AppHeader.render(); }
function toggleShoppingItem(el) { const t = el.dataset.eventTitle; const i = parseInt(el.dataset.index); const items = loadShoppingItems(t); items[i].planned = !items[i].planned; saveShoppingItems(t, items); document.getElementById('shopping-content').innerHTML = renderShoppingList(t); haptic(5); if (window.AppHeader) window.AppHeader.render(); }
function deleteShoppingItem(btn) { const t = btn.dataset.eventTitle; const i = parseInt(btn.dataset.index); const items = loadShoppingItems(t); const snapshot = { ...items[i] }; items.splice(i, 1); saveShoppingItems(t, items); document.getElementById('shopping-content').innerHTML = renderShoppingList(t); if (window.AppHeader) window.AppHeader.render(); showUndoToast(`已刪除「${snapshot.name}」`, "🗑", () => { const cur = loadShoppingItems(t); cur.splice(Math.min(i, cur.length), 0, snapshot); saveShoppingItems(t, cur); document.getElementById('shopping-content').innerHTML = renderShoppingList(t); if (window.AppHeader) window.AppHeader.render(); showToast("✅ 已還原", "↩️"); }); }

function deleteShoppingItemFromOverview(btn) {
  const eventTitle = btn.dataset.eventTitle;
  const index = parseInt(btn.dataset.index);
  const items = loadShoppingItems(eventTitle);
  if (!items[index]) return;
  const snapshot = { ...items[index] };
  items.splice(index, 1);
  saveShoppingItems(eventTitle, items);

  renderAllShoppingContent();
  if (window.AppHeader) window.AppHeader.render();
  haptic(10);

  showUndoToast(`已刪除「${snapshot.name}」`, "🗑", () => {
    const cur = loadShoppingItems(eventTitle);
    cur.splice(Math.min(index, cur.length), 0, snapshot);
    saveShoppingItems(eventTitle, cur);
    renderAllShoppingContent();
    if (window.AppHeader) window.AppHeader.render();
    showToast("✅ 已還原", "↩️");
  });
}
window.deleteShoppingItemFromOverview = deleteShoppingItemFromOverview;

// ==================== 購物清單總覽 ====================
function openAllShoppingModal() { const m = document.getElementById('all-shopping-modal'); if (!m) return; m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); renderAllShoppingContent(); haptic(8); }
function closeAllShoppingModal() { const m = document.getElementById('all-shopping-modal'); if (m) { m.classList.remove('active'); setTimeout(() => { m.style.display = 'none'; addShoppingFormOpen = false; refreshCurrentDay(); }, 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); } }

function getAllShoppingItems() {
  if (!currentUser || currentUser === "訪客") return [];
  const userData = getUserData();
  const groups = [];

  const tempItems = userData.shopping[TEMP_PURCHASE_TITLE] || [];
  if (tempItems.length > 0) {
    groups.push({
      day: 0,
      dateLabel: "🛒 臨時購買",
      eventTitle: TEMP_PURCHASE_TITLE,
      eventTime: "",
      eventIndex: -1,
      items: tempItems,
      isTemp: true
    });
  }

  winterItineraries.forEach(day => {
    day.events.forEach(event => {
      const items = userData.shopping[event.title] || [];
      if (items.length > 0) {
        groups.push({
          day: day.day,
          dateLabel: day.dateLabel,
          eventTitle: event.title,
          eventTime: event.time,
          eventIndex: day.events.indexOf(event),
          items: items,
          isTemp: false
        });
      }
    });
  });
  return groups;
}

function setShoppingViewMode(mode) {
  shoppingViewMode = mode === 'byCategory' ? 'byCategory' : 'byEvent';
  haptic(6);
  renderAllShoppingContent();
}
window.setShoppingViewMode = setShoppingViewMode;

function toggleAddShoppingForm() {
  addShoppingFormOpen = !addShoppingFormOpen;
  renderAllShoppingContent();
  if (addShoppingFormOpen) {
    setTimeout(() => {
      const el = document.getElementById('add-shopping-name');
      if (el) el.focus();
    }, 100);
  }
  haptic(6);
}
window.toggleAddShoppingForm = toggleAddShoppingForm;

function submitNewShoppingItem() {
  if (!currentUser || currentUser === "訪客") { showToast("請先登入", "⚠️"); return; }
  const nameEl = document.getElementById('add-shopping-name');
  const catEl = document.getElementById('add-shopping-category');
  const eventEl = document.getElementById('add-shopping-event');
  const noteEl = document.getElementById('add-shopping-note');
  if (!nameEl || !eventEl) return;

  const name = nameEl.value.trim();
  const category = catEl.value;
  const eventTitle = eventEl.value;
  const note = noteEl.value.trim();

  if (!name) { showToast("請輸入物品名稱", "⚠️"); haptic(50); nameEl.focus(); return; }
  if (!eventTitle) { showToast("請選擇要歸到哪一天", "⚠️"); haptic(50); eventEl.focus(); return; }

  const items = loadShoppingItems(eventTitle);
  items.push({ name, category, note, planned: false });
  saveShoppingItems(eventTitle, items);

  nameEl.value = '';
  noteEl.value = '';
  nameEl.focus();

  showToast("✅ 已新增購物項目");
  haptic(10);

  renderAllShoppingContent();
  if (window.AppHeader) window.AppHeader.render();
}
window.submitNewShoppingItem = submitNewShoppingItem;

function buildEventOptionsHtml() {
  let html = `<optgroup label="🛒 不指定">
    <option value="${escAttr(TEMP_PURCHASE_TITLE)}">🛒 臨時購買（旅途中看到就買）</option>
  </optgroup>`;
  winterItineraries.forEach(day => {
    html += `<optgroup label="Day ${day.day} · ${escapeHtml(day.dateLabel)}">`;
    day.events.forEach(evt => {
      html += `<option value="${escAttr(evt.title)}">${escapeHtml(evt.time)} · ${escapeHtml(evt.title)}</option>`;
    });
    html += `</optgroup>`;
  });
  return html;
}

function renderAllShoppingContent() {
  const container = document.getElementById('all-shopping-content'); if (!container) return;
  if (!currentUser) { container.innerHTML = '<div class="text-center py-8 text-slate-500">請先登入</div>'; return; }
  if (currentUser === "訪客") { container.innerHTML = `<div class="text-center py-12"><div class="text-5xl mb-3">🔒</div><p class="text-sm font-bold text-slate-700 mb-1">訪客無法使用購物清單</p><p class="text-xs text-slate-500">請切換為家庭成員身份</p></div>`; return; }

  const groups = getAllShoppingItems();
  const userBanner = `<div class="mb-3 flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl p-3"><div class="w-10 h-10 rounded-full text-white flex items-center justify-center font-black shrink-0" style="background:${USER_COLORS[currentUser]}">${currentUser[0].toUpperCase()}</div><div class="text-xs font-black text-sky-800">${escapeHtml(currentUser)} 的購物清單總覽</div></div>`;

  const addFormHtml = `
    <button onclick="toggleAddShoppingForm()" class="w-full mb-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-sm py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm">
      <span style="display:inline-flex;align-items:center">${_svgIcon(addShoppingFormOpen ? 'x' : 'plus', 16)}</span>
      <span>${addShoppingFormOpen ? '收起表單' : '新增物品'}</span>
    </button>
    <div id="add-shopping-form" class="${addShoppingFormOpen ? '' : 'hidden'} mb-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 space-y-3">
      <div class="text-[11px] font-black text-emerald-800 uppercase tracking-wider mb-1">新增物品到購物清單</div>
      <input id="add-shopping-name" type="text" placeholder="物品名稱 *（例：白色戀人餅乾）" class="w-full border-2 border-emerald-200 rounded-lg px-3 py-2.5 text-sm font-bold bg-white focus:outline-none focus:border-emerald-400">
      <div class="flex gap-2">
        <select id="add-shopping-category" class="w-1/2 border-2 border-emerald-200 rounded-lg px-2 py-2.5 text-xs font-bold bg-white focus:outline-none focus:border-emerald-400">
          <option value="">— 類別 —</option>
          ${SHOPPING_CATEGORIES.map(c => `<option value="${escAttr(c.value)}">${c.label}</option>`).join('')}
        </select>
        <select id="add-shopping-event" class="flex-1 border-2 border-emerald-200 rounded-lg px-2 py-2.5 text-xs font-bold bg-white focus:outline-none focus:border-emerald-400">
          <option value="">— 歸到哪一天？ * —</option>
          ${buildEventOptionsHtml()}
        </select>
      </div>
      <input id="add-shopping-note" type="text" placeholder="備註（選填）" class="w-full border-2 border-emerald-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-emerald-400">
      <button onclick="submitNewShoppingItem()" class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black py-2.5 rounded-lg transition flex items-center justify-center gap-1">${_svgIcon('check', 14)} 新增</button>
      <p class="text-[10px] text-emerald-600 leading-relaxed flex items-center gap-1">${_svgIcon('info', 11)} 選「🛒 臨時購買」可將物品加入不分景點的清單</p>
    </div>
  `;

  if (groups.length === 0) {
    container.innerHTML = userBanner + addFormHtml + `
      <div class="text-center py-10 px-4">
        <div class="text-6xl mb-3">🛒</div>
        <p class="text-sm font-bold text-slate-700 mb-1">購物清單還是空的</p>
        <p class="text-xs text-slate-500 leading-relaxed">用上方按鈕新增<br>或在行程卡片的「🛍️ 購物清單」中加入</p>
      </div>`;
    return;
  }

  let totalItems = 0; let checkedItems = 0;
  groups.forEach(g => { g.items.forEach(item => { totalItems++; if (item.planned) checkedItems++; }); });
  const percent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  let html = userBanner;
  html += `<div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-4"><div class="flex items-center justify-between mb-2"><span class="text-xs font-bold text-emerald-800">${percent === 100 ? '🎉 全部買齊！' : '📊 購物進度'}</span><span class="text-sm font-black text-emerald-700">${checkedItems} / ${totalItems}</span></div><div class="h-2 bg-white/70 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" style="width:${percent}%"></div></div></div>`;

  html += addFormHtml;

  html += `<div class="flex items-center gap-2 mb-3 bg-slate-100 border border-slate-200 rounded-xl p-1">`;
  html += `<button onclick="setShoppingViewMode('byEvent')" class="${shoppingViewMode === 'byEvent' ? 'bg-white shadow-sm text-sky-800' : 'text-slate-500'} flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5"><span style="display:inline-flex">${_svgIcon('calendar', 13)}</span> 按景點</button>`;
  html += `<button onclick="setShoppingViewMode('byCategory')" class="${shoppingViewMode === 'byCategory' ? 'bg-white shadow-sm text-sky-800' : 'text-slate-500'} flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5"><span style="display:inline-flex">${_svgIcon('list', 13)}</span> 按類別</button>`;
  html += `</div>`;

  if (shoppingViewMode === 'byEvent') {
    html += renderShoppingByEvent(groups);
  } else {
    html += renderShoppingByCategory(groups);
  }

  container.innerHTML = html;

  if (addShoppingFormOpen) {
    const nameEl = document.getElementById('add-shopping-name');
    if (nameEl) {
      nameEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); submitNewShoppingItem(); }
      });
    }
  }
}

function renderShoppingByEvent(groups) {
  let html = '';
  groups.forEach((group, gIdx) => {
    const groupChecked = group.items.filter(i => i.planned).length;
    const groupTotal = group.items.length;
    const allDone = groupChecked === groupTotal;
    const safeTitle = escAttr(group.eventTitle);

    const badgeText = group.isTemp ? '🛒' : `D${group.day}`;
    const badgeClass = group.isTemp ? 'bg-amber-100 text-amber-700' : (allDone ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700');

    html += `<details class="mb-3 bg-white border ${allDone ? 'border-emerald-200' : 'border-slate-200'} rounded-2xl shadow-sm overflow-hidden group" ${gIdx === 0 ? 'open' : ''}>`;
    html += `<summary class="cursor-pointer px-4 py-3 hover:bg-slate-50 transition-colors list-none flex items-center gap-3">`;
    html += `<div class="shrink-0 w-10 h-10 rounded-full ${badgeClass} flex items-center justify-center text-xs font-black border-2 border-white shadow-sm">${badgeText}</div>`;
    html += `<div class="flex-1 min-w-0"><div class="text-[10px] font-bold text-sky-600 tracking-wide">${escapeHtml(group.dateLabel)}</div><div class="text-sm font-bold text-slate-800 truncate">${escapeHtml(group.eventTitle)}</div></div>`;
    html += `<div class="shrink-0 flex items-center gap-1.5"><span class="text-[10px] font-black ${allDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'} px-2 py-0.5 rounded-full">${groupChecked}/${groupTotal}</span><svg class="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div>`;
    html += `</summary>`;
    html += `<div class="border-t border-slate-100 bg-slate-50/50 p-3 space-y-3">`;

    const byCat = {};
    group.items.forEach((item, idx) => {
      const cat = (item.category || '').trim() || '未分類';
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push({ item, idx });
    });

    const catKeys = Object.keys(byCat);
    if (catKeys.length === 1 && catKeys[0] === '未分類') {
      group.items.forEach((item, idx) => { html += renderShoppingItemRow(item, safeTitle, idx); });
    } else {
      catKeys.forEach(cat => {
        const catItems = byCat[cat];
        const catChecked = catItems.filter(x => x.item.planned).length;
        const catAllDone = catChecked === catItems.length;
        html += `<div class="mb-2">`;
        html += `<div class="flex items-center gap-2 mb-1.5 px-1">`;
        html += `<span class="text-[11px] font-black ${catAllDone ? 'text-emerald-700' : 'text-slate-600'}">${escapeHtml(cat)}</span>`;
        html += `<span class="text-[10px] font-bold ${catAllDone ? 'text-emerald-600' : 'text-slate-400'}">${catChecked}/${catItems.length}</span>`;
        html += `</div>`;
        html += `<div class="space-y-1.5">`;
        catItems.forEach(({ item, idx }) => { html += renderShoppingItemRow(item, safeTitle, idx); });
        html += `</div></div>`;
      });
    }

    if (!group.isTemp) {
      html += `<button onclick="jumpToEvent(${group.day}, ${group.eventIndex})" class="mt-2 w-full text-[10px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 py-2 rounded-lg transition active:scale-95 flex items-center justify-center gap-1">${_svgIcon('location', 11)} 前往行程查看</button>`;
    }
    html += `</div></details>`;
  });
  return html;
}

function renderShoppingByCategory(groups) {
  const byCategory = {};
  groups.forEach(group => {
    group.items.forEach((item, idx) => {
      const cat = (item.category || '').trim() || '未分類';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({ item, idx, group });
    });
  });

  const catKeys = Object.keys(byCategory).sort((a, b) => {
    if (a === '未分類') return 1;
    if (b === '未分類') return -1;
    return a.localeCompare(b, 'zh-HK');
  });

  let html = '';
  catKeys.forEach((cat, cIdx) => {
    const catItems = byCategory[cat];
    const catChecked = catItems.filter(x => x.item.planned).length;
    const catTotal = catItems.length;
    const catAllDone = catChecked === catTotal;

    html += `<details class="mb-3 bg-white border ${catAllDone ? 'border-emerald-200' : 'border-slate-200'} rounded-2xl shadow-sm overflow-hidden group" ${cIdx === 0 ? 'open' : ''}>`;
    html += `<summary class="cursor-pointer px-4 py-3 hover:bg-slate-50 transition-colors list-none flex items-center gap-3">`;
    html += `<div class="shrink-0 w-10 h-10 rounded-full ${catAllDone ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'} flex items-center justify-center border-2 border-white shadow-sm">${_svgIcon('list', 16)}</div>`;
    html += `<div class="flex-1 min-w-0"><div class="text-sm font-bold text-slate-800 truncate">${escapeHtml(cat)}</div></div>`;
    html += `<div class="shrink-0 flex items-center gap-1.5"><span class="text-[10px] font-black ${catAllDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'} px-2 py-0.5 rounded-full">${catChecked}/${catTotal}</span><svg class="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div>`;
    html += `</summary>`;
    html += `<div class="border-t border-slate-100 bg-slate-50/50 p-3 space-y-1.5">`;

    catItems.forEach(({ item, idx, group }) => {
      const safeTitle = escAttr(group.eventTitle);
      const planned = item.planned;
      const badgeText = group.isTemp ? '🛒' : `D${group.day}`;
      const badgeClass = group.isTemp ? 'text-amber-700 bg-amber-100' : 'text-sky-700 bg-sky-100';
      html += `<div class="flex items-center gap-2.5 p-2.5 bg-white border ${planned ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'} rounded-xl transition-all">`;
      html += `<input type="checkbox" ${planned ? 'checked' : ''} data-event-title="${safeTitle}" data-index="${idx}" onchange="handleAllShoppingToggle(this)" class="w-4 h-4 shrink-0 cursor-pointer">`;
      html += `<div class="flex-1 min-w-0 cursor-pointer" onclick="this.previousElementSibling.click()">`;
      html += `<div class="flex items-center gap-2">`;
      html += `<strong class="text-[13px] ${planned ? 'text-slate-500 line-through' : 'text-slate-800'} truncate">${escapeHtml(item.name)}</strong>`;
      html += `<span class="text-[9px] ${badgeClass} px-1.5 py-0.5 rounded shrink-0 font-bold">${badgeText}</span>`;
      html += `</div>`;
      html += `<div class="text-[10px] text-slate-500 mt-0.5 truncate">${escapeHtml(group.eventTitle)}</div>`;
      if (item.note) html += `<p class="text-[10px] text-slate-500 mt-0.5 truncate">📝 ${escapeHtml(item.note)}</p>`;
      html += `</div>`;
      html += `<button type="button" onclick="deleteShoppingItemFromOverview(this)" data-event-title="${safeTitle}" data-index="${idx}" class="text-red-400 hover:text-red-600 p-1 shrink-0 transition" title="刪除">`;
      html += `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
      html += `</button>`;
      html += `</div>`;
    });

    html += `</div></details>`;
  });
  return html;
}

function renderShoppingItemRow(item, safeTitle, idx) {
  const planned = item.planned;
  let html = `<div class="flex items-center gap-2.5 p-2.5 bg-white border ${planned ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'} rounded-xl transition-all">`;
  html += `<input type="checkbox" ${planned ? 'checked' : ''} data-event-title="${safeTitle}" data-index="${idx}" onchange="handleAllShoppingToggle(this)" class="w-4 h-4 shrink-0 cursor-pointer">`;
  html += `<div class="flex-1 min-w-0 cursor-pointer" onclick="this.previousElementSibling.click()">`;
  html += `<div class="flex items-center gap-2">`;
  html += `<strong class="text-[13px] ${planned ? 'text-slate-500 line-through' : 'text-slate-800'} truncate">${escapeHtml(item.name)}</strong>`;
  if (item.category) {
    html += `<span class="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">${escapeHtml(item.category)}</span>`;
  }
  html += `</div>`;
  if (item.note) html += `<p class="text-[10px] text-slate-500 mt-0.5 truncate">📝 ${escapeHtml(item.note)}</p>`;
  html += `</div>`;
  html += `<button type="button" onclick="deleteShoppingItemFromOverview(this)" data-event-title="${safeTitle}" data-index="${idx}" class="text-red-400 hover:text-red-600 p-1 shrink-0 transition" title="刪除">`;
  html += `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
  html += `</button>`;
  html += `</div>`;
  return html;
}

function handleAllShoppingToggle(el) {
  const eventTitle = el.dataset.eventTitle;
  const index = parseInt(el.dataset.index);
  const items = loadShoppingItems(eventTitle);
  if (!items[index]) return;
  items[index].planned = !items[index].planned;
  saveShoppingItems(eventTitle, items);
  haptic(5);
  const wrapper = el.parentElement;
  if (wrapper) {
    wrapper.classList.toggle('border-emerald-200', items[index].planned);
    wrapper.classList.toggle('bg-emerald-50/40', items[index].planned);
    const strong = wrapper.querySelector('strong');
    if (strong) { strong.classList.toggle('text-slate-500', items[index].planned); strong.classList.toggle('line-through', items[index].planned); strong.classList.toggle('text-slate-800', !items[index].planned); }
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
function jumpToEvent(day, eventIndex) { closeAllShoppingModal(); switchDay(day); setTimeout(() => { const cards = document.querySelectorAll(`#day-section-${day} details.event-card`); const target = cards[eventIndex]; if (target) { target.open = true; target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.style.transition = 'box-shadow 0.4s'; target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.4)'; setTimeout(() => { target.style.boxShadow = ''; }, 1500); } }, 400); haptic(8); }

// ==================== 本地儲存 ====================
function saveLocalCheckedItems() { localStorage.setItem("tohoku_checked_items", JSON.stringify(state.checkedItems)); localStorage.setItem("custom_booking_items", JSON.stringify(customBookingItems)); }
function saveCustomItems() { localStorage.setItem("custom_booking_items", JSON.stringify(customBookingItems)); }
function loadCustomItems() { const b = localStorage.getItem("custom_booking_items"); if (b) { try { customBookingItems = JSON.parse(b); } catch(e) {} } }
function restoreChecklistUI() { renderBookingChecklist(); renderEquipChecklist(); renderAllShoppingContent(); }

// ==================== 模態視窗開關 ====================
function toggleBookingModal() { const modal = document.getElementById('booking-modal'); if (modal.classList.contains('hidden')) { showModal('booking-modal'); modal.classList.remove('hidden'); renderBookingChecklist(); } else { hideModal('booking-modal'); setTimeout(() => modal.classList.add('hidden'), 300); } }
function closeBookingModal() { hideModal('booking-modal'); setTimeout(() => document.getElementById('booking-modal').classList.add('hidden'), 300); }
function toggleEquipModal() { const modal = document.getElementById('equip-modal'); if (modal.classList.contains('hidden')) { showModal('equip-modal'); modal.classList.remove('hidden'); renderEquipChecklist(); } else { hideModal('equip-modal'); setTimeout(() => modal.classList.add('hidden'), 300); } }
function closeEquipModal() { hideModal('equip-modal'); setTimeout(() => document.getElementById('equip-modal').classList.add('hidden'), 300); }

window.toggleBookingModal = toggleBookingModal;
window.closeBookingModal = closeBookingModal;
window.toggleEquipModal = toggleEquipModal;
window.closeEquipModal = closeEquipModal;
window.openShoppingModal = openShoppingModal;
window.closeShoppingModal = closeShoppingModal;
window.openAllShoppingModal = openAllShoppingModal;
window.closeAllShoppingModal = closeAllShoppingModal;

// ============================================================
// ⭐ v7.5：只更新購物徽章
// ============================================================
function updateShoppingBadges(day) {
  const section = document.getElementById('day-section-' + day);
  if (!section) return;
  const cards = section.querySelectorAll('details.event-card');
  cards.forEach(card => {
    const titleEl = card.querySelector('.event-title');
    if (!titleEl) return;
    const eventTitle = titleEl.textContent.trim();
    const count = loadShoppingItems(eventTitle).length;
    const btn = card.querySelector('.event-action-btn[data-event-title]');
    if (!btn) return;
    let badge = btn.querySelector('.badge');
    if (count > 0) {
      if (badge) badge.textContent = count;
      else {
        badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = count;
        btn.appendChild(badge);
      }
    } else if (badge) {
      badge.remove();
    }
  });
}
window.updateShoppingBadges = updateShoppingBadges;

console.log('[Lists] v7.6（去 Emoji UI）載入完成');