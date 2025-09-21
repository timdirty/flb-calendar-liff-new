const puppeteer = require('puppeteer');

async function testSmoothAnimation() {
    console.log('🧪 開始測試流暢動畫修復...');
    
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
            if (text.includes('動畫') || text.includes('釋放') || text.includes('觸控') || text.includes('滑鼠') || text.includes('衝突') || text.includes('完成')) {
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
        
        // 測試多次快速觸控，檢查是否有卡頓
        console.log('🔄 測試快速觸控（檢查卡頓）...');
        
        for (let i = 0; i < 5; i++) {
            console.log(`📱 第 ${i + 1} 次快速觸控測試`);
            
            // 觸控開始
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
            
            // 短暫等待（模擬快速觸控）
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 觸控結束
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
            
            // 等待動畫完成
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 檢查卡片狀態
            const cardState = await page.evaluate((card) => {
                return {
                    hasPressing: card.classList.contains('pressing'),
                    hasCharging: card.classList.contains('charging'),
                    hasReleasing: card.classList.contains('releasing'),
                    className: card.className,
                    transform: card.style.transform,
                    animation: card.style.animation
                };
            }, firstCard);
            
            console.log(`📊 第 ${i + 1} 次觸控後狀態:`, cardState);
        }
        
        // 測試長按觸控
        console.log('🔄 測試長按觸控...');
        
        // 觸控開始
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
        
        // 等待長按動畫
        console.log('⏳ 等待長按動畫...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 觸控結束
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
        console.log('⏳ 等待釋放動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // 檢查最終狀態
        const finalState = await page.evaluate((card) => {
            return {
                hasPressing: card.classList.contains('pressing'),
                hasCharging: card.classList.contains('charging'),
                hasReleasing: card.classList.contains('releasing'),
                className: card.className,
                transform: card.style.transform,
                animation: card.style.animation
            };
        }, firstCard);
        
        console.log('🏁 最終狀態:', finalState);
        console.log('🎉 流暢動畫測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testSmoothAnimation().catch(console.error);
