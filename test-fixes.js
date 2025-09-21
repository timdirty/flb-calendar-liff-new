const puppeteer = require('puppeteer');

async function testFixes() {
    console.log('🚀 開始測試修復：倒數計時居中顯示和按鈕可點擊...');
    
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
        
        // 測試學生簽到按鈕
        console.log('🧪 測試學生簽到按鈕...');
        const presentBtns = await page.$$('.present-btn');
        const absentBtns = await page.$$('.absent-btn');
        
        console.log(`📊 找到 ${presentBtns.length} 個出席按鈕，${absentBtns.length} 個缺席按鈕`);
        
        if (presentBtns.length > 0) {
            const firstPresentBtn = presentBtns[0];
            const btnInfo = await page.evaluate((btn) => {
                const rect = btn.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(btn);
                return {
                    disabled: btn.disabled,
                    pointerEvents: computedStyle.pointerEvents,
                    cursor: computedStyle.cursor,
                    opacity: computedStyle.opacity,
                    rect: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    }
                };
            }, firstPresentBtn);
            
            console.log('📊 出席按鈕狀態:', btnInfo);
            
            if (btnInfo.pointerEvents === 'auto' && !btnInfo.disabled) {
                console.log('✅ 出席按鈕可以點擊');
                
                // 嘗試點擊按鈕
                await firstPresentBtn.click();
                await page.waitForTimeout(1000);
                console.log('✅ 出席按鈕點擊成功');
            } else {
                console.log('❌ 出席按鈕無法點擊');
            }
        }
        
        if (absentBtns.length > 0) {
            const firstAbsentBtn = absentBtns[0];
            const btnInfo = await page.evaluate((btn) => {
                const rect = btn.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(btn);
                return {
                    disabled: btn.disabled,
                    pointerEvents: computedStyle.pointerEvents,
                    cursor: computedStyle.cursor,
                    opacity: computedStyle.opacity,
                    rect: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    }
                };
            }, firstAbsentBtn);
            
            console.log('📊 缺席按鈕狀態:', btnInfo);
            
            if (btnInfo.pointerEvents === 'auto' && !btnInfo.disabled) {
                console.log('✅ 缺席按鈕可以點擊');
                
                // 嘗試點擊按鈕
                await firstAbsentBtn.click();
                await page.waitForTimeout(1000);
                console.log('✅ 缺席按鈕點擊成功');
            } else {
                console.log('❌ 缺席按鈕無法點擊');
            }
        }
        
        // 測試講師報表倒數計時
        console.log('🔄 切換到講師報表頁面...');
        const teacherTab = await page.$('#teacher-attendance-tab');
        if (teacherTab) {
            await teacherTab.click();
            await page.waitForTimeout(1000);
            console.log('✅ 已切換到講師報表頁面');
        }
        
        // 測試倒數計時
        console.log('⏰ 測試倒數計時居中顯示...');
        const courseContent = await page.$('#course-content');
        const teacherModeBtn = await page.$('#teacher-mode-btn');
        
        if (courseContent && teacherModeBtn) {
            // 選擇講師模式
            await teacherModeBtn.click();
            await page.waitForTimeout(500);
            
            // 輸入內容
            await courseContent.click();
            await courseContent.type('測試倒數計時居中顯示');
            
            // 失去焦點觸發倒數
            await page.click('body', { offset: { x: 50, y: 50 } });
            await page.waitForTimeout(1000);
            
            // 檢查倒數提示位置
            const countdownToast = await page.$('.countdown-toast');
            if (countdownToast) {
                const toastPosition = await page.evaluate((toast) => {
                    const rect = toast.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(toast);
                    return {
                        position: computedStyle.position,
                        top: computedStyle.top,
                        left: computedStyle.left,
                        transform: computedStyle.transform,
                        rect: {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height
                        },
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        }
                    };
                }, countdownToast);
                
                console.log('📊 倒數計時位置檢查:', toastPosition);
                
                // 檢查是否在螢幕中央
                const centerX = toastPosition.viewport.width / 2;
                const centerY = toastPosition.viewport.height / 2;
                const toastCenterX = toastPosition.rect.left + (toastPosition.rect.width / 2);
                const toastCenterY = toastPosition.rect.top + (toastPosition.rect.height / 2);
                
                const isCenteredX = Math.abs(toastCenterX - centerX) < 50;
                const isCenteredY = Math.abs(toastCenterY - centerY) < 50;
                
                if (isCenteredX && isCenteredY) {
                    console.log('✅ 倒數計時已居中顯示');
                } else {
                    console.log('❌ 倒數計時未居中顯示');
                    console.log(`預期位置: (${centerX}, ${centerY}), 實際位置: (${toastCenterX}, ${toastCenterY})`);
                }
            } else {
                console.log('❌ 倒數計時未出現');
            }
        }
        
        // 等待自動提交執行
        console.log('⏳ 等待自動提交執行...');
        await page.waitForTimeout(4000);
        
        console.log('⏳ 等待 3 秒讓用戶查看結果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 修復測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testFixes().catch(console.error);
