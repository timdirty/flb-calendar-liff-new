const puppeteer = require('puppeteer');

async function testApiErrorHandling() {
    console.log('🧪 開始測試API錯誤處理和自動提交步驟...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 設置用戶代理為手機
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
        
        // 捕獲控制台日誌
        page.on('console', msg => {
            if (msg.type() === 'log') {
                console.log('📱 頁面日誌:', msg.text());
            }
        });
        
        // 攔截API請求，模擬找不到課程的錯誤
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (request.url().includes('/api/students')) {
                console.log('📱 攔截到學生API請求，模擬找不到課程錯誤');
                request.respond({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        success: false, 
                        error: '在「上課時間(link calender）」找不到課程「TEST」的時段「一 1930-2100 客製化」' 
                    })
                });
            } else {
                request.continue();
            }
        });
        
        console.log('📱 導航到頁面...');
        await page.goto('http://localhost:3001/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔍 尋找課程卡片...');
        // 等待課程卡片出現
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        // 找到第一個課程卡片
        const courseCards = await page.$$('.event-card');
        if (courseCards.length === 0) {
            throw new Error('找不到課程卡片');
        }
        
        console.log(`📚 找到 ${courseCards.length} 個課程卡片`);
        
        // 長按第一個課程卡片
        const firstCard = courseCards[0];
        console.log('👆 長按課程卡片...');
        
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            // 模擬長按
            const touchStart = new TouchEvent('touchstart', {
                touches: [new Touch({
                    identifier: 1,
                    target: card,
                    clientX: x,
                    clientY: y
                })]
            });
            
            card.dispatchEvent(touchStart);
        }, firstCard);
        
        // 等待長按觸發
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔄 等待模態框載入...');
        // 等待模態框載入
        await page.waitForSelector('#attendanceModal', { timeout: 15000 });
        
        // 等待API錯誤處理
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查是否自動切換到講師簽到頁面
        console.log('👨‍🏫 檢查是否自動切換到講師簽到頁面...');
        const teacherTabCheck = await page.evaluate(() => {
            const teacherTab = document.querySelector('[data-tab="teacher-attendance"]');
            const studentTab = document.querySelector('[data-tab="student-attendance"]');
            
            return {
                teacherTabActive: teacherTab ? teacherTab.classList.contains('active') : false,
                studentTabActive: studentTab ? studentTab.classList.contains('active') : false,
                hasTeacherContent: !!document.getElementById('course-content'),
                hasStudentCountSelection: !!document.getElementById('student-count-selection')
            };
        });
        
        console.log('📊 講師簽到頁面檢查結果:', teacherTabCheck);
        
        if (teacherTabCheck.teacherTabActive && teacherTabCheck.hasTeacherContent) {
            console.log('✅ 已自動切換到講師簽到頁面');
        } else {
            console.log('❌ 未自動切換到講師簽到頁面');
        }
        
        if (teacherTabCheck.hasStudentCountSelection) {
            console.log('✅ 人數選擇區域已顯示');
        } else {
            console.log('❌ 人數選擇區域未顯示');
        }
        
        // 測試三步驟自動提交
        console.log('📝 測試三步驟自動提交...');
        
        // 步驟1：選擇講師模式
        await page.click('#teacher-mode-btn');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 步驟2：選擇人數
        await page.click('#count-2-btn');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 步驟3：輸入課程內容
        await page.type('#course-content', '測試課程內容');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 檢查自動提交狀態
        const autoSubmitCheck = await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            const currentModeDisplay = document.getElementById('current-mode-display');
            
            const hasContent = courseContent && courseContent.value.trim().length >= 1;
            const hasMode = currentModeDisplay && 
                           (currentModeDisplay.textContent === '講師模式' || 
                            currentModeDisplay.textContent === '助教模式');
            
            const hasStudents = window.loadedStudentsData && 
                              window.loadedStudentsData.students && 
                              window.loadedStudentsData.students.length > 0;
            
            const hasStudentCount = hasStudents || window.selectedStudentCount !== null;
            
            return {
                hasContent,
                hasMode,
                hasStudents,
                hasStudentCount,
                selectedStudentCount: window.selectedStudentCount,
                shouldAutoSubmit: hasContent && hasMode && hasStudentCount
            };
        });
        
        console.log('📊 三步驟自動提交檢查結果:', autoSubmitCheck);
        
        if (autoSubmitCheck.shouldAutoSubmit) {
            console.log('✅ 三步驟自動提交條件滿足');
        } else {
            console.log('❌ 三步驟自動提交條件不滿足');
        }
        
        // 測試兩步驟自動提交（有學生資料時）
        console.log('📝 測試兩步驟自動提交（模擬有學生資料）...');
        
        // 模擬有學生資料
        await page.evaluate(() => {
            window.loadedStudentsData = {
                students: [
                    { name: '學生1', status: 'present' },
                    { name: '學生2', status: 'present' }
                ]
            };
            window.selectedStudentCount = 2;
        });
        
        // 清空課程內容重新測試
        await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            if (courseContent) {
                courseContent.value = '';
            }
        });
        
        // 重新輸入課程內容
        await page.type('#course-content', '測試課程內容');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 檢查兩步驟自動提交狀態
        const twoStepCheck = await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            const currentModeDisplay = document.getElementById('current-mode-display');
            
            const hasContent = courseContent && courseContent.value.trim().length >= 1;
            const hasMode = currentModeDisplay && 
                           (currentModeDisplay.textContent === '講師模式' || 
                            currentModeDisplay.textContent === '助教模式');
            
            const hasStudents = window.loadedStudentsData && 
                              window.loadedStudentsData.students && 
                              window.loadedStudentsData.students.length > 0;
            
            const hasStudentCount = hasStudents || window.selectedStudentCount !== null;
            
            return {
                hasContent,
                hasMode,
                hasStudents,
                hasStudentCount,
                shouldAutoSubmit: hasContent && hasMode && hasStudentCount
            };
        });
        
        console.log('📊 兩步驟自動提交檢查結果:', twoStepCheck);
        
        if (twoStepCheck.shouldAutoSubmit) {
            console.log('✅ 兩步驟自動提交條件滿足');
        } else {
            console.log('❌ 兩步驟自動提交條件不滿足');
        }
        
        console.log('🎉 API錯誤處理和自動提交步驟測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testApiErrorHandling().then(success => {
    if (success) {
        console.log('✅ 測試完成！');
        process.exit(0);
    } else {
        console.log('❌ 測試失敗！');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 測試執行錯誤:', error);
    process.exit(1);
});
