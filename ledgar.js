// ==================== 全域變數與狀態 ====================
const members = ["余生", "bowie", "shandy", "Connie"];

const memberSymbols = {
    "余生": "🌊",
    "bowie": "🌸",
    "shandy": "🌲",
    "Connie": "🌺"
};

const memberPasswords = {
    "余生": ["🔵", "🟥"],
    "bowie": ["🩷", "🟨"],
    "shandy": ["🟢", "⬛"],
    "Connie": ["🟣", "🟦"]
};

const symbolPool = ["🔵", "🩷", "🟢", "🟣", "🔴", "🟠", "🟡", "🟤", "⚫", "⚪", "🟦", "🟧", "🟨", "🟩", "🟪", "🟥", "⬛", "⬜", "🔶", "🔷"];

const memberStyle = {
    "余生": { badge: "bg-blue-100 text-blue-800 border-blue-200", solid: "bg-blue-600 text-white border-blue-700", soft: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100", text: "text-blue-700", avatar: "bg-blue-500" },
    "bowie": { badge: "bg-pink-100 text-pink-800 border-pink-200", solid: "bg-pink-500 text-white border-pink-600", soft: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100", text: "text-pink-600", avatar: "bg-pink-400" },
    "shandy": { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", solid: "bg-emerald-500 text-white border-emerald-600", soft: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", text: "text-emerald-600", avatar: "bg-emerald-500" },
    "Connie": { badge: "bg-purple-100 text-purple-800 border-purple-200", solid: "bg-purple-500 text-white border-purple-600", soft: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100", text: "text-purple-600", avatar: "bg-purple-400" }
};

let state = {
    currentMainTab: "ledger",
    viewingAs: members[0],
    activePayer: members[0],
    activeSplitWith: [...members],
    expenses: [],
    checkedItems: {},
    history: []
};

let editingExpenseId = null;
let lastExpense = null;
let verifiedMember = null;
let selectedMember = null;
let selectedPasswordSymbols = [];
let failedAttempts = 0;
let lockUntil = 0;
let settlementStatus = JSON.parse(localStorage.getItem("settlement_status")) || {};
const exchangeRates = { JPY: 0.052, HKD: 1, TWD: 0.24, CNY: 1.1, USD: 7.8 };

// ==================== 雲端同步 ====================
function updateCloudBadge(isConnected) {
    const badge = document.getElementById("cloud-sync-badge");
    if (badge) {
        if (isConnected) {
            badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span> 雲端連線';
            badge.classList.remove("bg-red-100", "text-red-700", "border-red-200");
            badge.classList.add("bg-sky-100", "text-sky-700", "border-sky-200");
        } else {
            badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> 雲端離線';
            badge.classList.remove("bg-sky-100", "text-sky-700", "border-sky-200");
            badge.classList.add("bg-red-100", "text-red-700", "border-red-200");
        }
    }
}

firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        console.warn("尚未登入，嘗試匿名登入...");
        firebase.auth().signInAnonymously().catch(err => console.warn("匿名登入失敗:", err));
        return;
    }
    console.log("已登入:", user.uid);
    updateCloudBadge(true);
    window.dbRef.onSnapshot(docSnap => {
        if (docSnap.exists) {
            const cloudData = docSnap.data();
            if (cloudData && cloudData.expenses) {
                state.expenses = sanitizeExpenses(cloudData.expenses);
                saveLocalExpenses(); 
                updateLedgerUI();    
            }
        }
    }, err => {
        console.warn("Firestore 同步警告:", err);
        updateCloudBadge(false);
    });
});

async function syncDataToCloud() {
    try {
        if (!firebase.auth().currentUser) return; 
        await window.dbRef.set({
            expenses: state.expenses,
            checkedItems: state.checkedItems,
            history: state.history,
            updatedAt: Date.now()
        }, { merge: true }); 
        updateCloudBadge(true);
    } catch(e) {
        console.warn("寫入雲端失敗:", e);
        updateCloudBadge(false);
    }
}

async function forceSync() {
    try {
        await syncDataToCloud();
        showToast("✅ 已強制同步到雲端！");
    } catch(e) {
        console.error("強制同步失敗:", e);
        showToast("❌ 同步失敗，請查看 Console", "❌");
    }
}

// ==================== 分頁切換 ====================
function switchLedgerSubTab(tabName) {
    document.getElementById("subview-records").classList.add("hidden");
    document.getElementById("subview-balances").classList.add("hidden");
    document.getElementById("subview-suggested").classList.add("hidden");
    document.getElementById("subview-history").classList.add("hidden");
    
    const inactiveClass = "whitespace-nowrap flex-1 py-2.5 px-3 rounded-xl text-xs font-black text-slate-600 hover:bg-white/50 transition";
    document.getElementById("tab-records-btn").className = inactiveClass;
    document.getElementById("tab-balances-btn").className = inactiveClass;
    document.getElementById("tab-suggested-btn").className = inactiveClass + " flex items-center justify-center gap-1";
    document.getElementById("tab-history-btn").className = inactiveClass;

    document.getElementById(`subview-${tabName}`).classList.remove("hidden");
    const activeClass = "whitespace-nowrap flex-1 py-2.5 px-3 rounded-xl text-xs font-black bg-white text-sky-900 shadow-sm transition";
    
    if (tabName === "records") {
        document.getElementById("tab-records-btn").className = activeClass;
    } else if (tabName === "balances") {
        document.getElementById("tab-balances-btn").className = activeClass;
    } else if (tabName === "suggested") {
        document.getElementById("tab-suggested-btn").className = activeClass + " flex items-center justify-center gap-1";
    } else if (tabName === "history") {
        document.getElementById("tab-history-btn").className = activeClass;
        renderHistoryList();
    }
}

