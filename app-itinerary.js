/* ============================================================
 * app-itinerary.js — v14.2（多地點天氣 + 移除行程卡片天氣框）
 *
 * v14.0：多地點天氣
 * v14.1：updateDayTabTodayMark + switchDay 呼叫
 * v14.2：
 *   - ⭐ 新增 initDayTabs(initialDay) 一次完成初始化
 *   - ⭐ 設定 active tab + 標記今天 + 自動置中
 * ============================================================ */

// ==================== 天氣 ====================
const WEATHER_LOCATIONS = {
  1: [
    { id: 'sendai_airport', name: '仙台機場', shortName: '機場',
      lat: 38.1397, lon: 140.9169, timeFrom: '00:00', timeTo: '15:30',
      climate: { max: 5, min: -1, rain: 30 } },
    { id: 'akiu', name: '秋保溫泉', shortName: '秋保',
      lat: 38.2263, lon: 140.7242, timeFrom: '15:30', timeTo: '23:59',
      climate: { max: 3, min: -2, rain: 35 } }
  ],
  2: [
    { id: 'tendo', name: '山形天童', shortName: '天童',
      lat: 38.3625, lon: 140.3694, timeFrom: '00:00', timeTo: '15:00',
      climate: { max: 4, min: -2, rain: 35 } },
    { id: 'ginzan', name: '銀山溫泉', shortName: '銀山',
      lat: 38.5747, lon: 140.5309, timeFrom: '15:00', timeTo: '23:59',
      climate: { max: 1, min: -4, rain: 45 } }
  ],
  3: [
    { id: 'zao', name: '藏王', shortName: '藏王',
      lat: 38.1656, lon: 140.3986, timeFrom: '00:00', timeTo: '12:30',
      climate: { max: -2, min: -8, rain: 50 } },
    { id: 'yamagata', name: '山形', shortName: '山形',
      lat: 38.2554, lon: 140.3396, timeFrom: '12:30', timeTo: '14:30',
      climate: { max: 4, min: -2, rain: 35 } },
    { id: 'sagae', name: '寒河江', shortName: '寒河江',
      lat: 38.3807, lon: 140.2759, timeFrom: '14:30', timeTo: '15:30',
      climate: { max: 3, min: -3, rain: 40 } },
    { id: 'tendo', name: '山形天童', shortName: '天童',
      lat: 38.3625, lon: 140.3694, timeFrom: '15:30', timeTo: '23:59',
      climate: { max: 4, min: -2, rain: 35 } }
  ],
  4: [
    { id: 'tendo', name: '山形天童', shortName: '天童',
      lat: 38.3625, lon: 140.3694, timeFrom: '00:00', timeTo: '10:45',
      climate: { max: 4, min: -2, rain: 35 } },
    { id: 'spring_valley', name: 'Spring Valley 泉高原', shortName: '滑雪場',
      lat: 38.3694, lon: 140.6908, timeFrom: '10:45', timeTo: '14:30',
      climate: { max: 0, min: -5, rain: 40 } },
    { id: 'sendai', name: '宮城仙台', shortName: '仙台',
      lat: 38.2682, lon: 140.8694, timeFrom: '14:30', timeTo: '23:59',
      climate: { max: 5, min: -1, rain: 30 } }
  ],
  5: [
    { id: 'sendai', name: '宮城仙台', shortName: '仙台',
      lat: 38.2682, lon: 140.8694, timeFrom: '00:00', timeTo: '23:59',
      climate: { max: 5, min: -1, rain: 30 } },
    { id: 'zao_fox', name: '藏王狐狸村', shortName: '狐狸村',
      lat: 38.0407, lon: 140.5322, timeFrom: '09:30', timeTo: '13:45',
      climate: { max: 2, min: -3, rain: 35 } }
  ],
  6: [
    { id: 'sendai', name: '宮城仙台', shortName: '仙台',
      lat: 38.2682, lon: 140.8694, timeFrom: '00:00', timeTo: '23:59',
      climate: { max: 5, min: -1, rain: 30 } }
  ],
  7: [
    { id: 'sendai', name: '宮城仙台', shortName: '仙台',
      lat: 38.2682, lon: 140.8694, timeFrom: '00:00', timeTo: '23:59',
      climate: { max: 5, min: -1, rain: 30 } }
  ]
};

function getPrimaryLocation(dayIdx) {
  const locs = WEATHER_LOCATIONS[dayIdx];
  return (locs && locs.length > 0) ? locs[0] : null;
}

const CLIMATE_SUN_TIMES = {
  "2027-01-21": { sunrise: "06:52", sunset: "16:35" },
  "2027-01-22": { sunrise: "06:52", sunset: "16:36" },
  "2027-01-23": { sunrise: "06:51", sunset: "16:37" },
  "2027-01-24": { sunrise: "06:51", sunset: "16:38" },
  "2027-01-25": { sunrise: "06:50", sunset: "16:39" },
  "2027-01-26": { sunrise: "06:50", sunset: "16:40" },
  "2027-01-27": { sunrise: "06:49", sunset: "16:41" }
};

function weatherCodeToIconTag(code) {
  code = Number(code);
  if (isNaN(code)) return { icon: "🌡️", cat: "fog" };
  if (code === 0)                    return { icon: "☀️",  cat: "clear" };
  if (code === 1)                    return { icon: "🌤️", cat: "clear" };
  if (code === 2)                    return { icon: "⛅",  cat: "cloud" };
  if (code === 3)                    return { icon: "☁️",  cat: "cloud" };
  if (code === 45 || code === 48)    return { icon: "🌫️", cat: "fog" };
  if (code >= 51 && code <= 55)      return { icon: "🌦️", cat: "rain" };
  if (code === 56 || code === 57)    return { icon: "🌧️", cat: "rain" };
  if (code >= 61 && code <= 65)      return { icon: "🌧️", cat: "rain" };
  if (code === 66 || code === 67)    return { icon: "🌧️", cat: "rain" };
  if (code >= 71 && code <= 75)      return { icon: "❄️",  cat: "snow" };
  if (code === 77)                   return { icon: "🌨️", cat: "snow" };
  if (code >= 80 && code <= 82)      return { icon: "🌧️", cat: "rain" };
  if (code === 85 || code === 86)    return { icon: "🌨️", cat: "snow" };
  if (code >= 95 && code <= 99)      return { icon: "⛈️", cat: "storm" };
  return { icon: "🌡️", cat: "fog" };
}

