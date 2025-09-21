const puppeteer = require('puppeteer');

async function testFloatingNavigator() {
    console.log('🧪 開始測試懸浮導航器功能...');
    
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
            if (text.includes('導航器') || text.includes('切換') || text.includes('學生簽到') || text.includes('講師簽到') || text.includes('懸浮') || text.includes('模態框')) {
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
            
            // 檢查導航器項目
            const navItems = await page.$$('.nav-item');
            console.log(`📊 找到 ${navItems.length} 個導航項目`);
            
            // 檢查學生簽到項目
            const studentNav = await page.$('.nav-item[data-tab="student-attendance"]');
            if (studentNav) {
                console.log('✅ 學生簽到導航項目存在');
                
                // 檢查是否為活動狀態
                const isActive = await page.evaluate(el => el.classList.contains('active'), studentNav);
                console.log(`📊 學生簽到項目活動狀態: ${isActive ? '是' : '否'}`);
            }
            
            // 檢查講師簽到項目
            const teacherNav = await page.$('.nav-item[data-tab="teacher-attendance"]');
            if (teacherNav) {
                console.log('✅ 講師簽到導航項目存在');
                
                // 點擊講師簽到
                console.log('🔄 點擊講師簽到...');
                await teacherNav.click();
                
                // 等待一下
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 檢查活動狀態是否切換
                const isTeacherActive = await page.evaluate(el => el.classList.contains('active'), teacherNav);
                const isStudentActive = await page.evaluate(el => el.classList.contains('active'), studentNav);
                
                console.log(`📊 講師簽到項目活動狀態: ${isTeacherActive ? '是' : '否'}`);
                console.log(`📊 學生簽到項目活動狀態: ${isStudentActive ? '是' : '否'}`);
                
                // 切換回學生簽到
                console.log('🔄 切換回學生簽到...');
                await studentNav.click();
                
                // 等待一下
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 再次檢查活動狀態
                const isTeacherActive2 = await page.evaluate(el => el.classList.contains('active'), teacherNav);
                const isStudentActive2 = await page.evaluate(el => el.classList.contains('active'), studentNav);
                
                console.log(`📊 切換後講師簽到項目活動狀態: ${isTeacherActive2 ? '是' : '否'}`);
                console.log(`📊 切換後學生簽到項目活動狀態: ${isStudentActive2 ? '是' : '否'}`);
            }
            
            // 測試關閉模態框時導航器是否被移除
            console.log('🔄 測試關閉模態框...');
            
            const closeBtn = await page.$('#closeAttendanceModal');
            if (closeBtn) {
                await closeBtn.click();
                console.log('✅ 點擊了關閉按鈕');
                
                // 等待一下
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 檢查導航器是否被移除
                const floatingNavigatorAfterClose = await page.$('.floating-navigator');
                if (!floatingNavigatorAfterClose) {
                    console.log('✅ 懸浮導航器已正確移除');
                } else {
                    console.log('❌ 懸浮導航器未被移除');
                }
            } else {
                console.log('❌ 找不到關閉按鈕');
            }
            
        } else {
            console.log('❌ 懸浮導航器未出現');
        }
        
        console.log('🎉 懸浮導航器測試完成！');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testFloatingNavigator().catch(console.error);
