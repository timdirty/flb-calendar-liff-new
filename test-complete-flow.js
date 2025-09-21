const puppeteer = require('puppeteer');

async function testCompleteFlow() {
    console.log('🧪 開始測試完整的長按→簽到→通知流程...');
    
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
            if (text.includes('簽到') || text.includes('通知') || text.includes('模態框') || text.includes('課程信息') || text.includes('長按') || text.includes('集氣') || text.includes('準備發送') || text.includes('已發送') || text.includes('學生') || text.includes('出席') || text.includes('缺席')) {
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
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 檢查是否有學生卡片
            const studentCards = await page.$$('.student-card');
            console.log(`👥 找到 ${studentCards.length} 個學生卡片`);
            
            if (studentCards.length > 0) {
                // 模擬學生簽到
                console.log('📝 模擬學生簽到...');
                
                // 點擊第一個學生的出席按鈕
                const presentButtons = await page.$$('.student-card .present-btn');
                if (presentButtons.length > 0) {
                    await presentButtons[0].click();
                    console.log('✅ 點擊了第一個學生的出席按鈕');
                    
                    // 等待一下
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // 點擊第二個學生的缺席按鈕（如果存在）
                    const absentButtons = await page.$$('.student-card .absent-btn');
                    if (absentButtons.length > 1) {
                        await absentButtons[1].click();
                        console.log('✅ 點擊了第二個學生的缺席按鈕');
                    }
                    
                    // 等待通知發送
                    console.log('⏳ 等待通知發送...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    console.log('🎉 測試完成！請檢查控制台日誌和LINE通知');
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
testCompleteFlow().catch(console.error);
