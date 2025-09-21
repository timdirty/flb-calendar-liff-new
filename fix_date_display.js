const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

// 修復日期顯示問題 - 當沒有 date 欄位時，從 start 計算
const dateFixPattern = /\/\/ 更新日期資訊 - 直接使用儲存的值\s*if \(dateElement\) \{\s*console\.log\('🔍 找到日期元素，準備更新'\);\s*if \(window\.loadedStudentsData\.date\) \{\s*console\.log\('🔍 使用 window\.loadedStudentsData\.date:', window\.loadedStudentsData\.date\);\s*dateElement\.textContent = window\.loadedStudentsData\.date;\s*\} else \{\s*console\.log\('⚠️ 沒有找到日期資料'\);\s*\}\s*\} else \{\s*console\.log\('❌ 找不到日期元素'\);\s*\}/g;

const newDateFix = `// 更新日期資訊 - 直接使用儲存的值，如果沒有則從 start 計算
                if (dateElement) {
                    console.log('🔍 找到日期元素，準備更新');
                    if (window.loadedStudentsData.date) {
                        console.log('🔍 使用 window.loadedStudentsData.date:', window.loadedStudentsData.date);
                        dateElement.textContent = window.loadedStudentsData.date;
                    } else if (window.loadedStudentsData.start) {
                        console.log('🔍 從 window.loadedStudentsData.start 計算日期:', window.loadedStudentsData.start);
                        const startDate = new Date(window.loadedStudentsData.start);
                        const dateString = startDate.toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                        console.log('🔍 計算出的日期字串:', dateString);
                        dateElement.textContent = dateString;
                    } else {
                        console.log('⚠️ 沒有找到日期資料');
                    }
                } else {
                    console.log('❌ 找不到日期元素');
                }`;

content = content.replace(dateFixPattern, newDateFix);

// 同樣修復 currentAttendanceData 分支的日期處理
const dateFixPattern2 = /\/\/ 更新日期資訊 - 直接使用儲存的值\s*if \(dateElement\) \{\s*console\.log\('🔍 找到日期元素，準備更新（使用 currentAttendanceData）'\);\s*if \(currentData\.date\) \{\s*console\.log\('🔍 使用 currentData\.date:', currentData\.date\);\s*dateElement\.textContent = currentData\.date;\s*\} else \{\s*console\.log\('⚠️ 沒有找到日期資料'\);\s*\}\s*\} else \{\s*console\.log\('❌ 找不到日期元素'\);\s*\}/g;

const newDateFix2 = `// 更新日期資訊 - 直接使用儲存的值，如果沒有則從 start 計算
                if (dateElement) {
                    console.log('🔍 找到日期元素，準備更新（使用 currentAttendanceData）');
                    if (currentData.date) {
                        console.log('🔍 使用 currentData.date:', currentData.date);
                        dateElement.textContent = currentData.date;
                    } else if (currentData.start) {
                        console.log('🔍 從 currentData.start 計算日期:', currentData.start);
                        const startDate = new Date(currentData.start);
                        const dateString = startDate.toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                        console.log('🔍 計算出的日期字串:', dateString);
                        dateElement.textContent = dateString;
                    } else {
                        console.log('⚠️ 沒有找到日期資料');
                    }
                } else {
                    console.log('❌ 找不到日期元素');
                }`;

content = content.replace(dateFixPattern2, newDateFix2);

// 修復儲存邏輯 - 當沒有 date 時，從 start 計算
const storeFixPattern = /\/\/ 儲存課程資訊\s*if \(window\.loadedStudentsData\.teacher && window\.loadedStudentsData\.course && \s*window\.loadedStudentsData\.time && window\.loadedStudentsData\.date\) \{\s*console\.log\('💾 準備儲存課程資訊:', \{ \s*teacher: window\.loadedStudentsData\.teacher, \s*course: window\.loadedStudentsData\.course, \s*time: window\.loadedStudentsData\.time, \s*date: window\.loadedStudentsData\.date \s*\}\);\s*storeCourseInfo\(window\.loadedStudentsData\.teacher, window\.loadedStudentsData\.course, \s*window\.loadedStudentsData\.time, window\.loadedStudentsData\.date\);\s*console\.log\('💾 儲存完成，檢查 storedCourseInfo:', storedCourseInfo\);\s*\} else \{\s*console\.log\('⚠️ 課程資訊不完整，無法儲存:', \{ \s*teacher: window\.loadedStudentsData\.teacher, \s*course: window\.loadedStudentsData\.course, \s*time: window\.loadedStudentsData\.time, \s*date: window\.loadedStudentsData\.date \s*\}\);\s*\}/g;

