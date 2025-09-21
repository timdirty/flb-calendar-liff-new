const puppeteer = require('puppeteer');

async function testCountdownImprovements() {
    console.log('🚀 開始測試倒數計時改進：輸入時停止倒數，完成後重新開始...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // 模擬 iPhone 16 Pro
    await page.emulate({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        viewport: {
            width: 393,
            height: 852,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true
        }
    });
    
    try {
        console.log('🌐 正在載入頁面...');
        await page.goto('http://localhost:3000/perfect-calendar.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('✅ 頁面載入完成');
        
        // 等待課程卡片出現
        console.log('⏳ 等待課程卡片出現...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個課程卡片`);
        
        if (eventCards.length === 0) {
            throw new Error('沒有找到課程卡片');
        }
        
        // 選擇第一個課程卡片
        const firstCard = eventCards[0];
        const cardInfo = await page.evaluate((card) => {
            const instructor = card.querySelector('.instructor-name')?.textContent?.trim();
            const title = card.querySelector('.event-title')?.textContent?.trim();
            const start = card.dataset.start;
            return { instructor, title, start };
        }, firstCard);
        
        console.log('🎯 選擇課程:', cardInfo);
        
        // 長按觸發簽到系統
        console.log('🔋 長按課程卡片觸發簽到系統...');
        const box = await firstCard.boundingBox();
        if (box) {
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            await page.touchscreen.tap(centerX, centerY, { delay: 5000 });
        } else {
            await page.evaluate((card) => {
                card.click();
            }, firstCard);
        }
        
        // 等待簽到模態框出現
        console.log('⏳ 等待簽到模態框出現...');
        await page.waitForSelector('.attendance-modal-content', { timeout: 10000 });
        console.log('✅ 簽到模態框出現');
        
        // 切換到講師報表頁面
        console.log('🔄 切換到講師報表頁面...');
        const teacherTab = await page.$('#teacher-attendance-tab');
        if (teacherTab) {
            await teacherTab.click();
            await page.waitForTimeout(1000);
            console.log('✅ 已切換到講師報表頁面');
        }
        
        // 測試倒數計時邏輯
        console.log('🧪 測試倒數計時邏輯...');
        
        // 1. 選擇講師模式
        console.log('1️⃣ 選擇講師模式...');
        const teacherModeBtn = await page.$('#teacher-mode-btn');
        if (teacherModeBtn) {
            await teacherModeBtn.click();
            await page.waitForTimeout(500);
            console.log('✅ 已選擇講師模式');
        }
        
        // 2. 輸入內容觸發倒數
        console.log('2️⃣ 輸入內容觸發倒數...');
        const courseContent = await page.$('#course-content');
        if (courseContent) {
            await courseContent.click();
            await courseContent.type('測試倒數計時邏輯');
            await page.waitForTimeout(500);
            
            // 失去焦點觸發倒數
            await page.click('body', { offset: { x: 50, y: 50 } });
            await page.waitForTimeout(1000);
            
            // 檢查倒數提示是否出現
            const countdownToast = await page.$('.countdown-toast');
            if (countdownToast) {
                console.log('✅ 倒數計時已開始');
            } else {
                console.log('❌ 倒數計時未開始');
            }
        }
        
        // 3. 測試輸入時停止倒數
        console.log('3️⃣ 測試輸入時停止倒數...');
        if (courseContent) {
            await courseContent.click();
            await courseContent.type(' 繼續輸入');
            await page.waitForTimeout(1000);
            
            // 檢查倒數提示是否消失
            const countdownToastAfterInput = await page.$('.countdown-toast');
            if (!countdownToastAfterInput) {
                console.log('✅ 輸入時倒數計時已停止');
            } else {
                console.log('❌ 輸入時倒數計時未停止');
            }
        }
        
        // 4. 測試完成輸入後重新開始倒數
        console.log('4️⃣ 測試完成輸入後重新開始倒數...');
        if (courseContent) {
            await page.click('body', { offset: { x: 50, y: 50 } });
            await page.waitForTimeout(1000);
            
            // 檢查倒數提示是否重新出現
            const countdownToastAfterBlur = await page.$('.countdown-toast');
            if (countdownToastAfterBlur) {
                console.log('✅ 完成輸入後倒數計時重新開始');
            } else {
                console.log('❌ 完成輸入後倒數計時未重新開始');
            }
        }
        
        // 5. 測試重新選擇身份時停止倒數
        console.log('5️⃣ 測試重新選擇身份時停止倒數...');
        const assistantModeBtn = await page.$('#assistant-mode-btn');
        if (assistantModeBtn) {
            await assistantModeBtn.click();
            await page.waitForTimeout(1000);
            
            // 檢查倒數提示是否消失
            const countdownToastAfterModeChange = await page.$('.countdown-toast');
            if (!countdownToastAfterModeChange) {
                console.log('✅ 重新選擇身份時倒數計時已停止');
            } else {
                console.log('❌ 重新選擇身份時倒數計時未停止');
            }
        }
        
        // 6. 測試重新選擇身份後重新開始倒數
        console.log('6️⃣ 測試重新選擇身份後重新開始倒數...');
        await page.waitForTimeout(1000);
        
        // 檢查倒數提示是否重新出現
        const countdownToastAfterModeChangeComplete = await page.$('.countdown-toast');
        if (countdownToastAfterModeChangeComplete) {
            console.log('✅ 重新選擇身份後倒數計時重新開始');
        } else {
            console.log('❌ 重新選擇身份後倒數計時未重新開始');
        }
        
        // 等待自動提交執行
        console.log('⏳ 等待自動提交執行...');
        await page.waitForTimeout(4000);
        
        // 檢查提交結果
        const successToast = await page.$('.glass-toast');
        if (successToast) {
            console.log('✅ 自動提交成功執行');
        } else {
            console.log('❌ 自動提交未執行');
        }
        
        console.log('⏳ 等待 3 秒讓用戶查看結果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 倒數計時改進測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testCountdownImprovements().catch(console.error);
