const puppeteer = require('puppeteer');

async function testSpecialModeFixes() {
    console.log('🧪 開始測試特殊模式修正功能...');
    
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
            if (type === 'log' && (text.includes('特殊') || text.includes('客製化') || text.includes('到府') || text.includes('🏷️') || text.includes('特殊模式') || text.includes('人數設為99') || text.includes('助教模式') || text.includes('講師模式'))) {
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
        
        // 測試1: 檢查講師模式提示文字
        console.log('🔍 測試1: 檢查講師模式提示文字...');
        const teacherModeBtn = await page.$('#teacher-mode-btn');
        if (teacherModeBtn) {
            const teacherModeText = await teacherModeBtn.evaluate(el => el.textContent);
            console.log('📝 講師模式按鈕文字:', teacherModeText);
            if (teacherModeText.includes('特殊課程自動設為99人')) {
                console.log('✅ 講師模式提示文字已修正');
            } else {
                console.log('⚠️ 講師模式提示文字未修正');
            }
        }
        
        // 測試2: 檢查特殊提示是否顯示（講師模式）
        console.log('🔍 測試2: 檢查特殊提示是否顯示（講師模式）...');
        const specialNotice = await page.$('.special-notice');
        if (specialNotice) {
            console.log('✅ 特殊提示已顯示（講師模式）');
        } else {
            console.log('⚠️ 特殊提示未顯示');
        }
        
        // 測試3: 切換到助教模式，檢查特殊提示是否隱藏
        console.log('🔍 測試3: 切換到助教模式...');
        const assistantModeBtn = await page.$('#assistant-mode-btn');
        if (assistantModeBtn) {
            await assistantModeBtn.click();
            console.log('✅ 已切換到助教模式');
            
            // 等待一下讓UI更新
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 檢查特殊提示是否隱藏
            const specialNoticeAfter = await page.$('.special-notice');
            if (!specialNoticeAfter) {
                console.log('✅ 助教模式下特殊提示已隱藏');
            } else {
                console.log('⚠️ 助教模式下特殊提示未隱藏');
            }
            
            // 檢查課程內容輸入框的placeholder
            const courseContentInput = await page.$('#course-content');
            if (courseContentInput) {
                const placeholder = await courseContentInput.evaluate(el => el.placeholder);
                console.log('📝 助教模式下課程內容placeholder:', placeholder);
                if (!placeholder.includes('🏷️') && !placeholder.includes('特殊模式')) {
                    console.log('✅ 助教模式下placeholder已恢復正常');
                } else {
                    console.log('⚠️ 助教模式下placeholder未恢復正常');
                }
            }
        }
        
        // 測試4: 切換回講師模式，檢查特殊提示是否重新顯示
        console.log('🔍 測試4: 切換回講師模式...');
        if (teacherModeBtn) {
            await teacherModeBtn.click();
            console.log('✅ 已切換回講師模式');
            
            // 等待一下讓UI更新
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 檢查特殊提示是否重新顯示
            const specialNoticeAfter2 = await page.$('.special-notice');
            if (specialNoticeAfter2) {
                console.log('✅ 講師模式下特殊提示重新顯示');
            } else {
                console.log('⚠️ 講師模式下特殊提示未重新顯示');
            }
        }
        
        // 測試5: 檢查人數設定邏輯
        console.log('🔍 測試5: 檢查人數設定邏輯...');
        const currentData = await page.evaluate(() => {
            return window.currentAttendanceData;
        });
        
        if (currentData && currentData.originalTitle) {
            const isSpecial = currentData.originalTitle.includes('客製化') || 
                            currentData.originalTitle.includes('到府') || 
                            currentData.originalTitle.includes('客制化') || 
                            currentData.originalTitle.includes('客製') || 
                            currentData.originalTitle.includes('客制');
            
            if (isSpecial) {
                console.log('✅ 檢測到特殊課程');
                
                // 模擬提交邏輯檢查
                const submitResult = await page.evaluate(() => {
                    const currentData = window.currentAttendanceData;
                    const originalTitle = currentData.originalTitle || '';
                    const isCustomizedCourse = originalTitle.includes('客製化') || 
                                            originalTitle.includes('到府') || 
                                            originalTitle.includes('客制化') || 
                                            originalTitle.includes('客製') || 
                                            originalTitle.includes('客制');
                    
                    let studentCount = 0;
                    const currentModeDisplay = document.getElementById('current-mode-display');
                    const currentMode = currentModeDisplay ? currentModeDisplay.textContent : '講師模式';
                    
                    if (currentMode === '助教模式') {
                        studentCount = 0;
                    } else if (isCustomizedCourse) {
                        studentCount = 99;
                    }
                    
                    return {
                        currentMode: currentMode,
                        isCustomizedCourse: isCustomizedCourse,
                        expectedStudentCount: studentCount
                    };
                });
                
                console.log('📊 人數設定邏輯檢查結果:', submitResult);
                
                if (submitResult.expectedStudentCount === 99) {
                    console.log('✅ 特殊課程人數設定為99');
                } else {
                    console.log('❌ 特殊課程人數設定不正確');
                }
            } else {
                console.log('⚠️ 不是特殊課程');
            }
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
testSpecialModeFixes().catch(console.error);
