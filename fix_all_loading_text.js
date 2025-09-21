const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

console.log('🔍 開始修復所有硬編碼的"載入中..."文字...');

// 替換所有硬編碼的"載入中..."為動態變數
const replacements = [
    // 學生簽到頁面的課程資訊
    {
        from: '<span id="currentTeacher">載入中...</span>',
        to: '<span id="currentTeacher">${storedCourseInfo && storedCourseInfo.teacher ? storedCourseInfo.teacher : "載入中..."}</span>'
    },
    {
        from: '<span id="currentCourse">載入中...</span>',
        to: '<span id="currentCourse">${storedCourseInfo && storedCourseInfo.course ? storedCourseInfo.course : "載入中..."}</span>'
    },
    {
        from: '<span id="currentTime">載入中...</span>',
        to: '<span id="currentTime">${storedCourseInfo && storedCourseInfo.time ? storedCourseInfo.time : "載入中..."}</span>'
    },
    {
        from: '<span id="currentDate">載入中...</span>',
        to: '<span id="currentDate">${storedCourseInfo && storedCourseInfo.date ? storedCourseInfo.date : "載入中..."}</span>'
    }
];

let modifiedContent = content;
let replacementCount = 0;

// 執行替換
replacements.forEach((replacement, index) => {
    const beforeCount = (modifiedContent.match(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    modifiedContent = modifiedContent.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
    const afterCount = (modifiedContent.match(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const actualReplacements = beforeCount - afterCount;
    replacementCount += actualReplacements;
    console.log(`✅ 替換 ${index + 1}: ${actualReplacements} 個實例`);
});

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', modifiedContent, 'utf8');

console.log(`🎉 修復完成！總共替換了 ${replacementCount} 個硬編碼的"載入中..."文字`);
console.log('📊 修正內容:');
console.log('- 所有課程資訊欄位現在使用動態變數');
console.log('- 優先顯示 storedCourseInfo 的值');
console.log('- 如果沒有儲存資訊則顯示"載入中..."');
console.log('- 確保課程資訊正確顯示');
