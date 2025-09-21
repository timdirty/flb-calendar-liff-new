const puppeteer = require('puppeteer');

async function testGlassNotifications() {
    console.log('🚀 開始測試液態玻璃通知樣式...');
    
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
        
        // 切換到講師報表頁面
        console.log('🔄 切換到講師報表頁面...');
        const teacherTab = await page.$('#teacher-attendance-tab');
        if (teacherTab) {
            await teacherTab.click();
            await page.waitForTimeout(1000);
            console.log('✅ 已切換到講師報表頁面');
        }
        
        // 測試倒數提示樣式
        console.log('⏰ 測試倒數提示樣式...');
        const courseContent = await page.$('#course-content');
        const teacherModeBtn = await page.$('#teacher-mode-btn');
        
        if (courseContent && teacherModeBtn) {
            // 選擇講師模式
            await teacherModeBtn.click();
            await page.waitForTimeout(500);
            
            // 輸入內容
            await courseContent.click();
            await courseContent.type('測試液態玻璃通知樣式');
            
            // 失去焦點觸發倒數
            await page.click('body', { offset: { x: 50, y: 50 } });
            await page.waitForTimeout(1000);
            
            // 檢查倒數提示
            const countdownToast = await page.$('.countdown-toast');
            if (countdownToast) {
                const toastStyle = await page.evaluate((toast) => {
                    const computedStyle = window.getComputedStyle(toast);
                    const rect = toast.getBoundingClientRect();
                    return {
                        position: {
                            top: computedStyle.top,
                            left: computedStyle.left,
                            transform: computedStyle.transform
                        },
                        background: computedStyle.background,
                        backdropFilter: computedStyle.backdropFilter,
                        borderRadius: computedStyle.borderRadius,
                        boxShadow: computedStyle.boxShadow,
                        animation: computedStyle.animation,
                        rect: {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height
                        }
                    };
                }, countdownToast);
                
                console.log('📊 倒數提示樣式檢查:', toastStyle);
                
                // 檢查是否在螢幕中央
                const isCentered = Math.abs(parseFloat(toastStyle.rect.left) - 196.5) < 50; // 393/2 = 196.5
                if (isCentered) {
                    console.log('✅ 倒數提示已居中顯示');
                } else {
                    console.log('❌ 倒數提示未居中顯示');
                }
                
                // 檢查液態玻璃效果
                if (toastStyle.backdropFilter && toastStyle.backdropFilter !== 'none') {
                    console.log('✅ 液態玻璃背景模糊效果已應用');
                } else {
                    console.log('❌ 液態玻璃背景模糊效果未應用');
                }
            } else {
                console.log('❌ 倒數提示未出現');
            }
        }
        
        // 等待自動提交執行
        console.log('⏳ 等待自動提交執行...');
        await page.waitForTimeout(4000);
        
        // 檢查提交結果通知
        console.log('🔍 檢查提交結果通知樣式...');
        const successToast = await page.$('.glass-toast');
        if (successToast) {
            const toastStyle = await page.evaluate((toast) => {
                const computedStyle = window.getComputedStyle(toast);
                return {
                    background: computedStyle.background,
                    backdropFilter: computedStyle.backdropFilter,
                    borderRadius: computedStyle.borderRadius,
                    boxShadow: computedStyle.boxShadow,
                    animation: computedStyle.animation,
                    className: toast.className
                };
            }, successToast);
            
            console.log('📊 提交結果通知樣式:', toastStyle);
            
            if (toastStyle.className === 'glass-toast') {
                console.log('✅ 提交結果通知使用液態玻璃樣式');
            } else {
                console.log('❌ 提交結果通知未使用液態玻璃樣式');
            }
            
            if (toastStyle.backdropFilter && toastStyle.backdropFilter !== 'none') {
                console.log('✅ 提交結果通知背景模糊效果已應用');
            } else {
                console.log('❌ 提交結果通知背景模糊效果未應用');
            }
        } else {
            console.log('❌ 提交結果通知未找到');
        }
        
        // 測試不同類型的通知
        console.log('🧪 測試不同類型的通知樣式...');
        await page.evaluate(() => {
            showToast('成功通知測試', 'success');
        });
        await page.waitForTimeout(1000);
        
        await page.evaluate(() => {
            showToast('錯誤通知測試', 'error');
        });
        await page.waitForTimeout(1000);
        
        await page.evaluate(() => {
            showToast('資訊通知測試', 'info');
        });
        await page.waitForTimeout(1000);
        
        await page.evaluate(() => {
            showToast('警告通知測試', 'warning');
        });
        await page.waitForTimeout(1000);
        
        console.log('⏳ 等待 3 秒讓用戶查看通知效果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 液態玻璃通知樣式測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testGlassNotifications().catch(console.error);