function weatherCodeToIcon(code) {
  return weatherCodeToIconTag(code).icon;
}

async function fetchWeatherData() {
  const today = new Date();
  const tripStartDate = new Date(TRIP_START);
  const daysUntil = Math.floor((tripStartDate - today) / 86400000);
  const tooFar = daysUntil > 16;

  const tasks = [];
  tripDates.forEach((dateStr, idx) => {
    const locs = WEATHER_LOCATIONS[idx + 1] || [];
    locs.forEach((loc) => {
      tasks.push({ dateStr, dayIdx: idx, loc });
    });
  });

  const results = await Promise.all(tasks.map(async (task) => {
    const { dateStr, loc } = task;
    const key = dateStr + '|' + loc.id;

    if (tooFar) {
      const sunRef = CLIMATE_SUN_TIMES[dateStr];
      return {
        key,
        data: {
          dateStr, location: loc.name, locId: loc.id,
          max: loc.climate.max, min: loc.climate.min, rain: loc.climate.rain,
          icon: "❄️", wcat: "snow",
          current: null,
          sunrise: sunRef ? sunRef.sunrise : null,
          sunset: sunRef ? sunRef.sunset : null,
          isClimate: true
        }
      };
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=Asia%2FTokyo&start_date=${dateStr}&end_date=${dateStr}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        return { key, data: null };
      }

      const sunrise = data.daily.sunrise?.[0]?.split("T")[1]?.substring(0, 5) || null;
      const sunset  = data.daily.sunset?.[0]?.split("T")[1]?.substring(0, 5) || null;
      const dailyTag = weatherCodeToIconTag(data.daily.weather_code[0]);
      const currentTag = data.current ? weatherCodeToIconTag(data.current.weather_code) : null;

      return {
        key,
        data: {
          dateStr, location: loc.name, locId: loc.id,
          max: Math.round(data.daily.temperature_2m_max[0]),
          min: Math.round(data.daily.temperature_2m_min[0]),
          rain: data.daily.precipitation_probability_max[0] ?? 0,
          icon: dailyTag.icon,
          wcat: dailyTag.cat,
          current: data.current ? {
            temp: Math.round(data.current.temperature_2m),
            feels: Math.round(data.current.apparent_temperature),
            humidity: data.current.relative_humidity_2m,
            icon: currentTag.icon,
            wcat: currentTag.cat
          } : null,
          sunrise, sunset,
          isClimate: false
        }
      };
    } catch (e) {
      return { key, data: null };
    }
  }));

  results.forEach(r => {
    if (r.data) {
      window.weatherCache[r.key] = r.data;
    }
  });

  tripDates.forEach((dateStr, idx) => {
    const locs = WEATHER_LOCATIONS[idx + 1] || [];
    if (locs.length > 0) {
      const primaryKey = dateStr + '|' + locs[0].id;
      if (window.weatherCache[primaryKey]) {
        window.weatherCache[dateStr] = window.weatherCache[primaryKey];
      }
    }
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
  const firstDayWeather = window.weatherCache[tripDates[0]];
  const isClimateMode = firstDayWeather?.isClimate === true;

  let heroData = todayIdx >= 0 ? window.weatherCache[tripDates[todayIdx]] : firstDayWeather;
  const primaryLoc = todayIdx >= 0 ? getPrimaryLocation(todayIdx) : getPrimaryLocation(0);
  let heroLocName = heroData?.location || (primaryLoc ? primaryLoc.name : '宮城仙台');

  const curTemp = heroData?.current?.temp
    ?? (heroData ? Math.round((heroData.max + heroData.min) / 2) : null);
  const feels = heroData?.current?.feels ?? curTemp;
  const humidity = heroData?.current?.humidity ?? '--';
  const curIcon = heroData?.current?.icon ?? heroData?.icon ?? "⛅";
  const curCat  = heroData?.current?.wcat ?? heroData?.wcat ?? "cloud";

  let advice = { icon: "🧥", text: "防風外套即可" };
  if (curTemp === null) advice = { icon: "⏳", text: "天氣資料載入中" };
  else if (curTemp < -10) advice = { icon: "🥶", text: "極寒！羽絨 + 雪靴 + 毛帽 + 手套" };
  else if (curTemp < -5)  advice = { icon: "❄️", text: "羽絨 + 雪靴 + 毛帽必備" };
  else if (curTemp < 0)   advice = { icon: "🧣", text: "寒冷，圍巾 + 手套不可少" };
  else if (curTemp < 5)   advice = { icon: "🧥", text: "外套防風防水，早晚偏冷" };

  const rows = tripDates.map((ds, i) => {
    const w = window.weatherCache[ds];
    const d = new Date(ds);
    const week = ["日","一","二","三","四","五","六"][d.getDay()];
    const isToday = ds === today;
    const loc = getPrimaryLocation(i);
    const locName = loc ? loc.name : '';
    if (!w) return `<div class="forecast-row ${isToday ? 'today' : ''}"><div class="forecast-date">${isToday ? "今天" : ds.substring(5)} (${week})</div><div class="forecast-icon" data-wcat="cloud">⏳</div><div class="forecast-temp" style="color:#94a3b8;font-size:11px">${locName} · 暫無資料</div></div>`;

    const badge = w.isClimate
      ? '<span class="forecast-badge climate">🌡️ 氣候參考</span>'
      : '<span class="forecast-badge real">📡 即時預報</span>';

    let sunRow = '';
    if (w.sunrise && w.sunset) {
      sunRow = `<div class="forecast-sun">🌅 ${w.sunrise} · 🌇 ${w.sunset}</div>`;
    }

    return `<div class="forecast-row ${isToday ? 'today' : ''}">
      <div class="forecast-date">${isToday ? "今天" : ds.substring(5)} (${week})</div>
      <div class="forecast-icon" data-wcat="${w.wcat || 'cloud'}">${w.icon}</div>
      <div class="forecast-temp">
        <span class="forecast-temp-max">${w.max}°</span>
        <span class="text-slate-400 mx-1">/</span>
        <span class="forecast-temp-min">${w.min}°</span>
        <span style="font-size:11px;color:#94a3b8;margin-left:4px">${locName}</span>
        ${sunRow}
      </div>
      <div class="forecast-right">
        <div class="forecast-rain">💧 ${w.rain}%</div>
        ${badge}
      </div>
    </div>`;
  }).join('');

  const heroHint = isClimateMode ? `
    <div class="text-center mt-3 py-3 px-4 text-slate-500 text-xs bg-amber-50 rounded-xl border border-amber-200 leading-relaxed">
      📅 距離出發還有 <strong class="text-amber-700">${Math.max(0, Math.floor((TRIP_START - Date.now()) / 86400000))}</strong> 天<br>
      下方為<strong class="text-amber-700">氣候平均值</strong>（非實際預報）<br>
      出發前 16 天內會自動切換為即時預報
    </div>` : '';

  detail.innerHTML = `
    <div class="weather-hero">
      <div class="weather-hero-icon" data-wcat="${curCat}">${curIcon}</div>
      <div>
        <div class="weather-hero-temp">${curTemp !== null ? curTemp + '°C' : '--'}</div>
        <div class="weather-hero-meta">${curTemp !== null ? `體感 ${feels}°C · 濕度 ${humidity}% · ${heroLocName}` : heroLocName}</div>
      </div>
    </div>
    <div class="weather-advice"><div class="weather-advice-icon">${advice.icon}</div><div class="weather-advice-text">${advice.text}</div></div>
    <div class="text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">7 天行程天氣預報</div>
    <div class="forecast-list">${rows}</div>
    ${heroHint}
  `;
}

// ==================== findShootTips ====================
function findShootTips(eventTitle, eventKey) {
  if (typeof shootTips === 'undefined') return null;
  if (eventKey && shootTips[eventKey]) return shootTips[eventKey];
  if (!eventTitle) return null;
  if (shootTips[eventTitle]) return shootTips[eventTitle];

  const normalize = (s) => String(s)
    .replace(/\s+/g, '')
    .replace(/[（）()【】\[\]「」『』""'']/g, '')
    .replace(/[，,。.、；;：:！!？?·・｜|]/g, '')
    .replace(/[&＆]/g, '&')
    .replace(/[-–—－]/g, '-')
    .toLowerCase();

  const target = normalize(eventTitle);
  const keys = Object.keys(shootTips);

  for (const key of keys) {
    if (normalize(key) === target) return shootTips[key];
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const key of keys) {
    if (/^d\d+-e\d+$/.test(key)) continue;
    const nk = normalize(key);
    if (nk.length < 4 || target.length < 4) continue;

    let score = 0;
    if (nk.includes(target) || target.includes(nk)) {
      score = Math.min(nk.length, target.length) * 2;
    } else {
      let prefix = 0;
      const minLen = Math.min(nk.length, target.length);
      while (prefix < minLen && nk[prefix] === target[prefix]) prefix++;
      if (prefix >= 6) score = prefix;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = shootTips[key];
    }
  }

  if (bestMatch && bestScore >= 6) {
    console.warn(`[shootTips] "${eventTitle}" 未精確匹配，使用近似結果（分數 ${bestScore}）`);
    return bestMatch;
  }

  console.warn('[shootTips] ❌ 找不到匹配：', eventTitle, '（key:', eventKey, '）');
  return null;
}

// ==================== 行程速覽 ====================
function renderTripOverview() {
  const container = document.getElementById('overview-timeline-content'); if (!container) return;
  const days = [ { day: "D1", color: "#0ea5e9", emoji: "✈️", title: "抵達雪國", desc: "仙台機場 → 秋保溫泉 → 蟹腳 Buffet" }, { day: "D2", color: "#f59e0b", emoji: "🏮", title: "天童 + 銀山", desc: "AEON 天童 → 瀧之湯 → 銀山夜景" }, { day: "D3", color: "#6366f1", emoji: "☃️", title: "藏王樹冰", desc: "藏王纜車 → 樹冰 → 山形壽司 → 溫泉懷石" }, { day: "D4", color: "#10b981", emoji: "⛷️", title: "Spring Valley", desc: "玩雪 → 入住 Grand Bach → 伊達牛舌" }, { day: "D5", color: "#f43f5e", emoji: "🦊", title: "狐狸村", desc: "客美多早餐 → 狐狸村 → 白石溫麵" }, { day: "D6", color: "#14b8a6", emoji: "🐬", title: "水族館 / 採草莓", desc: "早餐 → 水族館或草莓 → 仔虎和牛 → Outlet" }, { day: "D7", color: "#475569", emoji: "✈️", title: "返港", desc: "仙台車站伴手禮 → 機場還車 → 起飛返港" } ];
  container.innerHTML = `<div class="overview-timeline">${days.map(d => `<div class="overview-day"><div class="overview-day-marker" style="background:${d.color}">${d.day}</div><div class="overview-day-content"><div class="overview-day-title">${d.emoji} ${d.title}</div><div class="overview-day-desc">${d.desc}</div></div></div>`).join('')}</div>`;
}

function toggleContent(day, index) {
  const wrapper = document.getElementById(`collapsible-${day}-${index}`);
  const btn = document.querySelector(`[data-expand-btn="${day}-${index}"]`);
  if (!wrapper) return;
  haptic(6);
  const isExpanded = wrapper.classList.toggle("expanded");
  if (btn) {
    btn.classList.toggle("expanded", isExpanded);
    const label = btn.querySelector("span");
    if (label) label.textContent = isExpanded ? "收合攻略" : "展開完整攻略";
  }
}

// ==================== 行程渲染 ====================
function buildTimePill(startTime, endTime) {
  var timeText = escapeHtml(startTime);
  var endText = (endTime && endTime !== '-') ? escapeHtml(endTime) : '';
  return '<div class="timeline-stamp">' + '<span class="timeline-stamp-time">' + timeText + '</span>' + (endText ? '<span class="timeline-stamp-end">– ' + endText + '</span>' : '') + '</div>';
}
function buildTagHtml(tag) { if (!tag || !tag.text) return ''; return '<span class="tag ' + (tag.class ? escapeHtml(tag.class) : '') + '">' + escapeHtml(tag.text) + '</span>'; }

function buildEventActionsHtml(day, index, eventTitle, shoppingCount) {
  var safeTitle = escAttr(eventTitle);
  var badge = '';
  if (shoppingCount > 0) { badge = '<span class="badge">' + shoppingCount + '</span>'; }
  var html = '<div class="event-action-buttons">';
  html += '<button type="button" class="event-action-btn" onclick="event.preventDefault();event.stopPropagation();openShootTipsModal(' + day + ',' + index + ')">🎬 拍攝</button>';
  html += '<button type="button" class="event-action-btn" onclick="event.preventDefault();event.stopPropagation();openShoppingModal(this.dataset.eventTitle)" data-event-title="' + safeTitle + '">🛍️ 購物' + badge + '</button>';
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
  if (!url && eventTitle) { url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(eventTitle); }
  if (!url) return '<div class="h-2"></div>';
  var label = navName || '景點';
  var html = '<a href="' + escAttr(url) + '" target="_blank" class="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold py-2 rounded-xl transition active:scale-95 shadow-sm mt-2 mb-2">';
  html += '<span>📍</span> 導航前往 ' + escapeHtml(label);
  html += '</a>';
  return html;
}

function normalizeEventContent(section) {
  var collapsibles = section.querySelectorAll('.event-collapsible');
  collapsibles.forEach(function(collapsible) {
    normalizeSingleCollapsible(collapsible);
  });
}

function normalizeSingleCollapsible(collapsible) {
  var initialChildren = Array.from(collapsible.children);
  initialChildren.forEach(function(el) {
    if (el.classList.contains('tip-block')) {
      var converted = convertTipBlockToDetails(el);
      if (converted) {
        collapsible.replaceChild(converted, el);
      }
    }
  });

  var allChildren = Array.from(collapsible.children);
  var detailsList = [];
  var otherElements = [];

  allChildren.forEach(function(el) {
    if (el.tagName === 'DETAILS') {
      detailsList.push(el);
    } else {
      otherElements.push(el);
    }
  });

  if (detailsList.length === 0) return;

  var mostImportant = null;
  for (var i = 0; i < detailsList.length; i++) {
    if (detailsList[i].classList.contains('tip-block-details') &&
        detailsList[i].classList.contains('danger')) {
      mostImportant = detailsList[i];
      break;
    }
  }
  if (!mostImportant) {
    for (var j = 0; j < detailsList.length; j++) {
      if (detailsList[j].classList.contains('tip-block-details') &&
          detailsList[j].classList.contains('warn')) {
        mostImportant = detailsList[j];
        break;
      }
    }
  }
  if (mostImportant) {
    mostImportant.open = true;
    mostImportant.setAttribute('data-keep-open', 'true');
  }

  var fragment = document.createDocumentFragment();

  otherElements.forEach(function(el) {
    fragment.appendChild(el);
  });

  var divider = document.createElement('div');
  divider.className = 'collapsible-divider';
  divider.innerHTML = '<span>📖 詳細攻略</span>';
  fragment.appendChild(divider);

  if (mostImportant) {
    fragment.appendChild(mostImportant);
  }
  detailsList.forEach(function(d) {
    if (d !== mostImportant) {
      fragment.appendChild(d);
    }
  });

  collapsible.innerHTML = '';
  collapsible.appendChild(fragment);
}

function convertTipBlockToDetails(tipBlock) {
  var strong = tipBlock.querySelector('strong');
  var fullText = tipBlock.textContent.trim();
  var hasBr = tipBlock.innerHTML.includes('<br');

  if (!strong && (!hasBr || fullText.length < 80)) {
    return null;
  }

  var titleText = '';
  if (strong) {
    titleText = strong.textContent.trim();
  } else {
    var htmlContent = tipBlock.innerHTML;
    var firstBrIndex = htmlContent.indexOf('<br');
    var rawTitle = firstBrIndex > -1 ? htmlContent.substring(0, firstBrIndex) : htmlContent;
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawTitle;
    titleText = tempDiv.textContent.trim();
  }

  if (!titleText) titleText = '💡 詳細資訊';

  var isDanger = tipBlock.classList.contains('danger');
  var isWarn = tipBlock.classList.contains('warn');

  var details = document.createElement('details');
  details.className = 'tip-block-details';
  if (isDanger) details.classList.add('danger');
  if (isWarn) details.classList.add('warn');

  var summary = document.createElement('summary');
  summary.textContent = titleText;

  var body = document.createElement('div');
  var nodes = Array.from(tipBlock.childNodes);

  if (strong) {
    var skipNextBr = false;
    nodes.forEach(function(node) {
      if (node === strong) {
        skipNextBr = true;
        return;
      }
      if (skipNextBr && node.nodeType === 1 && node.tagName === 'BR') {
        skipNextBr = false;
        return;
      }
      skipNextBr = false;
      body.appendChild(node.cloneNode(true));
    });
  } else {
    var skipMode = true;
    nodes.forEach(function(node) {
      if (skipMode) {
        if (node.nodeType === 1 && node.tagName === 'BR') {
          skipMode = false;
        }
        return;
      }
      body.appendChild(node.cloneNode(true));
    });
  }

  if (body.textContent.trim() === '' && !body.querySelector('img')) {
    return null;
  }

  details.appendChild(summary);
  details.appendChild(body);
  return details;
}

function renderDayItinerary(sectionId, dayData, force) {
  if (force === undefined) force = false;
  if (!force && window._renderedDays.has(dayData.day)) return;
  var section = document.getElementById(sectionId);
  if (!section) return;
  var dateStr = tripDates[dayData.day - 1];
  var weatherInfo = window.weatherCache[dateStr] || null;
  var weatherHtml = '';
  var headerHtml = buildDayHeaderHtml(dayData, weatherHtml);
  var eventsHtml = buildEventsHtml(dayData);
  var diaryHtml = buildDiaryHtml(dayData);
  section.innerHTML = '<div class="mb-8">' + headerHtml + '<div class="timeline">' + eventsHtml + '</div>' + diaryHtml + '</div>';

  normalizeEventContent(section);

  setupImageFadeIn(section);
  setupEventImageLightbox(section);
  setTimeout(function() {
    updateExpandButtons(dayData);
    updateTimelineStatus();

    section.querySelectorAll('details:not(.event-card)').forEach(function(d) {
      if (d.dataset.keepOpen !== 'true') {
        d.open = false;
      }
    });

    autoWrapMiniCards(dayData);
    bindCarouselScroll(dayData);
  }, 150);
  window._renderedDays.add(dayData.day);
}

function buildWeatherHtml(dateStr, weatherInfo) {
  if (!weatherInfo) return '';
  const { icon, max, min, rain } = weatherInfo;
  const location = weatherInfo.location || '';
  const wcat = weatherInfo.wcat || (weatherInfo.isClimate ? 'snow' : 'cloud');

  if (weatherInfo.isClimate) {
    let climateAdvice = '🧥 冬季均溫，防風防水外套';
    if (min < -5) climateAdvice = '❄️ 極寒，羽絨 + 雪靴 + 毛帽必備';
    else if (min < 0) climateAdvice = '🧣 寒冷，圍巾手套不可少';

    const sunRef = CLIMATE_SUN_TIMES[dateStr];
    const sunHtml = sunRef
      ? `🌅 ${sunRef.sunrise} · 🌇 ${sunRef.sunset} <span style="opacity:0.6">（參考）</span>`
      : '';

    return `
      <div class="weather-card climate">
        <div class="weather-row-1">
          <span class="weather-icon" data-wcat="${wcat}">${icon}</span>
          <span class="weather-loc">${dateStr.substring(5)} ${location}</span>
          <span class="weather-temp">${max}° / ${min}°</span>
          <span class="weather-climate-badge">🌡️ 氣候參考</span>
        </div>
        ${sunHtml ? `<div class="weather-row-2">${sunHtml}</div>` : ''}
        <div class="weather-row-3">${climateAdvice}</div>
      </div>`;
  }

  let advice = '🧥 偏涼，外套防風防水';
  if (min < -5) advice = '❄️ 極寒！羽絨+雪靴+毛帽必備';
  else if (min < 0) advice = '🧣 寒冷，圍巾手套不可少';
  if (rain > 50) advice = advice + '，攜帶雨具⚠️';

  const sunHtml = (weatherInfo.sunrise && weatherInfo.sunset)
    ? `🌅 ${weatherInfo.sunrise} · 🌇 ${weatherInfo.sunset}`
    : '';

  return `
    <div class="weather-card">
      <div class="weather-row-1">
        <span class="weather-icon" data-wcat="${wcat}">${icon}</span>
        <span class="weather-loc">${dateStr.substring(5)} ${location}</span>
        <span class="weather-temp">${max}° / ${min}°</span>
        <span class="weather-rain">💧${rain}%</span>
      </div>
      ${sunHtml ? `<div class="weather-row-2">${sunHtml}</div>` : ''}
      <div class="weather-row-3">${advice}</div>
    </div>`;
}

function buildDayHeaderHtml(dayData, weatherHtml) {
  var html = '<div class="bg-slate-50/95 py-1 mb-0 px-1 border-b border-slate-200/50 flex justify-between items-center">';
  html += '<div class="flex items-center gap-2.5">';
  html += '<div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center text-lg shadow-md shrink-0">' + dayData.emoji + '</div>';
  html += '<div class="flex-1">';
  html += '<span class="text-xs font-bold text-sky-600 tracking-wider">' + escapeHtml(dayData.dateLabel) + '</span>';
  html += '<h2 class="text-sm md:text-lg font-extrabold text-slate-800 leading-tight">' + escapeHtml(dayData.title) + '</h2>';
  if (dayData.subtitle) { html += '<p class="text-xs text-slate-500 mt-0.5">' + escapeHtml(dayData.subtitle) + '</p>'; }
  html += weatherHtml;
  html += '</div></div>';
  html += '<button onclick="openVlogPlanModal(' + dayData.day + ')" class="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full shadow-sm shrink-0 ml-2">';
  html += '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.16 4h3.68a2 2 0 011.664.89l.812 1.22A2 2 0 0018 7h1a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
  html += '</button>';
  html += '</div>';
  return html;
}

function buildEventsHtml(dayData) { var html = ''; for (var i = 0; i < dayData.events.length; i++) { html += buildSingleEventHtml(dayData, dayData.events[i], i); } return html; }

function buildSingleEventHtml(dayData, event, index) {
  var timeParts = event.time.split(' - ');
  var startTime = timeParts[0].trim();
  var endTime = timeParts[1] ? timeParts[1].trim() : '';
  var shoppingItems = loadShoppingItems(event.title);
  var timeStamp = buildTimePill(startTime, endTime);
  var tagHtml = buildTagHtml(event.tag);
  var actionsHtml = buildEventActionsHtml(dayData.day, index, event.title, shoppingItems.length);
  var imageHtml = buildEventImage(event.img, event.title, event.images);
  var navBtnHtml = buildEventNavBtn(event.navUrl, event.title, event.navName);

  var priorityBadge = '';
  if (event.highlight === true) {
    priorityBadge = '<span class="event-priority-badge highlight">⭐ 重點</span>';
  } else if (event.priority === 'optional') {
    priorityBadge = '<span class="event-priority-badge optional">🔄 彈性</span>';
  }

  var tagClass = '';
  if (event.tag && event.tag.class) {
    tagClass = ' ' + event.tag.class.replace('tag-', 'card-');
  }

  var html = '<div class="timeline-item" data-time="' + escapeHtml(startTime) + '" data-end-time="' + escapeHtml(endTime) + '" data-day="' + dayData.day + '">';
  html += '<div class="timeline-marker">';
  html += '<div class="timeline-node"></div>';
  html += timeStamp;
  html += '</div>';
  html += '<div class="timeline-card">';
  html += '<details data-day="' + dayData.day + '" data-index="' + index + '" class="group glass-card rounded-2xl relative overflow-hidden event-card' + tagClass + '"' + (event.open ? ' open' : '') + '>';
  html += '<div class="itinerary-cat-strip"></div>';
  html += '<summary class="event-summary">';
  html += '<div class="event-summary-info">';
  if (tagHtml || priorityBadge) {
    html += '<div class="event-tag-row">' + tagHtml + priorityBadge + '</div>';
  }
  html += '<h3 class="event-title">' + escapeHtml(event.title) + '</h3>';
  if (event.location) {
    html += '<div class="event-location">📍 ' + escapeHtml(event.location) + '</div>';
  }
  html += '</div>';
  html += '<div class="event-summary-actions">';
  html += actionsHtml;
  html += '<div class="event-expand-icon">';
  html += '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>';
  html += '</div>';
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
  html += '<button onclick="saveDiary(' + dayData.day + ')" class="ml-auto text-xs bg-sky-500 hover:bg-sky-600 text-white px-2 py-0.5 rounded font-bold transition">儲存</button>';
  html += '</div>';
  html += '<textarea id="diary-input-' + dayData.day + '" rows="2" placeholder="寫下今天最難忘的事…" class="w-full border border-slate-200 bg-white rounded-xl py-1.5 px-2.5 text-xs resize-none">' + escapeHtml(savedDiary) + '</textarea>';
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
    if (wrapper) {
      wrapper.classList.add('no-collapse');
    }
  });
}

