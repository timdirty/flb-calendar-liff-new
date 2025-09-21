const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

// 簡化 updateCourseInfoDisplay 函數，直接使用 storedCourseInfo 的值
const newUpdateCourseInfoDisplay = `function updateCourseInfoDisplay() {
            console.log('🔄 更新課程資訊顯示');
            console.log('🔍 window.loadedStudentsData:', window.loadedStudentsData);
            console.log('🔍 window.currentAttendanceData:', window.currentAttendanceData);
            console.log('🔍 已儲存的課程資訊:', storedCourseInfo);
            
            // 檢查元素是否存在
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');
            const teacherElement = document.getElementById('currentTeacher');
            const courseElement = document.getElementById('currentCourse');
            
            console.log('🔍 元素檢查:', {
                timeElement: !!timeElement,
                dateElement: !!dateElement,
                teacherElement: !!teacherElement,
                courseElement: !!courseElement
            });
            
            // 如果已經有儲存的課程資訊，直接使用
            if (isCourseInfoStored()) {
                console.log('✅ 使用已儲存的課程資訊');
                updateDisplayWithStoredInfo();
                return;
            }
            
            // 如果沒有可用的數據，設置為預設值
            if (!window.loadedStudentsData && !window.currentAttendanceData) {
                console.log('⚠️ 沒有可用的課程數據，設置為預設值');
                
                if (timeElement) {
                    timeElement.textContent = '--:--';
                }
                if (dateElement) {
                    dateElement.textContent = '--/--/--';
                }
                if (teacherElement) {
                    teacherElement.textContent = '未知';
                }
                if (courseElement) {
                    courseElement.textContent = '未知';
                }
                return;
            }
            
            // 檢查是否有已載入的學生資料
            if (window.loadedStudentsData) {
                console.log('✅ 使用已載入的學生資料更新課程資訊');
                
                // 更新講師資訊
                if (teacherElement) {
                    teacherElement.textContent = window.loadedStudentsData.teacher;
                }
                
                // 更新課程資訊
                if (courseElement) {
                    courseElement.textContent = window.loadedStudentsData.course;
                }
                
                // 更新時間資訊 - 直接使用儲存的值
                if (timeElement) {
                    console.log('🔍 找到時間元素，準備更新');
                    if (window.loadedStudentsData.time) {
                        console.log('🔍 使用 window.loadedStudentsData.time:', window.loadedStudentsData.time);
                        timeElement.textContent = window.loadedStudentsData.time;
                    } else {
                        console.log('⚠️ 沒有找到時間資料');
                    }
                } else {
                    console.log('❌ 找不到時間元素');
                }
                
                // 更新日期資訊 - 直接使用儲存的值
                if (dateElement) {
                    console.log('🔍 找到日期元素，準備更新');
                    if (window.loadedStudentsData.date) {
                        console.log('🔍 使用 window.loadedStudentsData.date:', window.loadedStudentsData.date);
                        dateElement.textContent = window.loadedStudentsData.date;
                    } else {
                        console.log('⚠️ 沒有找到日期資料');
                    }
                } else {
                    console.log('❌ 找不到日期元素');
                }
                
                // 儲存課程資訊
                if (window.loadedStudentsData.teacher && window.loadedStudentsData.course && 
                    window.loadedStudentsData.time && window.loadedStudentsData.date) {
                    console.log('💾 準備儲存課程資訊:', { 
                        teacher: window.loadedStudentsData.teacher, 
                        course: window.loadedStudentsData.course, 
                        time: window.loadedStudentsData.time, 
                        date: window.loadedStudentsData.date 
                    });
                    storeCourseInfo(window.loadedStudentsData.teacher, window.loadedStudentsData.course, 
                                  window.loadedStudentsData.time, window.loadedStudentsData.date);
                    console.log('💾 儲存完成，檢查 storedCourseInfo:', storedCourseInfo);
                } else {
                    console.log('⚠️ 課程資訊不完整，無法儲存:', { 
                        teacher: window.loadedStudentsData.teacher, 
                        course: window.loadedStudentsData.course, 
                        time: window.loadedStudentsData.time, 
                        date: window.loadedStudentsData.date 
                    });
                }
                
                console.log('✅ 課程資訊更新完成');
            } else if (window.currentAttendanceData) {
                console.log('✅ 使用當前課程資料更新課程資訊');
                
                // 使用當前課程資料
                const currentData = window.currentAttendanceData;
                
                // 更新講師資訊
                if (teacherElement) {
                    teacherElement.textContent = currentData.teacher;
                }
                
                // 更新課程資訊
                if (courseElement) {
                    courseElement.textContent = currentData.course;
                }
                
                // 更新時間資訊 - 直接使用儲存的值
                if (timeElement) {
                    console.log('🔍 找到時間元素，準備更新（使用 currentAttendanceData）');
                    if (currentData.time) {
                        console.log('🔍 使用 currentData.time:', currentData.time);
                        timeElement.textContent = currentData.time;
                    } else {
                        console.log('⚠️ 沒有找到時間資料');
                    }
                } else {
                    console.log('❌ 找不到時間元素');
                }
                
                // 更新日期資訊 - 直接使用儲存的值
                if (dateElement) {
                    console.log('🔍 找到日期元素，準備更新（使用 currentAttendanceData）');
                    if (currentData.date) {
                        console.log('🔍 使用 currentData.date:', currentData.date);
                        dateElement.textContent = currentData.date;
                    } else {
                        console.log('⚠️ 沒有找到日期資料');
                    }
                } else {
                    console.log('❌ 找不到日期元素');
                }
                
                // 儲存課程資訊
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
                }
                
                console.log('✅ 課程資訊更新完成');
            } else {
                console.log('⚠️ 沒有找到課程資料，無法更新課程資訊');
            }
        }`;

// 替換 updateCourseInfoDisplay 函數
const functionStart = content.indexOf('function updateCourseInfoDisplay()');
if (functionStart === -1) {
    console.log('❌ 找不到 updateCourseInfoDisplay 函數');
    process.exit(1);
}

// 找到函數結束位置
let braceCount = 0;
let functionEnd = functionStart;
let inFunction = false;

for (let i = functionStart; i < content.length; i++) {
    if (content[i] === '{') {
        braceCount++;
        inFunction = true;
    } else if (content[i] === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
            functionEnd = i;
            break;
        }
    }
}

// 替換函數
const newContent = content.substring(0, functionStart) + newUpdateCourseInfoDisplay + content.substring(functionEnd + 1);

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', newContent, 'utf8');

console.log('✅ 課程資訊顯示邏輯已簡化');
console.log('📊 修正內容:');
console.log('- 移除複雜的時間和日期計算邏輯');
console.log('- 直接使用 window.loadedStudentsData.time 和 window.loadedStudentsData.date');
console.log('- 直接使用 currentData.time 和 currentData.date');
console.log('- 保持簡單的儲存和顯示邏輯');
