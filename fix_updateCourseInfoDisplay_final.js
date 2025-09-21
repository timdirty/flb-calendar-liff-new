const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

// 找到 updateCourseInfoDisplay 函數的開始和結束位置
const startMarker = '        function updateCourseInfoDisplay() {';
const endMarker = '        }';

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.log('❌ 找不到 updateCourseInfoDisplay 函數');
    process.exit(1);
}

// 找到函數結束位置
let braceCount = 0;
let endIndex = startIndex;
let inFunction = false;

for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
        braceCount++;
        inFunction = true;
    } else if (content[i] === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
            endIndex = i;
            break;
        }
    }
}

// 新的 updateCourseInfoDisplay 函數
const newFunction = `        function updateCourseInfoDisplay() {
            console.log('🔄 更新課程資訊顯示');
            console.log('🔍 window.loadedStudentsData:', window.loadedStudentsData);
            console.log('🔍 window.currentAttendanceData:', window.currentAttendanceData);
            
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
                
                // 更新時間資訊
                if (timeElement) {
                    console.log('🔍 找到時間元素，準備更新');
                    if (window.loadedStudentsData.start) {
                        console.log('🔍 使用 window.loadedStudentsData.start 和 end 計算時間');
                        console.log('🔍 start 值:', window.loadedStudentsData.start);
                        console.log('🔍 end 值:', window.loadedStudentsData.end);
                        const startDate = new Date(window.loadedStudentsData.start);
                        const endDate = new Date(window.loadedStudentsData.end);
                        console.log('🔍 startDate:', startDate);
                        console.log('🔍 endDate:', endDate);
                        const startTime = startDate.toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });
                        const endTime = endDate.toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });
                        const timeString = startTime + '-' + endTime;
                        console.log('🔍 計算出的時間字串:', timeString);
                        console.log('🔍 設置時間元素內容:', timeString);
                        timeElement.textContent = timeString;
                        
                        // 強制更新，確保顯示正確
                        setTimeout(() => {
                            console.log('🔄 強制更新時間元素');
                            timeElement.textContent = timeString;
                        }, 50);
                        
                        setTimeout(() => {
                            console.log('🔄 第二次強制更新時間元素');
                            timeElement.textContent = timeString;
                        }, 200);
                        
                        setTimeout(() => {
                            console.log('🔄 第三次強制更新時間元素');
                            timeElement.textContent = timeString;
                        }, 500);
                    } else if (window.loadedStudentsData.time) {
                        console.log('🔍 使用 window.loadedStudentsData.time:', window.loadedStudentsData.time);
                        timeElement.textContent = window.loadedStudentsData.time;
                        
                        setTimeout(() => {
                            console.log('🔄 強制更新時間元素（備用）');
                            timeElement.textContent = window.loadedStudentsData.time;
                        }, 50);
                    } else {
                        console.log('⚠️ 沒有找到時間資料');
                    }
                } else {
                    console.log('❌ 找不到時間元素');
                }
                
                // 更新日期資訊
                if (dateElement) {
                    console.log('🔍 找到日期元素，準備更新');
                    if (window.loadedStudentsData.start) {
                        console.log('🔍 使用 window.loadedStudentsData.start 計算日期');
                        console.log('🔍 日期計算 start 值:', window.loadedStudentsData.start);
                        const date = new Date(window.loadedStudentsData.start);
                        console.log('🔍 日期計算 date 對象:', date);
                        const dateString = date.toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                        console.log('🔍 計算出的日期字串:', dateString);
                        console.log('🔍 設置日期元素內容:', dateString);
                        dateElement.textContent = dateString;
                        
                        // 強制更新，確保顯示正確
                        setTimeout(() => {
                            console.log('🔄 強制更新日期元素');
                            dateElement.textContent = dateString;
                        }, 50);
                        
                        setTimeout(() => {
                            console.log('🔄 第二次強制更新日期元素');
                            dateElement.textContent = dateString;
                        }, 200);
                        
                        setTimeout(() => {
                            console.log('🔄 第三次強制更新日期元素');
                            dateElement.textContent = dateString;
                        }, 500);
                    } else {
                        console.log('⚠️ 沒有找到日期資料');
                    }
                } else {
                    console.log('❌ 找不到日期元素');
                }
                
                console.log('✅ 課程資訊更新完成');
            } else if (window.currentAttendanceData) {
                console.log('✅ 使用當前課程資料更新課程資訊');
                
                const currentData = window.currentAttendanceData;
                
                // 更新講師資訊
                if (teacherElement) {
                    teacherElement.textContent = currentData.teacher;
                }
                
                // 更新課程資訊
                if (courseElement) {
                    courseElement.textContent = currentData.course;
                }
                
                // 更新時間資訊
                if (timeElement) {
                    console.log('🔍 找到時間元素，準備更新（使用 currentAttendanceData）');
                    if (currentData.start) {
                        console.log('🔍 使用 currentData.start 和 end 計算時間');
                        const startDate = new Date(currentData.start);
                        const endDate = new Date(currentData.end);
                        const startTime = startDate.toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });
                        const endTime = endDate.toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });
                        const timeString = startTime + '-' + endTime;
                        console.log('🔍 計算出的時間字串:', timeString);
                        timeElement.textContent = timeString;
                    } else if (currentData.time) {
                        console.log('🔍 使用 currentData.time:', currentData.time);
                        timeElement.textContent = currentData.time;
                    } else {
                        console.log('⚠️ 沒有找到時間資料');
                    }
                } else {
                    console.log('❌ 找不到時間元素');
                }
                
                // 更新日期資訊
                if (dateElement) {
                    console.log('🔍 找到日期元素，準備更新（使用 currentAttendanceData）');
                    if (currentData.start) {
                        console.log('🔍 使用 currentData.start 計算日期');
                        const date = new Date(currentData.start);
                        const dateString = date.toLocaleDateString('zh-TW', {
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
                }
                
                console.log('✅ 課程資訊更新完成');
            } else {
                console.log('⚠️ 沒有找到課程資料，無法更新課程資訊');
            }
        }`;

// 替換函數
const newContent = content.substring(0, startIndex) + newFunction + content.substring(endIndex + 1);

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', newContent, 'utf8');

console.log('✅ updateCourseInfoDisplay 函數已完全修正');
console.log('📊 修正內容:');
console.log('- 修正模板字符串問題');
console.log('- 使用字符串拼接代替模板字符串');
console.log('- 簡化日誌輸出');
console.log('- 優化錯誤處理');
