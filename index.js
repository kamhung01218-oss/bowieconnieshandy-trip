// ==================== 全域變數 ====================
let state = { currentMainTab: "itinerary", checkedItems: {} };
let simulatedTime = null;
const tripDates = ["2027-01-21", "2027-01-22", "2027-01-23", "2027-01-24", "2027-01-25", "2027-01-26", "2027-01-27"];

// ==================== 頁面切換 ====================
function switchMainTab(tab) {
  state.currentMainTab = tab;
  const itineraryView = document.getElementById("main-itinerary-view");
  const ledgerFrameContainer = document.getElementById("ledger-frame-container");
  const quickSection = document.getElementById("itinerary-quick-section");
  const navItineraryBtn = document.getElementById("nav-itinerary-btn");
  const navLedgerBtn = document.getElementById("nav-ledger-btn");
  if (tab === "itinerary") {
    itineraryView.classList.remove("hidden");
    ledgerFrameContainer.classList.add("hidden");
    if (quickSection) quickSection.classList.remove("hidden");
    navItineraryBtn.className = "flex-1 py-3 px-4 rounded-full text-sm font-black flex items-center justify-center gap-2 nav-btn active";
    navLedgerBtn.className = "flex-1 py-3 px-4 rounded-full text-sm font-black flex items-center justify-center gap-2 nav-btn text-slate-600 hover:bg-slate-100 transition";
  } else {
    itineraryView.classList.add("hidden");
    ledgerFrameContainer.classList.remove("hidden");
    if (quickSection) quickSection.classList.add("hidden");
    navLedgerBtn.className = "flex-1 py-3 px-4 rounded-full text-sm font-black flex items-center justify-center gap-2 nav-btn active";
    navItineraryBtn.className = "flex-1 py-3 px-4 rounded-full text-sm font-black flex items-center justify-center gap-2 nav-btn text-slate-600 hover:bg-slate-100 transition";
  }
  setTimeout(() => window.dispatchEvent(new Event("scroll")), 50);
}

function switchDay(day) {
  document.querySelectorAll("#day-tabs-container button").forEach(btn => {
    btn.className = "day-tab flex-shrink-0 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition";
  });
  const activeTab = document.getElementById("tab-d" + day);
  if (activeTab) activeTab.className = "day-tab active flex-shrink-0 transition";
  document.querySelectorAll(".day-section").forEach(section => section.classList.add("hidden"));
  const targetSection = document.getElementById("day-section-" + day);
  if (targetSection) targetSection.classList.remove("hidden");
}

// ==================== 彈窗控制 ====================
function toggleBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal.classList.contains('hidden')) { showModal('booking-modal'); modal.classList.remove('hidden'); }
  else { hideModal('booking-modal'); setTimeout(() => modal.classList.add('hidden'), 300); }
}
function closeBookingModal() {
  hideModal('booking-modal');
  setTimeout(() => document.getElementById('booking-modal').classList.add('hidden'), 300);
}
function toggleEquipModal() {
  const modal = document.getElementById('equip-modal');
  if (modal.classList.contains('hidden')) { showModal('equip-modal'); modal.classList.remove('hidden'); }
  else { hideModal('equip-modal'); setTimeout(() => modal.classList.add('hidden'), 300); }
}
function closeEquipModal() {
  hideModal('equip-modal');
  setTimeout(() => document.getElementById('equip-modal').classList.add('hidden'), 300);
}
function toggleDriveModal() {
  const modal = document.getElementById('drive-modal');
  if (modal.classList.contains('hidden')) { showModal('drive-modal'); modal.classList.remove('hidden'); }
  else { hideModal('drive-modal'); setTimeout(() => modal.classList.add('hidden'), 300); }
}
function closeDriveModal() {
  hideModal('drive-modal');
  setTimeout(() => document.getElementById('drive-modal').classList.add('hidden'), 300);
}
function toggleTicketModal() {
  const modal = document.getElementById('ticket-modal');
  if (modal.classList.contains('hidden')) { showModal('ticket-modal'); modal.classList.remove('hidden'); }
  else { hideModal('ticket-modal'); setTimeout(() => modal.classList.add('hidden'), 300); }
}
function closeTicketModal() {
  hideModal('ticket-modal');
  setTimeout(() => document.getElementById('ticket-modal').classList.add('hidden'), 300);
}
function openTripOverview() {
  const modal = document.getElementById('trip-overview-modal');
  if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); }
}
function closeTripOverview() {
  const modal = document.getElementById('trip-overview-modal');
  if (modal) { modal.classList.remove('active'); setTimeout(() => { modal.style.display = 'none'; }, 300); }
}
function openWeatherModal() {
  const modal = document.getElementById('weather-modal');
  showModal('weather-modal');
  modal.classList.remove('hidden');
  document.getElementById('weather-detail-content').innerHTML = '<div class="flex justify-center py-8"><div class="loading-spinner"></div></div>';
  fetchWeatherData();
}
function closeWeatherModal() {
  hideModal('weather-modal');
  setTimeout(() => document.getElementById('weather-modal').classList.add('hidden'), 300);
}

