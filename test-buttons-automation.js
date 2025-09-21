const puppeteer = require('puppeteer');

async function testCheckinButtons() {
    console.log('🚀 開始自動化測試簽到按鈕功能...');
    
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
        console.log('📱 導航到測試頁面...');
        await page.goto('http://localhost:3000/test-perfect-calendar-buttons.html', { 
            waitUntil: 'networkidle2' 
        });
        
        // 等待頁面載入完成
        await page.waitForSelector('.student-card', { timeout: 10000 });
        console.log('✅ 頁面載入完成');
        
        // 等待事件監聽器設置完成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查按鈕狀態
        console.log('🔍 檢查按鈕狀態...');
        const buttonStatus = await page.evaluate(() => {
            const buttons = document.querySelectorAll('.present-btn, .absent-btn');
            return Array.from(buttons).map((btn, index) => ({
                index: index + 1,
                studentId: btn.dataset.studentId,
                disabled: btn.disabled,
                pointerEvents: btn.style.pointerEvents,
                className: btn.className,
                textContent: btn.textContent
            }));
        });
        
        console.log('📊 按鈕狀態:', JSON.stringify(buttonStatus, null, 2));
        
        // 測試出席按鈕點擊
        console.log('🎯 測試出席按鈕點擊...');
        const presentButtons = await page.$$('.present-btn');
        
        for (let i = 0; i < presentButtons.length; i++) {
            const button = presentButtons[i];
            const studentId = await button.evaluate(el => el.dataset.studentId);
            
            console.log(`🖱️ 點擊出席按鈕: ${studentId}`);
            
            // 檢查按鈕是否可點擊
            const isDisabled = await button.evaluate(el => el.disabled);
            if (isDisabled) {
                console.log(`⚠️ 按鈕被禁用: ${studentId}`);
                continue;
            }
            
            // 點擊按鈕
            await button.click();
            
            // 等待API調用完成
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 檢查按鈕狀態是否更新
            const buttonText = await button.evaluate(el => el.textContent);
            const buttonDisabled = await button.evaluate(el => el.disabled);
            console.log(`📝 按鈕文字更新: ${buttonText}, 禁用狀態: ${buttonDisabled}`);
            
            // 檢查學生狀態是否更新
            const studentCard = await button.evaluateHandle(el => el.closest('.student-card'));
            const statusText = await studentCard.evaluate(el => 
                el.querySelector('.student-status').textContent
            );
            console.log(`📊 學生狀態更新: ${statusText}`);
        }
        
        // 等待一下再測試缺席按鈕
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試缺席按鈕點擊（只測試第一個，因為其他的可能已經被禁用）
        console.log('🎯 測試缺席按鈕點擊...');
        const absentButtons = await page.$$('.absent-btn');
        
        for (let i = 0; i < Math.min(absentButtons.length, 1); i++) {
            const button = absentButtons[i];
            const studentId = await button.evaluate(el => el.dataset.studentId);
            
            console.log(`🖱️ 點擊缺席按鈕: ${studentId}`);
            
            // 檢查按鈕是否可點擊
            const isDisabled = await button.evaluate(el => el.disabled);
            if (isDisabled) {
                console.log(`⚠️ 按鈕被禁用: ${studentId}`);
                continue;
            }
            
            // 點擊按鈕
            await button.click();
            
            // 等待API調用完成
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 檢查按鈕狀態是否更新
            const buttonText = await button.evaluate(el => el.textContent);
            const buttonDisabled = await button.evaluate(el => el.disabled);
            console.log(`📝 按鈕文字更新: ${buttonText}, 禁用狀態: ${buttonDisabled}`);
            
            // 檢查學生狀態是否更新
            const studentCard = await button.evaluateHandle(el => el.closest('.student-card'));
            const statusText = await studentCard.evaluate(el => 
                el.querySelector('.student-status').textContent
            );
            console.log(`📊 學生狀態更新: ${statusText}`);
        }
        
        // 檢查最終狀態
        console.log('🔍 檢查最終狀態...');
        const finalStatus = await page.evaluate(() => {
            const buttons = document.querySelectorAll('.present-btn, .absent-btn');
            return Array.from(buttons).map((btn, index) => ({
                index: index + 1,
                studentId: btn.dataset.studentId,
                disabled: btn.disabled,
                textContent: btn.textContent,
                className: btn.className
            }));
        });
        
        console.log('📊 最終按鈕狀態:', JSON.stringify(finalStatus, null, 2));
        
        // 檢查測試日誌
        const testLog = await page.evaluate(() => {
            const logContainer = document.getElementById('testLog');
            return logContainer ? logContainer.textContent : 'No log found';
        });
        
        console.log('📋 測試日誌:');
        console.log(testLog);
        
        console.log('✅ 自動化測試完成');
        
        // 保持瀏覽器打開5秒以便觀察
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testCheckinButtons().catch(console.error);
