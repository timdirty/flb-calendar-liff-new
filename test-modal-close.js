const puppeteer = require('puppeteer');

async function testModalClose() {
    console.log('🧪 開始測試簽到模態框關閉功能...');
    
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
            if (text.includes('模態框') || text.includes('關閉') || text.includes('載入') || text.includes('取消') || text.includes('簽到') || text.includes('學生') || text.includes('通知')) {
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
        
        // 等待長按動畫完成
        console.log('⏳ 等待長按動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 檢查模態框是否出現
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現');
            
            // 測試2：點擊關閉按鈕
            console.log('🔄 測試2：點擊關閉按鈕');
            
            const closeBtn = await page.$('#closeAttendanceModal');
            if (closeBtn) {
                console.log('✅ 找到關閉按鈕');
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
        
        // 測試3：重新觸發模態框並測試背景點擊關閉
        console.log('🔄 測試3：重新觸發模態框並測試背景點擊關閉');
        
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
        
        // 等待長按動畫完成
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 檢查模態框是否出現
        const modal2 = await page.$('.attendance-modal-content');
        if (modal2) {
            console.log('✅ 簽到模態框已出現（第二次）');
            
            // 點擊背景關閉
            console.log('🔄 點擊背景關閉模態框');
            
            await page.evaluate(() => {
                const modal = document.querySelector('.attendance-modal-content');
                if (modal && modal.parentElement) {
                    // 模擬點擊背景
                    const backgroundClick = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true
                    });
                    modal.parentElement.dispatchEvent(backgroundClick);
                }
            });
            
            // 等待模態框關閉
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 檢查模態框是否已關閉
            const modalAfterBackgroundClose = await page.$('.attendance-modal-content');
            if (!modalAfterBackgroundClose) {
                console.log('✅ 背景點擊成功關閉模態框');
            } else {
                console.log('❌ 背景點擊未能關閉模態框');
            }
        } else {
            console.log('❌ 簽到模態框未出現（第二次）');
        }
        
        console.log('🎉 模態框關閉功能測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testModalClose().catch(console.error);
