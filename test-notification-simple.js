const puppeteer = require('puppeteer');

async function testNotificationSimple() {
    console.log('🧪 開始簡單測試通知功能...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 監聽控制台消息
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('簽到') || text.includes('通知') || text.includes('模態框') || text.includes('課程信息') || text.includes('長按') || text.includes('集氣') || text.includes('準備發送') || text.includes('已發送')) {
                console.log('📱 控制台:', text);
            }
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        console.log('✅ 頁面載入完成');
        
        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 直接測試通知功能
        console.log('🔧 直接測試通知功能...');
        
        const testResult = await page.evaluate(async () => {
            // 創建測試模態框
            const modal = document.createElement('div');
            modal.className = 'attendance-modal-content';
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                min-width: 300px;
            `;
            
            modal.innerHTML = `
                <div class="course-info-panel" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.9rem;">
                    <div data-field="teacher" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">講師:</strong> TED</div>
                    <div data-field="course" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">課程:</strong> SPIKE</div>
                    <div data-field="time" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">時間:</strong> 日 15:15-17:15</div>
                    <div data-field="date" style="color: #333333;"><strong style="color: #b8860b; font-weight: 600;">日期:</strong> 2025/9/21</div>
                </div>
                <div id="attendanceContent">
                    <div class="student-card" data-student-id="student1">
                        <div class="student-name">學生A</div>
                        <button class="present-btn">出席</button>
                        <button class="absent-btn">缺席</button>
                    </div>
                    <div class="student-card" data-student-id="student2">
                        <div class="student-name">學生B</div>
                        <button class="present-btn">出席</button>
                        <button class="absent-btn">缺席</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 重置通知狀態
            window.attendanceNotificationSent = false;
            
            // 模擬學生簽到狀態
            window.studentAttendanceStatus = {
                '學生A': 'present',
                '學生B': 'absent'
            };
            
            console.log('🔧 測試環境設置完成');
            
            // 測試 getCurrentEventInfo
            if (typeof getCurrentEventInfo === 'function') {
                const eventInfo = getCurrentEventInfo();
                console.log('📋 課程信息:', eventInfo);
            }
            
            // 測試通知發送
            if (typeof sendBatchAttendanceNotification === 'function') {
                console.log('📤 開始發送通知...');
                try {
                    const result = await sendBatchAttendanceNotification();
                    console.log('📤 通知發送結果:', result);
                    return { success: true, result };
                } catch (error) {
                    console.log('❌ 通知發送錯誤:', error);
                    return { success: false, error: error.message };
                }
            } else {
                console.log('❌ sendBatchAttendanceNotification 函數不存在');
                return { success: false, error: '函數不存在' };
            }
        });
        
        if (testResult.success) {
            console.log('✅ 通知測試成功！');
            console.log('📊 結果:', testResult.result);
        } else {
            console.log('❌ 通知測試失敗');
            console.log('📊 錯誤:', testResult.error);
        }
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 3000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testNotificationSimple().catch(console.error);