// ==================== 天氣 ====================
const weatherDest = { name: "宮城仙台", lat: 38.2682, lon: 140.8694 };
async function fetchWeatherData() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${weatherDest.lat}&longitude=${weatherDest.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    document.getElementById('mini-temp').innerText = `${Math.round(data.current.temperature_2m)}°C`;
    document.getElementById('mini-feels').innerText = `體感 ${Math.round(data.current.apparent_temperature)}°C | 濕度 ${data.current.relative_humidity_2m}% | 風速 ${data.current.wind_speed_10m} km/h`;
    const miniForecast = document.getElementById('mini-forecast');
    miniForecast.innerHTML = "";
    for(let i=0; i<7; i++) {
      const date = data.daily.time[i].substring(5);
      const max = Math.round(data.daily.temperature_2m_max[i]);
      const min = Math.round(data.daily.temperature_2m_min[i]);
      const icon = data.daily.weather_code[i] === 0 ? "☀️" : data.daily.weather_code[i] < 5 ? "⛅" : data.daily.weather_code[i] < 70 ? "☁️" : "❄️";
      miniForecast.innerHTML += `<div class="bg-white/70 p-1.5 rounded text-center min-w-[55px]"><span class="block text-[8px] text-slate-400">${date}</span><span class="block text-[14px]">${icon}</span><span class="block text-[9px] font-bold text-slate-700">${max}°/${min}°</span></div>`;
    }
    const detail = document.getElementById('weather-detail-content');
    detail.innerHTML = `<div class="bg-sky-50 p-3 rounded-xl border border-sky-200"><span class="text-xs text-slate-500">目前氣溫</span><strong class="block text-xl text-slate-800">${Math.round(data.current.temperature_2m)}°C</strong><span class="text-[10px] text-slate-600">體感 ${Math.round(data.current.apparent_temperature)}°C | 濕度 ${data.current.relative_humidity_2m}% | 風速 ${data.current.wind_speed_10m} km/h</span></div><div class="text-xs text-slate-700 space-y-2"><strong class="block text-slate-800 mb-1">未來7天預報</strong>${[0,1,2,3,4,5,6].map(i => `<div class="flex justify-between border-b border-slate-100 pb-1"><span>${data.daily.time[i]} (${["日","一","二","三","四","五","六"][new Date(data.daily.time[i]).getDay()]})</span><span>${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</span><span class="text-blue-500">💧 ${data.daily.precipitation_probability_max[i] ?? 0}%</span></div>`).join('')}</div>`;
  } catch(e) {
    console.warn("天氣讀取失敗", e);
    document.getElementById('weather-detail-content').innerHTML = '<div class="text-center py-8 text-slate-500 text-sm">天氣資料暫時無法取得，請稍後再試。</div>';
  }
}

