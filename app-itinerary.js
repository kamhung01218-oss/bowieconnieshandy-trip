/* ============================================================
 * app-itinerary.js — v7.1
 * 行程：天氣、行程渲染、輪播、各項攻略 Modal、行程切換
 * ============================================================ */

// ==================== 天氣 ====================
const WEATHER_LOCATIONS = {
  1: { name: "宮城仙台", lat: 38.2682, lon: 140.8694 },
  2: { name: "山形天童", lat: 38.3625, lon: 140.3694 },
  3: { name: "山形藏王", lat: 38.1656, lon: 140.3986 },
  4: { name: "宮城泉", lat: 38.3189, lon: 140.8831 },
  5: { name: "宮城白石", lat: 38.0022, lon: 140.6197 },
  6: { name: "宮城仙台", lat: 38.2682, lon: 140.8694 },
  7: { name: "宮城仙台", lat: 38.2682, lon: 140.8694 }
};

function weatherCodeToIcon(code) { if (code === 0) return "☀️"; if (code < 5) return "⛅"; if (code < 70) return "☁️"; return "❄️"; }
async function fetchWeatherData() {
  const today = new Date(); const tripStartDate = new Date(TRIP_START);
  const daysUntil = Math.floor((tripStartDate - today) / 86400000);
  if (daysUntil > 16) { const d = document.getElementById('weather-detail-content'); if (d) d.innerHTML = '<div class="text-center py-8 text-slate-500 text-sm">旅行日期尚遠，天氣預報將於出發前 16 天內顯示</div>'; return; }
  const dayPromises = tripDates.map(async (dateStr, idx) => {
    const loc = WEATHER_LOCATIONS[idx + 1];
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&start_date=${dateStr}&end_date=${dateStr}`;
      const res = await fetch(url); const data = await res.json();
      if (!data.daily || !data.daily.time || data.daily.time.length === 0) return null;
      return { dateStr, location: loc.name, max: Math.round(data.daily.temperature_2m_max[0]), min: Math.round(data.daily.temperature_2m_min[0]), rain: data.daily.precipitation_probability_max[0] ?? 0, icon: weatherCodeToIcon(data.daily.weather_code[0]), current: data.current ? { temp: Math.round(data.current.temperature_2m), feels: Math.round(data.current.apparent_temperature), humidity: data.current.relative_humidity_2m, icon: weatherCodeToIcon(data.current.weather_code) } : null };
    } catch(e) { return null; }
  });
  const results = await Promise.all(dayPromises);
  results.forEach(r => { if (r) window.weatherCache[r.dateStr] = { max: r.max, min: r.min, rain: r.rain, icon: r.icon, location: r.location, current: r.current }; });
  if (window.AppHeader) window.AppHeader.render();
  if (window._lastActiveDay) { const dayData = winterItineraries.find(d => d.day === window._lastActiveDay); if (dayData) renderDayItinerary(`day-section-${dayData.day}`, dayData, true); }
  renderWeatherDetail();
}
function renderWeatherDetail() {
  const detail = document.getElementById('weather-detail-content'); if (!detail) return;
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
    const w = window.weatherCache[ds]; const d = new Date(ds);
    const week = ["日","一","二","三","四","五","六"][d.getDay()];
    const isToday = ds === today; const loc = WEATHER_LOCATIONS[i + 1].name;
    if (!w) return `<div class="forecast-row ${isToday ? 'today' : ''}"><div class="forecast-date">${isToday ? "今天" : ds.substring(5)} (${week})</div><div class="forecast-icon">⏳</div><div class="forecast-temp" style="color:#94a3b8;font-size:11px">${loc} · 暫無資料</div></div>`;
    return `<div class="forecast-row ${isToday ? 'today' : ''}"><div class="forecast-date">${isToday ? "今天" : ds.substring(5)} (${week})</div><div class="forecast-icon">${w.icon}</div><div class="forecast-temp"><span class="forecast-temp-max">${w.max}°</span><span class="text-slate-400 mx-1">/</span><span class="forecast-temp-min">${w.min}°</span><span style="font-size:10px;color:#94a3b8;margin-left:4px">${loc}</span></div><div class="forecast-rain">💧 ${w.rain}%</div></div>`;
  }).join('');
  detail.innerHTML = `<div class="weather-hero"><div class="weather-hero-icon">${curIcon}</div><div><div class="weather-hero-temp">${curTemp !== null ? curTemp + '°C' : '--'}</div><div class="weather-hero-meta">${curTemp !== null ? `體感 ${feels}°C · 濕度 ${humidity}% · ${curLocName}` : curLocName}</div></div></div><div class="weather-advice"><div class="weather-advice-icon">${advice.icon}</div><div class="weather-advice-text">${advice.text}</div></div><div class="text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">7 天行程天氣預報</div><div class="forecast-list">${forecastRows}</div>`;
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
  return '<div class="timeline-stamp">' + '<span class="timeline-stamp-time">' + timeText + '</span>' + (endText ? '<span class="timeline-stamp-end">– ' + endText + '</span>' : '') + '</div>';
}
function buildTagHtml(tag) { if (!tag || !tag.text) return ''; return '<span class="tag">' + escapeHtml(tag.text) + '</span>'; }
function buildShootBtnHtml(day, index, eventTitle, shoppingCount) {
  var safeTitle = escAttr(eventTitle);
  var badge = '';
  if (shoppingCount > 0) { badge = ' <span class="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">' + shoppingCount + '</span>'; }
  var html = '<div class="flex flex-wrap gap-1 mt-1">';
  html += '<button onclick="openShootTipsModal(' + day + ', ' + index + ')" class="text-[10px] bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold transition">🎬 拍攝靈感</button>';
  html += '<button onclick="openShoppingModal(this.dataset.eventTitle)" data-event-title="' + safeTitle + '" class="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold transition">🛍️ 購物清單' + badge + '</button>';
  html += '</div>';
  return html;
}

function buildEventImage(imgUrl, eventTitle, images) {
  if (images && Array.isArray(images) && images.length > 1) {
    return buildImageCarousel(images, eventTitle);
  }
  if (!imgUrl) return '';
  var safeImg = escAttr(imgUrl);
  var safeAlt = escAttr(eventTitle);
  var html = '<div class="mt-2 rounded-xl overflow-hidden shadow-sm cursor-pointer" onclick="openLightbox([\'' + safeImg + '\'], 0)">';
  html += '<img src="' + safeImg + '" alt="' + safeAlt + '" width="400" height="128" class="lazy-fade w-full h-32 object-cover" loading="lazy" decoding="async" fetchpriority="low">';
  html += '</div>';
  return html;
}

function buildImageCarousel(images, eventTitle) {
  var safeAlt = escAttr(eventTitle);
  var carouselId = 'carousel-' + Math.random().toString(36).substr(2, 8);
  var html = '<div class="event-image-carousel mt-2 rounded-xl overflow-hidden shadow-sm" data-carousel-id="' + carouselId + '">';
  html += '<div class="carousel-track" id="' + carouselId + '" data-count="' + images.length + '">';
  images.forEach(function(url, i) {
    html += '<img src="' + escAttr(url) + '" alt="' + safeAlt + '" class="lazy-fade carousel-img" loading="lazy" decoding="async" data-index="' + i + '" onclick="openLightboxCarousel(this)">';
  });
  html += '</div>';
  html += '<div class="carousel-indicator">';
  html += '<span class="carousel-current">1</span>';
  html += '<span class="carousel-sep">/</span>';
  html += '<span class="carousel-total">' + images.length + '</span>';
  html += '</div>';
  html += '<div class="carousel-hint carousel-hint-left">‹</div>';
  html += '<div class="carousel-hint carousel-hint-right">›</div>';
  html += '</div>';
  return html;
}

function openLightboxCarousel(imgEl) {
  var carousel = imgEl.closest('.event-image-carousel');
  if (!carousel) return;
  var imgs = carousel.querySelectorAll('.carousel-img');
  var urls = Array.from(imgs).map(function(i) { return i.src; });
  var idx = parseInt(imgEl.dataset.index) || 0;
  openLightbox(urls, idx);
}
window.openLightboxCarousel = openLightboxCarousel;

function buildEventNavBtn(navUrl, eventTitle, navName) {
  var url = navUrl;
  if (!url && eventTitle) {
    url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(eventTitle);
  }
  if (!url) return '<div class="h-2"></div>';
  var label = navName || '景點';
  var safeTitle = escAttr(eventTitle);
  var safeUrl = escAttr(url);

  var html = '<a href="' + safeUrl + '" onclick="event.preventDefault(); openMap(\'' + safeUrl + '\', \'' + safeTitle + '\')" class="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold py-2 rounded-xl transition active:scale-95 shadow-sm mt-2 mb-2">';
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
  var headerHtml = buildDayHeaderHtml(dayData, weatherInfo);
  var eventsHtml = buildEventsHtml(dayData);
  var diaryHtml = buildDiaryHtml(dayData);
  section.innerHTML = '<div class="mb-8">' + headerHtml + '<div class="timeline">' + eventsHtml + '</div>' + diaryHtml + '</div>';
  setupImageFadeIn(section);
  setupEventImageLightbox(section);
  setTimeout(function() {
    updateExpandButtons(dayData);
    updateTimelineStatus();
    autoWrapMiniCards(dayData);
    bindCarouselScroll(dayData);
  }, 150);
  window._renderedDays.add(dayData.day);
}

function buildDayHeaderHtml(dayData, weatherInfo) {
  var html = '<div class="bg-slate-50/95 py-2.5 mb-2 px-1 border-b border-slate-200/50 flex justify-between items-center">';
  html += '<div class="flex items-center gap-2.5">';
  html += '<div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center text-lg shadow-md shrink-0">' + dayData.emoji + '</div>';
  html += '<div class="flex-1">';
  html += '<span class="text-[11px] font-bold text-sky-600 tracking-wider">' + escapeHtml(dayData.dateLabel) + '</span>';
  html += '<h2 class="text-sm md:text-lg font-extrabold text-slate-800 leading-tight">' + escapeHtml(dayData.title) + '</h2>';
  if (dayData.subtitle) { html += '<p class="text-[10px] text-slate-500 mt-0.5">' + escapeHtml(dayData.subtitle) + '</p>'; }

  // 👇 新增：天氣即時小標籤
  if (weatherInfo) {
    var advice = '🧥 防風';
    if (weatherInfo.min < -5) advice = '❄️ 極寒';
    else if (weatherInfo.min < 0) advice = '🧣 寒冷';
    if (weatherInfo.rain > 50) advice += ' 帶雨具';
    html += `<div class="mt-1.5 inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-sky-800 shadow-sm">`;
    html += `<span>${weatherInfo.icon}</span>`;
    html += `<span>${weatherInfo.min}°~${weatherInfo.max}°</span>`;
    html += `<span class="text-slate-300">|</span>`;
    html += `<span class="text-slate-600">${advice}</span>`;
    html += `</div>`;
  }
  // 👆 新增結束

  html += '</div></div>';
  html += '<button onclick="openVlogPlanModal(' + dayData.day + ')" class="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full shadow-sm shrink-0 ml-2">';
  html += '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.16 4h3.68a2 2 0 011.664.89l.812 1.22A2 2 0 0018 7h1a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
  html += '</button>';
  html += '</div>';
  return html;
}

function buildEventsHtml(dayData) { var html = ''; for (var i = 0; i < dayData.events.length; i++) { html += buildSingleEventHtml(dayData, dayData.events[i], i); } return html; }

function buildSingleEventHtml(dayData, event, index) {
  var isOpen = index === 0 ? 'open' : '';
  var timeParts = event.time.split(' - ');
  var startTime = timeParts[0].trim();
  var endTime = timeParts[1] ? timeParts[1].trim() : '';
  var shoppingItems = loadShoppingItems(event.title);
  var timeStamp = buildTimePill(startTime, endTime);
  var tagHtml = buildTagHtml(event.tag);
  var shootBtnHtml = buildShootBtnHtml(dayData.day, index, event.title, shoppingItems.length);
  var imageHtml = buildEventImage(event.img, event.title, event.images);
  var navBtnHtml = buildEventNavBtn(event.navUrl, event.title, event.navName);

  var html = '<div class="timeline-item" data-time="' + escapeHtml(startTime) + '" data-end-time="' + escapeHtml(endTime) + '" data-day="' + dayData.day + '">';
  html += '<div class="timeline-marker">';
  html += '<div class="timeline-node"></div>';
  html += timeStamp;
  html += '</div>';
  html += '<div class="timeline-card">';
  html += '<details ' + isOpen + ' data-day="' + dayData.day + '" data-index="' + index + '" class="group glass-card rounded-2xl relative overflow-hidden event-card">';
  html += '<div class="itinerary-cat-strip"></div>';
  html += '<summary class="flex items-start gap-3 p-3 cursor-pointer select-none hover:bg-slate-50/50 transition-colors relative list-none pl-5">';
  html += '<div class="flex-1 min-w-0 pr-8">';
  html += '<div class="flex flex-wrap items-center gap-2 mb-1">' + tagHtml + '</div>';
  html += '<h3 class="text-[13px] md:text-[15px] font-bold text-slate-800 leading-tight">' + escapeHtml(event.title) + '</h3>';
  html += shootBtnHtml;
  if (event.location) { html += '<div class="text-[11px] text-slate-500 mt-0.5">📍 ' + escapeHtml(event.location) + '</div>'; }
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

function updateExpandButtons(dayData) {
  dayData.events.forEach(function(_, index) {
    var wrapper = document.getElementById('collapsible-' + dayData.day + '-' + index);
    var btn = document.querySelector('[data-expand-btn="' + dayData.day + '-' + index + '"]');
    if (wrapper && btn) {
      if (wrapper.scrollHeight <= 580) { wrapper.classList.add('no-collapse'); btn.classList.add('hidden'); }
      else { wrapper.classList.remove('no-collapse'); btn.classList.remove('hidden'); }
    }
  });
}

// ==================== 自動包裝迷你卡片 ====================
function autoWrapMiniCards(dayData) {
  dayData.events.forEach(function(_, index) {
    var wrapper = document.getElementById('collapsible-' + dayData.day + '-' + index);
    if (!wrapper) return;
    var contentDiv = wrapper.querySelector(':scope > div');
    if (!contentDiv) return;
    var colorClasses = ['bg-amber', 'bg-sky', 'bg-indigo', 'bg-emerald', 'bg-teal', 'bg-rose', 'bg-slate', 'bg-white'];
    var sections = Array.from(contentDiv.children).filter(function(el) {
      if (el.tagName !== 'DIV') return false;
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
      if (emojiMatch) { emoji = emojiMatch[1]; }
      var details = document.createElement('details');
      details.className = 'mini-card';
      var summary = document.createElement('summary');
      summary.className = 'mini-card-summary';
      if (emoji) { var iconEl = document.createElement('span'); iconEl.className = 'mini-card-icon'; iconEl.textContent = emoji; summary.appendChild(iconEl); }
      var titleSpan = document.createElement('span');
      titleSpan.className = 'mini-card-title';
      var cleanTitle = firstText.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+\s*/u, '').trim();
      titleSpan.textContent = cleanTitle;
      summary.appendChild(titleSpan);
      var body = document.createElement('div');
      body.className = 'mini-card-body';
      titleEl.remove();
      while (section.firstChild) { body.appendChild(section.firstChild); }
      details.appendChild(summary);
      details.appendChild(body);
      section.parentNode.replaceChild(details, section);
    });
  });
}

// ==================== 輪播滾動監聽 ====================
function bindCarouselScroll(dayData) {
  dayData.events.forEach(function(_, index) {
    var wrapper = document.getElementById('collapsible-' + dayData.day + '-' + index);
    if (!wrapper) return;
    var cards = wrapper.closest('.event-card');
    if (!cards) return;
    var carousels = cards.querySelectorAll('.event-image-carousel');
    carousels.forEach(function(carousel) {
      if (carousel.dataset.bound === '1') return;
      carousel.dataset.bound = '1';
      var track = carousel.querySelector('.carousel-track');
      var currentEl = carousel.querySelector('.carousel-current');
      if (!track || !currentEl) return;
      var updateIndicator = function() {
        var idx = Math.round(track.scrollLeft / track.clientWidth) + 1;
        currentEl.textContent = idx;
        var hintL = carousel.querySelector('.carousel-hint-left');
        var hintR = carousel.querySelector('.carousel-hint-right');
        if (hintL) hintL.style.opacity = idx === 1 ? '0' : '1';
        if (hintR) hintR.style.opacity = idx === track.children.length ? '0' : '1';
      };
      var scrollTimer;
      track.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(updateIndicator, 80);
      }, { passive: true });
      updateIndicator();
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

// ==================== 雪地攻略 ====================
let driveTabState = 'basic';
function setDriveTab(tab) { driveTabState = tab; haptic(6); document.querySelectorAll('[data-drive-tab]').forEach(btn => { btn.classList.toggle('active', btn.dataset.driveTab === tab); }); renderDriveContent(); }
function renderDriveContent() { const container = document.getElementById('drive-content'); if (!container) return; const data = { basic: [ { title: "全程使用 4WD + 雪胎", desc: "出發前確認車輛配置，並檢查雪胎深度（建議 ≥ 5mm）與胎壓", type: "success" }, { title: "保持 3 秒以上車距", desc: "雪地煞車距離約為乾地的 3-5 倍", type: "success" }, { title: "避免急煞、急加速、急轉彎", desc: "所有動作放慢 2 倍", type: "warn" }, { title: "下坡善用低速檔", desc: "用引擎煞車取代腳踩煞車", type: "success" }, { title: "轉彎前先減速", desc: "彎中不踩煞車", type: "warn" } ], road: [ { title: "Black Ice 最危險", desc: "看似乾燥的柏油路面其實結冰", type: "danger" }, { title: "橋樑與陰影處優先結冰", desc: "通過前先減速", type: "warn" }, { title: "山區連續彎道", desc: "減速至 20-30 km/h", type: "warn" }, { title: "除雪車後方保持距離", desc: "保持 50m 以上距離", type: "success" }, { title: "隧道兩端注意", desc: "進出時提前減速", type: "warn" } ], emergency: [ { title: "備用保暖衣物與毯子", desc: "保暖是第一優先", type: "success" }, { title: "行動電源 2 個 + 車充", desc: "手機沒電等於失去導航", type: "success" }, { title: "食物與飲水", desc: "餅乾、巧克力、保溫瓶裝熱水", type: "success" }, { title: "小鏟子 + 拖車繩 + 三角牌", desc: "車輪陷入雪中時可自救", type: "success" }, { title: "緊急聯絡資訊", desc: "日本道路緊急電話 #9910", type: "warn" } ] }; const items = data[driveTabState] || []; container.innerHTML = items.map((item, i) => `<div class="numbered-card ${item.type}" style="margin-bottom:8px"><div class="numbered-index">${i + 1}</div><div class="numbered-content"><div class="numbered-title">${item.title}</div><div class="numbered-desc">${item.desc}</div></div></div>`).join(''); }

// ==================== 搶票攻略 ====================
function renderTicketContent() { const container = document.getElementById('ticket-content'); if (!container) return; const now = Date.now(); const ginzanDiff = GINZAN_TARGET - now; const zaoDiff = ZAO_TARGET - now; function formatCountdown(ms) { if (ms <= 0) return '🎉 已開賣'; const days = Math.floor(ms / 86400000); const hours = Math.floor((ms % 86400000) / 3600000); const minutes = Math.floor((ms % 3600000) / 60000); if (days > 0) return `${days}天 ${hours}時 ${minutes}分`; if (hours > 0) return `${hours}時 ${minutes}分`; return `${minutes}分`; } container.innerHTML = `<div class="ticket-card"><div class="ticket-header"><div class="ticket-title"><span>🎟️</span> 銀山溫泉 Fast Pass</div><span class="ticket-badge">首選方案</span></div><div class="ticket-countdown-row"><span class="ticket-countdown-label">倒數</span><span class="ticket-countdown">${formatCountdown(ginzanDiff)}</span></div><div class="ticket-meta"><div class="ticket-meta-item"><div class="label">開賣時間</div><div class="value">1/8 香港 23:00</div></div><div class="ticket-meta-item"><div class="label">目標</div><div class="value">4 張成人票</div></div><div class="ticket-meta-item"><div class="label">價格</div><div class="value">¥1,500 / 人</div></div><div class="ticket-meta-item"><div class="label">平台</div><div class="value">Asoview!</div></div></div><div class="ticket-steps"><div class="ticket-step"><div class="ticket-step-dot">1</div><span>提前註冊 Asoview! 帳號並綁定信用卡</span></div><div class="ticket-step"><div class="ticket-step-dot">2</div><span>1/8 22:55 設定鬧鐘，提前 5 分鐘登入</span></div><div class="ticket-step"><div class="ticket-step-dot">3</div><span>開賣後直接鎖定 15:30-19:15 時段</span></div></div></div><div class="ticket-card zao"><div class="ticket-header"><div class="ticket-title"><span>🚠</span> 藏王纜車優先票</div><span class="ticket-badge">必搶</span></div><div class="ticket-countdown-row"><span class="ticket-countdown-label">倒數</span><span class="ticket-countdown">${formatCountdown(zaoDiff)}</span></div><div class="ticket-meta"><div class="ticket-meta-item"><div class="label">開賣時間</div><div class="value">1/15 香港 23:00</div></div><div class="ticket-meta-item"><div class="label">目標</div><div class="value">成人 2 + 兒童 2</div></div><div class="ticket-meta-item"><div class="label">價格</div><div class="value">¥5,500 / ¥3,500</div></div><div class="ticket-meta-item"><div class="label">平台</div><div class="value">Asoview! / 官網</div></div></div><div class="ticket-steps"><div class="ticket-step"><div class="ticket-step-dot">1</div><span>系統於搭乘日前 7 天日本時間 00:00 釋出</span></div><div class="ticket-step"><div class="ticket-step-dot">2</div><span>開賣後鎖定 <strong>08:30 或 09:00</strong> 最早時段</span></div><div class="ticket-step"><div class="ticket-step-dot">3</div><span>週六優先票通常 <strong>5 分鐘內秒殺</strong></span></div></div></div>`; }

// ==================== 拍攝靈感 ====================
function openShootTipsModal(day, eventIndex) {
  const dayData = winterItineraries.find(d => d.day === day);
  if (!dayData) return;
  const event = dayData.events[eventIndex];
  if (!event) return;
  const tips = shootTips[event.title];
  const content = document.getElementById("shoot-tips-content");
  let html = "";
  if (tips) {
    const pa = tips["拍照建議"] || "";
    html += `<div class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-orange-800 mb-2">📷 拍照建議</h3><p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(pa)}</p></div>`;
    if (tips["參考照片"] && tips["參考照片"].length > 0) {
      const imgHtml = tips["參考照片"].map(url => `<img src="${escAttr(url)}" class="lazy-fade w-32 h-24 object-cover rounded-lg cursor-pointer border border-slate-200" onclick="openLightbox(['${escAttr(url)}'], 0)" loading="lazy" decoding="async">`).join("");
      html += `<div class="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-pink-800 mb-2">📷 參考照片</h3><div class="flex gap-2 overflow-x-auto scrollbar-none pb-2">${imgHtml}</div></div>`;
    }
    html += `<details class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3"><summary class="cursor-pointer text-sm font-black text-slate-700 mb-2">📸 展開詳細拍攝建議</summary><div class="space-y-3 mt-2">`;
    if (tips["Pocket 3 參數"]) html += `<div class="bg-sky-50 border border-sky-200 rounded-xl p-3"><h3 class="text-sm font-black text-sky-800 mb-1">📸 Pocket 3 參數</h3><p class="text-sm text-slate-700">${escapeHtml(tips["Pocket 3 參數"])}</p></div>`;
    if (tips["Vlog 必拍鏡頭"] && tips["Vlog 必拍鏡頭"].length > 0) html += `<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3"><h3 class="text-sm font-black text-emerald-800 mb-2">🎬 Vlog 必拍鏡頭</h3><ul class="list-disc pl-4 space-y-1">${tips["Vlog 必拍鏡頭"].map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`;
    if (tips["最佳拍攝時間"] || tips["拍攝時長"]) { let ti = ""; if (tips["最佳拍攝時間"]) ti += `<span class="block mb-1">⏰ ${escapeHtml(tips["最佳拍攝時間"])}</span>`; if (tips["拍攝時長"]) ti += `<span class="block">⏳ ${escapeHtml(tips["拍攝時長"])}</span>`; html += `<div class="bg-amber-50 border border-amber-200 rounded-xl p-3"><h3 class="text-sm font-black text-amber-800 mb-2">⏱️ 拍攝時間建議</h3><p class="text-sm text-slate-700">${ti}</p></div>`; }
    if (tips["拍攝角度"] && tips["拍攝角度"].length > 0) html += `<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3"><h3 class="text-sm font-black text-indigo-800 mb-2">🎯 拍攝角度</h3><ul class="list-disc pl-4 space-y-1">${tips["拍攝角度"].map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`;
    if (tips["人物動作建議"] && tips["人物動作建議"].length > 0) html += `<div class="bg-rose-50 border border-rose-200 rounded-xl p-3"><h3 class="text-sm font-black text-rose-800 mb-2">🧍 人物動作建議</h3><ul class="list-disc pl-4 space-y-1">${tips["人物動作建議"].map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`;
    html += `</div></details>`;
  } else {
    html = `<div class="text-center py-8 text-slate-500 text-sm">暫時沒有這個景點的拍攝建議。</div>`;
  }
  content.innerHTML = html;
  showModal('shoot-tips-modal');
  document.getElementById('shoot-tips-modal').classList.remove('hidden');
  setTimeout(() => setupImageFadeIn(content), 50);
}
function closeShootTipsModal() { hideModal('shoot-tips-modal'); setTimeout(() => document.getElementById('shoot-tips-modal').classList.add('hidden'), 300); }

function openCommonTipsModal() {
  const m = document.getElementById('common-tips-modal'); if (!m) return;
  m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open');
  const c = document.getElementById('common-tips-content');
  if (c && typeof shootTipsCommon !== 'undefined') {
    let html = '';
    Object.keys(shootTipsCommon).forEach(title => {
      const tips = shootTipsCommon[title];
      html += `<div class="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-4"><h3 class="text-sm font-black text-slate-800 mb-2">${escapeHtml(title)}</h3>`;
      if (tips['拍照建議']) html += `<div class="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-2 text-xs text-slate-700"><strong class="text-sky-800 block mb-1">📷 拍照建議</strong>${escapeHtml(tips['拍照建議'])}</div>`;
      html += `</div>`;
    });
    c.innerHTML = html;
  }
}
function closeCommonTipsModal() { const m = document.getElementById('common-tips-modal'); if (m) { m.classList.remove('active'); setTimeout(() => m.style.display = 'none', 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); } }

function openVlogPlanModal(day) {
  const plan = vlogPlan["D" + day];
  const content = document.getElementById("vlog-plan-content");
  let html = "";
  if (plan) {
    if (plan["整支Vlog構思"]) html += `<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-indigo-800 mb-2">🎬 整支 Vlog 構思</h3><p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(plan["整支Vlog構思"])}</p></div>`;
    if (plan["人物構圖"]) html += `<div class="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-sky-800 mb-2">🧍 人物構圖</h3><ul class="list-disc pl-4 space-y-1">${plan["人物構圖"].map(i=>`<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`;
    if (plan["風景構圖"]) html += `<div class="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-3"><h3 class="text-sm font-black text-teal-800 mb-2">🏞️ 風景構圖</h3><ul class="list-disc pl-4 space-y-1">${plan["風景構圖"].map(i=>`<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`;
  } else {
    html = `<div class="text-center py-8 text-slate-500 text-sm">暫時未填寫今天的 Vlog 構思。</div>`;
  }
  content.innerHTML = html;
  showModal('vlog-plan-modal');
  document.getElementById('vlog-plan-modal').classList.remove('hidden');
}
function closeVlogPlanModal() { hideModal('vlog-plan-modal'); setTimeout(() => document.getElementById('vlog-plan-modal').classList.add('hidden'), 300); }

// ==================== 快速記帳 ====================
function openLedgerAdd() { const lc = document.getElementById('ledger-frame-container'); const iframe = document.getElementById('ledger-iframe'); if (lc && iframe) { haptic(12); lc.classList.remove('hidden-view'); lc.style.cssText = 'position: fixed; inset: 0; z-index: 9990; background: #f0f9ff; overflow: auto;'; let attempts = 0; const tryOpen = () => { if (iframe.contentWindow && iframe.contentWindow.openExpenseModal) { iframe.contentWindow.openExpenseModal(); } else if (attempts < 10) { attempts++; setTimeout(tryOpen, 200); } else { showToast('記帳本載入失敗', '⚠️'); } }; tryOpen(); } }

// ==================== 行程切換 ====================
function switchDay(day) {
  window._lastActiveDay = day;
  haptic(6);
  const dayData = winterItineraries.find(d => d.day === day);
  if (dayData && !window._renderedDays.has(day)) { renderDayItinerary(`day-section-${day}`, dayData); }
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

// ==================== 攻略 Modal 開關 ====================
function toggleDriveModal() { const modal = document.getElementById('drive-modal'); if (modal.classList.contains('hidden')) { showModal('drive-modal'); modal.classList.remove('hidden'); setDriveTab('basic'); } else { hideModal('drive-modal'); setTimeout(() => modal.classList.add('hidden'), 300); } }
function closeDriveModal() { hideModal('drive-modal'); setTimeout(() => document.getElementById('drive-modal').classList.add('hidden'), 300); }
function toggleTicketModal() { const modal = document.getElementById('ticket-modal'); if (modal.classList.contains('hidden')) { showModal('ticket-modal'); modal.classList.remove('hidden'); renderTicketContent(); if (window._ticketTimer) clearInterval(window._ticketTimer); window._ticketTimer = setInterval(() => { if (!modal.classList.contains('hidden')) renderTicketContent(); else clearInterval(window._ticketTimer); }, 1000); } else { hideModal('ticket-modal'); setTimeout(() => modal.classList.add('hidden'), 300); if (window._ticketTimer) clearInterval(window._ticketTimer); } }
function closeTicketModal() { hideModal('ticket-modal'); setTimeout(() => document.getElementById('ticket-modal').classList.add('hidden'), 300); if (window._ticketTimer) clearInterval(window._ticketTimer); }
function openTripOverview() { const m = document.getElementById('trip-overview-modal'); if (m) { m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); renderTripOverview(); } }
function closeTripOverview() { const m = document.getElementById('trip-overview-modal'); if (m) { m.classList.remove('active'); setTimeout(() => { m.style.display = 'none'; }, 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); } }
function openWeatherModal() { const modal = document.getElementById('weather-modal'); showModal('weather-modal'); modal.classList.remove('hidden'); document.getElementById('weather-detail-content').innerHTML = ''; fetchWeatherData(); }
function closeWeatherModal() { hideModal('weather-modal'); setTimeout(() => document.getElementById('weather-modal').classList.add('hidden'), 300); }

// 讓 app-core 的 setupModalDrag 可以從 window 找到
window.toggleDriveModal = toggleDriveModal;
window.closeDriveModal = closeDriveModal;
window.toggleTicketModal = toggleTicketModal;
window.closeTicketModal = closeTicketModal;
window.openTripOverview = openTripOverview;
window.closeTripOverview = closeTripOverview;
window.openWeatherModal = openWeatherModal;
window.closeWeatherModal = closeWeatherModal;
window.openShootTipsModal = openShootTipsModal;
window.closeShootTipsModal = closeShootTipsModal;
window.openCommonTipsModal = openCommonTipsModal;
window.closeCommonTipsModal = closeCommonTipsModal;
window.openVlogPlanModal = openVlogPlanModal;
window.closeVlogPlanModal = closeVlogPlanModal;