// ==================== 身份驗證（雙符號密碼） ====================
function renderIdentitySelector() {
    const selector = document.getElementById("identity-selector");
    if (!selector) return;
    selector.innerHTML = "";
    members.forEach(member => {
        const symbol = memberSymbols[member];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.member = member;
        btn.innerHTML = `<span class="text-xl">${symbol}</span><span class="text-[9px] font-bold">${member}</span>`;
        btn.className = "py-2 px-1 rounded-xl border-2 border-slate-200 hover:border-sky-400 transition flex flex-col items-center";
        btn.onclick = () => {
            selectedMember = member;
            verifiedMember = null;
            selectedPasswordSymbols = [];
            failedAttempts = 0;
            lockUntil = 0;
            selector.querySelectorAll("button").forEach(b => {
                b.className = "py-2 px-1 rounded-xl border-2 border-slate-200 hover:border-sky-400 transition flex flex-col items-center";
            });
            btn.className = "py-2 px-1 rounded-xl border-2 border-sky-500 bg-sky-50 transition flex flex-col items-center";
            renderSymbolPasswordGrid();
            updateSelectedSymbols();
            const status = document.getElementById("identity-status");
            status.classList.add("hidden");
        };
        selector.appendChild(btn);
    });
}

function renderSymbolPasswordGrid() {
    const grid = document.getElementById("symbol-password-grid");
    if (!grid) return;
    grid.innerHTML = "";
    symbolPool.forEach(symbol => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.symbol = symbol;
        btn.innerText = symbol;
        btn.className = "w-full aspect-square text-2xl rounded-lg border-2 border-slate-200 hover:border-sky-400 hover:bg-sky-50 transition flex items-center justify-center";
        btn.onclick = () => {
            if (selectedPasswordSymbols.length >= 2) return;
            selectedPasswordSymbols.push(symbol);
            btn.classList.add("bg-sky-100", "border-sky-500");
            updateSelectedSymbols();
        };
        grid.appendChild(btn);
    });
}

function updateSelectedSymbols() {
    const container = document.getElementById("selected-symbols");
    if (!container) return;
    container.innerHTML = "";
    selectedPasswordSymbols.forEach((symbol, index) => {
        const span = document.createElement("span");
        span.innerText = symbol;
        span.className = "text-2xl";
        span.dataset.index = index;
        container.appendChild(span);
    });
}

function verifyIdentity() {
    if (!selectedMember) {
        showToast("⚠️ 請先選擇身份！", "⚠️");
        return;
    }
    
    const now = Date.now();
    if (now < lockUntil) {
        const waitSeconds = Math.ceil((lockUntil - now) / 1000);
        const status = document.getElementById("identity-status");
        status.innerHTML = `⏳ 嘗試次數過多，請等待 ${waitSeconds} 秒後再試。`;
        status.className = "text-[10px] font-bold mt-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5";
        status.classList.remove("hidden");
        showToast(`⏳ 請等待 ${waitSeconds} 秒`, "⏳");
        return;
    }
    
    if (selectedPasswordSymbols.length !== 2) {
        showToast("⚠️ 請點選兩個符號！", "⚠️");
        return;
    }
    
    const expected = memberPasswords[selectedMember];
    const isCorrect = selectedPasswordSymbols[0] === expected[0] && selectedPasswordSymbols[1] === expected[1];
    
    const status = document.getElementById("identity-status");
    if (isCorrect) {
        verifiedMember = selectedMember;
        failedAttempts = 0;
        status.innerHTML = `✅ 已驗證為 <strong>${selectedMember} ${memberSymbols[selectedMember]}</strong>，可以記帳了！`;
        status.className = "text-[10px] font-bold mt-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1.5";
        status.classList.remove("hidden");
        showToast(`✅ 歡迎 ${selectedMember}！已驗證成功`);
    } else {
        failedAttempts++;
        if (failedAttempts >= 5) {
            lockUntil = Date.now() + 30000;
            status.innerHTML = `❌ 嘗試次數過多，請等待 30 秒後再試。`;
            status.className = "text-[10px] font-bold mt-2 text-red-500 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5";
            status.classList.remove("hidden");
            showToast("⏳ 已鎖定 30 秒！", "⏳");
        } else {
            status.innerHTML = `❌ 符號密碼錯誤，還剩 ${5 - failedAttempts} 次機會。`;
            status.className = "text-[10px] font-bold mt-2 text-red-500 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5";
            status.classList.remove("hidden");
            showToast("❌ 符號密碼錯誤！", "❌");
        }
        selectedPasswordSymbols = [];
        renderSymbolPasswordGrid();
        updateSelectedSymbols();
    }
}

