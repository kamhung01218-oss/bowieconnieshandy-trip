/**
 * ============================================================
 *  2027 東北冬季親子溫泉自駕之旅 - 行程數據
 *  版本: 1.0.0 (加入 Day 6 圖片)
 *  最後更新: 2026-09-06
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
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>14:05 降落入境：</strong>班機降落仙台機場，先帶兩位 4 歲小朋友前往洗手間，成人分工辦理入境手續與提取行李。</p>
          </div>
        `
      },
      {
        time: "14:50 - 15:30",
        title: "仙台機場美食充電 ➔ 出發前補充體力",
        tag: { text: "🍽️ 機場美食", class: "tag-amber" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p class="mb-2">取車前先在機場稍作休息，補充體力再上路！點擊展開查看各樓層推薦：</p>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-indigo-800 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5">【1 樓】抵達大廳（極速外帶）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700">
                <strong class="text-slate-800 text-[13px] block mb-1">牛タン専門レストラン 陣中（冠舌屋）</strong>
                <p class="text-slate-600">設有外賣窗口。除了正餐便當，更提供牛舌熱狗包、牛舌米漢堡及滿滿牛舌碎的飯糰，是非常具仙台特色、能拿了就走的極速輕食。</p>
              </div>
            </details>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-700 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5">【2 樓】出發大廳與名產區（輕食與甜點）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700 space-y-3">
                <div>
                  <strong class="text-slate-800 text-[13px] block mb-1">みちのくラウンジ by PRONTO</strong>
                  <p class="text-slate-600">日本著名連鎖咖啡酒吧。全日供應各式現製三明治、牛角包與咖啡。店內座位寬敞且多設有充電插座，是出發前檢查導航路線的最佳落腳點。</p>
                </div>
                <div>
                  <strong class="text-slate-800 text-[13px] block mb-1">ずんだ茶寮 (Zunda Saryo)</strong>
                  <p class="text-slate-600">仙台傳統毛豆點心專門店 (主供外帶)。招牌的「毛豆奶昔」濃醇清爽，配上一串毛豆麻糬，是開車前迅速補充血糖的特色甜品。</p>
                </div>
              </div>
            </details>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-emerald-700 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5">【3 樓】餐廳美食街（環境最舒適）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700 space-y-3">
                <div>
                  <strong class="text-slate-800 text-[13px] block mb-1">FLATWHITE COFFEE FACTORY</strong>
                  <p class="text-slate-600">東北在地精品咖啡連鎖店。環境時尚明亮，主打自家烘焙手沖咖啡，輕食有司康餅與馬芬蛋糕，適合喜歡西式輕糕點的旅客。</p>
                </div>
                <div>
                  <strong class="text-slate-800 text-[13px] block mb-1">M.M.C ORGANIC CAFE</strong>
                  <p class="text-slate-600">以有機咖啡為賣點的悠閒咖啡廳。主打現烤吐司三明治、熱狗、咖哩飯。相較於 2 樓的熱鬧，3 樓環境更適合坐下來，不趕時間地簡單吃一餐。</p>
                </div>
              </div>
            </details>
          </div>
        `
      },
      {
        time: "15:30 - 16:00",
        title: "提領 Nippon Rent-A-Car 7-8 人座雪地車",
        img: "https://rimage.gnst.jp/livejapan.com/public/img/spot/lj/01/45/lj0145539/lj0145539_6a39f0b20dd93_main.jpg",
        tag: { text: "🚗 冬季自駕", class: "tag-teal" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>15:30 前往租車：</strong>吃飽後至機場 1F 抵達大廳的 Nippon Rent-A-Car 櫃檯接洽，搭乘專屬接駁車前往取車營業所。</p>
            <div class="bg-teal-50/80 border border-teal-200 p-2.5 rounded-xl text-teal-900 text-xs mt-2">
              <strong class="block mb-1">🔍 15:45–16:00 取車關鍵檢查：</strong>
              <ul class="list-disc pl-4 space-y-1">
                <li><strong>兒童安全帶：</strong>將 2 套「便攜式兒童安全帶 (Smart Kid Belt)」安裝於第二排，確認緊貼兒童胸腹部無扭曲。</li>
                <li><strong>車輛配置：</strong>確認配備 4WD（四輪驅動）與 スタッドレス (雪地胎)，堆疊 4 個大行李箱與推車。</li>
              </ul>
            </div>
          </div>
        `
      },
      {
        time: "16:00 - 16:45",
        title: "平地直達秋保溫泉（全程避開高海拔山路）",
        tag: { text: "🛣️ 零風險路線", class: "tag-teal" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Zuiho+Akiu",
        navName: "秋保溫泉瑞鳳",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>行駛路線：</strong>仙台機場 ➔ 仙台南部道路 ➔ 山田 IC ➔ 國道 286 號 ➔ 秋保溫泉。</p>
            <p><strong>車程時間：</strong>約 35–45 分鐘（行車距離約 30 公里）。</p>
            <p><strong>路況說明：</strong>全為平地幹線公路，完全避開高海拔易結冰山路。</p>
            <p class="text-[11px] text-slate-500 mt-1">⚠️ 提醒：冬季午後氣溫降至零度，行經橋樑與陰影路面時請放慢車速保持安全距離。</p>
          </div>
        `
      },
      {
        time: "16:45 - 17:00",
        title: "抵達秋保溫泉「瑞鳳大飯店」Check-in",
        img: "https://rimage.gnst.jp/livejapan.com/public/article/detail/a/30/00/a3000138/img/zh-tw/a3000138_parts_5f717fd1acf77.jpg?20210210161203&q=80&rw=686&rh=490",
        tag: { text: "🏨 溫泉名宿", class: "tag-indigo" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>車輛停靠門口卸下大行李，大廳辦理 Check-in。領取房間鑰匙，並確認當晚「Seasons」自助晚餐的入場時段。</p>
            <details class="bg-amber-50/80 border border-amber-200 rounded-xl shadow-sm mt-2 group/inner">
              <summary class="px-3 py-2 cursor-pointer text-xs font-bold text-amber-900 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🏨</span> 點擊展開：入住與客房細節提示</span>
                <span class="text-[10px] text-amber-600 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3 border-t border-amber-200/50 text-xs text-slate-700">
                <ul class="list-disc pl-4 space-y-1.5">
                  <li><strong class="text-amber-700">退房分流：</strong>正常退房為 10:00，早上 06:00起即可提前辦理退房手續，<strong>強烈建議提早辦理避開人潮</strong>。</li>
                  <li><strong class="text-slate-600">客房空間：</strong>全客房為傳統日式和室（榻榻米），空間寬敞。房內僅礦泉水免費，冰箱內啤酒與咖啡需額外收費。</li>
                  <li><strong class="text-slate-600">樓層選擇：</strong>高樓層房間可能遇到客房淋浴水壓偏小狀況，建議優先選擇低樓層或直接使用大浴場洗澡。</li>
                </ul>
              </div>
            </details>
          </div>
        `
      },
      {
        time: "17:00 - 18:15",
        title: "B1 溫水泳池徹底放電 ➔ 露天雪景風呂暖身",
        img: "https://rimage.gnst.jp/livejapan.com/public/article/detail/a/30/00/a3000138/img/zh-tw/a3000138_parts_5f717fbc08a88.jpg?20210210161203&q=80&rw=686&rh=490",
        tag: { text: "🏊 寶寶放電", class: "tag-sky" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>17:00–17:45 溫水泳池放電：</strong>拿著隨身包泳具直奔 B1 室內溫水泳池！內有暖氣、兒童淺水區與滑水道，讓小朋友快速擺脫搭機疲憊。</p>
            <p><strong>17:45–18:15 露天雪景風呂：</strong>泳池玩畢直接銜接大浴場與露天風呂，全家一起體驗被雪景圍繞的露天溫泉，洗去寒意。</p>
            <details class="bg-indigo-50/80 border border-indigo-200 rounded-xl shadow-sm mt-2 group/inner">
              <summary class="px-3 py-2 cursor-pointer text-xs font-bold text-indigo-900 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">♨️</span> 點擊展開：瑞鳳溫泉特色與泡湯禮儀</span>
                <span class="text-[10px] text-indigo-600 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3 border-t border-indigo-200/50 text-xs text-slate-700">
                <ul class="list-disc pl-4 space-y-1.5">
                  <li><strong class="text-indigo-700">浴場互換：</strong>溫泉位於 B1，每日日夜會互換男女湯位置（左男右女），進場前請務必看清指示牌！</li>
                  <li><strong class="text-indigo-700">自備浴巾：</strong>公共浴場不提供大浴巾，<strong>須從房間自行攜帶前往</strong>。</li>
                  <li><strong class="text-slate-600">泡湯禮儀：</strong>全程裸湯（不可穿泳衣）。入池前須在小板凳上徹底沖洗身體與頭髮，並將泡沫沖淨。</li>
                  <li><strong class="text-red-600">注意事項：</strong>小毛巾不可下水、長髮須盤起。保持安靜嚴禁打鬧，<strong>嚴禁攜帶手機及拍照</strong>。有紋身者須提前向酒店確認。</li>
                  <li><strong class="text-slate-600">淋浴水壓：</strong>淋浴間出水開關採按壓式，須定時手動按壓。</li>
                </ul>
              </div>
            </details>
          </div>
        `
      },
      {
        time: "18:30 - 20:30",
        title: "饗宴「Seasons」豪華自助晚餐（蟹腳 & 和牛）",
        img: "https://img.kenalice.tw/2025/04/20250420231941_0_5dbb05.jpg",
        tag: { text: "🦀 痛快美食", class: "tag-amber" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <div class="bg-amber-50/80 border border-amber-200 p-3 rounded-xl shadow-sm space-y-2">
              <strong class="block text-amber-900 flex items-center gap-1.5"><span class="text-base">🦀</span> 極致美饌</strong>
              <p class="text-[11px] text-slate-700 leading-relaxed">前往 B1 大廳享用評價極高的自助餐！提供紅松葉蟹/長腳蟹腳吃到飽、廚師現場鐵板現煎黑毛和牛排、<strong class="text-amber-700">仙台牛舌</strong>、現握壽司與新鮮刺身。</p>
            </div>
            <div class="bg-sky-50/80 border border-sky-200 p-3 rounded-xl shadow-sm space-y-2">
              <strong class="block text-sky-900 flex items-center gap-1.5"><span class="text-base">👶</span> 兒童友善專區</strong>
              <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                <li>炸雞、薯條、義大利麵</li>
                <li>小朋友最愛的巧克力噴泉甜點區</li>
              </ul>
            </div>
            <div class="text-[11px] text-amber-700 font-bold bg-amber-50 border border-amber-100 p-2 rounded-xl mt-2 flex items-center gap-1.5">
              <span>💡</span> 晚餐分為「17:00-19:00」與「19:00-21:00」兩個場次，入住時請務必確認好預約的時段。
            </div>
          </div>
        `
      },
      {
        time: "20:30 -",
        title: "客房榻榻米休息，養精蓄銳準備 Day 2",
        tag: { text: "🌙 舒服入住", class: "tag-indigo" },
        navUrl: "",
        open: true,
        content: `<p class='text-xs md:text-sm text-slate-700'>漫步回日式榻榻米客房（或和洋室），鋪好被褥後享受雪國第一夜的舒適好眠。</p>`
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
    subtitle: "🏮 大正浪漫銀山夜景",
    emoji: "🏮",
    events: [
      {
        time: "09:30 - 10:30",
        title: "退房出發，跨縣前往山形天童",
        tag: { text: "🚗 雪地幹線", class: "tag-teal" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>09:30 啟程：</strong>在【秋保溫泉 瑞鳳大飯店】享用完豐盛早餐後退房，行李放上車廂出發。</p>
            <p><strong>駕駛路線：</strong>沿國道 48 號（關山街道）由宮城縣平地駛往山形縣天童市。</p>
            <p><strong>車程時間：</strong>約 50–60 分鐘（行車距離約 45 公里）。</p>
            <p class="text-[11px] text-rose-600 font-bold bg-rose-50 p-1.5 rounded mt-2">⚠️ 雪地駕駛提醒：國道 48 號除雪效率佳，但關山隧道兩端易有積雪或薄冰（Black Ice），請維持安全車距，避免急煞或急打方向盤。</p>
          </div>
        `
      },
      {
        time: "10:30 - 14:30",
        title: "AEON MALL 天童：裝備補給與美食全攻略",
        img: "https://japanshopping.org/files/shopimg/84ab29edbe4c8f9e96cfb4024eb95bc2.jpg",
        tag: { text: "🛍️ 裝備補給", class: "tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Aeon+Mall+Tendo",
        navName: "AEON天童",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p class="mb-2">抵達商場動線極佳的東北最大級 <strong>AEON MALL 天童</strong>，點擊展開查看推薦逛街與美食地圖：</p>
            <details class="bg-indigo-50/80 border border-indigo-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-indigo-900 hover:bg-indigo-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🛍️</span> 最強核心必逛品牌</span>
                <span class="text-[10px] text-indigo-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-indigo-200/50 text-xs text-slate-700 space-y-3">
                <div>
                  <span class="font-bold text-indigo-800 text-[12px] border-b border-indigo-200/60 pb-0.5 mb-1 block">戶外與運動旗艦</span>
                  <ul class="list-disc pl-4 space-y-1">
                    <li><strong>Montbell (2樓)：</strong>日本頂級戶外品牌。販售專業行山、露營、防水機能服飾與超輕量背包。</li>
                    <li><strong>ABC-MART Grand Stage (2樓)：</strong>比一般店鋪等級更高，擁有最齊全的各品牌熱門運動鞋、限定鞋款與潮流服飾。</li>
                  </ul>
                </div>
                <div>
                  <span class="font-bold text-indigo-800 text-[12px] border-b border-indigo-200/60 pb-0.5 mb-1 block">日系服飾 & 生活雜貨美妝</span>
                  <ul class="list-disc pl-4 space-y-1">
                    <li><strong>UNIQLO & GU：</strong>超大型店鋪，男女裝、童裝款式齊全。</li>
                    <li><strong>AEON STYLE (1、2樓)：</strong>1樓的生鮮超市是靈魂所在，能買到山形當季名產水果（如櫻桃、西洋梨）、在地清酒及豐富零食。</li>
                    <li><strong>Welcia 藥妝 & 未來屋書店：</strong>適合一次過補貨面膜彩妝，以及逛逛質感複合式文青空間。</li>
                  </ul>
                </div>
              </div>
            </details>
            <details class="bg-amber-50/80 border border-amber-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-900 hover:bg-amber-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🍱</span> 人氣餐廳與美食精選</span>
                <span class="text-[10px] text-amber-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-amber-200/50 text-xs text-slate-700 space-y-3">
                <div>
                  <span class="font-bold text-amber-800 text-[12px] border-b border-amber-200/60 pb-0.5 mb-1 block">1 樓餐廳街 (適合悠閒聚餐)</span>
                  <ul class="list-disc pl-4 space-y-1">
                    <li><strong>大戶屋 (Ootoya)：</strong>日本家常定食代表，主打均衡魚肉料理與黑醋家庭菜。</li>
                    <li><strong>いきなりステーキ (Ikinari Steak)：</strong>人氣現切碳烤牛排，自由決定部位與克數。</li>
                    <li><strong>築地銀章魚燒：</strong>設有內用座位，外皮酥脆、內餡熱騰騰，完美小食。</li>
                  </ul>
                </div>
                <div>
                  <span class="font-bold text-amber-800 text-[12px] border-b border-amber-200/60 pb-0.5 mb-1 block">2 樓美食廣場 (採光絕佳、出餐迅速)</span>
                  <ul class="list-disc pl-4 space-y-1">
                    <li><strong>築地食堂 源ちゃん：</strong>高性價比海鮮丼專賣店，食材新鮮、分量十足。</li>
                    <li><strong>丸龜製麵：</strong>現做現煮日式讚岐烏冬配香脆炸天婦羅，經濟實惠。</li>
                    <li><strong>幸樂苑：</strong>老字號平價拉麵，醬油拉麵與煎餃的經典組合。</li>
                  </ul>
                </div>
              </div>
            </details>
          </div>
        `
      },
      {
        time: "14:30 - 15:00",
        title: "YUKIHIRA COFFEE 休憩",
        img: "https://cdn-ak.f.st-hatena.com/images/fotolife/d/deep-karuma-waap-ec-real-s1/20260720/20260720185804.jpg",
        tag: { text: "☕ 咖啡小憩", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/PLAjJVoyuemACVNC8?g_st=ac",
        navName: "YUKIHIRA COFFEE",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>14:30 質感咖啡：</strong>若逛完 AEON 還有空閒，推薦順路前往 <strong class="text-amber-700">YUKIHIRA COFFEE Tenpo Tendo</strong> 喝杯手沖咖啡放鬆一下。</p>
          </div>
        `
      },
      {
        time: "15:00 - 15:30",
        title: "微笑の宿 瀧之湯 Check-in",
        img: "https://sendai-kouiki-mice.com/wp-content/uploads/2024/12/pic-hohoeminoyado-02.jpg",
        tag: { text: "🏨 溫泉名宿", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>抵達【微笑之宿 瀧之湯】Check-in，確認 15:30 集合的「銀山溫泉夜景專車」乘車位置。</p>
          </div>
        `
      },
      {
        time: "15:30 - 19:15",
        title: "【極重要】銀山溫泉交通（二選一）➔ 夢幻夜景",
        img: "https://mimigo.tw/wp-content/uploads/20230105083619_51.jpg",
        tag: { text: "🏮 大正浪漫", class: "tag-sky" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
            <details class="bg-amber-50/80 border border-amber-200 rounded-xl shadow-sm group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-900 hover:bg-amber-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🚌</span> 銀山溫泉交通（二選一）</span>
                <span class="text-[10px] text-amber-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-amber-200/50 text-xs text-slate-700 space-y-3">
                <p class="text-[11px] md:text-xs text-amber-900">兩種方式皆可抵達銀山溫泉，請提前確認並完成預訂！</p>
                <div class="space-y-2">
                  <div class="bg-white/80 border border-amber-300 rounded-lg p-2">
                    <div class="flex items-center gap-1.5 mb-1">
                      <strong class="text-amber-800 block text-[12px]">方案A：接駁巴士 Fast Pass</strong>
                      <span class="bg-amber-400 text-amber-900 text-[9px] px-1.5 py-0.5 rounded-full font-black">首選</span>
                    </div>
                    <p class="text-[11px] leading-relaxed">到「大正浪漫館」轉乘接駁巴士，持 Fast Pass 免排隊上車。需在出發前 1-2 月上網搶票，票價 ¥1,500/人（4 張成人票）。</p>
                  </div>
                  <div class="bg-white/80 border border-sky-300 rounded-lg p-2">
                    <div class="flex items-center gap-1.5 mb-1">
                      <strong class="text-sky-800 block text-[12px]">方案B：Twilight 夢幻夜景專車</strong>
                      <span class="bg-sky-400 text-sky-900 text-[9px] px-1.5 py-0.5 rounded-full font-black">備案</span>
                    </div>
                    <p class="text-[11px] leading-relaxed">價格較高，僅作後備。若 Fast Pass 搶不到再考慮使用。</p>
                  </div>
                </div>
              </div>
            </details>
            <div class="text-[11px] text-rose-600 font-bold bg-rose-50 p-1.5 rounded mt-1 border border-rose-100">⚠️ 防滑與保暖提醒：氣溫極低(-2℃至-5℃)，木棧道與橋面易結冰，請穿防滑雪靴並緊牽小朋友！</div>
          </div>
        `
      },
      {
        time: "19:30 - 21:00",
        title: "天童溫泉周邊深夜美食 (晚餐自由選)",
        tag: { text: "🥩 彈性晚餐", class: "tag-amber" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p class="mb-3">從銀山溫泉返回時間較晚，推薦以下天童溫泉周邊營業較晚的人氣美食（點擊展開）：</p>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-slate-800 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🍜</span> 手打 水車生そば（首選）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700">
                <img src="https://svcstrg.cld.navitime.jp/travelguide/p06020024/p06020024_02.webp" class="w-full h-32 object-cover rounded-lg mb-2" alt="手打 水車生そば">
                <p class="text-[11px] text-slate-500 mb-2">天童極知名排隊名店</p>
                <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                  <li><strong class="text-rose-600">核心必吃「鳥中華」：</strong>日式鰹魚醬油高湯＋拉麵線條＋雞肉＋天婦羅碎屑，湯頭清爽鮮甜。</li>
                  <li><strong>本業蕎麥：</strong>石臼研磨全麥粉，手打蕎麥麵口感偏粗、極具嚼勁與天然香氣。</li>
                </ul>
                <a href="https://maps.app.goo.gl/XvHHsWwn3RNpx67m6?g_st=ac" target="_blank" class="mt-2.5 w-full flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold py-2 rounded-lg transition active:scale-95"><span>📍</span> 導航前往</a>
              </div>
            </details>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-slate-800 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🥩</span> 大衆焼肉けむすけ（開得比較夜）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700">
                <img src="https://www.yakiniku-ousama.com/_p/acre/9340/images/pc/smart_phone_993fe882.jpg" class="w-full h-32 object-cover rounded-lg mb-2" alt="大衆焼肉けむすけ 天童店">
                <p class="text-[11px] text-slate-500 mb-2">晚間宵夜首選燒肉</p>
                <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                  <li><strong>三大必點招牌：</strong><span class="text-rose-600 font-medium">名物 アカ</span>（哈拉米）、<span class="text-rose-600 font-medium">名物 シロ</span>（豬大腸）、<span class="text-rose-600 font-medium">炙り牛寿司</span></li>
                  <li><strong>小份量激推：</strong><span class="text-sky-700 font-medium">極上のひと切れ</span>（國產上等牛五花單片）</li>
                  <li><strong>隱藏靈魂：</strong>桌上自助檸檬沙瓦水龍頭（1小時無限暢飲）</li>
                </ul>
                <a href="https://maps.app.goo.gl/P3JM6zwqwNaGTmgTA?g_st=ac" target="_blank" class="mt-2.5 w-full flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold py-2 rounded-lg transition active:scale-95"><span>📍</span> 導航前往</a>
              </div>
            </details>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-slate-800 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🍣</span> いろは寿司（居酒屋風）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700">
                <img src="https://www.convention.or.jp/umaibe_2024/data_img/umd_355_02.jpg" class="w-full h-32 object-cover rounded-lg mb-2" alt="いろは寿司">
                <p class="text-[11px] text-slate-500 mb-2">在地特色人氣壽司與居酒屋</p>
                <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                  <li><strong>頂級壽司：</strong>職人現捏「特上握壽司」（約 ¥2,000 起）與肥美生魚片拼盤。</li>
                  <li><strong>招牌熟食：</strong>必點香氣濃郁的烤「鰻魚飯（鰻重）」（約 ¥2,500）。</li>
                  <li><strong>小酌首選：</strong>多款海鮮居酒屋小菜，搭配山形在地名酒。</li>
                </ul>
                <a href="https://maps.app.goo.gl/2FAqTdrbNJTeeQPu9?g_st=ac" target="_blank" class="mt-2.5 w-full flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold py-2 rounded-lg transition active:scale-95"><span>📍</span> 導航前往</a>
              </div>
            </details>
            <p class="text-[11px] text-slate-500 pt-1">吃飽後漫步回飯店，帶小朋友前往大浴場泡湯洗去寒氣，結束充實的 Day 2！</p>
          </div>
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
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>07:40–08:30 提早出發：</strong>於【微笑之宿 瀧之湯】享用早餐，吃飽後全家穿戴好保暖衣物出發。</p>
            <p><strong>自駕路線 (免轉公車)：</strong>天童溫泉 ➔ 山形西繞道 (國道 13 號) ➔ 藏王溫泉。</p>
            <p><strong>車程時間：</strong>約 45–50 分鐘（行車距離約 35 公里）。</p>
            <p class="text-[11px] text-amber-600 font-bold bg-amber-50 p-1.5 rounded mt-2">⚠️ 路況提醒：寬敞平地主幹道為主，但最後 15-20 分鐘為爬坡連續彎道，請小心駕駛。</p>
            <div class="bg-teal-50/80 border border-teal-200 p-2.5 text-teal-900 rounded-lg mt-2">
              <strong class="block mb-1">💡 週六自駕早鳥優勢：</strong>有 4WD 雪胎車，不需開去 JR 山形站排隊轉公車！務必在 08:30-09:00 前抵達「藏王索道」停車場，可完美避開週末第一波旅行團人潮。
            </div>
          </div>
        `
      },
      {
        time: "09:20 - 12:30",
        title: "搭乘雙段纜車登頂 ➔ 觀賞震撼「藏王樹冰」",
        tag: { text: "❄️ 樹冰奇景", class: "tag-sky" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Zao+Ropeway",
        navName: "藏王索道",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p class="mb-2"><strong>09:20–09:50 購票搭車：</strong>至【藏王索道】兌換或購買往返纜車票。</p>
            <details class="bg-sky-50/80 border border-sky-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-sky-900 hover:bg-sky-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">📸</span> 藏王樹冰實景照片集（左右滑動查看更多）</span>
                <span class="text-[10px] text-sky-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-sky-200/50 flex gap-2 overflow-x-auto scrollbar-none snap-x">
                <img src="https://hk.wamazing.com/media/wp-content/uploads/sites/5/2023/09/zaoujuhyou_pixta_73308950_M.jpg.webp" class="w-64 h-40 object-cover rounded-lg shrink-0 snap-center" alt="藏王樹冰">
                <img src="https://wp-odai.wamazing.com/media/wp-content/uploads/sites/2/2023/09/zaoujuhyou_pixta_85145645_M.jpg.webp" class="w-64 h-40 object-cover rounded-lg shrink-0 snap-center" alt="藏王纜車">
                <img src="https://wp-odai.wamazing.com/media/wp-content/uploads/sites/2/2023/09/zaoujuhyou_pixta_73182403_M.jpg.webp" class="w-64 h-40 object-cover rounded-lg shrink-0 snap-center" alt="藏王雪景">
                <img src="https://wp-odai.wamazing.com/media/wp-content/uploads/sites/2/2023/09/zaoujuhyou_zao_17.jpg.webp" class="w-64 h-40 object-cover rounded-lg shrink-0 snap-center" alt="藏王樹冰">
              </div>
            </details>
            <details class="bg-rose-50/80 border border-rose-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-900 hover:bg-rose-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🎟️</span> 【極重要】優先票搶票作戰</span>
                <span class="text-[10px] text-rose-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-rose-200/50 text-xs text-slate-700 space-y-3">
                <div class="bg-white/80 p-2.5 rounded-lg border border-rose-100">
                  <strong class="text-rose-800 block mb-1">1️⃣ 提早註冊 Asoview!</strong>
                  <p class="text-[11px] leading-relaxed">提前至 Asoview! 網站完成註冊並綁定信用卡，避免搶票時卡在驗證。</p>
                </div>
                <div class="bg-white/80 p-2.5 rounded-lg border border-rose-100 relative overflow-hidden">
                  <div class="absolute right-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                  <strong class="text-rose-800 block mb-1 flex items-center gap-1"><span>⏰</span> 2️⃣ 設定搶票鬧鐘 (1月15日 22:55)</strong>
                  <p class="text-[11px] leading-relaxed">系統於搭乘日 <strong class="text-rose-600">前 7 天日本時間 00:00</strong> 釋出。您的搭乘日是 1/23，開賣時間為 <strong class="text-rose-600">香港時間 1/15 晚上 23:00</strong>。</p>
                </div>
                <div class="bg-white/80 p-2.5 rounded-lg border border-rose-100">
                  <strong class="text-rose-800 block mb-1">3️⃣ 鎖定最早時段</strong>
                  <p class="text-[11px] leading-relaxed">開賣後直接鎖定 <strong class="text-rose-600">08:30 或 09:00</strong> 結帳。週六優先票通常 5 分鐘內秒殺！(往年參考：成人 ¥5,500 / 兒童 ¥3,500)</p>
                </div>
              </div>
            </details>
            <details class="bg-indigo-50/80 border border-indigo-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-indigo-900 hover:bg-indigo-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🚠</span> 纜車搭乘與避堵策略</span>
                <span class="text-[10px] text-indigo-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-indigo-200/50 text-xs text-slate-700 space-y-1.5">
                <ul class="list-disc pl-4 space-y-1.5">
                  <li><strong class="text-indigo-700">優先票限制：</strong>只保證<strong class="text-rose-600">「第一段上山」</strong>免排隊。半山腰轉乘及整趟下山都需與一般遊客排隊。</li>
                  <li><strong class="text-slate-700">車廂擁擠：</strong>車廂內常塞滿滑雪客，長輩可能需站立 10-15 分鐘。</li>
                  <li><strong class="text-indigo-700">避堵技巧：</strong>坐第一班纜車 (約 8:15 發車) 基本免排隊。建議路線：<strong>先直達山頂</strong>，下山時再停半山腰「樹冰高原站」拍照錯峰。</li>
                </ul>
              </div>
            </details>
            <details class="bg-amber-50/80 border border-amber-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-900 hover:bg-amber-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">⚠️</span> 【保命級】長輩幼兒安全守則</span>
                <span class="text-[10px] text-amber-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-amber-200/50 text-xs text-slate-700 space-y-2.5">
                <div class="flex items-start gap-2">
                  <span class="text-base shrink-0">🥶</span>
                  <div><strong class="block text-slate-800 mb-0.5">拒絕皮膚外露 (防凍傷)</strong><p class="text-[11px] leading-relaxed">山頂體感常逼近 -20℃。4歲小孩必備：蓋耳毛帽、高領圍脖/面罩、包覆性護目鏡。不能有一絲皮膚暴露。</p></div>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-base shrink-0">⛸️</span>
                  <div><strong class="block text-slate-800 mb-0.5">小心天然溜冰場</strong><p class="text-[11px] leading-relaxed">前往地藏菩薩的積雪常被踩成堅硬冰面。長輩與小孩強烈建議套上<strong class="text-rose-600">簡易冰爪</strong>，大人務必緊牽小孩。</p></div>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-base shrink-0">🏃‍♂️</span>
                  <div><strong class="block text-slate-800 mb-0.5">隨時準備撤退</strong><p class="text-[11px] leading-relaxed">若出站發現能見度極低或風雪打臉會痛，請果斷留在室內暖氣區或展望台，<strong class="text-rose-600">千萬不要勉強走到戶外</strong>。</p></div>
                </div>
              </div>
            </details>
            <details class="bg-teal-50/80 border border-teal-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-teal-900 hover:bg-teal-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">📸</span> 拍照與遊玩亮點</span>
                <span class="text-[10px] text-teal-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-teal-200/50 text-xs text-slate-700 space-y-1.5">
                <ul class="list-disc pl-4 space-y-1">
                  <li><strong>推薦路線：</strong>山麓站 ➔ 樹冰高原站(換乘) ➔ 地藏山頂站 ➔ 原路返回 (全程約 2 小時)。</li>
                  <li><strong>必打卡機位：</strong>纜車前進方向的靠窗位 (俯瞰樹冰林) / 山頂地藏菩薩像 / 「Restaurant Sancho」山頂餐廳落地窗前。</li>
                  <li><strong>天氣確認：</strong>出發前務必看天氣預報，晴天（藍鳥天）景色最佳。</li>
                  <li><strong>備妥現金：</strong>山上部分小攤和扭蛋機只收現金。</li>
                </ul>
              </div>
            </details>
            <p class="text-[11px] text-rose-600 font-bold bg-rose-50 p-1.5 rounded mt-2">⚠️ 山頂極致保暖：地藏山頂站氣溫常低至 -10℃ 且風勢強勁。請幫 4 歲小朋友穿齊發熱衣、羽絨、防水雪褲與防風毛帽。</p>
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
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div class="flex justify-between items-start mb-1.5">
                <strong class="text-[14px] text-slate-900">🍣 うまい鮨勘 山形南支店</strong>
                <span class="bg-sky-100 text-sky-700 text-[9px] px-2 py-0.5 rounded-full font-black shrink-0">人氣名店</span>
              </div>
              <p class="text-[11px] text-slate-500 mb-2">📍 地址：山形縣山形市若宮2丁目10-2（附設寬敞停車場）</p>
              <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                <li>食材新鮮、選擇多樣</li>
                <li>用餐環境對兒童友善</li>
                <li>非常適合大人小孩一同飽餐一頓</li>
              </ul>
              <a href="https://maps.app.goo.gl/eSMkZD1m3vimNytv7" target="_blank" class="mt-2.5 w-full flex items-center justify-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-bold py-2 rounded-lg transition active:scale-95"><span>📍</span> 導航前往</a>
            </div>
          </div>
        `
      },
      {
        time: "14:00 - 15:00",
        title: "預約 14:00 寒河江草莓園 ➔ 冬季溫室草莓吃到飽 (彈性備案)",
        img: "http://www2.ic-net.or.jp/~icrose/img/aboutus/top_aboutus_right.jpg",
        tag: { text: "🍓 溫室採果", class: "tag-sky" },
        navUrl: "https://maps.app.goo.gl/ZNG1U3GgY6Hfdptz8",
        navName: "寒河江草莓園",
        open: true,
        content: `
          <div class="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>從山形市區驅車前往 <strong>寒河江草莓園 (Sagae Strawberry Farm)</strong>。</p>
            <details class="bg-rose-50/80 border border-rose-200 rounded-xl shadow-sm mt-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-900 hover:bg-rose-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🍓</span> 點擊展開：草莓園詳情與彈性備案</span>
                <span class="text-[10px] text-rose-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-rose-200/50 text-xs text-slate-700 space-y-2">
                <ul class="list-disc pl-5 space-y-1.5 text-slate-700">
                  <li><strong class="text-rose-700">體驗費用：</strong>30 分鐘草莓吃到飽。大人約 ¥1,800 ~ ¥2,300 日圓。</li>
                  <li><strong class="text-rose-700">草莓品種：</strong>現場依產期提供多種品種 (如章姬、紅臉頰等) 可親自比較獨特口感。</li>
                </ul>
                <div class="text-[11px] text-amber-700 font-bold bg-amber-50 border border-amber-200 p-2.5 rounded-xl mt-2">
                  <strong>彈性備案：</strong><br>提前預約 14:00 採草莓行程。如果早上在藏王樹冰玩得較久、下山遲了，可以直接取消此行程返回飯店休息。後續再把採草莓行程安排在仙台市區周邊（如：仙台農業園藝中心 或 震災復興的山元草莓農園）進行即可，保持行程彈性！
                </div>
              </div>
            </details>
          </div>
        `
      },
      {
        time: "15:30 - 16:30",
        title: "返回天童溫泉，市區輕鬆漫步與休憩",
        tag: { text: "☕ 悠閒午後", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        open: false,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>開車約 30 分鐘返回天童市，回到「微笑之宿 瀧之湯」。</p>
            <p>此時段可以讓小朋友在榻榻米房間睡個午覺，大人則可以到附近散步、去便利商店補給，或在飯店內的大廳品茶放鬆。</p>
          </div>
        `
      },
      {
        time: "16:30 - 20:00",
        title: "獨享「貸切風呂」與 1月23日 限定懷石晚餐",
        img: "https://www.nipponsensor.net/wp-content/uploads/2025/08/%E5%BE%AE%E7%AC%91%E4%B9%8B%E5%AE%BF%E7%80%A7%E4%B9%8B%E6%B9%AF-04.jpg",
        tag: { text: "♨️ 私人包廂", class: "tag-indigo" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=微笑の宿+滝の湯",
        navName: "微笑の宿 瀧之湯",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>16:30–17:30 貸切風呂 (私人包廂湯)：</strong>體驗預訂好的私人包廂湯，全家人輕鬆泡湯洗去寒氣，免擔心 4 歲小朋友在公共大浴場吵鬧。</p>
            <p><strong>18:00–20:00 懷石晚餐：</strong>於飯店享用特別預訂的第二晚日式懷石料理，品嘗山形在地精緻食材，為一天畫下完美句點。</p>
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
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>09:30 啟程：</strong>於【微笑之宿 瀧之湯】從容享用早餐並退房，將所有行李箱裝入 Minivan。</p>
            <p>開車前往【Spring Valley 仙台泉】滑雪場（車程約 1 小時 15 分鐘）。正好讓小朋友在車上小憩片刻。</p>
          </div>
        `
      },
      {
        time: "10:45 - 14:30",
        title: "【雪之冒險王國】玩雪放電與滑雪場午餐",
        img: "https://lovetogo.tw/201802-tohoku/spring-valley/photo/20180204-1310-0344.jpg",
        tag: { text: "☃️ 玩雪放電", class: "tag-sky" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p class="mb-2">抵達滑雪場，專攻 4 歲小孩玩雪！點擊展開查看攻略與避坑重點：</p>
            <details class="bg-blue-50/80 border border-blue-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-blue-900 hover:bg-blue-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🎟️</span> 「雪之冒險王國」票價與營業</span>
                <span class="text-[10px] text-blue-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-blue-200/50 text-xs text-slate-700 space-y-1.5">
                <ul class="list-disc pl-4 space-y-1">
                  <li><strong class="text-blue-700">假日前往（週六、日、假日）：</strong>必須買門票。4歲及陪同家長皆 2,000日圓 (網購1,500日圓)，雪盆/滑梯/傳送帶無限暢玩。</li>
                  <li><strong class="text-blue-700">平日前往（週一至五）：</strong>玩雪專區不開放，全場免門票。只需單租雪盆 (300日圓) 即可在平緩區玩。</li>
                </ul>
              </div>
            </details>
            <details class="bg-sky-50/80 border border-sky-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-sky-900 hover:bg-sky-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🎯</span> 3 大必玩活動</span>
                <span class="text-[10px] text-sky-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-sky-200/50 text-xs text-slate-700 space-y-1.5">
                <ul class="list-disc pl-4 space-y-1">
                  <li><strong class="text-sky-700">旋轉雪盆：</strong>最安全！像雪地旋轉木馬，爸媽拍照超輕鬆。</li>
                  <li><strong class="text-sky-700">魔毯滑雪盆：</strong>必坐「電動傳送帶」上坡，省下小孩體力不鬧抱。</li>
                  <li><strong class="text-sky-700">雪地夾鴨子：</strong>帶個「雪球夾」模具，放電又好玩。</li>
                </ul>
              </div>
            </details>
            <details class="bg-rose-50/80 border border-rose-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-900 hover:bg-rose-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">⚠️</span> 3 大避坑重點</span>
                <span class="text-[10px] text-rose-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-rose-200/50 text-xs text-slate-700 space-y-1.5">
                <ul class="list-disc pl-4 space-y-1">
                  <li><strong class="text-rose-700">別帶推車：</strong>雪地推不動。改讓小孩坐進租來的雪盆裡，拉著走最省力。</li>
                  <li><strong class="text-rose-700">備兩雙手套：</strong>小孩玩雪手套極易濕透，下午換上第二雙乾的才不凍傷。</li>
                  <li><strong class="text-rose-700">預防上廁所：</strong>連身雪衣極難脫！進場前、午餐後務必定時帶去主建築上廁所。</li>
                </ul>
              </div>
            </details>
            <div class="text-[11px] text-slate-500 font-bold bg-slate-100 p-2 rounded-xl mt-2">🧥 可選花費 (幼童裝備租借 4小時)：兒童雪衣+雪褲 3,300 日圓 / 兒童雪靴 1,500 日圓 (若自行穿著防水衣物與雨鞋則為 0 元)。</div>
            <p class="pt-2"><strong>13:00–14:30 溫暖午餐：</strong>玩完雪後，在滑雪場溫暖的室內餐廳享用熱騰騰的拉麵與咖哩飯，讓孩子回暖並去洗手間換裝。</p>
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
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>抵達仙台市區飯店（連住 3 晚 2 間雙床房）。車停東口 24HR 平面計費停車場。</p>
          </div>
        `
      },
      {
        time: "17:30 - 20:00",
        title: "晚餐 ➔ 伊達の牛たん本舗 本店",
        img: "https://odekake.life/wp-content/uploads/2022/03/dategyu_001-1536x1024.jpg",
        tag: { text: "🥩 必吃名店", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/3pwjdGMZZeGCRq1MA",
        navName: "伊達牛舌本舗 本店",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
              <div class="flex justify-between items-start">
                <strong class="text-[14px] text-slate-900">👑 大人的招牌</strong>
                <span class="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-black shrink-0">必點</span>
              </div>
              <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                <li>註冊商標「芯舌（芯たん）」</li>
                <li>厚切但極其軟嫩多汁，完全不用擔心咬不動</li>
                <li>定食麥飯可免費續碗一次</li>
              </ul>
            </div>
            <div class="bg-sky-50/80 border border-sky-200 rounded-xl p-3.5 shadow-sm space-y-2">
              <div class="flex justify-between items-start">
                <strong class="text-[14px] text-slate-900">👦 適合 4 歲小孩</strong>
                <span class="bg-sky-100 text-sky-700 text-[9px] px-2 py-0.5 rounded-full font-black shrink-0">兒童友善</span>
              </div>
              <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                <li>燉得軟爛、口味甜鹹的「燉牛舌」和「牛舌咖哩」</li>
                <li>牛舌漢堡排、烤雞肉串、鮭魚卵親子飯與魚翅拉麵</li>
                <li>不吃烤肉的小孩也能吃得很開心！</li>
              </ul>
            </div>
          </div>
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
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>早上從飯店出發，開車約 15 分鐘抵達<strong>珈琲所 コメダ珈琲店 (客美多咖啡) 仙台富澤店</strong>享用早餐。</p>
            <div class="bg-indigo-50/80 border border-indigo-200 p-2.5 rounded-xl text-indigo-900 mt-1">
              <strong class="block mb-1">🚗 完美的狐狸村動線：</strong>享用完早餐後，可直接從附近的「長町 IC」或「仙台南 IC」開上東北自動車道一路往南，直達「白石 IC」前往狐狸村。總車程與原本直接去狐狸村幾乎一樣順路！
            </div>
          </div>
        `
      },
      {
        time: "09:30 - 12:00",
        title: "出發與【宮城藏王狐狸村】雪地互動",
        tag: { text: "🦊 萌寵互動", class: "tag-sky" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Miyagi+Zao+Fox+Village",
        navName: "狐狸村",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>開車抵達狐狸村。</strong>4 歲小朋友必須由家長<strong class="text-rose-700">全程緊牽手</strong>，絕對禁止觸摸放養區狐狸。</p>
            <details class="bg-sky-50/80 border border-sky-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-sky-900 hover:bg-sky-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">📸</span> 狐狸村實景照片集（左右滑動查看更多）</span>
                <span class="text-[10px] text-sky-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-sky-200/50 flex gap-2 overflow-x-auto scrollbar-none snap-x">
                <img src="https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-0946-3472.jpg" class="w-64 h-40 object-cover rounded-lg shrink-0 snap-center" alt="狐狸村">
                <img src="https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-1004-3540.jpg" class="w-64 h-40 object-cover rounded-lg shrink-0 snap-center" alt="狐狸村">
                <img src="https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-1011-3570.jpg" class="w-64 h-40 object-cover rounded-lg shrink-0 snap-center" alt="狐狸村">
                <img src="https://lovetogo.tw/202001-tohoku/foxvillage/photo/20200128-1031-3635.jpg" class="w-64 h-40 object-cover rounded-lg shrink-0 snap-center" alt="狐狸村">
              </div>
            </details>
            <details class="bg-rose-50/80 border border-rose-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-900 hover:bg-rose-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🚨</span> 4 歲幼兒安全守則</span>
                <span class="text-[10px] text-rose-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-rose-200/50 text-xs text-slate-700 space-y-2">
                <ul class="list-disc pl-4 space-y-1.5">
                  <li><strong class="text-rose-700">全程緊牽：</strong>家長需一對一牽牢，嚴禁奔跑、蹲下或伸手摸狐狸（會被咬傷）。</li>
                  <li><strong class="text-rose-700">穿著禁忌：</strong>嚴禁飄逸長裙、吊繩、流蘇，以及會發出沙沙聲的黑色塑膠袋。</li>
                  <li><strong class="text-rose-700">餵食規定：</strong>只能在指定「高台區」拋擲專用飼料，嚴禁私自手餵。</li>
                </ul>
              </div>
            </details>
            <details class="bg-teal-50/80 border border-teal-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-teal-900 hover:bg-teal-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🚗</span> 自駕與時間規劃</span>
                <span class="text-[10px] text-teal-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-teal-200/50 text-xs text-slate-700 space-y-2">
                <ul class="list-disc pl-4 space-y-1.5">
                  <li><strong class="text-teal-700">抵達時間：</strong>建議 <strong>09:30 - 10:00</strong> 抵達（狐狸活動力最強、停車位充足）。</li>
                  <li><strong class="text-teal-700">雪地駕駛：</strong>山路極易結冰，務必使用 4WD + 雪胎，下坡善用低速檔（L/2檔）。</li>
                </ul>
              </div>
            </details>
            <details class="bg-amber-50/80 border border-amber-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-900 hover:bg-amber-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">📸</span> 體驗與實用貼心提醒</span>
                <span class="text-[10px] text-amber-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-amber-200/50 text-xs text-slate-700 space-y-2">
                <ul class="list-disc pl-4 space-y-1.5">
                  <li><strong class="text-amber-700">抱狐狸體驗：</strong>僅限國中以上（約 ¥700/次），4 歲幼兒無法參加，可在旁拍照。</li>
                  <li><strong class="text-amber-700">無法使用推車：</strong>園區多為雪地坡道與階梯，推車完全推不動，需全程步行。</li>
                  <li><strong class="text-amber-700">停留時間：</strong>預留 <strong>1.5～2 小時</strong> 即非常充裕，結束後可順路下山吃白石溫麵。</li>
                </ul>
              </div>
            </details>
          </div>
        `
      },
      {
        time: "12:15 - 13:45",
        title: "白石午餐 ➔ 傳統名物「白石溫麵」三選一",
        tag: { text: "🍜 在地名物", class: "tag-amber" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p class="mb-3">離開狐狸村開車約 15 分鐘回到白石市區。點擊展開查看以下三選一：</p>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-700 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🌟</span> 手延白石溫麵 光庵（推薦）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700">
                <img src="https://oniwa.garden/wp-content/img/04_miyagi/2604_shiroishi_tsurigane/02.jpeg" class="w-full h-32 object-cover rounded-lg mb-2" alt="手延白石溫麵 光庵">
                <p class="text-[11px] text-slate-500 mb-2">歷史悠久，醬汁極具特色</p>
                <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                  <li><strong class="text-sky-700">招牌冷麵：三種醬汁溫麵</strong>一次品嚐三種沾醬（經典鰹魚醬油、濃郁胡麻、當地傳統核桃醬）。</li>
                  <li><strong class="text-rose-600">招牌熱麵：</strong>特製雞湯溫麵暖胃，或傳統葛粉勾芡溫麵加入大量蔬菜。</li>
                </ul>
                <a href="https://maps.app.goo.gl/wwgroAhTgSeapcXXA?g_st=ac" target="_blank" class="mt-2.5 w-full flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold py-2 rounded-lg transition active:scale-95"><span>📍</span> 導航前往</a>
              </div>
            </details>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-700 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🥢</span> 白石うーめん やまぶき亭（選擇豐富）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700">
                <img src="https://shiroishi-navi.jp/wp-content/uploads/2018/03/shzZkbG4791p6nR3sNXf8tnzqz1kl0.jpg" class="w-full h-32 object-cover rounded-lg mb-2" alt="白石うーめん やまぶき亭">
                <p class="text-[11px] text-slate-500 mb-2">色彩繽紛、選擇多樣</p>
                <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                  <li><strong>組合豐富：</strong>提供芝麻、核桃、醬油三種沾醬的「溫麵三昧」。</li>
                  <li><strong>必吃：</strong>酥脆好吃的「天ぷらうーめん（天婦羅溫麵）」。</li>
                </ul>
                <a href="https://maps.app.goo.gl/VudKdyUMEgfc5CKJ8?g_st=ac" target="_blank" class="mt-2.5 w-full flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold py-2 rounded-lg transition active:scale-95"><span>📍</span> 導航前往</a>
              </div>
            </details>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-amber-700 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🍤</span> 讃岐づくり本格手打ちうどん 麦の季（人氣烏龍）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700">
                <img src="https://www.ichijoh.co.jp/wp/wp-content/uploads/2023/04/muginoki.jpg" class="w-full h-32 object-cover rounded-lg mb-2" alt="讃岐づくり本格手打ちうどん 麦の季">
                <p class="text-[11px] text-slate-500 mb-2">評價極高的手打烏龍麵專門店</p>
                <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                  <li><strong>必吃：</strong>大蝦天婦羅盛りざるうどん（大蝦天婦羅冷烏龍麵）。</li>
                  <li><strong>特色：</strong>高級藏王鴨的「蔵王鴨つけうどん」（鴨肉沾麵）。</li>
                </ul>
                <a href="https://maps.app.goo.gl/a25hoeAAf6BQtD44A" target="_blank" class="mt-2.5 w-full flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold py-2 rounded-lg transition active:scale-95"><span>📍</span> 導航前往</a>
              </div>
            </details>
          </div>
        `
      },
      {
        time: "13:45 - 14:45",
        title: "驅車返回仙台市區",
        tag: { text: "🚗 輕鬆車程", class: "tag-teal" },
        navUrl: "",
        open: false,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>從白石市區開車返回仙台市區（車程約 1 小時），正好讓小朋友在車上睡個舒適的午覺。</p>
          </div>
        `
      },
      {
        time: "14:45 - 18:00",
        title: "仙台市區購物 (PARCO、3COINS、Daiso、唐吉訶德)",
        tag: { text: "🛍️ 市區血拼", class: "tag-rose" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p class="mb-2 font-bold">仙台市區購物全攻略（點擊展開）</p>
            <details class="bg-white border border-slate-200 rounded-xl shadow-sm group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-700 hover:bg-slate-50 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🛍️</span> 仙台市區購物（潮牌 / 買物 / 小食）</span>
                <span class="text-[10px] text-slate-400 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <div class="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 shadow-sm">
                  <strong class="block text-[13px] text-indigo-900 mb-1">✨ 大人潮牌朝聖：THE GALLERY BOX</strong>
                  <p class="text-[11px] text-slate-600">位置：仙台 PARCO 4F。販售 Salomon、MM6 Maison Margiela 等限量聯名系列。</p>
                  <a href="https://www.google.com/maps/search/?api=1&query=Sendai+PARCO" target="_blank" class="mt-2 block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-[11px] font-bold transition">📍 導航前往 仙台 PARCO</a>
                </div>
                <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                  <strong class="block text-[13px] text-slate-800 mb-2">📍 私藏逛街與好物採買清單</strong>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center gap-2">
                      <span class="text-[12px]">🪙 <strong>3COINS</strong> <span class="text-slate-500">(300円生活雜貨)</span></span>
                      <a href="https://maps.app.goo.gl/uFUSHdEotSbewYDZ9" target="_blank" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg text-[10px] font-bold transition shrink-0">📍 導航</a>
                    </div>
                    <div class="flex justify-between items-center gap-2">
                      <span class="text-[12px]">🏬 <strong>Daiso ヨドバシ仙台店</strong> <span class="text-slate-500">(百元商店)</span></span>
                      <a href="https://maps.app.goo.gl/Mg38a3Q4dVi7U38D7?g_st=ac" target="_blank" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg text-[10px] font-bold transition shrink-0">📍 導航</a>
                    </div>
                    <div class="flex justify-between items-center gap-2">
                      <span class="text-[12px]">🐧 <strong>唐吉訶德 仙台駅西口本店</strong> <span class="text-slate-500">(藥妝零食)</span></span>
                      <a href="https://maps.app.goo.gl/6Ti8UJyEa1tFreBW7?g_st=ac" target="_blank" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg text-[10px] font-bold transition shrink-0">📍 導航</a>
                    </div>
                  </div>
                </div>
                <div class="bg-amber-50/40 border border-amber-100 rounded-xl p-3 shadow-sm">
                  <strong class="block text-[13px] text-amber-900 mb-2">🍡 逛街能量補給 (站前人氣小食)</strong>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center gap-2">
                      <span class="text-[12px]">🫘 <strong>ankoya 駅前店</strong> <span class="text-slate-500">(豆沙銅鑼燒)</span></span>
                      <a href="https://maps.app.goo.gl/ayEVAqZY779V7WF49?g_st=ac" target="_blank" class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg text-[10px] font-bold transition shrink-0">📍 導航</a>
                    </div>
                    <div class="flex justify-between items-center gap-2">
                      <span class="text-[12px]">🐟 <strong>鯛吉 名掛丁本店</strong> <span class="text-slate-500">(現烤鯛魚燒)</span></span>
                      <a href="https://maps.app.goo.gl/D5GqutNmGGPh6WrQA?g_st=ac" target="_blank" class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg text-[10px] font-bold transition shrink-0">📍 導航</a>
                    </div>
                  </div>
                </div>
                <div class="bg-teal-50 border border-teal-100 p-3 rounded-xl flex items-start gap-2">
                  <span class="text-base shrink-0">🚗</span>
                  <span class="text-[11px] text-teal-800 font-medium leading-relaxed">戰利品輕鬆載：這幾間店都在市區範圍，自駕的好處買完可以先丟車上，不用提著大包小包！</span>
                </div>
              </div>
            </details>
          </div>
        `
      },
      {
        time: "18:00 - 20:00",
        title: "晚餐：仙台特色美食與返家放鬆",
        tag: { text: "🥩 燒肉牛舌", class: "tag-amber" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>逛完街戰利品放回後車廂，前往享用厚切炭烤牛舌（如「善治郎/司/利久」），或是在車站 S-PAL 美食街輕鬆用餐。</p>
            <p>晚餐後漫步返抵 Hotel Grand Bach。家長可利用 <strong class="text-indigo-700">16F 投幣洗衣機</strong> 洗淨這幾天的衣物，並享受 <strong class="text-indigo-700">頂樓大浴場</strong> 徹底放鬆！</p>
          </div>
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
        img: "https://sendaiminami-tusin.com/wp-content/uploads/2023/08/img_7984.jpg",  // ✅ 新增圖片
        tag: { text: "🥐 人氣麵包", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/FmsKLHRKk3g3z6UDA",
        navName: "THE MOST BAKERY",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>08:00 早餐：</strong>前往 <strong>THE MOST BAKERY ＆ COFFEE 東口店</strong> 享用早餐。</p>
            <div class="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-amber-900 mt-2">
              <strong class="block mb-1">🍞 食物亮點：</strong>
              <ul class="list-disc pl-4 space-y-1">
                <li>招牌「純生」食麵包非常柔軟、漢堡與鬆餅受歡迎。</li>
                <li>自家焙煎咖啡承襲老字號技術，香氣濃郁。</li>
                <li>早上 8:00 營業，早餐套餐（加價升級）非常划算。</li>
              </ul>
            </div>
          </div>
        `
      },
      {
        time: "09:15 - 09:50",
        title: "輕鬆出發前往仙台郊區 (水族館或草莓園)",
        tag: { text: "🚗 輕鬆車程", class: "tag-teal" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>09:15 出發：</strong>享用完早餐後，全家穿戴好保暖衣物出發。</p>
            <p><strong>駕駛路線：</strong>仙台市區出發，無論是前往水族館或各大草莓園，車程皆在 30 分鐘內。</p>
            <p class="text-[11px] text-slate-500">💡 輕鬆移動：今日景點集中於仙台平地郊區，車程極短、完全免除拉車疲勞！</p>
          </div>
        `
      },
      {
        time: "10:00 - 12:30",
        title: "晨間二選一：海洋水族館 🐧 OR 溫室採草莓 🍓",
        tag: { text: "🎯 彈性早晨", class: "tag-sky" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p class="mb-2">請依據當天孩子們的興趣選擇，點擊展開查看行程：</p>
            <details class="bg-sky-50/80 border border-sky-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-sky-900 hover:bg-sky-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🐬</span> 選擇 A：仙台海洋森林水族館</span>
                <span class="text-[10px] text-sky-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-sky-200/50 text-xs text-slate-700 space-y-2">
                <p class="text-[11px] text-slate-500">📍 導航：Sendai Umino-Mori Aquarium</p>
                <p>門票成人 2,400 日圓，幼兒 800 日圓。帶小朋友觀賞超萌的「冬季限定企鵝雪地散步」。</p>
                <ul class="list-disc pl-4 space-y-1.5 mt-1 text-[11px]">
                  <li><strong>室內海豚＆海獅秀：</strong>設有防風透光頂棚與暖氣，大人小孩不必吹冷風即可欣賞精采演出。</li>
                  <li><strong>閃耀生命之海：</strong>數萬尾沙丁魚群隨音樂悠游，極具視覺震撼。</li>
                  <li><strong>互動摸摸池：</strong>適合 4 歲小朋友高度的觸摸池與各式海洋生物體驗區。</li>
                </ul>
              </div>
            </details>
            <details class="bg-rose-50/80 border border-rose-200 rounded-xl shadow-sm mb-2 group/inner">
              <summary class="px-3.5 py-2.5 cursor-pointer text-[13px] font-bold text-rose-900 hover:bg-rose-100 flex justify-between items-center transition-colors">
                <span class="flex items-center gap-1.5"><span class="text-base">🍓</span> 選擇 B：仙台市區溫室採草莓（三選一）</span>
                <span class="text-[10px] text-rose-500 transition-transform group-open/inner:rotate-180">▼</span>
              </summary>
              <div class="p-3.5 border-t border-rose-200/50 text-xs text-slate-700">
                <div class="space-y-3">
                  <details class="bg-rose-50/60 border border-rose-100 rounded-lg">
                    <summary class="px-3 py-2 cursor-pointer text-[12px] font-bold text-rose-800 hover:bg-rose-100 flex justify-between items-center">1. 一苺一笑 松森農場（免預約）<span class="text-[10px]">▼</span></summary>
                    <div class="p-2.5 border-t border-rose-100 text-[11px] text-slate-600">
                      <p>⭐️ 4.4分。40分鐘吃到飽、北海道煉乳無限續加、草莓架高免彎腰。</p>
                      <p class="mt-1"><strong>優勢：</strong>現場排隊制，行程最彈性，適合臨時前往（建議早上出發以免大草莓被採光）。</p>
                      <a href="https://maps.app.goo.gl/Q91PEDo22zahngNy5?g_st=ac" target="_blank" class="mt-1.5 block text-center bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 py-1 rounded font-bold">📍 導航前往</a>
                    </div>
                  </details>
                  <details class="bg-rose-50/60 border border-rose-100 rounded-lg">
                    <summary class="px-3 py-2 cursor-pointer text-[12px] font-bold text-rose-800 hover:bg-rose-100 flex justify-between items-center">2. JR水果公園仙台荒濱（官網預約）<span class="text-[10px]">▼</span></summary>
                    <div class="p-2.5 border-t border-rose-100 text-[11px] text-slate-600">
                      <p>⭐️ 4.0分。園區大且極乾淨、動線寬敞、附設農產市集與大飯店主廚監製餐廳。</p>
                      <p class="mt-1"><strong>優勢：</strong>有友善的繁中/英文網路介面，最適合想在出發前搞定名額的旅客 (30分鐘限制)。</p>
                      <a href="https://maps.app.goo.gl/H3EDkLGrVGBg3Sth9?g_st=ac" target="_blank" class="mt-1.5 block text-center bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 py-1 rounded font-bold">📍 導航前往</a>
                    </div>
                  </details>
                  <details class="bg-rose-50/60 border border-rose-100 rounded-lg">
                    <summary class="px-3 py-2 cursor-pointer text-[12px] font-bold text-rose-800 hover:bg-rose-100 flex justify-between items-center">3. Berry Planet (燦燦園)（假日強預約）<span class="text-[10px]">▼</span></summary>
                    <div class="p-2.5 border-t border-rose-100 text-[11px] text-slate-600">
                      <p>⭐️ 4.3分。老字號農家經營、草莓完熟甜度極高、附設精緻網美風草莓咖啡廳。</p>
                      <p class="mt-1"><strong>優勢：</strong>週末/假日必須提早網路預約，但品質有保障。平日相對有彈性。</p>
                      <a href="https://maps.app.goo.gl/yHuF1t7Vk9s3iPGc8?g_st=ac" target="_blank" class="mt-1.5 block text-center bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 py-1 rounded font-bold">📍 導航前往</a>
                    </div>
                  </details>
                </div>
              </div>
            </details>
            <div class="text-[11px] text-teal-800 font-bold bg-teal-50 border border-teal-200 p-2.5 rounded-xl mt-2 flex items-start gap-1.5">
              <span class="text-base mt-0.5">💡</span>
              <span class="leading-relaxed">兩個行程都在仙台市區周邊，中午結束後都能在 15-20 分鐘內輕鬆開車抵達「仔虎 利府店」吃午餐！</span>
            </div>
          </div>
        `
      },
      {
        time: "12:45 - 14:15",
        title: "極致和牛燒肉午餐 ➔ 【仔虎 利府店】(最推薦✨)",
        img: "https://matipura.com/CORE/wp-content/uploads/2021/03/DSC00724.jpg",  // ✅ 新增圖片
        tag: { text: "🥩 頂級和牛", class: "tag-amber" },
        navUrl: "https://maps.app.goo.gl/n8F39N1Zq9q57g769",
        navName: "仔虎 利府店",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p class="mb-3">完美契合點！早上在「海洋森林水族館」或周邊溫室採草莓，結束後開車僅需 <strong>15 分鐘</strong> 就能抵達利府店。這是仔虎的「郊區旗艦店」，對自駕家庭極度友善！</p>
            <div class="bg-indigo-50/80 border border-indigo-200 p-3 rounded-xl shadow-sm mb-3">
              <strong class="block text-indigo-900 mb-1 flex items-center gap-1.5"><span class="text-base">🚗</span> 大車與親子優勢</strong>
              <p class="text-[11px] leading-relaxed text-indigo-800">門口自帶 <strong>20 個大型免費平面車位</strong>，大休旅車隨便停。店內走道極寬，完全不用爬樓梯，設有兒童專屬菜單，氣氛對親子極度友善，不會像市區店那樣拘謹。</p>
            </div>
            <div class="space-y-3">
              <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                <div class="flex justify-between items-start mb-1.5">
                  <strong class="text-[14px] text-slate-900">🍱 平日極高性價比 Lunch</strong>
                  <span class="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-black shrink-0">超值</span>
                </div>
                <p class="text-[11px] text-slate-500 mb-2">附泡菜、湯、沙拉</p>
                <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                  <li><strong>上燒肉午餐（上焼肉ランチ）：</strong>油花分布均勻，肉質細嫩。</li>
                  <li><strong>仔虎牛丼定食 / 和牛牛筋咖哩飯（約 ¥1,188）：</strong>用和牛邊角料慢火熬煮。</li>
                  <li><strong>冷麵與特製微型丼飯組合（約 ¥1,408）：</strong>迷你丼飯可三選一。</li>
                </ul>
              </div>
              <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                <div class="flex justify-between items-start mb-1.5">
                  <strong class="text-[14px] text-slate-900">🥩 主食與特色料理</strong>
                  <span class="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-black shrink-0">必點</span>
                </div>
                <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                  <li><strong>盛岡式冷麵 / 和風仔虎式涼麵（約 ¥1,023）：</strong>吃完烤肉後解膩絕配。</li>
                  <li><strong>石燒蒜味飯（石焼ガーリックライス）（約 ¥1,100）：</strong>香氣濃郁。</li>
                  <li><strong class="text-rose-600">兒童專用菜單：</strong>提供「兒童石鍋拌飯」等少鹽、易入口主食。</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        time: "14:30 - 17:30",
        title: "【Mitsui Outlet Park 仙台港】大血拚",
        img: "https://resources.matcha-jp.com/resize/720x2000/2025/08/24-242139.webp",  // ✅ 新增圖片
        tag: { text: "🛍️ 狂買免提", class: "tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Mitsui+Outlet+Park+Sendai+Port",
        navName: "三井Outlet",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>14:30–17:30 血拚大採買：</strong>吃飽後，開車約 15 分鐘抵達三井 Outlet。主攻 miki HOUSE, GAP Kids 童裝，與 The North Face, Mont-bell 等戶外品牌，4 位大人可分頭輪流開逛！</p>
            <div class="bg-indigo-50/80 border border-indigo-200 p-2.5 rounded-xl text-indigo-900 mt-2">
              <strong class="block mb-1 flex items-center gap-1"><span>🚗</span> 自駕最大優勢 (狂買免提)：</strong>
              買到的衣物、鞋子與戰利品，隨時可以提回停在專用停車場的 Minivan 後車廂，完全不必重提或塞滿推車！
            </div>
            <p class="text-[11px] text-amber-700 font-bold bg-amber-50 border border-amber-100 p-2 rounded-xl mt-1">🎟️ 優惠提醒：開逛前先憑護照至 1 樓綜合服務台領取外國遊客專屬 Coupon，部分店家可享額外折扣！</p>
          </div>
        `
      },
      {
        time: "18:00 - 19:30",
        title: "返抵飯店，從容打包行李",
        tag: { text: "🧳 零壓力打包", class: "tag-indigo" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>18:00 返回飯店：</strong>結束採購後，開車約 25 分鐘返回【Hotel Grand Bach 仙台】。</p>
            <p><strong>晚餐：</strong>因為中午吃了豐富的仔虎燒肉，晚餐可以選擇在 Outlet 順便解決，或是回飯店周邊買些熟食輕鬆吃。</p>
            <p><strong>19:30 從容打包：</strong>將這幾天採買的服飾、藥妝與戰利品，一次性分類裝入 4 個大行李箱，為美好的旅程慶祝圓滿成功！</p>
          </div>
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
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>在【Hotel Grand Bach 仙台】悠閒享用早餐、收拾最後物品。</p>
            <p>將 4 個大行李箱與戰利品裝上 Minivan 後車廂，辦理退房出發前往仙台車站。</p>
          </div>
        `
      },
      {
        time: "10:45 - 13:00",
        title: "【仙台車站 S-PAL】採購伴手禮 + 輕鬆午餐",
        tag: { text: "🛍️ 一站買齊", class: "tag-rose" },
        navUrl: "https://www.google.com/maps/search/?api=1&query=Sendai+Station",
        navName: "仙台車站",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <div class="bg-indigo-50/80 border border-indigo-200 p-3 rounded-xl shadow-sm mb-2">
              <strong class="block text-indigo-900 mb-1">💡 行程調整優勢 (避寒首選)</strong>
              <p class="text-[11px] text-indigo-800 leading-relaxed">車輛停放於車站連通停車場，直接走室內通道進入車站，完全不吹冷風，大幅減少幼兒在戶外穿梭的疲勞！</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
              <strong class="text-[14px] text-slate-900">🛍️ 伴手禮衝刺清單</strong>
              <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                <li><strong>菓匠三全：</strong>購買東北必買卡士達蛋糕<span class="text-amber-700 font-bold">「萩之月」</span>。</li>
                <li><strong>ずんだ茶寮：</strong>喝濃郁<span class="text-teal-700 font-bold">「毛豆泥奶昔」</span>，買毛豆泥夾心餅乾。</li>
                <li><strong>阿部蒲鉾店：</strong>買熱騰騰的現炸烤蒲鉾。</li>
              </ul>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm mt-2">
              <strong class="text-[14px] text-slate-900">🍱 站內午餐</strong>
              <p class="text-[11px] text-slate-600 mt-1">至 S-PAL B1 或 3 樓「牛舌通 / 壽司通」享用最後的黑毛和牛、炭烤牛舌或新鮮壽司。</p>
            </div>
          </div>
        `
      },
      {
        time: "13:00 - 13:30",
        title: "全平地開車直達仙台機場",
        tag: { text: "🚗 順暢平地", class: "tag-teal" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>行駛路線：</strong>仙台車站前 ➔ 仙台東道路 / 仙台南部道路 ➔ 仙台機場 IC ➔ 仙台機場 (約 25–30 分鐘)。</p>
            <p class="text-[11px] text-teal-700 font-bold bg-teal-50 border border-teal-100 p-1.5 rounded mt-2">✨ 沿途全程平地高速道路，無山路封路風險，確保搭機時間不受影響。</p>
          </div>
        `
      },
      {
        time: "13:30 - 14:15",
        title: "加滿油 ➔ Nippon Rent-A-Car 還車",
        tag: { text: "⛽ 輕鬆還車", class: "tag-teal" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p><strong>13:30 加滿油：</strong>於機場附近 (Nippon Rent-A-Car 指定) 的加油站將車輛加滿油（請保留加油發票收據）。</p>
            <p><strong>13:45 還車：</strong>返抵 Nippon Rent-A-Car 仙台機場營業所辦理還車，歸還便攜安全帶，搭乘免費接駁車 (3分鐘) 抵達航廈。</p>
          </div>
        `
      },
      {
        time: "14:15 - 16:05",
        title: "辦理登機 ➔ 順利返港",
        tag: { text: "✈️ 完美句點", class: "tag-teal" },
        navUrl: "",
        open: true,
        content: `
          <div class="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <p>辦理行李託運、通過安檢與出境審查，搭乘 16:05 班機平平安安返回香港！為 7 天 6 夜的雪國之旅畫下完美句點！🎉</p>
          </div>
        `
      }
    ]
  }
];