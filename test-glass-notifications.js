const puppeteer = require('puppeteer');

async function testGlassNotifications() {
    console.log('🚀 開始測試液態玻璃通知：載入動畫、提交結果、時間日期修復...');
    
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
        
        // 檢查初始課程資訊顯示
        console.log('🔍 檢查初始課程資訊顯示...');
        const initialCourseInfo = await page.evaluate(() => {
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');
            const teacherElement = document.getElementById('currentTeacher');
            const courseElement = document.getElementById('currentCourse');
            
            return {
                time: timeElement ? timeElement.textContent : '未找到',
                date: dateElement ? dateElement.textContent : '未找到',
                teacher: teacherElement ? teacherElement.textContent : '未找到',
                course: courseElement ? courseElement.textContent : '未找到'
            };
        });
        
        console.log('📊 初始課程資訊:', initialCourseInfo);
        
        // 切換到講師報表頁面
        console.log('🔄 切換到講師報表頁面...');
        const teacherTab = await page.$('#teacher-attendance-tab');
        if (teacherTab) {
            await teacherTab.click();
            await page.waitForTimeout(1000);
            console.log('✅ 已切換到講師報表頁面');
        }
        
        // 檢查切換後課程資訊是否仍然正確
        console.log('🔍 檢查切換後課程資訊...');
        const courseInfoAfterSwitch = await page.evaluate(() => {
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');
            const teacherElement = document.getElementById('currentTeacher');
            const courseElement = document.getElementById('currentCourse');
            
            return {
                time: timeElement ? timeElement.textContent : '未找到',
                date: dateElement ? dateElement.textContent : '未找到',
                teacher: teacherElement ? teacherElement.textContent : '未找到',
                course: courseElement ? courseElement.textContent : '未找到'
            };
        });
        
        console.log('📊 切換後課程資訊:', courseInfoAfterSwitch);
        
        // 檢查時間和日期是否在切換後仍然正確
        if (courseInfoAfterSwitch.time && courseInfoAfterSwitch.time !== '載入中...' && courseInfoAfterSwitch.time !== '未找到') {
            console.log('✅ 切換後時間顯示正確:', courseInfoAfterSwitch.time);
        } else {
            console.log('❌ 切換後時間顯示有問題:', courseInfoAfterSwitch.time);
        }
        
        if (courseInfoAfterSwitch.date && courseInfoAfterSwitch.date !== '載入中...' && courseInfoAfterSwitch.date !== '未找到') {
            console.log('✅ 切換後日期顯示正確:', courseInfoAfterSwitch.date);
        } else {
            console.log('❌ 切換後日期顯示有問題:', courseInfoAfterSwitch.date);
        }
        
        // 切換回學生簽到頁面
        console.log('🔄 切換回學生簽到頁面...');
        const studentTab = await page.$('#student-attendance-tab');
        if (studentTab) {
            await studentTab.click();
            await page.waitForTimeout(1000);
            console.log('✅ 已切換回學生簽到頁面');
        }
        
        // 檢查切換回學生簽到後的課程資訊
        console.log('🔍 檢查切換回學生簽到後的課程資訊...');
        const courseInfoAfterSwitchBack = await page.evaluate(() => {
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');
            const teacherElement = document.getElementById('currentTeacher');
            const courseElement = document.getElementById('currentCourse');
            
            return {
                time: timeElement ? timeElement.textContent : '未找到',
                date: dateElement ? dateElement.textContent : '未找到',
                teacher: teacherElement ? teacherElement.textContent : '未找到',
                course: courseElement ? courseElement.textContent : '未找到'
            };
        });
        
        console.log('📊 切換回學生簽到後課程資訊:', courseInfoAfterSwitchBack);
        
        // 檢查時間和日期是否在切換回學生簽到後仍然正確
        if (courseInfoAfterSwitchBack.time && courseInfoAfterSwitchBack.time !== '載入中...' && courseInfoAfterSwitchBack.time !== '未找到') {
            console.log('✅ 切換回學生簽到後時間顯示正確:', courseInfoAfterSwitchBack.time);
        } else {
            console.log('❌ 切換回學生簽到後時間顯示有問題:', courseInfoAfterSwitchBack.time);
        }
        
        if (courseInfoAfterSwitchBack.date && courseInfoAfterSwitchBack.date !== '載入中...' && courseInfoAfterSwitchBack.date !== '未找到') {
            console.log('✅ 切換回學生簽到後日期顯示正確:', courseInfoAfterSwitchBack.date);
        } else {
            console.log('❌ 切換回學生簽到後日期顯示有問題:', courseInfoAfterSwitchBack.date);
        }
        
        // 再次切換到講師報表頁面測試通知樣式
        console.log('🔄 再次切換到講師報表頁面測試通知樣式...');
        if (teacherTab) {
            await teacherTab.click();
            await page.waitForTimeout(1000);
        }
        
        // 測試倒數計時和提交功能
        console.log('🧪 測試倒數計時和提交功能...');
        
        // 1. 輸入內容
        console.log('1️⃣ 輸入內容...');
        const courseContent = await page.$('#course-content');
        if (courseContent) {
            await courseContent.click();
            await courseContent.type('測試液態玻璃通知');
            await page.waitForTimeout(500);
            console.log('✅ 已輸入內容');
        }
        
        // 2. 選擇講師模式
        console.log('2️⃣ 選擇講師模式...');
        const teacherModeBtn = await page.$('#teacher-mode-btn');
        if (teacherModeBtn) {
            await teacherModeBtn.click();
            await page.waitForTimeout(500);
            console.log('✅ 已選擇講師模式');
        }
        
        // 3. 失去焦點觸發倒數
        console.log('3️⃣ 失去焦點觸發倒數...');
        await page.click('body', { offset: { x: 50, y: 50 } });
        await page.waitForTimeout(1000);
        
        // 檢查倒數提示樣式
        const countdownToast = await page.$('.countdown-toast');
        if (countdownToast) {
            const toastStyle = await page.evaluate((toast) => {
                const computedStyle = window.getComputedStyle(toast);
                return {
                    background: computedStyle.background,
                    backdropFilter: computedStyle.backdropFilter,
                    borderRadius: computedStyle.borderRadius,
                    boxShadow: computedStyle.boxShadow,
                    border: computedStyle.border
                };
            }, countdownToast);
            
            console.log('📊 倒數計時樣式:', toastStyle);
            
            // 檢查是否為液態玻璃質感
            const hasGlassEffect = toastStyle.backdropFilter && toastStyle.backdropFilter !== 'none';
            const hasTransparentBackground = toastStyle.background.includes('rgba') && toastStyle.background.includes('0.1');
            const hasRoundedCorners = toastStyle.borderRadius === '25px';
            const hasShadow = toastStyle.boxShadow && toastStyle.boxShadow !== 'none';
            const hasBorder = toastStyle.border && toastStyle.border !== 'none';
            
            if (hasGlassEffect && hasTransparentBackground && hasRoundedCorners && hasShadow && hasBorder) {
                console.log('✅ 倒數計時通知已設為液態玻璃質感');
            } else {
                console.log('❌ 倒數計時通知未設為液態玻璃質感');
            }
        } else {
            console.log('❌ 倒數計時未出現');
        }
        
        // 等待自動提交執行
        console.log('⏳ 等待自動提交執行...');
        await page.waitForTimeout(4000);
        
        // 檢查載入動畫樣式
        const loadingToast = await page.$('.loading-toast');
        if (loadingToast) {
            const loadingStyle = await page.evaluate((toast) => {
                const computedStyle = window.getComputedStyle(toast);
                return {
                    background: computedStyle.background,
                    backdropFilter: computedStyle.backdropFilter,
                    borderRadius: computedStyle.borderRadius,
                    boxShadow: computedStyle.boxShadow,
                    border: computedStyle.border
                };
            }, loadingToast);
            
            console.log('📊 載入動畫樣式:', loadingStyle);
            
            // 檢查是否為液態玻璃質感
            const hasGlassEffect = loadingStyle.backdropFilter && loadingStyle.backdropFilter !== 'none';
            const hasTransparentBackground = loadingStyle.background.includes('rgba') && loadingStyle.background.includes('0.15');
            const hasRoundedCorners = loadingStyle.borderRadius === '25px';
            const hasShadow = loadingStyle.boxShadow && loadingStyle.boxShadow !== 'none';
            const hasBorder = loadingStyle.border && loadingStyle.border !== 'none';
            
            if (hasGlassEffect && hasTransparentBackground && hasRoundedCorners && hasShadow && hasBorder) {
                console.log('✅ 載入動畫已設為液態玻璃質感');
            } else {
                console.log('❌ 載入動畫未設為液態玻璃質感');
            }
        } else {
            console.log('❌ 載入動畫未顯示');
        }
        
        // 檢查提交結果通知樣式
        const centerToast = await page.$('.center-toast');
        if (centerToast) {
            const resultStyle = await page.evaluate((toast) => {
                const computedStyle = window.getComputedStyle(toast);
                return {
                    background: computedStyle.background,
                    backdropFilter: computedStyle.backdropFilter,
                    borderRadius: computedStyle.borderRadius,
                    boxShadow: computedStyle.boxShadow,
                    border: computedStyle.border
                };
            }, centerToast);
            
            console.log('📊 提交結果通知樣式:', resultStyle);
            
            // 檢查是否為液態玻璃質感
            const hasGlassEffect = resultStyle.backdropFilter && resultStyle.backdropFilter !== 'none';
            const hasTransparentBackground = resultStyle.background.includes('rgba') && resultStyle.background.includes('0.15');
            const hasRoundedCorners = resultStyle.borderRadius === '25px';
            const hasShadow = resultStyle.boxShadow && resultStyle.boxShadow !== 'none';
            const hasBorder = resultStyle.border && resultStyle.border !== 'none';
            
            if (hasGlassEffect && hasTransparentBackground && hasRoundedCorners && hasShadow && hasBorder) {
                console.log('✅ 提交結果通知已設為液態玻璃質感');
            } else {
                console.log('❌ 提交結果通知未設為液態玻璃質感');
            }
        } else {
            console.log('❌ 提交結果通知未出現');
        }
        
        // 等待 3 秒讓用戶查看結果
        console.log('⏳ 等待 3 秒讓用戶查看結果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 液態玻璃通知測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testGlassNotifications().catch(console.error);