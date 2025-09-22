const puppeteer = require('puppeteer');

async function testAPIOptimization() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 }, // iPhone X 尺寸
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 375, height: 812 });
    
    try {
        console.log('🚀 開始測試API優化...');
        
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
        
        // 檢查API優化器是否存在
        const apiOptimizerExists = await page.evaluate(() => {
            return {
                exists: !!window.apiOptimizer,
                cacheSize: window.apiOptimizer ? window.apiOptimizer.cache.size : 0,
                concurrentLimit: window.apiOptimizer ? window.apiOptimizer.concurrentLimit : 0,
                cacheTimeout: window.apiOptimizer ? window.apiOptimizer.cacheTimeout : 0
            };
        });
        
        console.log('📊 API優化器狀態:', apiOptimizerExists);
        
        // 測試預載入功能
        const preloadTest = await page.evaluate(() => {
            const eventCards = document.querySelectorAll('.event-card');
            return {
                cardCount: eventCards.length,
                hasPreloadHandlers: eventCards.length > 0 ? 
                    eventCards[0]._preloadHandler !== undefined : false
            };
        });
        
        console.log('📊 預載入功能測試:', preloadTest);
        
        // 測試載入動畫
        const loadingAnimationTest = await page.evaluate(() => {
            return {
                showOptimizedLoadingAnimation: typeof window.showOptimizedLoadingAnimation === 'function',
                hideOptimizedLoadingAnimation: typeof window.hideOptimizedLoadingAnimation === 'function'
            };
        });
        
        console.log('📊 載入動畫測試:', loadingAnimationTest);
        
        // 測試API請求優化
        const apiRequestTest = await page.evaluate(async () => {
            try {
                // 測試優化的API請求
                const result = await window.apiOptimizer.optimizedFetch('/api/events', {
                    method: 'GET'
                });
                
                return {
                    success: true,
                    fromCache: result.fromCache,
                    hasData: !!result.data
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        });
        
        console.log('📊 API請求優化測試:', apiRequestTest);
        
        // 測試緩存功能
        const cacheTest = await page.evaluate(async () => {
            try {
                // 第一次請求
                const result1 = await window.apiOptimizer.optimizedFetch('/api/events', {
                    method: 'GET'
                });
                
                // 第二次請求（應該從緩存）
                const result2 = await window.apiOptimizer.optimizedFetch('/api/events', {
                    method: 'GET'
                });
                
                return {
                    firstRequest: !result1.fromCache,
                    secondRequest: result2.fromCache,
                    cacheWorking: result2.fromCache
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        });
        
        console.log('📊 緩存功能測試:', cacheTest);
        
        // 測試結果
        const allTestsPassed = 
            apiOptimizerExists.exists &&
            preloadTest.cardCount > 0 &&
            loadingAnimationTest.showOptimizedLoadingAnimation &&
            loadingAnimationTest.hideOptimizedLoadingAnimation &&
            apiRequestTest.success &&
            cacheTest.cacheWorking;
        
        if (allTestsPassed) {
            console.log('✅ API優化測試通過！');
        } else {
            console.log('❌ API優化測試失敗');
        }
        
        return allTestsPassed;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
        return false;
    } finally {
        await browser.close();
    }
}

testAPIOptimization().then(success => {
    if (success) {
        console.log('🎉 API優化成功！');
    } else {
        console.log('💥 API優化需要進一步改進');
    }
});

