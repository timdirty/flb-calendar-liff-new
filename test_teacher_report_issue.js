const puppeteer = require('puppeteer');

async function testTeacherReportIssue() {
    console.log('🧪 開始測試講師報表問題...');
    
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
            if (type === 'log' && (text.includes('講師') || text.includes('teacher') || text.includes('Web API') || text.includes('currentData') || text.includes('提交講師報表'))) {
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
        
        // 尋找第一個課程卡片
        console.log('🔍 尋找第一個課程卡片...');
        const courseCards = await page.$$('.event-card');
        if (courseCards.length === 0) {
            console.log('❌ 沒有找到課程卡片');
            return;
        }
        
        const firstCard = courseCards[0];
        const cardTitle = await firstCard.evaluate(el => el.textContent);
        console.log(`✅ 找到課程卡片: ${cardTitle.substring(0, 100)}...`);
        
        // 長按課程卡片
        console.log('👆 長按課程卡片...');
        await page.mouse.move(100, 200);
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 長按1秒
        await page.mouse.up();
        
        console.log('⏳ 等待簽到模態框出現...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 等待標籤載入
        console.log('⏳ 等待標籤載入...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 切換到講師簽到標籤
        console.log('🔄 切換到講師簽到標籤...');
        const teacherTab = await page.$('[data-tab="teacher-attendance"]');
        if (teacherTab) {
            await teacherTab.click();
            console.log('✅ 已切換到講師簽到標籤');
        } else {
            console.log('❌ 找不到講師簽到標籤');
            // 列出所有可用的標籤
            const allTabs = await page.$$('.nav-item');
            console.log('🔍 可用的標籤數量:', allTabs.length);
            for (let i = 0; i < allTabs.length; i++) {
                const tabText = await allTabs[i].evaluate(el => el.textContent);
                const tabData = await allTabs[i].evaluate(el => el.dataset.tab);
                console.log(`標籤 ${i}: "${tabText}" (data-tab: "${tabData}")`);
            }
        }
        
        // 等待講師報表載入
        console.log('⏳ 等待講師報表載入...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查講師報表內容是否載入
        console.log('🔍 檢查講師報表內容...');
        const teacherContent = await page.$('.teacher-attendance-content');
        if (teacherContent) {
            console.log('✅ 找到講師報表內容');
        } else {
            console.log('❌ 找不到講師報表內容');
        }
        
        // 檢查 attendanceContent 是否存在
        const attendanceContent = await page.$('#attendanceContent');
        if (attendanceContent) {
            console.log('✅ 找到 attendanceContent');
            const content = await attendanceContent.evaluate(el => el.innerHTML);
            console.log('📄 attendanceContent 內容長度:', content.length);
        } else {
            console.log('❌ 找不到 attendanceContent');
        }
        
        // 檢查 currentAttendanceData
        console.log('🔍 檢查 currentAttendanceData...');
        const currentData = await page.evaluate(() => {
            return window.currentAttendanceData;
        });
        
        console.log('📊 currentAttendanceData:', currentData);
        
        if (!currentData) {
            console.log('❌ currentAttendanceData 不存在');
            return;
        }
        
        if (!currentData.teacher) {
            console.log('❌ currentAttendanceData.teacher 不存在');
            return;
        }
        
        console.log(`✅ 當前講師: ${currentData.teacher}`);
        
        // 測試 getTeacherWebApi 函數
        console.log('🔍 測試 getTeacherWebApi 函數...');
        const webApiResult = await page.evaluate(async (teacherName) => {
            try {
                const response = await fetch('/api/teacher-web-api', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        teacherName: teacherName
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                return { error: error.message };
            }
        }, currentData.teacher);
        
        console.log('📋 getTeacherWebApi 結果:', webApiResult);
        
        // 填寫課程內容
        console.log('📝 填寫課程內容...');
        const courseContent = await page.$('#course-content');
        if (courseContent) {
            await courseContent.type('測試講師報表內容');
            console.log('✅ 已填寫課程內容');
        } else {
            console.log('❌ 找不到課程內容輸入框');
        }
        
        // 檢查提交按鈕
        console.log('🔍 檢查提交按鈕...');
        const submitBtn = await page.$('#submitTeacherReport');
        if (submitBtn) {
            const isDisabled = await submitBtn.evaluate(el => el.disabled);
            const isVisible = await submitBtn.evaluate(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            });
            const isClickable = await submitBtn.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            });
            
            console.log('📊 提交按鈕狀態:', { isDisabled, isVisible, isClickable });
            
            if (isDisabled) {
                console.log('⚠️ 提交按鈕被禁用');
            } else if (!isVisible) {
                console.log('⚠️ 提交按鈕不可見');
            } else if (!isClickable) {
                console.log('⚠️ 提交按鈕不可點擊');
            } else {
                console.log('✅ 提交按鈕可用');
                
                // 等待一下再點擊
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 點擊提交按鈕
                console.log('👆 點擊提交按鈕...');
                try {
                    await submitBtn.click();
                    console.log('✅ 提交按鈕點擊成功');
                } catch (error) {
                    console.log('❌ 提交按鈕點擊失敗:', error.message);
                    
                    // 嘗試使用 JavaScript 點擊
                    console.log('🔄 嘗試使用 JavaScript 點擊...');
                    await page.evaluate(() => {
                        const btn = document.getElementById('submitTeacherReport');
                        if (btn) {
                            btn.click();
                        }
                    });
                }
                
                // 等待提交完成
                console.log('⏳ 等待提交完成...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        } else {
            console.log('❌ 找不到提交按鈕');
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
testTeacherReportIssue().catch(console.error);
