const puppeteer = require('puppeteer');

async function testAutoSubmitTrigger() {
    console.log('🧪 開始測試自動提交觸發條件修改...');
    
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
        
        console.log('📝 測試1個字符觸發自動提交...');
        // 填寫1個字符
        await page.type('#course-content', 'A');
        
        // 選擇講師模式
        await page.click('#teacher-mode-btn');
        
        // 等待檢查
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查是否開始倒數
        const singleCharCheck = await page.evaluate(() => {
            const isCounting = window.isAutoSubmitEnabled || false;
            const countdownElement = document.querySelector('.toast');
            
            return {
                isCounting: isCounting,
                hasCountdownElement: !!countdownElement,
                countdownText: countdownElement ? countdownElement.textContent : ''
            };
        });
        
        console.log('📊 1個字符檢查結果:', singleCharCheck);
        
        if (singleCharCheck.isCounting) {
            console.log('✅ 1個字符正確觸發了自動提交');
        } else {
            console.log('❌ 1個字符沒有觸發自動提交');
        }
        
        console.log('📝 測試按Enter鍵觸發...');
        // 清空並重新填寫
        await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            if (courseContent) {
                courseContent.value = '';
            }
        });
        
        await page.type('#course-content', '測試內容');
        
        // 按Enter鍵
        await page.keyboard.press('Enter');
        
        // 等待檢查
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查是否開始倒數
        const enterKeyCheck = await page.evaluate(() => {
            const isCounting = window.isAutoSubmitEnabled || false;
            const countdownElement = document.querySelector('.toast');
            
            return {
                isCounting: isCounting,
                hasCountdownElement: !!countdownElement,
                countdownText: countdownElement ? countdownElement.textContent : ''
            };
        });
        
        console.log('📊 Enter鍵檢查結果:', enterKeyCheck);
        
        if (enterKeyCheck.isCounting) {
            console.log('✅ Enter鍵正確觸發了自動提交');
        } else {
            console.log('❌ Enter鍵沒有觸發自動提交');
        }
        
        console.log('📝 測試失去焦點觸發...');
        // 清空並重新填寫
        await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            if (courseContent) {
                courseContent.value = '';
            }
        });
        
        await page.type('#course-content', '失去焦點測試');
        
        // 點擊其他地方失去焦點
        await page.click('body');
        
        // 等待檢查
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查是否開始倒數
        const blurCheck = await page.evaluate(() => {
            const isCounting = window.isAutoSubmitEnabled || false;
            const countdownElement = document.querySelector('.toast');
            
            return {
                isCounting: isCounting,
                hasCountdownElement: !!countdownElement,
                countdownText: countdownElement ? countdownElement.textContent : ''
            };
        });
        
        console.log('📊 失去焦點檢查結果:', blurCheck);
        
        if (blurCheck.isCounting) {
            console.log('✅ 失去焦點正確觸發了自動提交');
        } else {
            console.log('❌ 失去焦點沒有觸發自動提交');
        }
        
        console.log('🎉 自動提交觸發條件測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testAutoSubmitTrigger().then(success => {
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
