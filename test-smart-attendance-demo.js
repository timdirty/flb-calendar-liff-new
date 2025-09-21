const puppeteer = require('puppeteer');

async function testSmartAttendanceDemo() {
    console.log('🚀 開始測試智能簽到完成檢測功能演示...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1200, height: 800 }
    });
    
    try {
        const page = await browser.newPage();
        
        // 導航到測試頁面
        console.log('📱 導航到智能簽到測試頁面...');
        await page.goto('http://localhost:3000/test-smart-attendance.html', { 
            waitUntil: 'networkidle0' 
        });
        
        // 等待頁面載入
        await page.waitForSelector('.student-card', { timeout: 10000 });
        console.log('✅ 測試頁面載入成功');
        
        // 檢查初始狀態
        console.log('\n📊 檢查初始狀態...');
        const initialProgress = await page.$eval('#progressText', el => el.textContent);
        console.log('初始進度:', initialProgress);
        
        // 測試部分簽到
        console.log('\n🎯 測試部分簽到（標記前3個學生）...');
        for (let i = 1; i <= 3; i++) {
            const presentBtn = await page.$(`.student-card:nth-child(${i}) .present-btn`);
            if (presentBtn) {
                console.log(`✅ 標記第 ${i} 個學生為出席`);
                await presentBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
                
                // 檢查進度更新
                const progress = await page.$eval('#progressText', el => el.textContent);
                console.log(`   進度更新: ${progress}`);
            }
        }
        
        // 等待3秒看是否發送通知
        console.log('\n⏰ 等待3秒看是否發送部分簽到通知...');
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // 檢查是否有通知結果
        const partialResult = await page.$('#testResult');
        if (partialResult) {
            const resultText = await partialResult.textContent;
            if (resultText) {
                console.log('📤 部分簽到通知結果:', resultText.substring(0, 100) + '...');
            }
        }
        
        // 重置測試
        console.log('\n🔄 重置測試...');
        await page.click('button[onclick="resetTest()"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試全部簽到（立即發送）
        console.log('\n🎯 測試全部簽到（標記所有學生）...');
        await page.click('button[onclick="markAllPresent()"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查完成狀態
        const completionMessage = await page.$('.completion-message.show');
        if (completionMessage) {
            const completionText = await completionMessage.textContent;
            console.log('🎉 完成狀態:', completionText);
        }
        
        // 檢查最終進度
        const finalProgress = await page.$eval('#progressText', el => el.textContent);
        console.log('📊 最終進度:', finalProgress);
        
        // 檢查通知結果
        const finalResult = await page.$('#testResult');
        if (finalResult) {
            const resultText = await finalResult.textContent;
            if (resultText) {
                console.log('📤 全部簽到通知結果:', resultText.substring(0, 200) + '...');
            }
        }
        
        // 測試隨機簽到
        console.log('\n🎲 測試隨機簽到...');
        await page.click('button[onclick="resetTest()"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await page.click('button[onclick="markRandom()"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const randomProgress = await page.$eval('#progressText', el => el.textContent);
        console.log('📊 隨機簽到進度:', randomProgress);
        
        console.log('\n✅ 智能簽到完成檢測功能演示完成！');
        
        // 截圖保存結果
        await page.screenshot({ 
            path: 'smart-attendance-demo-result.png',
            fullPage: true 
        });
        console.log('📸 演示結果截圖已保存: smart-attendance-demo-result.png');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testSmartAttendanceDemo().catch(console.error);
