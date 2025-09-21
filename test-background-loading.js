const puppeteer = require('puppeteer');

async function testBackgroundLoading() {
    console.log('🧪 開始測試背景載入功能...');
    
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
            if (text.includes('學生') || text.includes('載入') || text.includes('背景') || text.includes('模態框') || text.includes('左移') || text.includes('載入完成')) {
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
        
        // 等待載入開始
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查懸浮導航器是否出現
        const floatingNavigator = await page.$('.floating-navigator');
        if (floatingNavigator) {
            console.log('✅ 懸浮導航器已出現');
            
            // 立即點擊講師簽到（在學生名單載入過程中）
            const teacherNav = await page.$('.nav-item[data-tab="teacher-attendance"]');
            if (teacherNav) {
                console.log('🔄 在載入過程中點擊講師簽到...');
                await teacherNav.click();
                
                // 等待左移動畫完成
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 檢查講師報表內容是否出現
                const teacherContent = await page.$('.teacher-attendance-content');
                if (teacherContent) {
                    console.log('✅ 講師報表內容已顯示');
                    
                    // 等待背景載入完成（3秒）
                    console.log('⏳ 等待背景載入完成...');
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    
                    // 現在點擊學生簽到切換回去
                    const studentNav = await page.$('.nav-item[data-tab="student-attendance"]');
                    if (studentNav) {
                        console.log('🔄 點擊學生簽到切換回去...');
                        await studentNav.click();
                        
                        // 等待切換動畫完成
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // 檢查是否顯示載入狀態或正常內容
                        const loadingOverlay = await page.$('.student-loading-overlay');
                        const studentContent = await page.$('.attendanceContent');
                        
                        if (loadingOverlay) {
                            const isVisible = await page.evaluate(el => el.style.display !== 'none', loadingOverlay);
                            if (isVisible) {
                                console.log('✅ 顯示載入中狀態');
                                
                                // 等待載入完成
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                
                                // 檢查載入狀態是否消失
                                const stillLoading = await page.evaluate(el => el.style.display !== 'none', loadingOverlay);
                                if (!stillLoading) {
                                    console.log('✅ 載入完成，載入狀態已消失');
                                } else {
                                    console.log('⚠️ 載入狀態仍然顯示');
                                }
                            } else {
                                console.log('✅ 載入已完成，顯示正常內容');
                            }
                        } else {
                            console.log('✅ 沒有載入遮罩，直接顯示正常內容');
                        }
                        
                    } else {
                        console.log('❌ 找不到學生簽到導航項目');
                    }
                } else {
                    console.log('❌ 講師報表內容未顯示');
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
        
        console.log('🎉 背景載入功能測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testBackgroundLoading().catch(console.error);
