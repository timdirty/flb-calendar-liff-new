const puppeteer = require('puppeteer');

async function testFinalScroll() {
    console.log('🧪 開始最終滾動測試...');
    
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
        
        // 測試滾動
        console.log('📜 測試滾動...');
        const scrollResult = await page.evaluate(() => {
            const teacherContent = document.querySelector('.teacher-attendance-content');
            const scrollContainer = teacherContent ? teacherContent.querySelector('div[style*="overflow-y: auto"]') : null;
            const modalContent = document.querySelector('.attendance-modal-content');
            const studentCount = document.querySelector('#student-count-selection');
            
            console.log('🔍 DOM 結構檢查:', {
                teacherContent: !!teacherContent,
                scrollContainer: !!scrollContainer,
                modalContent: !!modalContent,
                studentCount: !!studentCount
            });
            
            // 檢查所有可能的滾動容器
            const allScrollContainers = document.querySelectorAll('div[style*="overflow-y: auto"]');
            console.log('🔍 所有滾動容器:', allScrollContainers.length);
            
            // 檢查模態框內容的滾動
            if (modalContent) {
                const modalScrollInfo = {
                    scrollHeight: modalContent.scrollHeight,
                    clientHeight: modalContent.clientHeight,
                    scrollTop: modalContent.scrollTop,
                    overflowY: getComputedStyle(modalContent).overflowY
                };
                console.log('🔍 模態框滾動資訊:', modalScrollInfo);
            }
            
            // 使用模態框內容作為滾動容器
            const actualScrollContainer = modalContent || scrollContainer;
            
            if (actualScrollContainer && studentCount) {
                // 記錄滾動前的位置
                const beforeScroll = {
                    scrollTop: actualScrollContainer.scrollTop,
                    scrollHeight: actualScrollContainer.scrollHeight,
                    clientHeight: actualScrollContainer.clientHeight
                };
                
                // 滾動到底部，並額外滾動一些距離
                actualScrollContainer.scrollTop = actualScrollContainer.scrollHeight + 200;
                
                // 記錄滾動後的位置
                const afterScroll = {
                    scrollTop: actualScrollContainer.scrollTop,
                    scrollHeight: actualScrollContainer.scrollHeight,
                    clientHeight: actualScrollContainer.clientHeight
                };
                
                // 檢查按鈕是否可見
                const count2Btn = document.querySelector('#count-2-btn');
                const count30Btn = document.querySelector('#count-30-btn');
                
                let buttonVisibility = null;
                if (count2Btn && count30Btn) {
                    const rect1 = count2Btn.getBoundingClientRect();
                    const rect2 = count30Btn.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    
                    buttonVisibility = {
                        button1Visible: rect1.top >= 0 && rect1.bottom <= viewportHeight,
                        button2Visible: rect2.top >= 0 && rect2.bottom <= viewportHeight,
                        button1Top: rect1.top,
                        button1Bottom: rect1.bottom,
                        viewportHeight: viewportHeight
                    };
                }
                
                return {
                    beforeScroll,
                    afterScroll,
                    buttonVisibility,
                    canScroll: actualScrollContainer.scrollHeight > actualScrollContainer.clientHeight,
                    scrollContainerFound: true
                };
            }
            return {
                scrollContainerFound: false,
                teacherContentFound: !!teacherContent,
                studentCountFound: !!studentCount
            };
        });
        
        console.log('📊 滾動結果:', scrollResult);
        
        if (scrollResult.scrollContainerFound && scrollResult.canScroll) {
            console.log('✅ 滾動功能正常');
            if (scrollResult.buttonVisibility) {
                if (scrollResult.buttonVisibility.button1Visible && scrollResult.buttonVisibility.button2Visible) {
                    console.log('✅ 按鈕完全可見');
                } else {
                    console.log('⚠️ 按鈕部分可見或不可見');
                }
            }
        } else {
            console.log('❌ 滾動功能異常');
        }
        
        console.log('🎉 最終滾動測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testFinalScroll().then(success => {
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
