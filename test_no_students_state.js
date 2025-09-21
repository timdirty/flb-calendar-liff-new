const puppeteer = require('puppeteer');

async function testNoStudentsState() {
    console.log('🧪 開始測試沒學生時的狀態...');
    
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
            if (type === 'log' && (text.includes('學生') || text.includes('錯誤') || text.includes('講師') || text.includes('載入'))) {
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
        console.log('🔍 尋找課程卡片...');
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
        
        // 檢查模態框是否出現
        const modal = await page.$('.attendance-modal');
        if (!modal) {
            console.log('❌ 模態框沒有出現');
            return;
        }
        console.log('✅ 模態框已出現');
        
        // 等待內容載入
        console.log('⏳ 等待內容載入...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 檢查是否有學生資料
        const hasStudents = await page.evaluate(() => {
            return window.loadedStudentsData && 
                   window.loadedStudentsData.students && 
                   window.loadedStudentsData.students.length > 0;
        });
        
        console.log('🔍 檢查學生資料狀態:', { hasStudents });
        
        if (hasStudents) {
            console.log('✅ 有學生資料，檢查學生簽到界面');
            
            // 檢查學生簽到界面元素
            const studentElements = await page.$$('.student-card');
            console.log(`📊 找到 ${studentElements.length} 個學生卡片`);
            
            if (studentElements.length > 0) {
                console.log('✅ 學生簽到界面正常顯示');
            } else {
                console.log('⚠️ 學生簽到界面沒有學生卡片');
            }
        } else {
            console.log('⚠️ 沒有學生資料，檢查錯誤處理');
            
            // 檢查是否顯示錯誤頁面
            const errorPage = await page.$('h3');
            if (errorPage) {
                const errorText = await errorPage.evaluate(el => el.textContent);
                console.log('🔍 錯誤頁面標題:', errorText);
                
                if (errorText.includes('無法載入學生資料') || errorText.includes('載入學生資料時發生錯誤')) {
                    console.log('✅ 顯示錯誤頁面');
                    
                    // 檢查是否有講師簽到按鈕
                    const teacherBtn = await page.$('button[onclick="showTeacherAttendance()"]');
                    if (teacherBtn) {
                        console.log('✅ 找到講師簽到按鈕');
                        
                        // 點擊講師簽到按鈕
                        console.log('👆 點擊講師簽到按鈕...');
                        await teacherBtn.click();
                        
                        // 等待講師簽到界面載入
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // 檢查講師簽到界面
                        const courseContent = await page.$('#course-content');
                        if (courseContent) {
                            console.log('✅ 講師簽到界面已載入');
                            
                            // 檢查人數選擇區域
                            const studentCountSelection = await page.$('#student-count-selection');
                            if (studentCountSelection) {
                                const isVisible = await studentCountSelection.evaluate(el => 
                                    el.style.display !== 'none'
                                );
                                console.log('📊 人數選擇區域顯示狀態:', isVisible);
                                
                                if (isVisible) {
                                    console.log('✅ 人數選擇區域正常顯示（沒學生時）');
                                } else {
                                    console.log('⚠️ 人數選擇區域未顯示');
                                }
                            }
                        } else {
                            console.log('❌ 講師簽到界面載入失敗');
                        }
                    } else {
                        console.log('❌ 沒有找到講師簽到按鈕');
                    }
                } else {
                    console.log('⚠️ 不是預期的錯誤頁面');
                }
            } else {
                console.log('⚠️ 沒有找到錯誤頁面');
            }
        }
        
        // 測試切換到講師簽到標籤
        console.log('🔄 測試切換到講師簽到標籤...');
        const teacherTab = await page.$('[data-tab="teacher-attendance"]');
        if (teacherTab) {
            await teacherTab.click();
            console.log('✅ 已切換到講師簽到標籤');
            
            // 等待講師報表載入
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 檢查講師報表界面
            const courseContent = await page.$('#course-content');
            if (courseContent) {
                console.log('✅ 講師報表界面已載入');
                
                // 檢查人數選擇區域
                const studentCountSelection = await page.$('#student-count-selection');
                if (studentCountSelection) {
                    const isVisible = await studentCountSelection.evaluate(el => 
                        el.style.display !== 'none'
                    );
                    console.log('📊 講師報表中人數選擇區域顯示狀態:', isVisible);
                }
            }
        }
        
        console.log('✅ 沒學生狀態測試完成！');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    } finally {
        console.log('⏳ 等待5秒後關閉瀏覽器...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

// 執行測試
testNoStudentsState().catch(console.error);
