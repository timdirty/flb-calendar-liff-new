const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

// 修正模板字符串問題
content = content.replace(/\\`\\$\\{startTime\\}-\\$\\{endTime\\}\\`/g, '`${startTime}-${endTime}`');
content = content.replace(/\\`\\$\\{startTime\\}-\\$\\{endTime\\}\\`/g, '`${startTime}-${endTime}`');

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', content, 'utf8');

console.log('✅ 模板字符串已修正');
