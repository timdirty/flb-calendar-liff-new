const puppeteer = require('puppeteer');

async function testSmartAttendance() {
    console.log('🚀 開始測試智能簽到完成檢測功能...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1200, height: 800 }
    });
    
    try {
        const page = await browser.newPage();
        
        // 導航到主頁面
        console.log('📱 導航到主頁面...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle0' 
        });
        
        // 等待頁面載入
        await page.waitForSelector('.calendar-event', { timeout: 10000 });
        console.log('✅ 頁面載入成功');
        
        // 找到第一個課程事件並長按
        console.log('🎯 尋找課程事件...');
        const events = await page.$$('.calendar-event');
        if (events.length === 0) {
            console.log('❌ 沒有找到課程事件');
            return;
        }
        
        console.log(`📅 找到 ${events.length} 個課程事件`);
        
        // 長按第一個課程事件
        const firstEvent = events[0];
        console.log('⏰ 長按課程事件開啟簽到系統...');
        
        // 模擬長按（按下2秒）
        await firstEvent.hover();
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.mouse.up();
        
        // 等待簽到modal出現
        console.log('⏳ 等待簽到modal出現...');
        await page.waitForSelector('#attendanceModal', { timeout: 10000 });
        console.log('✅ 簽到modal已出現');
        
        // 等待學生名單載入
        console.log('⏳ 等待學生名單載入...');
        await page.waitForSelector('.student-card', { timeout: 15000 });
        console.log('✅ 學生名單已載入');
        
        // 檢查進度條是否出現
        const progressElement = await page.$('.attendance-progress');
        if (progressElement) {
            console.log('✅ 進度條元素已創建');
        } else {
            console.log('❌ 進度條元素未找到');
        }
        
        // 獲取學生卡片數量
        const studentCards = await page.$$('.student-card');
        const totalStudents = studentCards.length;
        console.log(`👥 找到 ${totalStudents} 個學生`);
        
        if (totalStudents === 0) {
            console.log('❌ 沒有學生可以測試');
            return;
        }
        
        // 測試部分簽到（點擊前幾個學生的出席按鈕）
        const studentsToMark = Math.min(3, totalStudents);
        console.log(`🎯 開始標記前 ${studentsToMark} 個學生為出席...`);
        
        for (let i = 0; i < studentsToMark; i++) {
            const presentBtn = await page.$(`.student-card:nth-child(${i + 1}) .present-btn`);
            if (presentBtn) {
                console.log(`✅ 點擊第 ${i + 1} 個學生的出席按鈕`);
                await presentBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
            }
        }
        
        // 檢查進度更新
        console.log('🔍 檢查進度更新...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const progressText = await page.$eval('.attendance-progress', el => el.textContent);
        console.log('📊 進度顯示:', progressText);
        
        // 如果還有未標記的學生，標記剩餘的學生
        if (studentsToMark < totalStudents) {
            console.log(`🎯 標記剩餘 ${totalStudents - studentsToMark} 個學生...`);
            
            for (let i = studentsToMark; i < totalStudents; i++) {
                const presentBtn = await page.$(`.student-card:nth-child(${i + 1}) .present-btn`);
                if (presentBtn) {
                    console.log(`✅ 點擊第 ${i + 1} 個學生的出席按鈕`);
                    await presentBtn.click();
                    await new Promise(resolve => setTimeout(resolve, 500)); // 等待0.5秒
                }
            }
        }
        
        // 檢查完成狀態
        console.log('🔍 檢查簽到完成狀態...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const completionElement = await page.$('.attendance-completion');
        if (completionElement) {
            const completionText = await completionElement.textContent;
            console.log('🎉 完成狀態:', completionText);
        }
        
        // 檢查最終進度
        const finalProgressText = await page.$eval('.attendance-progress', el => el.textContent);
        console.log('📊 最終進度:', finalProgressText);
        
        // 等待通知發送
        console.log('⏳ 等待通知發送...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 檢查控制台日誌
        const logs = await page.evaluate(() => {
            return window.console.logs || [];
        });
        
        console.log('📝 控制台日誌:');
        logs.forEach(log => console.log('  ', log));
        
        console.log('\n✅ 智能簽到完成檢測功能測試完成！');
        
        // 截圖保存結果
        await page.screenshot({ 
            path: 'smart-attendance-test-result.png',
            fullPage: true 
        });
        console.log('📸 測試結果截圖已保存: smart-attendance-test-result.png');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testSmartAttendance().catch(console.error);
