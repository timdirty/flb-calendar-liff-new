const puppeteer = require('puppeteer');

async function testCourseInfoUpdate() {
    console.log('🧪 開始測試課程資訊更新...');
    
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
            if (type === 'log' && (text.includes('課程資訊') || text.includes('載入中') || text.includes('updateCourseInfoDisplay') || text.includes('storedCourseInfo'))) {
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
        
        // 等待學生資料載入
        console.log('⏳ 等待學生資料載入...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查初始課程資訊
        console.log('🔍 檢查初始課程資訊...');
        const timeElement = await page.$('#currentTime');
        const dateElement = await page.$('#currentDate');
        const teacherElement = await page.$('#currentTeacher');
        const courseElement = await page.$('#currentCourse');
        
        if (timeElement) {
            const timeText = await timeElement.evaluate(el => el.textContent);
            console.log(`⏰ 初始時間: ${timeText}`);
        }
        if (dateElement) {
            const dateText = await dateElement.evaluate(el => el.textContent);
            console.log(`📅 初始日期: ${dateText}`);
        }
        if (teacherElement) {
            const teacherText = await teacherElement.evaluate(el => el.textContent);
            console.log(`👨‍🏫 初始講師: ${teacherText}`);
        }
        if (courseElement) {
            const courseText = await courseElement.evaluate(el => el.textContent);
            console.log(`📚 初始課程: ${courseText}`);
        }
        
        // 檢查 window.loadedStudentsData
        console.log('🔍 檢查 window.loadedStudentsData...');
        const loadedStudentsData = await page.evaluate(() => {
            return window.loadedStudentsData;
        });
        console.log('📊 window.loadedStudentsData:', loadedStudentsData);
        
        // 檢查 storedCourseInfo
        console.log('🔍 檢查 storedCourseInfo...');
        const storedCourseInfo = await page.evaluate(() => {
            return window.storedCourseInfo || 'undefined';
        });
        console.log('💾 storedCourseInfo:', storedCourseInfo);
        
        // 手動調用 updateCourseInfoDisplay
        console.log('🔄 手動調用 updateCourseInfoDisplay...');
        await page.evaluate(() => {
            if (typeof updateCourseInfoDisplay === 'function') {
                updateCourseInfoDisplay();
            } else {
                console.log('❌ updateCourseInfoDisplay 函數不存在');
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 再次檢查課程資訊
        console.log('🔍 檢查更新後的課程資訊...');
        if (timeElement) {
            const timeText = await timeElement.evaluate(el => el.textContent);
            console.log(`⏰ 更新後時間: ${timeText}`);
        }
        if (dateElement) {
            const dateText = await dateElement.evaluate(el => el.textContent);
            console.log(`📅 更新後日期: ${dateText}`);
        }
        
        // 檢查元素是否正確找到
        console.log('🔍 檢查元素ID...');
        const allElements = await page.evaluate(() => {
            const elements = {
                currentTime: document.getElementById('currentTime'),
                currentDate: document.getElementById('currentDate'),
                currentTeacher: document.getElementById('currentTeacher'),
                currentCourse: document.getElementById('currentCourse')
            };
            return Object.keys(elements).reduce((acc, key) => {
                acc[key] = elements[key] ? elements[key].textContent : 'not found';
                return acc;
            }, {});
        });
        console.log('🔍 所有元素內容:', allElements);
        
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
testCourseInfoUpdate().catch(console.error);
