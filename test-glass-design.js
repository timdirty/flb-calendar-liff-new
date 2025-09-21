const puppeteer = require('puppeteer');

async function testGlassDesign() {
    console.log('🚀 開始測試講師簽到液態玻璃設計...');
    
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
        
        // 檢查液態玻璃效果
        console.log('🔍 檢查液態玻璃設計效果...');
        const designCheck = await page.evaluate(() => {
            const glassCards = document.querySelectorAll('.glass-card');
            const shimmerEffects = document.querySelectorAll('[style*="shimmer"]');
            const backdropFilters = document.querySelectorAll('[style*="backdrop-filter"]');
            
            return {
                glassCardsCount: glassCards.length,
                shimmerEffectsCount: shimmerEffects.length,
                backdropFiltersCount: backdropFilters.length,
                hasShimmerAnimation: document.querySelector('#countdown-styles') !== null
            };
        });
        
        console.log('📊 液態玻璃設計檢查結果:', designCheck);
        
        if (designCheck.glassCardsCount > 0) {
            console.log('✅ 液態玻璃卡片已應用');
        } else {
            console.log('❌ 液態玻璃卡片未找到');
        }
        
        if (designCheck.shimmerEffectsCount > 0) {
            console.log('✅ 光效動畫已應用');
        } else {
            console.log('❌ 光效動畫未找到');
        }
        
        if (designCheck.backdropFiltersCount > 0) {
            console.log('✅ 背景模糊效果已應用');
        } else {
            console.log('❌ 背景模糊效果未找到');
        }
        
        // 測試身份選擇按鈕
        console.log('🧪 測試身份選擇按鈕效果...');
        const teacherModeBtn = await page.$('#teacher-mode-btn');
        if (teacherModeBtn) {
            // 懸停效果測試
            await teacherModeBtn.hover();
            await page.waitForTimeout(500);
            console.log('✅ 講師模式按鈕懸停效果測試完成');
            
            // 點擊效果測試
            await teacherModeBtn.click();
            await page.waitForTimeout(500);
            console.log('✅ 講師模式按鈕點擊效果測試完成');
        }
        
        // 測試助教模式按鈕
        const assistantModeBtn = await page.$('#assistant-mode-btn');
        if (assistantModeBtn) {
            await assistantModeBtn.hover();
            await page.waitForTimeout(500);
            console.log('✅ 助教模式按鈕懸停效果測試完成');
            
            await assistantModeBtn.click();
            await page.waitForTimeout(500);
            console.log('✅ 助教模式按鈕點擊效果測試完成');
        }
        
        // 測試文字輸入框
        console.log('📝 測試文字輸入框效果...');
        const courseContent = await page.$('#course-content');
        if (courseContent) {
            await courseContent.click();
            await courseContent.type('測試液態玻璃設計效果');
            await page.waitForTimeout(500);
            console.log('✅ 文字輸入框焦點效果測試完成');
            
            // 失去焦點觸發自動提交
            await page.click('body', { offset: { x: 50, y: 50 } });
            await page.waitForTimeout(1000);
            console.log('✅ 文字輸入框失去焦點效果測試完成');
        }
        
        // 檢查倒數提示樣式
        console.log('⏰ 檢查倒數提示樣式...');
        const countdownToast = await page.$('.countdown-toast');
        if (countdownToast) {
            const toastStyle = await page.evaluate((toast) => {
                const computedStyle = window.getComputedStyle(toast);
                return {
                    background: computedStyle.background,
                    backdropFilter: computedStyle.backdropFilter,
                    borderRadius: computedStyle.borderRadius,
                    boxShadow: computedStyle.boxShadow,
                    animation: computedStyle.animation
                };
            }, countdownToast);
            
            console.log('📊 倒數提示樣式:', toastStyle);
            console.log('✅ 倒數提示液態玻璃樣式已應用');
        } else {
            console.log('❌ 倒數提示未出現');
        }
        
        // 等待自動提交執行
        console.log('⏳ 等待自動提交執行...');
        await page.waitForTimeout(4000);
        
        // 檢查提交結果
        console.log('🔍 檢查提交結果...');
        const successToast = await page.$('.toast.success');
        if (successToast) {
            const successText = await page.evaluate((toast) => {
                return toast.textContent;
            }, successToast);
            console.log('✅ 提交成功:', successText);
        } else {
            console.log('❌ 未找到成功提示');
        }
        
        console.log('⏳ 等待 5 秒讓用戶查看設計效果...');
        await page.waitForTimeout(5000);
        
        console.log('✅ 液態玻璃設計測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testGlassDesign().catch(console.error);
