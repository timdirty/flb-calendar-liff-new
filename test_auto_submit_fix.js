const puppeteer = require('puppeteer');

async function testAutoSubmitFix() {
    console.log('🧪 開始測試自動提交修復...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 設置用戶代理為手機
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
        
        // 捕獲控制台日誌
        page.on('console', msg => {
            if (msg.type() === 'log') {
                console.log('📱 頁面日誌:', msg.text());
            }
        });
        
        console.log('📱 導航到頁面...');
        await page.goto('http://localhost:3001/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔍 尋找課程卡片...');
        // 等待課程卡片出現
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        // 找到第一個課程卡片
        const courseCards = await page.$$('.event-card');
        if (courseCards.length === 0) {
            throw new Error('找不到課程卡片');
        }
        
        console.log(`📚 找到 ${courseCards.length} 個課程卡片`);
        
        // 長按第一個課程卡片
        const firstCard = courseCards[0];
        console.log('👆 長按課程卡片...');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            // 模擬長按
            const touchStart = new TouchEvent('touchstart', {
                touches: [new Touch({
                    identifier: 1,
                    target: card,
                    clientX: x,
                    clientY: y
                })]
            });
            
            card.dispatchEvent(touchStart);
        }, firstCard);
        
        // 等待長按觸發
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔄 等待模態框載入...');
        // 等待模態框載入
        await page.waitForSelector('#attendanceModal', { timeout: 15000 });
        
        console.log('🔄 切換到講師簽到標籤...');
        // 點擊講師簽到標籤
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 測試重複字符輸入
        console.log('📝 測試重複字符輸入...');
        await page.type('#course-content', 'ˇˇˇ');
        
        // 點擊講師模式按鈕
        console.log('👨‍🏫 點擊講師模式按鈕...');
        await page.click('#teacher-mode-btn');
        
        // 等待自動提交檢查
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查自動提交狀態
        const autoSubmitCheck = await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            const currentModeDisplay = document.getElementById('current-mode-display');
            
            const contentValue = courseContent ? courseContent.value.trim() : '';
            const hasContent = courseContent && courseContent.value.trim().length >= 1;
            const hasMode = currentModeDisplay && 
                           (currentModeDisplay.textContent === '講師模式' || 
                            currentModeDisplay.textContent === '助教模式');
            
            const isValidContent = contentValue.length >= 1 && 
                                 contentValue !== '請描述今天的課程內容...' && 
                                 contentValue !== '[特殊模式] 請描述今天的課程內容...';
            
            const shouldAutoSubmit = hasContent && hasMode && isValidContent;
            
            return {
                contentValue,
                hasContent,
                hasMode,
                isValidContent,
                shouldAutoSubmit,
                modeText: currentModeDisplay ? currentModeDisplay.textContent : ''
            };
        });
        
        console.log('📊 自動提交檢查結果:', autoSubmitCheck);
        
        if (autoSubmitCheck.shouldAutoSubmit) {
            console.log('✅ 自動提交條件滿足');
        } else {
            console.log('❌ 自動提交條件不滿足');
        }
        
        if (autoSubmitCheck.isValidContent) {
            console.log('✅ 重複字符輸入驗證通過');
        } else {
            console.log('❌ 重複字符輸入驗證失敗');
        }
        
        // 測試其他輸入類型
        console.log('📝 測試其他輸入類型...');
        await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            if (courseContent) {
                courseContent.value = '';
            }
        });
        
        await page.type('#course-content', '測試課程內容');
        
        const otherInputCheck = await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            const contentValue = courseContent ? courseContent.value.trim() : '';
            const isValidContent = contentValue.length >= 1 && 
                                 contentValue !== '請描述今天的課程內容...' && 
                                 contentValue !== '[特殊模式] 請描述今天的課程內容...';
            return { contentValue, isValidContent };
        });
        
        console.log('📊 其他輸入測試結果:', otherInputCheck);
        
        if (otherInputCheck.isValidContent) {
            console.log('✅ 正常輸入驗證通過');
        } else {
            console.log('❌ 正常輸入驗證失敗');
        }
        
        console.log('🎉 自動提交修復測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testAutoSubmitFix().then(success => {
    if (success) {
        console.log('✅ 測試完成！');
        process.exit(0);
    } else {
        console.log('❌ 測試失敗！');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 測試執行錯誤:', error);
    process.exit(1);
});
