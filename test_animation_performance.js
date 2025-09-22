const puppeteer = require('puppeteer');

async function testAnimationPerformance() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 }, // iPhone X 尺寸
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 375, height: 812 });
    
    try {
        console.log('🚀 開始測試動畫效能優化...');
        
        // 導航到頁面
        await page.goto('http://localhost:3000/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 點擊今日按鈕
        await page.click('button[data-view="today"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試動畫效能
        const performanceData = await page.evaluate(() => {
            const data = {
                animationManager: null,
                cssVariables: {},
                hardwareAcceleration: {},
                performanceMode: false,
                fps: 0
            };
            
            // 檢查AnimationManager
            if (window.animationManager) {
                data.animationManager = {
                    performanceMode: window.animationManager.performanceMode,
                    fps: window.animationManager.fps,
                    animationCount: window.animationManager.animations.size
                };
            }
            
            // 檢查CSS變數
            const root = document.documentElement;
            data.cssVariables = {
                animationDuration: getComputedStyle(root).getPropertyValue('--animation-duration'),
                transitionDuration: getComputedStyle(root).getPropertyValue('--transition-duration'),
                animationTiming: getComputedStyle(root).getPropertyValue('--animation-timing')
            };
            
            // 檢查硬體加速
            const testElements = document.querySelectorAll('.event-card, .btn, .floating-filter-btn');
            testElements.forEach((element, index) => {
                const style = getComputedStyle(element);
                data.hardwareAcceleration[`element_${index}`] = {
                    transform: style.transform,
                    backfaceVisibility: style.backfaceVisibility,
                    willChange: style.willChange,
                    contain: style.contain
                };
            });
            
            return data;
        });
        
        console.log('📊 動畫效能數據:', JSON.stringify(performanceData, null, 2));
        
        // 測試動畫性能
        const animationTest = await page.evaluate(() => {
            const results = {
                animationManagerExists: !!window.animationManager,
                optimizedAnimateExists: typeof window.optimizedAnimate === 'function',
                smoothScrollToExists: typeof window.smoothScrollTo === 'function',
                throttledAnimateExists: typeof window.throttledAnimate === 'function',
                performanceMode: false,
                fps: 0
            };
            
            if (window.animationManager) {
                results.performanceMode = window.animationManager.performanceMode;
                results.fps = window.animationManager.fps;
            }
            
            return results;
        });
        
        console.log('📊 動畫功能測試:', animationTest);
        
        // 測試動畫執行
        const animationExecution = await page.evaluate(() => {
            const testElement = document.querySelector('.event-card');
            if (!testElement) return { success: false, error: 'No test element found' };
            
            try {
                // 測試優化動畫
                if (typeof window.optimizedAnimate === 'function') {
                    const animation = window.optimizedAnimate(testElement, [
                        { transform: 'scale(1.05)', opacity: 0.8 },
                        { transform: 'scale(1)', opacity: 1 }
                    ], { duration: 200 });
                    
                    return { 
                        success: true, 
                        animationType: 'optimized',
                        duration: animation.duration 
                    };
                }
                
                return { success: false, error: 'optimizedAnimate not available' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('📊 動畫執行測試:', animationExecution);
        
        // 測試結果
        const allTestsPassed = 
            performanceData.animationManager &&
            performanceData.cssVariables.animationDuration &&
            animationTest.animationManagerExists &&
            animationTest.optimizedAnimateExists &&
            animationExecution.success;
        
        if (allTestsPassed) {
            console.log('✅ 動畫效能優化測試通過！');
        } else {
            console.log('❌ 動畫效能優化測試失敗');
        }
        
        return allTestsPassed;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
        return false;
    } finally {
        await browser.close();
    }
}

testAnimationPerformance().then(success => {
    if (success) {
        console.log('🎉 動畫效能優化成功！');
    } else {
        console.log('💥 動畫效能優化需要進一步改進');
    }
});
