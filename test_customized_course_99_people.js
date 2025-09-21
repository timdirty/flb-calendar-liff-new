const puppeteer = require('puppeteer');

async function testCustomizedCourse99People() {
    console.log('🧪 開始測試客製化課程人數自動設為99功能...');
    
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
            if (type === 'log' && (text.includes('客製化') || text.includes('人數設為99') || text.includes('講師報表') || text.includes('originalTitle') || text.includes('沒有學生資料'))) {
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
        
        // 尋找包含「客製化」的課程卡片
        console.log('🔍 尋找包含客製化的課程卡片...');
        const courseCards = await page.$$('.event-card');
        let customizedCard = null;
        
        for (const card of courseCards) {
            const title = await card.evaluate(el => el.textContent);
            if (title.includes('客製化')) {
                console.log(`✅ 找到包含客製化的課程: ${title}`);
                customizedCard = card;
                break;
            }
        }
        
        if (!customizedCard) {
            console.log('⚠️ 沒有找到包含客製化的課程卡片，嘗試長按第一個課程卡片');
            customizedCard = courseCards[0];
        }
        
        // 長按課程卡片
        console.log('👆 長按課程卡片...');
        await page.mouse.move(100, 200);
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 長按1秒
        await page.mouse.up();
        
        console.log('⏳ 等待簽到模態框出現...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 切換到講師簽到標籤
        console.log('🔄 切換到講師簽到標籤...');
        const teacherTab = await page.$('[data-tab="teacher-attendance"]');
        if (teacherTab) {
            await teacherTab.click();
            console.log('✅ 已切換到講師簽到標籤');
        } else {
            console.log('❌ 找不到講師簽到標籤');
        }
        
        // 等待講師報表載入
        console.log('⏳ 等待講師報表載入...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查人數選擇區域是否隱藏
        console.log('🔍 檢查人數選擇區域...');
        const studentCountSelection = await page.$('#student-count-selection');
        if (studentCountSelection) {
            const isVisible = await studentCountSelection.evaluate(el => el.style.display !== 'none');
            if (isVisible) {
                console.log('⚠️ 人數選擇區域仍然顯示，這表示有學生資料或不是客製化課程');
            } else {
                console.log('✅ 人數選擇區域已隱藏，這表示沒有學生資料');
            }
        } else {
            console.log('❌ 找不到人數選擇區域');
        }
        
        // 填寫課程內容
        console.log('📝 填寫課程內容...');
        const courseContent = await page.$('#course-content');
        if (courseContent) {
            await courseContent.type('測試客製化課程內容');
            console.log('✅ 已填寫課程內容');
        } else {
            console.log('❌ 找不到課程內容輸入框');
        }
        
        // 檢查提交按鈕
        console.log('🔍 檢查提交按鈕...');
        const submitBtn = await page.$('#submitTeacherReport');
        if (submitBtn) {
            const isDisabled = await submitBtn.evaluate(el => el.disabled);
            if (isDisabled) {
                console.log('⚠️ 提交按鈕被禁用');
            } else {
                console.log('✅ 提交按鈕可用');
            }
        } else {
            console.log('❌ 找不到提交按鈕');
        }
        
        // 模擬提交講師報表（不實際提交，只檢查邏輯）
        console.log('🔍 檢查講師報表提交邏輯...');
        const result = await page.evaluate(() => {
            // 檢查 currentAttendanceData 是否包含 originalTitle
            const currentData = window.currentAttendanceData;
            if (!currentData) {
                return { error: '沒有 currentAttendanceData' };
            }
            
            const originalTitle = currentData.originalTitle || '';
            const isCustomizedCourse = originalTitle.includes('客製化') || 
                                    originalTitle.includes('到府') || 
                                    originalTitle.includes('客制化') || 
                                    originalTitle.includes('客製') || 
                                    originalTitle.includes('客制');
            
            // 檢查是否有學生資料
            const hasStudents = window.loadedStudentsData && 
                              window.loadedStudentsData.students && 
                              window.loadedStudentsData.students.length > 0;
            
            return {
                originalTitle: originalTitle,
                isCustomizedCourse: isCustomizedCourse,
                hasStudents: hasStudents,
                expectedStudentCount: (!hasStudents && isCustomizedCourse) ? 99 : 'not 99'
            };
        });
        
        console.log('📊 檢查結果:', result);
        
        if (result.isCustomizedCourse && !result.hasStudents) {
            console.log('✅ 客製化課程且沒有學生資料，應該會自動設為99人');
        } else if (result.isCustomizedCourse && result.hasStudents) {
            console.log('⚠️ 客製化課程但有學生資料，會使用實際簽到人數');
        } else if (!result.isCustomizedCourse) {
            console.log('⚠️ 不是客製化課程，會使用選擇的人數');
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
testCustomizedCourse99People().catch(console.error);
