const puppeteer = require('puppeteer');

async function testAnimationAndLoadingFix() {
    console.log('🧪 開始測試釋放動畫和載入中斷修復...');
    
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
            if (text.includes('動畫') || text.includes('載入') || text.includes('模態框') || text.includes('關閉') || text.includes('超時') || text.includes('重置')) {
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
        
        // 測試1：測試釋放動畫是否還有閃爍
        console.log('🔄 測試1：測試釋放動畫是否還有閃爍');
        
        // 長按觸發動畫
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
        
        // 等待長按動畫開始
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 觸控結束（釋放）
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
        
        // 等待釋放動畫完成
        console.log('⏳ 等待釋放動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查卡片最終狀態
        const cardState = await page.evaluate((card) => {
            return {
                hasPressing: card.classList.contains('pressing'),
                hasCharging: card.classList.contains('charging'),
                hasReleasing: card.classList.contains('releasing'),
                hasCompleting: card.classList.contains('completing'),
                className: card.className,
                transform: card.style.transform,
                animation: card.style.animation,
                transition: card.style.transition
            };
        }, firstCard);
        
        console.log('📊 釋放動畫完成後狀態:', cardState);
        
        // 測試2：測試載入中斷處理
        console.log('🔄 測試2：測試載入中斷處理');
        
        // 重新觸發模態框
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
            
            // 立即關閉模態框（模擬載入中斷）
            console.log('🔄 立即關閉模態框（模擬載入中斷）');
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
        
        // 測試3：測試載入超時保護
        console.log('🔄 測試3：測試載入超時保護');
        
        // 重新觸發模態框
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
        const modal2 = await page.$('.attendance-modal-content');
        if (modal2) {
            console.log('✅ 簽到模態框已出現，等待載入超時...');
            
            // 等待載入超時（15秒）
            console.log('⏳ 等待載入超時（15秒）...');
            await new Promise(resolve => setTimeout(resolve, 16000));
            
            // 檢查模態框是否被自動關閉
            const modalAfterTimeout = await page.$('.attendance-modal-content');
            if (!modalAfterTimeout) {
                console.log('✅ 載入超時，模態框已自動關閉');
            } else {
                console.log('❌ 載入超時，模態框未自動關閉');
            }
        } else {
            console.log('❌ 簽到模態框未出現');
        }
        
        console.log('🎉 釋放動畫和載入中斷修復測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testAnimationAndLoadingFix().catch(console.error);
