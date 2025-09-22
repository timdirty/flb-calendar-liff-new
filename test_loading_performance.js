const puppeteer = require('puppeteer');

async function testLoadingPerformance() {
    console.log('🔍 開始詳細分析系統載入性能...');
    
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
                milestones: [],
                resources: [],
                apiCalls: [],
                domEvents: []
            };
            
            // 監控資源載入
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'resource') {
                        window.performanceMetrics.resources.push({
                            name: entry.name,
                            duration: entry.duration,
                            size: entry.transferSize || 0,
                            type: entry.initiatorType
                        });
                    }
                }
            });
            observer.observe({ entryTypes: ['resource'] });
        });
        
        // 監控頁面載入時間
        const startTime = Date.now();
        console.log('📱 開始載入頁面...');
        
        await page.goto('http://localhost:3000/public/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        const loadTime = Date.now() - startTime;
        console.log(`⏱️ 頁面載入時間: ${loadTime}ms`);
        
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
                } : null
            };
        });
        
        console.log('📊 性能指標分析:');
        console.log(`  DOM載入時間: ${performanceData.navigation.domContentLoaded.toFixed(2)}ms`);
        console.log(`  完整載入時間: ${performanceData.navigation.loadComplete.toFixed(2)}ms`);
        console.log(`  總載入時間: ${performanceData.navigation.totalTime.toFixed(2)}ms`);
        console.log(`  首次繪製: ${performanceData.paint.firstPaint.toFixed(2)}ms`);
        console.log(`  首次內容繪製: ${performanceData.paint.firstContentfulPaint.toFixed(2)}ms`);
        
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
        
        // 等待系統初始化完成
        console.log('⏳ 等待系統初始化完成...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 檢查初始化狀態
        const initStatus = await page.evaluate(() => {
            const loadingOverlay = document.getElementById('loadingOverlay');
            const mainContainer = document.getElementById('mainContainer');
            
            return {
                loadingVisible: loadingOverlay ? loadingOverlay.style.display !== 'none' : false,
                mainVisible: mainContainer ? mainContainer.style.display !== 'none' : false,
                eventsLoaded: window.allEvents ? window.allEvents.length : 0,
                instructorsLoaded: window.allInstructors ? window.allInstructors.length : 0,
                userLoaded: window.currentUser ? true : false
            };
        });
        
        console.log('🎯 初始化狀態:');
        console.log(`  載入動畫顯示: ${initStatus.loadingVisible ? '是' : '否'}`);
        console.log(`  主內容顯示: ${initStatus.mainVisible ? '是' : '否'}`);
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
        
        // 檢查JavaScript執行時間
        const jsExecutionTime = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script');
            let totalSize = 0;
            scripts.forEach(script => {
                if (script.textContent) {
                    totalSize += script.textContent.length;
                }
            });
            return {
                scriptCount: scripts.length,
                totalSize: totalSize,
                inlineScriptSize: totalSize
            };
        });
        
        console.log('📜 JavaScript分析:');
        console.log(`  腳本數量: ${jsExecutionTime.scriptCount}`);
        console.log(`  內聯腳本大小: ${(jsExecutionTime.inlineScriptSize / 1024).toFixed(2)}KB`);
        
        // 檢查CSS大小
        const cssSize = await page.evaluate(() => {
            const styles = document.querySelectorAll('style');
            let totalSize = 0;
            styles.forEach(style => {
                totalSize += style.textContent.length;
            });
            return totalSize;
        });
        
        console.log(`  CSS大小: ${(cssSize / 1024).toFixed(2)}KB`);
        
        // 性能建議
        console.log('💡 性能優化建議:');
        
        if (performanceData.navigation.totalTime > 3000) {
            console.log('  ⚠️ 總載入時間過長，建議優化');
        }
        
        if (performanceData.paint.firstContentfulPaint > 1500) {
            console.log('  ⚠️ 首次內容繪製時間過長，建議優化關鍵渲染路徑');
        }
        
        const totalResourceSize = performanceData.resources.reduce((sum, r) => sum + r.size, 0);
        if (totalResourceSize > 500 * 1024) {
            console.log('  ⚠️ 資源總大小過大，建議壓縮或懶載入');
        }
        
        if (jsExecutionTime.inlineScriptSize > 100 * 1024) {
            console.log('  ⚠️ 內聯JavaScript過大，建議分離到外部文件');
        }
        
        if (cssSize > 50 * 1024) {
            console.log('  ⚠️ CSS過大，建議壓縮或分離');
        }
        
        console.log('✅ 性能分析完成');
        
    } catch (error) {
        console.error('❌ 性能分析過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testLoadingPerformance().catch(console.error);
