const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

// 在 updateCourseInfoDisplay 函數之前添加全域變數
const globalVariables = `
        // 課程資訊全域變數
        let storedCourseInfo = {
            teacher: null,
            course: null,
            time: null,
            date: null
        };
        
        // 檢查是否已儲存課程資訊
        function isCourseInfoStored() {
            return storedCourseInfo.teacher && storedCourseInfo.course && 
                   storedCourseInfo.time && storedCourseInfo.date;
        }
        
        // 儲存課程資訊
        function storeCourseInfo(teacher, course, time, date) {
            storedCourseInfo.teacher = teacher;
            storedCourseInfo.course = course;
            storedCourseInfo.time = time;
            storedCourseInfo.date = date;
            console.log('💾 課程資訊已儲存:', storedCourseInfo);
        }
        
        // 使用儲存的課程資訊更新顯示
        function updateDisplayWithStoredInfo() {
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');
            const teacherElement = document.getElementById('currentTeacher');
            const courseElement = document.getElementById('currentCourse');
            
            if (timeElement && storedCourseInfo.time) {
                timeElement.textContent = storedCourseInfo.time;
            }
            if (dateElement && storedCourseInfo.date) {
                dateElement.textContent = storedCourseInfo.date;
            }
            if (teacherElement && storedCourseInfo.teacher) {
                teacherElement.textContent = storedCourseInfo.teacher;
            }
            if (courseElement && storedCourseInfo.course) {
                courseElement.textContent = storedCourseInfo.course;
            }
            console.log('🔄 使用儲存的課程資訊更新顯示');
        }
        
`;

// 找到 updateCourseInfoDisplay 函數的位置
const functionStart = content.indexOf('        function updateCourseInfoDisplay() {');
if (functionStart === -1) {
    console.log('❌ 找不到 updateCourseInfoDisplay 函數');
    process.exit(1);
}

// 在函數之前插入全域變數
const beforeFunction = content.substring(0, functionStart);
const afterFunction = content.substring(functionStart);

const newContent = beforeFunction + globalVariables + afterFunction;

