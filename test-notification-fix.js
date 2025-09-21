const puppeteer = require('puppeteer');

async function testNotificationFix() {
    console.log('🧪 開始測試通知修復...');
    
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
            if (text.includes('簽到') || text.includes('通知') || text.includes('模態框') || text.includes('課程信息')) {
                console.log('📱 控制台:', text);
            }
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        console.log('✅ 頁面載入完成');
        
        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 查找課程事件卡片
        const eventCards = await page.$$('.calendar-event');
        console.log(`📅 找到 ${eventCards.length} 個課程事件`);
        
        if (eventCards.length === 0) {
            console.log('❌ 沒有找到課程事件，無法測試');
            return;
        }
        
        // 長按第一個課程事件
        const firstEvent = eventCards[0];
        console.log('🔄 開始長按課程事件...');
        
        await page.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            // 模擬長按
            const mouseDownEvent = new MouseEvent('mousedown', {
                clientX: startX,
                clientY: startY,
                bubbles: true
            });
            element.dispatchEvent(mouseDownEvent);
            
            // 觸發長按檢測
            if (window.startLongPress) {
                window.startLongPress({
                    target: element,
                    clientX: startX,
                    clientY: startY
                });
            }
        }, firstEvent);
        
        // 等待長按動畫完成
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 檢查是否出現簽到模態框
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現');
            
            // 檢查課程信息面板
            const courseInfoPanel = await page.$('.course-info-panel');
            if (courseInfoPanel) {
                console.log('✅ 課程信息面板已找到');
                
                // 檢查data-field元素
                const teacherElement = await page.$('[data-field="teacher"]');
                const courseElement = await page.$('[data-field="course"]');
                const timeElement = await page.$('[data-field="time"]');
                
                if (teacherElement && courseElement && timeElement) {
                    console.log('✅ data-field元素已找到');
                    
                    // 獲取文本內容
                    const teacherText = await page.evaluate(el => el.textContent, teacherElement);
                    const courseText = await page.evaluate(el => el.textContent, courseElement);
                    const timeText = await page.evaluate(el => el.textContent, timeElement);
                    
                    console.log('📋 課程信息:');
                    console.log('  講師:', teacherText);
                    console.log('  課程:', courseText);
                    console.log('  時間:', timeText);
                    
                    // 測試getCurrentEventInfo函數
                    const eventInfo = await page.evaluate(() => {
                        if (typeof getCurrentEventInfo === 'function') {
                            return getCurrentEventInfo();
                        }
                        return null;
                    });
                    
                    if (eventInfo) {
                        console.log('✅ getCurrentEventInfo函數正常工作');
                        console.log('📊 獲取的課程信息:', eventInfo);
                    } else {
                        console.log('❌ getCurrentEventInfo函數返回null');
                    }
                    
                } else {
                    console.log('❌ data-field元素未找到');
                }
            } else {
                console.log('❌ 課程信息面板未找到');
            }
        } else {
            console.log('❌ 簽到模態框未出現');
        }
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testNotificationFix().catch(console.error);
