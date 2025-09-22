const puppeteer = require('puppeteer');

async function testFinalCourseParsing() {
    console.log('🧪 最終課程標題解析測試...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 設置用戶代理為手機
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
        
        console.log('📱 導航到頁面...');
        await page.goto('http://localhost:3001/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 測試特定的課程標題
        console.log('🔍 測試 "SPM 三1630-1730 到府 第3週" 解析...');
        
        const result = await page.evaluate(() => {
            if (typeof parseCourseTitle === 'function') {
                return parseCourseTitle("SPM 三1630-1730 到府 第3週");
            } else {
                return { courseName: '函數未找到', timeInfo: '' };
            }
        });
        
        console.log('📊 解析結果:', result);
        
        if (result.courseName === 'SPM' && result.timeInfo === '三1630-1730 到府') {
            console.log('✅ 解析完全正確！');
            console.log('   - 課程名稱: SPM');
            console.log('   - 時間資訊: 三1630-1730 到府');
        } else {
            console.log('❌ 解析仍有問題');
        }
        
        // 測試實際課程卡片
        console.log('\n🔍 測試實際課程卡片...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        const courseCards = await page.$$('.event-card');
        console.log(`📚 找到 ${courseCards.length} 個課程卡片`);
        
        // 長按第一個課程卡片
        const firstCard = courseCards[0];
        console.log('👆 長按課程卡片...');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
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
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔄 等待模態框載入...');
        await page.waitForSelector('#attendanceModal', { timeout: 15000 });
        
        console.log('🔄 切換到講師簽到標籤...');
        await page.click('[data-tab="teacher-attendance"]');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查實際顯示
        const displayInfo = await page.evaluate(() => {
            const courseElement = document.querySelector('[data-field="course"]');
            const timeElement = document.querySelector('[data-field="time"]');
            
            return {
                course: courseElement ? courseElement.textContent.trim() : '',
                time: timeElement ? timeElement.textContent.trim() : ''
            };
        });
        
        console.log('📊 實際顯示的課程資訊:', displayInfo);
        
        if (displayInfo.course.includes('SPM') && displayInfo.time.includes('三1630-1730') && displayInfo.time.includes('到府')) {
            console.log('✅ 實際顯示也正確！');
        } else {
            console.log('❌ 實際顯示有問題');
        }
        
        console.log('🎉 最終測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testFinalCourseParsing().then(success => {
    if (success) {
        console.log('✅ 所有測試完成！');
        process.exit(0);
    } else {
        console.log('❌ 測試失敗！');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 測試執行錯誤:', error);
    process.exit(1);
});
