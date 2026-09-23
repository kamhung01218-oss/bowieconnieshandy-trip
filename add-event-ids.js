/* ============================================================
 * add-event-ids.js — 為 data.js 每個事件自動加穩定 ID
 *
 * 執行方式：
 *   node add-event-ids.js
 *
 * 功能：
 *   1. 掃描 data.js，找出所有 title: "..."
 *   2. 依標題產生可讀、穩定的 ID（中文直接保留）
 *   3. 在 title 前插入 id: "..." 欄位
 *   4. 首次執行會備份 data.js → data.backup.js
 *
 * ⚠️ 可重複執行（每次先移除舊 id 再重新加）
 * ============================================================ */

const fs = require('fs');
const path = require('path');

// ⚠️ 改成你的 data.js 實際所在的完整路徑
const BASE_DIR = '/storage/emulated/0/Download/仙台之旅';  // ← 改成你的

const DATA_FILE = path.join(BASE_DIR, 'data.js');
const BACKUP_FILE = path.join(BASE_DIR, 'data.backup.js');ata.backup.js');

function titleToId(title) {
  if (!title) return 'event';
  let s = String(title);
  s = s.replace(/[（）()【】\[\]「」『』""'']/g, '');
  s = s.replace(/[，,。.、；;：:！!？?·・｜|]/g, '');
  s = s.replace(/[➔→⇒▶►]/g, '-');
  s = s.replace(/[&＆]/g, '-');
  s = s.replace(/[-–—－]/g, '-');
  s = s.replace(/\s+/g, '-');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-|-$/g, '');
  return s || 'event';
}

if (!fs.existsSync(DATA_FILE)) {
  console.error(`❌ 找不到 ${DATA_FILE}`);
  process.exit(1);
}

if (!fs.existsSync(BACKUP_FILE)) {
  fs.copyFileSync(DATA_FILE, BACKUP_FILE);
  console.log(`📦 已備份 data.js → data.backup.js`);
} else {
  console.log(`📦 備份已存在，不覆蓋`);
}

let content = fs.readFileSync(DATA_FILE, 'utf8');
const originalContent = content;

// 移除舊 id
content = content.replace(/^(\s*)id:\s*"[^"]*",\s*\n/gm, '');
content = content.replace(/^(\s*)id:\s*'[^']*',\s*\n/gm, '');

// 收集所有 title
const titleRegex = /title:\s*"([^"]+)"/g;
const titles = [];
let m;
while ((m = titleRegex.exec(content)) !== null) {
  titles.push(m[1]);
}

// 產生唯一 ID
const usedIds = new Set();
const titleToGeneratedId = new Map();
titles.forEach(title => {
  const baseId = titleToId(title);
  let id = baseId;
  let n = 2;
  while (usedIds.has(id)) {
    id = `${baseId}-${n}`;
    n++;
  }
  usedIds.add(id);
  titleToGeneratedId.set(title, id);
});

console.log(`✅ 掃描到 ${titles.length} 個 title`);

// 插入 id
let inserted = 0;
content = content.replace(/(\n(\s*)title:\s*"([^"]+)")/g, (full, titlePart, indent, title) => {
  const id = titleToGeneratedId.get(title);
  if (!id) return full;
  inserted++;
  return `\n${indent}id: "${id}",${titlePart}`;
});

// 語法檢查
try {
  new Function('winterItineraries', 'shootTips', content);
  console.log(`🔍 語法檢查通過`);
} catch (e) {
  console.error(`❌ 語法檢查失敗，取消寫入：${e.message}`);
  process.exit(1);
}

if (content === originalContent) {
  console.log(`ℹ️ 內容無變化`);
  process.exit(0);
}

fs.writeFileSync(DATA_FILE, content, 'utf8');
console.log(`\n✅ 已寫入 data.js（插入 ${inserted} 個 id）`);
console.log('🎉 完成！');