const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

console.log('🔍 開始修復 displayStudents 函數調用...');

// 找到 recreateStudentAttendanceContent 函數中的 displayStudents 調用
const functionStart = content.indexOf('function recreateStudentAttendanceContent()');
if (functionStart === -1) {
    console.log('❌ 找不到 recreateStudentAttendanceContent 函數');
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

// 提取函數內容
const functionContent = content.substring(functionStart, functionEnd + 1);

// 創建新的函數，修復 displayStudents 調用
const newRecreateFunction = `function recreateStudentAttendanceContent() {
            console.log('🔄 重新創建學生簽到內容');
            
            const modalContent = document.querySelector('.attendance-modal-content');
            if (!modalContent) return;
            
            // 獲取已儲存的課程資訊
            const teacher = storedCourseInfo && storedCourseInfo.teacher ? storedCourseInfo.teacher : '載入中...';
            const course = storedCourseInfo && storedCourseInfo.course ? storedCourseInfo.course : '載入中...';
            const time = storedCourseInfo && storedCourseInfo.time ? storedCourseInfo.time : '載入中...';
            const date = storedCourseInfo && storedCourseInfo.date ? storedCourseInfo.date : '載入中...';
            
            console.log('🔍 使用儲存的課程資訊創建內容:', { teacher, course, time, date });
            
            // 重新創建學生簽到內容結構
            modalContent.innerHTML = \`
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <h2 style="margin: 0; color: #333333; font-size: 1.5rem; text-shadow: none;">
                            <span style="color: #b8860b; font-weight: 600;">📚 學生簽到系統</span>
                        </h2>
                    </div>
                    <button id="closeModalBtn" style="background: none; border: none; font-size: 1.5rem; color: #666; cursor: pointer; padding: 5px; border-radius: 50%; transition: all 0.3s ease;" onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
                        ✕
                    </button>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div data-field="teacher" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">講師:</strong> <span id="currentTeacher">\${teacher}</span></div>
                        <div data-field="course" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">課程:</strong> <span id="currentCourse">\${course}</span></div>
                        <div data-field="time" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">時間:</strong> <span id="currentTime">\${time}</span></div>
                        <div data-field="date" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">日期:</strong> <span id="currentDate">\${date}</span></div>
                    </div>
                </div>
                
                <div id="studentsList" style="max-height: 500px; min-height: 500px; overflow-y: auto; margin-bottom: 20px; padding-right: 10px;">
                    <!-- 學生列表將在這裡動態生成 -->
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 15px; padding: 15px; position: sticky; bottom: 0; z-index: 10;">
                    <div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: nowrap;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="color: #28a745; font-weight: bold; font-size: 1.2rem;">\${window.loadedStudentsData ? window.loadedStudentsData.students.filter(s => s.attendance && s.attendance.some(a => a.status === 'present')).length : 0}</div>
                            <div style="color: #666; font-size: 0.9rem;">出席</div>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="color: #dc3545; font-weight: bold; font-size: 1.2rem;">\${window.loadedStudentsData ? window.loadedStudentsData.students.filter(s => s.attendance && s.attendance.some(a => a.status === 'absent')).length : 0}</div>
                            <div style="color: #666; font-size: 0.9rem;">缺席</div>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="color: #ffc107; font-weight: bold; font-size: 1.2rem;">\${window.loadedStudentsData ? window.loadedStudentsData.students.filter(s => s.attendance && s.attendance.some(a => a.status === 'leave')).length : 0}</div>
                            <div style="color: #666; font-size: 0.9rem;">請假</div>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="color: #6c757d; font-weight: bold; font-size: 1.2rem;">\${window.loadedStudentsData ? window.loadedStudentsData.students.filter(s => !s.attendance || !s.attendance.some(a => a.status)).length : 0}</div>
                            <div style="color: #666; font-size: 0.9rem;">未選擇</div>
                        </div>
                    </div>
                </div>
            \`;
            
            // 重新生成學生列表 - 使用完整的參數
            if (window.loadedStudentsData && window.loadedStudentsData.students) {
                console.log('🔍 重新生成學生列表，使用完整參數');
                displayStudents(
                    window.loadedStudentsData.students,
                    window.loadedStudentsData.teacher,
                    window.loadedStudentsData.course,
                    window.loadedStudentsData.time,
                    window.loadedStudentsData.start,
                    window.loadedStudentsData.end,
                    window.loadedStudentsData.minutesUntilStart
                );
            }
            
            // 重新綁定事件
            setupStudentCardDoubleClickListeners();
            setupAttendanceEventListeners();
            updateStats();
            
            console.log('✅ 學生簽到內容重新創建完成');
        }`;

// 替換函數
const newContent = content.substring(0, functionStart) + newRecreateFunction + content.substring(functionEnd + 1);

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', newContent, 'utf8');

console.log('✅ recreateStudentAttendanceContent 函數已修復');
console.log('📊 修正內容:');
console.log('- 修復 displayStudents 函數調用，使用完整參數');
console.log('- 確保學生列表正確生成');
console.log('- 修復 JavaScript 錯誤');
console.log('- 確保學生簽到功能正常運作');
