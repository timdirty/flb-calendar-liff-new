const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('public/perfect-calendar.html', 'utf8');

// 找到 recreateStudentAttendanceContent 函數
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

// 新的 recreateStudentAttendanceContent 函數，包含統計欄位
const newFunction = `function recreateStudentAttendanceContent() {
            console.log('🔄 重新創建學生簽到內容');
            
            const modalContent = document.querySelector('.attendance-modal-content');
            if (!modalContent) return;
            
            // 重新創建學生簽到內容結構
            modalContent.innerHTML = \`
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <h2 style="margin: 0; color: #333333; font-size: 1.5rem; text-shadow: none;">
                            <i class="fas fa-calendar-check" style="color: #b8860b; margin-right: 10px; text-shadow: 0 0 10px rgba(184, 134, 11, 0.5);"></i>
                            課程簽到系統
                        </h2>
                    </div>
                    <button id="closeAttendanceModal" class="close-attendance-modal" style="
                        background: rgba(255, 255, 255, 0.2);
                        border: 1px solid rgba(255, 215, 0, 0.4);
                        font-size: 1.5rem;
                        color: #333333;
                        cursor: pointer;
                        padding: 5px;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                        backdrop-filter: blur(10px);
                        -webkit-backdrop-filter: blur(10px);
                    ">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="course-info" style="
                    margin-bottom: 20px; 
                    padding: 20px; 
                    background: 
                        radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 70%),
                        linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
                    border-radius: 15px; 
                    border: 1px solid rgba(255, 215, 0, 0.3);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                ">
                    <div class="course-info-panel" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.8rem;">
                        <div data-field="teacher" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">講師:</strong> <span id="currentTeacher">載入中...</span></div>
                        <div data-field="course" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">課程:</strong> <span id="currentCourse">載入中...</span></div>
                        <div data-field="time" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">時間:</strong> <span id="currentTime">載入中...</span></div>
                        <div data-field="date" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">日期:</strong> <span id="currentDate">載入中...</span></div>
                    </div>
                </div>
                
                <div id="attendanceContent" style="
                    max-height: 500px;
                    min-height: 500px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding-right: 8px;
                    margin-bottom: 20px;
                ">
                    <!-- 學生列表將在這裡動態生成 -->
                </div>
                
                <!-- 統計欄位 - 接續在學生列表後面 -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: 
                        radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 70%),
                        linear-gradient(135deg, 
                            rgba(255, 255, 255, 0.15) 0%, 
                            rgba(248, 249, 250, 0.1) 50%,
                            rgba(255, 255, 255, 0.15) 100%);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 215, 0, 0.4);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
                    position: sticky;
                    bottom: 0;
                    z-index: 10;
                ">
                    <div id="attendanceStats" style="font-size: 0.85rem; color: #333333; text-shadow: none;">
                        統計載入中...
                    </div>
                </div>
            \`;
            
            // 重新設置關閉按鈕事件監聽器
            const closeBtn = document.getElementById('closeAttendanceModal');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    closeAttendanceModal();
                });
            }
            
            // 填充課程資訊
            setTimeout(() => {
                updateCourseInfoDisplay();
            }, 100);
            
            // 如果學生資料已經載入完成，直接顯示學生列表
            if (window.loadedStudentsData) {
                console.log('✅ 使用已載入的學生資料');
                
                // 然後顯示學生列表
                displayStudents(window.loadedStudentsData.students, 
                              window.loadedStudentsData.teacher, 
                              window.loadedStudentsData.course, 
                              window.loadedStudentsData.time, 
                              window.loadedStudentsData.start, 
                              window.loadedStudentsData.end, 
                              window.loadedStudentsData.minutesUntilStart);
            } else {
                console.log('⚠️ 沒有已載入的學生資料，顯示載入畫面');
            }
        }`;

// 替換函數
const newContent = content.substring(0, functionStart) + newFunction + content.substring(functionEnd + 1);

// 寫入文件
fs.writeFileSync('public/perfect-calendar.html', newContent, 'utf8');

console.log('✅ 統計欄位可見性問題已修復');
console.log('📊 修正內容:');
console.log('- 在 recreateStudentAttendanceContent 中添加統計欄位');
console.log('- 設置統計欄位為 sticky 定位，確保在手機端可見');
console.log('- 添加 z-index 確保統計欄位在最上層');
console.log('- 優化統計欄位的樣式和佈局');
