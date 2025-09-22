const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testCaldavSpeedOptimization() {
    console.log('🚀 開始測試CALDAV速度優化...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        // 讀取HTML文件內容
        const htmlPath = path.join(__dirname, 'public', 'perfect-calendar.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // 設置頁面內容
        await page.setContent(htmlContent, { 
            waitUntil: 'networkidle0',
            url: 'http://localhost:3000'
        });
        
        console.log('📱 頁面內容已載入');
        
        // 等待JavaScript執行
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查CALDAV優化功能
        console.log('🔍 檢查CALDAV優化功能:');
        const caldavOptimizationStatus = await page.evaluate(() => {
            return {
                hasApiOptimizer: typeof window.apiOptimizer !== 'undefined',
                hasCaldavCache: window.apiOptimizer ? typeof window.apiOptimizer.caldavCache !== 'undefined' : false,
                hasPreloadCaldavData: window.apiOptimizer ? typeof window.apiOptimizer.preloadCaldavData === 'function' : false,
                hasCaldavCacheTimeout: window.apiOptimizer ? window.apiOptimizer.caldavCacheTimeout > 0 : false,
                concurrentLimit: window.apiOptimizer ? window.apiOptimizer.concurrentLimit : 0,
                retryDelays: window.apiOptimizer ? window.apiOptimizer.retryDelays : []
            };
        });
        
        console.log(`  apiOptimizer存在: ${caldavOptimizationStatus.hasApiOptimizer ? '✅' : '❌'}`);
        console.log(`  CALDAV快取: ${caldavOptimizationStatus.hasCaldavCache ? '✅' : '❌'}`);
        console.log(`  預載入功能: ${caldavOptimizationStatus.hasPreloadCaldavData ? '✅' : '❌'}`);
        console.log(`  快取超時: ${caldavOptimizationStatus.hasCaldavCacheTimeout ? '✅' : '❌'}`);
        console.log(`  並行限制: ${caldavOptimizationStatus.concurrentLimit}`);
        console.log(`  重試延遲: ${caldavOptimizationStatus.retryDelays.join(', ')}ms`);
        
        // 測試CALDAV快取功能
        console.log('🔍 測試CALDAV快取功能:');
        try {
            const cacheTest = await page.evaluate(async () => {
                if (window.apiOptimizer) {
                    // 測試CALDAV快取設置
                    const testData = { success: true, data: [{ id: 1, title: '測試事件' }] };
                    const cacheKey = 'test_caldav_cache';
                    
                    window.apiOptimizer.setCaldavCache(cacheKey, testData);
                    const retrievedData = window.apiOptimizer.getCaldavCache(cacheKey);
                    
                    return {
                        success: true,
                        setCache: !!retrievedData,
                        dataMatch: JSON.stringify(retrievedData) === JSON.stringify(testData),
                        cacheStats: window.apiOptimizer.getCaldavCacheStats()
                    };
                } else {
                    return { success: false, error: 'apiOptimizer不存在' };
                }
            });
            
            if (cacheTest.success) {
                console.log(`  ✅ CALDAV快取測試成功`);
                console.log(`  快取設置: ${cacheTest.setCache ? '✅' : '❌'}`);
                console.log(`  數據匹配: ${cacheTest.dataMatch ? '✅' : '❌'}`);
                console.log(`  快取統計: ${JSON.stringify(cacheTest.cacheStats)}`);
            } else {
                console.log(`  ❌ CALDAV快取測試失敗: ${cacheTest.error}`);
            }
        } catch (error) {
            console.log(`❌ CALDAV快取測試異常: ${error.message}`);
        }
        
        // 測試CALDAV預載入功能
        console.log('🔍 測試CALDAV預載入功能:');
        try {
            const preloadTest = await page.evaluate(async () => {
                if (window.apiOptimizer && typeof window.apiOptimizer.preloadCaldavData === 'function') {
                    try {
                        const result = await window.apiOptimizer.preloadCaldavData();
                        return {
                            success: true,
                            hasResult: !!result,
                            hasData: result && result.data,
                            fromCache: result && result.fromCache
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error.message
                        };
                    }
                } else {
                    return {
                        success: false,
                        error: 'preloadCaldavData函數不存在'
                    };
                }
            });
            
            if (preloadTest.success) {
                console.log(`  ✅ CALDAV預載入測試成功`);
                console.log(`  有結果: ${preloadTest.hasResult ? '✅' : '❌'}`);
                console.log(`  有數據: ${preloadTest.hasData ? '✅' : '❌'}`);
                console.log(`  來自快取: ${preloadTest.fromCache ? '✅' : '❌'}`);
            } else {
                console.log(`  ❌ CALDAV預載入測試失敗: ${preloadTest.error}`);
            }
        } catch (error) {
            console.log(`❌ CALDAV預載入測試異常: ${error.message}`);
        }
        
        // 測試載入事件優化
        console.log('🔍 測試載入事件優化:');
        try {
            const loadEventsTest = await page.evaluate(async () => {
                if (typeof window.loadEventsOptimized === 'function') {
                    try {
                        const result = await window.loadEventsOptimized();
                        return {
                            success: true,
                            hasResult: !!result,
                            success: result && result.success,
                            fromCache: result && result.fromCache
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error.message
                        };
                    }
                } else {
                    return {
                        success: false,
                        error: 'loadEventsOptimized函數不存在'
                    };
                }
            });
            
            if (loadEventsTest.success) {
                console.log(`  ✅ 載入事件優化測試成功`);
                console.log(`  有結果: ${loadEventsTest.hasResult ? '✅' : '❌'}`);
                console.log(`  成功: ${loadEventsTest.success ? '✅' : '❌'}`);
                console.log(`  來自快取: ${loadEventsTest.fromCache ? '✅' : '❌'}`);
            } else {
                console.log(`  ❌ 載入事件優化測試失敗: ${loadEventsTest.error}`);
            }
        } catch (error) {
            console.log(`❌ 載入事件優化測試異常: ${error.message}`);
        }
        
        // 檢查性能優化設置
        console.log('🔍 檢查性能優化設置:');
        const performanceSettings = await page.evaluate(() => {
            return {
                hasAnimationManager: typeof window.animationManager !== 'undefined',
                hasPerformanceOptimizer: typeof window.PerformanceOptimizer !== 'undefined',
                hasLazyLoad: window.PerformanceOptimizer ? typeof window.PerformanceOptimizer.lazyLoadNonCriticalFeatures === 'function' : false,
                hasPreloadResources: window.PerformanceOptimizer ? typeof window.PerformanceOptimizer.preloadCriticalResources === 'function' : false
            };
        });
        
        console.log(`  動畫管理器: ${performanceSettings.hasAnimationManager ? '✅' : '❌'}`);
        console.log(`  性能優化器: ${performanceSettings.hasPerformanceOptimizer ? '✅' : '❌'}`);
        console.log(`  懶載入: ${performanceSettings.hasLazyLoad ? '✅' : '❌'}`);
        console.log(`  預載入資源: ${performanceSettings.hasPreloadResources ? '✅' : '❌'}`);
        
        // 檢查控制台錯誤
        console.log('🔍 檢查控制台錯誤:');
        const consoleErrors = await page.evaluate(() => {
            return window.consoleErrors || [];
        });
        
        if (consoleErrors.length > 0) {
            console.log('❌ 發現控制台錯誤:');
            consoleErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        } else {
            console.log('✅ 沒有發現控制台錯誤');
        }
        
        // 最終優化評分
        console.log('🏆 CALDAV速度優化評分:');
        let score = 100;
        
        // CALDAV優化檢查
        if (!caldavOptimizationStatus.hasApiOptimizer) score -= 20;
        if (!caldavOptimizationStatus.hasCaldavCache) score -= 15;
        if (!caldavOptimizationStatus.hasPreloadCaldavData) score -= 15;
        if (!caldavOptimizationStatus.hasCaldavCacheTimeout) score -= 10;
        if (caldavOptimizationStatus.concurrentLimit < 5) score -= 10;
        if (caldavOptimizationStatus.retryDelays.length < 3) score -= 10;
        
        // 性能優化檢查
        if (!performanceSettings.hasAnimationManager) score -= 5;
        if (!performanceSettings.hasPerformanceOptimizer) score -= 5;
        if (!performanceSettings.hasLazyLoad) score -= 5;
        if (!performanceSettings.hasPreloadResources) score -= 5;
        
        // 控制台錯誤檢查
        if (consoleErrors.length > 0) score -= 10;
        
        console.log(`  總分: ${score}/100`);
        
        if (score >= 90) {
            console.log('  🎉 優秀！CALDAV速度優化完成');
        } else if (score >= 80) {
            console.log('  ✅ 良好！大部分優化已完成');
        } else if (score >= 70) {
            console.log('  ⚠️ 一般！還有一些優化需要完成');
        } else {
            console.log('  ❌ 需要改進！優化工作還需要繼續');
        }
        
        // 優化建議
        console.log('💡 CALDAV速度優化建議:');
        
        if (!caldavOptimizationStatus.hasCaldavCache) {
            console.log('  ⚠️ CALDAV快取未啟用，建議檢查');
        }
        
        if (!caldavOptimizationStatus.hasPreloadCaldavData) {
            console.log('  ⚠️ CALDAV預載入功能未啟用，建議檢查');
        }
        
        if (caldavOptimizationStatus.concurrentLimit < 5) {
            console.log('  ⚠️ 並行請求限制較低，建議增加');
        }
        
        if (caldavOptimizationStatus.retryDelays.length < 3) {
            console.log('  ⚠️ 重試延遲設置不完整，建議檢查');
        }
        
        console.log('✅ CALDAV速度優化測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testCaldavSpeedOptimization().catch(console.error);
