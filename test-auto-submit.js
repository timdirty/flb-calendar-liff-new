const puppeteer = require('puppeteer');

async function testAutoSubmit() {
    console.log('🚀 開始測試講師報表自動提交功能...');
    
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
        
        // 點擊觸發簽到系統
        console.log('🔋 點擊課程卡片...');
        await page.evaluate((card) => {
            card.click();
        }, firstCard);
        
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
        
        // 檢查講師報表元素
        const courseContent = await page.$('#course-content');
        const teacherModeBtn = await page.$('#teacher-mode-btn');
        const assistantModeBtn = await page.$('#assistant-mode-btn');
        const submitBtn = await page.$('#submitTeacherReport');
        
        console.log('📝 講師報表元素檢查:', {
            courseContent: !!courseContent,
            teacherModeBtn: !!teacherModeBtn,
            assistantModeBtn: !!assistantModeBtn,
            submitBtn: !!submitBtn
        });
        
        // 測試自動提交功能
        console.log('🧪 開始測試自動提交功能...');
        
        // 1. 輸入課程內容
        console.log('📝 輸入課程內容...');
        await courseContent.type('測試課程內容 - 自動提交功能測試');
        
        // 2. 選擇講師模式
        console.log('👨‍🏫 選擇講師模式...');
        await teacherModeBtn.click();
        await page.waitForTimeout(500);
        
        // 3. 檢查是否出現倒數提示
        console.log('⏰ 檢查倒數提示...');
        await page.waitForTimeout(1000);
        
        const countdownToast = await page.$('.countdown-toast');
        if (countdownToast) {
            console.log('✅ 倒數提示出現');
            
            // 檢查倒數內容
            const countdownText = await page.evaluate((toast) => {
                return toast.textContent;
            }, countdownToast);
            console.log('📊 倒數提示內容:', countdownText);
        } else {
            console.log('❌ 倒數提示未出現');
        }
        
        // 4. 等待自動提交執行
        console.log('⏳ 等待自動提交執行...');
        await page.waitForTimeout(4000);
        
        // 5. 檢查是否出現成功提示
        console.log('🔍 檢查提交結果...');
        const successToast = await page.$('.toast.success');
        if (successToast) {
            const successText = await page.evaluate((toast) => {
                return toast.textContent;
            }, successToast);
            console.log('✅ 提交成功:', successText);
        } else {
            console.log('❌ 未找到成功提示');
        }
        
        // 6. 測試重新輸入觸發新的倒數
        console.log('🔄 測試重新輸入觸發新的倒數...');
        await courseContent.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        await page.keyboard.type('新的課程內容 - 重新測試');
        
        // 選擇助教模式
        console.log('👨‍🎓 選擇助教模式...');
        await assistantModeBtn.click();
        await page.waitForTimeout(500);
        
        // 檢查新的倒數提示
        const newCountdownToast = await page.$('.countdown-toast');
        if (newCountdownToast) {
            console.log('✅ 新的倒數提示出現');
            
            const newCountdownText = await page.evaluate((toast) => {
                return toast.textContent;
            }, newCountdownToast);
            console.log('📊 新倒數提示內容:', newCountdownText);
        } else {
            console.log('❌ 新的倒數提示未出現');
        }
        
        // 等待第二次自動提交
        console.log('⏳ 等待第二次自動提交執行...');
        await page.waitForTimeout(4000);
        
        // 檢查第二次提交結果
        const secondSuccessToast = await page.$('.toast.success');
        if (secondSuccessToast) {
            const secondSuccessText = await page.evaluate((toast) => {
                return toast.textContent;
            }, secondSuccessToast);
            console.log('✅ 第二次提交成功:', secondSuccessText);
        } else {
            console.log('❌ 第二次提交未成功');
        }
        
        console.log('⏳ 等待 3 秒讓用戶查看結果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 自動提交功能測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testAutoSubmit().catch(console.error);
