const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 測試配置
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    timeout: 30000,
    headless: false, // 設為 false 以便觀察測試過程
    slowMo: 1000, // 每個操作間隔1秒
    viewport: { width: 1280, height: 720 }
};

// 測試結果收集
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

// 測試日誌函數
function logTest(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logMessage);
    
    testResults.details.push({
        timestamp,
        type,
        message
    });
}

// 測試斷言函數
function assert(condition, message) {
    testResults.total++;
    if (condition) {
        testResults.passed++;
        logTest(`✅ PASS: ${message}`, 'pass');
        return true;
    } else {
        testResults.failed++;
        logTest(`❌ FAIL: ${message}`, 'fail');
        return false;
    }
}

// 等待函數
async function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 截圖函數
async function takeScreenshot(page, name) {
    const screenshotPath = `test-screenshots/${name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    logTest(`📸 截圖已保存: ${screenshotPath}`, 'info');
    return screenshotPath;
}

// 檢查後端API健康狀態
async function checkBackendHealth() {
    try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/health`);
        const data = await response.json();
        
        assert(response.ok, '後端API健康檢查');
        assert(data.success === true, '後端API返回成功狀態');
        assert(data.status === 'healthy', '後端API狀態為healthy');
        
        logTest(`🏥 後端API健康狀態: ${JSON.stringify(data)}`, 'info');
        return true;
    } catch (error) {
        assert(false, `後端API健康檢查失敗: ${error.message}`);
        return false;
    }
}

// 測試講師Web API獲取功能
async function testTeacherWebApiRetrieval() {
    try {
        logTest('🔍 測試講師Web API獲取功能...', 'info');
        
        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/teacher-web-api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                teacherName: 'Tim'
            })
        });
        
        const data = await response.json();
        
        assert(response.ok, '講師Web API獲取請求成功');
        assert(data.success === true, '講師Web API獲取成功');
        assert(data.webApi && data.webApi.length > 0, '獲取到有效的Web API URL');
        
        logTest(`📋 講師Web API: ${data.webApi}`, 'info');
        return data.webApi;
    } catch (error) {
        assert(false, `講師Web API獲取失敗: ${error.message}`);
        return null;
    }
}

// 測試講師報表提交功能
async function testTeacherReportSubmission(webApi) {
    try {
        logTest('📤 測試講師報表提交功能...', 'info');
        
        const testData = {
            teacherName: 'Tim',
            courseName: 'SPM',
            courseTime: '13:30-15:00',
            date: '2025/09/21',
            studentCount: 2,
            courseContent: '自動化測試課程內容',
            webApi: webApi
        };
        
        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/teacher-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        assert(response.ok, '講師報表提交請求成功');
        assert(data.success === true, '講師報表提交成功');
        
        logTest(`📊 講師報表提交結果: ${JSON.stringify(data)}`, 'info');
        return true;
    } catch (error) {
        assert(false, `講師報表提交失敗: ${error.message}`);
        return false;
    }
}

// 測試前端頁面載入
async function testFrontendPageLoad(page) {
    try {
        logTest('🌐 測試前端頁面載入...', 'info');
        
        await page.goto(`${TEST_CONFIG.baseUrl}/calendar`, { 
            waitUntil: 'networkidle0',
            timeout: TEST_CONFIG.timeout 
        });
        
        // 檢查頁面標題
        const title = await page.title();
        assert(title.includes('講師行事曆') || title.includes('Calendar'), '頁面標題正確');
        
        // 檢查關鍵元素是否存在
        const calendarElement = await page.$('.calendar-container');
        assert(calendarElement !== null, '行事曆容器存在');
        
        // 截圖
        await takeScreenshot(page, 'frontend-loaded');
        
        logTest('✅ 前端頁面載入成功', 'pass');
        return true;
    } catch (error) {
        assert(false, `前端頁面載入失敗: ${error.message}`);
        return false;
    }
}