// ==================== 記帳功能 ====================
function openExpenseModal() {
    verifiedMember = null;
    selectedMember = null;
    selectedPasswordSymbols = [];
    failedAttempts = 0;
    lockUntil = 0;
    
    const backdrop = document.getElementById("expense-modal-backdrop");
    const modal = document.getElementById("expense-modal");
    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");
    modal.offsetWidth;
    backdrop.classList.remove("opacity-0");
    backdrop.classList.add("opacity-100");
    modal.classList.remove("translate-y-full", "md:translate-y-8", "md:scale-95", "opacity-0");
    modal.classList.add("translate-y-0", "md:translate-y-0", "md:scale-100", "opacity-100");
    renderIdentitySelector();
    renderLedgerSelectors();
    updateEstimatedHKD();
}

function closeExpenseModal() {
    const backdrop = document.getElementById("expense-modal-backdrop");
    const modal = document.getElementById("expense-modal");
    backdrop.classList.remove("opacity-100");
    backdrop.classList.add("opacity-0");
    modal.classList.remove("translate-y-0", "md:translate-y-0", "md:scale-100", "opacity-100");
    modal.classList.add("translate-y-full", "md:translate-y-8", "md:scale-95", "opacity-0");
    setTimeout(() => {
        backdrop.classList.add("hidden");
        modal.classList.add("hidden");
        cancelEdit();
    }, 300);
}

function cancelEdit() {
    document.getElementById("ledger-desc").value = "";
    document.getElementById("ledger-amount").value = "";
    updateEstimatedHKD();
    editingExpenseId = null;
    
    setTimeout(() => {
        document.querySelector("#expense-modal h3").innerHTML = '<span class="bg-sky-100 text-sky-700 w-8 h-8 rounded-full flex items-center justify-center text-base">✍️</span> 新增團隊花費';
        document.getElementById("btn-save-expense").innerHTML = '<span>寫入帳本</span><span class="text-lg">✍️</span>';
    }, 300);
}

function openEditExpenseModal(expenseId) {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;
    
    editingExpenseId = expenseId;
    
    document.getElementById("ledger-day").value = expense.day;
    document.getElementById("ledger-category").value = expense.category;
    document.getElementById("ledger-desc").value = expense.desc;
    document.getElementById("ledger-amount").value = expense.amount;
    document.getElementById("ledger-currency").value = expense.currency;
    
    state.activePayer = expense.payer;
    state.activeSplitWith = [...expense.splitWith];
    
    verifiedMember = null;
    selectedMember = null;
    selectedPasswordSymbols = [];
    failedAttempts = 0;
    lockUntil = 0;
    
    renderIdentitySelector();
    renderLedgerSelectors();
    updateEstimatedHKD();
    
    const backdrop = document.getElementById("expense-modal-backdrop");
    const modal = document.getElementById("expense-modal");
    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");
    modal.offsetWidth;
    backdrop.classList.remove("opacity-0");
    backdrop.classList.add("opacity-100");
    modal.classList.remove("translate-y-full", "md:translate-y-8", "md:scale-95", "opacity-0");
    modal.classList.add("translate-y-0", "md:translate-y-0", "md:scale-100", "opacity-100");
    
    document.querySelector("#expense-modal h3").innerHTML = '<span class="bg-sky-100 text-sky-700 w-8 h-8 rounded-full flex items-center justify-center text-base">✏️</span> 編輯團隊花費';
    document.getElementById("btn-save-expense").innerHTML = '<span>更新帳本</span><span class="text-lg">💾</span>';
}

function renderLedgerSelectors() {
    const payerGrid = document.getElementById("payer-grid");
    if (payerGrid) {
        payerGrid.innerHTML = "";
        members.forEach(member => {
            const style = memberStyle[member] || memberStyle["余生"];
            const symbol = memberSymbols[member] || "";
            const btn = document.createElement("button");
            btn.type = "button";
            btn.onclick = () => { state.activePayer = member; renderLedgerSelectors(); };
            btn.className = `py-1.5 px-1 text-xs rounded-xl font-bold transition border text-center min-h-[48px] flex flex-col items-center justify-center gap-0.5 ${state.activePayer === member ? style.solid + " shadow-sm scale-105" : style.soft}`;
            btn.innerHTML = `<div class="w-5 h-5 rounded-full ${state.activePayer === member ? "bg-white/20 text-white" : style.avatar + " text-white"} flex items-center justify-center text-[10px] font-black shadow-sm">${member[0].toUpperCase()}</div><span class="${state.activePayer === member ? "text-white" : style.text} text-[10px]">${member} ${symbol}</span>`;
            payerGrid.appendChild(btn);
        });
    }
    
    const splittersGrid = document.getElementById("splitters-grid");
    if (splittersGrid) {
        splittersGrid.innerHTML = "";
        members.forEach(member => {
            const style = memberStyle[member] || memberStyle["余生"];
            const symbol = memberSymbols[member] || "";
            const btn = document.createElement("button");
            btn.type = "button";
            btn.onclick = () => toggleSplitter(member);
            const isActive = state.activeSplitWith.includes(member);
            btn.className = `py-1.5 px-1 text-[11px] rounded-lg font-bold transition border text-center min-h-[40px] flex items-center justify-center gap-1.5 ${isActive ? style.solid + " shadow-sm" : style.soft}`;
            btn.innerHTML = `<div class="w-3.5 h-3.5 rounded-full border border-white/60 ${isActive ? "bg-white" : "bg-white/50"} flex items-center justify-center shrink-0 shadow-inner"><div class="w-2 h-2 rounded-full ${isActive ? style.avatar : "bg-transparent"}"></div></div><span>${member} ${symbol}</span>`;
            splittersGrid.appendChild(btn);
        });
    }
}

