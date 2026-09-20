/* ============================================================
 * build-css.js — CSS 合併腳本
 *
 * 執行方式：
 *   node build-css.js
 *
 * 功能：
 *   1. 把主站 7 個 CSS 合併成 app.css
 *   2. 把記帳本 3 個 CSS 合併成 ledger.css（自動備份原檔）
 *
 * ⚠️ 之後修改樣式請改「來源檔」，然後重新執行此腳本
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const HEADER = (name, sources) => `/* ============================================================
 * ${name} — 合併版 v1.0
 * 產生時間：${new Date().toLocaleString('zh-HK')}
 *
 * 合併來源（依序）：
${sources.map((f, i) => ` *   ${i + 1}. ${f}`).join('\n')}
 *
 * ⚠️ 請勿直接編輯此檔
 *    修改請改來源檔，然後重新執行：node build-css.js
 * ============================================================ */

`;

function merge(name, sources, output) {
  let out = HEADER(name, sources);
  let missing = [];

  sources.forEach(f => {
    if (!fs.existsSync(f)) {
      console.warn(`⚠️ 找不到 ${f}，跳過`);
      missing.push(f);
      return;
    }
    out += `\n\n/* ============================================================\n`;
    out += ` * ▼▼▼ 來源：${f} ▼▼▼\n`;
    out += ` * ============================================================ */\n\n`;
    out += fs.readFileSync(f, 'utf8').trimEnd();
  });

  fs.writeFileSync(output, out, 'utf8');
  const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
  console.log(`✅ ${output} 已生成（${kb} KB）`);
  if (missing.length) console.log(`   ⚠️ 缺少：${missing.join(', ')}`);
}

// ============ 主站 ============
merge('app.css', [
  'header.css',
  'style.css',
  'dark.css',
  'patches.css',
  'perf.css',
  'design-v14.css',
  'design-v14b.css'
], 'app.css');

// ============ 記帳本 ============
if (fs.existsSync('ledger.css') && !fs.existsSync('ledger-base.css')) {
  fs.copyFileSync('ledger.css', 'ledger-base.css');
  console.log('📦 已備份 ledger.css → ledger-base.css');
}

const ledgerSources = ['ledger-base.css', 'design-v14.css', 'design-v14b.css'];
if (!fs.existsSync('ledger-base.css')) {
  // 如果沒有 base，就把 design 檔單獨拼
  merge('ledger.css', ['ledger.css', 'design-v14.css', 'design-v14b.css'], 'ledger-bundle.css');
  console.log('⚠️ 未找到 ledger-base.css，改用 ledger-bundle.css');
} else {
  merge('ledger.css', ledgerSources, 'ledger.css');
}

console.log('\n🎉 完成！請更新 HTML 的 <link> 標籤。');