const newStoreFix = `// 儲存課程資訊 - 如果沒有 date，從 start 計算
                let dateToStore = window.loadedStudentsData.date;
                if (!dateToStore && window.loadedStudentsData.start) {
                    console.log('🔍 從 start 計算日期用於儲存:', window.loadedStudentsData.start);
                    const startDate = new Date(window.loadedStudentsData.start);
                    dateToStore = startDate.toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                    console.log('🔍 計算出的儲存日期:', dateToStore);
                }
                
                if (window.loadedStudentsData.teacher && window.loadedStudentsData.course && 
                    window.loadedStudentsData.time && dateToStore) {
                    console.log('💾 準備儲存課程資訊:', { 
                        teacher: window.loadedStudentsData.teacher, 
                        course: window.loadedStudentsData.course, 
                        time: window.loadedStudentsData.time, 
                        date: dateToStore 
                    });
                    storeCourseInfo(window.loadedStudentsData.teacher, window.loadedStudentsData.course, 
                                  window.loadedStudentsData.time, dateToStore);
                    console.log('💾 儲存完成，檢查 storedCourseInfo:', storedCourseInfo);
                } else {
                    console.log('⚠️ 課程資訊不完整，無法儲存:', { 
                        teacher: window.loadedStudentsData.teacher, 
                        course: window.loadedStudentsData.course, 
                        time: window.loadedStudentsData.time, 
                        date: dateToStore 
                    });
                }`;

content = content.replace(storeFixPattern, newStoreFix);

// 同樣修復 currentAttendanceData 分支的儲存邏輯
const storeFixPattern2 = /\/\/ 儲存課程資訊\s*if \(currentData\.teacher && currentData\.course && currentData\.time && currentData\.date\) \{\s*console\.log\('💾 準備儲存課程資訊 \(currentData\):', \{ \s*teacher: currentData\.teacher, \s*course: currentData\.course, \s*time: currentData\.time, \s*date: currentData\.date \s*\}\);\s*storeCourseInfo\(currentData\.teacher, currentData\.course, currentData\.time, currentData\.date\);\s*console\.log\('💾 儲存完成，檢查 storedCourseInfo:', storedCourseInfo\);\s*\} else \{\s*console\.log\('⚠️ 課程資訊不完整，無法儲存 \(currentData\):', \{ \s*teacher: currentData\.teacher, \s*course: currentData\.course, \s*time: currentData\.time, \s*date: currentData\.date \s*\}\);\s*\}/g;

const newStoreFix2 = `// 儲存課程資訊 - 如果沒有 date，從 start 計算
                let dateToStore = currentData.date;
                if (!dateToStore && currentData.start) {
                    console.log('🔍 從 start 計算日期用於儲存 (currentData):', currentData.start);
                    const startDate = new Date(currentData.start);
                    dateToStore = startDate.toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                    console.log('🔍 計算出的儲存日期 (currentData):', dateToStore);
                }
                
                if (currentData.teacher && currentData.course && currentData.time && dateToStore) {
                    console.log('💾 準備儲存課程資訊 (currentData):', { 
                        teacher: currentData.teacher, 
                        course: currentData.course, 
                        time: currentData.time, 
                        date: dateToStore 
                    });
                    storeCourseInfo(currentData.teacher, currentData.course, currentData.time, dateToStore);
                    console.log('💾 儲存完成，檢查 storedCourseInfo:', storedCourseInfo);
                } else {
                    console.log('⚠️ 課程資訊不完整，無法儲存 (currentData):', { 
                        teacher: currentData.teacher, 
                        course: currentData.course, 
                        time: currentData.time, 
                        date: dateToStore 
                    });
                }`;

content = content.replace(storeFixPattern2, newStoreFix2);

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', content, 'utf8');

console.log('✅ 日期顯示問題已修復');
console.log('📊 修正內容:');
console.log('- 當沒有 date 欄位時，從 start 計算日期');
console.log('- 修復儲存邏輯，確保 date 被正確計算和儲存');
console.log('- 同時修復 window.loadedStudentsData 和 currentAttendanceData 分支');
