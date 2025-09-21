const puppeteer = require('puppeteer');

async function testNotificationDirect() {
    console.log('🧪 開始直接測試通知修復...');
    
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
            if (text.includes('簽到') || text.includes('通知') || text.includes('模態框') || text.includes('課程信息') || text.includes('函數')) {
                console.log('📱 控制台:', text);
            }
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        console.log('✅ 頁面載入完成');
        
        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 檢查是否有課程數據
        const hasEvents = await page.evaluate(() => {
            return typeof allEvents !== 'undefined' && allEvents && allEvents.length > 0;
        });
        console.log('📊 是否有課程數據:', hasEvents);
        
        if (!hasEvents) {
            console.log('❌ 沒有課程數據，無法測試');
            return;
        }
        
        // 直接創建一個測試用的簽到模態框
        console.log('🔧 創建測試用簽到模態框...');
        
        const testResult = await page.evaluate(() => {
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
            `;
            
            document.body.appendChild(modal);
            
            // 測試 getCurrentEventInfo 函數
            if (typeof getCurrentEventInfo === 'function') {
                const result = getCurrentEventInfo();
                console.log('🔍 getCurrentEventInfo 結果:', result);
                return result;
            } else {
                console.log('❌ getCurrentEventInfo 函數不存在');
                return null;
            }
        });
        
        if (testResult) {
            console.log('✅ getCurrentEventInfo 函數正常工作');
            console.log('📊 獲取的課程信息:', testResult);
            
            // 測試通知發送
            console.log('📤 測試通知發送...');
            
            const notificationResult = await page.evaluate(async () => {
                // 重置通知狀態
                window.attendanceNotificationSent = false;
                
                // 模擬學生簽到狀態
                window.studentAttendanceStatus = {
                    '學生A': 'present',
                    '學生B': 'absent'
                };
                
                // 檢查函數是否存在
                if (typeof sendBatchAttendanceNotification === 'function') {
                    console.log('✅ sendBatchAttendanceNotification 函數存在');
                    console.log('🔧 重置通知狀態和學生狀態');
                    
                    try {
                        const result = await sendBatchAttendanceNotification();
                        console.log('📤 函數調用結果:', result);
                        return result;
                    } catch (error) {
                        console.log('❌ 函數調用錯誤:', error);
                        return null;
                    }
                } else {
                    console.log('❌ sendBatchAttendanceNotification 函數不存在');
                    console.log('🔍 可用的函數:', Object.keys(window).filter(key => typeof window[key] === 'function'));
                    return null;
                }
            });
            
            if (notificationResult) {
                console.log('✅ 通知發送函數調用成功');
            } else {
                console.log('❌ 通知發送函數調用失敗');
            }
            
        } else {
            console.log('❌ getCurrentEventInfo 函數返回null');
        }
        
        // 清理測試模態框
        await page.evaluate(() => {
            const modal = document.querySelector('.attendance-modal-content');
            if (modal) {
                modal.remove();
            }
        });
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testNotificationDirect().catch(console.error);
