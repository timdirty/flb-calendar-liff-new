const puppeteer = require('puppeteer');

async function testNotificationFixes() {
    console.log('🚀 開始測試通知修復：透明倒數計時、載入動畫、居中通知、時間日期修復...');
    
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
        
        // 檢查課程資訊顯示
        console.log('🔍 檢查課程資訊顯示...');
        const courseInfo = await page.evaluate(() => {
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
        
        console.log('📊 課程資訊:', courseInfo);
        
        // 檢查時間和日期是否正確顯示
        if (courseInfo.time && courseInfo.time !== '載入中...' && courseInfo.time !== '未找到') {
            console.log('✅ 時間顯示正確:', courseInfo.time);
        } else {
            console.log('❌ 時間顯示有問題:', courseInfo.time);
        }
        
        if (courseInfo.date && courseInfo.date !== '載入中...' && courseInfo.date !== '未找到') {
            console.log('✅ 日期顯示正確:', courseInfo.date);
        } else {
            console.log('❌ 日期顯示有問題:', courseInfo.date);
        }
        
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
        
        // 測試倒數計時和提交功能
        console.log('🧪 測試倒數計時和提交功能...');
        
        // 1. 選擇講師模式
        console.log('1️⃣ 選擇講師模式...');
        const teacherModeBtn = await page.$('#teacher-mode-btn');
        if (teacherModeBtn) {
            await teacherModeBtn.click();
            await page.waitForTimeout(500);
            console.log('✅ 已選擇講師模式');
        }
        
        // 2. 輸入內容觸發倒數
        console.log('2️⃣ 輸入內容觸發倒數...');
        const courseContent = await page.$('#course-content');
        if (courseContent) {
            await courseContent.click();
            await courseContent.type('測試通知修復');
            await page.waitForTimeout(500);
            
            // 失去焦點觸發倒數
            await page.click('body', { offset: { x: 50, y: 50 } });
            await page.waitForTimeout(1000);
            
            // 檢查倒數提示是否出現
            const countdownToast = await page.$('.countdown-toast');
            if (countdownToast) {
                const toastStyle = await page.evaluate((toast) => {
                    const computedStyle = window.getComputedStyle(toast);
                    return {
                        background: computedStyle.background,
                        backdropFilter: computedStyle.backdropFilter,
                        position: computedStyle.position,
                        top: computedStyle.top,
                        left: computedStyle.left,
                        transform: computedStyle.transform
                    };
                }, countdownToast);
                
                console.log('📊 倒數計時樣式:', toastStyle);
                
                if (toastStyle.background === 'transparent' || toastStyle.background === 'rgba(0, 0, 0, 0)') {
                    console.log('✅ 倒數計時通知已設為透明');
                } else {
                    console.log('❌ 倒數計時通知未設為透明');
                }
            } else {
                console.log('❌ 倒數計時未出現');
            }
        }
        
        // 等待自動提交執行
        console.log('⏳ 等待自動提交執行...');
        await page.waitForTimeout(4000);
        
        // 檢查載入動畫和提交結果
        const loadingToast = await page.$('.loading-toast');
        if (loadingToast) {
            console.log('✅ 載入動畫已顯示');
        } else {
            console.log('❌ 載入動畫未顯示');
        }
        
        // 檢查提交結果通知
        const centerToast = await page.$('.center-toast');
        if (centerToast) {
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
                    }
                };
            }, centerToast);
            
            console.log('📊 提交結果通知位置:', toastPosition);
            
            // 檢查是否在螢幕中央
            const isCentered = Math.abs(parseFloat(toastPosition.rect.left) - 196.5) < 50; // 393/2 = 196.5
            if (isCentered) {
                console.log('✅ 提交結果通知已居中顯示');
            } else {
                console.log('❌ 提交結果通知未居中顯示');
            }
        } else {
            console.log('❌ 提交結果通知未出現');
        }
        
        // 等待 3 秒讓用戶查看結果
        console.log('⏳ 等待 3 秒讓用戶查看結果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 通知修復測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testNotificationFixes().catch(console.error);
