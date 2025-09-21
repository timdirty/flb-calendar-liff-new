const puppeteer = require('puppeteer');

async function testTouchOptimization() {
    console.log('🧪 開始測試觸控交互優化...');
    
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
            if (text.includes('觸控') || text.includes('滑動') || text.includes('充電') || text.includes('釋放') || text.includes('震動') || text.includes('速度') || text.includes('距離')) {
                console.log('📱 控制台:', text);
            }
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        console.log('✅ 頁面載入完成');
        
        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 查找事件卡片
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個事件卡片`);
        
        if (eventCards.length === 0) {
            console.log('❌ 沒有找到事件卡片，無法測試');
            return;
        }
        
        const firstCard = eventCards[0];
        
        // 測試1：快速觸控響應（200ms）
        console.log('🔄 測試1：快速觸控響應（200ms）');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchStartEvent = new TouchEvent('touchstart', {
                touches: [{
                    clientX: startX,
                    clientY: startY,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchStartEvent);
        }, firstCard);
        
        // 等待200ms後觸控結束
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{
                    clientX: startX,
                    clientY: startY,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchEndEvent);
        }, firstCard);
        
        // 等待動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試2：滑動檢測優化
        console.log('🔄 測試2：滑動檢測優化');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchStartEvent = new TouchEvent('touchstart', {
                touches: [{
                    clientX: startX,
                    clientY: startY,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchStartEvent);
        }, firstCard);
        
        // 等待充電開始
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 模擬滑動
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            // 觸控移動（滑動）
            const touchMoveEvent = new TouchEvent('touchmove', {
                touches: [{
                    clientX: startX + 20, // 向右滑動20px
                    clientY: startY + 20, // 向下滑動20px
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchMoveEvent);
        }, firstCard);
        
        // 觸控結束
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{
                    clientX: startX + 20,
                    clientY: startY + 20,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchEndEvent);
        }, firstCard);
        
        // 等待動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試3：快速滑動檢測
        console.log('🔄 測試3：快速滑動檢測');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchStartEvent = new TouchEvent('touchstart', {
                touches: [{
                    clientX: startX,
                    clientY: startY,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchStartEvent);
        }, firstCard);
        
        // 立即快速滑動
        await new Promise(resolve => setTimeout(resolve, 50));
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            // 快速滑動
            const touchMoveEvent = new TouchEvent('touchmove', {
                touches: [{
                    clientX: startX + 50, // 快速向右滑動50px
                    clientY: startY + 50, // 快速向下滑動50px
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchMoveEvent);
        }, firstCard);
        
        // 觸控結束
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{
                    clientX: startX + 50,
                    clientY: startY + 50,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchEndEvent);
        }, firstCard);
        
        // 等待動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試4：正常長按觸發
        console.log('🔄 測試4：正常長按觸發');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchStartEvent = new TouchEvent('touchstart', {
                touches: [{
                    clientX: startX,
                    clientY: startY,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchStartEvent);
        }, firstCard);
        
        // 等待長按動畫完成
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 檢查模態框是否出現
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現');
            
            // 關閉模態框
            const closeBtn = await page.$('#closeAttendanceModal');
            if (closeBtn) {
                await closeBtn.click();
                console.log('✅ 關閉了模態框');
            }
        } else {
            console.log('❌ 簽到模態框未出現');
        }
        
        console.log('🎉 觸控交互優化測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testTouchOptimization().catch(console.error);
