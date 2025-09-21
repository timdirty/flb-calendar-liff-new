const puppeteer = require('puppeteer');

async function testStudentAttendanceSwitchFix() {
    console.log('🧪 開始測試學生簽到系統切換修復...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        // 設置控制台日誌捕獲
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'log' && (text.includes('學生簽到') || text.includes('講師簽到') || text.includes('originalStudentContent') || text.includes('恢復'))) {
                console.log(`[${type.toUpperCase()}] ${text}`);
            }
        });
        
        console.log('📱 載入頁面...');
        await page.goto('http://localhost:3001/perfect-calendar.html', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log('⏳ 等待頁面初始化...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 等待課程卡片出現
        console.log('🔍 尋找課程卡片...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        // 長按第一個課程卡片
        console.log('👆 長按第一個課程卡片...');
        const firstCard = await page.$('.event-card');
        if (!firstCard) {
            throw new Error('找不到課程卡片');
        }
        
        // 模擬長按
        await page.mouse.move(100, 200);
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 長按1秒
        await page.mouse.up();
        
        console.log('⏳ 等待簽到模態框出現...');
        await page.waitForSelector('.attendance-modal', { timeout: 10000 });
        
        // 檢查初始學生簽到內容
        console.log('🔍 檢查初始學生簽到內容...');
        const studentCards = await page.$$('.student-card');
        const attendanceBtns = await page.$$('.attendance-btn');
        console.log(`📊 找到 ${studentCards.length} 個學生卡片，${attendanceBtns.length} 個簽到按鈕`);
        
        if (studentCards.length === 0) {
            throw new Error('沒有找到學生卡片，學生簽到內容可能沒有正確載入');
        }
        
        // 檢查課程資訊顯示
        console.log('🔍 檢查課程資訊顯示...');
        const teacherElement = await page.$('#currentTeacher');
        const courseElement = await page.$('#currentCourse');
        const timeElement = await page.$('#currentTime');
        const dateElement = await page.$('#currentDate');
        
        if (teacherElement) {
            const teacherText = await teacherElement.evaluate(el => el.textContent);
            console.log(`👨‍🏫 講師: ${teacherText}`);
        }
        if (courseElement) {
            const courseText = await courseElement.evaluate(el => el.textContent);
            console.log(`📚 課程: ${courseText}`);
        }
        if (timeElement) {
            const timeText = await timeElement.evaluate(el => el.textContent);
            console.log(`⏰ 時間: ${timeText}`);
        }
        if (dateElement) {
            const dateText = await dateElement.evaluate(el => el.textContent);
            console.log(`📅 日期: ${dateText}`);
        }
        
        // 切換到講師簽到
        console.log('🔄 切換到講師簽到...');
        const teacherTab = await page.$('[data-tab="teacher-attendance"]');
        if (!teacherTab) {
            throw new Error('找不到講師簽到標籤');
        }
        
        await teacherTab.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查講師簽到內容
        console.log('🔍 檢查講師簽到內容...');
        const teacherContent = await page.$('.teacher-attendance-content');
        const identitySelection = await page.$('.identity-selection');
        const todayReport = await page.$('.today-report');
        
        if (teacherContent || identitySelection || todayReport) {
            console.log('✅ 講師簽到內容正確顯示');
        } else {
            console.log('❌ 講師簽到內容顯示異常');
        }
        
        // 檢查課程資訊是否正確
        console.log('🔍 檢查講師簽到頁面的課程資訊...');
        const teacherTeacherElement = await page.$('#currentTeacher');
        const teacherCourseElement = await page.$('#currentCourse');
        const teacherTimeElement = await page.$('#currentTime');
        const teacherDateElement = await page.$('#currentDate');
        
        if (teacherTimeElement) {
            const timeText = await teacherTimeElement.evaluate(el => el.textContent);
            console.log(`⏰ 講師頁面時間: ${timeText}`);
            if (timeText === '載入中...') {
                console.log('❌ 講師頁面時間仍顯示載入中');
            } else {
                console.log('✅ 講師頁面時間正確顯示');
            }
        }
        
        if (teacherDateElement) {
            const dateText = await teacherDateElement.evaluate(el => el.textContent);
            console.log(`📅 講師頁面日期: ${dateText}`);
            if (dateText === '載入中...') {
                console.log('❌ 講師頁面日期仍顯示載入中');
            } else {
                console.log('✅ 講師頁面日期正確顯示');
            }
        }
        
        // 切換回學生簽到
        console.log('🔄 切換回學生簽到...');
        const studentTab = await page.$('[data-tab="student-attendance"]');
        if (!studentTab) {
            throw new Error('找不到學生簽到標籤');
        }
        
        await studentTab.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查是否恢復到原始學生簽到內容
        console.log('🔍 檢查是否恢復到原始學生簽到內容...');
        const restoredStudentCards = await page.$$('.student-card');
        const restoredAttendanceBtns = await page.$$('.attendance-btn');
        console.log(`📊 恢復後找到 ${restoredStudentCards.length} 個學生卡片，${restoredAttendanceBtns.length} 個簽到按鈕`);
        
        if (restoredStudentCards.length === 0) {
            console.log('❌ 沒有恢復到原始學生簽到內容');
            
            // 檢查是否有講師報表內容
            const teacherReportContent = await page.$('.teacher-attendance-content');
            const identitySelectionContent = await page.$('.identity-selection');
            if (teacherReportContent || identitySelectionContent) {
                console.log('❌ 仍然顯示講師報表內容，沒有恢復到學生簽到');
            }
        } else {
            console.log('✅ 成功恢復到原始學生簽到內容');
        }
        
        // 檢查課程資訊是否正確
        console.log('🔍 檢查學生簽到頁面的課程資訊...');
        const finalTeacherElement = await page.$('#currentTeacher');
        const finalCourseElement = await page.$('#currentCourse');
        const finalTimeElement = await page.$('#currentTime');
        const finalDateElement = await page.$('#currentDate');
        
        if (finalTimeElement) {
            const timeText = await finalTimeElement.evaluate(el => el.textContent);
            console.log(`⏰ 學生頁面時間: ${timeText}`);
            if (timeText === '載入中...') {
                console.log('❌ 學生頁面時間仍顯示載入中');
            } else {
                console.log('✅ 學生頁面時間正確顯示');
            }
        }
        
        if (finalDateElement) {
            const dateText = await finalDateElement.evaluate(el => el.textContent);
            console.log(`📅 學生頁面日期: ${dateText}`);
            if (dateText === '載入中...') {
                console.log('❌ 學生頁面日期仍顯示載入中');
            } else {
                console.log('✅ 學生頁面日期正確顯示');
            }
        }
        
        // 檢查 window.originalStudentContent 是否存在
        console.log('🔍 檢查 window.originalStudentContent...');
        const originalContent = await page.evaluate(() => {
            return window.originalStudentContent ? '存在' : '不存在';
        });
        console.log(`💾 window.originalStudentContent: ${originalContent}`);
        
        if (originalContent === '存在') {
            console.log('✅ 原始學生簽到內容已正確保存');
        } else {
            console.log('❌ 原始學生簽到內容沒有保存');
        }
        
        console.log('✅ 測試完成！');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    } finally {
        console.log('⏳ 等待5秒後關閉瀏覽器...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

// 執行測試
testStudentAttendanceSwitchFix().catch(console.error);
