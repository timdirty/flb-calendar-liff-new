const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

// 修復 updateDisplayWithStoredInfo 函數，添加詳細日誌和錯誤處理
const newUpdateDisplayWithStoredInfo = `function updateDisplayWithStoredInfo() {
            console.log('🔄 使用儲存的課程資訊更新顯示');
            console.log('🔍 storedCourseInfo:', storedCourseInfo);
            
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
            
            if (timeElement && storedCourseInfo.time) {
                console.log('🔍 更新時間元素:', storedCourseInfo.time);
                timeElement.textContent = storedCourseInfo.time;
                console.log('✅ 時間元素已更新');
            } else {
                console.log('❌ 時間元素更新失敗:', {
                    timeElement: !!timeElement,
                    timeValue: storedCourseInfo.time
                });
            }
            
            if (dateElement && storedCourseInfo.date) {
                console.log('🔍 更新日期元素:', storedCourseInfo.date);
                dateElement.textContent = storedCourseInfo.date;
                console.log('✅ 日期元素已更新');
            } else {
                console.log('❌ 日期元素更新失敗:', {
                    dateElement: !!dateElement,
                    dateValue: storedCourseInfo.date
                });
            }
            
            if (teacherElement && storedCourseInfo.teacher) {
                console.log('🔍 更新講師元素:', storedCourseInfo.teacher);
                teacherElement.textContent = storedCourseInfo.teacher;
                console.log('✅ 講師元素已更新');
            } else {
                console.log('❌ 講師元素更新失敗:', {
                    teacherElement: !!teacherElement,
                    teacherValue: storedCourseInfo.teacher
                });
            }
            
            if (courseElement && storedCourseInfo.course) {
                console.log('🔍 更新課程元素:', storedCourseInfo.course);
                courseElement.textContent = storedCourseInfo.course;
                console.log('✅ 課程元素已更新');
            } else {
                console.log('❌ 課程元素更新失敗:', {
                    courseElement: !!courseElement,
                    courseValue: storedCourseInfo.course
                });
            }
            
            console.log('🔄 使用儲存的課程資訊更新顯示完成');
        }`;

// 替換函數
const functionStart = content.indexOf('function updateDisplayWithStoredInfo()');
if (functionStart === -1) {
    console.log('❌ 找不到 updateDisplayWithStoredInfo 函數');
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
const newContent = content.substring(0, functionStart) + newUpdateDisplayWithStoredInfo + content.substring(functionEnd + 1);

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', newContent, 'utf8');

console.log('✅ updateDisplayWithStoredInfo 函數已修復');
console.log('📊 修正內容:');
console.log('- 添加詳細的日誌輸出');
console.log('- 添加元素存在性檢查');
console.log('- 添加更新成功/失敗的日誌');
console.log('- 便於調試和監控更新過程');
