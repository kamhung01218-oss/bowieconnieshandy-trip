/* ============================================================
 * emergency.js — 緊急資訊資料 + Modal 渲染
 * ============================================================ */

const EMERGENCY_DATA = {
  hotlines: [
    { icon: "🚨", label: "日本報警", tel: "110", desc: "警察（交通事故、盜竊、糾紛）" },
    { icon: "🚑", label: "日本救護車 / 火警", tel: "119", desc: "消防、救護（火災、急病、受傷）" },
    { icon: "🛣️", label: "日本道路救援 JAF", tel: "#9910", desc: "24 小時，車輛故障、拖吊" },
    { icon: "🇭🇰", label: "香港入境處協助熱線", tel: "+8521868", desc: "24 小時海外港人求助" },
    { icon: "🇨🇳", label: "中國駐日大使館", tel: "+81334033064", desc: "東京，領事保護" },
    { icon: "🇨🇳", label: "中國駐新潟總領事館", tel: "+81252287800", desc: "東北地區領事保護" }
  ],
  hotels: [
    { day: "D1", date: "1/21", name: "秋保溫泉 瑞鳳大飯店", tel: "022-398-2311", note: "入住 15:00 / 退房 10:00" },
    { day: "D2-3", date: "1/22-23", name: "微笑之宿 瀧之湯", tel: "023-654-2211", note: "貸切風呂 16:30 預約" },
    { day: "D4-6", date: "1/24-26", name: "Hotel Grand Bach 仙台", tel: "022-296-7333", note: "東口平面停車場 24HR" }
  ],
  transport: [
    { icon: "🚗", label: "Nippon Rent-A-Car 仙台機場", tel: "022-383-1577", desc: "租車營業所" },
    { icon: "🏥", label: "仙台市立病院", tel: "022-254-2211", desc: "急救對應" },
    { icon: "🏥", label: "東北大学病院", tel: "022-717-7000", desc: "高度急救中心" }
  ],
  guides: [
    { icon: "🪪", label: "護照遺失", steps: [
      "先到就近警察局報案，索取「遺失證明書」",
      "聯絡香港入境處協助熱線 +852 1868",
      "前往台北駐日代表處或中國領事館申請臨時證件",
      "需準備：警察報案證明 + 身分證明 + 2 張照片"
    ]},
    { icon: "💳", label: "信用卡遺失", steps: [
      "立刻致電發卡銀行掛失，或用 App 凍結卡片",
      "若被盜刷，向當地警察局報案並索取證明",
      "回港後向銀行提出爭議款申請"
    ]},
    { icon: "🚗", label: "車輛事故", steps: [
      "確認人員安全，如有受傷立刻撥打 119",
      "撥打 110 報警，等警察到場製作筆錄",
      "通知租車公司（Nippon Rent-A-Car）",
      "拍照存證：車輛位置、車損、對方車輛、現場環境"
    ]},
    { icon: "🏥", label: "急病就醫", steps: [
      "撥打 119 請求救護車",
      "攜帶護照、保險卡、常備藥物清單",
      "保留所有收據與診斷證明，回港申請保險理賠"
    ]},
    { icon: "❄️", label: "車輛陷雪", steps: [
      "保持冷靜，不要猛踩油門（會越陷越深）",
      "下車清除輪胎周圍積雪",
      "在輪胎下方放置腳踏墊、樹枝、砂石增加摩擦力",
      "若無法脫困，撥打 #9910 請求道路救援"
    ]}
  ]
};

