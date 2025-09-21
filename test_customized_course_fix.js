const puppeteer = require('puppeteer');

async function testCustomizedCourseFix() {
    console.log('🧪 開始測試客製化課程關鍵字移除修復...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        // 設置控制台日誌捕獲
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'log' && (text.includes('客製化') || text.includes('清理特殊事件') || text.includes('解析成功') || text.includes('API請求') || text.includes('學生資料回應'))) {
                console.log(`[${type.toUpperCase()}] ${text}`);
            }
        });
        
        console.log('📱 載入頁面...');
        await page.goto('http://localhost:3001/perfect-calendar.html', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log('⏳ 等待頁面初始化...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 等待課程卡片出現
        console.log('🔍 尋找課程卡片...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        // 尋找包含「客製化」的課程卡片
        console.log('🔍 尋找包含客製化的課程卡片...');
        const courseCards = await page.$$('.event-card');
        let customizedCard = null;
        
        for (const card of courseCards) {
            const title = await card.evaluate(el => el.textContent);
            if (title.includes('客製化')) {
                console.log(`✅ 找到包含客製化的課程: ${title}`);
                customizedCard = card;
                break;
            }
        }
        
        if (!customizedCard) {
            console.log('⚠️ 沒有找到包含客製化的課程卡片，嘗試長按第一個課程卡片');
            customizedCard = courseCards[0];
        }
        
        // 長按課程卡片
        console.log('👆 長按課程卡片...');
        await page.mouse.move(100, 200);
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 長按1秒
        await page.mouse.up();
        
        console.log('⏳ 等待簽到模態框出現...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 等待學生資料載入
        console.log('⏳ 等待學生資料載入...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 檢查是否有錯誤訊息
        console.log('🔍 檢查是否有錯誤訊息...');
        const errorElements = await page.$$('.error-message, .alert-danger, [class*="error"]');
        if (errorElements.length > 0) {
            for (const errorEl of errorElements) {
                const errorText = await errorEl.evaluate(el => el.textContent);
                console.log(`❌ 發現錯誤訊息: ${errorText}`);
            }
        } else {
            console.log('✅ 沒有發現錯誤訊息');
        }
        
        // 檢查學生資料是否載入成功
        console.log('🔍 檢查學生資料載入狀態...');
        const studentCards = await page.$$('.student-card');
        const attendanceBtns = await page.$$('.attendance-btn');
        
        if (studentCards.length > 0) {
            console.log(`✅ 學生資料載入成功，找到 ${studentCards.length} 個學生卡片`);
        } else {
            console.log('❌ 學生資料載入失敗，沒有找到學生卡片');
        }
        
        if (attendanceBtns.length > 0) {
            console.log(`✅ 簽到按鈕載入成功，找到 ${attendanceBtns.length} 個簽到按鈕`);
        } else {
            console.log('❌ 簽到按鈕載入失敗，沒有找到簽到按鈕');
        }
        
        // 檢查課程資訊顯示
        console.log('🔍 檢查課程資訊顯示...');
        const courseInfo = await page.evaluate(() => {
            const modalContent = document.querySelector('.attendance-modal-content');
            if (!modalContent) return null;
            
            const timeField = modalContent.querySelector('[data-field="time"]');
            const courseField = modalContent.querySelector('[data-field="course"]');
            
            return {
                time: timeField ? timeField.textContent : 'not found',
                course: courseField ? courseField.textContent : 'not found'
            };
        });
        
        console.log('📊 課程資訊:', courseInfo);
        
        // 檢查是否還有「客製化」字樣
        if (courseInfo && courseInfo.time && courseInfo.time.includes('客製化')) {
            console.log('❌ 課程資訊中仍然包含「客製化」字樣');
        } else {
            console.log('✅ 課程資訊中已成功移除「客製化」字樣');
        }
        
        console.log('✅ 測試完成！');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    } finally {
        console.log('⏳ 等待5秒後關閉瀏覽器...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

// 執行測試
testCustomizedCourseFix().catch(console.error);
