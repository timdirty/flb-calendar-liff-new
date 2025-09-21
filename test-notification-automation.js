const puppeteer = require('puppeteer');

async function testNotificationSystem() {
    console.log('🚀 開始自動化測試學生簽到通知功能...');
    
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
        console.log('📱 導航到通知測試頁面...');
        await page.goto('http://localhost:3000/test-notification.html', { 
            waitUntil: 'networkidle2' 
        });
        
        // 等待頁面載入完成
        await page.waitForSelector('.test-button', { timeout: 10000 });
        console.log('✅ 頁面載入完成');
        
        // 等待事件監聽器設置完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試Toast通知
        console.log('🎯 測試Toast通知...');
        const testToastBtn = await page.$('#testToastBtn');
        await testToastBtn.click();
        console.log('🖱️ 點擊測試Toast通知按鈕');
        
        // 等待Toast顯示
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 測試錯誤Toast通知
        console.log('🎯 測試錯誤Toast通知...');
        const testErrorBtn = await page.$('#testErrorBtn');
        await testErrorBtn.click();
        console.log('🖱️ 點擊測試錯誤Toast通知按鈕');
        
        // 等待Toast顯示
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 測試發送通知
        console.log('🎯 測試發送通知...');
        const testNotificationBtn = await page.$('#testNotificationBtn');
        await testNotificationBtn.click();
        console.log('🖱️ 點擊測試發送通知按鈕');
        
        // 等待API調用完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查測試日誌
        const testLog = await page.evaluate(() => {
            const logContainer = document.getElementById('testLog');
            return logContainer ? logContainer.textContent : 'No log found';
        });
        
        console.log('📋 測試日誌:');
        console.log(testLog);
        
        // 檢查通知預覽
        const notificationPreview = await page.evaluate(() => {
            const preview = document.getElementById('notificationPreview');
            return preview ? preview.textContent : 'No preview found';
        });
        
        console.log('📱 通知預覽:');
        console.log(notificationPreview);
        
        console.log('✅ 通知功能自動化測試完成');
        
        // 保持瀏覽器打開5秒以便觀察
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testNotificationSystem().catch(console.error);
