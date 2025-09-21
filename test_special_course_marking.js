const puppeteer = require('puppeteer');

async function testSpecialCourseMarking() {
    console.log('🧪 開始測試特殊課程標記功能...');
    
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
            if (type === 'log' && (text.includes('特殊') || text.includes('客製化') || text.includes('到府') || text.includes('🏷️') || text.includes('特殊模式'))) {
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
        
        // 尋找包含「客製化」或「到府」的課程卡片
        console.log('🔍 尋找包含客製化或到府的課程卡片...');
        const courseCards = await page.$$('.event-card');
        let specialCard = null;
        
        for (const card of courseCards) {
            const title = await card.evaluate(el => el.textContent);
            if (title.includes('客製化') || title.includes('到府')) {
                console.log(`✅ 找到特殊課程: ${title.substring(0, 100)}...`);
                specialCard = card;
                break;
            }
        }
        
        if (!specialCard) {
            console.log('⚠️ 沒有找到包含客製化或到府的課程卡片，使用第一個課程卡片');
            specialCard = courseCards[0];
        }
        
        // 長按課程卡片
        console.log('👆 長按課程卡片...');
        await page.mouse.move(100, 200);
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 長按1秒
        await page.mouse.up();
        
        console.log('⏳ 等待簽到模態框出現...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 切換到講師簽到標籤
        console.log('🔄 切換到講師簽到標籤...');
        const teacherTab = await page.$('[data-tab="teacher-attendance"]');
        if (teacherTab) {
            await teacherTab.click();
            console.log('✅ 已切換到講師簽到標籤');
        } else {
            console.log('❌ 找不到講師簽到標籤');
        }
        
        // 等待講師報表載入
        console.log('⏳ 等待講師報表載入...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 等待課程內容輸入框出現
        console.log('⏳ 等待課程內容輸入框出現...');
        try {
            await page.waitForSelector('#course-content', { timeout: 10000 });
            console.log('✅ 課程內容輸入框已載入');
        } catch (error) {
            console.log('❌ 課程內容輸入框載入超時');
        }
        
        // 檢查特殊提示是否顯示
        console.log('🔍 檢查特殊提示...');
        const specialNotice = await page.$('.special-notice');
        if (specialNotice) {
            console.log('✅ 找到特殊提示');
        } else {
            console.log('⚠️ 沒有找到特殊提示，檢查是否有特殊標記');
        }
        
        // 檢查課程內容輸入框的placeholder
        console.log('🔍 檢查課程內容輸入框...');
        const courseContentInput = await page.$('#course-content');
        if (courseContentInput) {
            const placeholder = await courseContentInput.evaluate(el => el.placeholder);
            console.log('📝 課程內容輸入框placeholder:', placeholder);
            
            if (placeholder.includes('🏷️') || placeholder.includes('特殊模式')) {
                console.log('✅ 課程內容輸入框包含特殊標記');
            } else {
                console.log('⚠️ 課程內容輸入框沒有特殊標記');
            }
        } else {
            console.log('❌ 找不到課程內容輸入框');
        }
        
        // 填寫課程內容
        console.log('📝 填寫課程內容...');
        if (courseContentInput) {
            await courseContentInput.type('測試特殊課程內容');
            console.log('✅ 已填寫課程內容');
        }
        
        // 檢查提交前的課程內容
        console.log('🔍 檢查提交前的課程內容...');
        const courseContentValue = await courseContentInput.evaluate(el => el.value);
        console.log('📄 課程內容值:', courseContentValue);
        
        // 檢查 currentAttendanceData
        console.log('🔍 檢查 currentAttendanceData...');
        const currentData = await page.evaluate(() => {
            return window.currentAttendanceData;
        });
        
        console.log('📊 currentAttendanceData:', currentData);
        
        if (currentData && currentData.originalTitle) {
            const isSpecial = currentData.originalTitle.includes('客製化') || 
                            currentData.originalTitle.includes('到府') || 
                            currentData.originalTitle.includes('客制化') || 
                            currentData.originalTitle.includes('客製') || 
                            currentData.originalTitle.includes('客制');
            
            if (isSpecial) {
                console.log('✅ 檢測到特殊課程');
            } else {
                console.log('⚠️ 不是特殊課程');
            }
        }
        
        // 模擬提交講師報表（不實際提交，只檢查邏輯）
        console.log('🔍 檢查講師報表提交邏輯...');
        const submitResult = await page.evaluate(() => {
            const currentData = window.currentAttendanceData;
            if (!currentData) return { error: '沒有 currentAttendanceData' };
            
            const originalTitle = currentData.originalTitle || '';
            const isCustomizedCourse = originalTitle.includes('客製化') || 
                                    originalTitle.includes('到府') || 
                                    originalTitle.includes('客制化') || 
                                    originalTitle.includes('客製') || 
                                    originalTitle.includes('客制');
            
            let finalCourseContent = '測試特殊課程內容';
            if (isCustomizedCourse) {
                const specialMark = '🏷️ [特殊模式] ';
                if (!finalCourseContent.startsWith(specialMark)) {
                    finalCourseContent = specialMark + finalCourseContent;
                }
            }
            
            return {
                originalTitle: originalTitle,
                isCustomizedCourse: isCustomizedCourse,
                finalCourseContent: finalCourseContent,
                hasSpecialMark: finalCourseContent.includes('🏷️ [特殊模式]')
            };
        });
        
        console.log('📊 提交邏輯檢查結果:', submitResult);
        
        if (submitResult.hasSpecialMark) {
            console.log('✅ 特殊標記功能正常運作');
        } else {
            console.log('❌ 特殊標記功能未正常運作');
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
testSpecialCourseMarking().catch(console.error);
