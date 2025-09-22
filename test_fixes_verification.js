const puppeteer = require('puppeteer');

async function testFixesVerification() {
    console.log('🧪 開始測試修復驗證...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 設置用戶代理為手機
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
        
        console.log('📱 導航到頁面...');
        await page.goto('http://localhost:3001/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 尋找課程卡片
        console.log('🔍 尋找課程卡片...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
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
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔄 等待模態框載入...');
        await page.waitForSelector('#attendanceModal', { timeout: 20000 });
        
        console.log('🔄 切換到講師簽到標籤...');
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 測試1: 檢查人數設定按鈕可見性
        console.log('🔍 測試1: 檢查人數設定按鈕可見性...');
        const buttonVisibility = await page.evaluate(() => {
            const count2Btn = document.querySelector('#count-2-btn');
            const count30Btn = document.querySelector('#count-30-btn');
            const viewportHeight = window.innerHeight;
            
            if (count2Btn && count30Btn) {
                const rect1 = count2Btn.getBoundingClientRect();
                const rect2 = count30Btn.getBoundingClientRect();
                
                return {
                    button1: {
                        top: rect1.top,
                        bottom: rect1.bottom,
                        visible: rect1.top >= 0 && rect1.bottom <= viewportHeight,
                        height: rect1.height
                    },
                    button2: {
                        top: rect2.top,
                        bottom: rect2.bottom,
                        visible: rect2.top >= 0 && rect2.bottom <= viewportHeight,
                        height: rect2.height
                    },
                    viewportHeight: viewportHeight
                };
            }
            return null;
        });
        
        console.log('📊 按鈕可見性測試結果:', buttonVisibility);
        
        if (buttonVisibility) {
            if (buttonVisibility.button1.visible && buttonVisibility.button2.visible) {
                console.log('✅ 測試1通過: 所有按鈕完全可見');
            } else {
                console.log('❌ 測試1失敗: 按鈕不可見');
            }
        }
        
        // 測試2: 測試人數修改時重置自動提交
        console.log('🔍 測試2: 測試人數修改時重置自動提交...');
        
        // 先手動滾動到人數選擇區域
        const scrollInfo = await page.evaluate(() => {
            const modalContent = document.querySelector('.attendance-modal-content');
            const teacherContent = document.querySelector('.teacher-attendance-content');
            let scrollContainer = null;
            
            // 優先使用講師內容的滾動容器
            if (teacherContent) {
                scrollContainer = teacherContent.querySelector('div[style*="overflow-y: auto"]');
            }
            
            // 如果沒有找到，使用模態框內容
            if (!scrollContainer) {
                scrollContainer = modalContent;
            }
            
            if (scrollContainer) {
                console.log('📊 滾動前:', {
                    scrollTop: scrollContainer.scrollTop,
                    scrollHeight: scrollContainer.scrollHeight,
                    clientHeight: scrollContainer.clientHeight
                });
                
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
                
                console.log('📊 滾動後:', {
                    scrollTop: scrollContainer.scrollTop,
                    scrollHeight: scrollContainer.scrollHeight,
                    clientHeight: scrollContainer.clientHeight
                });
            }
            
            return {
                scrollContainer: !!scrollContainer,
                scrollTop: scrollContainer ? scrollContainer.scrollTop : 0,
                scrollHeight: scrollContainer ? scrollContainer.scrollHeight : 0,
                clientHeight: scrollContainer ? scrollContainer.clientHeight : 0
            };
        });
        
        console.log('📊 滾動信息:', scrollInfo);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 先填寫課程內容觸發自動提交
        const courseContent = await page.$('#course-content');
        if (courseContent) {
            await courseContent.type('測試課程內容');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 檢查是否有自動提交倒數
        const autoSubmitStatus1 = await page.evaluate(() => {
            return {
                isAutoSubmitEnabled: window.isAutoSubmitEnabled || false,
                autoSubmitTimer: window.autoSubmitTimer || null
            };
        });
        
        console.log('📊 填寫內容後自動提交狀態:', autoSubmitStatus1);
        
        // 點擊人數選擇按鈕
        const count2Btn = await page.$('#count-2-btn');
        if (count2Btn) {
            await count2Btn.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 檢查自動提交是否被重置
        const autoSubmitStatus2 = await page.evaluate(() => {
            return {
                isAutoSubmitEnabled: window.isAutoSubmitEnabled || false,
                autoSubmitTimer: window.autoSubmitTimer || null
            };
        });
        
        console.log('📊 選擇人數後自動提交狀態:', autoSubmitStatus2);
        
        if (!autoSubmitStatus2.isAutoSubmitEnabled && !autoSubmitStatus2.autoSubmitTimer) {
            console.log('✅ 測試2通過: 人數修改時自動提交被重置');
        } else {
            console.log('❌ 測試2失敗: 人數修改時自動提交未被重置');
        }
        
        // 測試3: 測試錯誤通知自動消失
        console.log('🔍 測試3: 測試錯誤通知自動消失...');
        
        // 模擬一個錯誤情況（清空課程內容）
        if (courseContent) {
            await courseContent.click();
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyA');
            await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 檢查是否有錯誤通知
        const errorToast = await page.$('.toast.error');
        if (errorToast) {
            console.log('📊 發現錯誤通知，等待5秒檢查是否自動消失...');
            await new Promise(resolve => setTimeout(resolve, 6000));
            
            const errorToastAfter = await page.$('.toast.error');
            if (!errorToastAfter) {
                console.log('✅ 測試3通過: 錯誤通知自動消失');
            } else {
                console.log('❌ 測試3失敗: 錯誤通知未自動消失');
            }
        } else {
            console.log('ℹ️ 測試3跳過: 沒有發現錯誤通知');
        }
        
        console.log('🎉 修復驗證測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testFixesVerification().then(success => {
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