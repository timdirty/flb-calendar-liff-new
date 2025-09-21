const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

// 修復 storeCourseInfo 調用問題
// 在 updateCourseInfoDisplay 函數中，確保 storeCourseInfo 被正確調用

// 找到 updateCourseInfoDisplay 函數中儲存課程資訊的部分
const storeCourseInfoPattern = /\/\/ 儲存課程資訊\s*if \(teacher && course && time && date\) \{\s*storeCourseInfo\(teacher, course, time, date\);\s*\}/g;

// 替換為更強制的儲存邏輯
const newStoreCourseInfo = `// 儲存課程資訊 - 強制儲存
                if (teacher && course && time && date) {
                    console.log('💾 準備儲存課程資訊:', { teacher, course, time, date });
                    storeCourseInfo(teacher, course, time, date);
                    console.log('💾 儲存完成，檢查 storedCourseInfo:', storedCourseInfo);
                } else {
                    console.log('⚠️ 課程資訊不完整，無法儲存:', { teacher, course, time, date });
                }`;

content = content.replace(storeCourseInfoPattern, newStoreCourseInfo);

// 同樣修復 currentAttendanceData 分支的儲存
const storeCourseInfoPattern2 = /\/\/ 儲存課程資訊\s*if \(currentData\.teacher && currentData\.course && currentData\.time && currentData\.date\) \{\s*storeCourseInfo\(currentData\.teacher, currentData\.course, currentData\.time, currentData\.date\);\s*\}/g;

const newStoreCourseInfo2 = `// 儲存課程資訊 - 強制儲存
                if (currentData.teacher && currentData.course && currentData.time && currentData.date) {
                    console.log('💾 準備儲存課程資訊 (currentData):', { 
                        teacher: currentData.teacher, 
                        course: currentData.course, 
                        time: currentData.time, 
                        date: currentData.date 
                    });
                    storeCourseInfo(currentData.teacher, currentData.course, currentData.time, currentData.date);
                    console.log('💾 儲存完成，檢查 storedCourseInfo:', storedCourseInfo);
                } else {
                    console.log('⚠️ 課程資訊不完整，無法儲存 (currentData):', { 
                        teacher: currentData.teacher, 
                        course: currentData.course, 
                        time: currentData.time, 
                        date: currentData.date 
                    });
                }`;

content = content.replace(storeCourseInfoPattern2, newStoreCourseInfo2);

// 在 updateCourseInfoDisplay 函數開始處添加強制儲存邏輯
const updateCourseInfoDisplayPattern = /function updateCourseInfoDisplay\(\) \{\s*console\.log\('🔄 更新課程資訊顯示'\);\s*console\.log\('🔍 window\.loadedStudentsData:', window\.loadedStudentsData\);\s*console\.log\('🔍 window\.currentAttendanceData:', window\.currentAttendanceData\);\s*console\.log\('🔍 已儲存的課程資訊:', storedCourseInfo\);/;

const newUpdateCourseInfoDisplayStart = `function updateCourseInfoDisplay() {
            console.log('🔄 更新課程資訊顯示');
            console.log('🔍 window.loadedStudentsData:', window.loadedStudentsData);
            console.log('🔍 window.currentAttendanceData:', window.currentAttendanceData);
            console.log('🔍 已儲存的課程資訊:', storedCourseInfo);
            
            // 強制檢查並儲存課程資訊
            if (window.loadedStudentsData && !isCourseInfoStored()) {
                console.log('💾 強制儲存課程資訊 (loadedStudentsData)');
                const teacher = window.loadedStudentsData.teacher;
                const course = window.loadedStudentsData.course;
                let time = window.loadedStudentsData.time;
                let date = window.loadedStudentsData.date;
                
                // 如果沒有 time 和 date，從 start 和 end 計算
                if (!time && window.loadedStudentsData.start) {
                    const startDate = new Date(window.loadedStudentsData.start);
                    const endDate = new Date(window.loadedStudentsData.end);
                    time = startDate.toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }) + '-' + endDate.toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                }
                
                if (!date && window.loadedStudentsData.start) {
                    const startDate = new Date(window.loadedStudentsData.start);
                    date = startDate.toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                }
                
                if (teacher && course && time && date) {
                    storeCourseInfo(teacher, course, time, date);
                    console.log('💾 強制儲存完成:', storedCourseInfo);
                }
            }`;

content = content.replace(updateCourseInfoDisplayPattern, newUpdateCourseInfoDisplayStart);

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', content, 'utf8');

console.log('✅ 課程資訊儲存問題已修復');
console.log('📊 修正內容:');
console.log('- 添加強制儲存邏輯在 updateCourseInfoDisplay 開始處');
console.log('- 增強 storeCourseInfo 調用的日誌記錄');
console.log('- 確保課程資訊在第一次載入時就被儲存');
