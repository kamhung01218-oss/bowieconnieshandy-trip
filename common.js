// ==================== Firebase 初始化 ====================
firebase.initializeApp({
  apiKey: "AIzaSyC0VQQWW0HQCd8CG8EuAN-kqnGirZHJ__E",
  authDomain: "tohoku-winter-trip.firebaseapp.com",
  projectId: "tohoku-winter-trip",
  storageBucket: "tohoku-winter-trip.firebasestorage.app",
  messagingSenderId: "991555590088",
  appId: "1:991555590088:web:afb089890d7d546821d2fd",
  measurementId: "G-9EN9JG5F3F"
});

firebase.auth().signInAnonymously().catch(err => console.warn("匿名登入失敗:", err));

const db = firebase.firestore();
window.db = db;
window.dbRef = db.collection("tohoku_trip").doc("shared_expenses");

// ==================== 共用變數 ====================
const exchangeRates = { JPY: 0.052, HKD: 1, TWD: 0.24, CNY: 1.1, USD: 7.8 };
let characterTimeout = null;
let bubbleTimeout = null;

// ==================== Toast ====================
function showToast(message, icon = "✅") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");
  if (toast && toastMessage && toastIcon) {
    toastMessage.innerText = message;
    toastIcon.innerText = icon;
    toast.classList.remove("-translate-y-24", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("-translate-y-24", "opacity-0");
    }, 3000);
  }
}

// ==================== 複製功能 ====================
function copyText(text) {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast("📋 複製成功！");
  } catch(e) {
    navigator.clipboard.writeText(text).then(() => showToast("📋 複製成功！"));
  }
}

function copyCurrentUrl() {
  copyText(window.location.href);
  showToast("🔗 已複製固定連結！其他人點開即是最新資料");
}

// ==================== 匯率換算 ====================
function toggleCurrencyWidget() {
  const panel = document.getElementById("currency-widget-panel");
  if (panel) {
    if (panel.classList.contains("opacity-0")) {
      panel.classList.remove("invisible");
      setTimeout(() => {
        panel.classList.remove("opacity-0", "scale-90", "translate-y-4", "pointer-events-none");
        panel.classList.add("opacity-100", "scale-100", "translate-y-0", "pointer-events-auto");
      }, 10);
    } else {
      panel.classList.add("opacity-0", "scale-90", "translate-y-4", "pointer-events-none");
      panel.classList.remove("opacity-100", "scale-100", "translate-y-0", "pointer-events-auto");
      setTimeout(() => { if (panel.classList.contains("opacity-0")) panel.classList.add("invisible"); }, 300);
    }
  }
}

function convertCurrency(type) {
  const hkdInput = document.getElementById("calc-hkd");
  const jpyInput = document.getElementById("calc-jpy");
  if (!hkdInput || !jpyInput) return;
  if (type === "clear") { hkdInput.value = ""; jpyInput.value = ""; return; }
  const rate = exchangeRates.JPY || 0.052;
  if (type === "jpy") {
    const jpy = parseFloat(jpyInput.value);
    hkdInput.value = (isNaN(jpy) || jpy === 0) ? "" : (jpy * rate).toFixed(2);
  } else if (type === "hkd") {
    const hkd = parseFloat(hkdInput.value);
    jpyInput.value = (isNaN(hkd) || hkd === 0) ? "" : Math.round(hkd / rate);
  }
}

function quickConvert(currency, amount) {
  const input = document.getElementById("calc-" + currency);
  if (input) { input.value = amount; convertCurrency(currency); }
}

// ==================== 雪花效果 ====================
function initSnowEffect() {
  const snowContainer = document.getElementById("snow-fall");
  if (!snowContainer) return;
  snowContainer.innerHTML = "";
  const snowflakeCount = window.innerWidth < 768 ? 25 : 50;
  const animations = ["snowfall", "snowfall-small", "snowfall-medium", "snowfall-large"];
  const colors = ["#ffffff", "#f0f9ff", "#e0f2fe", "#bae6fd", "#ffffff"];
  for (let i = 0; i < snowflakeCount; i++) {
    const snowflake = document.createElement("div");
    snowflake.className = "snowflake";
    const size = Math.random() * 7 + 3;
    snowflake.style.cssText = `left: ${Math.random() * 100}%; width: ${size}px; height: ${size}px; background: ${colors[Math.floor(Math.random() * colors.length)]}; opacity: ${Math.random() * 0.4 + 0.1}; animation: ${animations[Math.floor(Math.random() * animations.length)]} ${Math.random() * 12 + 8}s linear infinite; animation-delay: ${Math.random() * -12}s; border-radius: 50%; box-shadow: 0 0 4px rgba(224, 242, 254, 0.8);`;
    if (size > 8) snowflake.style.boxShadow = "0 0 10px 2px rgba(255,255,255,0.4)";
    if (Math.random() > 0.7) snowflake.classList.add("snowflake-shine");
    snowContainer.appendChild(snowflake);
  }
  for (let i = 0; i < 3; i++) {
    const flake = document.createElement("div");
    flake.className = "snowflake";
    flake.style.cssText = `left: ${Math.random() * 100}%; width: 12px; height: 12px; animation: snowfall-medium ${Math.random() * 15 + 10}s linear infinite; animation-delay: ${Math.random() * -10}s;`;
    flake.innerHTML = '❄';
    flake.style.fontSize = `${Math.random() * 10 + 8}px`;
    flake.style.color = "rgba(255,255,255,0.9)";
    flake.style.textShadow = "0 0 5px rgba(255,255,255,0.7)";
    snowContainer.appendChild(flake);
  }
}

