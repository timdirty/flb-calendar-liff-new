const puppeteer = require('puppeteer');

async function testLoadingFix() {
    console.log('🚀 開始測試載入中問題修復...');
    
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
        
        // 等待學生資料載入
        await page.waitForTimeout(3000);
        
        // 檢查課程資訊是否正確顯示
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
        
        // 檢查是否還有"載入中"的問題
        const hasLoadingIssue = courseInfo.time === '載入中...' || courseInfo.date === '載入中...';
        
        if (hasLoadingIssue) {
            console.log('❌ 仍然存在載入中問題');
            console.log('🔍 時間:', courseInfo.time);
            console.log('🔍 日期:', courseInfo.date);
            
            // 檢查 storedCourseInfo 狀態
            const storedInfo = await page.evaluate(() => {
                return window.storedCourseInfo || '未找到';
            });
            console.log('🔍 storedCourseInfo:', storedInfo);
        } else {
            console.log('✅ 載入中問題已修復');
            console.log('✅ 時間:', courseInfo.time);
            console.log('✅ 日期:', courseInfo.date);
            console.log('✅ 講師:', courseInfo.teacher);
            console.log('✅ 課程:', courseInfo.course);
        }
        
        // 測試切換到講師報表
        console.log('🔄 測試切換到講師報表...');
        await page.click('#teacher-attendance-tab');
        await page.waitForTimeout(1000);
        
        // 檢查講師報表的課程資訊
        const teacherReportInfo = await page.evaluate(() => {
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
        
        console.log('📊 講師報表課程資訊:', teacherReportInfo);
        
        // 測試切換回學生簽到
        console.log('🔄 測試切換回學生簽到...');
        await page.click('#student-attendance-tab');
        await page.waitForTimeout(1000);
        
        // 檢查學生簽到的課程資訊
        const studentReportInfo = await page.evaluate(() => {
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
        
        console.log('📊 學生簽到課程資訊:', studentReportInfo);
        
        // 等待 3 秒讓用戶查看結果
        console.log('⏳ 等待 3 秒讓用戶查看結果...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 載入中問題修復測試完成');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 運行測試
testLoadingFix().catch(console.error);
