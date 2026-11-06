/**
 * ============================================================
 *  2027 東北冬季親子溫泉自駕之旅 - 最終定案版
 * ============================================================
 */

const winterItineraries = [
  // ==========================================
  // DAY 1 - 抵達仙台 ➔ 市區購物
  // ==========================================
  {
    day: 1,
    dateLabel: "DAY 1 · 2027年1月21日 (週四)",
    id: "抵達仙台-入住市區-小補給",
    title: "抵達仙台 ➔ 入住市區 ➔ 小補給",
    subtitle: "✈️ 雪國初日，市區輕鬆逛",
    emoji: "✈️",
    events: [
      {
        time: "16:05 - 17:00",
        id: "落地仙台機場-SDJ-入境手續",
        title: "落地仙台機場 (SDJ) & 入境手續",
        img: "https://hk.wamazing.com/media/wp-content/uploads/sites/5/2024/08/sdjdutyfreeshop_pixta_98589488_M.jpg.webp",
        tag: { text: "🛬 抵達雪國", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Airport",
        navName: "仙台機場",
        priority: "must", open: true,
        content: `
          <p>16:05 落地，窗外已是靄靄白雪</p>
          <p class="text-xs text-slate-500">入境 → 提行李 → 前往地鐵站</p>
          <div class="tip-block warn">
            <strong>⏰ 預留 45 分鐘</strong>（冬季 + 兩幼童）<br>
            ⚠️ 若拖到 17:00 後 → 直接搭電車進市區
          </div>
        `
      },
      {
        time: "17:00 - 17:30",
        id: "仙台機場美食充電",
        title: "仙台機場美食充電",
        tag: { text: "🍽️ 機場美食", class: "tag-amber" },
        navUrl: "", priority: "optional", open: true,
        content: `
          <p>搭電車前，先買點小食墊墊胃</p>
          <div class="tip-block">💡 推薦 1F 毛豆奶昔、牛舌熱狗</div>
        `
      },
      {
        time: "17:30 - 18:15",
        id: "搭乘仙台機場アクセス線電車至仙台站",
        title: "搭乘「仙台機場アクセス線」電車至仙台站",
        tag: { text: "🚆 快速通勤", class: "tag-teal" },
        navUrl: "", priority: "must", open: true,
        content: `
          <p>約 25 分鐘直達仙台站</p>
          <p class="text-xs text-slate-500">輕鬆寫意，不用在雪地開車</p>
        `
      },
      {
        time: "18:15 - 18:45",
        id: "入住相鐵-FRESA-INN-仙台",
        title: "入住 相鐵 FRESA INN 仙台 Check-in",
        img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/44/f6/b4/caption.jpg?w=1200&h=-1&s=1",
        tag: { text: "🏨 商務飯店", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=相鐵+FRESA+INN+仙台",
        navName: "相鐵 FRESA INN", priority: "must", open: true,
        content: `
          <p>仙台站徒步 3 分鐘，寄放行李</p>
          <div class="tip-block">💡 房間不大，但地點極佳，方便晚上購物</div>
        `
      },
      {
        time: "18:45 - 19:30",
        id: "晚餐-伊達の牛たん本舗-本店",
        title: "晚餐 ➔ 伊達の牛たん本舗 本店",
        img: "https://tohoku365.com/desk_jp/wp/wp-content/uploads/2016/06/dateno.jpg",
        tag: { text: "🥩 必吃名店", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/3pwjdGMZZeGCRq1MA",
        navName: "伊達牛舌本舗 本店", priority: "must", open: true,
        content: `
          <p>仙台必吃！厚切牛舌的極致</p>
          <div class="tip-block warn">
            <strong>⏰ 19:00 前完食</strong>｜吃完還有體力再逛
          </div>
        `
      },
      {
        time: "19:30 - 21:00",
        id: "晚上自由小補-市區購物",
        title: "市區周邊輕鬆購物與補給",
        tag: { text: "🛍️ 自由購物", class: "tag-rose" },
        navUrl: "", priority: "optional", open: true,
        content: `
          <p>依體力決定，可在仙台站周邊 / 一番町商圈逛逛。</p>
          <p class="text-xs text-slate-500">今晚只做小補：買水、零食、暖暖包。</p>
          <div class="tip-block">💡 大採買留到 D2 晚上。</div>
        `
      }
    ]
  },

  // ==========================================
  // DAY 2 - 取車 ➔ 採草莓 ➔ 銀山 ➔ 天童
  // ==========================================
  {
    day: 2,
    dateLabel: "DAY 2 · 2027年1月22日 (週五)",
    id: "取車-採草莓-銀山溫泉-天童",
    title: "仙台取車 ➔ 採草莓 ➔ 銀山溫泉夜景",
    subtitle: "🍓 雪國壯遊與浪漫夜景",
    emoji: "🍓",
    events: [
      {
        time: "08:00 - 08:30",
        id: "仙台站前取車",
        title: "仙台站前取車 (Nippon Rent-A-Car)",
        tag: { text: "🚗 雪地自駕", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Nippon+Rent-A-Car+仙台站前",
        navName: "Nippon Rent-A-Car", priority: "must", open: true,
        content: `
          <p>一早取車，確認 4WD + 雪胎</p>
          <div class="tip-block warn">✅ 檢查雪胎胎紋、兒童安全帶裝第二排</div>
        `
      },
      {
        time: "08:30 - 10:30",
        id: "溫室採草莓-🍓",
        title: "溫室採草莓 🍓",
        img: "https://i.meee.com.tw/oATDVIV.jpg",
        tag: { text: "🍓 溫室採果", class: "tag-sky" },
        navUrl: "https://maps.app.goo.gl/Q91PEDo22zahngNy5?g_st=ac",
        navName: "一苺一笑 松森農場", priority: "must", highlight: true, open: true,
        content: `
          <p>前往山形途中的農場，享受現採草莓。</p>
          <details>
            <summary>🍓 採草莓農場（三選一）</summary>
            <div>
              <p><strong>1. 一苺一笑 松森農場（免預約）</strong> <a href="https://maps.app.goo.gl/Q91PEDo22zahngNy5?g_st=ac" target="_blank">📍 導航</a></p>
              <p><strong>2. JR 水果公園仙台荒濱</strong> <a href="https://maps.app.goo.gl/H3EDkLGrVGBg3Sth9?g_st=ac" target="_blank">📍 導航</a></p>
              <p><strong>3. Berry Planet（燦燦園）</strong> <a href="https://maps.app.goo.gl/yHuF1t7Vk9s3iPGc8?g_st=ac" target="_blank">📍 導航</a></p>
            </div>
          </details>
        `
      },
      {
        time: "10:30 - 12:00",
        id: "山形在地午餐",
        title: "午餐：山形在地美食",
        tag: { text: "🍜 在地美食", class: "tag-amber" },
        navUrl: "", priority: "must", open: true,
        content: `<p>享用板蕎麥麵或拉麵，為下午儲備體力。</p>`
      },
      {
        time: "13:00 - 15:00",
        id: "極重要銀山溫泉夢幻夜景",
        title: "【極重要】銀山溫泉夢幻夜景",
        img: "https://mimigo.tw/wp-content/uploads/20230105083619_51.jpg",
        tag: { text: "🏮 大正浪漫", class: "tag-sky" },
        navUrl: "https://maps.app.goo.gl/R5FCE8fhY6jMzqjr7?g_st=ac",
        navName: "銀山溫泉", priority: "must", highlight: true, open: true,
        content: `
          <p>把車停在大正浪漫館停車場，轉乘接駁車。</p>
          <div class="tip-block danger">
            <strong>❄️ 極寒準備</strong>｜貼身暖暖包必備<br>
            ⚠️ 木棧道結冰，穿防滑雪靴、緊牽小孩
          </div>
        `
      },
      {
        time: "15:30 - 16:30",
        id: "開車前往天童市",
        title: "開車前往天童市",
        tag: { text: "🚗 跨縣移動", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯", priority: "must", open: true,
        content: `<p>車程約 40 分鐘，抵達溫泉旅館。</p>`
      },
      {
        time: "16:30 - 18:00",
        id: "入住天童溫泉瀧之湯",
        title: "入住天童溫泉「瀧之湯」（第1晚）",
        img: "https://sendai-kouiki-mice.com/wp-content/uploads/2024/12/pic-hohoeminoyado-02.jpg",
        tag: { text: "🏨 溫泉名宿", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯", priority: "must", open: true,
        content: `<p>Check-in 放行李，休息一下。</p>`
      },
      {
        time: "18:00 - 19:30",
        id: "晚餐-天童市區美食",
        title: "晚餐：飯店周邊 / 天童市區美食",
        tag: { text: "🍳 彈性晚餐", class: "tag-amber" },
        navUrl: "", priority: "optional", open: true,
        content: `
          <p>推薦 HACHI 洋食 或 水車生そば。</p>
          <div class="tip-block">💡 若旅館有供餐也可直接在飯店吃。</div>
        `
      }
    ]
  },

  // ==========================================
  // DAY 3 - 藏王樹冰 ➔ 兒童館 ➔ 懷石
  // ==========================================
  {
    day: 3,
    dateLabel: "DAY 3 · 2027年1月23日 (週六)",
    id: "藏王樹冰-兒童館-溫泉懷石",
    title: "藏王樹冰 ➔ げんキッズ ➔ 瀧之湯懷石",
    subtitle: "☃️ 震撼樹冰與放電日常",
    emoji: "☃️",
    events: [
      {
        time: "07:45 - 08:30",
        id: "早餐-客美多咖啡",
        title: "早餐：客美多咖啡 / 飯店早餐",
        tag: { text: "☕ 活力晨活", class: "tag-amber" },
        navUrl: "", priority: "must", open: true,
        content: `<p>吃飽準備上山對抗 -20℃。</p>`
      },
      {
        time: "08:30 - 12:00",
        id: "搭乘雙段纜車登頂-觀賞震撼藏王樹冰",
        title: "搭乘雙段纜車登頂 ➔ 觀賞「藏王樹冰」",
        img: "https://hk.wamazing.com/media/wp-content/uploads/sites/5/2023/09/zaoujuhyou_pixta_73308950_M.jpg.webp",
        tag: { text: "❄️ 樹冰奇景", class: "tag-sky" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Zao+Ropeway",
        navName: "藏王索道", priority: "must", highlight: true, open: true,
        content: `
          <p>兩段纜車，直上樹冰王國</p>
          <div class="tip-block danger">
            <strong>⚠️ 山頂安全（-20℃）</strong><br>
            🥶 零皮膚外露：毛帽 + 圍脖 + 護目鏡<br>
            ⛸️ 地藏段結冰：必穿冰爪、緊牽小孩
          </div>
        `
      },
      {
        time: "12:30 - 14:00",
        id: "山形市區午餐-うまい鮨勘",
        title: "山形市區午餐 ➔ うまい鮨勘",
        img: "https://site-images.hp.admin.can-ly.com/images/cms/edited/directories/18/stores/214980/20260123165120%E5%B1%B1%E5%BD%A2%E5%8D%97%E6%94%AF%E5%BA%97.JPG",
        tag: { text: "🍣 人氣壽司", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/eSMkZD1m3vimNytv7",
        navName: "うまい鮨勘", priority: "must", open: true,
        content: `<p>下山後享用新鮮壽司。</p>`
      },
      {
        time: "14:30 - 16:00",
        id: "子育て未来館-げんキッズ",
        title: "子育て未来館 げんキッズ（室內放電）",
        tag: { text: "🛝 兒童遊樂館", class: "tag-sky" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=子育て未来館+げんキッズ",
        navName: "げんキッズ", priority: "must", open: true,
        content: `
          <p>室內遊樂館，讓小孩徹底放電。</p>
          <div class="tip-block">💡 含場內午餐，大人可趁機休息。</div>
        `
      },
      {
        time: "16:00 - 18:00",
        id: "獨享貸切風呂與懷石晚餐",
        title: "16:00 返回瀧之湯 ➔ 貸切風呂 ➔ 懷石晚餐",
        img: "https://www.nipponsensor.net/wp-content/uploads/2025/08/%E5%BE%AE%E7%AC%91%E4%B9%8B%E5%AE%BF%E7%80%A7%E4%B9%8B%E6%B9%AF-04.jpg",
        tag: { text: "♨️ 私人包廂", class: "tag-indigo" },
        navUrl: "", priority: "must", open: true,
        content: `
          <p>16:30 專屬預約：貸切風呂體驗</p>
          <p class="text-xs text-slate-500">18:00 享用瀧之湯豪華懷石料理</p>
        `
      }
    ]
  },

  // ==========================================
  // DAY 4 - 狐狸村 ➔ 港區 ➔ Outlet
  // ==========================================
  {
    day: 4,
    dateLabel: "DAY 4 · 2027年1月24日 (週日)",
    id: "狐狸村-白石溫麵-港區",
    title: "天童退房 ➔ 狐狸村 ➔ 入住海邊",
    subtitle: "🦊 萌寵互動與海港之夜",
    emoji: "🦊",
    events: [
      {
        time: "09:30 - 10:30",
        id: "退房出發前往狐狸村",
        title: "瀧之湯退房 ➔ 前往宮城藏王狐狸村",
        tag: { text: "🚗 跨縣移動", class: "tag-teal" },
        navUrl: "", priority: "must", open: true,
        content: `<p>車程約 50-60 分鐘。</p>`
      },
      {
        time: "10:30 - 12:00",
        id: "宮城藏王狐狸村",
        title: "宮城藏王狐狸村",
        img: "https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-0946-3472.jpg",
        tag: { text: "🦊 萌寵互動", class: "tag-sky" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Miyagi+Zao+Fox+Village",
        navName: "狐狸村", priority: "must", highlight: true, open: true,
        content: `
          <p>雪地狐狸互動與抱狐狸體驗</p>
          <div class="tip-block danger">
            <strong>⚠️ 軍訓級要求</strong>｜家長需一對一死死牽牢，禁奔跑
          </div>
        `
      },
      {
        time: "12:15 - 13:30",
        id: "白石午餐-傳統名物白石溫麵",
        title: "白石午餐 ➔ 傳統名物「白石溫麵」",
        tag: { text: "🍜 在地名物", class: "tag-amber" },
        navUrl: "", priority: "must", open: true,
        content: `<p>山下白石市享用滑順溫麵。</p>`
      },
      {
        time: "13:30 - 14:30",
        id: "開車前往仙台港區域",
        title: "開車前往仙台港區域",
        tag: { text: "🚗 順暢車程", class: "tag-teal" },
        navUrl: "", priority: "must", open: true,
        content: `<p>車程約 40-50 分鐘。</p>`
      },
      {
        time: "14:30 - 15:30",
        id: "入住-Dormy-Inn-EXPRESS-仙台海邊",
        title: "入住 Dormy Inn EXPRESS 仙台海邊（第1晚）",
        tag: { text: "🏨 海景連鎖", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Dormy+Inn+EXPRESS+仙台海邊",
        navName: "Dormy Inn", priority: "must", open: true,
        content: `<p>Check-in 放行李，準備去 Outlet。</p>`
      },
      {
        time: "15:30 - 18:30",
        id: "三井-Outlet-Park-仙台港血拚",
        title: "三井 Outlet Park 仙台港 購物",
        tag: { text: "🛍️ 輕鬆血拚", class: "tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Mitsui+Outlet+Park+Sendai+Port",
        navName: "三井Outlet", priority: "must", open: true,
        content: `<p>開車 3 分鐘，主攻童裝與戶外品牌。</p>`
      },
      {
        time: "19:00 - 21:30",
        id: "晚餐與夜鳴拉麵",
        title: "晚餐 ＋ 泡湯 ＋ 21:30 免費夜鳴拉麵",
        tag: { text: "🍜 溫泉宵夜", class: "tag-indigo" },
        navUrl: "", priority: "must", open: true,
        content: `<p>享用飯店天然大浴場，21:30 吃免費拉麵。</p>`
      }
    ]
  },

  // ==========================================
  // DAY 5 - 水族館 ➔ Outlet ➔ 連住
  // ==========================================
  {
    day: 5,
    dateLabel: "DAY 5 · 2027年1月25日 (週一)",
    id: "水族館-Outlet連住",
    title: "水族館 ➔ 仙台港血拚",
    subtitle: "🐬 海洋奇觀與購物",
    emoji: "🐬",
    events: [
      {
        time: "09:30 - 12:30",
        id: "仙台海洋森林水族館",
        title: "仙台海洋森林水族館",
        img: "https://i.meee.com.tw/erT0EXg.jpg",
        tag: { text: "🐬 海洋奇觀", class: "tag-sky" },
        navUrl: "https://maps.app.goo.gl/BxaETtqtFLNmQoJf8?g_st=ac",
        navName: "仙台海洋森林水族館", priority: "must", highlight: true, open: true,
        content: `
          <p>開車 3 分鐘抵達。欣賞海豚表演、企鵝散步。</p>
        `
      },
      {
        time: "12:30 - 14:00",
        id: "水族館周邊午餐",
        title: "午餐：水族館周邊",
        tag: { text: "🍽️ 彈性午餐", class: "tag-amber" },
        navUrl: "", priority: "optional", open: true,
        content: `<p>在水族館附近吃或直接去 Outlet 美食街。</p>`
      },
      {
        time: "14:00 - 18:00",
        id: "Outlet續逛與免稅超市",
        title: "續逛三井 Outlet 或周邊大型購物商場",
        tag: { text: "🛍️ 悠閒購物", class: "tag-rose" },
        navUrl: "", priority: "must", open: true,
        content: `<p>免稅超市補貨。</p>`
      },
      {
        time: "18:00 - 21:00",
        id: "返回-Dormy-Inn-第2晚",
        title: "返回 Dormy Inn（第2晚）➔ 夜鳴拉麵",
        tag: { text: "🏨 連住放鬆", class: "tag-indigo" },
        navUrl: "", priority: "must", open: true,
        content: `<p>泡湯放鬆，吃宵夜拉麵。</p>`
      }
    ]
  },

  // ==========================================
  // DAY 6 - 玩雪 ➔ 米澤牛 ➔ 還車
  // ==========================================
  {
    day: 6,
    dateLabel: "DAY 6 · 2027年1月26日 (週二)",
    id: "Spring-Valley-仔虎-還車",
    title: "Spring Valley 玩雪 ➔ 仔虎 ➔ 還車",
    subtitle: "⛷️ 玩雪放電與頂級燒肉",
    emoji: "⛷️",
    events: [
      {
        time: "08:15 - 09:00",
        id: "退房前往Spring-Valley",
        title: "退房開車前往 Spring Valley 泉高原",
        tag: { text: "🚗 雪地自駕", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Spring+Valley+Izumi+Kogen",
        navName: "Spring Valley", priority: "must", open: true,
        content: `<p>車程約 40 分鐘。</p>`
      },
      {
        time: "09:00 - 15:00",
        id: "雪之冒險王國玩雪",
        title: "【雪之冒險王國】玩雪、溜雪橇",
        img: "https://lovetogo.tw/201802-tohoku/spring-valley/photo/20180204-1310-0344.jpg",
        tag: { text: "☃️ 玩雪放電", class: "tag-sky" },
        navUrl: "", priority: "must", highlight: true, open: true,
        content: `
          <p>讓小孩玩好玩滿，含場中午餐。</p>
        `
      },
      {
        time: "15:00 - 16:30",
        id: "返回仙台市區入住Grand-Bach",
        title: "返回仙台市區 ➔ 入住 Hotel Grand Bach",
        tag: { text: "🏨 卸行李", class: "tag-indigo" },
        navUrl: "https://maps.app.goo.gl/tumoctSbhRFgQkx89?g_st=ac",
        navName: "Hotel Grand Bach", priority: "must", open: true,
        content: `<p>先至飯店卸行李 / Check-in（第1晚）。</p>`
      },
      {
        time: "16:30 - 17:30",
        id: "仙台站前還車",
        title: "17:00 仙台站前 Nippon Rent-A-Car 還車",
        tag: { text: "🚗 結束自駕", class: "tag-teal" },
        navUrl: "", priority: "must", open: true,
        content: `<p>結束 5 天自駕行程。</p>`
      },
      {
        time: "17:30 - 19:30",
        id: "晚餐-仔虎仙台站前店",
        title: "晚餐 ➔ 仔虎 仙台站前店 (Herb SENDAI 8F)",
        img: "https://matipura.com/CORE/wp-content/uploads/2021/03/DSC00724.jpg",
        tag: { text: "🥩 頂級米澤牛", class: "tag-amber" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=仔虎+仙台站前店",
        navName: "仔虎 仙台站前店", priority: "must", highlight: true, open: true,
        content: `
          <p>步行 3 分鐘享用頂級米澤牛燒肉。</p>
        `
      },
      {
        time: "20:00 -",
        id: "返回Grand-Bach享受大浴場",
        title: "返回 Hotel Grand Bach（大浴場與茶漬飯）",
        tag: { text: "♨️ 頂樓泡湯", class: "tag-indigo" },
        navUrl: "", priority: "must", open: true,
        content: `<p>享受頂樓大浴場與免費夜間茶漬飯。</p>`
      }
    ]
  },

  // ==========================================
  // DAY 7 - 神社 ➔ 市區採買
  // ==========================================
  {
    day: 7,
    dateLabel: "DAY 7 · 2027年1月27日 (週三)",
    id: "榴岡神社-市區採買",
    title: "榴岡神社參拜 ➔ 市區悠閒採買",
    subtitle: "⛩️ 祈福與購物日常",
    emoji: "⛩️",
    events: [
      {
        time: "10:00 - 11:30",
        id: "榴岡神社參拜",
        title: "榴岡神社參拜祈福",
        img: "https://www.sendai-jinja.or.jp/wp-content/uploads/2021/04/tsurugaoka.jpg",
        tag: { text: "⛩️ 歷史神社", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=榴岡神社",
        navName: "榴岡神社", priority: "must", open: true,
        content: `
          <p>從飯店散步（10-15分）或搭 JR 仙石線（1分鐘至榴岡站）。</p>
        `
      },
      {
        time: "11:30 - 14:00",
        id: "市區午餐",
        title: "午餐：仙台市區美食",
        tag: { text: "🍽️ 彈性午餐", class: "tag-amber" },
        navUrl: "", priority: "must", open: true,
        content: `<p>可至一番町商圈或站前用餐。</p>`
      },
      {
        time: "14:00 - 18:00",
        id: "市區悠閒採買",
        title: "市區悠閒採買 (一番町 / PARCO / S-PAL)",
        tag: { text: "🛍️ 購物", class: "tag-rose" },
        navUrl: "", priority: "must", open: true,
        content: `<p>採買服飾、美妝與親子用品。</p>`
      },
      {
        time: "18:00 - 21:00",
        id: "返回Grand-Bach-第2晚",
        title: "返回 Hotel Grand Bach（第2晚）",
        tag: { text: "🏨 連住", class: "tag-indigo" },
        navUrl: "", priority: "must", open: true,
        content: `<p>享受大浴場與免費茶漬飯。</p>`
      }
    ]
  },

  // ==========================================
  // DAY 8 - 補貨 ➔ 機場
  // ==========================================
  {
    day: 8,
    dateLabel: "DAY 8 · 2027年1月28日 (週四)",
    id: "伴手禮-機場返港",
    title: "最後補貨 ➔ 仙台機場返港",
    subtitle: "✈️ 滿載而歸",
    emoji: "✈️",
    events: [
      {
        time: "10:00 - 10:30",
        id: "飯店退房與寄放行李",
        title: "退房並寄放行李於飯店 / 仙台站置物櫃",
        tag: { text: "🧳 輕鬆退房", class: "tag-indigo" },
        navUrl: "", priority: "must", open: true,
        content: `<p>退房準備最後採買。</p>`
      },
      {
        time: "10:30 - 13:30",
        id: "S-PAL最後補貨與午餐",
        title: "S-PAL 仙台 / 站前地下街 購買伴手禮",
        tag: { text: "🎁 伴手禮", class: "tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Station",
        navName: "仙台車站", priority: "must", open: true,
        content: `<p>牛舌乾、毛豆麻糬、萩之月，並享用午餐。</p>`
      },
      {
        time: "13:30 - 14:15",
        id: "搭乘電車前往仙台機場",
        title: "搭乘「仙台機場アクセス線」電車前往機場",
        tag: { text: "🚆 輕鬆通勤", class: "tag-teal" },
        navUrl: "", priority: "must", open: true,
        content: `<p>約 25 分鐘直達機場。</p>`
      },
      {
        time: "14:15 - 16:05",
        id: "辦理登機-順利返港",
        title: "辦理登機 ➔ 16:05 班機起飛返港",
        tag: { text: "✈️ 完美句點", class: "tag-teal" },
        navUrl: "", priority: "must", open: true,
        content: `<p>滿載回憶，雪國之旅圓滿完成！</p>`
      }
    ]
  }
];

window.winterItineraries = winterItineraries;