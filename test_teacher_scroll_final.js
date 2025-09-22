const puppeteer = require('puppeteer');

async function testTeacherScrollFinal() {
    console.log('🧪 開始測試講師簽到滾動最終修復...');
    
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
        
        console.log('🔍 檢查講師簽到頁面滾動設置...');
        
        // 檢查滾動設置
        const scrollTest = await page.evaluate(() => {
            // 檢查主滾動容器
            const mainContainer = document.querySelector('div[style*="overflow-y: auto"]');
            if (!mainContainer) {
                return { success: false, error: '找不到主滾動容器' };
            }
            
            // 檢查身份選擇區域
            const identitySection = document.querySelector('.glass-card');
            if (!identitySection) {
                return { success: false, error: '找不到身份選擇區域' };
            }
            
            // 檢查今日報表區域
            const reportSection = document.querySelectorAll('.glass-card')[1];
            if (!reportSection) {
                return { success: false, error: '找不到今日報表區域' };
            }
            
            // 檢查overflow設置
            const mainOverflow = window.getComputedStyle(mainContainer).overflowY;
            const identityOverflow = window.getComputedStyle(identitySection).overflow;
            const reportOverflow = window.getComputedStyle(reportSection).overflow;
            
            // 測試滾動
            const initialScrollTop = mainContainer.scrollTop;
            mainContainer.scrollTop = 100;
            const afterScrollTop = mainContainer.scrollTop;
            
            return {
                success: true,
                mainOverflow,
                identityOverflow,
                reportOverflow,
                scrollWorked: afterScrollTop !== initialScrollTop,
                scrollHeight: mainContainer.scrollHeight,
                clientHeight: mainContainer.clientHeight,
                canScroll: mainContainer.scrollHeight > mainContainer.clientHeight
            };
        });
        
        console.log('📊 滾動設置檢查結果:', scrollTest);
        
        if (!scrollTest.success) {
            throw new Error(scrollTest.error);
        }
        
        if (scrollTest.scrollWorked) {
            console.log('✅ 主滾動容器滾動功能正常！');
        } else {
            console.log('⚠️ 主滾動容器滾動沒有生效');
        }
        
        // 檢查overflow設置是否正確
        if (scrollTest.mainOverflow === 'auto') {
            console.log('✅ 主滾動容器overflow設置正確');
        } else {
            console.log('❌ 主滾動容器overflow設置錯誤:', scrollTest.mainOverflow);
        }
        
        if (scrollTest.identityOverflow === 'visible') {
            console.log('✅ 身份選擇區域overflow設置正確');
        } else {
            console.log('❌ 身份選擇區域overflow設置錯誤:', scrollTest.identityOverflow);
        }
        
        if (scrollTest.reportOverflow === 'visible') {
            console.log('✅ 今日報表區域overflow設置正確');
        } else {
            console.log('❌ 今日報表區域overflow設置錯誤:', scrollTest.reportOverflow);
        }
        
        // 檢查內容高度
        if (scrollTest.canScroll) {
            console.log(`✅ 內容高度充足，可以滾動 (${scrollTest.scrollHeight}px > ${scrollTest.clientHeight}px)`);
        } else {
            console.log('⚠️ 內容高度不足，無法觸發滾動');
        }
        
        console.log('🎉 講師簽到滾動最終測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testTeacherScrollFinal().then(success => {
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