function toggleSplitter(member) {
    const index = state.activeSplitWith.indexOf(member);
    if (index > -1) {
        if (state.activeSplitWith.length > 1) state.activeSplitWith.splice(index, 1);
    } else {
        state.activeSplitWith.push(member);
    }
    renderLedgerSelectors();
}

function setSplitPreset(preset) {
    state.activeSplitWith = preset === "all" ? [...members] : [...members];
    renderLedgerSelectors();
}

function useLastExpense() {
    if (!lastExpense) {
        showToast("⚠️ 目前沒有上一筆資料", "⚠️");
        return;
    }
    document.getElementById("ledger-day").value = lastExpense.day;
    document.getElementById("ledger-category").value = lastExpense.category;
    document.getElementById("ledger-desc").value = lastExpense.desc;
    document.getElementById("ledger-amount").value = lastExpense.amount;
    document.getElementById("ledger-currency").value = lastExpense.currency;
    state.activePayer = lastExpense.payer;
    state.activeSplitWith = [...lastExpense.splitWith];
    renderLedgerSelectors();
    updateEstimatedHKD();
    showToast("↩️ 已帶入上一筆資料");
}

function updateEstimatedHKD() {
    const amountInput = document.getElementById("ledger-amount");
    const currencySelect = document.getElementById("ledger-currency");
    const estText = document.getElementById("estimated-hkd-text");
    if (!amountInput || !currencySelect || !estText) return;
    const amount = parseFloat(amountInput.value.replace(/,/g, "")) || 0;
    const rate = exchangeRates[currencySelect.value] || 0.052;
    estText.innerText = `估算折合：${(amount * rate).toFixed(2)} HKD`;
}

