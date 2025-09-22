const puppeteer = require('puppeteer');

async function testStudentCountVisibilityFix() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 }, // iPhone X 尺寸
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 375, height: 812 });
    
    try {
        console.log('🚀 開始測試人數設定按鈕可見性修復...');
        
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
        
        // 找到一個課程並點擊（選擇第一個課程）
        const courseCards = await page.$$('.event-card');
        if (courseCards.length > 0) {
            await courseCards[0].click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 等待標籤出現並切換到講師簽到標籤
            await page.waitForSelector('[data-tab="teacher-attendance"]', { timeout: 10000 });
            const teacherTab = await page.$('[data-tab="teacher-attendance"]');
            if (teacherTab) {
                await teacherTab.click();
                await new Promise(resolve => setTimeout(resolve, 3000)); // 增加等待時間
                
                // 檢查人數選擇區域是否可見
                const studentCountSelection = await page.$('#student-count-selection');
                if (studentCountSelection) {
                    const isVisible = await page.evaluate((element) => {
                        const style = window.getComputedStyle(element);
                        return style.display !== 'none' && style.visibility !== 'hidden';
                    }, studentCountSelection);
                    
                    console.log('📊 人數選擇區域可見性:', isVisible);
                    
                    if (isVisible) {
                        // 等待滾動完成
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // 檢查按鈕是否在視窗內
                        const buttons = await page.$$('#student-count-selection .count-btn');
                        console.log('📊 找到按鈕數量:', buttons.length);
                        
                        let allButtonsVisible = true;
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
                            
                            if (!buttonInfo.visible) {
                                allButtonsVisible = false;
                            }
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
                        }
                        
                        // 檢查是否調用了滾動函數
                        const scrollCalled = await page.evaluate(() => {
                            return window.scrollToStudentCountSelectionCalled || false;
                        });
                        
                        console.log('📊 是否調用了滾動函數:', scrollCalled);
                        
                        // 測試結果
                        if (allButtonsVisible) {
                            console.log('✅ 所有按鈕都完全可見！');
                        } else {
                            console.log('❌ 仍有按鈕不可見');
                        }
                        
                        return allButtonsVisible;
                    }
                } else {
                    console.log('❌ 找不到人數選擇區域');
                    return false;
                }
            } else {
                console.log('❌ 找不到講師簽到標籤');
                return false;
            }
        } else {
            console.log('❌ 找不到課程卡片');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
        return false;
    } finally {
        await browser.close();
    }
}

testStudentCountVisibilityFix().then(success => {
    if (success) {
        console.log('🎉 測試通過：人數設定按鈕完全可見！');
    } else {
        console.log('💥 測試失敗：人數設定按鈕仍有可見性問題');
    }
});
