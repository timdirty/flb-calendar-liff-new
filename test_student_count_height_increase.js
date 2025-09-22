const puppeteer = require('puppeteer');

async function testStudentCountHeightIncrease() {
    console.log('🧪 開始測試人數設定方塊高度增加...');
    
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
        
        // 尋找課程卡片
        console.log('🔍 尋找課程卡片...');
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
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔄 等待模態框載入...');
        await page.waitForSelector('#attendanceModal', { timeout: 20000 });
        
        console.log('🔄 切換到講師簽到標籤...');
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查人數設定方塊的高度
        console.log('🔍 檢查人數設定方塊高度...');
        const heightInfo = await page.evaluate(() => {
            const studentCountSelection = document.querySelector('#student-count-selection');
            const count2Btn = document.querySelector('#count-2-btn');
            const count30Btn = document.querySelector('#count-30-btn');
            
            if (studentCountSelection) {
                const rect = studentCountSelection.getBoundingClientRect();
                const styles = getComputedStyle(studentCountSelection);
                
                return {
                    container: {
                        height: rect.height,
                        padding: styles.padding,
                        display: styles.display
                    },
                    buttons: {
                        count2Btn: count2Btn ? {
                            height: count2Btn.offsetHeight,
                            padding: getComputedStyle(count2Btn).padding,
                            minHeight: getComputedStyle(count2Btn).minHeight
                        } : null,
                        count30Btn: count30Btn ? {
                            height: count30Btn.offsetHeight,
                            padding: getComputedStyle(count30Btn).padding,
                            minHeight: getComputedStyle(count30Btn).minHeight
                        } : null
                    }
                };
            }
            
            return null;
        });
        
        console.log('📊 人數設定方塊高度信息:', heightInfo);
        
        if (heightInfo) {
            console.log('✅ 人數設定方塊存在');
            console.log(`📏 容器高度: ${heightInfo.container.height}px`);
            console.log(`📏 容器內邊距: ${heightInfo.container.padding}`);
            
            if (heightInfo.buttons.count2Btn) {
                console.log(`📏 按鈕1高度: ${heightInfo.buttons.count2Btn.height}px`);
                console.log(`📏 按鈕1內邊距: ${heightInfo.buttons.count2Btn.padding}`);
                console.log(`📏 按鈕1最小高度: ${heightInfo.buttons.count2Btn.minHeight}`);
            }
            
            if (heightInfo.buttons.count30Btn) {
                console.log(`📏 按鈕2高度: ${heightInfo.buttons.count30Btn.height}px`);
                console.log(`📏 按鈕2內邊距: ${heightInfo.buttons.count30Btn.padding}`);
                console.log(`📏 按鈕2最小高度: ${heightInfo.buttons.count30Btn.minHeight}`);
            }
            
            // 檢查按鈕是否完全可見
            const buttonVisibility = await page.evaluate(() => {
                const count2Btn = document.querySelector('#count-2-btn');
                const count30Btn = document.querySelector('#count-30-btn');
                const viewportHeight = window.innerHeight;
                
                if (count2Btn && count30Btn) {
                    const rect1 = count2Btn.getBoundingClientRect();
                    const rect2 = count30Btn.getBoundingClientRect();
                    
                    return {
                        button1: {
                            top: rect1.top,
                            bottom: rect1.bottom,
                            visible: rect1.top >= 0 && rect1.bottom <= viewportHeight,
                            height: rect1.height
                        },
                        button2: {
                            top: rect2.top,
                            bottom: rect2.bottom,
                            visible: rect2.top >= 0 && rect2.bottom <= viewportHeight,
                            height: rect2.height
                        },
                        viewportHeight: viewportHeight
                    };
                }
                return null;
            });
            
            console.log('📊 按鈕可見性:', buttonVisibility);
            
            if (buttonVisibility) {
                if (buttonVisibility.button1.visible && buttonVisibility.button2.visible) {
                    console.log('✅ 所有按鈕完全可見');
                } else if (buttonVisibility.button1.visible || buttonVisibility.button2.visible) {
                    console.log('⚠️ 部分按鈕可見');
                } else {
                    console.log('❌ 按鈕不可見');
                }
            }
            
        } else {
            console.log('ℹ️ 人數設定方塊不存在（可能有學生資料）');
        }
        
        console.log('🎉 人數設定方塊高度增加測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testStudentCountHeightIncrease().then(success => {
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
