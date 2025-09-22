const puppeteer = require('puppeteer');

async function testCountdownColorsAndLine() {
    console.log('🧪 開始測試倒數計時顏色和LINE通知功能...');
    
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
        
        // 攔截API請求
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (request.url().includes('/api/send-line-notification')) {
                console.log('📱 攔截到LINE通知API請求:', request.url());
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, message: 'LINE通知發送成功' })
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
        
        console.log('🔄 切換到講師簽到標籤...');
        // 點擊講師簽到標籤
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 測試講師模式倒數計時顏色
        console.log('👨‍🏫 測試講師模式倒數計時...');
        await page.type('#course-content', '測試課程內容');
        await page.click('#teacher-mode-btn');
        
        // 等待倒數計時出現
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查講師模式倒數計時顏色
        const teacherCountdownCheck = await page.evaluate(() => {
            const countdownToast = document.querySelector('.countdown-toast');
            if (!countdownToast) return null;
            
            const styles = window.getComputedStyle(countdownToast);
            const background = styles.background;
            const borderColor = styles.borderColor;
            const color = styles.color;
            
            return {
                hasToast: !!countdownToast,
                background: background,
                borderColor: borderColor,
                color: color,
                textContent: countdownToast.textContent
            };
        });
        
        console.log('📊 講師模式倒數計時檢查結果:', teacherCountdownCheck);
        
        if (teacherCountdownCheck && teacherCountdownCheck.hasToast) {
            console.log('✅ 講師模式倒數計時已顯示');
            if (teacherCountdownCheck.background.includes('52, 152, 219')) {
                console.log('✅ 講師模式使用藍色背景');
            } else {
                console.log('❌ 講師模式背景顏色不正確');
            }
        } else {
            console.log('❌ 講師模式倒數計時未顯示');
        }
        
        // 停止倒數計時
        await page.evaluate(() => {
            if (window.stopAutoSubmitCountdown) {
                window.stopAutoSubmitCountdown();
            }
        });
        
        // 測試助教模式倒數計時顏色
        console.log('👨‍🎓 測試助教模式倒數計時...');
        await page.click('#assistant-mode-btn');
        
        // 等待倒數計時出現
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查助教模式倒數計時顏色
        const assistantCountdownCheck = await page.evaluate(() => {
            const countdownToast = document.querySelector('.countdown-toast');
            if (!countdownToast) return null;
            
            const styles = window.getComputedStyle(countdownToast);
            const background = styles.background;
            const borderColor = styles.borderColor;
            const color = styles.color;
            
            return {
                hasToast: !!countdownToast,
                background: background,
                borderColor: borderColor,
                color: color,
                textContent: countdownToast.textContent
            };
        });
        
        console.log('📊 助教模式倒數計時檢查結果:', assistantCountdownCheck);
        
        if (assistantCountdownCheck && assistantCountdownCheck.hasToast) {
            console.log('✅ 助教模式倒數計時已顯示');
            if (assistantCountdownCheck.background.includes('46, 204, 113')) {
                console.log('✅ 助教模式使用綠色背景');
            } else {
                console.log('❌ 助教模式背景顏色不正確');
            }
        } else {
            console.log('❌ 助教模式倒數計時未顯示');
        }
        
        // 停止倒數計時
        await page.evaluate(() => {
            if (window.stopAutoSubmitCountdown) {
                window.stopAutoSubmitCountdown();
            }
        });
        
        // 測試LINE通知功能
        console.log('📱 測試LINE通知功能...');
        
        // 模擬提交報表
        await page.evaluate(() => {
            if (window.submitTeacherReport) {
                // 模擬提交成功後發送LINE通知
                const reportData = {
                    teacherName: 'Tim',
                    courseName: 'SPIKE',
                    courseTime: '19:30-21:00',
                    date: '2025/09/22',
                    studentCount: 1,
                    courseContent: '測試課程內容',
                    mode: '講師模式',
                    isCustomizedCourse: false
                };
                
                if (window.sendLineNotification) {
                    window.sendLineNotification(reportData);
                }
            }
        });
        
        // 等待LINE通知API調用
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🎉 倒數計時顏色和LINE通知功能測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testCountdownColorsAndLine().then(success => {
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
