const puppeteer = require('puppeteer');

async function testCourseParsingFix() {
    console.log('🧪 開始測試課程標題解析修復...');
    
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
                text: msg.text()
            });
            if (msg.type() === 'log' && msg.text().includes('解析課程標題')) {
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
        
        // 測試課程標題解析功能
        console.log('🔍 測試課程標題解析...');
        
        const testCases = [
            {
                title: "SPM 三1630-1730 到府 第3週",
                expectedCourse: "SPM",
                expectedTime: "三1630-1730 到府"
            },
            {
                title: "SPIKE PRO 日 10:00-12:00 第3週",
                expectedCourse: "SPIKE",
                expectedTime: "日 10:00-12:00"
            },
            {
                title: "ESM 六 9:30-10:30 到府 第4週請假",
                expectedCourse: "ESM",
                expectedTime: "六 9:30-10:30 到府"
            },
            {
                title: "BOOST 六 1530-1700 到府",
                expectedCourse: "BOOST",
                expectedTime: "六 1530-1700 到府"
            }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🧪 測試案例: "${testCase.title}"`);
            
            const result = await page.evaluate((title) => {
                // 調用頁面中的解析函數
                if (typeof parseCourseTitle === 'function') {
                    return parseCourseTitle(title);
                } else {
                    return { courseName: '函數未找到', timeInfo: '' };
                }
            }, testCase.title);
            
            console.log(`📊 解析結果:`, result);
            console.log(`🎯 期望結果: 課程="${testCase.expectedCourse}", 時間="${testCase.expectedTime}"`);
            
            if (result.courseName === testCase.expectedCourse && result.timeInfo === testCase.expectedTime) {
                console.log('✅ 解析正確');
            } else {
                console.log('❌ 解析錯誤');
            }
        }
        
        // 測試實際課程卡片點擊
        console.log('\n🔍 尋找課程卡片...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
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
            msg.text.includes('無法解析課程標題格式')
        );
        
        console.log('\n📋 解析日誌:');
        parsingLogs.forEach(log => {
            console.log(`  ${log.text}`);
        });
        
        console.log('🎉 課程標題解析修復測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testCourseParsingFix().then(success => {
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
