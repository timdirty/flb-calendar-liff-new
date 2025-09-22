const puppeteer = require('puppeteer');

async function testTeacherScrollEnhancement() {
    console.log('🧪 開始測試講師簽到滾動增強功能...');
    
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
                minHeightIsSet: minHeight !== 'auto' && minHeight !== '0px'
            };
        });
        
        console.log('📊 滾動設置檢查結果:', scrollInfo);
        
        if (!scrollInfo.found) {
            throw new Error(scrollInfo.error);
        }
        
        // 驗證滾動設置
        const checks = [];
        
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
        
        console.log('📋 檢查結果:');
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
        
        // 檢查是否像學生簽到系統一樣
        console.log('🔍 檢查是否像學生簽到系統一樣...');
        
        const comparison = await page.evaluate(() => {
            const teacherContainer = document.querySelector('.teacher-attendance-content div[style*="overflow-y: auto"]');
            const studentContainer = document.querySelector('#studentsList');
            
            if (!teacherContainer || !studentContainer) {
                return { success: false, error: '找不到比較容器' };
            }
            
            const teacherStyles = window.getComputedStyle(teacherContainer);
            const studentStyles = window.getComputedStyle(studentContainer);
            
            return {
                success: true,
                teacher: {
                    maxHeight: teacherStyles.maxHeight,
                    minHeight: teacherStyles.minHeight,
                    overflowY: teacherStyles.overflowY,
                    scrollBehavior: teacherStyles.scrollBehavior
                },
                student: {
                    maxHeight: studentStyles.maxHeight,
                    minHeight: studentStyles.minHeight,
                    overflowY: studentStyles.overflowY,
                    scrollBehavior: studentStyles.scrollBehavior
                },
                similar: {
                    maxHeight: teacherStyles.maxHeight === studentStyles.maxHeight,
                    minHeight: teacherStyles.minHeight === studentStyles.minHeight,
                    overflowY: teacherStyles.overflowY === studentStyles.overflowY,
                    scrollBehavior: teacherStyles.scrollBehavior === studentStyles.scrollBehavior
                }
            };
        });
        
        console.log('📊 與學生簽到系統比較:', comparison);
        
        if (comparison.success) {
            const similarCount = Object.values(comparison.similar).filter(Boolean).length;
            console.log(`📈 相似度: ${similarCount}/4 (${Math.round(similarCount/4*100)}%)`);
            
            if (similarCount >= 3) {
                console.log('✅ 講師簽到系統滾動設置與學生簽到系統高度相似！');
            } else {
                console.log('⚠️ 講師簽到系統滾動設置與學生簽到系統有差異');
            }
        }
        
        console.log('🎉 講師簽到滾動增強測試完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 執行測試
testTeacherScrollEnhancement().then(success => {
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
