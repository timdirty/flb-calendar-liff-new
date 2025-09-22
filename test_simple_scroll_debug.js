const puppeteer = require('puppeteer');

async function testSimpleScrollDebug() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 }, // iPhone X 尺寸
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 375, height: 812 });
    
    try {
        console.log('🚀 開始測試簡單滾動調試...');
        
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
                
                // 檢查滾動容器和元素
                const debugInfo = await page.evaluate(() => {
                    // 嘗試多種選擇器
                    const scrollContainer1 = document.querySelector('.teacher-attendance-content div[style*="overflow-y: auto"]');
                    const scrollContainer2 = document.querySelector('.teacher-attendance-content');
                    const scrollContainer3 = document.querySelector('div[style*="overflow-y: auto"]');
                    const scrollContainer4 = document.querySelector('.attendance-modal-content');
                    
                    const studentCountSelection = document.getElementById('student-count-selection');
                    
                    let info = {
                        scrollContainer1Found: !!scrollContainer1,
                        scrollContainer2Found: !!scrollContainer2,
                        scrollContainer3Found: !!scrollContainer3,
                        scrollContainer4Found: !!scrollContainer4,
                        studentCountSelectionFound: !!studentCountSelection,
                        scrollContainerInfo: null,
                        studentCountSelectionInfo: null,
                        allDivsWithOverflow: []
                    };
                    
                    // 找到所有有 overflow-y: auto 的 div
                    const allDivs = document.querySelectorAll('div');
                    allDivs.forEach((div, index) => {
                        const style = window.getComputedStyle(div);
                        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                            info.allDivsWithOverflow.push({
                                index: index,
                                className: div.className,
                                id: div.id,
                                style: div.getAttribute('style'),
                                scrollHeight: div.scrollHeight,
                                clientHeight: div.clientHeight,
                                canScroll: div.scrollHeight > div.clientHeight
                            });
                        }
                    });
                    
                    // 使用第一個找到的滾動容器
                    const scrollContainer = scrollContainer1 || scrollContainer2 || scrollContainer3 || scrollContainer4;
                    
                    if (scrollContainer) {
                        info.scrollContainerInfo = {
                            scrollTop: scrollContainer.scrollTop,
                            scrollHeight: scrollContainer.scrollHeight,
                            clientHeight: scrollContainer.clientHeight,
                            canScroll: scrollContainer.scrollHeight > scrollContainer.clientHeight,
                            className: scrollContainer.className,
                            id: scrollContainer.id
                        };
                    }
                    
                    if (studentCountSelection) {
                        const rect = studentCountSelection.getBoundingClientRect();
                        info.studentCountSelectionInfo = {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                            bottom: rect.bottom,
                            right: rect.right
                        };
                    }
                    
                    return info;
                });
                
                console.log('📊 調試信息:', debugInfo);
                
                // 如果找到了滾動容器，嘗試手動滾動
                if (debugInfo.scrollContainerInfo) {
                    await page.evaluate(() => {
                        const scrollContainer = document.querySelector('.teacher-attendance-content div[style*="overflow-y: auto"]');
                        if (scrollContainer) {
                            console.log('🔧 手動滾動到底部...');
                            scrollContainer.scrollTop = scrollContainer.scrollHeight;
                            console.log('✅ 滾動完成，新的scrollTop:', scrollContainer.scrollTop);
                        }
                    });
                    
                    // 等待滾動完成
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // 再次檢查按鈕位置
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
                        
                        console.log(`📊 滾動後按鈕 ${i + 1} 位置:`, buttonInfo);
                    }
                }
                
            } else {
                console.log('❌ 找不到講師簽到標籤');
            }
        } else {
            console.log('❌ 找不到課程卡片');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
    }
}

testSimpleScrollDebug();
