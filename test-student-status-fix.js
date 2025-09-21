const puppeteer = require('puppeteer');

async function testStudentStatusFix() {
    console.log('🚀 開始測試學生狀態修復：9/28課程應該顯示未簽到...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // 模擬 iPhone 16 Pro
    await page.emulate({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        viewport: {
            width: 393,
            height: 852,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true
        }
    });
    
    try {
        console.log('🌐 正在載入頁面...');
        await page.goto('http://localhost:3000/perfect-calendar.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('✅ 頁面載入完成');
        
        // 等待課程卡片出現
        console.log('⏳ 等待課程卡片出現...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個課程卡片`);
        
        if (eventCards.length === 0) {
            throw new Error('沒有找到課程卡片');
        }
        
        // 選擇第一個課程卡片
        const firstCard = eventCards[0];
        const cardInfo = await page.evaluate((card) => {
            const instructor = card.querySelector('.instructor-name')?.textContent?.trim();
            const title = card.querySelector('.event-title')?.textContent?.trim();
            const start = card.dataset.start;
            return { instructor, title, start };
        }, firstCard);
        
        console.log('🎯 選擇課程:', cardInfo);
        
        // 長按觸發簽到系統
        console.log('🔋 長按課程卡片觸發簽到系統...');
        const box = await firstCard.boundingBox();
        if (box) {
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            await page.touchscreen.tap(centerX, centerY, { delay: 5000 });
        } else {
            await page.evaluate((card) => {
                card.click();
            }, firstCard);
        }
        
        // 等待簽到模態框出現
        console.log('⏳ 等待簽到模態框出現...');
        await page.waitForSelector('.attendance-modal-content', { timeout: 10000 });
        console.log('✅ 簽到模態框出現');
        
        // 檢查學生狀態
        console.log('🔍 檢查學生狀態...');
        const studentCards = await page.$$('.student-card');
        console.log(`📊 找到 ${studentCards.length} 個學生卡片`);
        
        for (let i = 0; i < studentCards.length; i++) {
            const studentCard = studentCards[i];
            const studentInfo = await page.evaluate((card) => {
                const name = card.querySelector('.student-name')?.textContent?.trim();
                const status = card.querySelector('.status-tag')?.textContent?.trim();
                const presentBtn = card.querySelector('.present-btn');
                const absentBtn = card.querySelector('.absent-btn');
                
                return {
                    name,
                    status,
                    presentBtnText: presentBtn?.textContent?.trim(),
                    absentBtnText: absentBtn?.textContent?.trim(),
                    presentBtnDisabled: presentBtn?.disabled,
                    absentBtnDisabled: absentBtn?.disabled
                };
            }, studentCard);
            
            console.log(`👤 學生 ${i + 1}:`, studentInfo);
            
            // 檢查狀態是否正確
            if (studentInfo.status && studentInfo.status.includes('已出席')) {
                console.log(`❌ 學生 ${studentInfo.name} 顯示為已出席，但應該是待簽到`);
            } else if (studentInfo.status && studentInfo.status.includes('待簽到')) {
                console.log(`✅ 學生 ${studentInfo.name} 狀態正確：待簽到`);
            } else {
                console.log(`⚠️ 學生 ${studentInfo.name} 狀態未知：${studentInfo.status}`);
            }
        }
        
        // 檢查控制台日誌中的課程日期信息
        console.log('🔍 檢查控制台日誌...');
        const logs = await page.evaluate(() => {
            return window.console.logs || [];
        });
        
        const courseDateLogs = logs.filter(log => log.includes('課程日期:'));
        if (courseDateLogs.length > 0) {
            console.log('📅 課程日期日誌:', courseDateLogs);
        }
        
        // 等待 3 秒讓用戶查看結果
        console.log('⏳ 等待 3 秒讓用戶查看結果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 學生狀態修復測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testStudentStatusFix().catch(console.error);
