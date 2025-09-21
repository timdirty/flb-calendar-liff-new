const puppeteer = require('puppeteer');

async function testLongPressDebug() {
    console.log('🧪 開始調試長按功能...');
    
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
            console.log('📱 控制台:', text);
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        console.log('✅ 頁面載入完成');
        
        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 檢查頁面狀態
        const pageInfo = await page.evaluate(() => {
            return {
                hasAllEvents: typeof allEvents !== 'undefined' && allEvents && allEvents.length > 0,
                eventCount: allEvents ? allEvents.length : 0,
                currentView: window.currentView,
                hasEventCards: document.querySelectorAll('.event-card').length,
                hasCalendarEvents: document.querySelectorAll('.calendar-event').length,
                hasWeekEvents: document.querySelectorAll('.week-event').length,
                hasDayEvents: document.querySelectorAll('.day-event').length
            };
        });
        
        console.log('📊 頁面狀態:', pageInfo);
        
        // 強制切換到週視圖
        await page.evaluate(() => {
            if (typeof switchToWeekView === 'function') {
                switchToWeekView();
            }
        });
        
        // 等待視圖切換
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 再次檢查事件卡片
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個事件卡片`);
        
        if (eventCards.length === 0) {
            console.log('❌ 沒有找到事件卡片，嘗試其他選擇器...');
            
            // 檢查其他可能的選擇器
            const allCards = await page.evaluate(() => {
                const selectors = [
                    '.calendar-event',
                    '.week-event', 
                    '.day-event',
                    '.event-card',
                    '[data-event-title]',
                    '.event-item'
                ];
                
                const results = {};
                selectors.forEach(selector => {
                    results[selector] = document.querySelectorAll(selector).length;
                });
                return results;
            });
            
            console.log('🔍 所有選擇器結果:', allCards);
            
            // 如果還是沒有找到，截圖調試
            await page.screenshot({ path: 'debug-no-cards.png' });
            console.log('📸 已截圖保存為 debug-no-cards.png');
            return;
        }
        
        // 測試長按功能
        const firstCard = eventCards[0];
        console.log('🔄 開始測試長按功能...');
        
        // 獲取卡片信息
        const cardInfo = await page.evaluate((card) => {
            return {
                className: card.className,
                dataset: card.dataset,
                textContent: card.textContent.substring(0, 100)
            };
        }, firstCard);
        
        console.log('📋 卡片信息:', cardInfo);
        
        // 模擬長按
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            // 觸發 mousedown 事件
            const mouseDownEvent = new MouseEvent('mousedown', {
                clientX: startX,
                clientY: startY,
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(mouseDownEvent);
            
            console.log('🖱️ 觸發了 mousedown 事件');
        }, firstCard);
        
        // 等待長按動畫
        console.log('⏳ 等待長按動畫...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查是否有充電動畫
        const chargingState = await page.evaluate((card) => {
            return {
                hasPressing: card.classList.contains('pressing'),
                hasCharging: card.classList.contains('charging'),
                hasReleasing: card.classList.contains('releasing'),
                className: card.className
            };
        }, firstCard);
        
        console.log('🔋 充電狀態:', chargingState);
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 3000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testLongPressDebug().catch(console.error);
