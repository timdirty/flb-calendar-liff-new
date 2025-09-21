const puppeteer = require('puppeteer');

async function testDetailedCourseInfo() {
    console.log('🧪 開始詳細測試課程資訊...');
    
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
            if (type === 'log' && (text.includes('課程資訊') || text.includes('載入中') || text.includes('updateCourseInfoDisplay') || text.includes('storedCourseInfo') || text.includes('時間元素') || text.includes('日期元素'))) {
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 等待學生資料載入
        console.log('⏳ 等待學生資料載入...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 詳細檢查 storedCourseInfo
        console.log('🔍 詳細檢查 storedCourseInfo...');
        const detailedStoredCourseInfo = await page.evaluate(() => {
            return {
                teacher: storedCourseInfo ? storedCourseInfo.teacher : 'undefined',
                course: storedCourseInfo ? storedCourseInfo.course : 'undefined',
                time: storedCourseInfo ? storedCourseInfo.time : 'undefined',
                date: storedCourseInfo ? storedCourseInfo.date : 'undefined',
                fullObject: storedCourseInfo
            };
        });
        console.log('💾 詳細 storedCourseInfo:', detailedStoredCourseInfo);
        
        // 檢查 window.loadedStudentsData
        console.log('🔍 檢查 window.loadedStudentsData...');
        const loadedStudentsData = await page.evaluate(() => {
            return window.loadedStudentsData ? {
                teacher: window.loadedStudentsData.teacher,
                course: window.loadedStudentsData.course,
                time: window.loadedStudentsData.time,
                start: window.loadedStudentsData.start,
                end: window.loadedStudentsData.end
            } : 'undefined';
        });
        console.log('📊 window.loadedStudentsData:', loadedStudentsData);
        
        // 檢查當前元素內容
        console.log('🔍 檢查當前元素內容...');
        const currentElements = await page.evaluate(() => {
            const modalContent = document.querySelector('.attendance-modal-content');
            if (!modalContent) {
                return { error: '找不到模態框內容' };
            }
            
            // 嘗試找到課程資訊元素（支援兩種HTML結構）
            let timeElement = modalContent.querySelector('#currentTime');
            let dateElement = modalContent.querySelector('#currentDate');
            let teacherElement = modalContent.querySelector('#currentTeacher');
            let courseElement = modalContent.querySelector('#currentCourse');
            
            // 如果找不到ID元素，嘗試找到data-field元素
            if (!timeElement) {
                const timeField = modalContent.querySelector('[data-field="time"]');
                if (timeField) {
                    timeElement = timeField.querySelector('span') || timeField;
                }
            }
            if (!dateElement) {
                const dateField = modalContent.querySelector('[data-field="date"]');
                if (dateField) {
                    dateElement = dateField.querySelector('span') || dateField;
                }
            }
            if (!teacherElement) {
                const teacherField = modalContent.querySelector('[data-field="teacher"]');
                if (teacherField) {
                    teacherElement = teacherField.querySelector('span') || teacherField;
                }
            }
            if (!courseElement) {
                const courseField = modalContent.querySelector('[data-field="course"]');
                if (courseField) {
                    courseElement = courseField.querySelector('span') || courseField;
                }
            }
            
            return {
                time: timeElement ? timeElement.textContent : 'not found',
                date: dateElement ? dateElement.textContent : 'not found',
                teacher: teacherElement ? teacherElement.textContent : 'not found',
                course: courseElement ? courseElement.textContent : 'not found',
                timeElement: timeElement ? 'found' : 'not found',
                dateElement: dateElement ? 'found' : 'not found',
                teacherElement: teacherElement ? 'found' : 'not found',
                courseElement: courseElement ? 'found' : 'not found'
            };
        });
        console.log('🔍 當前元素內容:', currentElements);
        
        // 手動設置 storedCourseInfo 並調用更新
        console.log('🔄 手動設置 storedCourseInfo 並調用更新...');
        await page.evaluate(() => {
            if (window.loadedStudentsData) {
                const teacher = window.loadedStudentsData.teacher;
                const course = window.loadedStudentsData.course;
                const time = window.loadedStudentsData.time;
                let date = window.loadedStudentsData.date;
                
                if (!date && window.loadedStudentsData.start) {
                    const startDate = new Date(window.loadedStudentsData.start);
                    date = startDate.toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                }
                
                console.log('🔧 手動設置課程資訊:', { teacher, course, time, date });
                
                if (typeof storeCourseInfo === 'function') {
                    storeCourseInfo(teacher, course, time, date);
                }
                
                if (typeof updateCourseInfoDisplay === 'function') {
                    updateCourseInfoDisplay();
                }
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 再次檢查元素內容
        console.log('🔍 檢查更新後的元素內容...');
        const updatedElements = await page.evaluate(() => {
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');
            const teacherElement = document.getElementById('currentTeacher');
            const courseElement = document.getElementById('currentCourse');
            
            return {
                time: timeElement ? timeElement.textContent : 'not found',
                date: dateElement ? dateElement.textContent : 'not found',
                teacher: teacherElement ? teacherElement.textContent : 'not found',
                course: courseElement ? courseElement.textContent : 'not found'
            };
        });
        console.log('🔍 更新後元素內容:', updatedElements);
        
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
testDetailedCourseInfo().catch(console.error);