// 測試長按觸控功能
async function testLongPressFunctionality(page) {
    try {
        logTest('👆 測試長按觸控功能...', 'info');
        
        // 等待頁面完全載入
        await page.waitForSelector('.calendar-container', { timeout: 10000 });
        
        // 查找第一個課程卡片
        const courseCard = await page.$('.course-card');
        if (!courseCard) {
            assert(false, '找不到課程卡片');
            return false;
        }
        
        // 獲取課程卡片位置
        const boundingBox = await courseCard.boundingBox();
        if (!boundingBox) {
            assert(false, '無法獲取課程卡片位置');
            return false;
        }
        
        // 模擬長按（1.5秒）
        const centerX = boundingBox.x + boundingBox.width / 2;
        const centerY = boundingBox.y + boundingBox.height / 2;
        
        logTest(`📍 點擊位置: (${centerX}, ${centerY})`, 'info');
        
        // 開始觸控
        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        
        // 等待長按動畫
        await waitFor(1500);
        
        // 檢查是否出現載入動畫
        const loadingElement = await page.$('.loading-animation, .charging-animation');
        assert(loadingElement !== null, '長按觸發載入動畫');
        
        // 釋放觸控
        await page.mouse.up();
        
        // 等待載入完成
        await waitFor(3000);
        
        // 檢查是否出現簽到模態框
        const modalElement = await page.$('.attendance-modal, .modal');
        assert(modalElement !== null, '長按後出現簽到模態框');
        
        // 截圖
        await takeScreenshot(page, 'long-press-triggered');
        
        logTest('✅ 長按觸控功能正常', 'pass');
        return true;
    } catch (error) {
        assert(false, `長按觸控功能測試失敗: ${error.message}`);
        return false;
    }
}

// 測試講師簽到切換功能
async function testTeacherCheckinSwitch(page) {
    try {
        logTest('🔄 測試講師簽到切換功能...', 'info');
        
        // 查找講師簽到按鈕
        const teacherCheckinBtn = await page.$('.navigator-btn[data-view="teacher"]');
        if (!teacherCheckinBtn) {
            assert(false, '找不到講師簽到按鈕');
            return false;
        }
        
        // 點擊講師簽到按鈕
        await teacherCheckinBtn.click();
        await waitFor(1000);
        
        // 檢查是否切換到講師簽到頁面
        const teacherReportSection = await page.$('.teacher-report-section');
        assert(teacherReportSection !== null, '成功切換到講師簽到頁面');
        
        // 檢查講師報表表單元素
        const courseContentTextarea = await page.$('#course-content');
        const submitBtn = await page.$('#submitTeacherReport');
        
        assert(courseContentTextarea !== null, '課程內容輸入框存在');
        assert(submitBtn !== null, '提交按鈕存在');
        
        // 截圖
        await takeScreenshot(page, 'teacher-checkin-page');
        
        logTest('✅ 講師簽到切換功能正常', 'pass');
        return true;
    } catch (error) {
        assert(false, `講師簽到切換功能測試失敗: ${error.message}`);
        return false;
    }
}

// 測試講師報表表單填寫和提交
async function testTeacherReportFormSubmission(page) {
    try {
        logTest('📝 測試講師報表表單填寫和提交...', 'info');
        
        // 填寫課程內容
        const courseContentTextarea = await page.$('#course-content');
        if (courseContentTextarea) {
            await courseContentTextarea.type('自動化測試課程內容 - 測試講師報表功能');
            await waitFor(500);
        }
        
        // 檢查字符計數器
        const charCount = await page.$eval('#char-count', el => el.textContent);
        assert(parseInt(charCount) > 0, '字符計數器正常更新');
        
        // 點擊提交按鈕
        const submitBtn = await page.$('#submitTeacherReport');
        if (submitBtn) {
            await submitBtn.click();
            await waitFor(2000);
        }
        
        // 檢查提交狀態
        const submitBtnText = await page.$eval('#submitTeacherReport', el => el.textContent);
        assert(submitBtnText.includes('提交中') || submitBtnText.includes('提交講師報表'), '提交按鈕狀態正確');
        
        // 等待提交完成
        await waitFor(5000);
        
        // 檢查是否顯示成功訊息
        const toastElements = await page.$$('.toast, .notification');
        const hasSuccessToast = toastElements.length > 0;
        
        // 截圖
        await takeScreenshot(page, 'teacher-report-submitted');
        
        logTest('✅ 講師報表表單提交功能正常', 'pass');
        return true;
    } catch (error) {
        assert(false, `講師報表表單提交測試失敗: ${error.message}`);
        return false;
    }
}

