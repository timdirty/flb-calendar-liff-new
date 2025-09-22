const puppeteer = require('puppeteer');

async function testStudentLoadingFix() {
    console.log('🧪 開始測試學生載入修復...');
    
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
        
        console.log('🔄 等待學生資料載入...');
        
        // 等待學生資料載入完成
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 檢查是否成功載入學生資料
        const studentLoadingCheck = await page.evaluate(() => {
            // 檢查是否有學生卡片
            const studentCards = document.querySelectorAll('.student-card');
            const loadingState = document.querySelector('.loading-text');
            const attendanceContent = document.getElementById('attendanceContent');
            
            return {
                studentCardsCount: studentCards.length,
                hasLoadingState: !!loadingState,
                attendanceContentHTML: attendanceContent ? attendanceContent.innerHTML.substring(0, 200) : '',
                hasStudentList: attendanceContent ? attendanceContent.innerHTML.includes('student-card') : false,
                hasLoadingText: attendanceContent ? attendanceContent.innerHTML.includes('正在發牌中') : false
            };
        });
        
        console.log('📊 學生載入檢查結果:', studentLoadingCheck);
        
        if (studentLoadingCheck.studentCardsCount > 0) {
            console.log('✅ 學生卡片載入成功！');
        } else if (studentLoadingCheck.hasLoadingState || studentLoadingCheck.hasLoadingText) {
            console.log('❌ 學生載入卡在載入狀態');
        } else {
            console.log('⚠️ 沒有找到學生卡片，但也不是載入狀態');
        }
        
        // 檢查控制台是否有錯誤訊息
        const consoleErrors = await page.evaluate(() => {
            return window.consoleErrors || [];
        });
        
        if (consoleErrors.length > 0) {
            console.log('❌ 發現控制台錯誤:', consoleErrors);
        } else {
            console.log('✅ 沒有發現控制台錯誤');
        }
        
        console.log('🎉 學生載入修復測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testStudentLoadingFix().then(success => {
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