// ==================== 行程渲染 ====================
function renderDayItinerary(sectionId, dayData) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  let html = `<div class="mb-8"><div class="bg-slate-50/95 py-3 mb-2 px-1 border-b border-slate-200/50 flex justify-between items-center"><div class="flex items-center gap-3"><div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center text-xl shadow-md shrink-0">${dayData.emoji}</div><div class="flex-1"><span class="text-[11px] font-bold text-sky-600 tracking-wider">${dayData.dateLabel}</span><h2 class="text-base md:text-lg font-extrabold text-slate-800 leading-tight">${dayData.title}</h2>${dayData.subtitle ? `<p class="text-[10px] text-slate-500 mt-0.5">${dayData.subtitle}</p>` : ""}</div></div><button onclick="toggleAllDetails('${sectionId}')" class="bg-white hover:bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition flex items-center gap-1 shrink-0 ml-2"><span class="icon">↕️</span><span class="hidden md:inline">全部展開</span></button></div><div class="relative mt-4 space-y-4 pb-6">`;
  dayData.events.forEach((event, index) => {
    const isOpen = event.open ? "open" : "";
    const tagHtml = event.tag ? `<span class="tag ${event.tag.class}">${event.tag.text}</span>` : "";
    const timeParts = event.time.split(" - ");
    const startTime = timeParts[0];
    const endTime = timeParts[1] ? `~ ${timeParts[1]}` : "";
    html += `<div class="relative pl-0"><details ${isOpen} id="event-card-${dayData.day}-${index}" class="group glass-card rounded-2xl"><summary class="flex items-start gap-3 p-3 md:p-4 cursor-pointer select-none hover:bg-slate-50/50 transition-colors relative list-none"><div class="flex-1 min-w-0 pr-8"><div class="flex flex-wrap items-center gap-2 mb-1"><span class="event-time-pill">🕐 ${startTime} ${endTime ? "– "+endTime : ""}</span>${tagHtml}</div><h3 class="text-[14px] md:text-[15px] font-bold text-slate-800 leading-tight">${event.title}</h3>${event.location ? `<div class="text-[10px] text-slate-400 mt-0.5">📍 ${event.location}</div>` : ""}</div><div class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-open:rotate-180 transition-transform duration-300 border border-slate-100"><svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div></summary><div class="p-4 pt-0 pb-5 border-t border-slate-50/80 bg-slate-50/30">${event.img ? `<div class="mt-2 rounded-xl overflow-hidden shadow-sm"><img src="${event.img}" alt="${event.title}" class="w-full h-32 object-cover" loading="lazy" onerror="this.style.display='none'"></div>` : ''}${event.navUrl ? `<a href="${event.navUrl}" target="_blank" class="group/nav w-full flex items-center justify-center gap-1.5 bg-white text-slate-700 border border-slate-200 hover:border-sky-300 hover:text-sky-700 text-[13px] font-bold py-2.5 rounded-xl transition active:scale-95 shadow-sm mt-3 mb-3"><span>📍</span> 導航前往 ${event.navName || "景點"}<svg class="w-3 h-3 opacity-60 group-hover/nav:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>` : '<div class="h-3"></div>'}${event.content}</div></details></div>`;
  });
  html += `</div></div>`;
  section.innerHTML = html;
}

function toggleAllDetails(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const details = section.querySelectorAll("details");
  if (details.length === 0) return;
  let openCount = 0;
  details.forEach(d => { if (d.open) openCount++; });
  const shouldOpen = openCount < details.length / 2;
  details.forEach(d => { d.open = shouldOpen; });
  setTimeout(() => window.dispatchEvent(new Event("scroll")), 50);
}

function collapseAllItineraries() {
  const activeSection = document.querySelector(".day-section:not(.hidden)");
  if (activeSection) {
    const details = activeSection.querySelectorAll("details");
    const anyOpen = Array.from(details).some(d => d.open);
    if (anyOpen) {
      details.forEach(detail => { detail.open = false; });
      showToast("⬆️ 已收合全部行程");
      const btn = document.getElementById("fab-collapse-all");
      if (btn) btn.innerHTML = '<span class="text-lg font-black">⬇️</span><span class="font-bold text-sm hidden md:inline">展開行程</span>';
    } else {
      details.forEach(detail => { detail.open = true; });
      showToast("⬇️ 已展開全部行程");
      const btn = document.getElementById("fab-collapse-all");
      if (btn) btn.innerHTML = '<span class="text-lg font-black">⬆️</span><span class="font-bold text-sm hidden md:inline">收合行程</span>';
    }
  }
}

