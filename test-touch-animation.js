const puppeteer = require('puppeteer');

async function testTouchAnimation() {
    console.log('🧪 開始測試優化後的觸控長按動畫...');
    
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
            if (text.includes('長按') || text.includes('觸控') || text.includes('動畫') || text.includes('釋放') || text.includes('充電') || text.includes('集氣') || text.includes('震動') || text.includes('按壓')) {
                console.log('📱 控制台:', text);
            }
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        console.log('✅ 頁面載入完成');
        
        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 查找事件卡片
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個事件卡片`);
        
        if (eventCards.length === 0) {
            console.log('❌ 沒有找到事件卡片，無法測試');
            return;
        }
        
        // 測試觸控長按
        const firstCard = eventCards[0];
        console.log('🔄 開始測試觸控長按...');
        
        // 模擬觸控開始
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            // 觸發 touchstart 事件
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
            
            console.log('👆 觸發了 touchstart 事件');
        }, firstCard);
        
        // 等待長按動畫開始
        console.log('⏳ 等待長按動畫開始...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查動畫狀態
        const animationState = await page.evaluate((card) => {
            return {
                hasPressing: card.classList.contains('pressing'),
                hasCharging: card.classList.contains('charging'),
                hasReleasing: card.classList.contains('releasing'),
                className: card.className,
                transform: card.style.transform,
                animation: card.style.animation
            };
        }, firstCard);
        
        console.log('🎬 動畫狀態:', animationState);
        
        // 模擬觸控結束（釋放）
        console.log('👆 模擬觸控釋放...');
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            // 觸發 touchend 事件
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
            
            console.log('👆 觸發了 touchend 事件');
        }, firstCard);
        
        // 等待釋放動畫完成
        console.log('⏳ 等待釋放動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查最終狀態
        const finalState = await page.evaluate((card) => {
            return {
                hasPressing: card.classList.contains('pressing'),
                hasCharging: card.classList.contains('charging'),
                hasReleasing: card.classList.contains('releasing'),
                className: card.className,
                transform: card.style.transform,
                animation: card.style.animation,
                boxShadow: card.style.boxShadow,
                border: card.style.border
            };
        }, firstCard);
        
        console.log('🏁 最終狀態:', finalState);
        
        // 測試多次觸控
        console.log('🔄 測試多次觸控...');
        for (let i = 0; i < 3; i++) {
            console.log(`📱 第 ${i + 1} 次觸控測試`);
            
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
            
            // 等待一下
            await new Promise(resolve => setTimeout(resolve, 500));
            
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
            await new Promise(resolve => setTimeout(resolve, 600));
        }
        
        console.log('🎉 觸控動畫測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testTouchAnimation().catch(console.error);
