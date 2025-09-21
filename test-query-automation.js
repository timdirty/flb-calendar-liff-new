const puppeteer = require('puppeteer');

async function testQueryAttendance() {
    console.log('🚀 開始自動化測試查詢學生缺勤記錄功能...');
    
    const browser = await puppeteer.launch({ 
        headless: false, // 顯示瀏覽器窗口以便觀察
        defaultViewport: { width: 1280, height: 720 }
    });
    
    try {
        const page = await browser.newPage();
        
        // 設置控制台日誌捕獲
        page.on('console', msg => {
            console.log(`[瀏覽器控制台] ${msg.text()}`);
        });
        
        // 導航到測試頁面
        console.log('📱 導航到查詢測試頁面...');
        await page.goto('http://localhost:3000/test-query-attendance.html', { 
            waitUntil: 'networkidle2' 
        });
        
        // 等待頁面載入完成
        await page.waitForSelector('.student-card', { timeout: 10000 });
        console.log('✅ 頁面載入完成');
        
        // 等待事件監聽器設置完成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 測試手動查詢按鈕
        console.log('🎯 測試手動查詢按鈕...');
        
        // 點擊查詢陳杰睿按鈕
        const queryBtn1 = await page.$('#testQueryBtn');
        await queryBtn1.click();
        console.log('🖱️ 點擊查詢陳杰睿按鈕');
        
        // 等待模態框出現
        await page.waitForSelector('.attendance-record-modal', { timeout: 10000 });
        console.log('✅ 模態框出現');
        
        // 等待查詢完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查模態框內容
        const modalContent = await page.evaluate(() => {
            const modal = document.querySelector('.attendance-record-modal');
            if (modal) {
                const title = modal.querySelector('.attendance-record-title')?.textContent;
                const records = modal.querySelectorAll('.attendance-record-item');
                return {
                    title: title,
                    recordCount: records.length,
                    records: Array.from(records).map(record => ({
                        date: record.querySelector('.attendance-record-date')?.textContent,
                        status: record.querySelector('.attendance-record-status')?.textContent
                    }))
                };
            }
            return null;
        });
        
        console.log('📊 模態框內容:', JSON.stringify(modalContent, null, 2));
        
        // 關閉模態框
        const closeBtn = await page.$('.close-attendance-record-btn');
        await closeBtn.click();
        console.log('❌ 關閉模態框');
        
        // 等待模態框關閉
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試雙擊學生卡片
        console.log('🎯 測試雙擊學生卡片...');
        
        // 雙擊第一個學生卡片
        const studentCard = await page.$('.student-card[data-student-name="陳杰睿"]');
        await studentCard.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        await studentCard.click();
        console.log('🖱️ 雙擊陳杰睿學生卡片');
        
        // 等待模態框出現
        await page.waitForSelector('.attendance-record-modal', { timeout: 10000 });
        console.log('✅ 模態框出現（雙擊觸發）');
        
        // 等待查詢完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查模態框內容
        const modalContent2 = await page.evaluate(() => {
            const modal = document.querySelector('.attendance-record-modal');
            if (modal) {
                const title = modal.querySelector('.attendance-record-title')?.textContent;
                const records = modal.querySelectorAll('.attendance-record-item');
                return {
                    title: title,
                    recordCount: records.length,
                    records: Array.from(records).map(record => ({
                        date: record.querySelector('.attendance-record-date')?.textContent,
                        status: record.querySelector('.attendance-record-status')?.textContent
                    }))
                };
            }
            return null;
        });
        
        console.log('📊 模態框內容（雙擊觸發）:', JSON.stringify(modalContent2, null, 2));
        
        // 關閉模態框
        const closeBtn2 = await page.$('.close-attendance-record-btn');
        await closeBtn2.click();
        console.log('❌ 關閉模態框');
        
        // 等待模態框關閉
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試查詢顏世餘
        console.log('🎯 測試查詢顏世餘...');
        
        const queryBtn2 = await page.$('#testQueryBtn2');
        await queryBtn2.click();
        console.log('🖱️ 點擊查詢顏世餘按鈕');
        
        // 等待模態框出現
        await page.waitForSelector('.attendance-record-modal', { timeout: 10000 });
        console.log('✅ 模態框出現（顏世餘）');
        
        // 等待查詢完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查模態框內容
        const modalContent3 = await page.evaluate(() => {
            const modal = document.querySelector('.attendance-record-modal');
            if (modal) {
                const title = modal.querySelector('.attendance-record-title')?.textContent;
                const records = modal.querySelectorAll('.attendance-record-item');
                return {
                    title: title,
                    recordCount: records.length,
                    records: Array.from(records).map(record => ({
                        date: record.querySelector('.attendance-record-date')?.textContent,
                        status: record.querySelector('.attendance-record-status')?.textContent
                    }))
                };
            }
            return null;
        });
        
        console.log('📊 模態框內容（顏世餘）:', JSON.stringify(modalContent3, null, 2));
        
        // 關閉模態框
        const closeBtn3 = await page.$('.close-attendance-record-btn');
        await closeBtn3.click();
        console.log('❌ 關閉模態框');
        
        // 檢查測試日誌
        const testLog = await page.evaluate(() => {
            const logContainer = document.getElementById('testLog');
            return logContainer ? logContainer.textContent : 'No log found';
        });
        
        console.log('📋 測試日誌:');
        console.log(testLog);
        
        console.log('✅ 查詢功能自動化測試完成');
        
        // 保持瀏覽器打開5秒以便觀察
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testQueryAttendance().catch(console.error);
