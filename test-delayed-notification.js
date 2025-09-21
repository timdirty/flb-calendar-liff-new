const puppeteer = require('puppeteer');

async function testDelayedNotification() {
    console.log('🧪 開始測試延遲通知功能...');
    
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
            if (text.includes('簽到') || text.includes('通知') || text.includes('進度') || text.includes('標記') || text.includes('學生') || text.includes('出席') || text.includes('缺席') || text.includes('狀態') || text.includes('等待') || text.includes('定時器') || text.includes('發送')) {
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
        
        // 長按第一個課程事件
        const firstCard = eventCards[0];
        console.log('🔄 開始長按課程事件...');
        
        // 模擬真實的長按操作
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
            
            console.log('🖱️ 觸發了 mousedown 事件');
        }, firstCard);
        
        // 等待長按動畫完成（2.5秒）
        console.log('⏳ 等待長按動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 檢查是否出現簽到模態框
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現');
            
            // 等待學生數據載入
            console.log('⏳ 等待學生數據載入...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 檢查學生卡片
            const studentCards = await page.$$('#studentsList .student-card, #studentsList .attendance-student-item, #studentsList .student-item, #studentsList [data-student-id]');
            console.log(`👥 找到 ${studentCards.length} 個學生卡片`);
            
            if (studentCards.length > 0) {
                // 檢查按鈕狀態
                const presentButtons = await page.$$('#studentsList .present-btn');
                console.log(`🔍 找到 ${presentButtons.length} 個出席按鈕`);
                
                if (presentButtons.length > 0) {
                    const buttonInfo = await page.evaluate((btn) => {
                        return {
                            disabled: btn.disabled,
                            textContent: btn.textContent.trim(),
                            className: btn.className,
                            dataset: btn.dataset
                        };
                    }, presentButtons[0]);
                    
                    console.log('🔍 按鈕狀態:', buttonInfo);
                    
                    if (!buttonInfo.disabled) {
                        console.log('✅ 按鈕可以點擊，開始測試延遲通知...');
                        
                        // 點擊第一個學生的出席按鈕
                        await presentButtons[0].click();
                        console.log('✅ 點擊了第一個學生的出席按鈕');
                        
                        // 等待通知發送（應該等待3秒）
                        console.log('⏳ 等待通知發送（應該等待3秒）...');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        
                        console.log('🎉 測試完成！請檢查控制台日誌確認延遲通知功能');
                    } else {
                        console.log('⚠️ 按鈕被禁用，可能是時間限制');
                    }
                } else {
                    console.log('❌ 沒有找到出席按鈕');
                }
            } else {
                console.log('❌ 沒有找到學生卡片');
            }
        } else {
            console.log('❌ 簽到模態框未出現');
        }
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 3000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testDelayedNotification().catch(console.error);
