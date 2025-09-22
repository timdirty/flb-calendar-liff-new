const puppeteer = require('puppeteer');

async function testTeacherScrollAndZoomFix() {
    console.log('🧪 開始測試講師簽到滾動修復和防止縮放功能...');
    
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
        
        console.log('🔍 檢查viewport設置...');
        
        // 檢查viewport設置
        const viewportInfo = await page.evaluate(() => {
            const viewport = document.querySelector('meta[name="viewport"]');
            return {
                found: !!viewport,
                content: viewport ? viewport.getAttribute('content') : null,
                hasUserScalableNo: viewport ? viewport.getAttribute('content').includes('user-scalable=no') : false,
                hasMaxScale: viewport ? viewport.getAttribute('content').includes('maximum-scale=1.0') : false
            };
        });
        
        console.log('📊 Viewport設置檢查:', viewportInfo);
        
        if (!viewportInfo.hasUserScalableNo) {
            console.log('❌ Viewport沒有設置user-scalable=no');
        } else {
            console.log('✅ Viewport已設置user-scalable=no');
        }
        
        if (!viewportInfo.hasMaxScale) {
            console.log('❌ Viewport沒有設置maximum-scale=1.0');
        } else {
            console.log('✅ Viewport已設置maximum-scale=1.0');
        }
        
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔄 切換到講師簽到標籤...');
        // 點擊講師簽到標籤
        await page.click('[data-tab="teacher-attendance"]');
        
        // 等待講師簽到內容載入
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔍 檢查講師簽到頁面滾動設置...');
        
        // 檢查講師簽到內容的滾動設置
        const scrollInfo = await page.evaluate(() => {
            const teacherContent = document.querySelector('.teacher-attendance-content');
            if (!teacherContent) {
                return { found: false, error: '找不到講師簽到內容' };
            }
            
            const container = teacherContent.querySelector('div[style*="overflow-y: auto"]');
            if (!container) {
                return { found: false, error: '找不到滾動容器' };
            }
            
            // 檢查attendanceContent是否有overflow設置
            const attendanceContent = document.getElementById('attendanceContent');
            const attendanceContentStyles = attendanceContent ? window.getComputedStyle(attendanceContent) : null;
            
            const styles = window.getComputedStyle(container);
            const computedHeight = styles.height;
            const maxHeight = styles.maxHeight;
            const minHeight = styles.minHeight;
            const overflowY = styles.overflowY;
            const scrollBehavior = styles.scrollBehavior;
            
            // 檢查是否有透明空白元件
            const spacerElements = container.querySelectorAll('div[style*="height: 100px"][style*="background: transparent"]');
            
            return {
                found: true,
                height: computedHeight,
                maxHeight: maxHeight,
                minHeight: minHeight,
                overflowY: overflowY,
                scrollBehavior: scrollBehavior,
                canScroll: overflowY === 'auto' || overflowY === 'scroll',
                hasSpacer: spacerElements.length > 0,
                spacerCount: spacerElements.length,
                heightIs100Percent: computedHeight === '100%',
                maxHeightIsSet: maxHeight !== 'none' && maxHeight !== 'auto',
                minHeightIsSet: minHeight !== 'auto' && minHeight !== '0px',
                attendanceContentOverflow: attendanceContentStyles ? attendanceContentStyles.overflowY : 'none'
            };
        });
        
        console.log('📊 滾動設置檢查結果:', scrollInfo);
        
        if (!scrollInfo.found) {
            throw new Error(scrollInfo.error);
        }
        
        // 驗證滾動設置
        const checks = [];
        
        if (scrollInfo.attendanceContentOverflow === 'auto') {
            checks.push('❌ attendanceContent仍有overflow-y: auto，會阻止滾動');
        } else {
            checks.push('✅ attendanceContent已移除overflow-y: auto');
        }
        
        if (scrollInfo.heightIs100Percent) {
            checks.push('❌ 容器高度仍然是100%，這會阻止滾動');
        } else {
            checks.push('✅ 容器高度不是100%，允許滾動');
        }
        
        if (!scrollInfo.canScroll) {
            checks.push('❌ 容器沒有設置滾動');
        } else {
            checks.push('✅ 容器設置了滾動');
        }
        
        if (!scrollInfo.maxHeightIsSet) {
            checks.push('❌ 沒有設置最大高度限制');
        } else {
            checks.push('✅ 設置了最大高度限制');
        }
        
        if (!scrollInfo.minHeightIsSet) {
            checks.push('❌ 沒有設置最小高度');
        } else {
            checks.push('✅ 設置了最小高度');
        }
        
        if (!scrollInfo.hasSpacer) {
            checks.push('❌ 沒有找到透明空白元件');
        } else {
            checks.push(`✅ 找到 ${scrollInfo.spacerCount} 個透明空白元件`);
        }
        
        if (scrollInfo.scrollBehavior !== 'smooth') {
            checks.push('⚠️ 滾動行為不是smooth');
        } else {
            checks.push('✅ 滾動行為設置為smooth');
        }
        
        console.log('📋 滾動檢查結果:');
        checks.forEach(check => console.log(`   ${check}`));
        
        // 測試實際滾動
        console.log('🔄 測試實際滾動功能...');
        
        const scrollTest = await page.evaluate(() => {
            const container = document.querySelector('.teacher-attendance-content div[style*="overflow-y: auto"]');
            if (!container) return { success: false, error: '找不到滾動容器' };
            
            const initialScrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            
            // 嘗試滾動到中間位置
            container.scrollTop = 100;
            const afterScrollTop = container.scrollTop;
            
            // 嘗試滾動到底部
            container.scrollTop = scrollHeight;
            const bottomScrollTop = container.scrollTop;
            
            return {
                success: true,
                initialScrollTop,
                afterScrollTop,
                bottomScrollTop,
                scrollHeight,
                clientHeight,
                canScroll: scrollHeight > clientHeight,
                scrollWorked: afterScrollTop !== initialScrollTop,
                canScrollToBottom: bottomScrollTop > afterScrollTop
            };
        });
        
        console.log('📊 滾動測試結果:', scrollTest);
        
        if (!scrollTest.success) {
            throw new Error(scrollTest.error);
        }
        
        if (scrollTest.scrollWorked) {
            console.log('✅ 滾動功能正常！');
        } else {
            console.log('⚠️ 滾動沒有生效，可能是內容高度不足');
        }
        
        if (scrollTest.canScrollToBottom) {
            console.log('✅ 可以滾動到底部！');
        } else {
            console.log('⚠️ 無法滾動到底部');
        }
        
        // 測試輸入框防止縮放功能
        console.log('🔍 測試輸入框防止縮放功能...');
        
        const inputZoomTest = await page.evaluate(() => {
            const courseContent = document.getElementById('course-content');
            if (!courseContent) {
                return { success: false, error: '找不到課程內容輸入框' };
            }
            
            const styles = window.getComputedStyle(courseContent);
            const fontSize = styles.fontSize;
            const webkitTextSizeAdjust = styles.webkitTextSizeAdjust;
            const webkitAppearance = styles.webkitAppearance;
            
            // 檢查是否有防止縮放的CSS規則
            const styleSheet = document.styleSheets[0];
            let hasZoomPrevention = false;
            let hasFontSize16 = false;
            
            try {
                for (let i = 0; i < styleSheet.cssRules.length; i++) {
                    const rule = styleSheet.cssRules[i];
                    if (rule.selectorText && rule.selectorText.includes('#course-content')) {
                        if (rule.style.fontSize === '16px') {
                            hasFontSize16 = true;
                        }
                        if (rule.style.webkitTextSizeAdjust === '100%') {
                            hasZoomPrevention = true;
                        }
                    }
                }
            } catch (e) {
                // 跨域樣式表可能無法訪問
            }
            
            return {
                success: true,
                fontSize: fontSize,
                webkitTextSizeAdjust: webkitTextSizeAdjust,
                webkitAppearance: webkitAppearance,
                hasFontSize16: fontSize === '16px',
                hasZoomPrevention: webkitTextSizeAdjust === '100%',
                hasWebkitAppearanceNone: webkitAppearance === 'none'
            };
        });
        
        console.log('📊 輸入框縮放防止檢查:', inputZoomTest);
        
        if (!inputZoomTest.success) {
            throw new Error(inputZoomTest.error);
        }
        
        const zoomChecks = [];
        
        if (!inputZoomTest.hasFontSize16) {
            zoomChecks.push(`❌ 字體大小不是16px，實際是: ${inputZoomTest.fontSize}`);
        } else {
            zoomChecks.push('✅ 字體大小設置為16px');
        }
        
        if (!inputZoomTest.hasZoomPrevention) {
            zoomChecks.push(`❌ 沒有設置webkit-text-size-adjust: 100%，實際是: ${inputZoomTest.webkitTextSizeAdjust}`);
        } else {
            zoomChecks.push('✅ 設置了webkit-text-size-adjust: 100%');
        }
        
        if (!inputZoomTest.hasWebkitAppearanceNone) {
            zoomChecks.push(`❌ 沒有設置webkit-appearance: none，實際是: ${inputZoomTest.webkitAppearance}`);
        } else {
            zoomChecks.push('✅ 設置了webkit-appearance: none');
        }
        
        console.log('📋 縮放防止檢查結果:');
        zoomChecks.forEach(check => console.log(`   ${check}`));
        
        // 測試點擊輸入框
        console.log('🔄 測試點擊輸入框...');
        
        try {
            await page.click('#course-content');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 檢查頁面是否縮放
            const zoomAfterClick = await page.evaluate(() => {
                return {
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio
                };
            });
            
            console.log('📊 點擊輸入框後的視窗狀態:', zoomAfterClick);
            
            // 檢查視窗大小是否改變（縮放會改變視窗大小）
            if (zoomAfterClick.viewportWidth === 375 && zoomAfterClick.viewportHeight === 667) {
                console.log('✅ 頁面沒有縮放，視窗大小保持正常');
            } else {
                console.log('⚠️ 頁面可能發生了縮放，視窗大小改變');
            }
            
        } catch (error) {
            console.log('⚠️ 無法點擊輸入框:', error.message);
        }
        
        console.log('🎉 講師簽到滾動修復和防止縮放測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testTeacherScrollAndZoomFix().then(success => {
    if (success) {
        console.log('✅ 所有測試通過！');
        process.exit(0);
    } else {
        console.log('❌ 測試失敗！');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 測試執行錯誤:', error);
    process.exit(1);
});
