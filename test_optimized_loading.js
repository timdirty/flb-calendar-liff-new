const puppeteer = require('puppeteer');

async function testOptimizedLoading() {
    console.log('🚀 開始測試優化後的載入性能...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        // 啟用性能監控
        await page.evaluateOnNewDocument(() => {
            window.performanceMetrics = {
                startTime: performance.now(),
                phases: {},
                resources: [],
                optimizations: []
            };
            
            // 監控各階段時間
            const originalConsoleLog = console.log;
            console.log = function(...args) {
                const message = args.join(' ');
                if (message.includes('第一階段完成')) {
                    window.performanceMetrics.phases.phase1 = performance.now() - window.performanceMetrics.startTime;
                } else if (message.includes('第二階段完成')) {
                    window.performanceMetrics.phases.phase2 = performance.now() - window.performanceMetrics.startTime;
                } else if (message.includes('第三階段完成')) {
                    window.performanceMetrics.phases.phase3 = performance.now() - window.performanceMetrics.startTime;
                } else if (message.includes('總初始化時間')) {
                    window.performanceMetrics.phases.total = performance.now() - window.performanceMetrics.startTime;
                }
                originalConsoleLog.apply(console, args);
            };
        });
        
        // 監控頁面載入時間
        const startTime = Date.now();
        console.log('📱 開始載入優化後的頁面...');
        
        await page.goto('http://localhost:3000/public/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        const loadTime = Date.now() - startTime;
        console.log(`⏱️ 頁面載入時間: ${loadTime}ms`);
        
        // 等待系統初始化完成
        console.log('⏳ 等待系統初始化完成...');
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        // 獲取性能指標
        const performanceData = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            const resources = performance.getEntriesByType('resource');
            
            return {
                navigation: {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    totalTime: navigation.loadEventEnd - navigation.fetchStart
                },
                paint: {
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
                },
                resources: resources.map(r => ({
                    name: r.name,
                    duration: r.duration,
                    size: r.transferSize || 0,
                    type: r.initiatorType
                })),
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null,
                phases: window.performanceMetrics?.phases || {},
                optimizations: window.performanceMetrics?.optimizations || []
            };
        });
        
        console.log('📊 優化後性能指標分析:');
        console.log(`  DOM載入時間: ${performanceData.navigation.domContentLoaded.toFixed(2)}ms`);
        console.log(`  完整載入時間: ${performanceData.navigation.loadComplete.toFixed(2)}ms`);
        console.log(`  總載入時間: ${performanceData.navigation.totalTime.toFixed(2)}ms`);
        console.log(`  首次繪製: ${performanceData.paint.firstPaint.toFixed(2)}ms`);
        console.log(`  首次內容繪製: ${performanceData.paint.firstContentfulPaint.toFixed(2)}ms`);
        
        // 分析各階段時間
        console.log('🔄 分階段載入時間:');
        if (performanceData.phases.phase1) {
            console.log(`  第一階段（基礎初始化）: ${performanceData.phases.phase1.toFixed(2)}ms`);
        }
        if (performanceData.phases.phase2) {
            console.log(`  第二階段（資源載入）: ${performanceData.phases.phase2.toFixed(2)}ms`);
        }
        if (performanceData.phases.phase3) {
            console.log(`  第三階段（講師比對）: ${performanceData.phases.phase3.toFixed(2)}ms`);
        }
        if (performanceData.phases.total) {
            console.log(`  總初始化時間: ${performanceData.phases.total.toFixed(2)}ms`);
        }
        
        // 檢查優化功能
        console.log('⚡ 優化功能檢查:');
        const optimizationStatus = await page.evaluate(() => {
            return {
                hasPerformanceOptimizer: typeof window.PerformanceOptimizer !== 'undefined',
                hasApiOptimizer: typeof window.apiOptimizer !== 'undefined',
                hasAnimationManager: typeof window.animationManager !== 'undefined',
                hasPreloadLinks: document.querySelectorAll('link[rel="preload"]').length > 0,
                hasPrefetchLinks: document.querySelectorAll('link[rel="prefetch"]').length > 0,
                hasLazyLoadElements: document.querySelectorAll('[data-lazy-load]').length > 0,
                cacheEnabled: localStorage.getItem('calendar_events_cache') !== null
            };
        });
        
        Object.entries(optimizationStatus).forEach(([key, value]) => {
            console.log(`  ${key}: ${value ? '✅' : '❌'}`);
        });
        
        // 檢查初始化狀態
        const initStatus = await page.evaluate(() => {
            const loadingOverlay = document.getElementById('loadingOverlay');
            const mainContainer = document.getElementById('mainContainer');
            
            return {
                loadingVisible: loadingOverlay ? loadingOverlay.style.display !== 'none' : false,
                mainVisible: mainContainer ? mainContainer.style.display !== 'none' : false,
                eventsLoaded: window.allEvents ? window.allEvents.length : 0,
                instructorsLoaded: window.allInstructors ? window.allInstructors.length : 0,
                userLoaded: window.currentUser ? true : false,
                systemInitialized: !loadingOverlay || loadingOverlay.style.display === 'none'
            };
        });
        
        console.log('🎯 初始化狀態:');
        console.log(`  載入動畫顯示: ${initStatus.loadingVisible ? '是' : '否'}`);
        console.log(`  主內容顯示: ${initStatus.mainVisible ? '是' : '否'}`);
        console.log(`  系統已初始化: ${initStatus.systemInitialized ? '是' : '否'}`);
        console.log(`  事件數量: ${initStatus.eventsLoaded}`);
        console.log(`  講師數量: ${initStatus.instructorsLoaded}`);
        console.log(`  用戶已載入: ${initStatus.userLoaded ? '是' : '否'}`);
        
        // 檢查記憶體使用
        if (performanceData.memory) {
            console.log('💾 記憶體使用:');
            console.log(`  已使用: ${(performanceData.memory.used / 1024 / 1024).toFixed(2)}MB`);
            console.log(`  總計: ${(performanceData.memory.total / 1024 / 1024).toFixed(2)}MB`);
            console.log(`  限制: ${(performanceData.memory.limit / 1024 / 1024).toFixed(2)}MB`);
        }
        
        // 分析資源載入
        console.log('📦 資源載入分析:');
        const resourceStats = performanceData.resources.reduce((acc, resource) => {
            if (!acc[resource.type]) {
                acc[resource.type] = { count: 0, totalSize: 0, totalDuration: 0 };
            }
            acc[resource.type].count++;
            acc[resource.type].totalSize += resource.size;
            acc[resource.type].totalDuration += resource.duration;
            return acc;
        }, {});
        
        Object.entries(resourceStats).forEach(([type, stats]) => {
            console.log(`  ${type}: ${stats.count}個資源, ${(stats.totalSize / 1024).toFixed(2)}KB, ${stats.totalDuration.toFixed(2)}ms`);
        });
        
        // 檢查外部資源
        console.log('🌐 外部資源分析:');
        const externalResources = performanceData.resources.filter(r => 
            r.name.includes('cdnjs.cloudflare.com') || 
            r.name.includes('static.line-scdn.net')
        );
        
        externalResources.forEach(resource => {
            console.log(`  ${resource.name}: ${(resource.size / 1024).toFixed(2)}KB, ${resource.duration.toFixed(2)}ms`);
        });
        
        // 性能評分
        console.log('🏆 性能評分:');
        let score = 100;
        
        if (performanceData.navigation.totalTime > 2000) score -= 20;
        if (performanceData.paint.firstContentfulPaint > 1000) score -= 15;
        if (performanceData.memory && performanceData.memory.used > 10 * 1024 * 1024) score -= 10;
        if (!initStatus.systemInitialized) score -= 30;
        if (!optimizationStatus.hasPerformanceOptimizer) score -= 10;
        if (!optimizationStatus.cacheEnabled) score -= 5;
        
        console.log(`  總分: ${score}/100`);
        
        if (score >= 90) {
            console.log('  🎉 優秀！系統載入性能非常好');
        } else if (score >= 80) {
            console.log('  ✅ 良好！系統載入性能不錯');
        } else if (score >= 70) {
            console.log('  ⚠️ 一般！還有優化空間');
        } else {
            console.log('  ❌ 需要改進！載入性能有待提升');
        }
        
        // 優化建議
        console.log('💡 進一步優化建議:');
        
        if (performanceData.navigation.totalTime > 2000) {
            console.log('  ⚠️ 總載入時間仍然較長，建議進一步優化');
        }
        
        if (performanceData.paint.firstContentfulPaint > 1000) {
            console.log('  ⚠️ 首次內容繪製時間較長，建議優化關鍵渲染路徑');
        }
        
        if (!initStatus.systemInitialized) {
            console.log('  ⚠️ 系統初始化未完成，建議檢查初始化流程');
        }
        
        if (!optimizationStatus.cacheEnabled) {
            console.log('  ⚠️ 快取機制未啟用，建議檢查快取邏輯');
        }
        
        console.log('✅ 優化後性能測試完成');
        
    } catch (error) {
        console.error('❌ 性能測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testOptimizedLoading().catch(console.error);