// 測試學生簽到切換功能
async function testStudentCheckinSwitch(page) {
    try {
        logTest('🔄 測試學生簽到切換功能...', 'info');
        
        // 查找學生簽到按鈕
        const studentCheckinBtn = await page.$('.navigator-btn[data-view="student"]');
        if (!studentCheckinBtn) {
            assert(false, '找不到學生簽到按鈕');
            return false;
        }
        
        // 點擊學生簽到按鈕
        await studentCheckinBtn.click();
        await waitFor(1000);
        
        // 檢查是否切換到學生簽到頁面
        const studentAttendanceSection = await page.$('.student-attendance-section');
        assert(studentAttendanceSection !== null, '成功切換到學生簽到頁面');
        
        // 檢查課程資訊顯示
        const courseInfoElements = await page.$$('.course-info-item');
        assert(courseInfoElements.length > 0, '課程資訊正常顯示');
        
        // 截圖
        await takeScreenshot(page, 'student-checkin-page');
        
        logTest('✅ 學生簽到切換功能正常', 'pass');
        return true;
    } catch (error) {
        assert(false, `學生簽到切換功能測試失敗: ${error.message}`);
        return false;
    }
}

// 測試響應式設計
async function testResponsiveDesign(page) {
    try {
        logTest('📱 測試響應式設計...', 'info');
        
        // 測試手機端視圖
        await page.setViewport({ width: 375, height: 667 });
        await waitFor(1000);
        await takeScreenshot(page, 'mobile-view');
        
        // 測試平板端視圖
        await page.setViewport({ width: 768, height: 1024 });
        await waitFor(1000);
        await takeScreenshot(page, 'tablet-view');
        
        // 測試桌面端視圖
        await page.setViewport({ width: 1280, height: 720 });
        await waitFor(1000);
        await takeScreenshot(page, 'desktop-view');
        
        logTest('✅ 響應式設計測試完成', 'pass');
        return true;
    } catch (error) {
        assert(false, `響應式設計測試失敗: ${error.message}`);
        return false;
    }
}

// 生成測試報告
function generateTestReport() {
    const report = {
        summary: {
            total: testResults.total,
            passed: testResults.passed,
            failed: testResults.failed,
            successRate: testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(2) : 0
        },
        details: testResults.details,
        timestamp: new Date().toISOString()
    };
    
    // 保存測試報告
    const reportPath = `test-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 生成HTML報告
    const htmlReport = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>講師報表系統自動化測試報告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
        .summary-item { text-align: center; padding: 20px; border-radius: 8px; }
        .summary-item.passed { background-color: #d4edda; color: #155724; }
        .summary-item.failed { background-color: #f8d7da; color: #721c24; }
        .summary-item.total { background-color: #d1ecf1; color: #0c5460; }
        .details { margin-top: 30px; }
        .log-entry { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .log-entry.pass { background-color: #d4edda; }
        .log-entry.fail { background-color: #f8d7da; }
        .log-entry.info { background-color: #d1ecf1; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 講師報表系統自動化測試報告</h1>
            <p class="timestamp">測試時間: ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-item total">
                <h3>總測試數</h3>
                <h2>${report.summary.total}</h2>
            </div>
            <div class="summary-item passed">
                <h3>通過</h3>
                <h2>${report.summary.passed}</h2>
            </div>
            <div class="summary-item failed">
                <h3>失敗</h3>
                <h2>${report.summary.failed}</h2>
            </div>
            <div class="summary-item total">
                <h3>成功率</h3>
                <h2>${report.summary.successRate}%</h2>
            </div>
        </div>
        
        <div class="details">
            <h3>測試詳情</h3>
            ${report.details.map(entry => `
                <div class="log-entry ${entry.type}">
                    <span class="timestamp">[${entry.timestamp}]</span>
                    <span>[${entry.type.toUpperCase()}]</span>
                    <span>${entry.message}</span>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    
    const htmlReportPath = `test-report-${Date.now()}.html`;
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    logTest(`📊 測試報告已生成: ${reportPath}`, 'info');
    logTest(`📊 HTML報告已生成: ${htmlReportPath}`, 'info');
    
    return report;
}

