const puppeteer = require('puppeteer');

async function testFrontendNotification() {
    console.log('🚀 開始測試前端通知功能...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1200, height: 800 }
    });
    
    try {
        const page = await browser.newPage();
        
        // 導航到測試頁面
        console.log('📱 導航到前端通知測試頁面...');
        await page.goto('http://localhost:3000/test-frontend-notification.html', { 
            waitUntil: 'networkidle0' 
        });
        
        // 等待頁面載入
        await page.waitForSelector('h1', { timeout: 10000 });
        console.log('✅ 頁面載入成功');
        
        // 測試 Toast 通知
        console.log('\n📱 測試 Toast 通知...');
        await page.click('button[onclick*="testToast(\'success\'"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await page.click('button[onclick*="testToast(\'error\'"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 測試學生簽到通知
        console.log('\n📤 測試學生簽到通知...');
        
        // 單一學生出席
        await page.click('button[onclick*="testStudentNotification(\'Ted\'"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 多學生混合
        await page.click('button[onclick*="testStudentNotification(\'Agnes\'"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 全部缺席
        await page.click('button[onclick*="testStudentNotification(\'Hansen\'"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 特殊字符講師
        await page.click('button[onclick*="testStudentNotification(\'Yoki 🙏🏻\'"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 測試講師查詢
        console.log('\n🔍 測試講師查詢...');
        
        // 查詢 Tim
        await page.click('button[onclick*="testTeacherQuery(\'Tim\'"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 查詢 Ted
        await page.click('button[onclick*="testTeacherQuery(\'Ted\'"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 查詢特殊字符講師
        await page.click('button[onclick*="testTeacherQuery(\'Yoki 🙏🏻\'"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 查詢未知講師
        await page.click('button[onclick*="testTeacherQuery(\'UnknownTeacher\'"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n✅ 前端通知功能測試完成！');
        
        // 截圖保存結果
        await page.screenshot({ 
            path: 'frontend-notification-test-result.png',
            fullPage: true 
        });
        console.log('📸 測試結果截圖已保存: frontend-notification-test-result.png');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testFrontendNotification().catch(console.error);
