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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔄 切換到講師簽到標籤...');
        // 點擊講師簽到標籤
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 等待導航器載入
        await page.waitForSelector('.floating-navigator', { timeout: 5000 });
        
        console.log('🔍 測試自動提交功能...');
        
        // 測試1: 檢查自動提交驗證
        console.log('📝 測試1: 填寫課程內容...');
        await page.type('#course-content', '這是一個測試課程內容，用來驗證自動提交功能是否正常工作。');
        
        // 等待一下讓輸入事件觸發
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查是否開始倒數
        const countdownCheck = await page.evaluate(() => {
            const countdownToast = document.querySelector('.countdown-toast');
            return {
                hasCountdownToast: !!countdownToast,
                isAutoSubmitEnabled: window.isAutoSubmitEnabled || false
            };
        });
        
        console.log('📊 倒數檢查結果:', countdownCheck);
        
        if (countdownCheck.hasCountdownToast) {
            console.log('✅ 自動提交倒數已開始');
        } else {
            console.log('❌ 自動提交倒數未開始');
        }
        
        // 測試2: 點擊空白處是否會取消倒數
        console.log('📝 測試2: 點擊空白處...');
        
        // 點擊模態框背景（點擊模態框本身）
        await page.evaluate(() => {
            const modal = document.querySelector('.attendance-modal');
            if (modal) {
                modal.click();
            }
        });
        
        // 等待一下
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查倒數是否被取消
        const afterClickCheck = await page.evaluate(() => {
            const countdownToast = document.querySelector('.countdown-toast');
            return {
                hasCountdownToast: !!countdownToast,
                isAutoSubmitEnabled: window.isAutoSubmitEnabled || false
            };
        });
        
        console.log('📊 點擊空白處後檢查結果:', afterClickCheck);
        
        if (!afterClickCheck.hasCountdownToast) {
            console.log('✅ 點擊空白處正確取消了倒數');
        } else {
            console.log('❌ 點擊空白處沒有取消倒數');
        }
        
        // 測試3: 重新填寫內容並選擇模式
        console.log('📝 測試3: 重新填寫內容並選擇模式...');
        
        // 清空並重新填寫內容
        await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            if (courseContent) {
                courseContent.value = '';
                courseContent.value = '重新填寫的課程內容，用來測試完整的自動提交流程。';
                courseContent.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        // 選擇講師模式
        await page.click('#teacher-mode-btn');
        
        // 等待一下
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查是否重新開始倒數
        const finalCheck = await page.evaluate(() => {
            const countdownToast = document.querySelector('.countdown-toast');
            return {
                hasCountdownToast: !!countdownToast,
                isAutoSubmitEnabled: window.isAutoSubmitEnabled || false,
                courseContent: document.getElementById('course-content')?.value || '',
                currentMode: document.getElementById('current-mode-display')?.textContent || ''
            };
        });
        
        console.log('📊 最終檢查結果:', finalCheck);
        
        if (finalCheck.hasCountdownToast && finalCheck.isAutoSubmitEnabled) {
            console.log('✅ 重新填寫後自動提交倒數正常開始');
        } else {
            console.log('❌ 重新填寫後自動提交倒數未開始');
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
