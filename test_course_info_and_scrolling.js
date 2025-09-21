const puppeteer = require('puppeteer');

async function testCourseInfoAndScrolling() {
    console.log('🧪 開始測試課程資訊載入和滑動功能...');
    
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
            if (type === 'log' && (text.includes('課程資訊') || text.includes('滑動') || text.includes('三個區塊') || text.includes('自動提交') || text.includes('人數選擇'))) {
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
        
        // 尋找包含「客製化」或「到府」的課程卡片（這些通常會導致載入失敗）
        console.log('🔍 尋找可能導致載入失敗的課程卡片...');
        const courseCards = await page.$$('.event-card');
        let specialCard = null;
        
        for (const card of courseCards) {
            const title = await card.evaluate(el => el.textContent);
            if (title.includes('客製化') || title.includes('到府') || title.includes('特殊')) {
                console.log(`✅ 找到特殊課程: ${title.substring(0, 100)}...`);
                specialCard = card;
                break;
            }
        }
        
        if (!specialCard) {
            console.log('⚠️ 沒有找到特殊課程卡片，使用第一個課程卡片');
            specialCard = courseCards[0];
        }
        
        // 長按課程卡片
        console.log('👆 長按課程卡片...');
        await page.mouse.move(100, 200);
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 長按1秒
        await page.mouse.up();
        
        console.log('⏳ 等待簽到模態框出現...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查是否直接跳轉到講師模式
        console.log('🔍 檢查是否直接跳轉到講師模式...');
        const teacherAttendanceContent = await page.$('.teacher-attendance-content');
        if (teacherAttendanceContent) {
            console.log('✅ 已直接跳轉到講師模式');
        } else {
            console.log('⚠️ 沒有直接跳轉到講師模式，嘗試手動切換');
            
            // 嘗試手動切換到講師簽到標籤
            const teacherTab = await page.$('[data-tab="teacher-attendance"]');
            if (teacherTab) {
                await teacherTab.click();
                console.log('✅ 手動切換到講師簽到標籤');
            }
        }
        
        // 檢查課程資訊是否正確載入
        console.log('🔍 檢查課程資訊載入...');
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
        
        // 等待講師報表載入
        console.log('⏳ 等待講師報表載入...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 手動清除學生資料來測試人數選擇功能
        console.log('🔄 手動清除學生資料來測試人數選擇功能...');
        await page.evaluate(() => {
            window.loadedStudentsData = { students: [] };
            if (typeof initializeTeacherReport === 'function') {
                initializeTeacherReport();
            }
        });
        
        // 等待一下讓UI更新
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查三個區塊的順序
        console.log('🔍 檢查三個區塊的順序...');
        const blocks = await page.evaluate(() => {
            // 尋找身份選擇區塊
            const identityBlocks = document.querySelectorAll('.glass-card');
            let identityBlock = null;
            for (const block of identityBlocks) {
                const h4 = block.querySelector('h4');
                if (h4 && h4.textContent.includes('身份選擇')) {
                    identityBlock = block;
                    break;
                }
            }
            
            // 尋找課程內容區塊
            const contentBlocks = document.querySelectorAll('.glass-card');
            let contentBlock = null;
            for (const block of contentBlocks) {
                const label = block.querySelector('label[for="course-content"]');
                if (label) {
                    contentBlock = block;
                    break;
                }
            }
            
            const countBlock = document.getElementById('student-count-selection');
            
            return {
                identityExists: !!identityBlock,
                countExists: !!countBlock,
                contentExists: !!contentBlock,
                countVisible: countBlock ? countBlock.style.display !== 'none' : false
            };
        });
        
        console.log('📊 區塊檢查結果:', blocks);
        
        // 檢查滑動功能
        console.log('🔍 檢查滑動功能...');
        const scrollInfo = await page.evaluate(() => {
            const container = document.querySelector('.teacher-attendance-content > div');
            if (container) {
                return {
                    scrollHeight: container.scrollHeight,
                    clientHeight: container.clientHeight,
                    canScroll: container.scrollHeight > container.clientHeight,
                    overflowY: container.style.overflowY,
                    maxHeight: container.style.maxHeight
                };
            }
            return null;
        });
        
        console.log('📏 滑動容器資訊:', scrollInfo);
        
        if (scrollInfo && scrollInfo.canScroll) {
            console.log('✅ 講師簽到區域可以滑動');
            
            // 測試滑動
            console.log('🔄 測試滑動功能...');
            await page.evaluate(() => {
                const container = document.querySelector('.teacher-attendance-content > div');
                if (container) {
                    container.scrollTop = 100;
                }
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const scrollPosition = await page.evaluate(() => {
                const container = document.querySelector('.teacher-attendance-content > div');
                return container ? container.scrollTop : 0;
            });
            
            console.log('📊 滑動位置:', scrollPosition);
            
            if (scrollPosition > 0) {
                console.log('✅ 滑動功能正常');
            } else {
                console.log('❌ 滑動功能異常');
            }
        } else {
            console.log('⚠️ 講師簽到區域無法滑動');
        }
        
        // 測試三個區塊的選擇
        console.log('🔍 測試三個區塊的選擇...');
        
        // 1. 選擇身份（講師模式）
        console.log('1️⃣ 選擇講師模式...');
        const teacherModeBtn = await page.$('#teacher-mode-btn');
        if (teacherModeBtn) {
            await teacherModeBtn.click();
            console.log('✅ 已選擇講師模式');
        }
        
        // 2. 選擇人數（如果顯示）
        if (blocks.countVisible) {
            console.log('2️⃣ 選擇人數...');
            const count2Btn = await page.$('#count-2-btn');
            if (count2Btn) {
                await count2Btn.click();
                console.log('✅ 已選擇1-2人以下');
            }
        } else {
            console.log('2️⃣ 跳過人數選擇（有學生資料）');
        }
        
        // 3. 填寫課程內容
        console.log('3️⃣ 填寫課程內容...');
        const courseContent = await page.$('#course-content');
        if (courseContent) {
            await courseContent.type('測試課程內容');
            console.log('✅ 已填寫課程內容');
        }
        
        // 檢查自動提交條件
        console.log('🔍 檢查自動提交條件...');
        const autoSubmitInfo = await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            const currentModeDisplay = document.getElementById('current-mode-display');
            const studentCountSelection = document.getElementById('student-count-selection');
            
            const hasContent = courseContent && courseContent.value.trim().length > 0;
            const hasMode = currentModeDisplay && 
                           (currentModeDisplay.textContent === '講師模式' || 
                            currentModeDisplay.textContent === '助教模式');
            
            let hasStudentCount = true;
            let needsStudentCount = false;
            if (studentCountSelection && studentCountSelection.style.display !== 'none') {
                hasStudentCount = window.selectedStudentCount !== null;
                needsStudentCount = true;
            }
            
            return {
                hasContent,
                hasMode,
                hasStudentCount,
                needsStudentCount,
                content: courseContent ? courseContent.value.trim() : '',
                mode: currentModeDisplay ? currentModeDisplay.textContent : '',
                selectedStudentCount: window.selectedStudentCount
            };
        });
        
        console.log('📊 自動提交條件:', autoSubmitInfo);
        
        if (autoSubmitInfo.needsStudentCount) {
            // 有人數選擇區域，需要檢查三個步驟
            if (autoSubmitInfo.hasContent && autoSubmitInfo.hasMode && autoSubmitInfo.hasStudentCount) {
                console.log('✅ 三個區塊都已選擇，滿足自動提交條件');
            } else {
                console.log('❌ 三個區塊未完全選擇，不滿足自動提交條件');
            }
        } else {
            // 沒有人數選擇區域，只需要檢查兩個步驟
            if (autoSubmitInfo.hasContent && autoSubmitInfo.hasMode) {
                console.log('✅ 兩個區塊都已選擇，滿足自動提交條件');
            } else {
                console.log('❌ 兩個區塊未完全選擇，不滿足自動提交條件');
            }
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
testCourseInfoAndScrolling().catch(console.error);
