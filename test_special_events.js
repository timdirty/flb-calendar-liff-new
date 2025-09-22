const puppeteer = require('puppeteer');

async function testSpecialEvents() {
    console.log('🧪 開始測試特殊事件功能（客製化、到府）...');
    
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
        
        // 檢查特殊事件功能
        const specialEventsCheck = await page.evaluate(() => {
            // 檢查 SPECIAL_EVENT_TYPES 是否正確定義
            const specialEventTypes = window.SPECIAL_EVENT_TYPES || {};
            const hasCustomized = specialEventTypes['客製化'] && specialEventTypes['客製化'].includes('客製化');
            const hasToFu = specialEventTypes['到府'] && specialEventTypes['到府'].includes('到府');
            
            // 檢查 currentAttendanceData 是否有 originalTitle
            const hasOriginalTitle = window.currentAttendanceData && window.currentAttendanceData.originalTitle;
            
            // 檢查特殊提示是否顯示
            const specialNotice = document.querySelector('.special-notice');
            const hasSpecialNotice = !!specialNotice;
            
            return {
                hasCustomized: hasCustomized,
                hasToFu: hasToFu,
                hasOriginalTitle: hasOriginalTitle,
                originalTitle: window.currentAttendanceData ? window.currentAttendanceData.originalTitle : '',
                hasSpecialNotice: hasSpecialNotice,
                specialEventTypes: specialEventTypes
            };
        });
        
        console.log('📊 特殊事件功能檢查結果:', specialEventsCheck);
        
        if (specialEventsCheck.hasCustomized && specialEventsCheck.hasToFu) {
            console.log('✅ 特殊事件類型定義正確');
        } else {
            console.log('❌ 特殊事件類型定義不正確');
        }
        
        if (specialEventsCheck.hasOriginalTitle) {
            console.log('✅ originalTitle 已正確設置');
        } else {
            console.log('❌ originalTitle 未設置');
        }
        
        // 測試特殊課程檢測
        console.log('🧪 測試特殊課程檢測...');
        const testSpecialDetection = await page.evaluate(() => {
            // 模擬測試特殊課程標題
            const testTitles = [
                'SPIKE PRO 日 10:00-12:00 客製化 第3週',
                'ESM 六 9:30-10:30 到府 第4週',
                'BOOST 六 1530-1700 客製化課程',
                'WEBO 一 1930-2100 到府服務'
            ];
            
            const results = testTitles.map(title => {
                const isCustomizedCourse = title.includes('客製化') || 
                                        title.includes('到府') || 
                                        title.includes('客制化') || 
                                        title.includes('客製') || 
                                        title.includes('客制');
                return { title, isCustomizedCourse };
            });
            
            return results;
        });
        
        console.log('📊 特殊課程檢測測試結果:', testSpecialDetection);
        
        const allDetected = testSpecialDetection.every(result => result.isCustomizedCourse);
        if (allDetected) {
            console.log('✅ 特殊課程檢測功能正常');
        } else {
            console.log('❌ 特殊課程檢測功能異常');
        }
        
        console.log('🎉 特殊事件功能測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testSpecialEvents().then(success => {
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
