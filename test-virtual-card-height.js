const puppeteer = require('puppeteer');

async function testVirtualCardHeight() {
    console.log('🚀 開始測試虛擬學生卡片高度修改：從550px減半到275px...');
    
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
        
        // 檢查虛擬學生卡片高度
        console.log('🔍 檢查虛擬學生卡片高度...');
        const virtualCard = await page.$('.virtual-student-card');
        if (virtualCard) {
            const cardInfo = await page.evaluate((card) => {
                const computedStyle = window.getComputedStyle(card);
                const rect = card.getBoundingClientRect();
                return {
                    height: computedStyle.height,
                    minHeight: computedStyle.minHeight,
                    maxHeight: computedStyle.maxHeight,
                    rect: {
                        height: rect.height,
                        width: rect.width
                    },
                    styleHeight: card.style.height,
                    styleMinHeight: card.style.minHeight,
                    styleMaxHeight: card.style.maxHeight
                };
            }, virtualCard);
            
            console.log('📊 虛擬學生卡片高度信息:', cardInfo);
            
            // 檢查高度是否為275px
            const expectedHeight = '275px';
            if (cardInfo.height === expectedHeight || cardInfo.styleHeight === expectedHeight) {
                console.log('✅ 虛擬學生卡片高度已正確設置為275px');
            } else {
                console.log(`❌ 虛擬學生卡片高度未正確設置，當前高度: ${cardInfo.height}, 樣式高度: ${cardInfo.styleHeight}`);
            }
            
            // 檢查min-height和max-height
            if (cardInfo.minHeight === expectedHeight || cardInfo.styleMinHeight === expectedHeight) {
                console.log('✅ 虛擬學生卡片min-height已正確設置為275px');
            } else {
                console.log(`❌ 虛擬學生卡片min-height未正確設置，當前: ${cardInfo.minHeight}, 樣式: ${cardInfo.styleMinHeight}`);
            }
            
            if (cardInfo.maxHeight === expectedHeight || cardInfo.styleMaxHeight === expectedHeight) {
                console.log('✅ 虛擬學生卡片max-height已正確設置為275px');
            } else {
                console.log(`❌ 虛擬學生卡片max-height未正確設置，當前: ${cardInfo.maxHeight}, 樣式: ${cardInfo.styleMaxHeight}`);
            }
        } else {
            console.log('❌ 未找到虛擬學生卡片');
        }
        
        // 檢查學生列表滾動功能
        console.log('🔍 檢查學生列表滾動功能...');
        const studentsList = await page.$('#studentsList');
        if (studentsList) {
            const scrollInfo = await page.evaluate((list) => {
                return {
                    scrollHeight: list.scrollHeight,
                    clientHeight: list.clientHeight,
                    canScroll: list.scrollHeight > list.clientHeight
                };
            }, studentsList);
            
            console.log('📊 學生列表滾動信息:', scrollInfo);
            
            if (scrollInfo.canScroll) {
                console.log('✅ 學生列表可以滾動');
            } else {
                console.log('❌ 學生列表無法滾動');
            }
        }
        
        // 等待 3 秒讓用戶查看結果
        console.log('⏳ 等待 3 秒讓用戶查看結果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 虛擬學生卡片高度修改測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testVirtualCardHeight().catch(console.error);
