const puppeteer = require('puppeteer');

async function testScrollAreaExtension() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 }, // iPhone X 尺寸
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 375, height: 812 });
    
    try {
        console.log('🚀 開始測試滾動區域擴展...');
        
        // 導航到頁面
        await page.goto('http://localhost:3000/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 點擊今日按鈕
        await page.click('button[data-view="today"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 找到一個課程並點擊
        const courseCards = await page.$$('.event-card');
        if (courseCards.length > 0) {
            await courseCards[0].click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 等待標籤出現並切換到講師簽到標籤
            await page.waitForSelector('[data-tab="teacher-attendance"]', { timeout: 10000 });
            const teacherTab = await page.$('[data-tab="teacher-attendance"]');
            if (teacherTab) {
                await teacherTab.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 檢查滾動容器的狀態
                const scrollInfo = await page.evaluate(() => {
                    const modalContent = document.querySelector('.attendance-modal-content');
                    if (modalContent) {
                        return {
                            scrollTop: modalContent.scrollTop,
                            scrollHeight: modalContent.scrollHeight,
                            clientHeight: modalContent.clientHeight,
                            canScroll: modalContent.scrollHeight > modalContent.clientHeight,
                            scrollableDistance: modalContent.scrollHeight - modalContent.clientHeight
                        };
                    }
                    return null;
                });
                
                console.log('📊 滾動容器狀態:', scrollInfo);
                
                // 嘗試滾動到底部
                await page.evaluate(() => {
                    const modalContent = document.querySelector('.attendance-modal-content');
                    if (modalContent) {
                        console.log('🔧 滾動到底部...');
                        modalContent.scrollTop = modalContent.scrollHeight;
                        console.log('✅ 滾動完成，scrollTop:', modalContent.scrollTop);
                    }
                });
                
                // 等待滾動完成
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 再次檢查滾動狀態
                const finalScrollInfo = await page.evaluate(() => {
                    const modalContent = document.querySelector('.attendance-modal-content');
                    if (modalContent) {
                        return {
                            scrollTop: modalContent.scrollTop,
                            scrollHeight: modalContent.scrollHeight,
                            clientHeight: modalContent.clientHeight,
                            canScroll: modalContent.scrollHeight > modalContent.clientHeight,
                            scrollableDistance: modalContent.scrollHeight - modalContent.clientHeight
                        };
                    }
                    return null;
                });
                
                console.log('📊 滾動後狀態:', finalScrollInfo);
                
                // 檢查是否有300px的透明區塊
                const transparentBlock = await page.evaluate(() => {
                    const blocks = document.querySelectorAll('div[style*="height: 300px"][style*="background: transparent"]');
                    return blocks.length > 0;
                });
                
                console.log('📊 找到300px透明區塊:', transparentBlock);
                
                // 測試結果
                if (finalScrollInfo && finalScrollInfo.scrollableDistance > 200) {
                    console.log('✅ 滾動區域已成功擴展！');
                    console.log(`📏 可滾動距離: ${finalScrollInfo.scrollableDistance}px`);
                } else {
                    console.log('❌ 滾動區域擴展不足');
                }
                
                return finalScrollInfo && finalScrollInfo.scrollableDistance > 200;
            } else {
                console.log('❌ 找不到講師簽到標籤');
                return false;
            }
        } else {
            console.log('❌ 找不到課程卡片');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
        return false;
    } finally {
        await browser.close();
    }
}

testScrollAreaExtension().then(success => {
    if (success) {
        console.log('🎉 測試通過：滾動區域已成功擴展！');
    } else {
        console.log('💥 測試失敗：滾動區域擴展不足');
    }
});
