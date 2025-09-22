const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testFinalOptimization() {
    console.log('🎯 開始最終優化效果測試...');
    
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
                hasGoldenColors: overlay ? overlay.innerHTML.includes('184, 134, 11') : false,
                hasLiquidElements: overlay ? overlay.querySelectorAll('.liquid-loader, .liquid-ring, .liquid-ball').length > 0 : false
            };
        });
        
        console.log(`  載入動畫找到: ${loadingAnimationStatus.found ? '✅' : '❌'}`);
        console.log(`  載入動畫顯示: ${loadingAnimationStatus.visible ? '✅' : '❌'}`);
        console.log(`  金色主題: ${loadingAnimationStatus.hasGoldenColors ? '✅' : '❌'}`);
        console.log(`  液態元素: ${loadingAnimationStatus.hasLiquidElements ? '✅' : '❌'}`);
        
        // 隱藏載入動畫
        await page.evaluate(() => {
            if (typeof hideOptimizedLoadingAnimation === 'function') {
                hideOptimizedLoadingAnimation();
            }
        });
        
        // 測試懶載入功能
        console.log('🔄 測試懶載入功能:');
        const lazyLoadStatus = await page.evaluate(() => {
            const lazyElements = document.querySelectorAll('[data-lazy-load]');
            const performanceOptimizer = window.PerformanceOptimizer;
            
            return {
                lazyElementCount: lazyElements.length,
                hasLazyLoadObserver: performanceOptimizer && typeof performanceOptimizer.lazyLoadNonCriticalFeatures === 'function',
                lazyLoadTypes: Array.from(lazyElements).map(el => el.dataset.lazyLoad)
            };
        });
        
        console.log(`  懶載入元素數量: ${lazyLoadStatus.lazyElementCount}`);
        console.log(`  懶載入觀察器: ${lazyLoadStatus.hasLazyLoadObserver ? '✅' : '❌'}`);
        console.log(`  懶載入類型: ${lazyLoadStatus.lazyLoadTypes.join(', ')}`);
        
        // 測試CSS壓縮效果
        console.log('📦 測試CSS壓縮效果:');
        const cssCompressionStatus = await page.evaluate(() => {
            const styles = document.querySelectorAll('style');
            let totalSize = 0;
            let compressedSize = 0;
            
            styles.forEach(style => {
                const content = style.textContent || '';
                totalSize += content.length;
                
                // 計算壓縮後的大小（移除空白和註釋）
                const compressed = content
                    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除註釋
                    .replace(/\s+/g, ' ') // 合併空白
                    .replace(/;\s*}/g, '}') // 移除最後的分號
                    .replace(/{\s+/g, '{') // 移除左括號後的空白
                    .replace(/\s+}/g, '}') // 移除右括號前的空白
                    .trim();
                
                compressedSize += compressed.length;
            });
            
            return {
                originalSize: totalSize,
                compressedSize: compressedSize,
                compressionRatio: totalSize > 0 ? ((totalSize - compressedSize) / totalSize * 100).toFixed(1) : 0
            };
        });
        
        console.log(`  原始CSS大小: ${(cssCompressionStatus.originalSize / 1024).toFixed(2)}KB`);
        console.log(`  壓縮後大小: ${(cssCompressionStatus.compressedSize / 1024).toFixed(2)}KB`);
        console.log(`  壓縮率: ${cssCompressionStatus.compressionRatio}%`);
        
        // 測試性能優化
        console.log('⚡ 測試性能優化:');
        const performanceStatus = await page.evaluate(() => {
            const optimizedElements = document.querySelectorAll('[style*="transform: translateZ(0)"], [style*="will-change"], [style*="contain"]');
            const animatedElements = document.querySelectorAll('[style*="animation"], [class*="animation"]');
            
            return {
                optimizedElements: optimizedElements.length,
                animatedElements: animatedElements.length,
                memoryUsage: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize
                } : null
            };
        });
        
        console.log(`  優化元素數量: ${performanceStatus.optimizedElements}`);
        console.log(`  動畫元素數量: ${performanceStatus.animatedElements}`);
        
        if (performanceStatus.memoryUsage) {
            console.log(`  記憶體使用: ${(performanceStatus.memoryUsage.used / 1024 / 1024).toFixed(2)}MB`);
        }
        
        // 最終性能評分
        console.log('🏆 最終性能評分:');
        let score = 100;
        
        // 載入動畫檢查
        if (!loadingAnimationStatus.found) score -= 15;
        if (!loadingAnimationStatus.hasGoldenColors) score -= 5;
        if (!loadingAnimationStatus.hasLiquidElements) score -= 5;
        
        // 懶載入檢查
        if (lazyLoadStatus.lazyElementCount === 0) score -= 10;
        if (!lazyLoadStatus.hasLazyLoadObserver) score -= 5;
        
        // CSS壓縮檢查
        if (cssCompressionStatus.compressionRatio < 10) score -= 10;
        if (cssCompressionStatus.originalSize > 200 * 1024) score -= 5;
        
        // 性能優化檢查
        if (performanceStatus.optimizedElements === 0) score -= 10;
        if (performanceStatus.memoryUsage && performanceStatus.memoryUsage.used > 15 * 1024 * 1024) score -= 5;
        
        // 基礎功能檢查
        if (!optimizationStatus.hasPerformanceOptimizer) score -= 10;
        if (!optimizationStatus.hasApiOptimizer) score -= 5;
        if (!optimizationStatus.hasAnimationManager) score -= 5;
        
        console.log(`  總分: ${score}/100`);
        
        if (score >= 90) {
            console.log('  🎉 優秀！所有優化都已完成');
        } else if (score >= 80) {
            console.log('  ✅ 良好！大部分優化已完成');
        } else if (score >= 70) {
            console.log('  ⚠️ 一般！還有一些優化需要完成');
        } else {
            console.log('  ❌ 需要改進！優化工作還需要繼續');
        }
        
        // 優化建議
        console.log('💡 優化建議:');
        
        if (!loadingAnimationStatus.found) {
            console.log('  ⚠️ 載入動畫未找到，建議檢查實現');
        }
        
        if (!loadingAnimationStatus.hasGoldenColors) {
            console.log('  ⚠️ 載入動畫顏色不是金色，建議檢查');
        }
        
        if (lazyLoadStatus.lazyElementCount === 0) {
            console.log('  ⚠️ 沒有懶載入元素，建議添加更多');
        }
        
        if (cssCompressionStatus.compressionRatio < 10) {
            console.log('  ⚠️ CSS壓縮率較低，建議進一步壓縮');
        }
        
        if (performanceStatus.optimizedElements === 0) {
            console.log('  ⚠️ 沒有優化元素，建議添加性能優化');
        }
        
        console.log('✅ 最終優化測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testFinalOptimization().catch(console.error);
