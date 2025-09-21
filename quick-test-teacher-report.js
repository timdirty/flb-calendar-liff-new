const puppeteer = require('puppeteer');

// 快速測試配置
const QUICK_TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    timeout: 15000,
    headless: true, // 快速測試使用無頭模式
    slowMo: 500
};

// 測試結果
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
};

// 測試斷言
function assert(condition, message) {
    testResults.total++;
    if (condition) {
        testResults.passed++;
        console.log(`✅ PASS: ${message}`);
    } else {
        testResults.failed++;
        console.log(`❌ FAIL: ${message}`);
        testResults.errors.push(message);
    }
}

// 等待函數
async function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 快速測試函數
async function quickTest() {
    console.log('🚀 開始講師報表系統快速測試...\n');
    
    let browser = null;
    let page = null;
    
    try {
        // 1. 檢查後端API
        console.log('📋 步驟 1: 檢查後端API健康狀態');
        try {
            const response = await fetch(`${QUICK_TEST_CONFIG.baseUrl}/api/health`);
            const data = await response.json();
            assert(response.ok, '後端API健康檢查');
            assert(data.success === true, '後端API返回成功狀態');
        } catch (error) {
            assert(false, `後端API檢查失敗: ${error.message}`);
        }
        
        // 2. 測試講師Web API獲取
        console.log('\n📋 步驟 2: 測試講師Web API獲取');
        try {
            const response = await fetch(`${QUICK_TEST_CONFIG.baseUrl}/api/teacher-web-api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacherName: 'Tim' })
            });
            const data = await response.json();
            assert(response.ok, '講師Web API獲取請求成功');
            assert(data.success === true, '講師Web API獲取成功');
            if (data.webApi) {
                console.log(`📋 獲取到Web API: ${data.webApi}`);
            }
        } catch (error) {
            assert(false, `講師Web API獲取失敗: ${error.message}`);
        }
        
        // 3. 測試講師報表提交
        console.log('\n📋 步驟 3: 測試講師報表提交');
        try {
            const testData = {
                teacherName: 'Tim',
                courseName: 'SPM',
                courseTime: '13:30-15:00',
                date: '2025/09/21',
                studentCount: 2,
                courseContent: '快速測試課程內容',
                webApi: 'https://script.google.com/macros/s/AKfycbyDg0tcYZgovEF1PbgVUvB8fmiVCckuer75-qNuXmCRY5CTEVEOVaShazjcUryeyUN6/exec'
            };
            
            const response = await fetch(`${QUICK_TEST_CONFIG.baseUrl}/api/teacher-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
            });
            const data = await response.json();
            assert(response.ok, '講師報表提交請求成功');
            assert(data.success === true, '講師報表提交成功');
        } catch (error) {
            assert(false, `講師報表提交失敗: ${error.message}`);
        }
        
        // 4. 測試前端頁面載入
        console.log('\n📋 步驟 4: 測試前端頁面載入');
        browser = await puppeteer.launch({
            headless: QUICK_TEST_CONFIG.headless,
            slowMo: QUICK_TEST_CONFIG.slowMo,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        try {
            await page.goto(`${QUICK_TEST_CONFIG.baseUrl}/calendar`, { 
                waitUntil: 'networkidle0',
                timeout: QUICK_TEST_CONFIG.timeout 
            });
            
            const title = await page.title();
            assert(title.includes('講師行事曆') || title.includes('Calendar'), '頁面標題正確');
            
            const calendarElement = await page.$('.calendar-container');
            assert(calendarElement !== null, '行事曆容器存在');
        } catch (error) {
            assert(false, `前端頁面載入失敗: ${error.message}`);
        }
        
        // 5. 測試長按觸控功能
        console.log('\n📋 步驟 5: 測試長按觸控功能');
        try {
            await page.waitForSelector('.calendar-container', { timeout: 10000 });
            
            const courseCard = await page.$('.course-card');
            if (courseCard) {
                const boundingBox = await courseCard.boundingBox();
                if (boundingBox) {
                    const centerX = boundingBox.x + boundingBox.width / 2;
                    const centerY = boundingBox.y + boundingBox.height / 2;
                    
                    // 模擬長按
                    await page.mouse.move(centerX, centerY);
                    await page.mouse.down();
                    await waitFor(1500);
                    await page.mouse.up();
                    
                    // 檢查是否出現模態框
                    await waitFor(2000);
                    const modalElement = await page.$('.attendance-modal, .modal');
                    assert(modalElement !== null, '長按後出現簽到模態框');
                } else {
                    assert(false, '無法獲取課程卡片位置');
                }
            } else {
                assert(false, '找不到課程卡片');
            }
        } catch (error) {
            assert(false, `長按觸控功能測試失敗: ${error.message}`);
        }
        
        // 6. 測試講師簽到切換
        console.log('\n📋 步驟 6: 測試講師簽到切換');
        try {
            const teacherCheckinBtn = await page.$('.navigator-btn[data-view="teacher"]');
            if (teacherCheckinBtn) {
                await teacherCheckinBtn.click();
                await waitFor(1000);
                
                const teacherReportSection = await page.$('.teacher-report-section');
                assert(teacherReportSection !== null, '成功切換到講師簽到頁面');
                
                const courseContentTextarea = await page.$('#course-content');
                const submitBtn = await page.$('#submitTeacherReport');
                assert(courseContentTextarea !== null, '課程內容輸入框存在');
                assert(submitBtn !== null, '提交按鈕存在');
            } else {
                assert(false, '找不到講師簽到按鈕');
            }
        } catch (error) {
            assert(false, `講師簽到切換功能測試失敗: ${error.message}`);
        }
        
        // 7. 測試講師報表表單提交
        console.log('\n📋 步驟 7: 測試講師報表表單提交');
        try {
            const courseContentTextarea = await page.$('#course-content');
            if (courseContentTextarea) {
                await courseContentTextarea.type('快速測試課程內容');
                await waitFor(500);
            }
            
            const submitBtn = await page.$('#submitTeacherReport');
            if (submitBtn) {
                await submitBtn.click();
                await waitFor(2000);
                
                const submitBtnText = await page.$eval('#submitTeacherReport', el => el.textContent);
                assert(submitBtnText.includes('提交中') || submitBtnText.includes('提交講師報表'), '提交按鈕狀態正確');
            }
        } catch (error) {
            assert(false, `講師報表表單提交測試失敗: ${error.message}`);
        }
        
        // 8. 測試學生簽到切換
        console.log('\n📋 步驟 8: 測試學生簽到切換');
        try {
            const studentCheckinBtn = await page.$('.navigator-btn[data-view="student"]');
            if (studentCheckinBtn) {
                await studentCheckinBtn.click();
                await waitFor(1000);
                
                const studentAttendanceSection = await page.$('.student-attendance-section');
                assert(studentAttendanceSection !== null, '成功切換到學生簽到頁面');
            } else {
                assert(false, '找不到學生簽到按鈕');
            }
        } catch (error) {
            assert(false, `學生簽到切換功能測試失敗: ${error.message}`);
        }
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
        testResults.failed++;
        testResults.errors.push(`測試執行錯誤: ${error.message}`);
    } finally {
        // 清理資源
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    }
    
    // 輸出測試結果
    console.log('\n' + '='.repeat(50));
    console.log('🧪 講師報表系統快速測試完成');
    console.log('='.repeat(50));
    console.log(`📊 總測試數: ${testResults.total}`);
    console.log(`✅ 通過: ${testResults.passed}`);
    console.log(`❌ 失敗: ${testResults.failed}`);
    console.log(`📈 成功率: ${testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(2) : 0}%`);
    
    if (testResults.failed > 0) {
        console.log('\n❌ 失敗的測試:');
        testResults.errors.forEach(error => {
            console.log(`  - ${error}`);
        });
    }
    
    console.log('='.repeat(50));
    
    return testResults.failed === 0;
}

// 執行快速測試
if (require.main === module) {
    quickTest().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ 快速測試執行失敗:', error);
        process.exit(1);
    });
}

module.exports = { quickTest };
