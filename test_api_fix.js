const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testApiFix() {
    console.log('🔧 開始測試API修復...');
    
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
        
        // 檢查API優化器狀態
        console.log('🔍 檢查API優化器狀態:');
        const apiStatus = await page.evaluate(() => {
            return {
                hasApiOptimizer: typeof window.apiOptimizer !== 'undefined',
                hasFetchWithRetry: typeof window.apiOptimizer?.fetchWithRetry === 'function',
                hasOptimizedFetch: typeof window.apiOptimizer?.optimizedFetch === 'function',
                hasExecuteRequest: typeof window.apiOptimizer?.executeRequest === 'function'
            };
        });
        
        console.log(`  apiOptimizer存在: ${apiStatus.hasApiOptimizer ? '✅' : '❌'}`);
        console.log(`  fetchWithRetry函數: ${apiStatus.hasFetchWithRetry ? '✅' : '❌'}`);
        console.log(`  optimizedFetch函數: ${apiStatus.hasOptimizedFetch ? '✅' : '❌'}`);
        console.log(`  executeRequest函數: ${apiStatus.hasExecuteRequest ? '✅' : '❌'}`);
        
        // 測試API請求格式
        console.log('🔍 測試API請求格式:');
        try {
            const apiTest = await page.evaluate(async () => {
                if (window.apiOptimizer && typeof window.apiOptimizer.fetchWithRetry === 'function') {
                    try {
                        // 測試一個簡單的API請求
                        const result = await window.apiOptimizer.fetchWithRetry('/api/teachers', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        return {
                            success: true,
                            resultType: typeof result,
                            hasData: !!result.data,
                            hasFromCache: 'fromCache' in result,
                            result: result
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error.message,
                            errorType: typeof error
                        };
                    }
                } else {
                    return {
                        success: false,
                        error: 'apiOptimizer.fetchWithRetry函數不存在'
                    };
                }
            });
            
            if (apiTest.success) {
                console.log(`  ✅ API請求測試成功`);
                console.log(`  結果類型: ${apiTest.resultType}`);
                console.log(`  包含data: ${apiTest.hasData ? '✅' : '❌'}`);
                console.log(`  包含fromCache: ${apiTest.hasFromCache ? '✅' : '❌'}`);
            } else {
                console.log(`  ❌ API請求測試失敗: ${apiTest.error}`);
            }
        } catch (error) {
            console.log(`❌ API請求測試異常: ${error.message}`);
        }
        
        // 檢查講師比對函數
        console.log('🔍 檢查講師比對函數:');
        const teacherMatchStatus = await page.evaluate(() => {
            return {
                hasAutoMatchTeacher: typeof window.autoMatchTeacher === 'function',
                hasSelectMatchedTeacher: typeof window.selectMatchedTeacher === 'function',
                hasShowMatchingProcess: typeof window.showMatchingProcess === 'function'
            };
        });
        
        console.log(`  autoMatchTeacher函數: ${teacherMatchStatus.hasAutoMatchTeacher ? '✅' : '❌'}`);
        console.log(`  selectMatchedTeacher函數: ${teacherMatchStatus.hasSelectMatchedTeacher ? '✅' : '❌'}`);
        console.log(`  showMatchingProcess函數: ${teacherMatchStatus.hasShowMatchingProcess ? '✅' : '❌'}`);
        
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
        
        // 測試講師比對流程
        console.log('🔍 測試講師比對流程:');
        try {
            const matchTest = await page.evaluate(async () => {
                if (typeof window.autoMatchTeacher === 'function') {
                    try {
                        // 模擬講師比對（不實際執行，只檢查函數結構）
                        const functionString = window.autoMatchTeacher.toString();
                        const hasApiCall = functionString.includes('apiOptimizer.fetchWithRetry');
                        const hasResultHandling = functionString.includes('result.data');
                        const hasErrorHandling = functionString.includes('throw new Error');
                        
                        return {
                            success: true,
                            hasApiCall: hasApiCall,
                            hasResultHandling: hasResultHandling,
                            hasErrorHandling: hasErrorHandling,
                            functionLength: functionString.length
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
                        error: 'autoMatchTeacher函數不存在'
                    };
                }
            });
            
            if (matchTest.success) {
                console.log(`  ✅ 講師比對函數檢查成功`);
                console.log(`  包含API調用: ${matchTest.hasApiCall ? '✅' : '❌'}`);
                console.log(`  包含結果處理: ${matchTest.hasResultHandling ? '✅' : '❌'}`);
                console.log(`  包含錯誤處理: ${matchTest.hasErrorHandling ? '✅' : '❌'}`);
                console.log(`  函數長度: ${matchTest.functionLength} 字符`);
            } else {
                console.log(`  ❌ 講師比對函數檢查失敗: ${matchTest.error}`);
            }
        } catch (error) {
            console.log(`❌ 講師比對函數檢查異常: ${error.message}`);
        }
        
        // 最終修復評分
        console.log('🏆 修復評分:');
        let score = 100;
        
        // API優化器檢查
        if (!apiStatus.hasApiOptimizer) score -= 25;
        if (!apiStatus.hasFetchWithRetry) score -= 20;
        if (!apiStatus.hasOptimizedFetch) score -= 15;
        if (!apiStatus.hasExecuteRequest) score -= 15;
        
        // 講師比對檢查
        if (!teacherMatchStatus.hasAutoMatchTeacher) score -= 10;
        if (!teacherMatchStatus.hasSelectMatchedTeacher) score -= 5;
        if (!teacherMatchStatus.hasShowMatchingProcess) score -= 5;
        
        // 控制台錯誤檢查
        if (consoleErrors.length > 0) score -= 10;
        
        console.log(`  總分: ${score}/100`);
        
        if (score >= 90) {
            console.log('  🎉 優秀！API修復完成');
        } else if (score >= 80) {
            console.log('  ✅ 良好！大部分問題已修復');
        } else if (score >= 70) {
            console.log('  ⚠️ 一般！還有一些問題需要修復');
        } else {
            console.log('  ❌ 需要改進！修復工作還需要繼續');
        }
        
        // 修復建議
        console.log('💡 修復建議:');
        
        if (!apiStatus.hasApiOptimizer) {
            console.log('  ⚠️ apiOptimizer不存在，建議檢查');
        }
        
        if (!apiStatus.hasFetchWithRetry) {
            console.log('  ⚠️ fetchWithRetry函數不存在，建議檢查');
        }
        
        if (!teacherMatchStatus.hasAutoMatchTeacher) {
            console.log('  ⚠️ autoMatchTeacher函數不存在，建議檢查');
        }
        
        if (consoleErrors.length > 0) {
            console.log('  ⚠️ 還有控制台錯誤，建議檢查');
        }
        
        console.log('✅ API修復測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testApiFix().catch(console.error);
