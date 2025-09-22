const puppeteer = require('puppeteer');

async function testScrollFunctionality() {
    console.log('🧪 開始測試滾動功能...');
    
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
        
        // 檢查滾動容器
        console.log('🔍 檢查滾動容器...');
        const scrollInfo = await page.evaluate(() => {
            const modal = document.querySelector('#attendanceModal');
            const content = document.querySelector('.attendance-modal-content');
            const teacherContent = document.querySelector('.teacher-attendance-content');
            const studentCount = document.querySelector('#student-count-selection');
            
            return {
                modal: {
                    scrollHeight: modal ? modal.scrollHeight : 0,
                    clientHeight: modal ? modal.clientHeight : 0,
                    scrollTop: modal ? modal.scrollTop : 0
                },
                content: {
                    scrollHeight: content ? content.scrollHeight : 0,
                    clientHeight: content ? content.clientHeight : 0,
                    scrollTop: content ? content.scrollTop : 0,
                    overflowY: content ? getComputedStyle(content).overflowY : 'none'
                },
                teacherContent: {
                    scrollHeight: teacherContent ? teacherContent.scrollHeight : 0,
                    clientHeight: teacherContent ? teacherContent.clientHeight : 0,
                    scrollTop: teacherContent ? teacherContent.scrollTop : 0,
                    overflowY: teacherContent ? getComputedStyle(teacherContent).overflowY : 'none'
                },
                studentCount: {
                    exists: !!studentCount,
                    height: studentCount ? studentCount.offsetHeight : 0
                }
            };
        });
        
        console.log('📊 滾動資訊:', scrollInfo);
        
        // 嘗試滾動到人數設定區域
        console.log('📜 嘗試滾動到人數設定區域...');
        await page.evaluate(() => {
            const studentCount = document.querySelector('#student-count-selection');
            if (studentCount) {
                studentCount.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        
        // 等待滾動完成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查滾動後的位置
        const afterScrollInfo = await page.evaluate(() => {
            const studentCount = document.querySelector('#student-count-selection');
            const count2Btn = document.querySelector('#count-2-btn');
            const count30Btn = document.querySelector('#count-30-btn');
            
            if (studentCount && count2Btn && count30Btn) {
                const rect1 = count2Btn.getBoundingClientRect();
                const rect2 = count30Btn.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                return {
                    studentCountVisible: studentCount.offsetHeight > 0,
                    button1Visible: rect1.top >= 0 && rect1.bottom <= viewportHeight,
                    button2Visible: rect2.top >= 0 && rect2.bottom <= viewportHeight,
                    button1Top: rect1.top,
                    button1Bottom: rect1.bottom,
                    viewportHeight: viewportHeight
                };
            }
            return null;
        });
        
        console.log('📊 滾動後位置:', afterScrollInfo);
        
        // 嘗試手動滾動
        console.log('📜 嘗試手動滾動...');
        await page.evaluate(() => {
            const teacherContent = document.querySelector('.teacher-attendance-content');
            if (teacherContent) {
                teacherContent.scrollTop = teacherContent.scrollHeight;
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 再次檢查位置
        const finalPosition = await page.evaluate(() => {
            const count2Btn = document.querySelector('#count-2-btn');
            const count30Btn = document.querySelector('#count-30-btn');
            
            if (count2Btn && count30Btn) {
                const rect1 = count2Btn.getBoundingClientRect();
                const rect2 = count30Btn.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                return {
                    button1Visible: rect1.top >= 0 && rect1.bottom <= viewportHeight,
                    button2Visible: rect2.top >= 0 && rect2.bottom <= viewportHeight,
                    button1Top: rect1.top,
                    button1Bottom: rect1.bottom,
                    viewportHeight: viewportHeight
                };
            }
            return null;
        });
        
        console.log('📊 最終位置:', finalPosition);
        
        console.log('🎉 滾動功能測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testScrollFunctionality().then(success => {
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
