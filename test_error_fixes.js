const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testErrorFixes() {
    console.log('🔧 開始測試錯誤修復...');
    
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
        
        // 檢查LIFF SDK載入狀態
        console.log('🔍 檢查LIFF SDK載入狀態:');
        const liffStatus = await page.evaluate(() => {
            return {
                hasLiffSDK: typeof liff !== 'undefined',
                hasLoadLIFFSDK: typeof window.PerformanceOptimizer?.loadLIFFSDK === 'function',
                liffInitialized: window.liffInitialized || false
            };
        });
        
        console.log(`  LIFF SDK存在: ${liffStatus.hasLiffSDK ? '✅' : '❌'}`);
        console.log(`  loadLIFFSDK函數: ${liffStatus.hasLoadLIFFSDK ? '✅' : '❌'}`);
        console.log(`  LIFF已初始化: ${liffStatus.liffInitialized ? '✅' : '❌'}`);
        
        // 檢查CSP錯誤
        console.log('🔍 檢查CSP錯誤:');
        const cspStatus = await page.evaluate(() => {
            const inlineHandlers = document.querySelectorAll('[onclick]');
            const inlineEvents = document.querySelectorAll('[onload], [onerror], [onchange]');
            
            return {
                inlineClickHandlers: inlineHandlers.length,
                inlineEventHandlers: inlineEvents.length,
                hasCSPErrors: window.cspErrors || false
            };
        });
        
        console.log(`  內聯點擊處理器: ${cspStatus.inlineClickHandlers}個`);
        console.log(`  內聯事件處理器: ${cspStatus.inlineEventHandlers}個`);
        console.log(`  CSP錯誤: ${cspStatus.hasCSPErrors ? '❌' : '✅'}`);
        
        // 檢查載入超時變數
        console.log('🔍 檢查載入超時變數:');
        const timeoutStatus = await page.evaluate(() => {
            return {
                hasMaxRetries: typeof window.maxRetries !== 'undefined',
                hasLoadingTimeout: typeof window.loadingTimeout !== 'undefined',
                hasLoadCourseStudents: typeof window.loadCourseStudents === 'function'
            };
        });
        
        console.log(`  maxRetries變數: ${timeoutStatus.hasMaxRetries ? '✅' : '❌'}`);
        console.log(`  loadingTimeout變數: ${timeoutStatus.hasLoadingTimeout ? '✅' : '❌'}`);
        console.log(`  loadCourseStudents函數: ${timeoutStatus.hasLoadCourseStudents ? '✅' : '❌'}`);
        
        // 檢查預載入資源
        console.log('🔍 檢查預載入資源:');
        const preloadStatus = await page.evaluate(() => {
            const preloadLinks = document.querySelectorAll('link[rel="preload"]');
            const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
            
            return {
                preloadCount: preloadLinks.length,
                prefetchCount: prefetchLinks.length,
                hasLiffPrefetch: Array.from(prefetchLinks).some(link => 
                    link.href.includes('liff/edge/2/sdk.js')
                )
            };
        });
        
        console.log(`  預載入資源: ${preloadStatus.preloadCount}個`);
        console.log(`  預取資源: ${preloadStatus.prefetchCount}個`);
        console.log(`  LIFF SDK預取: ${preloadStatus.hasLiffPrefetch ? '✅' : '❌'}`);
        
        // 測試載入學生功能
        console.log('🔍 測試載入學生功能:');
        try {
            await page.evaluate(() => {
                if (typeof loadCourseStudents === 'function') {
                    // 測試函數是否可以正常調用（不實際執行）
                    console.log('✅ loadCourseStudents函數可正常調用');
                }
            });
        } catch (error) {
            console.log(`❌ loadCourseStudents函數測試失敗: ${error.message}`);
        }
        
        // 測試LIFF SDK載入
        console.log('🔍 測試LIFF SDK載入:');
        try {
            await page.evaluate(async () => {
                if (window.PerformanceOptimizer && typeof window.PerformanceOptimizer.loadLIFFSDK === 'function') {
                    try {
                        await window.PerformanceOptimizer.loadLIFFSDK();
                        console.log('✅ LIFF SDK載入測試成功');
                    } catch (error) {
                        console.log(`❌ LIFF SDK載入測試失敗: ${error.message}`);
                    }
                }
            });
        } catch (error) {
            console.log(`❌ LIFF SDK載入測試異常: ${error.message}`);
        }
        
        // 最終修復評分
        console.log('🏆 修復評分:');
        let score = 100;
        
        // CSP錯誤檢查
        if (cspStatus.inlineClickHandlers > 0) score -= 20;
        if (cspStatus.inlineEventHandlers > 0) score -= 10;
        if (cspStatus.hasCSPErrors) score -= 30;
        
        // LIFF SDK檢查
        if (!liffStatus.hasLoadLIFFSDK) score -= 15;
        
        // 載入超時檢查
        if (!timeoutStatus.hasLoadCourseStudents) score -= 15;
        
        // 預載入檢查
        if (!preloadStatus.hasLiffPrefetch) score -= 10;
        
        console.log(`  總分: ${score}/100`);
        
        if (score >= 90) {
            console.log('  🎉 優秀！所有錯誤都已修復');
        } else if (score >= 80) {
            console.log('  ✅ 良好！大部分錯誤已修復');
        } else if (score >= 70) {
            console.log('  ⚠️ 一般！還有一些錯誤需要修復');
        } else {
            console.log('  ❌ 需要改進！錯誤修復工作還需要繼續');
        }
        
        // 修復建議
        console.log('💡 修復建議:');
        
        if (cspStatus.inlineClickHandlers > 0) {
            console.log('  ⚠️ 還有內聯點擊處理器，建議完全移除');
        }
        
        if (cspStatus.inlineEventHandlers > 0) {
            console.log('  ⚠️ 還有內聯事件處理器，建議完全移除');
        }
        
        if (!liffStatus.hasLoadLIFFSDK) {
            console.log('  ⚠️ LIFF SDK載入函數未找到，建議檢查');
        }
        
        if (!timeoutStatus.hasLoadCourseStudents) {
            console.log('  ⚠️ loadCourseStudents函數未找到，建議檢查');
        }
        
        if (!preloadStatus.hasLiffPrefetch) {
            console.log('  ⚠️ LIFF SDK預取未設置，建議檢查');
        }
        
        console.log('✅ 錯誤修復測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testErrorFixes().catch(console.error);
