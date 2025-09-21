const puppeteer = require('puppeteer');

async function testReleaseAnimation() {
    console.log('🧪 開始測試修復後的釋放動畫...');
    
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
            if (text.includes('動畫') || text.includes('釋放') || text.includes('完成') || text.includes('觸控') || text.includes('滑鼠') || text.includes('過渡')) {
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
        
        // 測試1：滑鼠長按釋放動畫
        console.log('🔄 測試1：滑鼠長按釋放動畫');
        
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
        }, firstCard);
        
        // 等待長按動畫開始
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 觸發 mouseup 事件（釋放）
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            const mouseUpEvent = new MouseEvent('mouseup', {
                clientX: startX,
                clientY: startY,
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(mouseUpEvent);
        }, firstCard);
        
        // 等待釋放動畫完成
        console.log('⏳ 等待滑鼠釋放動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查卡片最終狀態
        const cardState1 = await page.evaluate((card) => {
            return {
                hasPressing: card.classList.contains('pressing'),
                hasCharging: card.classList.contains('charging'),
                hasReleasing: card.classList.contains('releasing'),
                hasCompleting: card.classList.contains('completing'),
                className: card.className,
                transform: card.style.transform,
                animation: card.style.animation
            };
        }, firstCard);
        
        console.log('📊 滑鼠釋放後狀態:', cardState1);
        
        // 測試2：觸控長按釋放動畫
        console.log('🔄 測試2：觸控長按釋放動畫');
        
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
        
        // 觸發 touchend 事件（釋放）
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
        
        // 等待釋放動畫完成
        console.log('⏳ 等待觸控釋放動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查卡片最終狀態
        const cardState2 = await page.evaluate((card) => {
            return {
                hasPressing: card.classList.contains('pressing'),
                hasCharging: card.classList.contains('charging'),
                hasReleasing: card.classList.contains('releasing'),
                hasCompleting: card.classList.contains('completing'),
                className: card.className,
                transform: card.style.transform,
                animation: card.style.animation
            };
        }, firstCard);
        
        console.log('📊 觸控釋放後狀態:', cardState2);
        
        // 測試3：滑動取消動畫
        console.log('🔄 測試3：滑動取消動畫');
        
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
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 模擬滑動
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
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
        
        // 等待滑動取消動畫完成
        console.log('⏳ 等待滑動取消動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查卡片最終狀態
        const cardState3 = await page.evaluate((card) => {
            return {
                hasPressing: card.classList.contains('pressing'),
                hasCharging: card.classList.contains('charging'),
                hasReleasing: card.classList.contains('releasing'),
                hasCompleting: card.classList.contains('completing'),
                className: card.className,
                transform: card.style.transform,
                animation: card.style.animation
            };
        }, firstCard);
        
        console.log('📊 滑動取消後狀態:', cardState3);
        
        console.log('🎉 釋放動畫測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testReleaseAnimation().catch(console.error);
