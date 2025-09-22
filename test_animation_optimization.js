const puppeteer = require('puppeteer');

async function testAnimationOptimization() {
    console.log('🧪 開始測試動畫優化...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 設置用戶代理為手機
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
        
        // 捕獲性能指標
        const performanceMetrics = [];
        const consoleMessages = [];
        
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: Date.now()
            });
        });
        
        // 監聽性能指標
        await page.evaluateOnNewDocument(() => {
            window.performanceMetrics = {
                frameCount: 0,
                lastFrameTime: 0,
                animationCount: 0,
                memoryUsage: 0
            };
            
            // 監聽動畫管理器
            const originalRAF = window.requestAnimationFrame;
            window.requestAnimationFrame = function(callback) {
                window.performanceMetrics.frameCount++;
                window.performanceMetrics.lastFrameTime = performance.now();
                return originalRAF.call(this, callback);
            };
        });
        
        console.log('📱 導航到頁面...');
        await page.goto('http://localhost:3001/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 測試動畫管理器
        console.log('🔍 測試動畫管理器...');
        const animationManagerStatus = await page.evaluate(() => {
            if (typeof animationManager !== 'undefined') {
                return {
                    exists: true,
                    animationCount: animationManager.animations.size,
                    isPageVisible: animationManager.isPageVisible,
                    rafId: animationManager.rafId !== null
                };
            }
            return { exists: false };
        });
        
        console.log('📊 動畫管理器狀態:', animationManagerStatus);
        
        // 測試頁面可見性暫停機制
        console.log('👁️ 測試頁面可見性暫停機制...');
        await page.evaluate(() => {
            // 模擬頁面隱藏
            Object.defineProperty(document, 'hidden', {
                writable: true,
                value: true
            });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pausedStatus = await page.evaluate(() => {
            if (typeof animationManager !== 'undefined') {
                return {
                    isPageVisible: animationManager.isPageVisible,
                    activeAnimations: Array.from(animationManager.animations.values()).filter(a => a.active).length
                };
            }
            return null;
        });
        
        console.log('📊 暫停狀態:', pausedStatus);
        
        // 恢復頁面可見性
        await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', {
                writable: true,
                value: false
            });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試動畫性能
        console.log('⚡ 測試動畫性能...');
        const performanceData = await page.evaluate(() => {
            const metrics = window.performanceMetrics || {};
            const memoryInfo = performance.memory || {};
            
            return {
                frameCount: metrics.frameCount || 0,
                lastFrameTime: metrics.lastFrameTime || 0,
                memoryUsed: memoryInfo.usedJSHeapSize || 0,
                memoryTotal: memoryInfo.totalJSHeapSize || 0,
                memoryLimit: memoryInfo.jsHeapSizeLimit || 0
            };
        });
        
        console.log('📊 性能數據:', performanceData);
        
        // 測試CSS動畫優化
        console.log('🎨 測試CSS動畫優化...');
        const cssOptimizations = await page.evaluate(() => {
            const root = document.documentElement;
            const computedStyle = getComputedStyle(root);
            
            return {
                animationDuration: computedStyle.getPropertyValue('--animation-duration'),
                transitionDuration: computedStyle.getPropertyValue('--transition-duration'),
                animationTiming: computedStyle.getPropertyValue('--animation-timing'),
                reducedMotion: computedStyle.getPropertyValue('--reduced-motion')
            };
        });
        
        console.log('📊 CSS優化變數:', cssOptimizations);
        
        // 測試設備性能檢測
        console.log('🔋 測試設備性能檢測...');
        const devicePerformance = await page.evaluate(() => {
            if (typeof animationManager !== 'undefined') {
                return {
                    hasWebGL: !!document.createElement('canvas').getContext('webgl'),
                    hardwareConcurrency: navigator.hardwareConcurrency || 0,
                    userAgent: navigator.userAgent
                };
            }
            return null;
        });
        
        console.log('📊 設備性能:', devicePerformance);
        
        // 測試動畫數量
        console.log('📈 測試動畫數量...');
        const animationCount = await page.evaluate(() => {
            const animatedElements = document.querySelectorAll('[style*="animation"], [class*="animation"]');
            const transitionElements = document.querySelectorAll('[style*="transition"], [class*="transition"]');
            
            return {
                animatedElements: animatedElements.length,
                transitionElements: transitionElements.length,
                totalAnimated: animatedElements.length + transitionElements.length
            };
        });
        
        console.log('📊 動畫元素數量:', animationCount);
        
        // 測試課程卡片動畫
        console.log('🎯 測試課程卡片動畫...');
        await page.waitForSelector('.event-card', { timeout: 10000 });
        
        const courseCards = await page.$$('.event-card');
        if (courseCards.length > 0) {
            console.log(`📚 找到 ${courseCards.length} 個課程卡片`);
            
            // 測試卡片懸停動畫
            const firstCard = courseCards[0];
            await firstCard.hover();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const hoverAnimation = await page.evaluate((card) => {
                const computedStyle = getComputedStyle(card);
                return {
                    transform: computedStyle.transform,
                    boxShadow: computedStyle.boxShadow,
                    transition: computedStyle.transition
                };
            }, firstCard);
            
            console.log('📊 懸停動畫效果:', hoverAnimation);
        }
        
        // 檢查控制台錯誤
        const errors = consoleMessages.filter(msg => msg.type === 'error');
        const warnings = consoleMessages.filter(msg => msg.type === 'warn');
        
        console.log('📊 控制台統計:');
        console.log(`  - 總訊息: ${consoleMessages.length}`);
        console.log(`  - 錯誤: ${errors.length}`);
        console.log(`  - 警告: ${warnings.length}`);
        
        if (errors.length > 0) {
            console.log('❌ 發現錯誤:', errors.map(e => e.text));
        }
        
        // 性能評估
        const performanceScore = calculatePerformanceScore(performanceData, animationCount);
        console.log('📊 性能評分:', performanceScore);
        
        if (performanceScore >= 80) {
            console.log('✅ 動畫優化效果良好！');
        } else if (performanceScore >= 60) {
            console.log('⚠️ 動畫優化效果一般，可進一步優化');
        } else {
            console.log('❌ 動畫性能需要改善');
        }
        
        console.log('🎉 動畫優化測試完成！');
        return performanceScore >= 60;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

function calculatePerformanceScore(performanceData, animationCount) {
    let score = 100;
    
    // 基於記憶體使用量評分
    if (performanceData.memoryUsed > 50 * 1024 * 1024) { // 50MB
        score -= 20;
    }
    
    // 基於動畫元素數量評分
    if (animationCount.totalAnimated > 20) {
        score -= 15;
    } else if (animationCount.totalAnimated > 10) {
        score -= 10;
    }
    
    // 基於幀數評分
    if (performanceData.frameCount > 1000) {
        score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
}

// 執行測試
testAnimationOptimization().then(success => {
    if (success) {
        console.log('✅ 動畫優化測試通過！');
        process.exit(0);
    } else {
        console.log('❌ 動畫優化測試失敗！');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 測試執行錯誤:', error);
    process.exit(1);
});
