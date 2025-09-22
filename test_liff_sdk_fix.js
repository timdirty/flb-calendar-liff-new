const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testLiffSdkFix() {
    console.log('🔧 開始測試LIFF SDK修復...');
    
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
        
        // 檢查LIFF SDK載入狀態
        console.log('🔍 檢查LIFF SDK載入狀態:');
        const liffStatus = await page.evaluate(() => {
            return {
                hasPerformanceOptimizer: typeof window.PerformanceOptimizer !== 'undefined',
                hasLoadLIFFSDK: typeof window.PerformanceOptimizer?.loadLIFFSDK === 'function',
                hasLiffSDK: typeof liff !== 'undefined',
                liffInitialized: window.liffInitialized || false,
                hasInitLineUserOptimized: typeof window.initLineUserOptimized === 'function'
            };
        });
        
        console.log(`  PerformanceOptimizer存在: ${liffStatus.hasPerformanceOptimizer ? '✅' : '❌'}`);
        console.log(`  loadLIFFSDK函數: ${liffStatus.hasLoadLIFFSDK ? '✅' : '❌'}`);
        console.log(`  LIFF SDK存在: ${liffStatus.hasLiffSDK ? '✅' : '❌'}`);
        console.log(`  LIFF已初始化: ${liffStatus.liffInitialized ? '✅' : '❌'}`);
        console.log(`  initLineUserOptimized函數: ${liffStatus.hasInitLineUserOptimized ? '✅' : '❌'}`);
        
        // 測試LIFF SDK載入函數
        console.log('🔍 測試LIFF SDK載入函數:');
        try {
            const loadTest = await page.evaluate(async () => {
                if (window.PerformanceOptimizer && typeof window.PerformanceOptimizer.loadLIFFSDK === 'function') {
                    try {
                        await window.PerformanceOptimizer.loadLIFFSDK();
                        return { success: true, message: 'LIFF SDK載入測試成功' };
                    } catch (error) {
                        return { success: false, message: `LIFF SDK載入測試失敗: ${error.message}` };
                    }
                } else {
                    return { success: false, message: 'PerformanceOptimizer.loadLIFFSDK函數不存在' };
                }
            });
            
            console.log(`  ${loadTest.success ? '✅' : '❌'} ${loadTest.message}`);
        } catch (error) {
            console.log(`❌ LIFF SDK載入測試異常: ${error.message}`);
        }
        
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
        
        // 測試系統初始化
        console.log('🔍 測試系統初始化:');
        try {
            const initTest = await page.evaluate(() => {
                // 檢查初始化相關函數是否存在
                const functions = [
                    'initializeSystemOptimized',
                    'initLineUserOptimized',
                    'loadEventsOptimized'
                ];
                
                const results = {};
                functions.forEach(func => {
                    results[func] = typeof window[func] === 'function';
                });
                
                return results;
            });
            
            Object.entries(initTest).forEach(([func, exists]) => {
                console.log(`  ${func}: ${exists ? '✅' : '❌'}`);
            });
        } catch (error) {
            console.log(`❌ 系統初始化測試異常: ${error.message}`);
        }
        
        // 檢查載入日誌
        console.log('🔍 檢查載入日誌:');
        const loadingLogs = await page.evaluate(() => {
            const logs = window.loadingLogs || [];
            return Array.isArray(logs) ? logs.slice(-5) : []; // 只顯示最後5條日誌
        });
        
        if (loadingLogs.length > 0) {
            console.log('📝 最近的載入日誌:');
            loadingLogs.forEach((log, index) => {
                console.log(`  ${index + 1}. ${log}`);
            });
        } else {
            console.log('📝 沒有載入日誌');
        }
        
        // 最終修復評分
        console.log('🏆 修復評分:');
        let score = 100;
        
        // LIFF SDK檢查
        if (!liffStatus.hasPerformanceOptimizer) score -= 20;
        if (!liffStatus.hasLoadLIFFSDK) score -= 20;
        if (!liffStatus.hasInitLineUserOptimized) score -= 15;
        
        // 控制台錯誤檢查
        if (consoleErrors.length > 0) score -= 15;
        
        // 系統初始化檢查
        const initFunctions = ['initializeSystemOptimized', 'initLineUserOptimized', 'loadEventsOptimized'];
        const missingFunctions = initFunctions.filter(func => {
            return !page.evaluate(() => typeof window[func] === 'function');
        });
        if (missingFunctions.length > 0) score -= 10;
        
        console.log(`  總分: ${score}/100`);
        
        if (score >= 90) {
            console.log('  🎉 優秀！LIFF SDK修復完成');
        } else if (score >= 80) {
            console.log('  ✅ 良好！大部分問題已修復');
        } else if (score >= 70) {
            console.log('  ⚠️ 一般！還有一些問題需要修復');
        } else {
            console.log('  ❌ 需要改進！修復工作還需要繼續');
        }
        
        // 修復建議
        console.log('💡 修復建議:');
        
        if (!liffStatus.hasPerformanceOptimizer) {
            console.log('  ⚠️ PerformanceOptimizer不存在，建議檢查');
        }
        
        if (!liffStatus.hasLoadLIFFSDK) {
            console.log('  ⚠️ loadLIFFSDK函數不存在，建議檢查');
        }
        
        if (!liffStatus.hasInitLineUserOptimized) {
            console.log('  ⚠️ initLineUserOptimized函數不存在，建議檢查');
        }
        
        if (consoleErrors.length > 0) {
            console.log('  ⚠️ 還有控制台錯誤，建議檢查');
        }
        
        console.log('✅ LIFF SDK修復測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testLiffSdkFix().catch(console.error);