// ==================== 儲存帳目 ====================
function saveExpense() {
    if (!verifiedMember) {
        showToast("⚠️ 請先選擇身份並輸入雙符號密碼驗證！", "⚠️");
        return;
    }
    
    const day = document.getElementById("ledger-day");
    const category = document.getElementById("ledger-category");
    const desc = document.getElementById("ledger-desc");
    const amount = document.getElementById("ledger-amount");
    const currency = document.getElementById("ledger-currency");
    const descValue = desc.value.trim();
    const amountValue = parseFloat(amount.value.replace(/,/g, ""));

    if (!descValue || isNaN(amountValue) || amountValue <= 0) {
        showToast("⚠️ 請輸入有效的名稱與金額！", "⚠️");
        return;
    }

    const rate = exchangeRates[currency.value] || 0.052;
    const now = Date.now();
    
    const currentTime = new Date(now).toLocaleString("zh-HK", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
    
    const expenseData = {
        day: parseInt(day.value),
        category: category.value,
        desc: descValue,
        amount: amountValue,
        currency: currency.value,
        amountInHKD: parseFloat((amountValue * rate).toFixed(2)),
        payer: state.activePayer,
        splitWith: [...state.activeSplitWith],
        createdAt: now,
        updatedAt: now,
        createdBy: verifiedMember,
        createdTime: currentTime,
        updatedBy: verifiedMember
    };

    if (editingExpenseId) {
        const index = state.expenses.findIndex(e => e.id === editingExpenseId);
        if (index > -1) {
            const oldExpense = state.expenses[index];
            state.history.unshift({
                type: "edit",
                expenseId: editingExpenseId,
                expenseDesc: oldExpense.desc,
                actionBy: verifiedMember,
                actionSymbol: memberSymbols[verifiedMember],
                actionTime: new Date().toLocaleString("zh-HK"),
                details: `修改了「${oldExpense.desc}」的資料`
            });
            
            state.expenses[index] = { ...state.expenses[index], ...expenseData };
            showToast("✅ 已更新記帳！");
        }
        editingExpenseId = null;
    } else {
        const expense = {
            id: "exp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
            ...expenseData,
        };
        state.expenses.push(expense);
        lastExpense = expense;
        
        state.history.unshift({
            type: "add",
            expenseId: expense.id,
            expenseDesc: expense.desc,
            actionBy: verifiedMember,
            actionSymbol: memberSymbols[verifiedMember],
            actionTime: new Date().toLocaleString("zh-HK"),
            details: `新增了「${expense.desc}」${expense.amount} ${expense.currency}`
        });
        
        showToast("🎉 記帳成功並已同步！");
        showConfetti();
    }

    saveLocalExpenses();
    syncDataToCloud();
    updateLedgerUI();
    closeExpenseModal();
    
    setTimeout(() => {
        document.querySelector("#expense-modal h3").innerHTML = '<span class="bg-sky-100 text-sky-700 w-8 h-8 rounded-full flex items-center justify-center text-base">✍️</span> 新增團隊花費';
        document.getElementById("btn-save-expense").innerHTML = '<span>寫入帳本</span><span class="text-lg">✍️</span>';
    }, 300);
}

function deleteExpense(expenseId) {
    if (!confirm("確定要刪除這筆帳目嗎？")) return;
    
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;
    
    state.history.unshift({
        type: "delete",
        expenseId: expenseId,
        expenseDesc: expense.desc,
        actionBy: verifiedMember || "未知",
        actionSymbol: verifiedMember ? memberSymbols[verifiedMember] : "❓",
        actionTime: new Date().toLocaleString("zh-HK"),
        details: `刪除了「${expense.desc}」${expense.amount} ${expense.currency}`
    });
    
    state.expenses = state.expenses.filter(e => e.id !== expenseId);
    saveLocalExpenses();
    syncDataToCloud();
    updateLedgerUI();
    showToast("🗑️ 已移除該筆花費");
}

// ==================== 歷史紀錄 ====================
function renderHistoryList() {
    const container = document.getElementById("history-list-container");
    if (!container) return;
    container.innerHTML = "";
    
    if (!state.history || state.history.length === 0) {
        container.innerHTML = '<div class="text-slate-400 text-xs italic text-center py-12">暫無修改或刪除紀錄</div>';
        return;
    }
    
    state.history.slice(0, 50).forEach(item => {
        const isAdd = item.type === "add";
        const isEdit = item.type === "edit";
        const isDelete = item.type === "delete";
        
        const typeColor = isAdd ? "bg-emerald-100 text-emerald-800" : isEdit ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
        const typeText = isAdd ? "新增" : isEdit ? "修改" : "刪除";
        
        const card = document.createElement("div");
        card.className = "bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2";
        card.innerHTML = `
            <span class="text-xl">${item.actionSymbol || "❓"}</span>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-black px-2 py-0.5 rounded-full ${typeColor}">${typeText}</span>
                    <span class="text-[10px] font-bold text-slate-700">${item.actionBy}</span>
                    <span class="text-[9px] text-slate-400">${item.actionTime}</span>
                </div>
                <p class="text-[11px] text-slate-600">${item.details}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==================== 顯示列表 ====================
function updateLedgerUI() {
    let total = 0;
    state.expenses.forEach(e => total += e.amountInHKD);
    
    const statTotal = document.getElementById("stat-total");
    const statAverage = document.getElementById("stat-average");
    const statCount = document.getElementById("stat-count");
    
    if (statTotal) statTotal.innerText = `${total.toLocaleString('en-US', {minimumFractionDigits: 2})} HKD`;
    if (statAverage) statAverage.innerText = `${(total / members.length).toLocaleString('en-US', {minimumFractionDigits: 2})} HKD`;
    if (statCount) statCount.innerText = `${state.expenses.length} 筆`;

    renderExpensesList();
    renderBalancesTable();
    renderSuggestedSettlements();
    renderHistoryList();
}

function renderExpensesList() {
    const container = document.getElementById("records-list-container");
    if (!container) return;
    container.innerHTML = "";

    if (state.expenses.length === 0) {
        container.innerHTML = '<div class="text-slate-400 text-xs italic text-center py-12">暫無支出紀錄</div>';
        return;
    }

    const search = document.getElementById("search-input").value.trim().toLowerCase();
    const sort = document.getElementById("sort-select").value;
    let filtered = [...state.expenses].filter(e => 
        e.desc.toLowerCase().includes(search) || 
        e.category.toLowerCase().includes(search) ||
        e.payer.toLowerCase().includes(search)
    );

    filtered.sort((a, b) => {
        switch (sort) {
            case "oldest": return a.createdAt - b.createdAt;
            case "amountHigh": return b.amountInHKD - a.amountInHKD;
            case "amountLow": return a.amountInHKD - b.amountInHKD;
            default: return b.createdAt - a.createdAt;
        }
    });

    const viewSelect = document.getElementById("ledger-view-as");
    if (viewSelect && viewSelect.value !== state.viewingAs) {
        viewSelect.value = state.viewingAs;
    }

    filtered.forEach(expense => {
        const totalHKD = expense.amountInHKD;
        let paidByMe = expense.payer === state.viewingAs ? totalHKD : 0;
        let myShare = 0;
        if (expense.splitWith.includes(state.viewingAs)) {
            myShare = totalHKD / expense.splitWith.length;
        }
        const balance = paidByMe - myShare;

        let balanceHtml = "";
        let cardBorder = "border-slate-200";
        let cardBg = "bg-slate-50 hover:bg-slate-100";

        if (Math.abs(balance) > 0.01) {
            if (balance > 0) {
                balanceHtml = `<span class="text-emerald-600 font-black text-sm">+$${balance.toFixed(2)}</span>`;
                cardBorder = "border-emerald-200";
                cardBg = "bg-emerald-50/40 hover:bg-emerald-50/80";
            } else {
                balanceHtml = `<span class="text-rose-500 font-black text-sm">-$${Math.abs(balance).toFixed(2)}</span>`;
                cardBorder = "border-rose-100";
                cardBg = "bg-rose-50/40 hover:bg-rose-50/80";
            }
        } else {
            balanceHtml = '<span class="text-slate-400 font-medium text-[11px]">無涉 / 結平</span>';
        }

        const payerStyle = memberStyle[expense.payer] || memberStyle["余生"];
        const symbol = memberSymbols[expense.payer] || "";
        const timeStr = expense.createdTime || new Date(expense.createdAt).toLocaleString("zh-HK");
        
        const card = document.createElement("div");
        card.className = `${cardBg} p-3 rounded-2xl border ${cardBorder} flex justify-between items-center text-xs group transition shadow-sm hover:shadow`;
        card.innerHTML = `
            <div class="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                <div class="w-8 h-8 rounded-full ${payerStyle.avatar} text-white font-black flex items-center justify-center shrink-0 border-2 border-white shadow-sm text-sm">${expense.payer[0].toUpperCase()}</div>
                <div class="space-y-1 flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded text-[9px] shrink-0 border border-sky-200">D${expense.day}</span>
                        <strong class="text-slate-900 text-[13px] truncate">${expense.desc}</strong>
                        <span class="text-[10px]">${symbol}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap mt-0.5">
                        <span class="bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">${expense.category}</span>
                        <span class="flex items-center gap-1">代付: <span class="${payerStyle.badge} px-1.5 py-0.5 rounded font-bold border">${expense.payer}</span></span>
                        <span class="text-slate-400">🕐 ${timeStr}</span>
                    </div>
                </div>
            </div>
            <div class="text-right flex items-center gap-2 shrink-0 pl-2">
                <div class="flex flex-col items-end justify-center h-full">
                    ${balanceHtml}
                    <span class="text-[9px] text-slate-400 font-medium mt-0.5" title="總額 ${expense.amount} ${expense.currency}">總額: $${expense.amountInHKD.toFixed(1)}</span>
                </div>
                <div class="flex flex-col gap-1">
                    <button onclick="openEditExpenseModal('${expense.id}')" class="text-slate-300 hover:text-sky-500 p-1.5 transition bg-white/50 hover:bg-white rounded-lg border border-slate-100 shadow-sm" title="編輯">✏️</button>
                    <button onclick="deleteExpense('${expense.id}')" class="text-slate-300 hover:text-red-500 p-1.5 transition bg-white/50 hover:bg-white rounded-lg border border-slate-100 shadow-sm" title="刪除">🗑️</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function calculateBalances() {
    let paidMap = {};
    let owedMap = {};
    members.forEach(m => { paidMap[m] = 0; owedMap[m] = 0; });

    state.expenses.forEach(expense => {
        const totalHKD = expense.amountInHKD;
        if (paidMap[expense.payer] !== undefined) paidMap[expense.payer] += totalHKD;
        
        const splitCount = expense.splitWith.length;
        if (splitCount > 0) {
            const sharePerPerson = totalHKD / splitCount;
            expense.splitWith.forEach(member => {
                if (owedMap[member] !== undefined) owedMap[member] += sharePerPerson;
            });
        }
    });

    let balances = {};
    members.forEach(m => {
        balances[m] = Math.round((paidMap[m] - owedMap[m]) * 100) / 100;
    });

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

        tbody.innerHTML += `
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
                <td class="py-3 font-bold text-slate-800 flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full ${style.avatar} text-white font-black flex items-center justify-center text-[10px] border border-white shadow-sm">${member[0].toUpperCase()}</div>
                    ${member} ${symbol}
                </td>
                <td class="py-3 text-right text-slate-600 font-medium">$${paid}</td>
                <td class="py-3 text-right text-slate-600 font-medium">$${owed}</td>
                <td class="py-3 text-right ${balanceClass}">$${balanceText}</td>
            </tr>
        `;
    });
}

// ==================== 清債相關功能 ====================
function renderSuggestedSettlements() {
    const container = document.getElementById("suggested-settle-container");
    const badge = document.getElementById("debt-count-badge");
    if (!container) return;
    container.innerHTML = "";

    const { balances } = calculateBalances();
    let debtors = [];
    let creditors = [];

    Object.keys(balances).forEach(name => {
        let amount = Math.round(100 * balances[name]) / 100;
        if (amount < -0.01) {
            debtors.push({ name, amount: -amount });
        } else if (amount > 0.01) {
            creditors.push({ name, amount });
        }
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let settlements = [];
    let d = 0, c = 0;

    while (d < debtors.length && c < creditors.length) {
        let debtor = debtors[d];
        let creditor = creditors[c];
        let transfer = Math.min(debtor.amount, creditor.amount);
        
        settlements.push({ from: debtor.name, to: creditor.name, amount: transfer.toFixed(2) });
        
        debtor.amount -= transfer;
        creditor.amount -= transfer;
        
        if (debtor.amount < 0.01) d++;
        if (creditor.amount < 0.01) c++;
    }

    const totalDebt = debtors.reduce((sum, d) => sum + d.amount, 0).toFixed(2);
    const totalCredit = creditors.reduce((sum, c) => sum + c.amount, 0).toFixed(2);
    const settledCount = settlements.filter(s => settlementStatus[`${s.from}_${s.to}_${s.amount}`]).length;
    const settledPercent = settlements.length > 0 ? Math.round((settledCount / settlements.length) * 100) : 0;

    document.getElementById("debt-total").innerText = `$${totalDebt}`;
    document.getElementById("credit-total").innerText = `$${totalCredit}`;
    document.getElementById("settled-total").innerText = `${settledPercent}%`;

    if (badge) {
        if (settlements.length > 0) {
            badge.innerText = settlements.length;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }

    if (settlements.length === 0) {
        container.innerHTML = '<div class="text-slate-400 text-xs italic text-center py-8">🎉 目前帳目完全收支平衡，無需相互結算！</div>';
        return;
    }

    settlements.forEach(s => {
        const fromStyle = memberStyle[s.from] || memberStyle["余生"];
        const toStyle = memberStyle[s.to] || memberStyle["余生"];
        const fromSymbol = memberSymbols[s.from] || "";
        const toSymbol = memberSymbols[s.to] || "";
        const key = `${s.from}_${s.to}_${s.amount}`;
        const isDone = settlementStatus[key] || false;

        container.innerHTML += `
            <div class="bg-slate-50 border ${isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'} p-2.5 rounded-xl flex items-center justify-between text-xs shadow-sm hover:shadow-md transition">
                <div class="flex items-center gap-1.5 md:gap-2">
                    <div class="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <div class="w-5 h-5 rounded-full ${fromStyle.avatar} text-white flex items-center justify-center text-[9px] font-black">${s.from[0].toUpperCase()}</div>
                        <span class="font-bold text-slate-700 hidden sm:inline">${s.from} ${fromSymbol}</span>
                    </div>
                    <span class="text-slate-400 text-[10px] font-bold flex flex-col items-center px-1">
                        <span>付款給</span>
                        <span class="text-[8px] mt-0.5 text-slate-300">➔</span>
                    </span>
                    <div class="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <div class="w-5 h-5 rounded-full ${toStyle.avatar} text-white flex items-center justify-center text-[9px] font-black">${s.to[0].toUpperCase()}</div>
                        <span class="font-bold text-slate-700 hidden sm:inline">${s.to} ${toSymbol}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="text-right">
                        <span class="block text-[9px] text-slate-400 mb-0.5 font-medium">應轉帳</span>
                        <strong class="text-sm md:text-base font-black ${isDone ? 'text-emerald-600 line-through' : 'text-rose-600'}">$${s.amount}</strong>
                    </div>
                    <button onclick="toggleSettlementDone('${s.from}','${s.to}','${s.amount}')" class="px-2 py-1 rounded-lg font-bold text-[10px] ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'} transition">${isDone ? '✓ 已完成' : '標記完成'}</button>
                </div>
            </div>
        `;
    });
}

function toggleSettlementDone(from, to, amount) {
    const key = `${from}_${to}_${amount}`;
    settlementStatus[key] = !settlementStatus[key];
    localStorage.setItem("settlement_status", JSON.stringify(settlementStatus));
    renderSuggestedSettlements();
    showToast(settlementStatus[key] ? "✅ 已標記為完成" : "↩️ 已取消完成標記");
}

function resetSettlementStatus() {
    if (!confirm("確定要重置所有清債狀態嗎？")) return;
    settlementStatus = {};
    localStorage.removeItem("settlement_status");
    renderSuggestedSettlements();
    showToast("🔄 已重置清債狀態");
}

function copySettlementPlan() {
    const container = document.getElementById("suggested-settle-container");
    const texts = container.innerText.split('\n').filter(t => t.trim() !== '' && !t.includes('付款給') && !t.includes('應轉帳') && !t.includes('目前帳目'));
    if (texts.length === 0) {
        showToast("⚠️ 目前沒有可複製的清債方案", "⚠️");
        return;
    }
    let plan = "🧾 清債方案 (HKD)\n";
    texts.forEach(t => {
        const parts = t.split(' ');
        if (parts.length >= 5) {
            plan += `${parts[0]} → ${parts[1]} : $${parts[2]}\n`;
        }
    });
    copyText(plan);
    showToast("📋 清債方案已複製！");
}

function changeViewAs(member) {
    state.viewingAs = member;
    renderExpensesList();
}

function exportLedgerText() {
    if (state.expenses.length === 0) {
        showToast("📋 暫無帳目可輸出", "⚠️");
        return;
    }
    
    let text = "📊 東北之旅團隊記帳明細\n";
    text += "=".repeat(30) + "\n\n";
    
    const { paidMap, owedMap, balances } = calculateBalances();
    
    text += "【總覽】\n";
    let totalHKD = 0;
    state.expenses.forEach(e => totalHKD += e.amountInHKD);
    text += `總開支：$${totalHKD.toFixed(2)} HKD\n`;
    text += `人均花費：$${(totalHKD / members.length).toFixed(2)} HKD\n\n`;
    
    text += "【各成員結算】\n";
    members.forEach(m => {
        const sign = balances[m] > 0 ? "多付(應收回)" : balances[m] < 0 ? "少付(應補繳)" : "已結平";
        text += `${m}：實付 $${paidMap[m].toFixed(2)} / 應付 $${owedMap[m].toFixed(2)} / ${sign} $${Math.abs(balances[m]).toFixed(2)}\n`;
    });
    
    text += "\n【明細列表】\n";
    [...state.expenses].sort((a, b) => a.day - b.day || b.createdAt - a.createdAt).forEach(e => {
        text += `D${e.day} | ${e.category} | ${e.desc} | ${e.amount} ${e.currency} (≈$${e.amountInHKD.toFixed(2)} HKD) | 代付:${e.payer} | 分攤:${e.splitWith.join("/")}\n`;
    });
    
    copyText(text);
    showToast("📋 帳目文字已複製！可貼到群組分享");
}

// ==================== 確認與清空 ====================
function openConfirmModal() {
    const backdrop = document.getElementById("confirm-modal-backdrop");
    const modal = document.getElementById("confirm-modal");
    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");
    modal.offsetWidth;
    backdrop.classList.remove("opacity-0");
    modal.classList.remove("opacity-0", "scale-95");
    modal.classList.add("opacity-100", "scale-100");
}

function closeConfirmModal() {
    const backdrop = document.getElementById("confirm-modal-backdrop");
    const modal = document.getElementById("confirm-modal");
    backdrop.classList.add("opacity-0");
    modal.classList.remove("opacity-100", "scale-100");
    modal.classList.add("opacity-0", "scale-95");
    setTimeout(() => {
        backdrop.classList.add("hidden");
        modal.classList.add("hidden");
    }, 300);
}

function executeClearExpenses() {
    state.expenses = [];
    lastExpense = null;
    settlementStatus = {};
    saveLocalExpenses();
    syncDataToCloud();
    updateLedgerUI();
    showToast("🧹 已清空所有記帳本紀錄");
    closeConfirmModal();
}

// ==================== 彩帶慶祝 ====================
function showConfetti() {
    const colors = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.left = Math.random() * 100 + "vw";
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 8 + 4 + "px";
            confetti.style.height = Math.random() * 12 + 6 + "px";
            confetti.style.animationDuration = Math.random() * 2 + 2 + "s";
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, Math.random() * 500);
    }
}

// ==================== 本地儲存 ====================
function saveLocalExpenses() {
    localStorage.setItem("tohoku_expenses_2027", JSON.stringify(state.expenses));
    localStorage.setItem("tohoku_history_2027", JSON.stringify(state.history));
}

function loadLocalExpenses() {
    const saved = localStorage.getItem("tohoku_expenses_2027");
    if (saved) {
        try { state.expenses = sanitizeExpenses(JSON.parse(saved)); } catch(e) { state.expenses = []; }
    }
}

function sanitizeExpenses(e) {
    return Array.isArray(e) ? e.filter(item => item !== null && typeof item === "object").map(item => ({
        ...item,
        id: item.id || "exp-" + Math.random().toString(36).substr(2, 9),
        day: parseInt(item.day) || 1,
        desc: item.desc || "未命名項目",
        category: item.category || "📝 其他",
        amount: Number(item.amount) || 0,
        currency: item.currency || "JPY",
        amountInHKD: Number(item.amountInHKD) || 0,
        payer: item.payer || members[0],
        splitWith: Array.isArray(item.splitWith) && item.splitWith.length > 0 ? item.splitWith : [members[0]],
        createdAt: item.createdAt || Date.now(),
        createdTime: item.createdTime || "",
        createdBy: item.createdBy || "",
        updatedAt: item.updatedAt || Date.now(),
        updatedBy: item.updatedBy || ""
    })) : [];
}

// ==================== 初始化 ====================
window.addEventListener("DOMContentLoaded", () => {
    const savedHistory = localStorage.getItem("tohoku_history_2027");
    if (savedHistory) {
        try { state.history = JSON.parse(savedHistory); } catch(e) { state.history = []; }
    }
    loadLocalExpenses();
    updateLedgerUI();
    initSnowEffect();
    initRandomCharacters();
});