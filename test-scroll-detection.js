const puppeteer = require('puppeteer');

async function testScrollDetection() {
    console.log('🧪 開始測試滑動檢測功能...');
    
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
            if (text.includes('滑動') || text.includes('觸控') || text.includes('長按') || text.includes('檢測') || text.includes('取消') || text.includes('充電') || text.includes('釋放')) {
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
        
        // 測試1：正常長按（不滑動）
        console.log('🔄 測試1：正常長按（不滑動）');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
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
        
        // 等待長按動畫開始
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 正常結束（不滑動）
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
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
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試2：滑動操作
        console.log('🔄 測試2：滑動操作（應該取消長按）');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
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
        
        // 等待一下讓長按開始
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 模擬滑動
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
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
        
        // 等待一下讓滑動檢測生效
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 觸控結束
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
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
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試3：輕微移動（不應該觸發滑動）
        console.log('🔄 測試3：輕微移動（不應該觸發滑動）');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
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
        
        // 等待一下讓長按開始
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 模擬輕微移動（5px，小於閾值10px）
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            const touchMoveEvent = new TouchEvent('touchmove', {
                touches: [{
                    clientX: startX + 5, // 輕微移動5px
                    clientY: startY + 5,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchMoveEvent);
        }, firstCard);
        
        // 等待一下
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 觸控結束
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{
                    clientX: startX + 5,
                    clientY: startY + 5,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchEndEvent);
        }, firstCard);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🎉 滑動檢測測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testScrollDetection().catch(console.error);
