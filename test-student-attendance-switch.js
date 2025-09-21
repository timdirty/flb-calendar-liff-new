const puppeteer = require('puppeteer');

async function testStudentAttendanceSwitch() {
    console.log('🧪 開始測試學生簽到切換功能...');
    
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
            if (text.includes('學生') || text.includes('簽到') || text.includes('載入') || text.includes('模態框') || text.includes('左移')) {
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
            
            // 先點擊講師簽到
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
                } else {
                    console.log('❌ 講師報表內容未顯示');
                }
                
                // 現在點擊學生簽到切換回去
                const studentNav = await page.$('.nav-item[data-tab="student-attendance"]');
                if (studentNav) {
                    console.log('🔄 點擊學生簽到切換回去...');
                    await studentNav.click();
                    
                    // 等待切換動畫完成
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // 檢查學生簽到內容是否出現
                    const studentContent = await page.$('.student-attendance-content');
                    if (studentContent) {
                        console.log('✅ 學生簽到內容已顯示');
                        
                        // 檢查課程信息
                        const courseInfo = await page.$('.course-info');
                        if (courseInfo) {
                            const courseText = await page.evaluate(el => el.textContent, courseInfo);
                            console.log(`📚 課程信息: ${courseText}`);
                        }
                        
                        // 檢查學生列表
                        const studentList = await page.$('#studentList');
                        if (studentList) {
                            const isVisible = await page.evaluate(el => el.style.display !== 'none', studentList);
                            if (isVisible) {
                                console.log('✅ 學生列表已載入');
                                
                                // 檢查學生項目
                                const studentItems = await page.$$('.student-item');
                                console.log(`👥 找到 ${studentItems.length} 個學生項目`);
                                
                                // 測試點擊學生狀態按鈕
                                if (studentItems.length > 0) {
                                    const firstStudent = studentItems[0];
                                    const presentBtn = await firstStudent.$('.status-btn.present');
                                    if (presentBtn) {
                                        console.log('🔄 測試點擊出席按鈕...');
                                        await presentBtn.click();
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                        console.log('✅ 出席按鈕點擊完成');
                                    }
                                }
                            } else {
                                console.log('❌ 學生列表未顯示');
                            }
                        }
                        
                        // 檢查儲存按鈕
                        const saveBtn = await page.$('#saveAttendance');
                        if (saveBtn) {
                            const isVisible = await page.evaluate(el => el.style.display !== 'none', saveBtn);
                            if (isVisible) {
                                console.log('✅ 儲存按鈕已顯示');
                                
                                // 測試點擊儲存按鈕
                                console.log('🔄 測試點擊儲存按鈕...');
                                await saveBtn.click();
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                console.log('✅ 儲存按鈕點擊完成');
                            } else {
                                console.log('❌ 儲存按鈕未顯示');
                            }
                        }
                        
                    } else {
                        console.log('❌ 學生簽到內容未顯示');
                    }
                } else {
                    console.log('❌ 找不到學生簽到導航項目');
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
        
        console.log('🎉 學生簽到切換功能測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testStudentAttendanceSwitch().catch(console.error);
