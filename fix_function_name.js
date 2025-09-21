const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

console.log('🔍 開始修復函數名稱錯誤...');

// 替換錯誤的函數名稱
const oldFunctionName = 'setupStudentCardEventListeners()';
const newFunctionName = 'setupStudentCardDoubleClickListeners()';

// 執行替換
const beforeCount = (content.match(new RegExp(oldFunctionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
const modifiedContent = content.replace(new RegExp(oldFunctionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newFunctionName);
const afterCount = (content.match(new RegExp(oldFunctionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

const actualReplacements = beforeCount - afterCount;

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', modifiedContent, 'utf8');

console.log(`✅ 修復完成！替換了 ${actualReplacements} 個錯誤的函數名稱`);
console.log('📊 修正內容:');
console.log('- 將 setupStudentCardEventListeners() 改為 setupStudentCardDoubleClickListeners()');
console.log('- 修復 JavaScript 錯誤');
console.log('- 確保學生簽到功能正常運作');
