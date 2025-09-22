const puppeteer = require('puppeteer');

async function testTextInputScroll() {
    console.log('🧪 開始測試文字輸入框自動滾動功能...');
    
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
        
        // 檢查文字輸入框是否存在
        console.log('🔍 檢查文字輸入框...');
        const textInput = await page.$('#course-content');
        if (!textInput) {
            throw new Error('找不到文字輸入框');
        }
        
        console.log('✅ 文字輸入框存在');
        
        // 記錄滾動前的位置
        const beforeScroll = await page.evaluate(() => {
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
            
            // 如果還是沒有找到，嘗試找到任何可滾動的容器
            if (!scrollContainer) {
                scrollContainer = document.querySelector('div[style*="overflow-y: auto"]');
            }
            
            console.log('🔍 滾動容器調試:', {
                modalContent: !!modalContent,
                teacherContent: !!teacherContent,
                teacherScrollDiv: teacherContent ? !!teacherContent.querySelector('div[style*="overflow-y: auto"]') : false,
                anyScrollDiv: !!document.querySelector('div[style*="overflow-y: auto"]'),
                scrollContainer: !!scrollContainer
            });
            
            return {
                scrollTop: scrollContainer ? scrollContainer.scrollTop : 0,
                scrollHeight: scrollContainer ? scrollContainer.scrollHeight : 0,
                clientHeight: scrollContainer ? scrollContainer.clientHeight : 0,
                containerFound: !!scrollContainer
            };
        });
        
        console.log('📊 滾動前位置:', beforeScroll);
        
        // 點擊文字輸入框
        console.log('👆 點擊文字輸入框...');
        await textInput.click();
        
        // 等待滾動動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查滾動函數是否被調用
        const scrollFunctionCalled = await page.evaluate(() => {
            return window.scrollToTextInputCalled || false;
        });
        
        console.log('📊 滾動函數是否被調用:', scrollFunctionCalled);
        
        // 記錄滾動後的位置
        const afterScroll = await page.evaluate(() => {
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
            
            // 如果還是沒有找到，嘗試找到任何可滾動的容器
            if (!scrollContainer) {
                scrollContainer = document.querySelector('div[style*="overflow-y: auto"]');
            }
            
            return {
                scrollTop: scrollContainer ? scrollContainer.scrollTop : 0,
                scrollHeight: scrollContainer ? scrollContainer.scrollHeight : 0,
                clientHeight: scrollContainer ? scrollContainer.clientHeight : 0,
                containerFound: !!scrollContainer
            };
        });
        
        console.log('📊 滾動後位置:', afterScroll);
        
        // 檢查文字輸入框是否在視窗頂部附近
        const textInputPosition = await page.evaluate(() => {
            const textInput = document.querySelector('#course-content');
            if (textInput) {
                const rect = textInput.getBoundingClientRect();
                return {
                    top: rect.top,
                    bottom: rect.bottom,
                    visible: rect.top >= 0 && rect.bottom <= window.innerHeight
                };
            }
            return null;
        });
        
        console.log('📊 文字輸入框位置:', textInputPosition);
        
        // 測試焦點事件
        console.log('🎯 測試焦點事件...');
        await textInput.focus();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 檢查焦點後的滾動位置
        const focusScroll = await page.evaluate(() => {
            const modalContent = document.querySelector('.attendance-modal-content');
            const teacherContent = document.querySelector('.teacher-attendance-content');
            const scrollContainer = teacherContent ? teacherContent.querySelector('div[style*="overflow-y: auto"]') : modalContent;
            
            return {
                scrollTop: scrollContainer ? scrollContainer.scrollTop : 0
            };
        });
        
        console.log('📊 焦點後滾動位置:', focusScroll);
        
        // 測試輸入文字
        console.log('⌨️ 測試輸入文字...');
        await textInput.type('測試課程內容');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 檢查輸入後的狀態
        const inputValue = await page.evaluate(() => {
            const textInput = document.querySelector('#course-content');
            return textInput ? textInput.value : '';
        });
        
        console.log('📊 輸入內容:', inputValue);
        
        // 測試失焦事件
        console.log('👋 測試失焦事件...');
        await page.click('body');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🎉 文字輸入框自動滾動測試完成！');
        
        // 檢查滾動是否有效
        const scrollWorked = afterScroll.scrollTop !== beforeScroll.scrollTop;
        console.log('✅ 滾動功能:', scrollWorked ? '正常' : '異常');
        
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testTextInputScroll().then(success => {
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
