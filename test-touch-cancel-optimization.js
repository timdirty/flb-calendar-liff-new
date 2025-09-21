const puppeteer = require('puppeteer');

async function testTouchCancelOptimization() {
    console.log('🧪 開始測試觸控取消優化...');
    
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
            if (text.includes('觸控') || text.includes('取消') || text.includes('滑動') || text.includes('充電') || text.includes('釋放') || text.includes('距離') || text.includes('速度')) {
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
        
        // 測試1：觸控取消機制（移動15px以上）
        console.log('🔄 測試1：觸控取消機制（移動15px以上）');
        
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
        
        // 等待按壓效果
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 移動20px（超過取消閾值15px）
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchMoveEvent = new TouchEvent('touchmove', {
                touches: [{
                    clientX: startX + 20, // 向右移動20px
                    clientY: startY + 20, // 向下移動20px
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
        
        // 測試2：滑動檢測（移動5-15px之間）
        console.log('🔄 測試2：滑動檢測（移動5-15px之間）');
        
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
        
        // 等待按壓效果
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 移動10px（在滑動閾值範圍內）
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchMoveEvent = new TouchEvent('touchmove', {
                touches: [{
                    clientX: startX + 10, // 向右移動10px
                    clientY: startY + 10, // 向下移動10px
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
                    clientX: startX + 10,
                    clientY: startY + 10,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchEndEvent);
        }, firstCard);
        
        // 等待動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試3：正常長按觸發（0.5秒）
        console.log('🔄 測試3：正常長按觸發（0.5秒）');
        
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
        
        // 等待長按動畫完成（0.5秒 + 1.5秒）
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查模態框是否出現
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現');
            
            // 測試4：載入中關閉按鈕
            console.log('🔄 測試4：載入中關閉按鈕');
            
            // 等待載入開始
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 點擊關閉按鈕
            const closeBtn = await page.$('#closeAttendanceModal');
            if (closeBtn) {
                await closeBtn.click();
                console.log('✅ 點擊了關閉按鈕');
                
                // 等待模態框關閉
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 檢查模態框是否已關閉
                const modalAfterClose = await page.$('.attendance-modal-content');
                if (!modalAfterClose) {
                    console.log('✅ 模態框已成功關閉');
                } else {
                    console.log('❌ 模態框未關閉');
                }
            } else {
                console.log('❌ 沒有找到關閉按鈕');
            }
        } else {
            console.log('❌ 簽到模態框未出現');
        }
        
        // 測試5：快速觸控取消（立即移動）
        console.log('🔄 測試5：快速觸控取消（立即移動）');
        
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
        
        // 立即移動（50ms後）
        await new Promise(resolve => setTimeout(resolve, 50));
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchMoveEvent = new TouchEvent('touchmove', {
                touches: [{
                    clientX: startX + 25, // 快速移動25px
                    clientY: startY + 25,
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
                    clientX: startX + 25,
                    clientY: startY + 25,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchEndEvent);
        }, firstCard);
        
        // 等待動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🎉 觸控取消優化測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testTouchCancelOptimization().catch(console.error);
