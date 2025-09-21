const puppeteer = require('puppeteer');

async function testTouchMisclickFix() {
    console.log('🧪 開始測試觸控誤觸發修復...');
    
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
            if (text.includes('觸控') || text.includes('持續時間') || text.includes('太短') || text.includes('充電') || text.includes('載入') || text.includes('模態框') || text.includes('取消')) {
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
        
        // 測試1：短按（0.5秒）- 應該不觸發
        console.log('🔄 測試1：短按（0.5秒）- 應該不觸發');
        
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
        
        // 等待0.5秒
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
        
        // 測試2：中按（1秒）- 應該不觸發
        console.log('🔄 測試2：中按（1秒）- 應該不觸發');
        
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
        
        // 等待1秒
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
        
        // 測試3：觸控取消（移動25px以上）
        console.log('🔄 測試3：觸控取消（移動25px以上）');
        
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
        
        // 移動30px（超過取消閾值25px）
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + card.width / 2;
            const startY = rect.top + card.height / 2;
            
            const touchMoveEvent = new TouchEvent('touchmove', {
                touches: [{
                    clientX: startX + 30, // 向右移動30px
                    clientY: startY + 30, // 向下移動30px
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
                    clientX: startX + 30,
                    clientY: startY + 30,
                    identifier: 1
                }],
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(touchEndEvent);
        }, firstCard);
        
        // 等待動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試4：正常長按觸發（1.8秒）
        console.log('🔄 測試4：正常長按觸發（1.8秒）');
        
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
        
        // 等待1.8秒
        await new Promise(resolve => setTimeout(resolve, 1800));
        
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
        
        // 等待載入完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查模態框是否出現
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現（長按1.8秒觸發成功）');
            
            // 測試5：重複觸發保護
            console.log('🔄 測試5：重複觸發保護');
            
            // 嘗試再次觸發
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
            
            // 等待1.8秒
            await new Promise(resolve => setTimeout(resolve, 1800));
            
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
            
            // 等待一下
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 檢查是否只有一個模態框
            const modals = await page.$$('.attendance-modal-content');
            console.log(`📊 模態框數量: ${modals.length} (應該只有1個)`);
            
            // 關閉模態框
            const closeBtn = await page.$('#closeAttendanceModal');
            if (closeBtn) {
                await closeBtn.click();
                console.log('✅ 關閉了模態框');
            }
        } else {
            console.log('❌ 簽到模態框未出現（長按1.8秒未觸發）');
        }
        
        console.log('🎉 觸控誤觸發修復測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testTouchMisclickFix().catch(console.error);
