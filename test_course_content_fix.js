const puppeteer = require('puppeteer');

async function testCourseContentFix() {
    console.log('🧪 開始測試課程內容輸入框修復...');
    
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
        
        // 檢查課程內容輸入框是否存在
        const courseContentCheck = await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            const charCount = document.getElementById('char-count');
            const courseContentLabel = document.querySelector('label[for="course-content"]');
            
            return {
                hasCourseContent: !!courseContent,
                hasCharCount: !!charCount,
                hasLabel: !!courseContentLabel,
                courseContentValue: courseContent ? courseContent.value : '',
                charCountText: charCount ? charCount.textContent : '',
                labelText: courseContentLabel ? courseContentLabel.textContent : ''
            };
        });
        
        console.log('📊 課程內容輸入框檢查結果:', courseContentCheck);
        
        if (courseContentCheck.hasCourseContent && courseContentCheck.hasCharCount && courseContentCheck.hasLabel) {
            console.log('✅ 課程內容輸入框已正確顯示');
        } else {
            console.log('❌ 課程內容輸入框顯示不正確');
        }
        
        // 測試輸入功能
        console.log('📝 測試輸入功能...');
        await page.type('#course-content', '測試課程內容');
        
        // 檢查輸入是否成功
        const inputTest = await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            const charCount = document.getElementById('char-count');
            
            return {
                inputValue: courseContent ? courseContent.value : '',
                charCountValue: charCount ? charCount.textContent : ''
            };
        });
        
        console.log('📊 輸入測試結果:', inputTest);
        
        if (inputTest.inputValue === '測試課程內容' && inputTest.charCountValue.includes('6')) {
            console.log('✅ 輸入功能正常');
        } else {
            console.log('❌ 輸入功能異常');
        }
        
        console.log('🎉 課程內容輸入框修復測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testCourseContentFix().then(success => {
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