// ==================== 倒數計時 ====================
const departureTarget = new Date("2027-01-21T10:00:00+08:00").getTime();
const zaoTarget = new Date("2027-01-15T23:00:00+08:00").getTime();
const ginzanTarget = new Date("2027-01-08T23:00:00+08:00").getTime();

function updateCountdowns() {
  const now = new Date().getTime();
  const departureDiff = departureTarget - now;
  const departureEl = document.getElementById("departure-countdown");
  if (departureEl) {
    if (departureDiff < 0) {
      departureEl.innerText = "❄️ 2027 東北冬日雪景之旅進行中！";
      departureEl.classList.remove("animate-pulse");
    } else {
      const days = Math.floor(departureDiff / 86400000);
      const hours = Math.floor(departureDiff % 86400000 / 3600000);
      const minutes = Math.floor(departureDiff % 3600000 / 60000);
      const seconds = Math.floor(departureDiff % 60000 / 1000);
      departureEl.innerText = `${days}天 ${hours}小時 ${minutes}分 ${seconds}秒`;
    }
  }
  const ginzanDiff = ginzanTarget - now;
  const ginzanEl = document.getElementById("ginzan-countdown");
  if (ginzanEl) {
    if (ginzanDiff < 0) {
      ginzanEl.innerText = "🎟️ 搶票時段已開始或結束！";
      ginzanEl.classList.remove("animate-pulse", "text-purple-700");
      ginzanEl.classList.add("text-rose-600");
    } else {
      const days = Math.floor(ginzanDiff / 86400000);
      const hours = Math.floor(ginzanDiff % 86400000 / 3600000);
      const minutes = Math.floor(ginzanDiff % 3600000 / 60000);
      const seconds = Math.floor(ginzanDiff % 60000 / 1000);
      ginzanEl.innerText = `⏳ 剩餘：${days}天 ${hours}小時 ${minutes}分 ${seconds}秒`;
    }
  }
  const zaoDiff = zaoTarget - now;
  const zaoEl = document.getElementById("zao-countdown");
  if (zaoEl) {
    if (zaoDiff < 0) {
      zaoEl.innerText = "🎟️ 搶票時段已開始或結束！";
      zaoEl.classList.remove("animate-pulse", "text-sky-700");
      zaoEl.classList.add("text-rose-600");
    } else {
      const days = Math.floor(zaoDiff / 86400000);
      const hours = Math.floor(zaoDiff % 86400000 / 3600000);
      const minutes = Math.floor(zaoDiff % 3600000 / 60000);
      const seconds = Math.floor(zaoDiff % 60000 / 1000);
      zaoEl.innerText = `⏳ 剩餘：${days}天 ${hours}小時 ${minutes}分 ${seconds}秒`;
    }
  }
}

// ==================== 歡迎導覽 ====================
function closeWelcomeModal(skipForever = false) {
  const modal = document.getElementById("welcome-modal");
  if (modal) {
    modal.style.opacity = "0";
    setTimeout(() => { modal.style.display = "none"; }, 300);
  }
  if (skipForever) {
    localStorage.setItem("tohoku_welcome_dismissed", "true");
  }
}

function checkWelcomeModal() {
  const dismissed = localStorage.getItem("tohoku_welcome_dismissed");
  const modal = document.getElementById("welcome-modal");
  if (dismissed === "true" && modal) {
    modal.style.display = "none";
  }
}

// ==================== 初始化 ====================
window.addEventListener("DOMContentLoaded", () => {
  initSnowEffect();
  winterItineraries.forEach((dayData, index) => {
    renderDayItinerary(`day-section-${index + 1}`, dayData);
  });
  switchMainTab("itinerary");
  updateCountdowns();
  setInterval(updateCountdowns, 1000);
  checkWelcomeModal();
  fetchWeatherData();
  initRandomCharacters();
});