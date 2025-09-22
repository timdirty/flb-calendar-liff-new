const puppeteer = require('puppeteer');

async function testOptimizationVerification() {
    console.log('🧪 開始測試系統優化效果...');
    
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
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 測試載入動畫顏色
        console.log('🎨 測試載入動畫顏色...');
        await page.evaluate(() => {
            // 觸發載入動畫
            if (typeof showOptimizedLoadingAnimation === 'function') {
                showOptimizedLoadingAnimation();
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查載入動畫顏色
        const loadingColors = await page.evaluate(() => {
            const overlay = document.querySelector('#optimized-loading-overlay');
            if (!overlay) return { found: false };
            
            const rings = overlay.querySelectorAll('.liquid-ring');
            const ball = overlay.querySelector('.liquid-ball');
            const progressFill = overlay.querySelector('div[style*="background: linear-gradient"]');
            
            const colors = {
                rings: [],
                ball: null,
                progress: null
            };
            
            rings.forEach(ring => {
                const styles = window.getComputedStyle(ring);
                colors.rings.push({
                    borderTop: styles.borderTopColor,
                    borderRight: styles.borderRightColor,
                    borderBottom: styles.borderBottomColor,
                    borderLeft: styles.borderLeftColor
                });
            });
            
            if (ball) {
                const styles = window.getComputedStyle(ball);
                colors.ball = {
                    background: styles.background,
                    boxShadow: styles.boxShadow
                };
            }
            
            if (progressFill) {
                const styles = window.getComputedStyle(progressFill);
                colors.progress = {
                    background: styles.background,
                    boxShadow: styles.boxShadow
                };
            }
            
            return { found: true, colors };
        });
        
        console.log('🎨 載入動畫顏色檢查結果:');
        if (loadingColors.found) {
            console.log('✅ 載入動畫已找到');
            console.log('🔍 環形顏色:', loadingColors.colors.rings);
            console.log('🔍 中心球顏色:', loadingColors.colors.ball);
            console.log('🔍 進度條顏色:', loadingColors.colors.progress);
            
            // 檢查是否為金色系
            const isGoldTheme = loadingColors.colors.rings.some(ring => 
                ring.borderTop.includes('184, 134, 11') || 
                ring.borderRight.includes('212, 175, 55') ||
                ring.borderBottom.includes('255, 193, 7') ||
                ring.borderLeft.includes('255, 215, 0')
            );
            
            console.log(`🎨 金色主題檢查: ${isGoldTheme ? '✅ 符合' : '❌ 不符合'}`);
        } else {
            console.log('❌ 未找到載入動畫');
        }
        
        // 測試動畫效能
        console.log('⚡ 測試動畫效能...');
        const animationPerformance = await page.evaluate(() => {
            const overlay = document.querySelector('#optimized-loading-overlay');
            if (!overlay) return { found: false };
            
            const animatedElements = overlay.querySelectorAll('*');
            let optimizedCount = 0;
            let totalAnimated = 0;
            
            animatedElements.forEach(el => {
                const styles = window.getComputedStyle(el);
                if (styles.animation && styles.animation !== 'none') {
                    totalAnimated++;
                    
                    // 檢查是否有效能優化屬性
                    if (styles.transform && styles.transform.includes('translateZ(0)')) {
                        optimizedCount++;
                    }
                    if (styles.willChange && styles.willChange !== 'auto') {
                        optimizedCount++;
                    }
                    if (styles.contain && styles.contain !== 'none') {
                        optimizedCount++;
                    }
                }
            });
            
            return {
                found: true,
                totalAnimated,
                optimizedCount,
                optimizationRate: totalAnimated > 0 ? (optimizedCount / totalAnimated) * 100 : 0
            };
        });
        
        console.log('⚡ 動畫效能檢查結果:');
        if (animationPerformance.found) {
            console.log(`✅ 動畫元素總數: ${animationPerformance.totalAnimated}`);
            console.log(`✅ 優化元素數量: ${animationPerformance.optimizedCount}`);
            console.log(`✅ 優化率: ${animationPerformance.optimizationRate.toFixed(1)}%`);
        } else {
            console.log('❌ 未找到動畫元素');
        }
        
        // 測試快取機制
        console.log('💾 測試快取機制...');
        const cacheTest = await page.evaluate(() => {
            // 檢查是否有快取相關的localStorage項目
            const cacheKeys = Object.keys(localStorage).filter(key => 
                key.includes('cache') || key.includes('Cache')
            );
            
            return {
                cacheKeys,
                hasCalendarCache: localStorage.getItem('calendar_events_cache') !== null,
                hasTeacherCache: Object.keys(localStorage).some(key => key.includes('teacher_match')),
                cacheCount: cacheKeys.length
            };
        });
        
        console.log('💾 快取機制檢查結果:');
        console.log(`✅ 快取項目數量: ${cacheTest.cacheCount}`);
        console.log(`✅ 行事曆快取: ${cacheTest.hasCalendarCache ? '✅' : '❌'}`);
        console.log(`✅ 講師快取: ${cacheTest.hasTeacherCache ? '✅' : '❌'}`);
        console.log(`✅ 快取鍵值: ${cacheTest.cacheKeys.join(', ')}`);
        
        // 測試並行載入
        console.log('🔄 測試並行載入...');
        const parallelTest = await page.evaluate(() => {
            // 檢查是否有Promise.allSettled的使用
            const scripts = Array.from(document.scripts);
            const hasParallelLoading = scripts.some(script => 
                script.textContent && script.textContent.includes('Promise.allSettled')
            );
            
            return {
                hasParallelLoading,
                scriptCount: scripts.length
            };
        });
        
        console.log('🔄 並行載入檢查結果:');
        console.log(`✅ 並行載入實現: ${parallelTest.hasParallelLoading ? '✅' : '❌'}`);
        console.log(`✅ 腳本數量: ${parallelTest.scriptCount}`);
        
        // 測試API優化
        console.log('🌐 測試API優化...');
        const apiOptimization = await page.evaluate(() => {
            // 檢查是否有API優化器
            const hasApiOptimizer = typeof window.apiOptimizer !== 'undefined';
            const hasRetryMechanism = hasApiOptimizer && typeof window.apiOptimizer.fetchWithRetry === 'function';
            const hasCaching = hasApiOptimizer && typeof window.apiOptimizer.cache === 'object';
            
            return {
                hasApiOptimizer,
                hasRetryMechanism,
                hasCaching,
                optimizationLevel: [hasApiOptimizer, hasRetryMechanism, hasCaching].filter(Boolean).length
            };
        });
        
        console.log('🌐 API優化檢查結果:');
        console.log(`✅ API優化器: ${apiOptimization.hasApiOptimizer ? '✅' : '❌'}`);
        console.log(`✅ 重試機制: ${apiOptimization.hasRetryMechanism ? '✅' : '❌'}`);
        console.log(`✅ 快取機制: ${apiOptimization.hasCaching ? '✅' : '❌'}`);
        console.log(`✅ 優化等級: ${apiOptimization.optimizationLevel}/3`);
        
        // 隱藏載入動畫
        await page.evaluate(() => {
            if (typeof hideOptimizedLoadingAnimation === 'function') {
                hideOptimizedLoadingAnimation();
            }
        });
        
        console.log('✅ 系統優化測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testOptimizationVerification().catch(console.error);
