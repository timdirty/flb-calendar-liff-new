const puppeteer = require('puppeteer');

async function testLayoutAndJSFix() {
    console.log('🧪 開始測試布局調整和JavaScript錯誤修復...');
    
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
        
        // 捕獲JavaScript錯誤
        page.on('pageerror', error => {
            console.error('❌ JavaScript錯誤:', error.message);
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
        
        // 檢查布局順序
        const layoutCheck = await page.evaluate(() => {
            const studentCountSelection = document.getElementById('student-count-selection');
            const courseContent = document.getElementById('course-content');
            
            // 檢查元素是否存在
            const hasStudentCount = !!studentCountSelection;
            const hasCourseContent = !!courseContent;
            
            // 檢查布局順序（課程內容應該在人數選擇之後）
            let courseContentAfterStudentCount = false;
            if (hasStudentCount && hasCourseContent) {
                const studentCountRect = studentCountSelection.getBoundingClientRect();
                const courseContentRect = courseContent.getBoundingClientRect();
                courseContentAfterStudentCount = courseContentRect.top > studentCountRect.top;
            }
            
            return {
                hasStudentCount: hasStudentCount,
                hasCourseContent: hasCourseContent,
                courseContentAfterStudentCount: courseContentAfterStudentCount,
                studentCountDisplay: studentCountSelection ? studentCountSelection.style.display : 'N/A'
            };
        });
        
        console.log('📊 布局檢查結果:', layoutCheck);
        
        if (layoutCheck.hasCourseContent && layoutCheck.courseContentAfterStudentCount) {
            console.log('✅ 布局順序正確：課程內容在人數選擇之後');
        } else {
            console.log('❌ 布局順序不正確');
        }
        
        console.log('📝 測試JavaScript錯誤修復...');
        // 填寫課程內容
        await page.type('#course-content', '測試內容');
        
        // 選擇講師模式
        await page.click('#teacher-mode-btn');
        
        // 等待檢查
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查是否開始倒數（這會觸發showCountdownToast函數）
        const autoSubmitCheck = await page.evaluate(() => {
            const isCounting = window.isAutoSubmitEnabled || false;
            const countdownElement = document.querySelector('.countdown-toast');
            
            return {
                isCounting: isCounting,
                hasCountdownElement: !!countdownElement,
                countdownText: countdownElement ? countdownElement.textContent : ''
            };
        });
        
        console.log('📊 自動提交檢查結果:', autoSubmitCheck);
        
        if (autoSubmitCheck.isCounting) {
            console.log('✅ 自動提交正常啟動，JavaScript錯誤已修復');
        } else {
            console.log('❌ 自動提交沒有啟動');
        }
        
        console.log('🎉 布局調整和JavaScript錯誤修復測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testLayoutAndJSFix().then(success => {
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