function autoWrapMiniCards(dayData) {
  return;
}

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

  const eventKey = `d${day}-e${eventIndex}`;
  const tips = findShootTips(event.title, eventKey);

  const content = document.getElementById("shoot-tips-content");
  const headerTitle = document.getElementById("shoot-tips-title");

  if (headerTitle) headerTitle.textContent = event.title;

  if (!tips) {
    content.innerHTML = `
      <div class="text-center py-12">
        <div class="text-5xl mb-3">🎬</div>
        <p class="text-sm font-bold text-slate-700 mb-1">這個景點還沒有拍攝建議</p>
        <p class="text-xs text-slate-500 mb-3">可以先參考「通用拍攝技巧」</p>
        <p class="text-[10px] text-slate-400 font-mono bg-slate-50 rounded px-2 py-1 inline-block">ID: ${eventKey}</p>
      </div>`;
    showModal('shoot-tips-modal');
    document.getElementById('shoot-tips-modal').classList.remove('hidden');
    return;
  }

  let html = '';

  const photos = tips["參考照片"] || [];
  if (photos.length > 0) {
    const photosJson = escAttr(JSON.stringify(photos));
    html += `<div class="shoot-photo-hero">`;
    html += `<div class="shoot-photo-track">`;
    photos.forEach((url, i) => {
      html += `<img src="${escAttr(url)}" 
        class="lazy-fade shoot-photo-img" 
        loading="lazy" decoding="async"
        data-index="${i}"
        onclick="openShootLightbox('${photosJson}', ${i})">`;
    });
    html += `</div>`;
    if (photos.length > 1) {
      html += `<div class="shoot-photo-indicator"><span class="cur">1</span> / <span class="total">${photos.length}</span></div>`;
    }
    html += `</div>`;
  }

  const advice = tips["拍照建議"] || "";
  if (advice) {
    html += `<div class="shoot-block shoot-block-main">
      <div class="shoot-block-header">
        <span class="shoot-block-icon">📷</span>
        <span class="shoot-block-title">拍照建議</span>
      </div>
      <p class="shoot-block-text">${escapeHtml(advice)}</p>
    </div>`;
  }

  const angles = tips["拍攝角度"] || [];
  const actions = tips["人物動作建議"] || [];
  if (angles.length > 0 || actions.length > 0) {
    html += `<div class="shoot-grid-2">`;
    if (angles.length > 0) {
      html += `<div class="shoot-block shoot-block-angle">
        <div class="shoot-block-header">
          <span class="shoot-block-icon">🎯</span>
          <span class="shoot-block-title">拍攝角度</span>
        </div>
        <ul class="shoot-list">${angles.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
      </div>`;
    }
    if (actions.length > 0) {
      html += `<div class="shoot-block shoot-block-action">
        <div class="shoot-block-header">
          <span class="shoot-block-icon">🧍</span>
          <span class="shoot-block-title">人物動作</span>
        </div>
        <ul class="shoot-list">${actions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
      </div>`;
    }
    html += `</div>`;
  }

  const pocket = tips["Pocket 3 參數"] || "";
  const vlogShots = tips["Vlog 必拍鏡頭"] || [];
  const bestTime = tips["最佳拍攝時間"] || "";
  const duration = tips["拍攝時長"] || "";
  const hasAdvanced = pocket || vlogShots.length > 0 || bestTime || duration;

  if (hasAdvanced) {
    html += `<details class="shoot-advanced">
      <summary>
        <span class="shoot-advanced-icon">⚙️</span>
        <span class="shoot-advanced-title">進階資訊</span>
        <span class="shoot-advanced-hint">相機設定 · Vlog 鏡頭 · 時間建議</span>
        <span class="shoot-advanced-chevron">▾</span>
      </summary>
      <div class="shoot-advanced-body">`;

    if (pocket) {
      html += `<div class="shoot-advanced-item">
        <div class="shoot-advanced-item-title">📸 Pocket 3 參數</div>
        <p class="shoot-advanced-item-text">${escapeHtml(pocket)}</p>
      </div>`;
    }
    if (vlogShots.length > 0) {
      html += `<div class="shoot-advanced-item">
        <div class="shoot-advanced-item-title">🎬 Vlog 必拍鏡頭</div>
        <ul class="shoot-list">${vlogShots.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      </div>`;
    }
    if (bestTime || duration) {
      html += `<div class="shoot-advanced-item">
        <div class="shoot-advanced-item-title">⏰ 時間建議</div>
        <ul class="shoot-list">`;
      if (bestTime) html += `<li>${escapeHtml(bestTime)}</li>`;
      if (duration)  html += `<li>${escapeHtml(duration)}</li>`;
      html += `</ul></div>`;
    }

    html += `</div></details>`;
  }

  content.innerHTML = html;

  setTimeout(() => {
    setupImageFadeIn(content);
    bindShootPhotoIndicator(content);
  }, 50);

  showModal('shoot-tips-modal');
  document.getElementById('shoot-tips-modal').classList.remove('hidden');
}

