const puppeteer = require('puppeteer');

async function testMaxScroll() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 }, // iPhone X 尺寸
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 375, height: 812 });
    
    try {
        console.log('🚀 開始測試最大滾動...');
        
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
        const courseCards = await page.$$('.event-card');
        if (courseCards.length > 0) {
            await courseCards[0].click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 等待標籤出現並切換到講師簽到標籤
            await page.waitForSelector('[data-tab="teacher-attendance"]', { timeout: 10000 });
            const teacherTab = await page.$('[data-tab="teacher-attendance"]');
            if (teacherTab) {
                await teacherTab.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 強制清空學生資料並顯示人數選擇
                await page.evaluate(() => {
                    console.log('🔧 強制清空學生資料...');
                    window.loadedStudentsData = null;
                    
                    // 找到人數選擇區域並強制顯示
                    const studentCountSelection = document.getElementById('student-count-selection');
                    if (studentCountSelection) {
                        studentCountSelection.style.display = 'block';
                        console.log('✅ 人數選擇區域已強制顯示');
                    } else {
                        console.log('❌ 找不到人數選擇區域');
                    }
                });
                
                // 等待一下讓DOM更新
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 嘗試多種滾動方法
                await page.evaluate(() => {
                    const modalContent = document.querySelector('.attendance-modal-content');
                    
                    if (modalContent) {
                        console.log('🔧 嘗試多種滾動方法...');
                        
                        // 方法1：直接設置scrollTop
                        console.log('方法1：直接設置scrollTop');
                        modalContent.scrollTop = modalContent.scrollHeight;
                        console.log('方法1結果 - scrollTop:', modalContent.scrollTop);
                        
                        // 方法2：使用scrollTo
                        console.log('方法2：使用scrollTo');
                        modalContent.scrollTo(0, modalContent.scrollHeight);
                        console.log('方法2結果 - scrollTop:', modalContent.scrollTop);
                        
                        // 方法3：使用scrollIntoView
                        console.log('方法3：使用scrollIntoView');
                        const studentCountSelection = document.getElementById('student-count-selection');
                        if (studentCountSelection) {
                            studentCountSelection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        
                        // 方法4：使用window.scrollTo
                        console.log('方法4：使用window.scrollTo');
                        window.scrollTo(0, document.body.scrollHeight);
                        
                        console.log('✅ 所有滾動方法嘗試完成');
                    }
                });
                
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
                
                // 檢查滾動容器狀態
                const scrollInfo = await page.evaluate(() => {
                    const modalContent = document.querySelector('.attendance-modal-content');
                    if (modalContent) {
                        return {
                            scrollTop: modalContent.scrollTop,
                            scrollHeight: modalContent.scrollHeight,
                            clientHeight: modalContent.clientHeight,
                            canScroll: modalContent.scrollHeight > modalContent.clientHeight
                        };
                    }
                    return null;
                });
                
                console.log('📊 滾動容器狀態:', scrollInfo);
                
                // 測試結果
                if (allButtonsVisible) {
                    console.log('✅ 所有按鈕都完全可見！');
                } else {
                    console.log('❌ 仍有按鈕不可見');
                }
                
                return allButtonsVisible;
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

testMaxScroll().then(success => {
    if (success) {
        console.log('🎉 測試通過：人數設定按鈕完全可見！');
    } else {
        console.log('💥 測試失敗：人數設定按鈕仍有可見性問題');
    }
});
