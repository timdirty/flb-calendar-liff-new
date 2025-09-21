const puppeteer = require('puppeteer');

async function testStudentCardLookup() {
    console.log('🚀 開始自動化測試學生卡片查找功能...');
    
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
        console.log('📱 導航到學生卡片查找測試頁面...');
        await page.goto('http://localhost:3000/test-student-card-lookup.html', { 
            waitUntil: 'networkidle2' 
        });
        
        // 等待頁面載入完成
        await page.waitForSelector('.student-card', { timeout: 10000 });
        console.log('✅ 頁面載入完成');
        
        // 等待事件監聽器設置完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試通過ID查找
        console.log('🎯 測試通過ID查找...');
        const testByIdBtn = await page.$('#testByIdBtn');
        await testByIdBtn.click();
        console.log('🖱️ 點擊通過ID查找按鈕');
        
        // 等待狀態更新
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查第一個學生卡片狀態
        const student1Status = await page.evaluate(() => {
            const card = document.querySelector('.student-card[data-student-id="student_0"]');
            if (card) {
                return {
                    classes: card.className,
                    statusText: card.querySelector('.student-status')?.textContent
                };
            }
            return null;
        });
        
        console.log('📊 第一個學生卡片狀態:', JSON.stringify(student1Status, null, 2));
        
        // 測試通過姓名查找
        console.log('🎯 測試通過姓名查找...');
        const testByNameBtn = await page.$('#testByNameBtn');
        await testByNameBtn.click();
        console.log('🖱️ 點擊通過姓名查找按鈕');
        
        // 等待狀態更新
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查第二個學生卡片狀態
        const student2Status = await page.evaluate(() => {
            const card = document.querySelector('.student-card[data-student-id="student_1"]');
            if (card) {
                return {
                    classes: card.className,
                    statusText: card.querySelector('.student-status')?.textContent
                };
            }
            return null;
        });
        
        console.log('📊 第二個學生卡片狀態:', JSON.stringify(student2Status, null, 2));
        
        // 測試無效ID查找
        console.log('🎯 測試無效ID查找...');
        const testInvalidBtn = await page.$('#testInvalidBtn');
        await testInvalidBtn.click();
        console.log('🖱️ 點擊無效ID查找按鈕');
        
        // 等待狀態更新
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查測試日誌
        const testLog = await page.evaluate(() => {
            const logContainer = document.getElementById('testLog');
            return logContainer ? logContainer.textContent : 'No log found';
        });
        
        console.log('📋 測試日誌:');
        console.log(testLog);
        
        console.log('✅ 學生卡片查找功能自動化測試完成');
        
        // 保持瀏覽器打開5秒以便觀察
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testStudentCardLookup().catch(console.error);
