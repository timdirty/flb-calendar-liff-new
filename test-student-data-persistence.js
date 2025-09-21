const puppeteer = require('puppeteer');

async function testStudentDataPersistence() {
    console.log('🧪 測試學生資料持久化功能...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // 監聽控制台日誌
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('學生') || text.includes('載入') || text.includes('恢復') || text.includes('創建')) {
                console.log(`📱 ${text}`);
            }
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000/public/perfect-calendar.html');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📅 等待行事曆載入...');
        await page.waitForSelector('.calendar-day', { timeout: 10000 });
        
        // 找到第一個有事件的日期
        const eventCards = await page.$$('.calendar-day .event-card');
        if (eventCards.length === 0) {
            console.log('❌ 沒有找到事件卡片，無法測試');
            return;
        }
        
        console.log(`✅ 找到 ${eventCards.length} 個事件卡片`);
        
        // 長按第一個事件卡片
        const firstCard = eventCards[0];
        const box = await firstCard.boundingBox();
        
        console.log('🖱️ 長按事件卡片...');
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 2000)); // 長按2秒
        await page.mouse.up();
        
        // 等待模態框出現
        await page.waitForSelector('.attendance-modal', { timeout: 5000 });
        console.log('✅ 簽到模態框已開啟');
        
        // 等待學生資料載入
        console.log('⏳ 等待學生資料載入...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 檢查是否有學生資料
        const hasStudents = await page.evaluate(() => {
            return window.loadedStudentsData && window.loadedStudentsData.students && window.loadedStudentsData.students.length > 0;
        });
        
        if (hasStudents) {
            console.log('✅ 學生資料已載入到 window.loadedStudentsData');
        } else {
            console.log('❌ 學生資料未載入到 window.loadedStudentsData');
        }
        
        // 點擊講師簽到
        console.log('👨‍🏫 點擊講師簽到...');
        const teacherTab = await page.$('.floating-nav-item[data-tab="teacher-attendance"]');
        if (teacherTab) {
            await teacherTab.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✅ 已切換到講師簽到');
        } else {
            console.log('❌ 找不到講師簽到按鈕');
        }
        
        // 點擊學生簽到
        console.log('👥 點擊學生簽到...');
        const studentTab = await page.$('.floating-nav-item[data-tab="student-attendance"]');
        if (studentTab) {
            await studentTab.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('✅ 已切換到學生簽到');
        } else {
            console.log('❌ 找不到學生簽到按鈕');
        }
        
        // 檢查是否顯示學生列表
        const studentsList = await page.$('#studentsList');
        if (studentsList) {
            console.log('✅ 找到學生列表元素');
            
            // 檢查學生列表是否有內容
            const studentItems = await page.$$('#studentsList .student-item');
            console.log(`📊 學生列表中有 ${studentItems.length} 個學生項目`);
            
            if (studentItems.length > 0) {
                console.log('✅ 學生簽到功能正常，顯示已載入的學生資料');
            } else {
                console.log('❌ 學生列表為空');
            }
        } else {
            console.log('❌ 找不到學生列表元素');
        }
        
        // 檢查是否還在載入中
        const loadingText = await page.evaluate(() => {
            const loadingElement = document.querySelector('h3');
            return loadingElement ? loadingElement.textContent : '';
        });
        
        if (loadingText.includes('載入中')) {
            console.log('❌ 仍在顯示載入中狀態');
        } else {
            console.log('✅ 不再顯示載入中狀態');
        }
        
        console.log('🎉 測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
    }
}

testStudentDataPersistence();
