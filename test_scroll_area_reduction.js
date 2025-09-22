const puppeteer = require('puppeteer');

async function testScrollAreaReduction() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 }, // iPhone X 尺寸
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 375, height: 812 });
    
    try {
        console.log('🚀 開始測試滾動區域縮小...');
        
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
                
                // 檢查透明空白元件的高度
                const transparentBlock = await page.evaluate(() => {
                    const block = document.querySelector('div[style*="height: 100px"][style*="background: transparent"]');
                    if (block) {
                        const rect = block.getBoundingClientRect();
                        const style = window.getComputedStyle(block);
                        return {
                            height: rect.height,
                            styleHeight: style.height,
                            visible: rect.height > 0
                        };
                    }
                    return null;
                });
                
                console.log('📊 透明空白元件資訊:', transparentBlock);
                
                // 檢查滾動容器的狀態
                const scrollInfo = await page.evaluate(() => {
                    const attendanceContent = document.getElementById('attendanceContent');
                    if (attendanceContent) {
                        return {
                            scrollTop: attendanceContent.scrollTop,
                            scrollHeight: attendanceContent.scrollHeight,
                            clientHeight: attendanceContent.clientHeight,
                            canScroll: attendanceContent.scrollHeight > attendanceContent.clientHeight,
                            scrollableDistance: attendanceContent.scrollHeight - attendanceContent.clientHeight
                        };
                    }
                    return null;
                });
                
                console.log('📊 滾動容器狀態:', scrollInfo);
                
                // 測試滾動功能
                await page.evaluate(() => {
                    const attendanceContent = document.getElementById('attendanceContent');
                    if (attendanceContent) {
                        console.log('🔧 測試滾動到底部...');
                        attendanceContent.scrollTop = attendanceContent.scrollHeight;
                        console.log('✅ 滾動完成，scrollTop:', attendanceContent.scrollTop);
                    }
                });
                
                // 等待滾動完成
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 檢查最終滾動狀態
                const finalScrollInfo = await page.evaluate(() => {
                    const attendanceContent = document.getElementById('attendanceContent');
                    if (attendanceContent) {
                        return {
                            scrollTop: attendanceContent.scrollTop,
                            scrollHeight: attendanceContent.scrollHeight,
                            clientHeight: attendanceContent.clientHeight,
                            canScroll: attendanceContent.scrollHeight > attendanceContent.clientHeight,
                            scrollableDistance: attendanceContent.scrollHeight - attendanceContent.clientHeight
                        };
                    }
                    return null;
                });
                
                console.log('📊 最終滾動狀態:', finalScrollInfo);
                
                // 測試結果
                const heightCorrect = transparentBlock && transparentBlock.height === 100;
                const stillScrollable = finalScrollInfo && finalScrollInfo.canScroll;
                
                if (heightCorrect && stillScrollable) {
                    console.log('✅ 滾動區域縮小成功！');
                    console.log(`📏 透明空白元件高度: ${transparentBlock.height}px`);
                    console.log(`📏 可滾動距離: ${finalScrollInfo.scrollableDistance}px`);
                } else {
                    console.log('❌ 滾動區域縮小失敗');
                }
                
                return heightCorrect && stillScrollable;
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

testScrollAreaReduction().then(success => {
    if (success) {
        console.log('🎉 滾動區域縮小成功！');
    } else {
        console.log('💥 滾動區域縮小需要進一步調整');
    }
});

