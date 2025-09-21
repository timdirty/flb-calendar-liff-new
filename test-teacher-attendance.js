const puppeteer = require('puppeteer');

async function testTeacherAttendance() {
    console.log('🧪 開始測試講師簽到功能...');
    
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
            if (text.includes('講師') || text.includes('簽到') || text.includes('選擇') || text.includes('確認') || text.includes('模態框') || text.includes('左移')) {
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
                
                // 檢查講師簽到內容是否出現
                const teacherContent = await page.$('.teacher-attendance-content');
                if (teacherContent) {
                    console.log('✅ 講師簽到內容已顯示');
                    
                    // 檢查講師網格
                    const teacherGrid = await page.$('.teacher-grid');
                    if (teacherGrid) {
                        console.log('✅ 講師網格已載入');
                        
                        // 等待講師卡片載入
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // 檢查講師卡片
                        const teacherCards = await page.$$('.teacher-card');
                        console.log(`📊 找到 ${teacherCards.length} 個講師卡片`);
                        
                        if (teacherCards.length > 0) {
                            // 點擊第一個講師卡片
                            console.log('🔄 點擊第一個講師卡片...');
                            await teacherCards[0].click();
                            
                            // 等待一下
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            // 檢查是否選中
                            const isSelected = await page.evaluate(el => el.classList.contains('selected'), teacherCards[0]);
                            console.log(`📊 講師卡片選中狀態: ${isSelected ? '是' : '否'}`);
                            
                            // 檢查確認按鈕是否出現
                            const confirmBtn = await page.$('#confirmTeacherAttendance');
                            if (confirmBtn) {
                                console.log('✅ 確認按鈕已出現');
                                
                                // 點擊確認按鈕
                                console.log('🔄 點擊確認講師簽到...');
                                await confirmBtn.click();
                                
                                // 等待處理完成
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                
                                console.log('✅ 講師簽到流程完成');
                            } else {
                                console.log('❌ 確認按鈕未出現');
                            }
                        } else {
                            console.log('❌ 沒有找到講師卡片');
                        }
                    } else {
                        console.log('❌ 講師網格未載入');
                    }
                } else {
                    console.log('❌ 講師簽到內容未顯示');
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
        
        console.log('🎉 講師簽到功能測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testTeacherAttendance().catch(console.error);