// 主測試函數
async function runAutomatedTests() {
    logTest('🚀 開始講師報表系統自動化測試...', 'info');
    
    // 創建截圖目錄
    if (!fs.existsSync('test-screenshots')) {
        fs.mkdirSync('test-screenshots');
    }
    
    let browser = null;
    let page = null;
    
    try {
        // 1. 檢查後端API健康狀態
        logTest('📋 步驟 1: 檢查後端API健康狀態', 'info');
        const backendHealthy = await checkBackendHealth();
        if (!backendHealthy) {
            logTest('❌ 後端API不健康，跳過後續測試', 'fail');
            return;
        }
        
        // 2. 測試講師Web API獲取
        logTest('📋 步驟 2: 測試講師Web API獲取', 'info');
        const webApi = await testTeacherWebApiRetrieval();
        
        // 3. 測試講師報表提交
        if (webApi) {
            logTest('📋 步驟 3: 測試講師報表提交', 'info');
            await testTeacherReportSubmission(webApi);
        }
        
        // 4. 啟動瀏覽器進行前端測試
        logTest('📋 步驟 4: 啟動瀏覽器進行前端測試', 'info');
        browser = await puppeteer.launch({
            headless: TEST_CONFIG.headless,
            slowMo: TEST_CONFIG.slowMo,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        page = await browser.newPage();
        await page.setViewport(TEST_CONFIG.viewport);
        
        // 5. 測試前端頁面載入
        logTest('📋 步驟 5: 測試前端頁面載入', 'info');
        await testFrontendPageLoad(page);
        
        // 6. 測試長按觸控功能
        logTest('📋 步驟 6: 測試長按觸控功能', 'info');
        await testLongPressFunctionality(page);
        
        // 7. 測試講師簽到切換
        logTest('📋 步驟 7: 測試講師簽到切換', 'info');
        await testTeacherCheckinSwitch(page);
        
        // 8. 測試講師報表表單提交
        logTest('📋 步驟 8: 測試講師報表表單提交', 'info');
        await testTeacherReportFormSubmission(page);
        
        // 9. 測試學生簽到切換
        logTest('📋 步驟 9: 測試學生簽到切換', 'info');
        await testStudentCheckinSwitch(page);
        
        // 10. 測試響應式設計
        logTest('📋 步驟 10: 測試響應式設計', 'info');
        await testResponsiveDesign(page);
        
    } catch (error) {
        logTest(`❌ 測試過程中發生錯誤: ${error.message}`, 'fail');
    } finally {
        // 清理資源
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    }
    
    // 生成測試報告
    logTest('📊 生成測試報告...', 'info');
    const report = generateTestReport();
    
    // 輸出測試結果
    console.log('\n' + '='.repeat(60));
    console.log('🧪 講師報表系統自動化測試完成');
    console.log('='.repeat(60));
    console.log(`📊 總測試數: ${report.summary.total}`);
    console.log(`✅ 通過: ${report.summary.passed}`);
    console.log(`❌ 失敗: ${report.summary.failed}`);
    console.log(`📈 成功率: ${report.summary.successRate}%`);
    console.log('='.repeat(60));
    
    if (report.summary.failed > 0) {
        console.log('❌ 部分測試失敗，請檢查詳細報告');
        process.exit(1);
    } else {
        console.log('✅ 所有測試通過！');
        process.exit(0);
    }
}

// 執行測試
if (require.main === module) {
    runAutomatedTests().catch(error => {
        console.error('❌ 測試執行失敗:', error);
        process.exit(1);
    });
}

module.exports = {
    runAutomatedTests,
    testResults
};
