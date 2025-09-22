const puppeteer = require('puppeteer');

async function testTimeFormatDebug() {
    console.log('🧪 開始測試時間格式調試...');
    
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
        const consoleMessages = [];
        
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: Date.now()
            });
            if (msg.type() === 'log' && msg.text().includes('解析課程標題') || msg.text().includes('時間資訊')) {
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
        
        // 測試課程標題解析
        console.log('🔍 測試課程標題解析...');
        
        const testCases = [
            "SPM 一1930-2030 到府 第3週",
            "SPM 一 1930-2030 到府 第3週",
            "SPM 一1930-2030 到府",
            "SPM 一 1930-2030 到府"
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🧪 測試案例: "${testCase}"`);
            
            const result = await page.evaluate((title) => {
                if (typeof parseCourseTitle === 'function') {
                    return parseCourseTitle(title);
                } else {
                    return { courseName: '函數未找到', timeInfo: '' };
                }
            }, testCase);
            
            console.log(`📊 解析結果:`, result);
            
            // 檢查時間格式
            if (result.timeInfo) {
                const hasSpace = result.timeInfo.includes(' ');
                console.log(`🔍 時間格式檢查:`, {
                    timeInfo: result.timeInfo,
                    hasSpace: hasSpace,
                    length: result.timeInfo.length
                });
            }
        }
        
        // 測試實際的課程卡片
        console.log('\n🔍 尋找課程卡片...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        const courseCards = await page.$$('.event-card');
        if (courseCards.length === 0) {
            throw new Error('找不到課程卡片');
        }
        
        console.log(`📚 找到 ${courseCards.length} 個課程卡片`);
        
        // 檢查第一個課程卡片的標題
        const firstCardTitle = await page.evaluate((card) => {
            const titleElement = card.querySelector('.event-title');
            return titleElement ? titleElement.textContent.trim() : '';
        }, courseCards[0]);
        
        console.log(`📋 第一個課程卡片標題: "${firstCardTitle}"`);
        
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
        await page.waitForSelector('#attendanceModal', { timeout: 15000 });
        
        console.log('🔄 切換到講師簽到標籤...');
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查課程資訊顯示
        const courseInfo = await page.evaluate(() => {
            const courseElement = document.querySelector('[data-field="course"]');
            const timeElement = document.querySelector('[data-field="time"]');
            
            return {
                course: courseElement ? courseElement.textContent.trim() : '',
                time: timeElement ? timeElement.textContent.trim() : ''
            };
        });
        
        console.log('📊 實際顯示的課程資訊:', courseInfo);
        
        // 檢查解析日誌
        const parsingLogs = consoleMessages.filter(msg => 
            msg.text.includes('解析課程標題') || 
            msg.text.includes('解析成功') || 
            msg.text.includes('時間資訊') ||
            msg.text.includes('無法載入學生資料')
        );
        
        console.log('\n📋 相關日誌:');
        parsingLogs.forEach(log => {
            console.log(`  ${log.text}`);
        });
        
        console.log('🎉 時間格式調試測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testTimeFormatDebug().then(success => {
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
