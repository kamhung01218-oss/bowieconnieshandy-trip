/**
 * ============================================================
 *  2027 東北冬季親子溫泉自駕之旅 - 行程數據
 *  版本: 3.0.0 (完整優化版)
 *  最後更新: 2026-09-05
 * ============================================================
 */

const winterItineraries = [

  // ==========================================
  // DAY 1 - 抵達仙台
  // ==========================================
  {
    day: 1,
    dateLabel: "DAY 1 · 2027年1月21日 (週四)",
    title: "落地仙台 ➔ 機場美食充電 ➔ 瑞鳳溫泉放電",
    emoji: "♨️",
    events: [
      {
        time: "14:05 - 14:50",
        title: "落地仙台機場 (SDJ) & 入境手續",
        img: "https://hk.wamazing.com/media/wp-content/uploads/sites/5/2024/08/sdjdutyfreeshop_pixta_98589488_M.jpg.webp",
        tag: { text: "🛬 抵達雪國", class: "tag tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Airport",
        navName: "仙台機場",
        open: true,
        content: `<p>班機降落仙台機場，先帶小朋友去洗手間，成人分工辦理入境手續與提取行李。</p>`
      },
      {
        time: "14:50 - 15:30",
        title: "仙台機場美食充電 ➔ 出發前補充體力",
        img: "https://rimage.gnst.jp/livejapan.com/public/img/spot/lj/01/45/lj0145539/lj0145539_6a39f0b20dd93_main.jpg",
        tag: { text: "🍽️ 機場美食", class: "tag tag-amber" },
        navUrl: "",
        open: true,
        content: `
          <p class="mb-2">機場美食推薦（點擊展開）：</p>
          <details class="bg-white border border-slate-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-indigo-800">【1樓】牛舌飯糰、牛舌熱狗包（陣中）</summary>
            <div class="p-3.5 border-t text-xs"><p>外帶方便，適合快速充電。</p></div>
          </details>
          <details class="bg-white border border-slate-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-700">【2樓】PRONTO 三明治、ずんだ茶寮毛豆奶昔</summary>
            <div class="p-3.5 border-t text-xs"><p>有座位可充電，適合短暫休息。毛豆奶昔是仙台特色。</p></div>
          </details>
          <details class="bg-white border border-slate-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-emerald-700">【3樓】FLATWHITE 咖啡、M.M.C 有機輕食</summary>
            <div class="p-3.5 border-t text-xs"><p>環境舒適，適合坐下來慢慢吃。</p></div>
          </details>
        `
      },
      {
        time: "15:30 - 16:00",
        title: "提領 Nippon Rent-A-Car 7-8 人座雪地車",
        img: "https://rimage.gnst.jp/livejapan.com/public/img/spot/lj/01/45/lj0145539/lj0145539_6a39f0b20dd93_main.jpg",
        tag: { text: "🚗 冬季自駕", class: "tag tag-teal" },
        navUrl: "",
        open: true,
        content: `
          <p>至機場 1F 櫃檯接洽，搭乘接駁車前往取車。</p>
          <div class="bg-teal-50 border border-teal-200 p-2.5 rounded-xl mt-2">
            <strong>🔍 取車檢查：</strong>
            <ul class="list-disc pl-4 mt-1">
              <li>兒童安全帶安裝於第二排，確認貼合無扭曲</li>
              <li>確認 4WD + 雪地胎，堆疊 4 個大行李箱</li>
            </ul>
          </div>
        `
      },
      {
        time: "16:00 - 16:45",
        title: "平地直達秋保溫泉（全程避開高海拔山路）",
        tag: { text: "🛣️ 零風險路線", class: "tag tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Zuiho+Akiu",
        navName: "秋保溫泉瑞鳳",
        open: true,
        content: `
          <p><strong>路線：</strong>仙台機場 ➔ 仙台南部道路 ➔ 山田 IC ➔ 國道 286 號 ➔ 秋保溫泉。</p>
          <p><strong>車程：</strong>約 35–45 分鐘（30 公里）。</p>
          <p class="mt-1">⚠️ 橋樑與陰影路面易結冰，放慢車速保持距離。</p>
        `
      },
      {
        time: "16:45 - 17:00",
        title: "抵達秋保溫泉「瑞鳳大飯店」Check-in",
        img: "https://rimage.gnst.jp/livejapan.com/public/article/detail/a/30/00/a3000138/img/zh-tw/a3000138_parts_5f717fd1acf77.jpg?20210210161203&q=80&rw=686&rh=490",
        tag: { text: "🏨 溫泉名宿", class: "tag tag-indigo" },
        navUrl: "",
        open: true,
        content: `
          <p>卸下行李，辦理 Check-in，確認「Seasons」自助晚餐時段。</p>
          <details class="bg-amber-50 border border-amber-200 rounded-xl mt-2">
            <summary class="px-3 py-2 cursor-pointer text-xs font-bold text-amber-900">🏨 入住提示</summary>
            <div class="p-3 border-t text-xs">
              <ul class="list-disc pl-4">
                <li>退房：正常 10:00，可提前至 06:00 辦理</li>
                <li>客房：日式榻榻米，僅礦泉水免費</li>
              </ul>
            </div>
          </details>
        `
      },
      {
        time: "17:00 - 18:15",
        title: "B1 溫水泳池徹底放電 ➔ 露天雪景風呂暖身",
        img: "https://rimage.gnst.jp/livejapan.com/public/article/detail/a/30/00/a3000138/img/zh-tw/a3000138_parts_5f717fbc08a88.jpg?20210210161203&q=80&rw=686&rh=490",
        tag: { text: "🏊 寶寶放電", class: "tag tag-sky" },
        navUrl: "",
        open: true,
        content: `
          <p><strong>17:00–17:45 溫水泳池：</strong>B1 室內溫水泳池，有兒童淺水區與滑水道。</p>
          <p><strong>17:45–18:15 露天風呂：</strong>雪景露天溫泉，全家一起暖身。</p>
          <details class="bg-indigo-50 border border-indigo-200 rounded-xl mt-2">
            <summary class="px-3 py-2 cursor-pointer text-xs font-bold text-indigo-900">♨️ 泡湯禮儀</summary>
            <div class="p-3 border-t text-xs">
              <ul class="list-disc pl-4">
                <li>浴場每日日夜互換男女湯，進場前看清指示牌</li>
                <li>須自備大浴巾（房間內有）</li>
                <li>全程裸湯，入池前徹底沖洗身體</li>
                <li>小毛巾不可下水、長髮盤起、嚴禁拍照</li>
              </ul>
            </div>
          </details>
        `
      },
      {
        time: "18:30 - 20:30",
        title: "饗宴「Seasons」豪華自助晚餐（蟹腳 & 和牛）",
        img: "https://img.kenalice.tw/2025/04/20250420231941_0_5dbb05.jpg",
        tag: { text: "🦀 痛快美食", class: "tag tag-amber" },
        navUrl: "",
        open: true,
        content: `
          <p>松葉蟹/長腳蟹吃到飽、鐵板黑毛和牛、仙台牛舌、現握壽司。兒童區有炸雞、薯條、義大利麵、巧克力噴泉。</p>
          <p class="mt-2">💡 晚餐分 17:00-19:00 與 19:00-21:00 兩場，入住時確認預約時段。</p>
        `
      },
      {
        time: "20:30 -",
        title: "客房榻榻米休息，養精蓄銳準備 Day 2",
        tag: { text: "🌙 舒服入住", class: "tag tag-indigo" },
        navUrl: "",
        open: true,
        content: `<p>漫步回日式榻榻米客房，鋪好被褥後享受雪國第一夜的舒適好眠。</p>`
      }
    ]
  },

  // ==========================================
  // DAY 2 - 山形天童
  // ==========================================
  {
    day: 2,
    dateLabel: "DAY 2 · 2027年1月22日 (週五)",
    title: "AEON買裝備 ➔ 幼兒充電 ➔ 銀山溫泉夢幻夜景",
    emoji: "🏮",
    events: [
      {
        time: "09:30 - 10:30",
        title: "退房出發，跨縣前往山形天童",
        tag: { text: "🚗 雪地幹線", class: "tag tag-teal" },
        navUrl: "",
        open: true,
        content: `
          <p><strong>09:30 啟程：</strong>早餐後退房，行李上車出發。</p>
          <p><strong>路線：</strong>國道 48 號（關山街道）前往山形天童。</p>
          <p><strong>車程：</strong>約 50–60 分鐘（45 公里）。</p>
          <p class="mt-1">⚠️ 關山隧道兩端易結冰，保持車距避免急煞。</p>
        `
      },
      {
        time: "10:30 - 14:30",
        title: "AEON MALL 天童：裝備補給與美食全攻略",
        img: "https://japanshopping.org/files/shopimg/84ab29edbe4c8f9e96cfb4024eb95bc2.jpg",
        tag: { text: "🛍️ 裝備補給", class: "tag tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Aeon+Mall+Tendo",
        navName: "AEON天童",
        open: true,
        content: `
          <p class="mb-2">東北最大級 AEON MALL，動線極佳。重點推薦：</p>
          <details class="bg-indigo-50 border border-indigo-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-indigo-900">🛍️ 必逛品牌</summary>
            <div class="p-3.5 border-t text-xs">
              <p><strong>Montbell (2F)：</strong>戶外機能服飾、超輕量背包</p>
              <p><strong>ABC-MART (2F)：</strong>運動鞋、限定鞋款</p>
              <p><strong>UNIQLO & GU：</strong>童裝齊全</p>
              <p><strong>AEON STYLE：</strong>1F 超市買山形水果、在地清酒</p>
            </div>
          </details>
          <details class="bg-amber-50 border border-amber-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-900">🍱 美食推薦</summary>
            <div class="p-3.5 border-t text-xs">
              <p><strong>1F：</strong>大戶屋（定食）、いきなりステーキ（現切牛排）、築地銀章魚燒</p>
              <p><strong>2F：</strong>築地食堂 源ちゃん（海鮮丼）、丸龜製麵、幸樂苑拉麵</p>
            </div>
          </details>
        `
      },
      {
        time: "14:30 - 15:00",
        title: "YUKIHIRA COFFEE 休憩",
        img: "https://cdn-ak.f.st-hatena.com/images/fotolife/d/deep-karuma-waap-ec-real-s1/20260720/20260720185804.jpg",
        tag: { text: "☕ 咖啡小憩", class: "tag tag-amber" },
        navUrl: "https://maps.app.goo.gl/PLAjJVoyuemACVNC8?g_st=ac",
        navName: "YUKIHIRA COFFEE",
        open: true,
        content: `<p>逛完 AEON 後，可順路到 <strong>YUKIHIRA COFFEE</strong> 喝杯手沖咖啡放鬆。</p>`
      },
      {
        time: "15:00 - 15:30",
        title: "微笑の宿 瀧之湯 Check-in",
        img: "https://sendai-kouiki-mice.com/wp-content/uploads/2024/12/pic-hohoeminoyado-02.jpg",
        tag: { text: "🏨 溫泉名宿", class: "tag tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        open: true,
        content: `<p>抵達 Check-in，確認 15:30 銀山溫泉夜景專車乘車位置。</p>`
      },
      {
        time: "15:30 - 19:15",
        title: "【極重要】銀山溫泉交通（二選一）➔ 夢幻夜景",
        img: "https://mimigo.tw/wp-content/uploads/20230105083619_51.jpg",
        tag: { text: "🏮 大正浪漫", class: "tag tag-sky" },
        navUrl: "",
        open: true,
        content: `
          <details class="bg-amber-50 border border-amber-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-900">🚌 銀山溫泉交通（二選一）</summary>
            <div class="p-3.5 border-t text-xs">
              <div class="bg-white border border-amber-300 rounded-lg p-2 mb-2">
                <strong class="text-amber-800 block">方案A：接駁巴士 Fast Pass（首選）</strong>
                <p class="text-xs">大正浪漫館轉乘，持 Fast Pass 免排隊。¥1,500/人，需提前 1-2 月上網搶票。</p>
              </div>
              <div class="bg-white border border-sky-300 rounded-lg p-2">
                <strong class="text-sky-800 block">方案B：Twilight 夜景專車（備案）</strong>
                <p class="text-xs">價格較高，僅作後備。</p>
              </div>
            </div>
          </details>
          <p class="mt-1">⚠️ 氣溫 -2℃ 至 -5℃，木棧道易結冰，穿防滑雪靴並緊牽小朋友！</p>
        `
      },
      {
        time: "19:30 - 21:00",
        title: "天童溫泉周邊深夜美食 (晚餐自由選)",
        tag: { text: "🥩 彈性晚餐", class: "tag tag-amber" },
        navUrl: "",
        open: true,
        content: `
          <p class="mb-2">返回時間較晚，推薦天童周邊營業較晚的美食：</p>
          <details class="bg-white border border-slate-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-slate-800">🍜 手打 水車生そば（首選）</summary>
            <div class="p-3.5 border-t text-xs">
              <img src="https://svcstrg.cld.navitime.jp/travelguide/p06020024/p06020024_02.webp" class="w-full h-32 object-cover rounded-lg mb-2" alt="手打 水車生そば">
              <p>必吃「鳥中華」（鰹魚高湯＋雞肉＋天婦羅碎）</p>
              <a href="https://maps.app.goo.gl/XvHHsWwn3RNpx67m6?g_st=ac" target="_blank" class="mt-2 w-full flex items-center justify-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold py-2 rounded-lg">📍 導航前往</a>
            </div>
          </details>
          <details class="bg-white border border-slate-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-slate-800">🥩 大衆焼肉けむすけ（開較夜）</summary>
            <div class="p-3.5 border-t text-xs">
              <img src="https://www.yakiniku-ousama.com/_p/acre/9340/images/pc/smart_phone_993fe882.jpg" class="w-full h-32 object-cover rounded-lg mb-2" alt="大衆焼肉けむすけ 天童店">
              <p>必點：名物アカ（哈拉米）、名物シロ（豬大腸）、炙り牛寿司</p>
              <a href="https://maps.app.goo.gl/P3JM6zwqwNaGTmgTA?g_st=ac" target="_blank" class="mt-2 w-full flex items-center justify-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold py-2 rounded-lg">📍 導航前往</a>
            </div>
          </details>
        `
      }
    ]
  },

  // ==========================================
  // DAY 3 - 藏王樹冰
  // ==========================================
  {
    day: 3,
    dateLabel: "DAY 3 · 2027年1月23日 (週六)",
    title: "自駕直達藏王樹冰 ➔ 壽司午餐 ➔ 瀧之湯包廂與懷石",
    emoji: "☃️",
    events: [
      {
        time: "07:40 - 09:20",
        title: "提早出發，全自駕直達藏王纜車站",
        img: "https://cclalice.com/wp-content/uploads/2024/12/DSC09203-1170x780.jpg",
        tag: { text: "🚗 週末早鳥", class: "tag tag-teal" },
        navUrl: "",
        open: true,
        content: `
          <p><strong>07:40 出發：</strong>早餐後穿戴保暖衣物出發。</p>
          <p><strong>路線：</strong>天童 ➔ 山形西繞道 ➔ 藏王溫泉（約 45–50 分鐘）。</p>
          <p class="mt-1">⚠️ 最後 15-20 分鐘為爬坡彎道，小心駕駛。</p>
        `
      },
      {
        time: "09:20 - 12:30",
        title: "搭乘雙段纜車登頂 ➔ 觀賞震撼「藏王樹冰」",
        tag: { text: "❄️ 樹冰奇景", class: "tag tag-sky" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Zao+Ropeway",
        navName: "藏王索道",
        open: true,
        content: `
          <p><strong>09:20 購票搭車：</strong>至藏王索道兌換纜車票。</p>
          <details class="bg-rose-50 border border-rose-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-900">🎟️ 優先票搶票作戰</summary>
            <div class="p-3.5 border-t text-xs">
              <p><strong>1. 提早註冊 Asoview!</strong> 綁定信用卡</p>
              <p><strong>2. 1/15 23:00 HKT</strong> 開賣，鎖定 08:30 或 09:00 時段</p>
              <p><strong>3. 週六票 5 分鐘內秒殺</strong>（成人 ¥5,500 / 兒童 ¥3,500）</p>
            </div>
          </details>
          <details class="bg-amber-50 border border-amber-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-900">⚠️ 安全守則（必讀）</summary>
            <div class="p-3.5 border-t text-xs">
              <p><strong>🥶 防凍傷：</strong>山頂體感 -20℃，4 歲小孩需蓋耳毛帽、圍脖、護目鏡</p>
              <p><strong>⛸️ 冰面：</strong>前往地藏菩薩的路面結冰，建議套冰爪</p>
            </div>
          </details>
        `
      },
      {
        time: "12:30 - 14:00",
        title: "山形市區午餐 ➔ うまい鮨勘 山形南支店",
        img: "https://site-images.hp.admin.can-ly.com/images/cms/edited/directories/18/stores/214980/20260123165120%E5%B1%B1%E5%BD%A2%E5%8D%97%E6%94%AF%E5%BA%97.JPG",
        tag: { text: "🍣 人氣壽司", class: "tag tag-amber" },
        navUrl: "https://maps.app.goo.gl/eSMkZD1m3vimNytv7",
        navName: "うまい鮨勘 山形南支店",
        open: true,
        content: `
          <p class="text-xs">📍 山形市若宮2丁目10-2（附停車場）</p>
          <p>食材新鮮、兒童友善，適合全家。</p>
          <a href="https://maps.app.goo.gl/eSMkZD1m3vimNytv7" target="_blank" class="mt-2 w-full flex items-center justify-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold py-2 rounded-lg">📍 導航前往</a>
        `
      },
      {
        time: "14:00 - 15:00",
        title: "預約 14:00 寒河江草莓園 ➔ 冬季溫室草莓吃到飽 (彈性備案)",
        img: "http://www2.ic-net.or.jp/~icrose/img/aboutus/top_aboutus_right.jpg",
        tag: { text: "🍓 溫室採果", class: "tag tag-sky" },
        navUrl: "https://maps.app.goo.gl/ZNG1U3GgY6Hfdptz8",
        navName: "寒河江草莓園",
        open: true,
        content: `
          <p>從山形市區前往 <strong>寒河江草莓園</strong>。</p>
          <p><strong>費用：</strong>30 分鐘吃到飽，大人約 ¥1,800 ~ ¥2,300</p>
          <p><strong>彈性備案：</strong>若藏王玩太久，可取消此行程，改到仙台市區周邊採草莓。</p>
        `
      },
      {
        time: "16:30 - 20:00",
        title: "獨享「貸切風呂」與 1月23日 限定懷石晚餐",
        img: "https://www.nipponsensor.net/wp-content/uploads/2025/08/%E5%BE%AE%E7%AC%91%E4%B9%8B%E5%AE%BF%E7%80%A7%E4%B9%8B%E6%B9%AF-04.jpg",
        tag: { text: "♨️ 私人包廂", class: "tag tag-indigo" },
        navUrl: "",
        open: true,
        content: `
          <p><strong>16:30–17:30 貸切風呂：</strong>私人包廂湯，全家輕鬆泡湯免擔心小孩吵鬧。</p>
          <p><strong>18:00–20:00 懷石晚餐：</strong>特別預訂的第二晚日式懷石料理，品嘗山形在地食材。</p>
        `
      }
    ]
  },

  // ==========================================
  // DAY 4 - Spring Valley
  // ==========================================
  {
    day: 4,
    dateLabel: "DAY 4 · 2027年1月24日 (週日)",
    title: "Spring Valley 泉高原玩雪 ➔ 入住 Hotel Grand Bach",
    emoji: "⛷️",
    events: [
      {
        time: "09:30 - 10:45",
        title: "退房出發，跨縣前往【Spring Valley 仙台泉】",
        img: "https://lovetogo.tw/201802-tohoku/spring-valley/photo/20180204-1124-0289.jpg",
        tag: { text: "🚗 雪地自駕", class: "tag tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Spring+Valley+Izumi+Kogen",
        navName: "Spring Valley 仙台泉",
        open: true,
        content: `<p><strong>09:30 啟程：</strong>早餐後退房，行李裝車出發。</p><p>前往【Spring Valley 仙台泉】（約 1 小時 15 分鐘）。</p>`
      },
      {
        time: "10:45 - 14:30",
        title: "【雪之冒險王國】玩雪放電與滑雪場午餐",
        img: "https://lovetogo.tw/201802-tohoku/spring-valley/photo/20180204-1310-0344.jpg",
        tag: { text: "☃️ 玩雪放電", class: "tag tag-sky" },
        navUrl: "",
        open: true,
        content: `
          <p>專攻 4 歲小孩玩雪！</p>
          <details class="bg-blue-50 border border-blue-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-blue-900">🎟️ 票價與營業</summary>
            <div class="p-3.5 border-t text-xs">
              <p><strong>假日：</strong>需買門票，4 歲及家長各 2,000 日圓（網購 1,500）</p>
              <p><strong>平日：</strong>玩雪區不開放，免門票，租雪盆 300 日圓</p>
            </div>
          </details>
          <details class="bg-sky-50 border border-sky-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-sky-900">🎯 3 大必玩</summary>
            <div class="p-3.5 border-t text-xs">
              <p>旋轉雪盆（最安全）、魔毯滑雪盆（省體力）、雪地夾鴨子</p>
            </div>
          </details>
          <p class="mt-2"><strong>13:00–14:30 午餐：</strong>滑雪場室內餐廳享用拉麵、咖哩飯。</p>
        `
      },
      {
        time: "14:30 - 15:30",
        title: "驅車下山 ➔ 入住【Hotel Grand Bach 仙台】",
        img: "https://cdn.jalan.jp/jalan/images/pict2L/Y5/Y318775/Y318775163.jpg",
        tag: { text: "🏨 舒適連住", class: "tag tag-indigo" },
        navUrl: "https://maps.app.goo.gl/tumoctSbhRFgQkx89?g_st=ac",
        navName: "Hotel Grand Bach 仙台",
        open: true,
        content: `<p>抵達仙台市區飯店（連住 3 晚，2 間雙床房）。車停東口 24HR 平面計費停車場。</p>`
      },
      {
        time: "17:30 - 20:00",
        title: "晚餐 ➔ 伊達の牛たん本舗 本店",
        img: "https://odekake.life/wp-content/uploads/2022/03/dategyu_001-1536x1024.jpg",
        tag: { text: "🥩 必吃名店", class: "tag tag-amber" },
        navUrl: "https://maps.app.goo.gl/3pwjdGMZZeGCRq1MA",
        navName: "伊達牛舌本舗 本店",
        open: true,
        content: `
          <p><strong>👑 大人必點：</strong>註冊商標「芯舌」厚切軟嫩多汁，定食麥飯免費續碗</p>
          <p><strong>👦 兒童友善：</strong>燉牛舌、牛舌咖哩、牛舌漢堡排</p>
        `
      }
    ]
  },

  // ==========================================
  // DAY 5 - 狐狸村
  // ==========================================
  {
    day: 5,
    dateLabel: "DAY 5 · 2027年1月25日 (週一)",
    title: "客美多早餐 ➔ 狐狸村 ➔ 仙台市區血拼",
    emoji: "🦊",
    events: [
      {
        time: "08:30 - 09:30",
        title: "早餐 ➔ 客美多咖啡 仙台富澤店",
        img: "https://www.fukushige1219.co.jp/wp-content/uploads/example2-3.jpg",
        tag: { text: "☕ 悠閒晨活", class: "tag tag-amber" },
        navUrl: "https://maps.app.goo.gl/SYGcfygAcH7gamz2A",
        navName: "客美多咖啡",
        open: true,
        content: `<p>開車約 15 分鐘抵達 <strong>客美多咖啡 仙台富澤店</strong> 享用早餐。餐後可直接上東北自動車道前往狐狸村。</p>`
      },
      {
        time: "09:30 - 12:00",
        title: "出發與【宮城藏王狐狸村】雪地互動",
        tag: { text: "🦊 萌寵互動", class: "tag tag-sky" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Miyagi+Zao+Fox+Village",
        navName: "狐狸村",
        open: true,
        content: `
          <p>4 歲小朋友須由家長<strong>全程緊牽手</strong>，禁止觸摸放養區狐狸。</p>
          <details class="bg-rose-50 border border-rose-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-900">🚨 安全守則</summary>
            <div class="p-3.5 border-t text-xs">
              <p>嚴禁奔跑、蹲下或伸手摸狐狸</p>
              <p>禁穿飄逸長裙、吊繩、黑色塑膠袋</p>
              <p>只能在指定高台區拋餵專用飼料</p>
            </div>
          </details>
        `
      },
      {
        time: "12:15 - 13:45",
        title: "白石午餐 ➔ 傳統名物「白石溫麵」三選一",
        tag: { text: "🍜 在地名物", class: "tag tag-amber" },
        navUrl: "",
        open: true,
        content: `
          <p class="mb-2">離開狐狸村 15 分鐘回到白石市區，以下三選一：</p>
          <details class="bg-white border border-slate-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-700">🌟 手延白石溫麵 光庵（推薦）</summary>
            <div class="p-3.5 border-t text-xs">
              <img src="https://oniwa.garden/wp-content/img/04_miyagi/2604_shiroishi_tsurigane/02.jpeg" class="w-full h-32 object-cover rounded-lg mb-2">
              <p>招牌冷麵三種醬汁（鰹魚、胡麻、核桃）</p>
              <a href="https://maps.app.goo.gl/wwgroAhTgSeapcXXA?g_st=ac" target="_blank" class="mt-2 w-full flex items-center justify-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold py-2 rounded-lg">📍 導航</a>
            </div>
          </details>
          <details class="bg-white border border-slate-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-700">🥢 白石うーめん やまぶき亭</summary>
            <div class="p-3.5 border-t text-xs">
              <img src="https://shiroishi-navi.jp/wp-content/uploads/2018/03/shzZkbG4791p6nR3sNXf8tnzqz1kl0.jpg" class="w-full h-32 object-cover rounded-lg mb-2">
              <p>溫麵三昧（芝麻、核桃、醬油三種沾醬）</p>
              <a href="https://maps.app.goo.gl/VudKdyUMEgfc5CKJ8?g_st=ac" target="_blank" class="mt-2 w-full flex items-center justify-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold py-2 rounded-lg">📍 導航</a>
            </div>
          </details>
        `
      },
      {
        time: "14:45 - 18:00",
        title: "仙台市區購物 (PARCO、3COINS、Daiso、唐吉訶德)",
        tag: { text: "🛍️ 市區血拼", class: "tag tag-rose" },
        navUrl: "",
        open: true,
        content: `
          <p class="mb-2">仙台市區購物攻略：</p>
          <details class="bg-white border border-slate-200 rounded-xl">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-700">🛍️ 必逛店家</summary>
            <div class="p-3.5 border-t text-xs">
              <p><strong>THE GALLERY BOX（仙台 PARCO 4F）：</strong>Salomon、MM6 等限量聯名</p>
              <p><strong>3COINS：</strong>300円生活雜貨</p>
              <p><strong>Daiso ヨドバシ仙台店：</strong>百元商店</p>
              <p><strong>唐吉訶德 仙台駅西口本店：</strong>藥妝零食</p>
            </div>
          </details>
        `
      }
    ]
  },

  // ==========================================
  // DAY 6 - 水族館/採草莓 & Outlet
  // ==========================================
  {
    day: 6,
    dateLabel: "DAY 6 · 2027年1月26日 (週二)",
    title: "晨間二選一(水族館/採草莓) ➔ 仔虎和牛 ➔ Outlet大血拚",
    emoji: "🐬",
    events: [
      {
        time: "08:00 - 09:15",
        title: "☕ THE MOST BAKERY ＆ COFFEE 東口店 早餐",
        img: "https://www.fukushige1219.co.jp/wp-content/uploads/example2-3.jpg",
        tag: { text: "🥐 人氣麵包", class: "tag tag-amber" },
        navUrl: "https://maps.app.goo.gl/FmsKLHRKk3g3z6UDA",
        navName: "THE MOST BAKERY",
        open: true,
        content: `<p>招牌「純生」食麵包超柔軟，自家焙煎咖啡香氣濃郁。</p>`
      },
      {
        time: "10:00 - 12:30",
        title: "晨間二選一：海洋水族館 🐧 OR 溫室採草莓 🍓",
        tag: { text: "🎯 彈性早晨", class: "tag tag-sky" },
        navUrl: "",
        open: true,
        content: `
          <p class="mb-2">依當天孩子興趣選擇：</p>
          <details class="bg-sky-50 border border-sky-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-sky-900">🐬 選擇 A：仙台海洋森林水族館</summary>
            <div class="p-3.5 border-t text-xs">
              <p>門票：成人 2,400 日圓 / 幼兒 800 日圓。冬季限定企鵝雪地散步、室內海豚秀（有暖氣）</p>
            </div>
          </details>
          <details class="bg-rose-50 border border-rose-200 rounded-xl mb-2">
            <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-900">🍓 選擇 B：溫室採草莓（三選一）</summary>
            <div class="p-3.5 border-t text-xs">
              <p><strong>1. 一苺一笑 松森農場（免預約）：</strong>⭐️ 4.4分。40分鐘吃到飽</p>
              <p><strong>2. JR水果公園仙台荒濱（官網預約）：</strong>⭐️ 4.0分。園區大</p>
              <p><strong>3. Berry Planet（假日強預約）：</strong>⭐️ 4.3分。完熟甜度高</p>
            </div>
          </details>
        `
      },
      {
        time: "12:45 - 14:15",
        title: "極致和牛燒肉午餐 ➔ 【仔虎 利府店】(最推薦✨)",
        tag: { text: "🥩 頂級和牛", class: "tag tag-amber" },
        navUrl: "https://maps.app.goo.gl/n8F39N1Zq9q57g769",
        navName: "仔虎 利府店",
        open: true,
        content: `
          <p>從水族館或草莓園開車僅需 <strong>15 分鐘</strong>，門口有 <strong>20 個免費平面車位</strong>，大車好停，設兒童菜單，親子友善。</p>
          <p><strong>必點：</strong>上燒肉午餐（油花均勻）、石燒蒜味飯（約 ¥1,100）、盛岡式冷麵（解膩絕配）</p>
        `
      },
      {
        time: "14:30 - 17:30",
        title: "【Mitsui Outlet Park 仙台港】大血拚",
        tag: { text: "🛍️ 狂買免提", class: "tag tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Mitsui+Outlet+Park+Sendai+Port",
        navName: "三井Outlet",
        open: true,
        content: `
          <p>吃飽後開車 15 分鐘抵達。主攻 miki HOUSE、GAP Kids 童裝，The North Face、Mont-bell 戶外品牌。</p>
          <p class="mt-1">🎟️ 先到 1 樓服務台憑護照領外國人 Coupon，部分店家享額外折扣！</p>
        `
      },
      {
        time: "18:00 - 19:30",
        title: "返抵飯店，從容打包行李",
        tag: { text: "🧳 零壓力打包", class: "tag tag-indigo" },
        navUrl: "",
        open: true,
        content: `<p>開車 25 分鐘返回飯店。將戰利品分類裝入 4 個大行李箱，準備圓滿返程！</p>`
      }
    ]
  },

  // ==========================================
  // DAY 7 - 返程
  // ==========================================
  {
    day: 7,
    dateLabel: "DAY 7 · 2027年1月27日 (週三)",
    title: "仙台車站伴手禮採買 ➔ 機場還車 ➔ 滿載返港",
    emoji: "✈️",
    events: [
      {
        time: "10:00 - 10:30",
        title: "飯店退房與裝車",
        tag: { text: "🏡 悠閒早晨", class: "tag tag-indigo" },
        navUrl: "",
        open: true,
        content: `<p>在【Hotel Grand Bach 仙台】悠閒享用早餐，收拾物品，將行李裝上 Minivan。</p>`
      },
      {
        time: "10:45 - 13:00",
        title: "【仙台車站 S-PAL】採購伴手禮 + 輕鬆午餐",
        tag: { text: "🛍️ 一站買齊", class: "tag tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Station",
        navName: "仙台車站",
        open: true,
        content: `
          <p>💡 車停站內停車場，走室內通道完全免吹風，適合帶小孩！</p>
          <p><strong>伴手禮：</strong>菓匠三全「萩之月」、ずんだ茶寮毛豆奶昔、阿部蒲鉾店現炸烤蒲鉾</p>
          <p><strong>午餐：</strong>S-PAL B1 或 3 樓「牛舌通 / 壽司通」</p>
        `
      },
      {
        time: "13:00 - 13:30",
        title: "全平地開車直達仙台機場",
        tag: { text: "🚗 順暢平地", class: "tag tag-teal" },
        navUrl: "",
        open: true,
        content: `<p><strong>路線：</strong>仙台車站 ➔ 仙台東/南部道路 ➔ 仙台機場（約 25–30 分鐘）。</p><p>全程平地高速，無山路封路風險！</p>`
      },
      {
        time: "13:30 - 14:15",
        title: "加滿油 ➔ Nippon Rent-A-Car 還車",
        tag: { text: "⛽ 輕鬆還車", class: "tag tag-teal" },
        navUrl: "",
        open: true,
        content: `<p><strong>13:30 加油：</strong>機場附近加油站加滿油（保留收據）。</p><p><strong>13:45 還車：</strong>歸還便攜安全帶，搭免費接駁車（3 分鐘）到航廈。</p>`
      },
      {
        time: "14:15 - 16:05",
        title: "辦理登機 ➔ 順利返港",
        tag: { text: "✈️ 完美句點", class: "tag tag-teal" },
        navUrl: "",
        open: true,
        content: `<p>辦理行李託運、安檢、出境，搭乘 16:05 班機返回香港！🎉</p>`
      }
    ]
  }
];