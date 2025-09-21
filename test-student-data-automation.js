const puppeteer = require('puppeteer');

async function testStudentDataProcessing() {
    console.log('🚀 開始自動化測試學生資料處理...');
    
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
        console.log('📱 導航到學生資料處理測試頁面...');
        await page.goto('http://localhost:3000/test-student-data-processing.html', { 
            waitUntil: 'networkidle2' 
        });
        
        // 等待頁面載入完成
        await page.waitForSelector('.test-button', { timeout: 10000 });
        console.log('✅ 頁面載入完成');
        
        // 等待事件監聽器設置完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試只有姓名的資料
        console.log('🎯 測試只有姓名的資料...');
        const testWithNameBtn = await page.$('#testWithNameBtn');
        await testWithNameBtn.click();
        console.log('🖱️ 點擊測試只有姓名的資料按鈕');
        
        // 等待處理完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查學生卡片是否正確生成
        const studentsWithName = await page.evaluate(() => {
            const cards = document.querySelectorAll('.student-card');
            return Array.from(cards).map(card => ({
                studentId: card.dataset.studentId,
                name: card.querySelector('.student-name')?.textContent,
                status: card.querySelector('.student-status')?.textContent
            }));
        });
        
        console.log('📊 只有姓名的資料結果:', JSON.stringify(studentsWithName, null, 2));
        
        // 測試有ID的資料
        console.log('🎯 測試有ID的資料...');
        const testWithIdBtn = await page.$('#testWithIdBtn');
        await testWithIdBtn.click();
        console.log('🖱️ 點擊測試有ID的資料按鈕');
        
        // 等待處理完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查學生卡片是否正確生成
        const studentsWithId = await page.evaluate(() => {
            const cards = document.querySelectorAll('.student-card');
            return Array.from(cards).map(card => ({
                studentId: card.dataset.studentId,
                name: card.querySelector('.student-name')?.textContent,
                status: card.querySelector('.student-status')?.textContent
            }));
        });
        
        console.log('📊 有ID的資料結果:', JSON.stringify(studentsWithId, null, 2));
        
        // 測試混合資料
        console.log('🎯 測試混合資料...');
        const testMixedBtn = await page.$('#testMixedBtn');
        await testMixedBtn.click();
        console.log('🖱️ 點擊測試混合資料按鈕');
        
        // 等待處理完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查學生卡片是否正確生成
        const studentsMixed = await page.evaluate(() => {
            const cards = document.querySelectorAll('.student-card');
            return Array.from(cards).map(card => ({
                studentId: card.dataset.studentId,
                name: card.querySelector('.student-name')?.textContent,
                status: card.querySelector('.student-status')?.textContent
            }));
        });
        
        console.log('📊 混合資料結果:', JSON.stringify(studentsMixed, null, 2));
        
        // 檢查測試日誌
        const testLog = await page.evaluate(() => {
            const logContainer = document.getElementById('testLog');
            return logContainer ? logContainer.textContent : 'No log found';
        });
        
        console.log('📋 測試日誌:');
        console.log(testLog);
        
        console.log('✅ 學生資料處理自動化測試完成');
        
        // 保持瀏覽器打開5秒以便觀察
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testStudentDataProcessing().catch(console.error);
