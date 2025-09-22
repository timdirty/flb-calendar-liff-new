const puppeteer = require('puppeteer');

async function testCSPFix() {
    console.log('🧪 開始測試CSP修復...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 設置用戶代理為手機
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
        
        // 捕獲控制台日誌和錯誤
        const consoleMessages = [];
        const errors = [];
        
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text()
            });
            if (msg.type() === 'log') {
                console.log('📱 頁面日誌:', msg.text());
            }
        });
        
        page.on('pageerror', error => {
            errors.push(error.message);
            console.error('❌ 頁面錯誤:', error.message);
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
        
        // 測試人數選擇按鈕
        console.log('👥 測試人數選擇按鈕...');
        await page.click('#count-2-btn');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試課程內容輸入框
        console.log('📝 測試課程內容輸入框...');
        await page.click('#course-content');
        await page.type('#course-content', '測試課程內容');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試失去焦點
        await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            if (courseContent) {
                courseContent.blur();
            }
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查CSP錯誤
        const cspErrors = errors.filter(error => 
            error.includes('Content Security Policy') || 
            error.includes('script-src-attr')
        );
        
        console.log('📊 CSP錯誤檢查結果:');
        if (cspErrors.length === 0) {
            console.log('✅ 沒有CSP錯誤');
        } else {
            console.log('❌ 發現CSP錯誤:', cspErrors);
        }
        
        // 檢查按鈕功能是否正常
        const buttonFunctionalityCheck = await page.evaluate(() => {
            const count2Btn = document.getElementById('count-2-btn');
            const count30Btn = document.getElementById('count-30-btn');
            const courseContent = document.getElementById('course-content');
            
            return {
                hasCount2Btn: !!count2Btn,
                hasCount30Btn: !!count30Btn,
                hasCourseContent: !!courseContent,
                courseContentValue: courseContent ? courseContent.value : '',
                selectedStudentCount: window.selectedStudentCount
            };
        });
        
        console.log('📊 按鈕功能檢查結果:', buttonFunctionalityCheck);
        
        if (buttonFunctionalityCheck.selectedStudentCount === 2) {
            console.log('✅ 人數選擇按鈕功能正常');
        } else {
            console.log('❌ 人數選擇按鈕功能異常');
        }
        
        if (buttonFunctionalityCheck.courseContentValue === '測試課程內容') {
            console.log('✅ 課程內容輸入框功能正常');
        } else {
            console.log('❌ 課程內容輸入框功能異常');
        }
        
        // 檢查總體錯誤數量
        console.log('📊 總體錯誤統計:');
        console.log(`  - 控制台訊息: ${consoleMessages.length}`);
        console.log(`  - 頁面錯誤: ${errors.length}`);
        console.log(`  - CSP錯誤: ${cspErrors.length}`);
        
        if (cspErrors.length === 0 && errors.length === 0) {
            console.log('✅ 所有功能正常，沒有CSP錯誤');
        } else {
            console.log('❌ 存在錯誤需要修復');
        }
        
        console.log('🎉 CSP修復測試完成！');
        return cspErrors.length === 0;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testCSPFix().then(success => {
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
