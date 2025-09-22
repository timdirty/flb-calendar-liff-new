const puppeteer = require('puppeteer');

async function testStudentCountVisibility() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 }, // iPhone X 尺寸
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 375, height: 812 });
    
    try {
        console.log('🚀 開始測試人數設定按鈕可見性...');
        
        // 導航到頁面
        await page.goto('http://localhost:3000/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 點擊今日按鈕
        await page.click('button[data-view="today"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 找到一個課程並點擊
        const courseCard = await page.$('.event-card');
        if (courseCard) {
            await courseCard.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 等待標籤出現並切換到講師簽到標籤
            await page.waitForSelector('[data-tab="teacher-attendance"]', { timeout: 10000 });
            const teacherTab = await page.$('[data-tab="teacher-attendance"]');
            if (teacherTab) {
                await teacherTab.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 檢查人數選擇區域是否可見
                const studentCountSelection = await page.$('#student-count-selection');
                if (studentCountSelection) {
                    const isVisible = await page.evaluate((element) => {
                        const style = window.getComputedStyle(element);
                        return style.display !== 'none' && style.visibility !== 'hidden';
                    }, studentCountSelection);
                    
                    console.log('📊 人數選擇區域可見性:', isVisible);
                    
                    if (isVisible) {
                        // 獲取人數選擇區域的位置和大小
                        const selectionInfo = await page.evaluate((element) => {
                            const rect = element.getBoundingClientRect();
                            return {
                                top: rect.top,
                                left: rect.left,
                                width: rect.width,
                                height: rect.height,
                                bottom: rect.bottom,
                                right: rect.right
                            };
                        }, studentCountSelection);
                        
                        console.log('📊 人數選擇區域位置:', selectionInfo);
                        
                        // 獲取視窗大小
                        const viewport = await page.viewport();
                        console.log('📊 視窗大小:', viewport);
                        
                        // 檢查按鈕是否在視窗內
                        const buttons = await page.$$('#student-count-selection .count-btn');
                        console.log('📊 找到按鈕數量:', buttons.length);
                        
                        for (let i = 0; i < buttons.length; i++) {
                            const buttonInfo = await page.evaluate((element) => {
                                const rect = element.getBoundingClientRect();
                                return {
                                    top: rect.top,
                                    left: rect.left,
                                    width: rect.width,
                                    height: rect.height,
                                    bottom: rect.bottom,
                                    right: rect.right,
                                    visible: rect.top >= 0 && rect.bottom <= window.innerHeight && 
                                            rect.left >= 0 && rect.right <= window.innerWidth
                                };
                            }, buttons[i]);
                            
                            console.log(`📊 按鈕 ${i + 1} 位置:`, buttonInfo);
                        }
                        
                        // 檢查滾動容器
                        const scrollContainer = await page.$('.teacher-attendance-content div[style*="overflow-y: auto"]');
                        if (scrollContainer) {
                            const scrollInfo = await page.evaluate((element) => {
                                return {
                                    scrollTop: element.scrollTop,
                                    scrollHeight: element.scrollHeight,
                                    clientHeight: element.clientHeight,
                                    canScroll: element.scrollHeight > element.clientHeight
                                };
                            }, scrollContainer);
                            
                            console.log('📊 滾動容器資訊:', scrollInfo);
                            
                            // 嘗試手動滾動
                            await page.evaluate((element) => {
                                element.scrollTop = element.scrollHeight;
                            }, scrollContainer);
                            
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            
                            // 再次檢查按鈕位置
                            for (let i = 0; i < buttons.length; i++) {
                                const buttonInfo = await page.evaluate((element) => {
                                    const rect = element.getBoundingClientRect();
                                    return {
                                        top: rect.top,
                                        left: rect.left,
                                        width: rect.width,
                                        height: rect.height,
                                        bottom: rect.bottom,
                                        right: rect.right,
                                        visible: rect.top >= 0 && rect.bottom <= window.innerHeight && 
                                                rect.left >= 0 && rect.right <= window.innerWidth
                                    };
                                }, buttons[i]);
                                
                                console.log(`📊 滾動後按鈕 ${i + 1} 位置:`, buttonInfo);
                            }
                        }
                        
                        // 檢查是否調用了滾動函數
                        const scrollCalled = await page.evaluate(() => {
                            return window.scrollToStudentCountSelectionCalled || false;
                        });
                        
                        console.log('📊 是否調用了滾動函數:', scrollCalled);
                    }
                } else {
                    console.log('❌ 找不到人數選擇區域');
                }
            } else {
                console.log('❌ 找不到講師簽到標籤');
            }
        } else {
            console.log('❌ 找不到課程卡片');
        }
        
        console.log('✅ 測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
    }
}

testStudentCountVisibility();
