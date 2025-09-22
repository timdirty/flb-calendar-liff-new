const puppeteer = require('puppeteer');

async function testTimeFormatFix() {
    console.log('🧪 開始測試時間格式修復...');
    
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
            if (msg.type() === 'log' && (msg.text().includes('時間格式修復') || msg.text().includes('載入課程學生') || msg.text().includes('無法載入學生資料'))) {
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
        
        // 測試時間格式修復函數
        console.log('🔍 測試時間格式修復函數...');
        
        const testCases = [
            "一 1930-2030 到府",
            "二 1430-1530 客製化",
            "三 1630-1730 到府",
            "四 0930-1030",
            "五 1930-2100 到府"
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🧪 測試案例: "${testCase}"`);
            
            const result = await page.evaluate((timeString) => {
                // 模擬修復邏輯
                let fixedTimeString = timeString;
                if (fixedTimeString && fixedTimeString.includes(' ')) {
                    // 匹配格式：星期 + 空格 + 時間 + 空格 + 地點
                    // 例如："一 1930-2030 到府" -> "一1930-2030 到府"
                    fixedTimeString = fixedTimeString.replace(/^([一二三四五六日])\s+(\d{4}-\d{4})\s+(.+)$/, '$1$2 $3');
                }
                return {
                    original: timeString,
                    fixed: fixedTimeString,
                    hasSpaceAfterWeekday: /^[一二三四五六日]\s+\d{4}-\d{4}/.test(timeString),
                    hasSpaceAfterTime: /\d{4}-\d{4}\s+/.test(timeString)
                };
            }, testCase);
            
            console.log(`📊 修復結果:`, result);
            
            if (result.fixed !== testCase) {
                console.log('✅ 格式已修復');
            } else {
                console.log('ℹ️ 格式無需修復');
            }
        }
        
        // 測試實際課程卡片
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
        
        // 檢查API調用日誌
        const apiLogs = consoleMessages.filter(msg => 
            msg.text.includes('載入課程學生') || 
            msg.text.includes('時間格式修復') || 
            msg.text.includes('無法載入學生資料') ||
            msg.text.includes('學生資料回應')
        );
        
        console.log('\n📋 API相關日誌:');
        apiLogs.forEach(log => {
            console.log(`  ${log.text}`);
        });
        
        // 檢查是否有錯誤
        const errors = consoleMessages.filter(msg => 
            msg.type === 'error' && msg.text.includes('找不到課程')
        );
        
        if (errors.length > 0) {
            console.log('❌ 發現API錯誤:', errors.map(e => e.text));
        } else {
            console.log('✅ 沒有發現API錯誤');
        }
        
        console.log('🎉 時間格式修復測試完成！');
        return errors.length === 0;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testTimeFormatFix().then(success => {
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
