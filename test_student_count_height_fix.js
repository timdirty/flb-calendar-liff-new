const puppeteer = require('puppeteer');

async function testStudentCountHeightFix() {
    console.log('🧪 開始測試人數設定方塊高度修復...');
    
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔄 等待模態框載入...');
        await page.waitForSelector('#attendanceModal', { timeout: 15000 });
        
        console.log('🔄 切換到講師簽到標籤...');
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查人數設定方塊是否顯示
        console.log('🔍 檢查人數設定方塊...');
        const studentCountSelection = await page.$('#student-count-selection');
        
        if (studentCountSelection) {
            console.log('✅ 人數設定方塊存在');
            
            // 檢查方塊的樣式
            const styles = await page.evaluate((element) => {
                const computedStyle = getComputedStyle(element);
                return {
                    padding: computedStyle.padding,
                    display: computedStyle.display,
                    height: element.offsetHeight,
                    minHeight: computedStyle.minHeight
                };
            }, studentCountSelection);
            
            console.log('📊 人數設定方塊樣式:', styles);
            
            // 檢查按鈕樣式
            const count2Btn = await page.$('#count-2-btn');
            const count30Btn = await page.$('#count-30-btn');
            
            if (count2Btn && count30Btn) {
                console.log('✅ 人數選擇按鈕存在');
                
                const buttonStyles = await page.evaluate((btn1, btn2) => {
                    const style1 = getComputedStyle(btn1);
                    const style2 = getComputedStyle(btn2);
                    return {
                        button1: {
                            padding: style1.padding,
                            height: btn1.offsetHeight,
                            minHeight: style1.minHeight
                        },
                        button2: {
                            padding: style2.padding,
                            height: btn2.offsetHeight,
                            minHeight: style2.minHeight
                        }
                    };
                }, count2Btn, count30Btn);
                
                console.log('📊 按鈕樣式:', buttonStyles);
                
                // 檢查按鈕是否完全可見
                const buttonVisibility = await page.evaluate((btn1, btn2) => {
                    const rect1 = btn1.getBoundingClientRect();
                    const rect2 = btn2.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    
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
                        }
                    };
                }, count2Btn, count30Btn);
                
                console.log('📊 按鈕可見性:', buttonVisibility);
                
                // 檢查按鈕文字是否完全顯示
                const buttonText = await page.evaluate((btn1, btn2) => {
                    const text1 = btn1.textContent.trim();
                    const text2 = btn2.textContent.trim();
                    return {
                        button1Text: text1,
                        button2Text: text2,
                        button1TextLength: text1.length,
                        button2TextLength: text2.length
                    };
                }, count2Btn, count30Btn);
                
                console.log('📊 按鈕文字:', buttonText);
                
                // 測試按鈕點擊
                console.log('👆 測試按鈕點擊...');
                await count2Btn.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await count30Btn.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                console.log('✅ 按鈕點擊測試完成');
                
            } else {
                console.log('❌ 人數選擇按鈕不存在');
            }
            
        } else {
            console.log('ℹ️ 人數設定方塊未顯示（可能有學生資料）');
        }
        
        // 檢查整體佈局
        const layoutInfo = await page.evaluate(() => {
            const modal = document.querySelector('#attendanceModal');
            const content = document.querySelector('.teacher-attendance-content');
            const studentCount = document.querySelector('#student-count-selection');
            
            return {
                modalHeight: modal ? modal.offsetHeight : 0,
                contentHeight: content ? content.offsetHeight : 0,
                studentCountHeight: studentCount ? studentCount.offsetHeight : 0,
                viewportHeight: window.innerHeight
            };
        });
        
        console.log('📊 佈局資訊:', layoutInfo);
        
        console.log('🎉 人數設定方塊高度修復測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testStudentCountHeightFix().then(success => {
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
