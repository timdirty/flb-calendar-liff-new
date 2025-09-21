const puppeteer = require('puppeteer');

async function testTeacherReport() {
    console.log('🧪 開始測試講師報表功能...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 監聽控制台消息
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('講師') || text.includes('報表') || text.includes('模式') || text.includes('提交') || text.includes('模態框') || text.includes('左移')) {
                console.log('📱 控制台:', text);
            }
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        console.log('✅ 頁面載入完成');
        
        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 查找事件卡片
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個事件卡片`);
        
        if (eventCards.length === 0) {
            console.log('❌ 沒有找到事件卡片，無法測試');
            return;
        }
        
        const firstCard = eventCards[0];
        
        // 觸發長按進入簽到系統
        console.log('🔄 觸發長按進入簽到系統...');
        
        await firstCard.hover();
        await page.mouse.down();
        
        // 等待2秒完成長按
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await page.mouse.up();
        
        // 等待載入完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查懸浮導航器是否出現
        const floatingNavigator = await page.$('.floating-navigator');
        if (floatingNavigator) {
            console.log('✅ 懸浮導航器已出現');
            
            // 點擊講師簽到
            const teacherNav = await page.$('.nav-item[data-tab="teacher-attendance"]');
            if (teacherNav) {
                console.log('🔄 點擊講師簽到...');
                await teacherNav.click();
                
                // 等待左移動畫完成
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 檢查講師報表內容是否出現
                const teacherContent = await page.$('.teacher-attendance-content');
                if (teacherContent) {
                    console.log('✅ 講師報表內容已顯示');
                    
                    // 檢查課程內容輸入框
                    const courseContent = await page.$('#course-content');
                    if (courseContent) {
                        console.log('✅ 課程內容輸入框已載入');
                        
                        // 測試輸入課程內容
                        console.log('🔄 輸入課程內容...');
                        await courseContent.type('今天教了學生基本的程式設計概念，包括變數、迴圈和條件判斷。學生們都很認真學習，互動良好。');
                        
                        // 檢查字數統計
                        const charCount = await page.$('#char-count');
                        if (charCount) {
                            const count = await page.evaluate(el => el.textContent, charCount);
                            console.log(`📊 字數統計: ${count}`);
                        }
                    } else {
                        console.log('❌ 課程內容輸入框未載入');
                    }
                    
                    // 檢查身份選擇按鈕
                    const teacherModeBtn = await page.$('#teacher-mode-btn');
                    const assistantModeBtn = await page.$('#assistant-mode-btn');
                    
                    if (teacherModeBtn && assistantModeBtn) {
                        console.log('✅ 身份選擇按鈕已載入');
                        
                        // 檢查當前模式顯示
                        const currentModeDisplay = await page.$('#current-mode-display');
                        if (currentModeDisplay) {
                            const currentMode = await page.evaluate(el => el.textContent, currentModeDisplay);
                            console.log(`📊 當前模式: ${currentMode}`);
                        }
                        
                        // 測試切換到助教模式
                        console.log('🔄 切換到助教模式...');
                        await assistantModeBtn.click();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        const newMode = await page.evaluate(el => el.textContent, currentModeDisplay);
                        console.log(`📊 切換後模式: ${newMode}`);
                        
                        // 切換回講師模式
                        console.log('🔄 切換回講師模式...');
                        await teacherModeBtn.click();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        const finalMode = await page.evaluate(el => el.textContent, currentModeDisplay);
                        console.log(`📊 最終模式: ${finalMode}`);
                    } else {
                        console.log('❌ 身份選擇按鈕未載入');
                    }
                    
                    // 檢查提交按鈕
                    const submitBtn = await page.$('#submitTeacherReport');
                    if (submitBtn) {
                        console.log('✅ 提交按鈕已載入');
                        
                        // 測試提交講師報表
                        console.log('🔄 提交講師報表...');
                        await submitBtn.click();
                        
                        // 等待提交完成
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        console.log('✅ 講師報表提交完成');
                    } else {
                        console.log('❌ 提交按鈕未載入');
                    }
                    
                } else {
                    console.log('❌ 講師報表內容未顯示');
                }
                
                // 測試切換回學生簽到
                console.log('🔄 切換回學生簽到...');
                const studentNav = await page.$('.nav-item[data-tab="student-attendance"]');
                if (studentNav) {
                    await studentNav.click();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    console.log('✅ 已切換回學生簽到');
                }
                
            } else {
                console.log('❌ 找不到講師簽到導航項目');
            }
            
            // 關閉模態框
            console.log('🔄 關閉模態框...');
            const closeBtn = await page.$('#closeAttendanceModal');
            if (closeBtn) {
                await closeBtn.click();
                console.log('✅ 模態框已關閉');
            }
            
        } else {
            console.log('❌ 懸浮導航器未出現');
        }
        
        console.log('🎉 講師報表功能測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testTeacherReport().catch(console.error);
