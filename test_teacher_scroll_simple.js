const puppeteer = require('puppeteer');

async function testTeacherScrollSimple() {
    console.log('🧪 開始簡單測試講師簽到滾動修復...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 設置用戶代理為手機
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
        
        // 捕獲控制台日誌
        page.on('console', msg => {
            if (msg.type() === 'log') {
                console.log('📱 頁面日誌:', msg.text());
            }
        });
        
        console.log('📱 導航到頁面...');
        await page.goto('http://localhost:3001/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔍 尋找課程卡片...');
        // 等待課程卡片出現
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        // 找到第一個課程卡片
        const courseCards = await page.$$('.event-card');
        if (courseCards.length === 0) {
            throw new Error('找不到課程卡片');
        }
        
        console.log(`📚 找到 ${courseCards.length} 個課程卡片`);
        
        // 長按第一個課程卡片
        const firstCard = courseCards[0];
        console.log('👆 長按課程卡片...');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            // 模擬長按
            const touchStart = new TouchEvent('touchstart', {
                touches: [new Touch({
                    identifier: 1,
                    target: card,
                    clientX: x,
                    clientY: y
                })]
            });
            
            card.dispatchEvent(touchStart);
        }, firstCard);
        
        // 等待長按觸發
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔄 切換到講師簽到標籤...');
        // 點擊講師簽到標籤
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查控制台日誌
        const logs = await page.evaluate(() => {
            return window.console.logs || [];
        });
        console.log('📊 控制台日誌:', logs.slice(-10));
        
        // 等待導航器載入
        await page.waitForSelector('.floating-navigator', { timeout: 5000 });
        
        console.log('🔍 檢查講師簽到頁面結構...');
        
        // 檢查講師簽到內容的結構
        const structureInfo = await page.evaluate(() => {
            // 檢查attendanceContent的內容
            const attendanceContent = document.getElementById('attendanceContent');
            const attendanceContentHTML = attendanceContent ? attendanceContent.innerHTML : '';
            
            // 檢查是否有講師簽到相關的內容
            const hasTeacherContent = attendanceContentHTML.includes('講師模式') || 
                                    attendanceContentHTML.includes('助教模式') ||
                                    attendanceContentHTML.includes('提交講師報表');
            
            // 檢查是否有透明空白元件
            const hasSpacer = attendanceContentHTML.includes('透明空白元件') ||
                            attendanceContentHTML.includes('height: 100px');
            
            return {
                attendanceContentHTML: attendanceContentHTML.substring(0, 200) + '...',
                hasTeacherContent,
                hasSpacer,
                attendanceContentLength: attendanceContentHTML.length
            };
        });
        
        console.log('📊 內容檢查結果:', structureInfo);
        
        // 檢查講師簽到內容的結構
        const structureInfo2 = await page.evaluate(() => {
            const attendanceContent = document.getElementById('attendanceContent');
            const teacherContent = document.querySelector('.teacher-attendance-content');
            const scrollContainer = document.querySelector('div[style*="overflow-y: auto"]');
            
            return {
                attendanceContent: {
                    found: !!attendanceContent,
                    height: attendanceContent ? window.getComputedStyle(attendanceContent).height : null,
                    display: attendanceContent ? window.getComputedStyle(attendanceContent).display : null,
                    flexDirection: attendanceContent ? window.getComputedStyle(attendanceContent).flexDirection : null
                },
                teacherContent: {
                    found: !!teacherContent,
                    opacity: teacherContent ? window.getComputedStyle(teacherContent).opacity : null
                },
                scrollContainer: {
                    found: !!scrollContainer,
                    maxHeight: scrollContainer ? window.getComputedStyle(scrollContainer).maxHeight : null,
                    minHeight: scrollContainer ? window.getComputedStyle(scrollContainer).minHeight : null,
                    overflowY: scrollContainer ? window.getComputedStyle(scrollContainer).overflowY : null
                }
            };
        });
        
        console.log('📊 結構檢查結果:', structureInfo);
        
        // 檢查滾動功能
        console.log('🔄 測試滾動功能...');
        
        const scrollTest = await page.evaluate(() => {
            const scrollContainer = document.querySelector('div[style*="overflow-y: auto"]');
            if (!scrollContainer) {
                return { success: false, error: '找不到滾動容器' };
            }
            
            const initialScrollTop = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight;
            const clientHeight = scrollContainer.clientHeight;
            
            // 嘗試滾動
            scrollContainer.scrollTop = 100;
            const afterScrollTop = scrollContainer.scrollTop;
            
            return {
                success: true,
                initialScrollTop,
                afterScrollTop,
                scrollHeight,
                clientHeight,
                canScroll: scrollHeight > clientHeight,
                scrollWorked: afterScrollTop !== initialScrollTop,
                heightDifference: scrollHeight - clientHeight
            };
        });
        
        console.log('📊 滾動測試結果:', scrollTest);
        
        if (!scrollTest.success) {
            throw new Error(scrollTest.error);
        }
        
        if (scrollTest.scrollWorked) {
            console.log('✅ 滾動功能正常！');
        } else {
            console.log('⚠️ 滾動沒有生效');
            if (scrollTest.heightDifference <= 0) {
                console.log('   原因：內容高度不足，無法觸發滾動');
            }
        }
        
        // 檢查透明空白元件
        console.log('🔍 檢查透明空白元件...');
        
        const spacerTest = await page.evaluate(() => {
            // 嘗試多種選擇器
            const spacers1 = document.querySelectorAll('div[style*="height: 100px"][style*="background: transparent"]');
            const spacers2 = document.querySelectorAll('div[style*="height: 100px"]');
            const spacers3 = document.querySelectorAll('div[style*="透明空白元件"]');
            
            // 檢查所有div元素
            const allDivs = document.querySelectorAll('div');
            let spacerDivs = [];
            allDivs.forEach(div => {
                const style = div.getAttribute('style') || '';
                if (style.includes('height: 100px') && style.includes('background: transparent')) {
                    spacerDivs.push(div);
                }
            });
            
            return {
                found: spacers1.length > 0 || spacerDivs.length > 0,
                count: spacers1.length + spacerDivs.length,
                spacers1: spacers1.length,
                spacers2: spacers2.length,
                spacers3: spacers3.length,
                spacerDivs: spacerDivs.length,
                allDivsCount: allDivs.length
            };
        });
        
        console.log('📊 透明空白元件檢查:', spacerTest);
        
        if (spacerTest.found) {
            console.log(`✅ 找到 ${spacerTest.count} 個透明空白元件`);
        } else {
            console.log('❌ 沒有找到透明空白元件');
        }
        
        console.log('🎉 講師簽到滾動簡單測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testTeacherScrollSimple().then(success => {
    if (success) {
        console.log('✅ 測試完成！');
        process.exit(0);
    } else {
        console.log('❌ 測試失敗！');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 測試執行錯誤:', error);
    process.exit(1);
});
