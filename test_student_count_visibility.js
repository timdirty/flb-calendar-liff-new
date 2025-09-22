const puppeteer = require('puppeteer');

async function testStudentCountVisibility() {
    console.log('🧪 開始測試人數選擇區域可見性...');
    
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
        
        // 檢查人數選擇區域
        console.log('🔍 檢查人數選擇區域...');
        const studentCountInfo = await page.evaluate(() => {
            const studentCountSelection = document.querySelector('#student-count-selection');
            const count2Btn = document.querySelector('#count-2-btn');
            const count30Btn = document.querySelector('#count-30-btn');
            
            if (studentCountSelection) {
                const rect = studentCountSelection.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                return {
                    exists: true,
                    display: getComputedStyle(studentCountSelection).display,
                    top: rect.top,
                    bottom: rect.bottom,
                    height: rect.height,
                    visible: rect.top >= 0 && rect.bottom <= viewportHeight,
                    partiallyVisible: rect.top < viewportHeight && rect.bottom > 0,
                    viewportHeight: viewportHeight,
                    buttons: {
                        count2Btn: !!count2Btn,
                        count30Btn: !!count30Btn
                    }
                };
            }
            
            return {
                exists: false,
                buttons: {
                    count2Btn: !!count2Btn,
                    count30Btn: !!count30Btn
                }
            };
        });
        
        console.log('📊 人數選擇區域信息:', studentCountInfo);
        
        if (studentCountInfo.exists) {
            if (studentCountInfo.visible) {
                console.log('✅ 人數選擇區域完全可見');
            } else if (studentCountInfo.partiallyVisible) {
                console.log('⚠️ 人數選擇區域部分可見');
            } else {
                console.log('❌ 人數選擇區域不可見');
            }
        } else {
            console.log('ℹ️ 人數選擇區域不存在（可能有學生資料）');
        }
        
        // 檢查滾動容器
        console.log('🔍 檢查滾動容器...');
        const scrollContainerInfo = await page.evaluate(() => {
            const modalContent = document.querySelector('.attendance-modal-content');
            const teacherContent = document.querySelector('.teacher-attendance-content');
            let scrollContainer = null;
            
            // 優先使用講師內容的滾動容器
            if (teacherContent) {
                scrollContainer = teacherContent.querySelector('div[style*="overflow-y: auto"]');
            }
            
            // 如果沒有找到，使用模態框內容
            if (!scrollContainer) {
                scrollContainer = modalContent;
            }
            
            if (scrollContainer) {
                return {
                    found: true,
                    scrollHeight: scrollContainer.scrollHeight,
                    clientHeight: scrollContainer.clientHeight,
                    scrollTop: scrollContainer.scrollTop,
                    canScroll: scrollContainer.scrollHeight > scrollContainer.clientHeight
                };
            }
            
            return { found: false };
        });
        
        console.log('📊 滾動容器信息:', scrollContainerInfo);
        
        // 如果人數選擇區域不可見，嘗試滾動到底部
        if (studentCountInfo.exists && !studentCountInfo.visible) {
            console.log('📜 嘗試滾動到底部...');
            
            await page.evaluate(() => {
                const modalContent = document.querySelector('.attendance-modal-content');
                const teacherContent = document.querySelector('.teacher-attendance-content');
                let scrollContainer = null;
                
                // 優先使用講師內容的滾動容器
                if (teacherContent) {
                    scrollContainer = teacherContent.querySelector('div[style*="overflow-y: auto"]');
                }
                
                // 如果沒有找到，使用模態框內容
                if (!scrollContainer) {
                    scrollContainer = modalContent;
                }
                
                if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }
            });
            
            // 等待滾動完成
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 再次檢查人數選擇區域
            const afterScrollInfo = await page.evaluate(() => {
                const studentCountSelection = document.querySelector('#student-count-selection');
                if (studentCountSelection) {
                    const rect = studentCountSelection.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    
                    return {
                        top: rect.top,
                        bottom: rect.bottom,
                        visible: rect.top >= 0 && rect.bottom <= viewportHeight,
                        partiallyVisible: rect.top < viewportHeight && rect.bottom > 0
                    };
                }
                return null;
            });
            
            console.log('📊 滾動後人數選擇區域位置:', afterScrollInfo);
            
            if (afterScrollInfo && afterScrollInfo.visible) {
                console.log('✅ 滾動後人數選擇區域完全可見');
            } else if (afterScrollInfo && afterScrollInfo.partiallyVisible) {
                console.log('⚠️ 滾動後人數選擇區域部分可見');
            } else {
                console.log('❌ 滾動後人數選擇區域仍不可見');
            }
        }
        
        console.log('🎉 人數選擇區域可見性測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testStudentCountVisibility().then(success => {
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
