const puppeteer = require('puppeteer');

async function testAutoCloseModal() {
    console.log('🧪 開始測試講師報表提交後自動關閉模態框...');
    
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
        
        // 等待導航器載入
        await page.waitForSelector('.floating-navigator', { timeout: 5000 });
        
        console.log('📝 填寫課程內容...');
        // 填寫課程內容
        await page.type('#course-content', '這是一個測試課程內容，用來驗證講師報表提交後自動關閉模態框的功能。');
        
        // 選擇講師模式
        await page.click('#teacher-mode-btn');
        
        // 等待學生人數選擇按鈕載入
        await page.waitForSelector('#count2Btn', { timeout: 5000 });
        
        // 選擇學生人數（2人以下）
        await page.click('#count2Btn');
        
        // 等待自動提交倒數開始
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('⏰ 等待自動提交執行...');
        // 等待自動提交執行（3秒倒數 + 1.5秒延遲關閉）
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 檢查模態框是否已關閉
        const modalCheck = await page.evaluate(() => {
            const modal = document.querySelector('#attendanceModal');
            const attendanceContent = document.getElementById('attendanceContent');
            const successToast = document.querySelector('.toast.success');
            
            return {
                modalExists: !!modal,
                attendanceContentExists: !!attendanceContent,
                successToastExists: !!successToast,
                modalDisplay: modal ? window.getComputedStyle(modal).display : 'none'
            };
        });
        
        console.log('📊 模態框關閉檢查結果:', modalCheck);
        
        if (!modalCheck.modalExists || modalCheck.modalDisplay === 'none') {
            console.log('✅ 模態框已成功自動關閉！');
        } else {
            console.log('❌ 模態框沒有自動關閉');
        }
        
        if (modalCheck.successToastExists) {
            console.log('✅ 成功訊息已顯示');
        } else {
            console.log('⚠️ 沒有看到成功訊息');
        }
        
        console.log('🎉 自動關閉模態框測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testAutoCloseModal().then(success => {
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
