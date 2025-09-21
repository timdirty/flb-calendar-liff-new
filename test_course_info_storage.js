const puppeteer = require('puppeteer');

async function testCourseInfoStorage() {
    console.log('🚀 開始測試課程資訊儲存機制...');
    
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
        
        // 等待課程資訊載入
        await page.waitForTimeout(2000);
        
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
        
        // 檢查儲存的課程資訊
        console.log('🔍 檢查儲存的課程資訊...');
        const storedInfo = await page.evaluate(() => {
            return {
                stored: window.storedCourseInfo || null,
                isStored: typeof window.isCourseInfoStored === 'function' ? window.isCourseInfoStored() : false
            };
        });
        
        console.log('📊 儲存的課程資訊:', storedInfo);
        
        // 切換到講師報表頁面
        console.log('🔄 切換到講師報表頁面...');
        const teacherTab = await page.$('#teacher-attendance-tab');
        if (teacherTab) {
            await teacherTab.click();
            await page.waitForTimeout(1000);
            console.log('✅ 已切換到講師報表頁面');
        }
        
        // 檢查切換後課程資訊是否保持不變
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
        
        // 檢查時間和日期是否保持不變
        const timeUnchanged = initialCourseInfo.time === courseInfoAfterSwitch.time;
        const dateUnchanged = initialCourseInfo.date === courseInfoAfterSwitch.date;
        const teacherUnchanged = initialCourseInfo.teacher === courseInfoAfterSwitch.teacher;
        const courseUnchanged = initialCourseInfo.course === courseInfoAfterSwitch.course;
        
        if (timeUnchanged) {
            console.log('✅ 時間保持不變:', courseInfoAfterSwitch.time);
        } else {
            console.log('❌ 時間發生變化:', initialCourseInfo.time, '->', courseInfoAfterSwitch.time);
        }
        
        if (dateUnchanged) {
            console.log('✅ 日期保持不變:', courseInfoAfterSwitch.date);
        } else {
            console.log('❌ 日期發生變化:', initialCourseInfo.date, '->', courseInfoAfterSwitch.date);
        }
        
        if (teacherUnchanged) {
            console.log('✅ 講師保持不變:', courseInfoAfterSwitch.teacher);
        } else {
            console.log('❌ 講師發生變化:', initialCourseInfo.teacher, '->', courseInfoAfterSwitch.teacher);
        }
        
        if (courseUnchanged) {
            console.log('✅ 課程保持不變:', courseInfoAfterSwitch.course);
        } else {
            console.log('❌ 課程發生變化:', initialCourseInfo.course, '->', courseInfoAfterSwitch.course);
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
        
        // 檢查所有資訊是否都保持不變
        const allUnchanged = initialCourseInfo.time === courseInfoAfterSwitchBack.time &&
                           initialCourseInfo.date === courseInfoAfterSwitchBack.date &&
                           initialCourseInfo.teacher === courseInfoAfterSwitchBack.teacher &&
                           initialCourseInfo.course === courseInfoAfterSwitchBack.course;
        
        if (allUnchanged) {
            console.log('✅ 所有課程資訊在切換模式時都保持不變');
        } else {
            console.log('❌ 部分課程資訊在切換模式時發生變化');
        }
        
        // 等待 3 秒讓用戶查看結果
        console.log('⏳ 等待 3 秒讓用戶查看結果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 課程資訊儲存機制測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testCourseInfoStorage().catch(console.error);
