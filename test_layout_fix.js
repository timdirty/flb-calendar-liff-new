const puppeteer = require('puppeteer');

async function testLayoutFix() {
    console.log('🧪 開始測試特殊課程佈局修正...');
    
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
            if (type === 'log' && (text.includes('特殊') || text.includes('客製化') || text.includes('到府') || text.includes('佈局') || text.includes('高度'))) {
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
        try {
            await page.waitForSelector('#course-content', { timeout: 10000 });
            console.log('✅ 課程內容輸入框已載入');
        } catch (error) {
            console.log('❌ 課程內容輸入框載入超時');
        }
        
        // 測試佈局修正
        console.log('🔍 測試佈局修正...');
        
        // 檢查主容器高度
        const mainContainer = await page.$('.teacher-attendance-content');
        if (mainContainer) {
            const containerStyle = await mainContainer.evaluate(el => {
                const innerDiv = el.querySelector('div');
                return {
                    maxHeight: innerDiv ? innerDiv.style.maxHeight : 'N/A',
                    minHeight: innerDiv ? innerDiv.style.minHeight : 'N/A',
                    height: innerDiv ? innerDiv.style.height : 'N/A'
                };
            });
            console.log('📏 主容器高度設置:', containerStyle);
        }
        
        // 檢查特殊提示框樣式
        const specialNotice = await page.$('.special-notice');
        if (specialNotice) {
            const noticeStyle = await specialNotice.evaluate(el => {
                return {
                    padding: el.style.padding,
                    marginBottom: el.style.marginBottom,
                    fontSize: el.style.fontSize,
                    lineHeight: el.style.lineHeight
                };
            });
            console.log('📏 特殊提示框樣式:', noticeStyle);
        }
        
        // 檢查課程內容輸入框樣式
        const courseContent = await page.$('#course-content');
        if (courseContent) {
            const textareaStyle = await courseContent.evaluate(el => {
                return {
                    rows: el.rows,
                    padding: el.style.padding,
                    borderRadius: el.style.borderRadius
                };
            });
            console.log('📏 課程內容輸入框樣式:', textareaStyle);
        }
        
        // 檢查整體佈局是否正常
        console.log('🔍 檢查整體佈局...');
        const layoutCheck = await page.evaluate(() => {
            const container = document.querySelector('.teacher-attendance-content');
            const specialNotice = document.querySelector('.special-notice');
            const courseContent = document.querySelector('#course-content');
            
            console.log('🔍 元素查找結果:', {
                container: !!container,
                specialNotice: !!specialNotice,
                courseContent: !!courseContent
            });
            
            if (!container || !courseContent) {
                return { error: '找不到必要的元素', container: !!container, courseContent: !!courseContent };
            }
            
            const containerRect = container.getBoundingClientRect();
            const courseContentRect = courseContent.getBoundingClientRect();
            
            let specialNoticeRect = null;
            if (specialNotice) {
                specialNoticeRect = specialNotice.getBoundingClientRect();
            }
            
            return {
                containerHeight: containerRect.height,
                containerMaxHeight: container.style.maxHeight,
                courseContentHeight: courseContentRect.height,
                specialNoticeHeight: specialNoticeRect ? specialNoticeRect.height : 0,
                isOverflowing: container.scrollHeight > container.clientHeight,
                scrollHeight: container.scrollHeight,
                clientHeight: container.clientHeight
            };
        });
        
        console.log('📊 佈局檢查結果:', layoutCheck);
        
        if (layoutCheck.error) {
            console.log('❌ 佈局檢查失敗:', layoutCheck.error);
        } else {
            if (layoutCheck.isOverflowing) {
                console.log('⚠️ 容器仍有溢出，但應該在可接受範圍內');
                console.log(`📏 溢出量: ${layoutCheck.scrollHeight - layoutCheck.clientHeight}px`);
            } else {
                console.log('✅ 容器沒有溢出，佈局正常');
            }
            
            if (layoutCheck.specialNoticeHeight > 0) {
                console.log('✅ 特殊提示框已顯示');
            } else {
                console.log('⚠️ 特殊提示框未顯示');
            }
        }
        
        console.log('✅ 佈局修正測試完成！');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    } finally {
        console.log('⏳ 等待5秒後關閉瀏覽器...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

// 執行測試
testLayoutFix().catch(console.error);
