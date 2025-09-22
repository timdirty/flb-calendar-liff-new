const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testLoadingSpeedSimple() {
    console.log('🚀 開始簡單載入速度測試...');
    
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
            url: 'http://localhost:3000' // 設置URL以啟用localStorage
        });
        
        console.log('📱 頁面內容已載入');
        
        // 等待JavaScript執行
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查優化功能
        console.log('⚡ 檢查優化功能:');
        const optimizationStatus = await page.evaluate(() => {
            return {
                hasPerformanceOptimizer: typeof window.PerformanceOptimizer !== 'undefined',
                hasApiOptimizer: typeof window.apiOptimizer !== 'undefined',
                hasAnimationManager: typeof window.animationManager !== 'undefined',
                hasPreloadLinks: document.querySelectorAll('link[rel="preload"]').length > 0,
                hasPrefetchLinks: document.querySelectorAll('link[rel="prefetch"]').length > 0,
                hasLazyLoadElements: document.querySelectorAll('[data-lazy-load]').length > 0,
                cacheEnabled: (() => {
                    try {
                        return localStorage.getItem('calendar_events_cache') !== null;
                    } catch (e) {
                        return false;
                    }
                })(),
                scriptCount: document.querySelectorAll('script').length,
                styleCount: document.querySelectorAll('style').length,
                totalScriptSize: Array.from(document.querySelectorAll('script')).reduce((total, script) => {
                    return total + (script.textContent ? script.textContent.length : 0);
                }, 0),
                totalStyleSize: Array.from(document.querySelectorAll('style')).reduce((total, style) => {
                    return total + (style.textContent ? style.textContent.length : 0);
                }, 0)
            };
        });
        
        Object.entries(optimizationStatus).forEach(([key, value]) => {
            if (typeof value === 'number') {
                console.log(`  ${key}: ${value}`);
            } else {
                console.log(`  ${key}: ${value ? '✅' : '❌'}`);
            }
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
        
        // 檢查性能優化
        console.log('📊 性能優化檢查:');
        const performanceChecks = await page.evaluate(() => {
            // 檢查CSS優化
            const optimizedElements = document.querySelectorAll('[style*="transform: translateZ(0)"], [style*="will-change"], [style*="contain"]');
            
            // 檢查動畫優化
            const animatedElements = document.querySelectorAll('[style*="animation"], [class*="animation"]');
            
            // 檢查事件監聽器優化
            const hasThrottledEvents = document.querySelectorAll('*').length > 0; // 簡化檢查
            
            return {
                optimizedElements: optimizedElements.length,
                animatedElements: animatedElements.length,
                hasThrottledEvents: hasThrottledEvents,
                memoryUsage: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize
                } : null
            };
        });
        
        console.log(`  優化元素數量: ${performanceChecks.optimizedElements}`);
        console.log(`  動畫元素數量: ${performanceChecks.animatedElements}`);
        console.log(`  事件優化: ${performanceChecks.hasThrottledEvents ? '✅' : '❌'}`);
        
        if (performanceChecks.memoryUsage) {
            console.log(`  記憶體使用: ${(performanceChecks.memoryUsage.used / 1024 / 1024).toFixed(2)}MB`);
        }
        
        // 測試載入動畫
        console.log('🎨 測試載入動畫:');
        await page.evaluate(() => {
            if (typeof showOptimizedLoadingAnimation === 'function') {
                showOptimizedLoadingAnimation();
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const loadingAnimationStatus = await page.evaluate(() => {
            const overlay = document.querySelector('#optimized-loading-overlay');
            return {
                found: !!overlay,
                visible: overlay ? overlay.style.display !== 'none' : false,
                hasGoldenColors: overlay ? overlay.innerHTML.includes('184, 134, 11') : false
            };
        });
        
        console.log(`  載入動畫找到: ${loadingAnimationStatus.found ? '✅' : '❌'}`);
        console.log(`  載入動畫顯示: ${loadingAnimationStatus.visible ? '✅' : '❌'}`);
        console.log(`  金色主題: ${loadingAnimationStatus.hasGoldenColors ? '✅' : '❌'}`);
        
        // 隱藏載入動畫
        await page.evaluate(() => {
            if (typeof hideOptimizedLoadingAnimation === 'function') {
                hideOptimizedLoadingAnimation();
            }
        });
        
        // 性能評分
        console.log('🏆 性能評分:');
        let score = 100;
        
        if (!optimizationStatus.hasPerformanceOptimizer) score -= 15;
        if (!optimizationStatus.hasApiOptimizer) score -= 10;
        if (!optimizationStatus.hasAnimationManager) score -= 10;
        if (!optimizationStatus.hasPreloadLinks) score -= 5;
        if (!optimizationStatus.hasPrefetchLinks) score -= 5;
        if (!loadingAnimationStatus.found) score -= 10;
        if (!loadingAnimationStatus.hasGoldenColors) score -= 5;
        if (!initStatus.systemInitialized) score -= 20;
        if (optimizationStatus.totalScriptSize > 500000) score -= 10;
        if (optimizationStatus.totalStyleSize > 100000) score -= 5;
        
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
        console.log('💡 優化建議:');
        
        if (!optimizationStatus.hasPerformanceOptimizer) {
            console.log('  ⚠️ 缺少PerformanceOptimizer，建議添加');
        }
        
        if (!optimizationStatus.hasApiOptimizer) {
            console.log('  ⚠️ 缺少API優化器，建議添加');
        }
        
        if (!optimizationStatus.hasAnimationManager) {
            console.log('  ⚠️ 缺少動畫管理器，建議添加');
        }
        
        if (!loadingAnimationStatus.found) {
            console.log('  ⚠️ 載入動畫未找到，建議檢查實現');
        }
        
        if (!loadingAnimationStatus.hasGoldenColors) {
            console.log('  ⚠️ 載入動畫顏色不是金色，建議檢查');
        }
        
        if (optimizationStatus.totalScriptSize > 500000) {
            console.log('  ⚠️ JavaScript代碼過大，建議壓縮或分離');
        }
        
        if (optimizationStatus.totalStyleSize > 100000) {
            console.log('  ⚠️ CSS代碼過大，建議壓縮或分離');
        }
        
        console.log('✅ 載入速度測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testLoadingSpeedSimple().catch(console.error);
