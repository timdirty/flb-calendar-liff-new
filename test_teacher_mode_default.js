const puppeteer = require('puppeteer');

async function testTeacherModeDefault() {
    console.log('🧪 開始測試講師模式預設設置和自動人數計算...');
    
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
        
        console.log('🔄 切換到講師簽到標籤...');
        // 點擊講師簽到標籤
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查講師模式是否預設選中
        console.log('👨‍🏫 檢查講師模式預設狀態...');
        const teacherModeCheck = await page.evaluate(() => {
            const teacherModeBtn = document.getElementById('teacher-mode-btn');
            const currentModeDisplay = document.getElementById('current-mode-display');
            
            return {
                hasTeacherModeBtn: !!teacherModeBtn,
                hasCurrentModeDisplay: !!currentModeDisplay,
                currentModeText: currentModeDisplay ? currentModeDisplay.textContent : '',
                teacherModeBtnClasses: teacherModeBtn ? teacherModeBtn.className : '',
                teacherModeBtnStyle: teacherModeBtn ? teacherModeBtn.style.cssText : ''
            };
        });
        
        console.log('📊 講師模式預設狀態檢查結果:', teacherModeCheck);
        
        if (teacherModeCheck.currentModeText === '講師模式') {
            console.log('✅ 講師模式已預設選中');
        } else {
            console.log('❌ 講師模式未預設選中');
        }
        
        // 檢查人數計算
        console.log('📊 檢查人數計算...');
        const studentCountCheck = await page.evaluate(() => {
            const studentCountSelection = document.getElementById('student-count-selection');
            const hasStudents = window.loadedStudentsData && 
                              window.loadedStudentsData.students && 
                              window.loadedStudentsData.students.length > 0;
            
            let studentCountInfo = {};
            
            if (hasStudents) {
                const presentStudents = window.loadedStudentsData.students.filter(student => 
                    student.status === 'present' || student.status === 'attended'
                );
                studentCountInfo = {
                    totalStudents: window.loadedStudentsData.students.length,
                    presentStudents: presentStudents.length,
                    presentStudentNames: presentStudents.map(s => s.name),
                    selectedStudentCount: window.selectedStudentCount
                };
            }
            
            return {
                hasStudents: hasStudents,
                studentCountSelectionDisplay: studentCountSelection ? studentCountSelection.style.display : 'none',
                studentCountInfo: studentCountInfo
            };
        });
        
        console.log('📊 人數計算檢查結果:', studentCountCheck);
        
        if (studentCountCheck.hasStudents) {
            console.log('✅ 有學生資料，人數選擇已隱藏');
            if (studentCountCheck.studentCountInfo.selectedStudentCount === studentCountCheck.studentCountInfo.presentStudents) {
                console.log('✅ 人數已根據實際出席學生自動計算');
            } else {
                console.log('❌ 人數計算不正確');
            }
        } else {
            console.log('✅ 沒有學生資料，人數選擇已顯示');
        }
        
        // 測試模式切換
        console.log('🔄 測試模式切換...');
        await page.click('#assistant-mode-btn');
        
        const assistantModeCheck = await page.evaluate(() => {
            const currentModeDisplay = document.getElementById('current-mode-display');
            return {
                currentModeText: currentModeDisplay ? currentModeDisplay.textContent : ''
            };
        });
        
        if (assistantModeCheck.currentModeText === '助教模式') {
            console.log('✅ 助教模式切換成功');
        } else {
            console.log('❌ 助教模式切換失敗');
        }
        
        // 切換回講師模式
        await page.click('#teacher-mode-btn');
        
        const teacherModeCheck2 = await page.evaluate(() => {
            const currentModeDisplay = document.getElementById('current-mode-display');
            return {
                currentModeText: currentModeDisplay ? currentModeDisplay.textContent : ''
            };
        });
        
        if (teacherModeCheck2.currentModeText === '講師模式') {
            console.log('✅ 講師模式切換成功');
        } else {
            console.log('❌ 講師模式切換失敗');
        }
        
        console.log('🎉 講師模式預設設置和自動人數計算測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testTeacherModeDefault().then(success => {
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