window.addEventListener("resize", () => {
  clearTimeout(window.snowResizeTimeout);
  window.snowResizeTimeout = setTimeout(() => {
    const snowContainer = document.getElementById("snow-fall");
    if (snowContainer && snowContainer.children.length > 0) initSnowEffect();
  }, 300);
});

// ==================== 動態角色（隨機出現） ====================
function spawnCharacters() {
  clearTimeout(characterTimeout);
  clearTimeout(bubbleTimeout);
  
  const snowman = document.getElementById('snowman');
  const fox = document.getElementById('fox');
  if (!snowman || !fox) return;

  snowman.classList.remove('show', 'greet');
  fox.classList.remove('show', 'greet');
  snowman.classList.add('hide');
  fox.classList.add('hide');

  const rand = Math.random();
  let count = 0;
  if (rand < 0.2) {
    count = 0;
  } else if (rand < 0.9) {
    count = 1;
  } else {
    count = 2;
  }

  if (count === 0) {
    characterTimeout = setTimeout(spawnCharacters, Math.random() * 5000 + 4000);
    return;
  }

  let showSnowman = false;
  let showFox = false;
  if (count === 1) {
    if (Math.random() < 0.5) {
      showSnowman = true;
    } else {
      showFox = true;
    }
  } else {
    showSnowman = true;
    showFox = true;
  }

  if (showSnowman) {
    snowman.style.left = '20px';
    snowman.classList.remove('hide');
    snowman.classList.add('show');
  }
  if (showFox) {
    fox.style.right = '20px';
    fox.classList.remove('hide');
    fox.classList.add('show');
  }

  if (count === 2) {
    setTimeout(() => {
      snowman.classList.add('greet');
      fox.classList.add('greet');
      showCharacterBubble(snowman, '嗨！');
      showCharacterBubble(fox, '哈囉～');
    }, 600);
  }

  characterTimeout = setTimeout(() => {
    snowman.classList.remove('show', 'greet');
    fox.classList.remove('show', 'greet');
    snowman.classList.add('hide');
    fox.classList.add('hide');
    setTimeout(spawnCharacters, Math.random() * 5000 + 2000);
  }, count === 2 ? 5000 : 3500);
}

function showCharacterBubble(element, text) {
  const oldBubble = document.querySelector('.character-bubble');
  if (oldBubble) oldBubble.remove();

  const bubble = document.createElement('div');
  bubble.className = 'character-bubble';
  bubble.innerText = text;
  const rect = element.getBoundingClientRect();
  bubble.style.left = rect.left + rect.width / 2 - 30 + 'px';
  bubble.style.top = rect.top - 30 + 'px';
  document.body.appendChild(bubble);
  bubble.classList.add('show');
  bubbleTimeout = setTimeout(() => {
    bubble.classList.remove('show');
    setTimeout(() => bubble.remove(), 300);
  }, 2000);
}

function jump(characterId) {
  const char = document.getElementById(characterId);
  if (char) {
    char.classList.add('jumping');
    setTimeout(() => char.classList.remove('jumping'), 600);
    showToast(`你點了一下${characterId === 'snowman' ? '雪人' : '狐狸'}！`, "❄️");
  }
}

function initRandomCharacters() {
  setTimeout(spawnCharacters, 2000);
}

// ==================== 點擊雪花特效 ====================
document.addEventListener("click", (e) => {
  if (e.target.closest("button, a, input, select, textarea, .modal-box, iframe, .walking-character")) return;
  const snowflake = document.createElement("span");
  snowflake.className = "click-snowflake";
  snowflake.innerText = "❄️";
  snowflake.style.left = e.clientX + "px";
  snowflake.style.top = e.clientY + "px";
  document.body.appendChild(snowflake);
  setTimeout(() => snowflake.remove(), 800);
});

// ==================== 通用彈窗 ====================
function showModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.add('active'); overlay.style.display = 'flex'; }
}
function hideModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
  }
}