// ==================== 渲染 ====================
function renderEmergencyContent() {
  const container = document.getElementById('emergency-content');
  if (!container) return;

  const data = EMERGENCY_DATA;
  let html = '';

  // ---------- 1. 緊急熱線 ----------
  html += '<div class="emergency-section">';
  html += '<div class="emergency-section-title">🚨 緊急熱線</div>';
  data.hotlines.forEach(item => {
    const tel = String(item.tel).replace(/[^\d+#]/g, '');
    html += `
      <a href="tel:${tel}" class="emergency-call-btn">
        <span class="emergency-call-icon">${item.icon}</span>
        <span class="emergency-call-info">
          <span class="emergency-call-label">${escapeHtml(item.label)}</span>
          <span class="emergency-call-desc">${escapeHtml(item.desc)}</span>
        </span>
        <span class="emergency-call-tel">${escapeHtml(item.tel)}</span>
      </a>`;
  });
  html += '</div>';

  // ---------- 2. 住宿飯店 ----------
  html += '<div class="emergency-section">';
  html += '<div class="emergency-section-title">🏨 住宿聯絡</div>';
  data.hotels.forEach(h => {
    const tel = String(h.tel).replace(/[^\d+#-]/g, '');
    html += `
      <a href="tel:${tel}" class="emergency-hotel-row">
        <div class="emergency-hotel-day">${escapeHtml(h.day)}<br><span>${escapeHtml(h.date)}</span></div>
        <div class="emergency-hotel-info">
          <div class="emergency-hotel-name">${escapeHtml(h.name)}</div>
          <div class="emergency-hotel-note">${escapeHtml(h.note)}</div>
        </div>
        <div class="emergency-hotel-tel">${escapeHtml(h.tel)}</div>
      </a>`;
  });
  html += '</div>';

  // ---------- 3. 交通 / 醫療 ----------
  html += '<div class="emergency-section">';
  html += '<div class="emergency-section-title">🏥 交通與醫療</div>';
  data.transport.forEach(item => {
    const tel = String(item.tel).replace(/[^\d+#-]/g, '');
    html += `
      <a href="tel:${tel}" class="emergency-call-btn small">
        <span class="emergency-call-icon">${item.icon}</span>
        <span class="emergency-call-info">
          <span class="emergency-call-label">${escapeHtml(item.label)}</span>
          <span class="emergency-call-desc">${escapeHtml(item.desc)}</span>
        </span>
        <span class="emergency-call-tel">${escapeHtml(item.tel)}</span>
      </a>`;
  });
  html += '</div>';

  // ---------- 4. 應變指南 ----------
  html += '<div class="emergency-section">';
  html += '<div class="emergency-section-title">📋 應變指南</div>';
  data.guides.forEach((g, idx) => {
    html += `
      <details class="emergency-guide" ${idx === 0 ? 'open' : ''}>
        <summary>
          <span>${g.icon}</span>
          <span>${escapeHtml(g.label)}</span>
        </summary>
        <ol class="emergency-steps">
          ${g.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ol>
      </details>`;
  });
  html += '</div>';

  // ---------- 底部提示 ----------
  html += `
    <div class="emergency-tip">
      💡 點擊電話號碼可直接撥號<br>
      建議出發前先把這頁存成截圖或加到書籤
    </div>`;

  container.innerHTML = html;
}

// ==================== 開啟 / 關閉 ====================
function openEmergencyModal() {
  const modal = document.getElementById('emergency-modal');
  if (!modal) {
    console.warn('[Emergency] 找不到 #emergency-modal');
    return;
  }
  // 先渲染內容
  renderEmergencyContent();
  // 顯示
  if (typeof showModal === 'function') {
    showModal('emergency-modal');
  } else {
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
  modal.classList.remove('hidden');
  if (typeof haptic === 'function') haptic(8);
}

function closeEmergencyModal() {
  const modal = document.getElementById('emergency-modal');
  if (!modal) return;
  if (typeof hideModal === 'function') {
    hideModal('emergency-modal');
  } else {
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
    const anyOpen = document.querySelector('.modal-overlay.active');
    if (!anyOpen) document.body.classList.remove('modal-open');
  }
  setTimeout(() => modal.classList.add('hidden'), 300);
  if (typeof haptic === 'function') haptic(6);
}

// ==================== 匯出到 window ====================
window.openEmergencyModal = openEmergencyModal;
window.closeEmergencyModal = closeEmergencyModal;

console.log('[Emergency] 載入完成，可呼叫 window.openEmergencyModal()');