/**
 * ============================================================
 *  2027 東北冬季親子溫泉自駕之旅 - 行程數據
 *  版本: 2.2.0
 *  最後更新: 2026-09-20
 *
 *  v2.2 變更：
 *    - 補上 Nippon Rent-A-Car / 銀山溫泉 / 仔虎 / 水族館 導航連結
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
    subtitle: "♨️ 秋保溫泉初體驗",
    emoji: "♨️",
    events: [
      {
        time: "14:05 - 14:50",
        title: "落地仙台機場 (SDJ) & 入境手續",
        img: "https://hk.wamazing.com/media/wp-content/uploads/sites/5/2024/08/sdjdutyfreeshop_pixta_98589488_M.jpg.webp",
        tag: { text: "🛬 抵達雪國", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Airport",
        navName: "仙台機場",
        priority: "must",
        open: true,
        content: `
          <p>14:05 落地，窗外已是靄靄白雪</p>
          <p class="text-xs text-slate-500">入境 → 提行李，接下來就是雪國時間</p>
          <div class="tip-block warn">
            <strong>⏰ 預留 45 分鐘</strong>（冬季 + 兩幼童）<br>
            ⚠️ 若拖到 15:00 後 → 改 1F 牛舌外帶上車吃
          </div>
        `
      },
      {
        time: "14:50 - 15:30",
        title: "仙台機場美食充電",
        tag: { text: "🍽️ 機場美食", class: "tag-amber" },
        navUrl: "",
        priority: "optional",
        open: true,
        content: `
          <p>取車前 30 分鐘，先餵飽肚子</p>
          <details>
            <summary>🍽️ 三層美食速覽</summary>
            <div>
              <p><strong>1F 外帶</strong><br><span class="text-slate-500 text-xs">🌭 冠舌屋 — 牛舌熱狗・牛舌飯糰</span></p>
              <p><strong>2F 輕食</strong><br><span class="text-slate-500 text-xs">☕ みちのくラウンジ — 三明治・有插座</span><br><span class="text-slate-500 text-xs">🥤 ずんだ茶寮 — 毛豆奶昔（招牌）</span></p>
              <p><strong>3F 坐著吃</strong><br><span class="text-slate-500 text-xs">☕ FLATWHITE — 手沖咖啡・司康</span><br><span class="text-slate-500 text-xs">🍛 M.M.C — 有機咖啡・咖哩飯</span></p>
            </div>
          </details>
          <div class="tip-block">💡 趕時間選 1F，有時間坐 2F / 3F</div>
        `
      },
      {
        time: "15:30 - 16:00",
        title: "提領 Nippon Rent-A-Car 7-8 人座雪地車",
        img: "https://rimage.gnst.jp/livejapan.com/public/img/spot/lj/01/45/lj0145539/lj0145539_6a39f0b20dd93_main.jpg",
        tag: { text: "🚗 冬季自駕", class: "tag-teal" },
        navUrl: "https://maps.app.goo.gl/WQM6cUyrzgxWruNU7?g_st=ac",
        navName: "Nippon Rent-A-Car",
        priority: "must",
        open: true,
        content: `
          <p>車匙到手，雪國之旅正式開始</p>
          <p class="text-xs text-slate-500">1F 櫃檯報到 → 接駁車 → 取車營業所</p>
          <div class="tip-block warn">
            <strong>✅ 取車必檢</strong><br>
            • 4WD + 雪胎（胎紋 ≥ 5mm）<br>
            • 2 套兒童安全帶裝第二排<br>
            • 4 大箱 + 推車塞得下
          </div>
        `
      },
      {
        time: "16:00 - 16:45",
        title: "平地直達秋保溫泉",
        tag: { text: "🛣️ 零風險路線", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Zuiho+Akiu",
        navName: "秋保溫泉瑞鳳",
        priority: "must",
        open: true,
        content: `
          <p>駛離市區，40 分鐘後進入秋保山區</p>
          <p class="text-xs text-slate-500">仙台南部道路 → 山田 IC → 國道 286</p>
          <div class="tip-block danger">
            🌅 16:45 天黑得快，橋樑與樹蔭開始結暗冰<br>
            車距加倍，煞車輕踩
          </div>
        `
      },
      {
        time: "16:45 - 17:00",
        title: "抵達秋保溫泉「瑞鳳大飯店」Check-in",
        img: "https://rimage.gnst.jp/livejapan.com/public/article/detail/a/30/00/a3000138/img/zh-tw/a3000138_parts_5f717fd1acf77.jpg?20210210161203&q=80&rw=686&rh=490",
        images: [
          "https://rimage.gnst.jp/livejapan.com/public/article/detail/a/30/00/a3000138/img/zh-tw/a3000138_parts_5f717fd1acf77.jpg?20210210161203&q=80&rw=686&rh=490",
          "https://i.meee.com.tw/ApBoY67.jpg",
          "https://i.meee.com.tw/MVUFfIB.jpg"
        ],
        tag: { text: "🏨 溫泉名宿", class: "tag-indigo" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>推開大門，榻榻米香撲鼻而來</p>
          <p class="text-xs text-slate-500">門口卸行李 → 大廳 Check-in → 領鑰匙</p>
          <div class="tip-block">💡 17:00 帶小孩先玩泳池 30 分鐘放電</div>
          <details>
            <summary>🏨 入住與客房細節</summary>
            <div>
              <p><strong>退房分流</strong><br><span class="text-slate-500 text-xs">06:00 起可提早辦理，避開人潮</span></p>
              <p><strong>客房</strong><br><span class="text-slate-500 text-xs">傳統榻榻米和室，房內僅礦泉水免費</span></p>
              <p><strong>樓層</strong><br><span class="text-slate-500 text-xs">高樓層水壓偏小，建議選低樓層</span></p>
            </div>
          </details>
        `
      },
      {
        time: "17:30 - 19:30",
        title: "饗宴「Seasons」豪華自助晚餐",
        img: "https://img.kenalice.tw/2025/04/20250420231941_0_5dbb05.jpg",
        tag: { text: "🦀 痛快美食", class: "tag-amber" },
        navUrl: "",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>B1 大廳，蟹腳與和牛任你吃</p>
          <div class="tip-block">
            <strong>🦀 大人主打</strong><br>
            蟹腳吃到飽・現煎黑毛和牛・仙台牛舌<br>
            <strong>👶 兒童區</strong><br>
            炸雞・薯條・巧克力噴泉
          </div>
          <div class="tip-block warn">
            ⏰ 分 17:00–19:00 / 19:00–21:00 兩場，入住時確認
          </div>
        `
      },
      {
        time: "20:30 -",
        title: "露天雪景風呂 → 榻榻米好眠",
        img: "https://rimage.gnst.jp/livejapan.com/public/article/detail/a/30/00/a3000138/img/zh-tw/a3000138_parts_5f717fbc08a88.jpg?20210210161203&q=80&rw=686&rh=490",
        tag: { text: "♨️ 泡湯暖身", class: "tag-sky" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>泡完湯，一覺到天亮</p>
          <p class="text-xs text-slate-500">21:15 露天風呂 → 22:00 回房睡覺</p>
          <div class="tip-block warn">
            <strong>♨️ 泡湯提醒</strong><br>
            • 男女湯每日互換，看清指示牌<br>
            • 大浴巾需從房間自帶<br>
            • 裸湯、毛巾不下水、禁手機
          </div>
        `
      }
    ]
  },
  // ==========================================
// DAY 2 - 山形天童
// ==========================================
{
  day: 2,
  dateLabel: "DAY 2 · 2027年1月22日 (週五)",
  title: "AEON 買裝備 ➔ 幼兒充電 ➔ 銀山溫泉夢幻夜景",
  subtitle: "🏮 大正浪漫銀山夜景",
  emoji: "🏮",
  events: [
    {
      time: "09:30 - 10:30",
      title: "退房出發，跨縣前往山形天童",
      tag: { text: "🚗 雪地幹線", class: "tag-teal" },
      navUrl: "",
      priority: "must",
      open: true,
      content: `
        <p>告別秋保，駛往山形縣</p>
        <p class="text-xs text-slate-500">國道 48 號（關山街道）→ 天童市，約 50–60 分鐘</p>
        <div class="tip-block warn">
          <strong>🚗 連續彎道多</strong>｜下雪時時速降至 30–40<br>
          後方有車緊跟 → 找避車道打左燈讓過
        </div>
        <div class="tip-block danger">
          <strong>⚠️ 關山隧道兩端</strong>｜易有積雪或薄冰<br>
          維持車距，不急煞、不急打方向盤
        </div>
      `
    },
    {
      time: "10:30 - 14:30",
      title: "AEON MALL 天童：裝備補給與美食",
      img: "https://japanshopping.org/files/shopimg/84ab29edbe4c8f9e96cfb4024eb95bc2.jpg",
      tag: { text: "🛍️ 裝備補給", class: "tag-rose" },
      navUrl: "https://www.google.com/maps/search/?api=1&query=Aeon+Mall+Tendo",
      navName: "AEON天童",
      priority: "must",
      open: true,
      content: `
        <p>東北最大 AEON，一次補齊裝備</p>
        <p class="text-xs text-slate-500">Montbell・UNIQLO・超市・藥妝全都有</p>
        <details>
          <summary>🛍️ 必逛品牌</summary>
          <div>
            <p><strong>戶外運動</strong><br><span class="text-slate-500 text-xs">Montbell（機能服飾）・ABC-MART Grand Stage（限定鞋款）</span></p>
            <p><strong>日系服飾</strong><br><span class="text-slate-500 text-xs">UNIQLO・GU・未來屋書店</span></p>
            <p><strong>生活補給</strong><br><span class="text-slate-500 text-xs">AEON STYLE 生鮮超市（山形名產・清酒）・Welcia 藥妝</span></p>
          </div>
        </details>
        <details>
          <summary>🍱 人氣餐廳</summary>
          <div>
            <p><strong>1F 餐廳街</strong><br><span class="text-slate-500 text-xs">大戶屋・いきなりステーキ・築地銀章魚燒</span></p>
            <p><strong>2F 美食廣場</strong><br><span class="text-slate-500 text-xs">築地食堂 源ちゃん・丸龜製麵・幸樂苑</span></p>
          </div>
        </details>
        <div class="tip-block">💡 建議 1F 大戶屋吃午餐，吃飽再上 2F 逛</div>
      `
    },
    {
      time: "14:30 - 15:00",
      title: "YUKIHIRA COFFEE 休憩",
      img: "https://cdn-ak.f.st-hatena.com/images/fotolife/d/deep-karuma-waap-ec-real-s1/20260720/20260720185804.jpg",
      tag: { text: "☕ 咖啡小憩", class: "tag-amber" },
      navUrl: "https://maps.app.goo.gl/PLAjJVoyuemACVNC8?g_st=ac",
      navName: "YUKIHIRA COFFEE",
      priority: "optional",
      open: true,
      content: `
        <p>手沖一杯，喘口氣</p>
        <p class="text-xs text-slate-500">逛完 AEON 順路休息</p>
      `
    },
    {
      time: "15:00 - 15:30",
      title: "微笑の宿 瀧之湯 Check-in",
      img: "https://sendai-kouiki-mice.com/wp-content/uploads/2024/12/pic-hohoeminoyado-02.jpg",
      tag: { text: "🏨 溫泉名宿", class: "tag-indigo" },
      navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
      navName: "微笑の宿 瀧之湯",
      priority: "must",
      open: true,
      content: `
        <p>抵達瀧之湯，木造溫泉旅館</p>
        <p class="text-xs text-slate-500">Check-in + 確認銀山夜景專車集合位置</p>
        <div class="tip-block">💡 貸切風呂時段：1/23 16:30（明晚）</div>
      `
    },
    {
      time: "15:30 - 19:15",
      title: "【極重要】銀山溫泉夢幻夜景",
      img: "https://mimigo.tw/wp-content/uploads/20230105083619_51.jpg",
      tag: { text: "🏮 大正浪漫", class: "tag-sky" },
      navUrl: "https://maps.app.goo.gl/R5FCE8fhY6jMzqjr7?g_st=ac",
      navName: "銀山溫泉",
      priority: "must",
      highlight: true,
      open: true,
      content: `
        <p>傍晚的銀山，像走進大正時代</p>
        <p class="text-xs text-slate-500">瀧之湯 → 大正浪漫館（約 45 分鐘）→ 接駁車</p>
        <div class="tip-block warn">
          <strong>⏰ 預約 16:30 接駁車最保險</strong>（車程 45 分 + 提早 15 分到）
        </div>
        <details>
          <summary>🚌 交通二選一</summary>
          <div>
            <p><strong>方案A：接駁巴士 Fast Pass（首選）</strong><br><span class="text-slate-500 text-xs">¥1,500/人 · 出發前 1–2 個月上網搶票 · 持 Pass 免排隊上車</span></p>
            <p><strong>方案B：Twilight 夢幻夜景專車（備案）</strong><br><span class="text-slate-500 text-xs">價格較高，Fast Pass 搶不到再考慮</span></p>
          </div>
        </details>
        <div class="tip-block danger">
          <strong>❄️ 極寒候車準備</strong>｜回程 18:00–18:30 集中排隊<br>
          接駁站無遮蔽、入夜零下，預先在 AEON 買好<strong>貼身 + 手持暖暖包</strong><br>
          ⚠️ 木棧道與橋面易結冰，穿防滑雪靴、緊牽小孩
        </div>
      `
    },
    {
      time: "19:30 - 21:00",
      title: "天童溫泉周邊深夜美食",
      tag: { text: "🥩 彈性晚餐", class: "tag-amber" },
      navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
      navName: "微笑の宿 滝の湯",
      priority: "optional",
      open: true,
      content: `
        <p>銀山回來大約 19:30，這 3 間還開著！</p>
        <details>
          <summary>🍜 手打 水車生そば（首選）</summary>
          <div>
            <img src="https://svcstrg.cld.navitime.jp/travelguide/p06020024/p06020024_02.webp" alt="手打 水車生そば" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p><strong>鳥中華</strong><br><span class="text-slate-500 text-xs">鰹魚醬油湯 + 拉麵 + 雞肉 + 天婦羅碎屑</span></p>
            <p><strong>手打蕎麥</strong><br><span class="text-slate-500 text-xs">石臼研磨，粗麵條、超有咬口</span></p>
            <a href="https://maps.app.goo.gl/XvHHsWwn3RNpx67m6?g_st=ac" target="_blank">📍 導航前往</a>
          </div>
        </details>
        <details>
          <summary>🥩 大衆焼肉けむすけ</summary>
          <div>
            <img src="https://www.yakiniku-ousama.com/_p/acre/9340/images/pc/smart_phone_993fe882.jpg" alt="大衆焼肉けむすけ" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p><strong>三大招牌</strong><br><span class="text-slate-500 text-xs">名物アカ（哈拉米）・名物シロ（豬大腸）・炙り牛寿司</span></p>
            <p><strong>隱藏靈魂</strong><br><span class="text-slate-500 text-xs">桌上檸檬沙瓦水龍頭（1 小時無限暢飲）</span></p>
            <a href="https://maps.app.goo.gl/P3JM6zwqwNaGTmgTA?g_st=ac" target="_blank">📍 導航前往</a>
          </div>
        </details>
        <details>
          <summary>🍣 いろは寿司</summary>
          <div>
            <img src="https://www.convention.or.jp/umaibe_2024/data_img/umd_355_02.jpg" alt="いろは寿司" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p><strong>頂級壽司</strong><br><span class="text-slate-500 text-xs">職人現捏「特上握壽司」（約 ¥2,000 起）</span></p>
            <p><strong>招牌熟食</strong><br><span class="text-slate-500 text-xs">鰻魚飯「鰻重」（約 ¥2,500）</span></p>
            <p><strong>小酌首選</strong><br><span class="text-slate-500 text-xs">海鮮居酒屋小菜 + 山形在地名酒</span></p>
            <a href="https://maps.app.goo.gl/2FAqTdrbNJTeeQPu9?g_st=ac" target="_blank">📍 導航前往</a>
          </div>
        </details>
        <div class="tip-block">💡 吃飽回飯店泡大浴場，結束 Day 2</div>
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
  subtitle: "☃️ 藏王樹冰震撼之旅",
  emoji: "☃️",
  events: [
    {
      time: "07:40 - 09:20",
      title: "提早出發，全自駕直達藏王纜車站",
      img: "https://cclalice.com/wp-content/uploads/2024/12/DSC09203-1170x780.jpg",
      tag: { text: "🚗 週末早鳥", class: "tag-teal" },
      navUrl: "",
      priority: "must",
      open: true,
      content: `
        <p>07:40 出發，往藏王雪國前進</p>
        <p class="text-xs text-slate-500">天童溫泉 → 山形西繞道 → 藏王溫泉，約 45–50 分鐘</p>
        <div class="tip-block warn">
          <strong>⏰ 08:30 前抵達纜車停車場</strong>｜避開週末第一波團客<br>
          最後 15–20 分鐘為爬坡連續彎道，小心駕駛
        </div>
      `
    },
    {
      time: "09:20 - 12:30",
      title: "搭乘雙段纜車登頂 ➔ 觀賞震撼「藏王樹冰」",
      img: "https://hk.wamazing.com/media/wp-content/uploads/sites/5/2023/09/zaoujuhyou_pixta_73308950_M.jpg.webp",
      images: [
        "https://hk.wamazing.com/media/wp-content/uploads/sites/5/2023/09/zaoujuhyou_pixta_73308950_M.jpg.webp",
        "https://wp-odai.wamazing.com/media/wp-content/uploads/sites/2/2023/09/zaoujuhyou_pixta_85145645_M.jpg.webp",
        "https://wp-odai.wamazing.com/media/wp-content/uploads/sites/2/2023/09/zaoujuhyou_pixta_73182403_M.jpg.webp",
        "https://wp-odai.wamazing.com/media/wp-content/uploads/sites/2/2023/09/zaoujuhyou_zao_17.jpg.webp"
      ],
      tag: { text: "❄️ 樹冰奇景", class: "tag-sky" },
      navUrl: "https://www.google.com/maps/search/?api=1&query=Zao+Ropeway",
      navName: "藏王索道",
      priority: "must",
      highlight: true,
      open: true,
      content: `
        <p>兩段纜車，直上 -20℃ 的樹冰王國</p>
        <p class="text-xs text-slate-500">山麓 → 樹冰高原（換乘）→ 地藏山頂，來回約 2 小時</p>
        <details>
          <summary>🎟️ 優先票搶票作戰</summary>
          <div>
            <p><strong>1️⃣ 提前註冊</strong><br><span class="text-slate-500 text-xs">Asoview! 帳號 + 綁定信用卡</span></p>
            <p><strong>2️⃣ 設鬧鐘</strong><br><span class="text-slate-500 text-xs">搭乘日前 7 天日本時間 00:00 釋出。你的搭乘日 1/23 → 開賣時間 香港 1/15 23:00</span></p>
            <p><strong>3️⃣ 鎖定時段</strong><br><span class="text-slate-500 text-xs">開賣後直接搶 08:30 或 09:00。週六票通常 5 分鐘內秒殺（成人 ¥5,500 / 兒童 ¥3,500）</span></p>
          </div>
        </details>
        <details>
          <summary>🚠 纜車搭乘技巧</summary>
          <div>
            <p><strong>優先票限制</strong><br><span class="text-slate-500 text-xs">只保證「第一段上山」免排隊，下山仍需排</span></p>
            <p><strong>避堵路線</strong><br><span class="text-slate-500 text-xs">坐第一班（08:15）→ 先直達山頂 → 下山再停「樹冰高原站」拍照</span></p>
            <p><strong>車廂擁擠</strong><br><span class="text-slate-500 text-xs">常塞滿滑雪客，長輩可能需站立 10–15 分鐘</span></p>
          </div>
        </details>
        <div class="tip-block danger">
          <strong>⚠️ 山頂安全（-20℃）</strong><br>
          🥶 零皮膚外露：毛帽 + 圍脖 + 護目鏡<br>
          ⛸️ 地藏段結冰：必穿冰爪、緊牽小孩<br>
          🏃 風雪打臉痛 = 立即撤退，不要硬撐
        </div>
        <div class="tip-block">
          <strong>📸 拍照亮點</strong><br>
          纜車靠窗位（俯瞰樹冰林）· 地藏菩薩像 · 山頂餐廳落地窗前<br>
          <strong>帶現金</strong>｜山上小攤與扭蛋機只收現金
        </div>
        <div class="tip-block warn">
          <strong>🌪️ 纜車停駛備案</strong>｜強風或暴雪會無預警停駛<br>
          → 草莓行程提前 / 山形市區室內 / AEON 補給<br>
          ⚠️ 別在強風山腳下空等
        </div>
      `
    },
    {
      time: "12:30 - 14:00",
      title: "山形市區午餐 ➔ うまい鮨勘 山形南支店",
      img: "https://site-images.hp.admin.can-ly.com/images/cms/edited/directories/18/stores/214980/20260123165120%E5%B1%B1%E5%BD%A2%E5%8D%97%E6%94%AF%E5%BA%97.JPG",
      tag: { text: "🍣 人氣壽司", class: "tag-amber" },
      navUrl: "https://maps.app.goo.gl/eSMkZD1m3vimNytv7",
      navName: "うまい鮨勘 山形南支店",
      priority: "must",
      open: true,
      content: `
        <p>下山後，來一頓新鮮壽司</p>
        <p class="text-xs text-slate-500">藏王纜車站 → 山形市區，約 35–40 分鐘</p>
        <div class="tip-block">
          🍣 食材新鮮、選擇多樣、環境對兒童友善<br>
          📍 附設寬敞停車場
        </div>
        <div class="tip-block warn">
          <strong>🥶 車廂冰庫效應</strong>｜車子停山麓 3–4 小時後溫度極低<br>
          建議一位大人先發動開暖氣等 5–10 分鐘，再帶小孩上車
        </div>
      `
    },
    {
      time: "14:30 - 15:30",
      title: "寒河江草莓園 ➔ 冬季溫室草莓吃到飽",
      img: "http://www2.ic-net.or.jp/~icrose/img/aboutus/top_aboutus_right.jpg",
      tag: { text: "🍓 溫室採果", class: "tag-sky" },
      navUrl: "https://maps.app.goo.gl/ZNG1U3GgY6Hfdptz8",
      navName: "寒河江草莓園",
      priority: "optional",
      open: true,
      content: `
        <p>溫室裡，紅透的草莓垂手可得</p>
        <p class="text-xs text-slate-500">從壽司店出發約 30 分鐘</p>
        <div class="tip-block">
          <strong>🍓 30 分鐘吃到飽</strong>｜大人約 ¥1,800–2,300<br>
          現場依產期提供多品種（章姬、紅臉頰等）
        </div>
        <div class="tip-block warn">
          <strong>⏰ 建議預約 14:30 或 15:00</strong>｜讓午餐從容不趕
        </div>
        <div class="tip-block">
          <strong>彈性備案</strong>｜藏王玩太久可直接取消，改到 D6 仙台市區採草莓
        </div>
      `
    },
    {
      time: "15:30 - 16:30",
      title: "返回天童溫泉，市區輕鬆漫步",
      tag: { text: "☕ 悠閒午後", class: "tag-indigo" },
      navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
      navName: "微笑の宿 瀧之湯",
      priority: "optional",
      open: false,
      content: `
        <p>回飯店，小朋友睡個午覺</p>
        <p class="text-xs text-slate-500">開車約 30 分鐘返回天童</p>
      `
    },
    {
      time: "16:30 - 20:00",
      title: "獨享「貸切風呂」與懷石晚餐",
      img: "https://www.nipponsensor.net/wp-content/uploads/2025/08/%E5%BE%AE%E7%AC%91%E4%B9%8B%E5%AE%BF%E7%80%A7%E4%B9%8B%E6%B9%AF-04.jpg",
      tag: { text: "♨️ 私人包廂", class: "tag-indigo" },
      navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
      navName: "微笑の宿 瀧之湯",
      priority: "must",
      open: true,
      content: `
        <p>私人包廂湯，全家一起泡</p>
        <p class="text-xs text-slate-500">16:30 貸切風呂 → 18:00 懷石晚餐</p>
        <div class="tip-block">
          <strong>♨️ 貸切風呂</strong>｜私人包廂湯，免擔心小孩吵鬧<br>
          <strong>🍱 懷石晚餐</strong>｜山形在地精緻食材
        </div>
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
  subtitle: "⛷️ 玩雪放電再出發",
  emoji: "⛷️",
  events: [
    {
      time: "09:30 - 10:45",
      title: "退房出發，跨縣前往【Spring Valley 仙台泉】",
      img: "https://lovetogo.tw/201802-tohoku/spring-valley/photo/20180204-1124-0289.jpg",
      tag: { text: "🚗 雪地自駕", class: "tag-teal" },
      navUrl: "https://www.google.com/maps/search/?api=1&query=Spring+Valley+Izumi+Kogen",
      navName: "Spring Valley 仙台泉",
      priority: "must",
      open: true,
      content: `
        <p>離開天童，前往仙台泉高原</p>
        <p class="text-xs text-slate-500">車程約 1 小時 15 分鐘，正好讓小孩補眠</p>
        <div class="tip-block warn">
          <strong>🚗 週日建議走高速</strong>｜山形自動車道 → 東北自動車道<br>
          除雪層級最高、彎道平緩，減少後座暈車
        </div>
      `
    },
    {
      time: "10:45 - 14:30",
      title: "【雪之冒險王國】玩雪放電與滑雪場午餐",
      img: "https://lovetogo.tw/201802-tohoku/spring-valley/photo/20180204-1310-0344.jpg",
      tag: { text: "☃️ 玩雪放電", class: "tag-sky" },
      navUrl: "",
      priority: "must",
      highlight: true,
      open: true,
      content: `
        <p>雪之冒險王國，4 歲小孩的放電場</p>
        <p class="text-xs text-slate-500">中午在場內餐廳吃拉麵 / 咖哩</p>
        <div class="tip-block warn">
          <strong>🎟️ 票價與營業</strong><br>
          <strong>假日</strong>｜4 歲 + 陪同家長皆 ¥2,000（網購 ¥1,500）<br>
          <strong>平日</strong>｜玩雪專區不開放，全場免門票，單租雪盆 ¥300
        </div>
        <details>
          <summary>🎯 3 大必玩</summary>
          <div>
            <p><strong>旋轉雪盆</strong>｜像雪地旋轉木馬，最安全</p>
            <p><strong>魔毯滑雪盆</strong>｜電動傳送帶上坡，省小孩體力</p>
            <p><strong>雪地夾鴨子</strong>｜帶「雪球夾」模具，放電又好玩</p>
          </div>
        </details>
        <details>
          <summary>⚠️ 3 大避坑重點</summary>
          <div>
            <p><strong>別帶推車</strong>｜雪地推不動，改讓小孩坐雪盆裡拉著走</p>
            <p><strong>備兩雙手套</strong>｜玩雪手套極易濕透，下午換第二雙</p>
            <p><strong>預防上廁所</strong>｜連身雪衣極難脫，進場前 + 午餐後定時帶去</p>
          </div>
        </details>
        <div class="tip-block">
          🧥 可選租借（4 小時）｜兒童雪衣 + 雪褲 ¥3,300 · 雪靴 ¥1,500<br>
          自行穿防水衣物 + 雨鞋則為 0 元
        </div>
      `
    },
    {
      time: "14:30 - 15:30",
      title: "驅車下山 ➔ 入住【Hotel Grand Bach 仙台】",
      img: "https://cdn.jalan.jp/jalan/images/pict2L/Y5/Y318775/Y318775163.jpg",
      tag: { text: "🏨 舒適連住", class: "tag-indigo" },
      navUrl: "https://maps.app.goo.gl/tumoctSbhRFgQkx89?g_st=ac",
      navName: "Hotel Grand Bach 仙台",
      priority: "must",
      open: true,
      content: `
        <p>入住仙台站旁，連住 3 晚</p>
        <p class="text-xs text-slate-500">2 間雙床房，車停東口 24HR 平面計費停車場</p>
        <div class="tip-block warn">
          <strong>🧳 卸貨動線</strong>｜先臨停飯店門口<br>
          一位家長帶小孩 + 大行李下車 → 駕駛獨自去停車<br>
          ⚠️ 不要全家跟著去停車再拖行李走回飯店
        </div>
      `
    },
    {
      time: "17:30 - 20:00",
      title: "晚餐 ➔ 伊達の牛たん本舗 本店",
      img: "https://tohoku365.com/desk_jp/wp/wp-content/uploads/2016/06/dateno.jpg",
      tag: { text: "🥩 必吃名店", class: "tag-amber" },
      navUrl: "https://maps.app.goo.gl/3pwjdGMZZeGCRq1MA",
      navName: "伊達牛舌本舗 本店",
      priority: "must",
      open: true,
      content: `
        <p>仙台必吃！厚切牛舌的極致</p>
        <p class="text-xs text-slate-500">仙台站旁，走路可到</p>
        <div class="tip-block warn">
          <strong>⏰ 17:00 進店最保險</strong>｜週日 18:00 後會湧入新幹線旅客<br>
          若小孩下午車上就喊餓 → 毫不猶豫 17:00 直接進
        </div>
        <details>
          <summary>👑 大人招牌</summary>
          <div>
            <p>註冊商標<strong>「芯舌（芯たん）」</strong></p>
            <p>厚切但極軟嫩多汁，完全不用擔心咬不動</p>
            <p>定食麥飯可免費續碗一次</p>
          </div>
        </details>
        <details>
          <summary>👦 適合 4 歲小孩</summary>
          <div>
            <p>燉得軟爛的<strong>「燉牛舌」</strong>和<strong>「牛舌咖哩」</strong></p>
            <p>牛舌漢堡排 · 烤雞肉串 · 鮭魚卵親子飯 · 魚翅拉麵</p>
            <p>不吃烤肉的小孩也能吃得很開心</p>
          </div>
        </details>
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
  subtitle: "🦊 狐狸村萌寵互動",
  emoji: "🦊",
  events: [
    {
      time: "08:30 - 09:30",
      title: "早餐 ➔ 客美多咖啡 仙台富澤店",
      img: "https://www.fukushige1219.co.jp/wp-content/uploads/example2-3.jpg",
      tag: { text: "☕ 悠閒晨活", class: "tag-amber" },
      navUrl: "https://maps.app.goo.gl/SYGcfygAcH7gamz2A",
      navName: "客美多咖啡",
      priority: "must",
      open: true,
      content: `
        <p>名古屋來的早餐名店，開在仙台</p>
        <p class="text-xs text-slate-500">從飯店開車約 15 分鐘</p>
        <div class="tip-block">
          🚗 吃飽後從「長町 IC」或「仙台南 IC」上東北道<br>
          → 直達白石 IC → 狐狸村（順路不繞路）
        </div>
      `
    },
    {
      time: "09:30 - 12:00",
      title: "出發與【宮城藏王狐狸村】雪地互動",
      img: "https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-0946-3472.jpg",
      images: [
        "https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-0946-3472.jpg",
        "https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-1004-3540.jpg",
        "https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-1011-3570.jpg",
        "https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-1031-3635.jpg"
      ],
      tag: { text: "🦊 萌寵互動", class: "tag-sky" },
      navUrl: "https://www.google.com/maps/search/?api=1&query=Miyagi+Zao+Fox+Village",
      navName: "狐狸村",
      priority: "must",
      highlight: true,
      open: true,
      content: `
        <p>上百隻狐狸自由走動，超震撼</p>
        <p class="text-xs text-slate-500">家長<strong>全程緊牽小孩</strong>，禁觸摸放養區狐狸</p>
        <div class="tip-block danger">
          <strong>⚠️ 軍訓級要求（行前教育）</strong><br>
          員工對幼童安全把關極嚴，只要有一絲掙脫、奔跑、哭鬧 → 會嚴厲制止甚至請離場<br>
          家長需<strong>一對一死死牽牢</strong>
        </div>
        <details>
          <summary>🚨 4 歲幼兒互動守則</summary>
          <div>
            <p><strong>互動禁忌</strong>｜禁奔跑、蹲下、伸手摸狐狸（會被咬傷）</p>
            <p><strong>穿著禁忌</strong>｜禁飄逸長裙、吊繩、流蘇、黑色塑膠袋</p>
            <p><strong>餵食規定</strong>｜只能在指定高台區拋擲專用飼料</p>
          </div>
        </details>
        <details>
          <summary>📸 體驗與實用提醒</summary>
          <div>
            <p><strong>抱狐狸體驗</strong>｜國中以上限定（約 ¥700/次），4 歲無法參加，可旁觀拍照</p>
            <p><strong>推車</strong>｜園區多雪地坡道階梯，完全推不動</p>
            <p><strong>停留時間</strong>｜1.5–2 小時非常充裕</p>
            <p><strong>雪地駕駛</strong>｜山路極易結冰，務必用 4WD + 雪胎，下坡善用低速檔</p>
          </div>
        </details>
      `
    },
    {
      time: "12:15 - 13:45",
      title: "白石午餐 ➔ 傳統名物「白石溫麵」三選一",
      tag: { text: "🍜 在地名物", class: "tag-amber" },
      navUrl: "",
      priority: "must",
      open: true,
      content: `
        <p>白石名物，溫麵三選一</p>
        <p class="text-xs text-slate-500">離開狐狸村開車約 15 分鐘回到白石市區</p>
        <details>
          <summary>🌟 手延白石溫麵 光庵（推薦）</summary>
          <div>
            <img src="https://oniwa.garden/wp-content/img/04_miyagi/2604_shiroishi_tsurigane/02.jpeg" alt="手延白石溫麵 光庵" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p><strong>招牌冷麵：三種醬汁溫麵</strong><br><span class="text-slate-500 text-xs">經典鰹魚醬油・濃郁胡麻・當地核桃醬</span></p>
            <p><strong>招牌熱麵</strong><br><span class="text-slate-500 text-xs">特製雞湯溫麵・葛粉勾芡蔬菜溫麵</span></p>
            <a href="https://maps.app.goo.gl/wwgroAhTgSeapcXXA?g_st=ac" target="_blank">📍 導航前往</a>
          </div>
        </details>
        <details>
          <summary>🥢 白石うーめん やまぶき亭（選擇豐富）</summary>
          <div>
            <img src="https://shiroishi-navi.jp/wp-content/uploads/2018/03/shzZkbG4791p6nR3sNXf8tnzqz1kl0.jpg" alt="白石うーめん やまぶき亭" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p><strong>溫麵三昧</strong><br><span class="text-slate-500 text-xs">芝麻・核桃・醬油三種沾醬</span></p>
            <p><strong>必吃</strong><br><span class="text-slate-500 text-xs">天ぷらうーめん（天婦羅溫麵）</span></p>
            <a href="https://maps.app.goo.gl/VudKdyUMEgfc5CKJ8?g_st=ac" target="_blank">📍 導航前往</a>
          </div>
        </details>
        <details>
          <summary>🍤 讃岐づくり本格手打ちうどん 麦の季</summary>
          <div>
            <img src="https://www.ichijoh.co.jp/wp/wp-content/uploads/2023/04/muginoki.jpg" alt="麦の季" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p><strong>必吃</strong><br><span class="text-slate-500 text-xs">大蝦天婦羅盛りざるうどん（大蝦天婦羅冷烏龍麵）</span></p>
            <p><strong>特色</strong><br><span class="text-slate-500 text-xs">高級藏王鴨「蔵王鴨つけうどん」</span></p>
            <a href="https://maps.app.goo.gl/a25hoeAAf6BQtD44A" target="_blank">📍 導航前往</a>
          </div>
        </details>
      `
    },
    {
      time: "13:45 - 14:45",
      title: "驅車返回仙台市區",
      tag: { text: "🚗 輕鬆車程", class: "tag-teal" },
      navUrl: "",
      priority: "must",
      open: false,
      content: `
        <p>車上午睡，1 小時回到仙台</p>
      `
    },
    {
      time: "14:45 - 18:00",
      title: "仙台市區購物（PARCO / 3COINS / Daiso / 唐吉訶德）",
      tag: { text: "🛍️ 市區血拼", class: "tag-rose" },
      navUrl: "",
      priority: "optional",
      open: true,
      content: `
        <p>仙台車站周邊，一次買齊</p>
        <div class="tip-block danger">
          <strong>🚗 市區停車陷阱警告</strong><br>
          仙台站周邊車流大、單行道多，百貨停車場常對 Minivan 限高<br>
          ✅ 正解：把車停回 Grand Bach 周邊固定停車場，全程<strong>步行</strong>
        </div>
        <div class="tip-block">
          <strong>✨ THE GALLERY BOX（大人潮牌）</strong><br>
          仙台 PARCO 4F<br>
          Salomon・MM6 Maison Margiela 等限量聯名
          <a href="https://www.google.com/maps/search/?api=1&query=Sendai+PARCO" target="_blank">📍 導航</a>
        </div>
        <details>
          <summary>🛒 私藏逛街清單</summary>
          <div>
            <p>🪙 <strong>3COINS</strong><br><span class="text-slate-500 text-xs">300円生活雜貨</span> <a href="https://maps.app.goo.gl/uFUSHdEotSbewYDZ9" target="_blank">📍 導航</a></p>
            <p>🏬 <strong>Daiso ヨドバシ仙台店</strong><br><span class="text-slate-500 text-xs">百元商店</span> <a href="https://maps.app.goo.gl/Mg38a3Q4dVi7U38D7?g_st=ac" target="_blank">📍 導航</a></p>
            <p>🐧 <strong>唐吉訶德 仙台駅西口本店</strong><br><span class="text-slate-500 text-xs">藥妝零食</span> <a href="https://maps.app.goo.gl/6Ti8UJyEa1tFreBW7?g_st=ac" target="_blank">📍 導航</a></p>
          </div>
        </details>
        <div class="tip-block">
          <strong>🍡 逛街能量補給</strong><br>
          🫘 <strong>ankoya 駅前店</strong><br><span class="text-slate-500 text-xs">豆沙銅鑼燒</span> <a href="https://maps.app.goo.gl/ayEVAqZY779V7WF49?g_st=ac" target="_blank">📍 導航</a><br>
          🐟 <strong>鯛吉 名掛丁本店</strong><br><span class="text-slate-500 text-xs">現烤鯛魚燒</span> <a href="https://maps.app.goo.gl/D5GqutNmGGPh6WrQA?g_st=ac" target="_blank">📍 導航</a>
        </div>
      `
    },
    {
      time: "18:00 - 20:00",
      title: "晚餐：S-PAL 美食街或飯店周邊",
      tag: { text: "🍱 味蕾轉換", class: "tag-amber" },
      navUrl: "",
      priority: "optional",
      open: true,
      content: `
        <p>今晚轉換口味，吃點不一樣的</p>
        <p class="text-xs text-slate-500">逛完街放戰利品回飯店，依小孩狀態選餐廳</p>
        <div class="tip-block">
          <strong>🥩 味蕾轉換建議</strong>｜D4 已吃過伊達牛舌<br>
          D5 可選 S-PAL 地下美食街（現烤魚定食・炸豬排・仙台牛燒肉）<br>
          想吃牛舌 → 買善治郎便當回飯店配啤酒
        </div>
        <p>晚餐後漫步回 Grand Bach，用 16F 投幣洗衣機 + 頂樓大浴場放鬆</p>
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
  subtitle: "🐬 水族館 / 草莓二選一",
  emoji: "🐬",
  events: [
    {
      time: "08:00 - 09:15",
      title: "☕ THE MOST BAKERY ＆ COFFEE 東口店 早餐",
      img: "https://sendaiminami-tusin.com/wp-content/uploads/2023/08/img_7984.jpg",
      tag: { text: "🥐 人氣麵包", class: "tag-amber" },
      navUrl: "https://maps.app.goo.gl/FmsKLHRKk3g3z6UDA",
      navName: "THE MOST BAKERY",
      priority: "must",
      open: true,
      content: `
        <p>08:00 開門，麵包香飄出來</p>
        <p class="text-xs text-slate-500">早餐套餐（加價升級）非常划算</p>
        <div class="tip-block">
          🍞 招牌「純生」食麵包柔軟、漢堡與鬆餅受歡迎<br>
          ☕ 自家焙煎咖啡承襲老字號技術，香氣濃郁
        </div>
      `
    },
    {
      time: "09:15 - 09:50",
      title: "輕鬆出發前往仙台郊區 (水族館或草莓園)",
      tag: { text: "🚗 輕鬆車程", class: "tag-teal" },
      navUrl: "",
      priority: "must",
      open: true,
      content: `
        <p>前往郊區，車程只要 30 分鐘</p>
        <div class="tip-block">💡 今日景點集中平地郊區，完全免除拉車疲勞</div>
      `
    },
    {
      time: "10:00 - 12:30",
      title: "晨間二選一：海洋水族館 🐧 OR 溫室採草莓 🍓",
      tag: { text: "🎯 彈性早晨", class: "tag-sky" },
      navUrl: "https://maps.app.goo.gl/BxaETtqtFLNmQoJf8?g_st=ac",
      navName: "仙台海洋森林水族館",
      priority: "must",
      highlight: true,
      open: true,
      content: `
        <p>今天早上，水族館還是草莓園？</p>
        <details>
          <summary>🐬 選擇 A：仙台海洋森林水族館</summary>
          <div>
            <img src="https://www.uminomori.jp/assets/img/top/main_img01.jpg" alt="仙台海洋森林水族館" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p>門票｜成人 ¥2,400 · 幼兒 ¥800</p>
            <p><strong>冬季限定</strong><br><span class="text-slate-500 text-xs">企鵝雪地散步</span></p>
            <p><strong>室內海豚秀</strong><br><span class="text-slate-500 text-xs">防風透光頂棚 + 暖氣，不必吹冷風</span></p>
            <p><strong>閃耀生命之海</strong><br><span class="text-slate-500 text-xs">數萬尾沙丁魚群隨音樂游動</span></p>
            <p><strong>互動摸摸池</strong><br><span class="text-slate-500 text-xs">適合 4 歲幼兒高度</span></p>
            <a href="https://www.google.com/maps/search/?api=1&query=Sendai+Umino+Mori+Aquarium" target="_blank">📍 導航前往</a>
          </div>
        </details>
        <details>
          <summary>🍓 選擇 B：仙台市區溫室採草莓（三選一）</summary>
          <div>
            <p><strong>1. 一苺一笑 松森農場（免預約）</strong></p>
            <img src="https://www.ichigo-issho.jp/wp-content/uploads/2022/12/IMG_4522.jpg" alt="一苺一笑 松森農場" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p><strong>⭐️ 4.4 分</strong><br><span class="text-slate-500 text-xs">40 分鐘吃到飽・北海道煉乳無限續加</span></p>
            <p><span class="text-slate-500 text-xs">優勢：現場排隊制，行程最彈性（建議早上到，大草莓還沒被採光）</span></p>
            <a href="https://maps.app.goo.gl/Q91PEDo22zahngNy5?g_st=ac" target="_blank">📍 導航前往</a>
            <hr class="my-3 border-slate-200">
            <p><strong>2. JR 水果公園仙台荒濱（官網預約）</strong></p>
            <img src="https://jr-fruitpark-sendai.jp/wp-content/uploads/2022/01/strawberry.jpg" alt="JR水果公園仙台荒濱" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p><strong>⭐️ 4.0 分</strong><br><span class="text-slate-500 text-xs">園區大且極乾淨・附設農產市集與大飯店主廚監製餐廳</span></p>
            <p><span class="text-slate-500 text-xs">優勢：有繁中/英文網路介面，適合出發前搞定名額（30 分鐘限制）</span></p>
            <a href="https://maps.app.goo.gl/H3EDkLGrVGBg3Sth9?g_st=ac" target="_blank">📍 導航前往</a>
            <hr class="my-3 border-slate-200">
            <p><strong>3. Berry Planet（燦燦園）</strong></p>
            <img src="https://berryplanet.jp/wp-content/uploads/2021/12/strawberry-farm.jpg" alt="Berry Planet" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
            <p><strong>⭐️ 4.3 分</strong><br><span class="text-slate-500 text-xs">老字號農家・完熟甜度極高・附設網美咖啡廳</span></p>
            <p><span class="text-slate-500 text-xs">優勢：假日必須提早預約，但品質有保障</span></p>
            <a href="https://maps.app.goo.gl/yHuF1t7Vk9s3iPGc8?g_st=ac" target="_blank">📍 導航前往</a>
          </div>
        </details>
        <div class="tip-block">💡 兩個行程都在仙台市區周邊，中午結束後 15–20 分鐘可到仔虎利府店</div>
      `
    },
    {
      time: "12:45 - 14:15",
      title: "極致和牛燒肉午餐 ➔ 【仔虎 利府店】",
      img: "https://matipura.com/CORE/wp-content/uploads/2021/03/DSC00724.jpg",
      tag: { text: "🥩 頂級和牛", class: "tag-amber" },
      navUrl: "https://maps.app.goo.gl/eS1zeHmvNL3zrtuFA",
      navName: "仔虎 利府店",
      priority: "must",
      highlight: true,
      open: true,
      content: `
        <p>頂級和牛燒肉，仙台人氣名店</p>
        <p class="text-xs text-slate-500">早上水族館或草莓園 → 15 分鐘抵達利府店</p>
        <div class="tip-block">
          <strong>🚗 大車親子優勢</strong>｜門口 20 個大型免費平面車位<br>
          店內走道寬、無樓梯、有兒童專屬菜單
        </div>
        <details>
          <summary>🍱 平日 Lunch 超值（附泡菜・湯・沙拉）</summary>
          <div>
            <p><strong>上燒肉午餐</strong><br><span class="text-slate-500 text-xs">油花均勻、肉質細嫩</span></p>
            <p><strong>仔虎牛丼 / 和牛牛筋咖哩（約 ¥1,188）</strong><br><span class="text-slate-500 text-xs">慢火熬煮</span></p>
            <p><strong>冷麵 + 迷你丼組合（約 ¥1,408）</strong><br><span class="text-slate-500 text-xs">迷你丼三選一</span></p>
          </div>
        </details>
        <details>
          <summary>🥩 主食與特色料理</summary>
          <div>
            <p><strong>盛岡式冷麵 / 和風仔虎涼麵（約 ¥1,023）</strong><br><span class="text-slate-500 text-xs">解膩絕配</span></p>
            <p><strong>石燒蒜味飯（約 ¥1,100）</strong><br><span class="text-slate-500 text-xs">香氣濃郁</span></p>
            <p><strong>兒童專用菜單</strong><br><span class="text-slate-500 text-xs">兒童石鍋拌飯（少鹽易入口）</span></p>
          </div>
        </details>
      `
    },
    {
      time: "14:30 - 17:30",
      title: "【Mitsui Outlet Park 仙台港】大血拚",
      img: "https://resources.matcha-jp.com/resize/720x2000/2025/08/24-242139.webp",
      tag: { text: "🛍️ 狂買免提", class: "tag-rose" },
      navUrl: "https://www.google.com/maps/search/?api=1&query=Mitsui+Outlet+Park+Sendai+Port",
      navName: "三井Outlet",
      priority: "must",
      open: true,
      content: `
        <p>三井 Outlet，血拼到底</p>
        <p class="text-xs text-slate-500">主攻 miki HOUSE・GAP Kids 童裝・The North Face・Mont-bell</p>
        <div class="tip-block">
          <strong>🚗 自駕最大優勢</strong>｜戰利品隨時提回後車廂<br>
          不必重提、不用塞滿推車
        </div>
        <div class="tip-block warn">
          🎟️ 開逛前先憑護照至 1F 服務台領外國遊客 Coupon<br>
          部分店家可享額外折扣
        </div>
      `
    },
    {
      time: "18:00 - 19:30",
      title: "返抵飯店，從容打包行李",
      tag: { text: "🧳 零壓力打包", class: "tag-indigo" },
      navUrl: "",
      priority: "must",
      open: true,
      content: `
        <p>今晚把戰利品裝箱</p>
        <p class="text-xs text-slate-500">18:00 返回 Grand Bach，晚餐依狀態就近解決</p>
        <div class="tip-block">💡 19:30 開始分類裝箱：服飾 / 藥妝 / 戰利品，為明日返程預備</div>
      `
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
    subtitle: "✈️ 滿載而歸",
    emoji: "✈️",
    events: [
      {
        time: "10:00 - 10:30",
        title: "飯店退房與裝車",
        tag: { text: "🏡 悠閒早晨", class: "tag-indigo" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>早餐後裝車，準備啟程回家</p>
          <p class="text-xs text-slate-500">收拾物品 → 行李裝上 Minivan → 退房</p>
        `
      },
      {
        time: "10:45 - 13:00",
        title: "【仙台車站 S-PAL】採購伴手禮 + 輕鬆午餐",
        tag: { text: "🛍️ 一站買齊", class: "tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Station",
        navName: "仙台車站",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>仙台車站，最後掃貨</p>
          <p class="text-xs text-slate-500">車停車站連通停車場 → 走室內通道 → 不吹冷風</p>
          <details>
            <summary>🛍️ 伴手禮衝刺清單</summary>
            <div>
              <p><strong>菓匠三全</strong><br><span class="text-slate-500 text-xs">萩之月（卡士達蛋糕）</span></p>
              <p><strong>ずんだ茶寮</strong><br><span class="text-slate-500 text-xs">毛豆泥奶昔・毛豆夾心餅乾</span></p>
              <p><strong>阿部蒲鉾店</strong><br><span class="text-slate-500 text-xs">現炸烤蒲鉾</span></p>
            </div>
          </details>
          <div class="tip-block">
            <strong>🍱 站內午餐</strong>｜S-PAL B1 或 3F「牛舌通 / 壽司通」<br>
            最後的黑毛和牛・炭烤牛舌・新鮮壽司
          </div>
        `
      },
      {
        time: "13:00 - 13:30",
        title: "全平地開車直達仙台機場",
        tag: { text: "🚗 順暢平地", class: "tag-teal" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>全平地 30 分鐘到機場</p>
          <p class="text-xs text-slate-500">仙台車站前 → 仙台東道路 / 仙台南部道路 → 仙台機場 IC</p>
          <div class="tip-block">✨ 全程平地高速，無山路封路風險，確保搭機時間</div>
        `
      },
      {
        time: "13:30 - 14:15",
        title: "加滿油 ➔ Nippon Rent-A-Car 還車",
        tag: { text: "⛽ 輕鬆還車", class: "tag-teal" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>加滿油，還車手續很快</p>
          <p class="text-xs text-slate-500">機場附近指定加油站（保留發票收據）</p>
          <div class="tip-block">
            <strong>13:45 還車</strong>｜歸還便攜安全帶<br>
            搭免費接駁車（3 分鐘）抵達航廈
          </div>
        `
      },
      {
        time: "14:15 - 16:05",
        title: "辦理登機 ➔ 順利返港",
        tag: { text: "✈️ 完美句點", class: "tag-teal" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>14:15 辦理登機，16:05 起飛</p>
          <p class="text-xs text-slate-500">行李託運 → 安檢 → 出境審查</p>
          <div class="tip-block">🎉 7 天 6 夜雪國之旅圓滿完成！</div>
        `
      }
    ]
  }
];