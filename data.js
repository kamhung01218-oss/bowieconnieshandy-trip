/**
 * ============================================================
 *  2027 東北冬季親子溫泉自駕之旅 - 行程數據
 *  版本: 5.16.0（D2 けむすけ燒肉首選 / D3 水車生そば午餐 / D4 塩釜壽司 / D5 Girafe）
 * ============================================================
 */

const winterItineraries = [

  // ==========================================
  // DAY 1 - 抵達仙台（無車）
  // ==========================================
  {
    day: 1,
    dateLabel: "DAY 1 · 2027年1月21日 (週四)",
    id: "抵達仙台-入住市區-小補給",
    title: "抵達仙台 ➔ 入住市區 ➔ 小補給",
    subtitle: "✈️ 雪國初日",
    emoji: "✈️",
    events: [
      {
        time: "14:05 - 14:50",
        id: "落地仙台機場-SDJ-入境手續",
        title: "落地仙台機場 (SDJ) & 入境手續",
        img: "https://hk.wamazing.com/media/wp-content/uploads/sites/5/2024/08/sdjdutyfreeshop_pixta_98589488_M.jpg.webp",
        tag: { text: "🛬 抵達雪國", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Airport",
        navName: "仙台機場",
        links: [{ label: "仙台機場攻略", icon: "📖", url: "https://tohoku.letsgojp.com/archives/739243/" }],
        priority: "must",
        open: true,
        content: `
          <p>14:05 落地，窗外已是靄靄白雪</p>
          <div class="tip-block warn">
            ⏰ 預留 45 分鐘（冬季 + 兩幼童）<br>
            ⚠️ 若拖到 15:00 後 → 改 1F 外帶上車吃
          </div>
        `
      },
      {
        time: "14:50 - 15:30",
        id: "仙台機場美食充電",
        title: "仙台機場美食充電",
        tag: { text: "🍽️ 機場美食", class: "tag-amber" },
        navUrl: "",
        priority: "optional",
        open: true,
        content: `
          <p>搭車前 30 分鐘，先餵飽肚子</p>
          <details>
            <summary>🍽️ 三層美食速覽</summary>
            <div>
              <p><strong>1F 外帶</strong>｜冠舌屋牛舌熱狗・飯糰</p>
              <p><strong>2F 輕食</strong>｜みちのくラウンジ・ずんだ茶寮毛豆奶昔</p>
              <p><strong>3F 坐著吃</strong>｜FLATWHITE・M.M.C 咖哩飯</p>
            </div>
          </details>
          <div class="tip-block">💡 趕時間選 1F，有時間坐 2F / 3F</div>
        `
      },
      {
        time: "15:30 - 16:10",
        id: "搭仙台機場アクセス線到仙台站",
        title: "搭仙台機場アクセス線到仙台站",
        img: "https://i.meee.com.tw/VQfqIf8.webp",
        tag: { text: "🚃 機場電車", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Airport+Station",
        navName: "仙台機場站",
        links: [{ label: "機場電車路線攻略", icon: "📌", url: "https://nicklee.tw/2331/sendai-airport-access/" }],
        priority: "must",
        open: true,
        content: `
          <p>機場 ➔ 仙台站，25 分鐘直達</p>
          <div class="tip-block">🎫 成人 ¥660 / 兒童 ¥330，每 15–20 分鐘一班</div>
        `
      },
      {
        time: "16:10 - 16:30",
        id: "步行到相鐵FRESA-INN-仙台",
        title: "步行到 相鐵 FRESA INN 仙台",
        img: "https://i.meee.com.tw/hmG2rTw.webp",
        tag: { text: "🚶 步行5分鐘", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=相鉄フレッサイン仙台",
        navName: "相鐵 FRESA INN 仙台",
        priority: "must",
        open: true,
        content: `
          <p>仙台站西口 ➔ 相鐵 FRESA INN，步行 5 分鐘</p>
          <div class="tip-block">🚶 走地下街不用吹冷風</div>
        `
      },
      {
        time: "16:30 - 17:00",
        id: "入住相鐵FRESA-INN-仙台",
        title: "入住 相鐵 FRESA INN 仙台",
        img: "https://i.meee.com.tw/MCb79k4.jpg",
        tag: { text: "🏨 第1晚", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=相鉄フレッサイン仙台",
        navName: "相鐵 FRESA INN 仙台",
        priority: "must",
        open: true,
        content: `
          <p>仙台站旁，只住 1 晚</p>
          <div class="tip-block">
            💡 今晚沒車，所有行李放房間<br>
            🚗 明天 08:00 仙台站前店取車
          </div>
        `
      },
      {
        time: "17:30 - 19:00",
        id: "晚餐-伊達の牛たん本舗-本店",
        title: "晚餐 ➔ 伊達の牛たん本舗 本店",
        img: "https://tohoku365.com/desk_jp/wp/wp-content/uploads/2016/06/dateno.jpg",
        tag: { text: "🥩 必吃名店", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/3pwjdGMZZeGCRq1MA",
        navName: "伊達牛舌本舗 本店",
        priority: "must",
        open: true,
        content: `
          <p>仙台必吃！厚切牛舌的極致</p>
          <div class="tip-block warn">
            ⏰ 17:30 進店最保險，19:00 前完食<br>
            若小孩車上就喊餓 → 毫不猶豫直接進
          </div>
          <details>
            <summary>👑 大人招牌</summary>
            <div>
              <p>註冊商標「芯舌（芯たん）」</p>
              <p>厚切但極軟嫩多汁，定食麥飯可免費續碗一次</p>
            </div>
          </details>
          <details>
            <summary>👦 適合 4 歲小孩</summary>
            <div>
              <p>燉得軟爛的「燉牛舌」和「牛舌咖哩」</p>
              <p>牛舌漢堡排 · 烤雞肉串 · 鮭魚卵親子飯 · 魚翅拉麵</p>
            </div>
          </details>
        `
      },
      {
        time: "19:00 - 21:00",
        id: "晚上小補給",
        title: "晚上購物補給（仙台站周邊 / 一番町）",
        tag: { text: "🛍️ 購物時間", class: "tag-rose" },
        navUrl: "",
        priority: "optional",
        open: true,
        content: `
          <p>吃完牛舌，19:00 開始輕鬆購物</p>
          <div class="tip-block warn">
            <strong>⏰ 19:00 後的營業時間</strong><br>
            • 3COINS PARCO 店｜20:00 關，要先去<br>
            • Daiso ヨドバシ仙台店｜21:00 關<br>
            • UNIQLO 仙台站前店｜21:00 關<br>
            • 唐吉訶德 仙台駅西口本店｜深夜營業
          </div>
          <details>
            <summary>🛍️ 購物清單與導航</summary>
            <div>
              <p>👕 <strong>UNIQLO 仙台站前店</strong>｜Heattech、羽絨、小孩內搭 <a href="https://maps.app.goo.gl/kVzzvRraes6pTDWu7?g_st=ac" target="_blank">📍 導航</a></p>
              <p>🧥 <strong>GU 仙台店</strong>｜平價服飾、保暖配件 <a href="https://maps.app.goo.gl/odrpKX8m21PquvLt9?g_st=ac" target="_blank">📍 導航</a></p>
              <p>🪙 <strong>3COINS 仙台 PARCO 店</strong>｜折疊袋、壓縮袋（20:00 關，要先去） <a href="https://maps.app.goo.gl/uFUSHdEotSbewYDZ9" target="_blank">📍 導航</a></p>
              <p>🏬 <strong>Daiso ヨドバシ仙台店</strong>｜百元商店 <a href="https://maps.app.goo.gl/Mg38a3Q4dVi7U38D7?g_st=ac" target="_blank">📍 導航</a></p>
              <p>🐧 <strong>唐吉訶德 仙台駅西口本店</strong>｜藥妝、零食、暖暖包（深夜） <a href="https://maps.app.goo.gl/6Ti8UJyEa1tFreBW7?g_st=ac" target="_blank">📍 導航</a></p>
              <p>✨ <strong>THE GALLERY BOX</strong>｜仙台 PARCO 4F：Salomon・MM6 等限量聯名 <a href="https://www.google.com/maps/search/?api=1&query=Sendai+PARCO" target="_blank">📍 導航</a></p>
            </div>
          </details>
          <div class="tip-block">💡 小孩若累，3COINS + UNIQLO 買完就撤退，唐吉訶德改 D7 補</div>
        `
      }
    ]
  },

  // ==========================================
  // DAY 2 - 取車 → 客美多 → 狐狸村 → 白石 → 銀山 → 天童
  // ==========================================
  {
    day: 2,
    dateLabel: "DAY 2 · 2027年1月22日 (週五)",
    id: "取車-狐狸村-白石午餐-銀山溫泉-天童",
    title: "取車 ➔ 狐狸村 ➔ 白石午餐 ➔ 銀山溫泉 ➔ 天童 Check-in",
    subtitle: "🦊 狐狸、溫麵與銀山夜景之日",
    emoji: "🦊",
    events: [
      {
        time: "08:00 - 08:45",
        id: "司機取車與泊車",
        title: "司機取車，泊回酒店附近",
        img: "https://i.meee.com.tw/rkIZxfa.jpg",
        tag: { text: "🚗 取車", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Nippon+Rent-A-Car+仙台駅前店",
        navName: "Nippon Rent-A-Car 仙台站前店",
        priority: "must",
        open: true,
        content: `
          <p>司機步行去仙台站前店取車，再開回酒店附近停泊</p>
          <div class="tip-block warn">
            <strong>✅ 取車必檢</strong><br>
            • 4WD + 雪胎（胎紋 ≥ 5mm）<br>
            • 2 套兒童安全帶裝第二排<br>
            • 4 大箱 + 推車塞得下<br>
            • ETC 卡已裝好、加滿油
          </div>
          <div class="tip-block warn">
            <strong>🧰 記得帶上車的配件</strong><br>
            • 車用夾 / 手機架（夾冷氣出風口）<br>
            • 雪刮 + 雪刷（清車頂、車窗積雪）<br>
            • 三角警示牌（確認車內是否已附）<br>
            • 拖車繩 / 小雪鏟（陷雪自救用）
          </div>
          <div class="tip-block">
            <strong>🔍 上車前檢查</strong><br>
            • 大燈、方向燈、霧燈全部正常<br>
            • 雨刷膠條無破損、玻璃水加滿<br>
            • 車內暖氣、除霧功能正常<br>
            • 油箱已加滿（還車時同樣要加滿）
          </div>
          <div class="tip-block">💡 09:00 準時從酒店出發，全家上車</div>
        `
      },
      {
        time: "09:00 - 09:45",
        id: "早餐-客美多咖啡",
        title: "早餐 ➔ 客美多咖啡 仙台富澤店",
        img: "https://www.fukushige1219.co.jp/wp-content/uploads/example2-3.jpg",
        tag: { text: "☕ 悠閒晨活", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/SYGcfygAcH7gamz2A",
        navName: "客美多咖啡 仙台富澤店",
        priority: "must",
        open: true,
        content: `
          <p>名古屋來的早餐名店，開車 15 分鐘</p>
          <div class="tip-block warn">
            <strong>⏰ 09:45 出發</strong>｜客美多 → 狐狸村，約 1 小時 15 分鐘
          </div>
        `
      },
      {
        time: "09:45 - 11:00",
        id: "開車前往宮城藏王狐狸村",
        title: "開車前往【宮城藏王狐狸村】",
        tag: { text: "🚗 雪地自駕", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Miyagi+Zao+Fox+Village",
        navName: "宮城藏王狐狸村",
        priority: "must",
        open: true,
        content: `
          <p>客美多 → 狐狸村，車程約 1 小時 15 分鐘</p>
          <div class="tip-block warn">
            <strong>🚗 山路結冰</strong>｜最後 15 分鐘為山路<br>
            必用 4WD + 雪胎，下坡善用低速檔
          </div>
          <div class="tip-block">💡 11:00 前抵達狐狸村，避開中午團客</div>
        `
      },
      {
        time: "11:00 - 13:00",
        id: "宮城藏王狐狸村",
        title: "【宮城藏王狐狸村】雪地互動",
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
            <strong>⚠️ 軍訓級要求</strong>｜員工對幼童安全把關極嚴<br>
            只要有一絲掙脫、奔跑、哭鬧 → 會嚴厲制止甚至請離場
          </div>
          <details>
            <summary>🚨 4 歲幼兒互動守則</summary>
            <div>
              <p>互動禁忌｜禁奔跑、蹲下、伸手摸狐狸</p>
              <p>穿著禁忌｜禁飄逸長裙、吊繩、流蘇、黑色塑膠袋</p>
              <p>餵食規定｜只能在指定高台區拋擲專用飼料</p>
            </div>
          </details>
          <details>
            <summary>📸 體驗與實用提醒</summary>
            <div>
              <p>抱狐狸體驗｜國中以上限定（約 ¥700/次），4 歲無法參加</p>
              <p>推車｜園區多雪地坡道階梯，完全推不動</p>
              <p>停留時間｜1.5–2 小時非常充裕</p>
            </div>
          </details>
        `
      },
      {
        time: "13:00 - 13:40",
        id: "開車前往白石",
        title: "開車前往白石市區",
        tag: { text: "🚗 40分鐘", class: "tag-teal" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>狐狸村 → 白石市區，約 30–40 分鐘</p>
          <div class="tip-block">💡 13:40 前到餐廳，避開午餐最後點餐時間</div>
        `
      },
      {
        time: "13:40 - 14:30",
        id: "白石午餐-傳統名物白石溫麵",
        title: "白石午餐 ➔ 傳統名物「白石溫麵」",
        tag: { text: "🍜 在地名物", class: "tag-amber" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>白石名物，溫麵三選一</p>
          <div class="tip-block warn">
            <strong>⏰ 時間提醒</strong>｜光庵最後點餐 14:15，14:30 前離開白石
          </div>
          <details>
            <summary>🌟 手延白石溫麵 光庵（推薦）</summary>
            <div>
              <img src="https://oniwa.garden/wp-content/img/04_miyagi/2604_shiroishi_tsurigane/02.jpeg" alt="手延白石溫麵 光庵" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
              <p><strong>招牌冷麵：三種醬汁溫麵</strong>｜經典鰹魚醬油・濃郁胡麻・當地核桃醬</p>
              <p><strong>招牌熱麵</strong>｜特製雞湯溫麵・葛粉勾芡蔬菜溫麵</p>
              <a href="https://maps.app.goo.gl/wwgroAhTgSeapcXXA?g_st=ac" target="_blank">📍 導航前往</a>
            </div>
          </details>
          <details>
            <summary>🥢 白石うーめん やまぶき亭</summary>
            <div>
              <img src="https://shiroishi-navi.jp/wp-content/uploads/2018/03/shzZkbG4791p6nR3sNXf8tnzqz1kl0.jpg" alt="白石うーめん やまぶき亭" class="lazy-fade w-full h-32 object-cover rounded-lg mb-2" loading="lazy" decoding="async">
              <p><strong>溫麵三昧</strong>｜芝麻・核桃・醬油三種沾醬</p>
              <p><strong>必吃</strong>｜天ぷらうーめん（天婦羅溫麵）</p>
              <a href="https://maps.app.goo.gl/VudKdyUMEgfc5CKJ8?g_st=ac" target="_blank">📍 導航前往</a>
            </div>
          </details>
          <div class="tip-block">💡 時間鬆動可慢慢吃，但記得 14:30 要離開白石</div>
        `
      },
      {
        time: "14:30 - 15:30",
        id: "開車前往大正浪漫館",
        title: "開車前往大正浪漫館（銀山溫泉）",
        tag: { text: "🚗 1小時", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=大正浪漫館+銀山溫泉",
        navName: "大正浪漫館",
        priority: "must",
        open: true,
        content: `
          <p>白石 → 大正浪漫館，約 1 小時</p>
          <div class="tip-block warn">
            <strong>🅿️ 停車</strong>｜必須將車停在大正浪漫館停車場或保安指定停車場<br>
            <strong>🚫 不要直接開進溫泉街</strong>｜冬季全面交通管制
          </div>
        `
      },
      {
        time: "15:30 - 15:50",
        id: "大正浪漫館停車取票",
        title: "大正浪漫館停車、取票、等候",
        tag: { text: "🅿️ 準備接駁", class: "tag-teal" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>停好車，上個廁所，準備搭接駁車</p>
          <div class="tip-block warn">
            <strong>⏰ 15:50 前完成</strong>｜請在預約時間前抵達巴士站，並於指定時間乘坐接駁巴士
          </div>
        `
      },
      {
        time: "16:00 - 17:20",
        id: "極重要銀山溫泉夢幻夜景",
        title: "【極重要】銀山溫泉夢幻夜景",
        img: "https://mimigo.tw/wp-content/uploads/20230105083619_51.jpg",
        tag: { text: "🏮 大正浪漫", class: "tag-sky" },
        navUrl: "https://maps.app.goo.gl/R5FCE8fhY6jMzqjr7?g_st=ac",
        navName: "銀山溫泉",
        links: [
          { label: "🚌 接駁車預約（官方）", icon: "🎫", url: "https://www.ginzanonsen.jp/blog/archives/524" },
          { label: "📖 交通管制攻略（參考）", icon: "📌", url: "https://nicklee.tw/3241/ginzan-onsen-control/#%E6%8E%A5%E9%A7%81%E8%BB%8A%E8%A1%8C%E9%A7%9B%E6%97%A5%E6%9C%9F%E8%88%87%E9%A0%90%E7%B4%84%E6%97%A5%E6%9C%9F" }
        ],
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>傍晚的銀山，像走進大正時代</p>
          <p class="text-xs text-slate-500">16:00 搭接駁車 → 銀山散步 → 17:20 指定回程</p>
          <div class="tip-block warn">
            <strong>🚌 預約規則</strong>｜全預約制，回程為指定班次（去程後 1.5 小時）<br>
            乘車日 13 天前開放預約，建議設鬧鐘搶票<br>
            票價 ¥1,500/人（暫定），現場不賣票，錯過只能排隊候補
          </div>
          <div class="tip-block danger">
            <strong>❄️ 極寒準備</strong>｜入夜零下，貼暖暖包<br>
            ⚠️ 木棧道與橋面易結冰，穿防滑雪靴、緊牽小孩<br>
            <strong>🚫 絕對不要步行往返</strong>｜冬季人行道無法通行，危險
          </div>
          <details>
            <summary>📋 接駁車流程與規則</summary>
            <div>
              <p><strong>1. 停車</strong>｜車停大正浪漫館停車場或保安指定停車場</p>
              <p><strong>2. 預約</strong>｜提前在網上預約接駁巴士（乘車日 13 天前開放）</p>
              <p><strong>3. 去程</strong>｜在預約時間前抵達巴士站，搭乘指定班次（車程約 10 分鐘）</p>
              <p><strong>4. 回程</strong>｜原則上為去程後 1 小時 20 分至 1.5 小時，指定班次優先上車</p>
              <p><strong>5. 錯過回程</strong>｜只能現場排隊等候補位，有空位才能上車</p>
            </div>
          </details>
        `
      },
      {
        time: "17:20 - 18:00",
        id: "返回大正浪漫館",
        title: "搭指定班次回程 ➔ 大正浪漫館",
        tag: { text: "🚌 回程", class: "tag-teal" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `<p>17:20 搭接駁車回大正浪漫館，準備開車去天童</p>`
      },
      {
        time: "18:00 - 18:40",
        id: "開車前往天童瀧之湯",
        title: "開車前往天童瀧之湯",
        tag: { text: "🚗 40分鐘", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        priority: "must",
        open: true,
        content: `<p>大正浪漫館 → 天童瀧之湯，約 40 分鐘</p>`
      },
      {
        time: "18:40 - 19:30",
        id: "入住天童瀧之湯-第1晚",
        title: "入住 微笑の宿 瀧之湯（第1晚）",
        img: "https://sendai-kouiki-mice.com/wp-content/uploads/2024/12/pic-hohoeminoyado-02.jpg",
        tag: { text: "🏨 溫泉名宿", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        priority: "must",
        open: true,
        content: `
          <p>18:40 抵達瀧之湯 Check-in，放行李休息一下</p>
          <div class="tip-block">
            <strong>🧳 入住流程</strong>｜18:40 Check-in<br>
            <strong>♨️ 貸切風呂</strong>｜明天 1/23 彈性安排<br>
            <strong>🍱 懷石晚餐</strong>｜明天 1/23 18:00<br>
            <strong>🍳 自助早餐</strong>｜明天 1/23 07:00–09:00
          </div>
        `
      },
      {
        time: "19:30 - 21:00",
        id: "天童市區晚餐",
        title: "晚餐 ➔ 大衆焼肉けむすけ 天童店（首選）",
        tag: { text: "🥩 在地燒肉", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/P3JM6zwqwNaGTmgTA?g_st=ac",
        navName: "大衆焼肉けむすけ 天童店",
        priority: "must",
        open: true,
        content: `
          <p>今晚瀧之湯不含晚餐，去天童市區吃燒肉</p>
          <details>
            <summary>🥩 大衆焼肉けむすけ 天童店（首選）</summary>
            <div>
              <p><strong>三大招牌</strong>｜名物アカ（哈拉米）・名物シロ（豬大腸）・炙り牛寿司</p>
              <p><strong>隱藏靈魂</strong>｜桌上檸檬沙瓦水龍頭（1 小時無限暢飲）</p>
              <a href="https://maps.app.goo.gl/P3JM6zwqwNaGTmgTA?g_st=ac" target="_blank">📍 導航前往</a>
            </div>
          </details>
          <details>
            <summary>🍣 いろは寿司（備選）</summary>
            <div>
              <p><strong>頂級壽司</strong>｜職人現捏「特上握壽司」（約 ¥2,000 起）</p>
              <p><strong>招牌熟食</strong>｜鰻魚飯「鰻重」（約 ¥2,500）</p>
              <a href="https://maps.app.goo.gl/2FAqTdrbNJTeeQPu9?g_st=ac" target="_blank">📍 導航前往</a>
            </div>
          </details>
          <div class="tip-block">💡 吃飽回飯店泡大浴場，明天 07:00 早餐、07:30 出發去藏王</div>
        `
      }
    ]
  },

  // ==========================================
  // DAY 3 - 藏王樹冰 → 水車生そば → げんキッズ → 瀧之湯
  // ==========================================
  {
    day: 3,
    dateLabel: "DAY 3 · 2027年1月23日 (週六)",
    id: "藏王樹冰-水車生そば-げんキッズ-瀧之湯",
    title: "藏王樹冰 ➔ 水車生そば ➔ げんキッズ ➔ 瀧之湯",
    subtitle: "☃️ 樹冰、蕎麥與溫泉之日",
    emoji: "☃️",
    events: [
      {
        time: "07:00 - 07:30",
        id: "瀧之湯自助早餐",
        title: "瀧之湯自助早餐（07:00–07:30）",
        img: "https://i.meee.com.tw/RmsErhO.jpg",
        tag: { text: "🍳 酒店早餐", class: "tag-amber" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        priority: "must",
        open: true,
        content: `
          <p>瀧之湯餐廳自助早餐，山形食材與鄉土料理</p>
          <div class="tip-block">
            <strong>⏰ 用餐時間</strong>｜07:00 開始，<strong>07:30 必須離座</strong><br>
            酒店早餐供應到 09:00，但今天只能吃 30 分鐘
          </div>
          <div class="tip-block">
            <strong>🍽️ 必吃亮點</strong><br>
            • 山形名物「鳥中華」<br>
            • 芋煮（山形鄉土鍋物）<br>
            • 現場烤法式吐司<br>
            • 山形縣產「雪若丸」米飯
          </div>
          <div class="tip-block warn">
            <strong>🥐 快速攻略</strong>｜先拿鳥中華、芋煮、法式吐司，飲品裝保溫瓶帶走<br>
            ⚠️ 07:25 起身收東西，07:30 準時上車
          </div>
          <div class="tip-block danger">
            <strong>⏰ 終極取捨</strong>｜如果 07:00 無法入座，或餐廳排隊過長<br>
            → <strong>直接放棄酒店早餐</strong><br>
            → <strong>馬上到便利店 / 麵包店買早餐</strong>（天童市區 7-11 / Lawson / 麵包店，前晚可先看好位置）<br>
            → 買完直接上車，<strong>07:15 出發</strong>，車上吃
          </div>
          <div class="tip-block">💡 前一晚可先買好麵包、飯糰、牛奶放房間，作為「搶不到早餐」的後備方案</div>
        `
      },
      {
        time: "07:30 - 08:15",
        id: "開車前往藏王纜車站",
        title: "開車前往藏王纜車站（8:15 前到）",
        img: "https://cclalice.com/wp-content/uploads/2024/12/DSC09203-1170x780.jpg",
        tag: { text: "🚗 雪地山路", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Zao+Ropeway",
        navName: "藏王索道",
        links: [{ label: "藏王纜車優先票訂票", icon: "🎫", url: "https://zaoropeway.co.jp/winter/ticket_cn.php#juhyo" }],
        priority: "must",
        open: true,
        content: `
          <p>瀧之湯 → 藏王纜車山麓站，約 45 分鐘</p>
          <div class="tip-block warn">
            <strong>⏰ 08:15 前必須抵達</strong>｜停車場約 07:30 開放，8:30 後山麓站停車場極可能已滿<br>
            最後 15–20 分鐘為爬坡連續彎道，小心駕駛
          </div>
          <div class="tip-block danger">
            <strong>🅿️ 停車場現實</strong>｜旺季週末 8:00 過後第一停車場就可能滿車<br>
            若山麓站滿場，需停到較遠的橫倉第三停車場再走回來
          </div>
        `
      },
      {
        time: "08:15 - 08:30",
        id: "纜車站排隊等首班",
        title: "纜車站排隊、等首班纜車（08:30 發車）",
        tag: { text: "🚠 準備上山", class: "tag-sky" },
        navUrl: "https://zaoropeway.co.jp/winter/ticket_cn.php#juhyo",
        navName: "藏王纜車優先票",
        links: [{ label: "藏王纜車優先票訂票", icon: "🎫", url: "https://zaoropeway.co.jp/winter/ticket_cn.php#juhyo" }],
        priority: "must",
        open: true,
        content: `
          <p>08:15 到售票處/優先隊伍排隊，準備搭 08:30 首班</p>
          <div class="tip-block warn">
            <strong>🎟️ 優先票使用方式</strong><br>
            • 優先票只保障「山麓站 → 樹冰高原站」這段上行<br>
            樹冰高原轉乘山頂線、下山回程，仍需排一般隊伍<br>
            • 票上乘車時間僅供參考，不保證該分鐘上車<br>
            • 購買後除纜車停駛外，一般不能取消或退款
          </div>
          <div class="tip-block danger">
            <strong>⚠️ 搶不到優先票的 Plan B</strong><br>
            → <strong>放棄酒店早餐，07:15 直接出發</strong><br>
            → 08:00 前到纜車站排當日券一般隊伍<br>
            旺季一般隊伍可能等待 60–90 分鐘以上
          </div>
          <div class="tip-block">💡 上個廁所、穿好保暖裝備，準備衝第一班</div>
        `
      },
      {
        time: "08:30 - 12:00",
        id: "搭乘雙段纜車登頂-觀賞震撼藏王樹冰",
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
          <div class="tip-block warn">
            <strong>🎟️ 優先票搶票</strong>｜搭乘日前 7 天日本時間 00:00 釋出<br>
            你的搭乘日 1/23 → 開賣時間 香港 1/15 23:00
          </div>
          <div class="tip-block danger">
            <strong>⚠️ 山頂安全（-20℃）</strong><br>
            🥶 零皮膚外露：毛帽 + 圍脖 + 護目鏡<br>
            ⛸️ 地藏段結冰：必穿冰爪、緊牽小孩<br>
            🏃 風雪打臉痛 = 立即撤退
          </div>
          <div class="tip-block">
            <strong>📸 拍照亮點</strong>｜纜車靠窗位 · 地藏菩薩像 · 山頂餐廳落地窗前<br>
            <strong>帶現金</strong>｜山上小攤只收現金
          </div>
          <div class="tip-block">💡 12:00 下山，12:30 到天童市區吃水車生そば</div>
        `
      },
      {
        time: "12:30 - 14:00",
        id: "午餐-手打水車生そば",
        title: "午餐 ➔ 手打 水車生そば",
        tag: { text: "🍜 在地名物", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/XvHHsWwn3RNpx67m6?g_st=ac",
        navName: "手打 水車生そば",
        priority: "must",
        open: true,
        content: `
          <p>藏王下山後直接到天童市區，12:30 入座避開人潮</p>
          <div class="tip-block">
            <strong>🍜 必吃</strong>｜鳥中華（鰹魚醬油湯 + 拉麵 + 雞肉 + 天婦羅碎屑）<br>
            <strong>🍜 手打蕎麥</strong>｜石臼研磨，粗麵條、超有咬口
          </div>
          <div class="tip-block">💡 14:00 吃完，開車 5–10 分鐘去 げんキッズ</div>
        `
      },
      {
        time: "14:00 - 16:00",
        id: "子育て未来館-げんキッズ",
        title: "子育て未来館 げんキッズ（玩樂）",
        images: [
          "https://i.meee.com.tw/4gyr7IX.jpg",
          "https://i.meee.com.tw/95bdFQ5.jpg"
        ],
        tag: { text: "🎠 室內遊戲館", class: "tag-sky" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=子育て未来館+げんキッズ",
        navName: "子育て未来館 げんキッズ",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>天童市區的室內兒童館，4 歲小孩放電好地方</p>
          <div class="tip-block warn">
            <strong>🕐 玩樂時間</strong>｜14:00 進場，玩到 16:00（約 2 小時）<br>
            午餐已在水車生そば吃飽，這裡專心放電
          </div>
          <div class="tip-block">
            <strong>🎠 館內設施</strong><br>
            • 大型攀爬架、溜滑梯、彈跳床<br>
            • 積木區、繪本區、扮家家酒<br>
            • 幼兒專區（0–3 歲軟墊區）<br>
            • 室內溫暖，不用吹冷風
          </div>
          <div class="tip-block">
            <strong>💰 費用</strong>｜免費入場（部分設施可能收費）<br>
            <strong>🕐 營業</strong>｜09:00–19:00（週六有開）<br>
            <strong>🅿️ 停車</strong>｜免費停車場
          </div>
        `
      },
      {
        time: "16:00 - 16:30",
        id: "返回瀧之湯-第2晚",
        title: "返回 瀧之湯（第2晚）",
        img: "https://sendai-kouiki-mice.com/wp-content/uploads/2024/12/pic-hohoeminoyado-02.jpg",
        tag: { text: "🏨 溫泉名宿", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        priority: "must",
        open: true,
        content: `
          <p>16:00 前返回瀧之湯，準備泡湯</p>
          <div class="tip-block">
            <strong>♨️ 貸切風呂</strong>｜16:30 彈性安排<br>
            <strong>🍱 懷石晚餐</strong>｜18:00 開始<br>
            <strong>🍳 自助早餐</strong>｜明天 1/24 07:00–09:00
          </div>
        `
      },
      {
        time: "16:30 - 20:00",
        id: "貸切風呂彈性與懷石晚餐",
        title: "貸切風呂（彈性）＋ 懷石晚餐",
        img: "https://www.nipponsensor.net/wp-content/uploads/2025/08/%E5%BE%AE%E7%AC%91%E4%B9%8B%E5%AE%BF%E7%80%A7%E4%B9%8B%E6%B9%AF-04.jpg",
        tag: { text: "♨️ 彈性泡湯", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>貸切風呂改為彈性安排，不強求</p>
          <div class="tip-block">
            <strong>♨️ 貸切風呂</strong>｜16:30 如有空位就泡，沒有就改泡大浴場<br>
            <strong>🍱 懷石晚餐</strong>｜18:00 開始（固定）
          </div>
          <div class="tip-block">💡 小孩若累，可直接泡大浴場，早點休息</div>
        `
      }
    ]
  },

  // ==========================================
  // DAY 4 - 瀧之湯 → Spring Valley → 塩釜壽司 → Dormy Inn → 炸豬扒
  // ==========================================
  {
    day: 4,
    dateLabel: "DAY 4 · 2027年1月24日 (週日)",
    id: "Spring-Valley-塩釜壽司-Dormy-Inn第1晚",
    title: "Spring Valley 玩雪 ➔ 塩釜壽司 ➔ 入住 Dormy Inn 仙台海邊",
    subtitle: "⛷️ 玩雪、壽司與炸豬扒之日",
    emoji: "⛷️",
    events: [
      {
        time: "07:30 - 09:30",
        id: "瀧之湯自助早餐與退房",
        title: "瀧之湯自助早餐 + 退房",
        img: "https://i.meee.com.tw/RmsErhO.jpg",
        tag: { text: "🍳 早餐 + 退房", class: "tag-amber" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        priority: "must",
        open: true,
        content: `
          <p>今天不用趕，悠閒吃飽再退房</p>
          <div class="tip-block">
            <strong>⏰ 用餐時間</strong>｜07:30 入座，慢慢吃到 09:00<br>
            酒店早餐供應 07:00–09:00，今天可以吃到飽
          </div>
          <div class="tip-block">
            <strong>🍽️ 必吃亮點</strong><br>
            • 山形名物「鳥中華」<br>
            • 芋煮（山形鄉土鍋物）<br>
            • 現場烤法式吐司<br>
            • 山形縣產「雪若丸」米飯
          </div>
          <div class="tip-block warn">
            <strong>🧳 退房流程</strong>｜09:00 回房收行李 → 09:15 下樓辦退房 → 09:30 上車出發<br>
            ⚠️ 行李前一晚先整理好，早上只需收牙刷、睡衣
          </div>
          <div class="tip-block">💡 小孩吃飽、上完廁所再上車，往 Spring Valley 車程 1 小時 15 分鐘</div>
        `
      },
      {
        time: "09:30 - 10:45",
        id: "退房出發前往Spring-Valley",
        title: "開車前往 Spring Valley 泉高原",
        img: "https://lovetogo.tw/201802-tohoku/spring-valley/photo/20180204-1124-0289.jpg",
        tag: { text: "🚗 雪地自駕", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Spring+Valley+Izumi+Kogen",
        navName: "Spring Valley 仙台泉",
        priority: "must",
        open: true,
        content: `
          <p>09:30 退房後直接出發</p>
          <p class="text-xs text-slate-500">天童 → Spring Valley，車程約 1 小時 15 分鐘</p>
          <div class="tip-block warn">
            <strong>🚗 週日走高速</strong>｜東北自動車道 → 泉 PA 智能 IC<br>
            除雪層級最高、彎道平緩
          </div>
        `
      },
      {
        time: "10:45 - 13:30",
        id: "雪之冒險王國玩雪放電與滑雪場午餐",
        title: "【雪之冒險王國】玩雪放電",
        img: "https://lovetogo.tw/201802-tohoku/spring-valley/photo/20180204-1310-0344.jpg",
        tag: { text: "☃️ 玩雪放電", class: "tag-sky" },
        navUrl: "",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>雪之冒險王國，4 歲小孩的放電場</p>
          <p class="text-xs text-slate-500">10:45 進場，玩到 13:30（約 2.75 小時）</p>
          <div class="tip-block warn">
            <strong>🎟️ 票價與營業</strong><br>
            假日｜4 歲 + 陪同家長皆 ¥2,000（網購 ¥1,500）<br>
            平日｜玩雪專區不開放，全場免門票，單租雪盆 ¥300
          </div>
          <div class="tip-block">
            <strong>🍜 場內輕食</strong>｜12:00 左右簡單吃拉麵 / 咖哩，不要吃太飽<br>
            14:15 後去塩釜港吃迴鮮寿司
          </div>
          <details>
            <summary>🎯 3 大必玩</summary>
            <div>
              <p>旋轉雪盆｜像雪地旋轉木馬，最安全</p>
              <p>魔毯滑雪盆｜電動傳送帶上坡，省小孩體力</p>
              <p>雪地夾鴨子｜帶「雪球夾」模具，放電又好玩</p>
            </div>
          </details>
          <details>
            <summary>⚠️ 3 大避坑重點</summary>
            <div>
              <p>別帶推車｜雪地推不動，改讓小孩坐雪盆裡拉著走</p>
              <p>備兩雙手套｜玩雪手套極易濕透</p>
              <p>預防上廁所｜連身雪衣極難脫</p>
            </div>
          </details>
        `
      },
      {
        time: "14:15 - 15:30",
        id: "午餐-廻鮮寿司塩釜港",
        title: "午餐 ➔ 廻鮮寿司塩釜港（或 Sushi Tetsu）",
        tag: { text: "🍣 迴轉壽司", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/uRJzxcNPM6hTx3vW9",
        navName: "廻鮮寿司塩釜港 塩釜店",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>滑雪場 → 塩釜港，約 40 分鐘</p>
          <div class="tip-block warn">
            <strong>⏰ 14:00 後錯開人潮</strong>｜迴鮮寿司塩釜港人氣高，避開午餐高峰
          </div>
          <details>
            <summary>🍣 廻鮮寿司塩釜港（首選）</summary>
            <div>
              <p><strong>地址</strong>｜塩釜港周邊</p>
              <a href="https://maps.app.goo.gl/uRJzxcNPM6hTx3vW9" target="_blank">📍 導航前往</a>
            </div>
          </details>
          <details>
            <summary>🍣 塩竈すし哲 本店（人少，如早到）</summary>
            <div>
              <p><strong>優勢</strong>｜排隊較少，適合早到</p>
              <a href="https://maps.app.goo.gl/2Gf5Qsfc26vSLUYN8?g_st=ac" target="_blank">📍 導航前往</a>
            </div>
          </details>
          <div class="tip-block">💡 15:30 吃完回 Dormy Inn check in</div>
        `
      },
      {
        time: "15:30 - 15:45",
        id: "開車前往Dormy-Inn-仙台海邊",
        title: "開車回 Dormy Inn（塩釜港 → 仙台港）",
        tag: { text: "🚗 15分鐘", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Dormy+Inn+EXPRESS+仙台海辺",
        navName: "Dormy Inn EXPRESS 仙台海邊",
        priority: "must",
        open: true,
        content: `
          <p>塩釜港 → Dormy Inn 仙台海邊，約 15 分鐘</p>
          <div class="tip-block">💡 15:45 抵達，快速 check in</div>
        `
      },
      {
        time: "15:45 - 16:00",
        id: "入住Dormy-Inn-EXPRESS-仙台海邊-第1晚",
        title: "入住 Dormy Inn EXPRESS 仙台海邊（第1晚）",
        img: "https://i.meee.com.tw/NAO5z3M.jpg",
        tag: { text: "🏨 海邊飯店", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Dormy+Inn+EXPRESS+仙台海辺",
        navName: "Dormy Inn EXPRESS 仙台海邊",
        priority: "must",
        open: true,
        content: `
          <p>15:45 抵達 Dormy Inn，快速 check in 放行李</p>
          <div class="tip-block">
            <strong>♨️ 天然大浴場</strong>｜晚上可泡湯<br>
            <strong>🍜 21:30 免費夜鳴拉麵</strong><br>
            <strong>🅿️ 停車</strong>｜飯店附設停車場
          </div>
        `
      },
      {
        time: "16:00 - 18:00",
        id: "飯店休息與海邊散步",
        title: "休息 / 大浴場 / Outlet（彈性）",
        tag: { text: "♨️ 悠閒時光", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Dormy+Inn+EXPRESS+仙台海辺",
        navName: "Dormy Inn EXPRESS 仙台海邊",
        priority: "optional",
        open: true,
        content: `
          <p>check in 後有體力就行 Outlet，沒體力就休息泡湯</p>
          <div class="tip-block">
            <strong>🛍️ Mitsui Outlet Park 仙台港</strong>｜開到 20:00，明天 D5 都會再行<br>
            <strong>♨️ 大浴場</strong>｜避開人潮，下午先泡一次湯<br>
            <strong>🛏️ 小孩補眠</strong>｜連續幾天早起，讓小孩好好睡個午覺
          </div>
          <div class="tip-block">💡 18:00 出發吃炸豬扒晚餐</div>
        `
      },
      {
        time: "18:00 - 19:30",
        id: "Dormy-Inn晚餐與夜鳴拉麵",
        title: "晚餐 ➔ 炸豬扒（三選一）",
        tag: { text: "🍱 炸豬扒", class: "tag-amber" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>仙台港周邊炸豬扒名店，三選一</p>
          <details>
            <summary>🍱 かつ庄 多賀城店（Katsusho Tagajo）</summary>
            <div>
              <p><strong>招牌</strong>｜厚切炸豬扒、味噌豬扒</p>
              <a href="https://maps.app.goo.gl/wYEG22U6w7f9UC849" target="_blank">📍 導航前往</a>
            </div>
          </details>
          <details>
            <summary>🍱 とんかつ一代</summary>
            <div>
              <p><strong>招牌</strong>｜現炸豬扒、定食</p>
              <a href="https://maps.app.goo.gl/HrnA3SR3516cygKm7?g_st=ac" target="_blank">📍 導航前往</a>
            </div>
          </details>
          <details>
            <summary>🍱 とんちん館（Tonchin-kan）</summary>
            <div>
              <p><strong>招牌</strong>｜炸豬扒、炸蝦</p>
              <a href="https://maps.app.goo.gl/RQBUWUjpHrnDMAds6?g_st=ac" target="_blank">📍 導航前往</a>
            </div>
          </details>
          <div class="tip-block">💡 19:30 回 Dormy Inn，21:30 夜鳴拉麵</div>
        `
      },
      {
        time: "19:30 - 21:30",
        id: "Dormy-Inn大浴場與夜鳴拉麵",
        title: "回 Dormy Inn ➔ 大浴場 + 夜鳴拉麵",
        tag: { text: "♨️ 泡湯宵夜", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Dormy+Inn+EXPRESS+仙台海辺",
        navName: "Dormy Inn EXPRESS 仙台海邊",
        priority: "must",
        open: true,
        content: `
          <p>吃飽回 Dormy Inn，泡大浴場放鬆</p>
          <div class="tip-block">
            <strong>♨️ 大浴場</strong>｜泡湯放鬆<br>
            <strong>🍜 夜鳴拉麵</strong>｜21:30 開始，免費<br>
            <strong>💡 明天</strong>｜早餐 Girafe，採草莓 + Outlet
          </div>
        `
      }
    ]
  },

  // ==========================================
  // DAY 5 - Girafe 早餐 → 草莓 → Outlet 內食午餐 → Outlet → Dormy Inn 第2晚
  // ==========================================
  {
    day: 5,
    dateLabel: "DAY 5 · 2027年1月25日 (週一)",
    id: "市區草莓-Outlet-Dormy-Inn第2晚",
    title: "Girafe 早餐 ➔ 市區草莓 ➔ Outlet ➔ Dormy Inn 第2晚",
    subtitle: "🍓 麵包、草莓與購物之日",
    emoji: "🍓",
    events: [
      {
        time: "08:30 - 09:15",
        id: "早餐-Boulangerie-Girafe",
        title: "早餐 ➔ Boulangerie Girafe（首選）",
        tag: { text: "🥐 麵包店", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/NgULaDJhTcaTRMTWA?g_st=ac",
        navName: "ブーランジェリー・ジラフ",
        priority: "must",
        open: true,
        content: `
          <p>仙台港周邊人氣麵包店，買完車上吃或店內吃</p>
          <div class="tip-block">
            <strong>🥐 必買</strong>｜可頌、丹麥麵包、季節限定<br>
            <strong>☕ 咖啡</strong>｜店內有座位，也可外帶
          </div>
          <div class="tip-block">💡 09:15 吃完上車，09:30 出發去草莓園</div>
        `
      },
      {
        time: "09:30 - 10:00",
        id: "開車前往市區草莓園",
        title: "開車前往市區草莓園",
        tag: { text: "🚗 30-40分鐘", class: "tag-teal" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>仙台港 → 市區草莓園，約 30-40 分鐘</p>
          <div class="tip-block warn">
            ⚠️ 1 月草莓旺季，多為完全預約制，出發前 1–2 週預約
          </div>
          <div class="tip-block">💡 三個草莓園選項詳見下一張卡片</div>
        `
      },
      {
        time: "10:00 - 11:30",
        id: "仙台市區溫室採草莓三選一",
        title: "仙台市區溫室採草莓（三選一）",
        tag: { text: "🍓 冬季草莓", class: "tag-rose" },
        navUrl: "",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>1 月山形草莓正甜，小孩放電好活動</p>
          <details>
            <summary>🍓 仙台市區溫室採草莓（三選一）</summary>
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
          <div class="tip-block">💡 草莓園都在仙台市區周邊，採完可直接在附近吃午餐，然後開車回仙台港逛 Outlet。</div>
        `
      },
      {
        time: "11:30 - 11:45",
        id: "開車前往Mitsui-Outlet-Park-仙台港",
        title: "開車前往 Mitsui Outlet Park 仙台港",
        tag: { text: "🚗 15分鐘", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Mitsui+Outlet+Park+Sendai+Port",
        navName: "三井Outlet 仙台港",
        priority: "must",
        open: true,
        content: `<p>草莓園 → 仙台港 Outlet，約 15 分鐘。</p>`
      },
      {
        time: "11:45 - 13:00",
        id: "午餐-草莓園附近",
        title: "午餐 ➔ Outlet 內食（肚餓就食）",
        tag: { text: "🍽️ 彈性午餐", class: "tag-amber" },
        navUrl: "",
        priority: "optional",
        open: true,
        content: `
          <p>採完草莓直接去 Outlet，肚餓就在 Outlet 美食街吃</p>
          <div class="tip-block">
            <strong>🍽️ Outlet 美食街</strong>｜拉麵、海鮮丼、定食、兒童餐<br>
            <strong>💡 彈性</strong>｜不趕時間，邊逛邊吃
          </div>
        `
      },
      {
        time: "13:00 - 18:00",
        id: "Mitsui-Outlet-Park-仙台港購物",
        title: "【Mitsui Outlet Park 仙台港】購物",
        img: "https://resources.matcha-jp.com/resize/720x2000/2025/08/24-242139.webp",
        tag: { text: "🛍️ 狂買免提", class: "tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Mitsui+Outlet+Park+Sendai+Port",
        navName: "三井Outlet 仙台港",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>今天一次過逛 Outlet 和周邊免稅超市</p>
          <div class="tip-block warn">
            🎟️ 開逛前先憑護照至 1F 服務台領外國遊客 Coupon
          </div>
          <div class="tip-block">
            <strong>🛒 免稅超市</strong>｜AEON 仙台港店、業務超市<br>
            <strong>🛍️ Outlet</strong>｜主攻童裝與戶外品牌
          </div>
        `
      },
      {
        time: "18:00 - 21:30",
        id: "返回Dormy-Inn-第2晚",
        title: "返回 Dormy Inn（第2晚）",
        tag: { text: "♨️ 泡湯宵夜", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Dormy+Inn+EXPRESS+仙台海辺",
        navName: "Dormy Inn EXPRESS 仙台海邊",
        priority: "must",
        open: true,
        content: `
          <p>回飯店泡湯放鬆，21:30 夜鳴拉麵</p>
          <div class="tip-block">
            <strong>♨️ 大浴場</strong>｜泡湯放鬆<br>
            <strong>🍜 夜鳴拉麵</strong>｜21:30 免費<br>
            <strong>💡 明天</strong>｜退房去水族館（4 小時）
          </div>
        `
      }
    ]
  },

  // ==========================================
  // DAY 6 - 水族館 4 小時 → Grand Bach → 17:00 還車 → 站周邊晚餐
  // ==========================================
  {
    day: 6,
    dateLabel: "DAY 6 · 2027年1月26日 (週二)",
    id: "水族館-GrandBach-還車-仔虎",
    title: "水族館 ➔ Grand Bach ➔ 還車 ➔ 仙台站周邊晚餐",
    subtitle: "🐧 海洋與車站美食之日",
    emoji: "🐧",
    events: [
      {
        time: "09:30 - 10:00",
        id: "退房出發前往水族館",
        title: "Dormy Inn 退房，前往仙台海洋森林水族館",
        tag: { text: "🚗 5分鐘", class: "tag-teal" },
        navUrl: "https://maps.app.goo.gl/BxaETtqtFLNmQoJf8?g_st=ac",
        navName: "仙台海洋森林水族館",
        priority: "must",
        open: true,
        content: `
          <p>Dormy Inn 退房，開車 5 分鐘到水族館</p>
          <div class="tip-block">💡 行李先放車上，逛完水族館再回 Grand Bach</div>
        `
      },
      {
        time: "10:00 - 14:00",
        id: "仙台海洋森林水族館",
        title: "仙台海洋森林水族館 🐧",
        img: "https://i.meee.com.tw/erT0EXg.jpg",
        tag: { text: "🐬 海洋奇觀", class: "tag-sky" },
        navUrl: "https://maps.app.goo.gl/BxaETtqtFLNmQoJf8?g_st=ac",
        navName: "仙台海洋森林水族館",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>冬季限定的企鵝雪地散步，室內海豚秀不怕冷</p>
          <p class="text-xs text-slate-500">10:00 進場，玩到 14:00（4 小時），時間充裕不用趕</p>
          <div class="tip-block">
            <strong>🐬 必看亮點</strong>｜閃耀生命之海（數萬尾沙丁魚群）<br>
            門票：成人 ¥2,400 · 幼兒 ¥800
          </div>
          <div class="tip-block">💡 4 歲小孩難得可以慢慢看，不用趕場</div>
        `
      },
      {
        time: "14:00 - 15:00",
        id: "水族館周邊或Outlet午餐",
        title: "午餐：水族館周邊 / Outlet 美食街",
        tag: { text: "🍽️ 彈性午餐", class: "tag-amber" },
        navUrl: "",
        priority: "optional",
        open: true,
        content: `<p>在水族館附近吃，或直接殺去 Outlet 美食街吃。</p>`
      },
      {
        time: "15:00 - 16:30",
        id: "驅車前往入住Hotel-Grand-Bach-第1晚",
        title: "驅車前往 ➔ 入住 Hotel Grand Bach（第1晚）",
        img: "https://cdn.jalan.jp/jalan/images/pict2L/Y5/Y318775/Y318775163.jpg",
        tag: { text: "🏨 舒適連住", class: "tag-indigo" },
        navUrl: "https://maps.app.goo.gl/tumoctSbhRFgQkx89?g_st=ac",
        navName: "Hotel Grand Bach 仙台",
        priority: "must",
        open: true,
        content: `
          <p>15:00 離開水族館，15:20 抵達 Grand Bach</p>
          <p class="text-xs text-slate-500">入住仙台站旁，連住 2 晚（D6–D7）</p>
          <div class="tip-block warn">
            <strong>🧳 卸貨動線</strong>｜先臨停飯店門口<br>
            一位家長帶小孩 + 大行李下車 → 駕駛獨自去還車
          </div>
          <div class="tip-block">
            <strong>♨️ 大浴場</strong>｜16F 頂樓<br>
            <strong>🍙 免費夜間茶漬飯</strong>｜宵夜
          </div>
        `
      },
      {
        time: "16:30 - 17:00",
        id: "仙台站前店還車",
        title: "仙台站前店還車 ➔ Nippon Rent-A-Car",
        img: "https://rimage.gnst.jp/livejapan.com/public/img/spot/lj/01/45/lj0145539/lj0145539_6a39f0b20dd93_main.jpg",
        tag: { text: "🚗 還車", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Nippon+Rent-A-Car+仙台駅前店",
        navName: "Nippon Rent-A-Car 仙台站前店",
        priority: "must",
        open: true,
        content: `
          <p>Grand Bach → 仙台站前店，開車 10 分鐘</p>
          <div class="tip-block warn">
            <strong>✅ 還車必檢（17:00 完成）</strong><br>
            • 加滿油（保留發票）<br>
            • 歸還 2 套便攜式兒童安全帶<br>
            • 歸還 ETC 卡<br>
            • 車內垃圾清空
          </div>
          <div class="tip-block">
            <strong>💡 還車後</strong>｜步行 3 分鐘回 Grand Bach 放東西，17:30 站周邊晚餐
          </div>
        `
      },
      {
        time: "17:30 - 19:00",
        id: "仔虎-仙台駅前店",
        title: "晚餐 ➔ 仙台站周邊（牛舌通 / 壽司通 / 居酒屋）",
        tag: { text: "🍽️ 車站晚餐", class: "tag-amber" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Station",
        navName: "仙台站",
        priority: "must",
        open: true,
        content: `
          <p>還車後步行回 Grand Bach 放東西，17:30 出門吃晚餐</p>
          <div class="tip-block">
            <strong>🍽️ 仙台站周邊選擇</strong><br>
            • 牛舌通（3F）｜善治郎、喜助、伊達の牛たん<br>
            • 壽司通（3F）｜迴轉壽司、海鮮丼<br>
            • 居酒屋｜駅前周邊多間，適合家庭
          </div>
          <div class="tip-block">💡 19:00 前回 Grand Bach，19:30 大浴場 + 茶漬飯</div>
        `
      },
      {
        time: "19:30 - 21:00",
        id: "Grand-Bach大浴場與茶漬飯",
        title: "回 Grand Bach ➔ 大浴場 + 免費茶漬飯",
        tag: { text: "♨️ 泡湯宵夜", class: "tag-indigo" },
        navUrl: "https://maps.app.goo.gl/tumoctSbhRFgQkx89?g_st=ac",
        navName: "Hotel Grand Bach 仙台",
        priority: "must",
        open: true,
        content: `
          <p>晚餐後回 Grand Bach，泡大浴場</p>
          <div class="tip-block">
            <strong>♨️ 大浴場</strong>｜16F 頂樓，可看仙台夜景<br>
            <strong>🍙 免費茶漬飯</strong>｜夜間限定宵夜<br>
            <strong>⚠️ 今晚起沒車</strong>｜D7、D8 都搭 JR / 電車
          </div>
        `
      }
    ]
  },

  // ==========================================
  // DAY 7 - 榴岡神社 → 仙台朝市 → 仔虎午餐 → 一番町採買
  // ==========================================
  {
    day: 7,
    dateLabel: "DAY 7 · 2027年1月27日 (週三)",
    id: "榴岡神社-仙台朝市-一番町-GrandBach第2晚",
    title: "榴岡神社 ➔ 仙台朝市 ➔ 仔虎午餐 ➔ 一番町採買",
    subtitle: "⛩️ 神社、和牛與採買之日",
    emoji: "⛩️",
    events: [
      {
        time: "09:30 - 10:00",
        id: "前往榴岡神社",
        title: "前往 榴岡神社",
        tag: { text: "🚶 步行 / JR", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=榴岡神社",
        navName: "榴岡神社",
        priority: "must",
        open: true,
        content: `
          <p>兩個方式去榴岡神社</p>
          <div class="tip-block">
            <strong>🚶 步行</strong>｜Grand Bach → 榴岡神社，約 10–15 分鐘<br>
            <strong>🚃 JR</strong>｜仙台站 → 榴岡站，1 分鐘，再步行 3 分鐘
          </div>
          <div class="tip-block warn">
            <strong>❄️ 1 月路面提醒</strong>｜氣溫約 -2°C 至 5°C，經常下雪或結冰<br>
            步行時請穿防滑鞋、放慢腳步，碎石路與階梯特別滑
          </div>
        `
      },
      {
        time: "10:00 - 11:00",
        id: "榴岡神社參拜祈福",
        title: "榴岡神社參拜祈福",
        images: [
          "https://i.meee.com.tw/IZq2ClL.jpg",
          "https://i.meee.com.tw/Y575PZC.jpg",
          "https://i.meee.com.tw/6ilJ7dH.jpg"
        ],
        tag: { text: "⛩️ 祈福", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=榴岡神社",
        navName: "榴岡神社",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>仙台站附近嘅神社，保佑全家平安</p>

          <div class="tip-block warn">
            <strong>❄️ 1 月天氣與穿著</strong><br>
            氣溫約 <strong>-2°C 至 5°C</strong>，經常下雪或路面結冰<br>
            🧥 發熱衣 + 厚毛衣 + 防風防水羽絨大衣 + 圍巾 + 手套<br>
            👢 神社境內碎石路和階梯積雪結冰時非常滑，務必穿<strong>防滑、鞋底紋路深的雪靴或運動鞋</strong>
          </div>

          <div class="tip-block">
            <strong>⛩️ 參拜流程</strong>｜手水舍洗手 → 鳥居前行禮 → 參拜 → 抽御籤<br>
            <strong>🎋 御守</strong>｜可買交通安全、健康御守
          </div>

          <details>
            <summary>🐱 新年求籤與特色御守（必買）</summary>
            <div>
              <p><strong>🐱 貓咪 / 狗勾神籤</strong>｜1 月求新年運勢最佳時機，造型可愛</p>
              <p><strong>🐟 金黃鯛魚神籤</strong>｜象徵開運招福</p>
              <p><strong>🔮 透明貓咪御守</strong>｜陽光下晶瑩剔透，非常受歡迎</p>
              <p><strong>📖 御朱印帳</strong>｜「桜遊猫御朱印帳」及季節限定手寫 / 木製御朱印</p>
              <p><strong>🐦 黃綠色木製鷽鳥</strong>｜開運招福吉祥物</p>
            </div>
          </details>

          <div class="tip-block">
            <strong>🎋 抽到「凶」怎麼辦？</strong>｜綁在神社指定繩架上消災解厄<br>
            <strong>🎋 抽到「吉」</strong>｜帶回家當護身符
          </div>

          <div class="tip-block">
            💡 御朱印、御守、神籤都建議<strong>帶現金</strong>，神社不一定收信用卡
          </div>
        `
      },
      {
        time: "11:00 - 12:00",
        id: "仙台朝市",
        title: "仙台朝市",
        tag: { text: "🐟 在地市場", class: "tag-amber" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=仙台朝市",
        navName: "仙台朝市",
        priority: "must",
        open: true,
        content: `
          <p>仙台站西口步行 5 分鐘，約 60 間店舖</p>
          <div class="tip-block">
            <strong>🐟 必逛</strong>｜海鮮、仙台名產、現烤魚<br>
            <strong>🍓 水果</strong>｜當季水果，可買返酒店食
          </div>
        `
      },
      {
        time: "12:00 - 14:00",
        id: "午餐-朝市周邊",
        title: "午餐 ➔ 仔虎 仙台駅前店（Herb SENDAI 8F）",
        images: [
          "https://i.meee.com.tw/kMjv0CJ.jpg",
          "https://i.meee.com.tw/GN56Dts.jpg",
          "https://i.meee.com.tw/w3Ids9V.jpg",
          "https://i.meee.com.tw/8GQG53e.jpg"
        ],
        tag: { text: "🥩 頂級米澤牛", class: "tag-amber" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=仔虎+仙台駅前店",
        navName: "仔虎 仙台駅前店",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>朝市步行 5–8 分鐘到 Herb SENDAI 8F，午間套餐性價比高</p>
          <div class="tip-block warn">
            <strong>⏰ 12:00 入座</strong>｜午間時段比晚餐便宜，建議提前訂位<br>
            ⚠️ 米澤牛人氣店，出發前 1 個月官網預約
          </div>
          <details>
            <summary>🍱 午間推薦</summary>
            <div>
              <p>上燒肉套餐｜油花均勻、肉質細嫩</p>
              <p>仔虎牛丼 / 和牛牛筋咖哩（約 ¥1,188）</p>
              <p>冷麵 + 迷你丼組合（約 ¥1,408）</p>
              <p>兒童專用菜單｜兒童石鍋拌飯（少鹽易入口）</p>
            </div>
          </details>
          <div class="tip-block">💡 14:00 前吃完，步行去一番町購物</div>
        `
      },
      {
        time: "14:00 - 18:00",
        id: "一番町商圈採買",
        title: "一番町商圈 ➔ PARCO / S-PAL 採買",
        tag: { text: "🛍️ 悠閒購物", class: "tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=一番町商店街",
        navName: "一番町商店街",
        priority: "must",
        open: true,
        content: `
          <p>一番町、廣瀨通、PARCO、S-PAL 採買</p>
          <div class="tip-block">
            <strong>🛍️ 購物清單</strong><br>
            • 服飾｜UNIQLO、GU、PARCO 品牌<br>
            • 美妝｜藥妝店、@cosme<br>
            • 親子用品｜阿卡將本舖、西松屋
          </div>
          <div class="tip-block">💡 行到累可返 Grand Bach 放低戰利品再出嚟</div>
        `
      },
      {
        time: "18:00 - 21:00",
        id: "返回GrandBach第2晚",
        title: "返回 Hotel Grand Bach（第2晚）",
        tag: { text: "♨️ 泡湯宵夜", class: "tag-indigo" },
        navUrl: "https://maps.app.goo.gl/tumoctSbhRFgQkx89?g_st=ac",
        navName: "Hotel Grand Bach 仙台",
        priority: "must",
        open: true,
        content: `
          <p>返 Grand Bach，泡大浴場、食茶漬飯</p>
          <div class="tip-block">
            <strong>♨️ 大浴場</strong>｜16F 頂樓<br>
            <strong>🍙 免費茶漬飯</strong>｜夜間限定<br>
            <strong>🧳 行李整理</strong>｜明早退房前可先整理戰利品
          </div>
        `
      }
    ]
  },

  // ==========================================
  // DAY 8 - 最後補貨 → 返港（無車）
  // ==========================================
  {
    day: 8,
    dateLabel: "DAY 8 · 2027年1月28日 (週四)",
    id: "仙台車站伴手禮-機場電車-滿載返港",
    title: "仙台車站伴手禮 ➔ 機場電車 ➔ 滿載返港",
    subtitle: "✈️ 滿載而歸",
    emoji: "✈️",
    events: [
      {
        time: "10:00 - 10:30",
        id: "飯店退房與行李寄放",
        title: "飯店退房 + 行李寄放",
        tag: { text: "🏡 悠閒早晨", class: "tag-indigo" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>退房後寄放行李，去 S-PAL 買伴手禮</p>
          <div class="tip-block">
            <strong>💡 行李寄放</strong>｜Grand Bach 可寄放到 14:00<br>
            或放仙台站寄物櫃
          </div>
        `
      },
      {
        time: "10:45 - 13:00",
        id: "S-PAL採購伴手禮與午餐",
        title: "【S-PAL】採購伴手禮 + 輕鬆午餐",
        tag: { text: "🛍️ 一站買齊", class: "tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Station",
        navName: "仙台車站",
        priority: "must",
        highlight: true,
        open: true,
        content: `
          <p>仙台車站，最後掃貨</p>
          <details>
            <summary>🛍️ 伴手禮衝刺清單</summary>
            <div>
              <p><strong>菓匠三全</strong>｜萩之月（卡士達蛋糕）</p>
              <p><strong>ずんだ茶寮</strong>｜毛豆泥奶昔・毛豆夾心餅乾</p>
              <p><strong>阿部蒲鉾店</strong>｜現炸烤蒲鉾</p>
              <p><strong>牛舌乾</strong>｜仙台名產</p>
            </div>
          </details>
          <div class="tip-block">
            <strong>🍱 站內午餐</strong>｜S-PAL B1 或 3F「牛舌通 / 壽司通」
          </div>
        `
      },
      {
        time: "13:00 - 13:30",
        id: "搭仙台機場アクセス線到機場",
        title: "搭仙台機場アクセス線到機場",
        tag: { text: "🚃 機場電車", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Station",
        navName: "仙台站",
        priority: "must",
        open: true,
        content: `
          <p>仙台站 → 仙台機場，25 分鐘</p>
          <div class="tip-block">🎫 成人 ¥660 / 兒童 ¥330</div>
          <div class="tip-block warn">
            <strong>⏰ 13:30 前上車</strong>｜13:55 到機場，14:15 辦登機剛好
          </div>
        `
      },
      {
        time: "14:15 - 16:05",
        id: "辦理登機-順利返港",
        title: "辦理登機 ➔ 順利返港",
        tag: { text: "✈️ 完美句點", class: "tag-teal" },
        navUrl: "",
        priority: "must",
        open: true,
        content: `
          <p>14:15 辦理登機，16:05 起飛</p>
          <div class="tip-block">🎉 8 天 7 夜雪國之旅圓滿完成！</div>
        `
      }
    ]
  }
];

window.winterItineraries = winterItineraries;