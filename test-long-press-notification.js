const puppeteer = require('puppeteer');

async function testLongPressNotification() {
    console.log('🧪 開始測試長按行事曆方塊→簽到→通知流程...');
    
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
            if (text.includes('簽到') || text.includes('通知') || text.includes('模態框') || text.includes('課程信息') || text.includes('長按') || text.includes('集氣')) {
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
        
        // 強制觸發課程渲染
        await page.evaluate(() => {
            // 切換到週視圖
            if (typeof switchToWeekView === 'function') {
                switchToWeekView();
            }
            
            // 如果沒有課程顯示，嘗試觸發重新渲染
            if (typeof renderEvents === 'function') {
                renderEvents();
            }
            
            // 檢查當前視圖
            console.log('當前視圖:', window.currentView);
            console.log('所有事件數量:', window.allEvents ? window.allEvents.length : 0);
        });
        
        // 等待視圖切換和渲染完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 再次檢查事件
        const eventCount = await page.evaluate(() => {
            const calendarEvents = document.querySelectorAll('.calendar-event').length;
            const weekEvents = document.querySelectorAll('.week-event').length;
            const dayEvents = document.querySelectorAll('.day-event').length;
            return { calendarEvents, weekEvents, dayEvents };
        });
        
        console.log('📊 事件統計:', eventCount);
        
        // 查找課程事件卡片
        const eventCards = await page.$$('.calendar-event');
        const weekEvents = await page.$$('.week-event');
        const dayEvents = await page.$$('.day-event');
        
        console.log(`📅 找到事件卡片: 日曆=${eventCards.length}, 週視圖=${weekEvents.length}, 日視圖=${dayEvents.length}`);
        
        const eventsToTest = eventCards.length > 0 ? eventCards : (weekEvents.length > 0 ? weekEvents : dayEvents);
        
        if (eventsToTest.length === 0) {
            console.log('❌ 沒有找到任何課程事件，無法測試');
            return;
        }
        
        console.log(`🎯 將測試 ${eventsToTest.length} 個事件`);
        
        // 長按第一個課程事件
        const firstEvent = eventsToTest[0];
        console.log('🔄 開始長按課程事件...');
        
        // 模擬真實的長按操作
        await page.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            // 觸發 mousedown 事件
            const mouseDownEvent = new MouseEvent('mousedown', {
                clientX: startX,
                clientY: startY,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(mouseDownEvent);
            
            // 觸發長按檢測
            if (window.startLongPress) {
                window.startLongPress({
                    target: element,
                    clientX: startX,
                    clientY: startY
                });
            }
        }, firstEvent);
        
        // 等待長按動畫完成（2.5秒）
        console.log('⏳ 等待長按動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 檢查是否出現簽到模態框
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現');
            
            // 等待學生數據載入
            console.log('⏳ 等待學生數據載入...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 檢查是否有學生卡片
            const studentCards = await page.$$('.student-card');
            console.log(`👥 找到 ${studentCards.length} 個學生卡片`);
            
            if (studentCards.length > 0) {
                // 模擬學生簽到
                console.log('📝 模擬學生簽到...');
                
                // 點擊第一個學生的出席按鈕
                const firstStudentPresentBtn = await page.$('.student-card .present-btn');
                if (firstStudentPresentBtn) {
                    await firstStudentPresentBtn.click();
                    console.log('✅ 點擊了第一個學生的出席按鈕');
                    
                    // 等待一下
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // 點擊第二個學生的缺席按鈕（如果存在）
                    const secondStudentAbsentBtn = await page.$$('.student-card .absent-btn');
                    if (secondStudentAbsentBtn.length > 1) {
                        await secondStudentAbsentBtn[1].click();
                        console.log('✅ 點擊了第二個學生的缺席按鈕');
                    }
                    
                    // 等待通知發送
                    console.log('⏳ 等待通知發送...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    console.log('🎉 測試完成！請檢查控制台日誌和LINE通知');
                } else {
                    console.log('❌ 沒有找到出席按鈕');
                }
            } else {
                console.log('❌ 沒有找到學生卡片');
            }
        } else {
            console.log('❌ 簽到模態框未出現');
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
testLongPressNotification().catch(console.error);
