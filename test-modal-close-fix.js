const puppeteer = require('puppeteer');

async function testModalCloseFix() {
    console.log('🧪 開始測試模態框關閉修復...');
    
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
            if (text.includes('模態框') || text.includes('關閉') || text.includes('載入') || text.includes('取消') || text.includes('學生') || text.includes('動畫') || text.includes('完成')) {
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
        
        // 測試1：長按觸發簽到模態框
        console.log('🔄 測試1：長按觸發簽到模態框');
        
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
        console.log('⏳ 等待長按動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 檢查模態框是否出現
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現');
            
            // 等待學生資料載入
            console.log('⏳ 等待學生資料載入...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 測試2：檢查關閉按鈕是否可用
            console.log('🔄 測試2：檢查關閉按鈕是否可用');
            
            const closeBtn = await page.$('#closeAttendanceModal');
            if (closeBtn) {
                console.log('✅ 找到關閉按鈕');
                
                // 檢查按鈕是否可點擊
                const isClickable = await page.evaluate((btn) => {
                    return !btn.disabled && btn.offsetParent !== null;
                }, closeBtn);
                
                if (isClickable) {
                    console.log('✅ 關閉按鈕可點擊');
                    
                    // 點擊關閉按鈕
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
                    console.log('❌ 關閉按鈕不可點擊');
                }
            } else {
                console.log('❌ 沒有找到關閉按鈕');
            }
        } else {
            console.log('❌ 簽到模態框未出現');
        }
        
        // 測試3：測試釋放動畫是否還有閃爍
        console.log('🔄 測試3：測試釋放動畫是否還有閃爍');
        
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
        
        console.log('🎉 模態框關閉修復測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testModalCloseFix().catch(console.error);