// 現在修改 updateCourseInfoDisplay 函數
const newFunction = `        function updateCourseInfoDisplay() {
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
                
                let teacher = window.loadedStudentsData.teacher;
                let course = window.loadedStudentsData.course;
                let time = null;
                let date = null;
                
                // 更新講師資訊
                if (teacherElement) {
                    teacherElement.textContent = teacher;
                }
                
                // 更新課程資訊
                if (courseElement) {
                    courseElement.textContent = course;
                }
                
                // 計算時間資訊
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
                        time = startTime + '-' + endTime;
                        console.log('🔍 計算出的時間字串:', time);
                        console.log('🔍 設置時間元素內容:', time);
                        timeElement.textContent = time;
                        
                        // 強制更新，確保顯示正確
                        setTimeout(() => {
                            console.log('🔄 強制更新時間元素');
                            timeElement.textContent = time;
                        }, 50);
                        
                        setTimeout(() => {
                            console.log('🔄 第二次強制更新時間元素');
                            timeElement.textContent = time;
                        }, 200);
                        
                        setTimeout(() => {
                            console.log('🔄 第三次強制更新時間元素');
                            timeElement.textContent = time;
                        }, 500);
                    } else if (window.loadedStudentsData.time) {
                        console.log('🔍 使用 window.loadedStudentsData.time:', window.loadedStudentsData.time);
                        time = window.loadedStudentsData.time;
                        timeElement.textContent = time;
                        
                        setTimeout(() => {
                            console.log('🔄 強制更新時間元素（備用）');
                            timeElement.textContent = time;
                        }, 50);
                    } else {
                        console.log('⚠️ 沒有找到時間資料');
                    }
                } else {
                    console.log('❌ 找不到時間元素');
                }
                
                // 計算日期資訊
                if (dateElement) {
                    console.log('🔍 找到日期元素，準備更新');
                    if (window.loadedStudentsData.start) {
                        console.log('🔍 使用 window.loadedStudentsData.start 計算日期');
                        console.log('🔍 日期計算 start 值:', window.loadedStudentsData.start);
                        const date = new Date(window.loadedStudentsData.start);
                        console.log('🔍 日期計算 date 對象:', date);
                        date = date.toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                        console.log('🔍 計算出的日期字串:', date);
                        console.log('🔍 設置日期元素內容:', date);
                        dateElement.textContent = date;
                        
                        // 強制更新，確保顯示正確
                        setTimeout(() => {
                            console.log('🔄 強制更新日期元素');
                            dateElement.textContent = date;
                        }, 50);
                        
                        setTimeout(() => {
                            console.log('🔄 第二次強制更新日期元素');
                            dateElement.textContent = date;
                        }, 200);
                        
                        setTimeout(() => {
                            console.log('🔄 第三次強制更新日期元素');
                            dateElement.textContent = date;
                        }, 500);
                    } else {
                        console.log('⚠️ 沒有找到日期資料');
                    }
                } else {
                    console.log('❌ 找不到日期元素');
                }
                
                // 儲存課程資訊
                if (teacher && course && time && date) {
                    storeCourseInfo(teacher, course, time, date);
                }
                
                console.log('✅ 課程資訊更新完成');
            } else if (window.currentAttendanceData) {
                console.log('✅ 使用當前課程資料更新課程資訊');
                
                const currentData = window.currentAttendanceData;
                
                let teacher = currentData.teacher;
                let course = currentData.course;
                let time = null;
                let date = null;
                
                // 更新講師資訊
                if (teacherElement) {
                    teacherElement.textContent = teacher;
                }
                
                // 更新課程資訊
                if (courseElement) {
                    courseElement.textContent = course;
                }
                
                // 計算時間資訊
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
                        time = startTime + '-' + endTime;
                        console.log('🔍 計算出的時間字串:', time);
                        timeElement.textContent = time;
                    } else if (currentData.time) {
                        console.log('🔍 使用 currentData.time:', currentData.time);
                        time = currentData.time;
                        timeElement.textContent = time;
                    } else {
                        console.log('⚠️ 沒有找到時間資料');
                    }
                } else {
                    console.log('❌ 找不到時間元素');
                }
                
                // 計算日期資訊
                if (dateElement) {
                    console.log('🔍 找到日期元素，準備更新（使用 currentAttendanceData）');
                    if (currentData.start) {
                        console.log('🔍 使用 currentData.start 計算日期');
                        const date = new Date(currentData.start);
                        date = date.toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                        console.log('🔍 計算出的日期字串:', date);
                        dateElement.textContent = date;
                    } else {
                        console.log('⚠️ 沒有找到日期資料');
                    }
                } else {
                    console.log('❌ 找不到日期元素');
                }
                
                // 儲存課程資訊
                if (teacher && course && time && date) {
                    storeCourseInfo(teacher, course, time, date);
                }
                
                console.log('✅ 課程資訊更新完成');
            } else {
                console.log('⚠️ 沒有找到課程資料，無法更新課程資訊');
            }
        }`;

// 替換 updateCourseInfoDisplay 函數
const functionStartIndex = newContent.indexOf('        function updateCourseInfoDisplay() {');
const functionEndIndex = newContent.indexOf('        }', functionStartIndex + 50);
let functionEnd = functionEndIndex;
let braceCount = 0;
for (let i = functionStartIndex; i < newContent.length; i++) {
    if (newContent[i] === '{') {
        braceCount++;
    } else if (newContent[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
            functionEnd = i;
            break;
        }
    }
}

const finalContent = newContent.substring(0, functionStartIndex) + newFunction + newContent.substring(functionEnd + 1);

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', finalContent, 'utf8');

console.log('✅ 課程資訊儲存機制已添加');
console.log('📊 修正內容:');
console.log('- 添加全域變數 storedCourseInfo 儲存課程資訊');
console.log('- 添加 isCourseInfoStored() 檢查是否已儲存');
console.log('- 添加 storeCourseInfo() 儲存課程資訊');
console.log('- 添加 updateDisplayWithStoredInfo() 使用儲存的資訊更新顯示');
console.log('- 修改 updateCourseInfoDisplay() 優先使用儲存的資訊');
console.log('- 第一次載入時儲存課程資訊，後續切換模式時不重新計算');
