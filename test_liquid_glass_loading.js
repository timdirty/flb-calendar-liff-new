const puppeteer = require('puppeteer');

async function testLiquidGlassLoading() {
    console.log('🧪 開始測試液態玻璃載入動畫...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        // 導航到頁面
        console.log('📱 導航到頁面...');
        await page.goto('http://localhost:3000/public/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入完成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 點擊今日按鈕
        console.log('📅 點擊今日按鈕...');
        try {
            await page.click('button[data-view="today"]');
        } catch (error) {
            console.log('⚠️ 今日按鈕未找到，嘗試其他選擇器...');
            await page.click('#today-btn');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 等待事件卡片載入
        console.log('⏳ 等待事件卡片載入...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        // 點擊第一個事件卡片
        console.log('🎯 點擊第一個事件卡片...');
        const eventCards = await page.$$('.event-card');
        if (eventCards.length > 0) {
            await eventCards[0].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 等待模態框出現
        console.log('🔄 等待模態框出現...');
        await page.waitForSelector('.attendance-modal-content', { timeout: 5000 });
        
        // 點擊講師簽到標籤
        console.log('👨‍🏫 點擊講師簽到標籤...');
        await page.click('[data-tab="teacher-attendance"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查是否出現載入動畫
        console.log('🔍 檢查載入動畫...');
        const loadingOverlay = await page.$('.student-loading-overlay');
        const optimizedLoadingOverlay = await page.$('#optimized-loading-overlay');
        
        if (loadingOverlay || optimizedLoadingOverlay) {
            console.log('✅ 載入動畫已顯示');
            
            // 檢查液態玻璃效果
            const liquidGlassElements = await page.evaluate(() => {
                const elements = [];
                
                // 檢查載入遮罩的液態玻璃效果
                const overlay = document.querySelector('.student-loading-overlay') || document.querySelector('#optimized-loading-overlay');
                if (overlay) {
                    const styles = window.getComputedStyle(overlay);
                    elements.push({
                        type: 'loading-overlay',
                        backdropFilter: styles.backdropFilter,
                        background: styles.background,
                        border: styles.border,
                        boxShadow: styles.boxShadow
                    });
                }
                
                // 檢查載入容器的液態玻璃效果
                const container = overlay?.querySelector('div');
                if (container) {
                    const styles = window.getComputedStyle(container);
                    elements.push({
                        type: 'loading-container',
                        backdropFilter: styles.backdropFilter,
                        background: styles.background,
                        border: styles.border,
                        borderRadius: styles.borderRadius,
                        boxShadow: styles.boxShadow
                    });
                }
                
                // 檢查液態載入器
                const liquidLoader = overlay?.querySelector('div[style*="position: relative"]');
                if (liquidLoader) {
                    const rings = liquidLoader.querySelectorAll('div[style*="border-radius: 50%"]');
                    elements.push({
                        type: 'liquid-loader',
                        ringCount: rings.length,
                        hasAnimations: Array.from(rings).some(ring => 
                            ring.style.animation && ring.style.animation.includes('liquidSpin')
                        )
                    });
                }
                
                // 檢查背景流動效果
                const liquidBackground = overlay?.querySelector('div[style*="liquidFlow"]');
                if (liquidBackground) {
                    const styles = window.getComputedStyle(liquidBackground);
                    elements.push({
                        type: 'liquid-background',
                        animation: styles.animation,
                        background: styles.background,
                        opacity: styles.opacity
                    });
                }
                
                return elements;
            });
            
            console.log('🎨 液態玻璃效果檢查結果:');
            liquidGlassElements.forEach((element, index) => {
                console.log(`  ${index + 1}. ${element.type}:`);
                Object.entries(element).forEach(([key, value]) => {
                    if (key !== 'type') {
                        console.log(`     ${key}: ${value}`);
                    }
                });
            });
            
            // 檢查動畫是否正在運行
            const animationsRunning = await page.evaluate(() => {
                const overlay = document.querySelector('.student-loading-overlay') || document.querySelector('#optimized-loading-overlay');
                if (!overlay) return false;
                
                const animatedElements = overlay.querySelectorAll('*');
                let runningAnimations = 0;
                
                animatedElements.forEach(el => {
                    const styles = window.getComputedStyle(el);
                    if (styles.animation && styles.animation !== 'none') {
                        runningAnimations++;
                    }
                });
                
                return runningAnimations > 0;
            });
            
            console.log(`🎬 動畫運行狀態: ${animationsRunning ? '✅ 正在運行' : '❌ 未運行'}`);
            
            // 等待載入完成
            console.log('⏳ 等待載入完成...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 檢查載入動畫是否消失
            const loadingStillVisible = await page.evaluate(() => {
                const overlay = document.querySelector('.student-loading-overlay') || document.querySelector('#optimized-loading-overlay');
                return overlay && overlay.style.display !== 'none' && overlay.style.opacity !== '0';
            });
            
            console.log(`🔄 載入動畫狀態: ${loadingStillVisible ? '⏳ 仍在顯示' : '✅ 已隱藏'}`);
            
        } else {
            console.log('❌ 未找到載入動畫');
        }
        
        // 檢查整體視覺效果
        console.log('🎨 檢查整體視覺效果...');
        const visualCheck = await page.evaluate(() => {
            const modal = document.querySelector('.attendance-modal-content');
            if (!modal) return { error: '未找到模態框' };
            
            const styles = window.getComputedStyle(modal);
            return {
                hasBackdropFilter: styles.backdropFilter !== 'none',
                hasGlassEffect: styles.background.includes('rgba') && styles.backdropFilter !== 'none',
                borderRadius: styles.borderRadius,
                boxShadow: styles.boxShadow
            };
        });
        
        console.log('🎨 整體視覺效果:');
        console.log(`  背景模糊: ${visualCheck.hasBackdropFilter ? '✅' : '❌'}`);
        console.log(`  玻璃效果: ${visualCheck.hasGlassEffect ? '✅' : '❌'}`);
        console.log(`  圓角: ${visualCheck.borderRadius}`);
        console.log(`  陰影: ${visualCheck.boxShadow ? '✅' : '❌'}`);
        
        console.log('✅ 液態玻璃載入動畫測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testLiquidGlassLoading().catch(console.error);