function openShootLightbox(photosJson, idx) {
  try {
    const urls = JSON.parse(photosJson.replace(/&quot;/g, '"'));
    openLightbox(urls, idx);
  } catch (e) {
    console.warn('[shoot-lightbox] 解析失敗', e);
  }
}
window.openShootLightbox = openShootLightbox;

function bindShootPhotoIndicator(container) {
  const track = container.querySelector('.shoot-photo-track');
  const cur = container.querySelector('.shoot-photo-indicator .cur');
  if (!track || !cur) return;
  let timer;
  track.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const idx = Math.round(track.scrollLeft / track.clientWidth) + 1;
      cur.textContent = idx;
    }, 80);
  }, { passive: true });
}

function closeShootTipsModal() {
  hideModal('shoot-tips-modal');
  setTimeout(() => document.getElementById('shoot-tips-modal').classList.add('hidden'), 300);
}

// ==================== 通用拍攝技巧 ====================
function openCommonTipsModal() {
  const m = document.getElementById('common-tips-modal');
  if (!m) return;
  m.style.display = 'flex';
  m.classList.add('active');
  document.body.classList.add('modal-open');

  const c = document.getElementById('common-tips-content');
  if (!c || typeof shootTipsCommon === 'undefined') return;

  const tipsList = [
    { key: '顯高全身照',   emoji: '📏', color: 'sky' },
    { key: '慵懶坐姿照',   emoji: '🪑', color: 'amber' },
    { key: '氛圍感半身照', emoji: '✨', color: 'indigo' }
  ];

  let html = `<div class="common-tips-intro">
    <span class="common-tips-intro-icon">💡</span>
    <p class="common-tips-intro-text">三個萬用構圖法，任何場景都能拍出好照片</p>
  </div>`;

  tipsList.forEach(({ key, emoji, color }) => {
    const tips = shootTipsCommon[key];
    if (!tips) return;

    const advice = tips["拍照建議"] || "";
    const angles = tips["拍攝角度"] || [];
    const actions = tips["人物動作建議"] || [];
    const photos = tips["參考照片"] || [];

    html += `<div class="common-tip-card common-tip-${color}">`;

    html += `<div class="common-tip-header">
      <span class="common-tip-emoji">${emoji}</span>
      <span class="common-tip-title">${escapeHtml(key)}</span>
    </div>`;

    if (photos.length > 0) {
      const photosJson = escAttr(JSON.stringify(photos));
      html += `<div class="common-tip-photo-track">`;
      photos.forEach((url, i) => {
        html += `<img src="${escAttr(url)}" 
          class="lazy-fade common-tip-photo" 
          loading="lazy" decoding="async"
          data-index="${i}"
          onclick="openShootLightbox('${photosJson}', ${i})">`;
      });
      html += `</div>`;
    }

    if (advice) {
      html += `<p class="common-tip-advice">${escapeHtml(advice)}</p>`;
    }

    if (angles.length > 0 || actions.length > 0) {
      html += `<div class="common-tip-grid">`;
      if (angles.length > 0) {
        html += `<div class="common-tip-col">
          <div class="common-tip-col-title">🎯 角度</div>
          <ul class="shoot-list">${angles.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
        </div>`;
      }
      if (actions.length > 0) {
        html += `<div class="common-tip-col">
          <div class="common-tip-col-title">🧍 動作</div>
          <ul class="shoot-list">${actions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
        </div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
  });

  c.innerHTML = html;
  setTimeout(() => setupImageFadeIn(c), 50);
}

function closeCommonTipsModal() {
  const m = document.getElementById('common-tips-modal');
  if (m) {
    m.classList.remove('active');
    setTimeout(() => m.style.display = 'none', 300);
    const a = document.querySelector('.modal-overlay.active');
    if (!a) document.body.classList.remove('modal-open');
  }
}

// ==================== Vlog 構思 ====================
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
  try { localStorage.setItem('tohoku_last_day', String(day)); } catch(e) {}
  haptic(6);

  const dayData = winterItineraries.find(d => d.day === day);
  if (dayData && !window._renderedDays.has(day)) { renderDayItinerary(`day-section-${day}`, dayData); }
  document.querySelectorAll("#day-tabs-container button").forEach(btn => { btn.className = "day-tab flex-shrink-0 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition"; });
  const activeTab = document.getElementById("tab-d" + day);
  if (activeTab) activeTab.className = "day-tab active flex-shrink-0 transition";

  // ⭐ v14.2：重套今天標記
  if (window.updateDayTabTodayMark) window.updateDayTabTodayMark();

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

  if (activeTab) {
    const container = document.getElementById("day-tabs-container");
    if (container) {
      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const targetScroll = container.scrollLeft
          + tabRect.left - containerRect.left
          - (containerRect.width - tabRect.width) / 2;
        container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
      });
    }
  }

  setTimeout(updateTimelineStatus, 50);
  if (window.updateDayProgressDots) window.updateDayProgressDots();
}

// ==================== 快速跳轉圓點 ====================
function updateDayProgressDots() {
  const container = document.getElementById('day-progress-dots');
  if (!container) return;
  const activeDay = window._lastActiveDay || 1;
  const todayIdx = (() => {
    const now = Date.now();
    for (let i = 0; i < tripDates.length; i++) {
      const s = new Date(tripDates[i] + "T00:00:00+08:00").getTime();
      const e = new Date(tripDates[i] + "T23:59:59+08:00").getTime();
      if (now >= s && now <= e) return i + 1;
    }
    return -1;
  })();

  container.innerHTML = Array.from({ length: 7 }, (_, i) => {
    const day = i + 1;
    const isActive = day === activeDay;
    const isToday = day === todayIdx;
    const cls = ['day-dot'];
    if (isActive) cls.push('active');
    if (isToday) cls.push('today');
    return `<button class="${cls.join(' ')}" onclick="switchDay(${day})" aria-label="Day ${day}"></button>`;
  }).join('');
}
window.updateDayProgressDots = updateDayProgressDots;

// ==================== ⭐ v14.1：今天 tab 標記 ====================
function updateDayTabTodayMark() {
  // 1. 先重置所有 tab 文字
  const originalTexts = {
    1: 'D1 (1/21)', 2: 'D2 (1/22)', 3: 'D3 (1/23)',
    4: 'D4 (1/24)', 5: 'D5 (1/25)', 6: 'D6 (1/26)', 7: 'D7 (1/27)'
  };
  document.querySelectorAll('#day-tabs-container button').forEach(btn => {
    const dayNum = parseInt(btn.id.replace('tab-d', ''));
    if (originalTexts[dayNum]) {
      btn.textContent = originalTexts[dayNum];
    }
    btn.classList.remove('has-today-mark');
  });

  // 2. 計算今天
  const now = Date.now();
  let todayIdx = -1;
  for (let i = 0; i < tripDates.length; i++) {
    const s = new Date(tripDates[i] + "T00:00:00+08:00").getTime();
    const e = new Date(tripDates[i] + "T23:59:59+08:00").getTime();
    if (now >= s && now <= e) { todayIdx = i + 1; break; }
  }

  let testDay = -1;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'during') {
      const d = parseInt(urlParams.get('day'));
      if (d >= 1 && d <= 7) testDay = d;
    }
  } catch (e) {}

  const effectiveToday = testDay >= 1 ? testDay : todayIdx;

  // 3. 改文字 + 加 class
  if (effectiveToday >= 1) {
    const todayTab = document.getElementById(`tab-d${effectiveToday}`);
    if (todayTab) {
      todayTab.textContent = `D${effectiveToday} · 今天`;
      todayTab.classList.add('has-today-mark');
    }
  }
}
window.updateDayTabTodayMark = updateDayTabTodayMark;
// ==================== ⭐ v14.2：初始化 Day Tabs ====================
function initDayTabs(initialDay) {
  // 1. 重置所有 tab 樣式
  document.querySelectorAll('#day-tabs-container button').forEach(btn => {
    btn.className = "day-tab flex-shrink-0 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition";
  });

  // 2. 設定 active tab
  const activeTab = document.getElementById('tab-d' + initialDay);
  if (activeTab) {
    activeTab.className = "day-tab active flex-shrink-0 transition";
  }

  // 3. 標記今天
  updateDayTabTodayMark();

  // 4. 自動置中 active tab（無動畫，瞬間完成）
  if (activeTab) {
    const container = document.getElementById('day-tabs-container');
    if (container) {
      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const targetScroll = container.scrollLeft
          + tabRect.left - containerRect.left
          - (containerRect.width - tabRect.width) / 2;
        container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'auto' });
      });
    }
  }
}
window.initDayTabs = initDayTabs;

// ==================== 攻略 Modal 開關 ====================
function toggleDriveModal() { const modal = document.getElementById('drive-modal'); if (modal.classList.contains('hidden')) { showModal('drive-modal'); modal.classList.remove('hidden'); setDriveTab('basic'); } else { hideModal('drive-modal'); setTimeout(() => modal.classList.add('hidden'), 300); } }
function closeDriveModal() { hideModal('drive-modal'); setTimeout(() => document.getElementById('drive-modal').classList.add('hidden'), 300); }
function toggleTicketModal() { const modal = document.getElementById('ticket-modal'); if (modal.classList.contains('hidden')) { showModal('ticket-modal'); modal.classList.remove('hidden'); renderTicketContent(); if (window._ticketTimer) clearInterval(window._ticketTimer); window._ticketTimer = setInterval(() => { if (!modal.classList.contains('hidden')) renderTicketContent(); else clearInterval(window._ticketTimer); }, 1000); } else { hideModal('ticket-modal'); setTimeout(() => document.getElementById('ticket-modal').classList.add('hidden'), 300); if (window._ticketTimer) clearInterval(window._ticketTimer); } }
function closeTicketModal() { hideModal('ticket-modal'); setTimeout(() => document.getElementById('ticket-modal').classList.add('hidden'), 300); if (window._ticketTimer) clearInterval(window._ticketTimer); }
function openTripOverview() { const m = document.getElementById('trip-overview-modal'); if (m) { m.style.display = 'flex'; m.classList.add('active'); document.body.classList.add('modal-open'); renderTripOverview(); } }
function closeTripOverview() { const m = document.getElementById('trip-overview-modal'); if (m) { m.classList.remove('active'); setTimeout(() => { m.style.display = 'none'; }, 300); const a = document.querySelector('.modal-overlay.active'); if (!a) document.body.classList.remove('modal-open'); } }
function openWeatherModal() { const modal = document.getElementById('weather-modal'); showModal('weather-modal'); modal.classList.remove('hidden'); document.getElementById('weather-detail-content').innerHTML = ''; fetchWeatherData(); }
function closeWeatherModal() { hideModal('weather-modal'); setTimeout(() => document.getElementById('weather-modal').classList.add('hidden'), 300); }

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
window.findShootTips = findShootTips;