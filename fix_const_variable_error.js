const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

// 修復 const 變數重新賦值的問題
// 將 const date = new Date(...) 改為 let date = new Date(...)
content = content.replace(
    /const date = new Date\(window\.loadedStudentsData\.start\);/g,
    'let date = new Date(window.loadedStudentsData.start);'
);

content = content.replace(
    /const date = new Date\(currentData\.start\);/g,
    'let date = new Date(currentData.start);'
);

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', content, 'utf8');

console.log('✅ const 變數重新賦值問題已修復');
console.log('📊 修正內容:');
console.log('- 將 const date 改為 let date');
console.log('- 修復 Assignment to constant variable 錯誤');
