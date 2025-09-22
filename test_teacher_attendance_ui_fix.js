const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testTeacherAttendanceUIFix() {
    console.log('🚀 開始測試講師簽到UI修復...');
    
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
        
        // 模擬點擊事件卡片進入講師簽到
        console.log('🔍 模擬進入講師簽到系統:');
        
        // 查找事件卡片
        const eventCards = await page.$$('.event-card');
        if (eventCards.length > 0) {
            console.log(`  找到 ${eventCards.length} 個事件卡片`);
            
            // 點擊第一個事件卡片
            await eventCards[0].click();
            console.log('  ✅ 點擊事件卡片成功');
            
            // 等待模態框出現
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 查找講師簽到標籤
            const teacherTab = await page.$('[data-tab="teacher-attendance"]');
            if (teacherTab) {
                await teacherTab.click();
                console.log('  ✅ 點擊講師簽到標籤成功');
                
                // 等待內容載入
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 檢查人數設定區域
                console.log('🔍 檢查人數設定區域:');
                const studentCountSelection = await page.$('#student-count-selection');
                if (studentCountSelection) {
                    const styles = await page.evaluate((element) => {
                        const computedStyle = window.getComputedStyle(element);
                        return {
                            display: computedStyle.display,
                            maxHeight: computedStyle.maxHeight,
                            overflowY: computedStyle.overflowY,
                            height: computedStyle.height
                        };
                    }, studentCountSelection);
                    
                    console.log(`  顯示狀態: ${styles.display}`);
                    console.log(`  最大高度: ${styles.maxHeight}`);
                    console.log(`  垂直滾動: ${styles.overflowY}`);
                    console.log(`  實際高度: ${styles.height}`);
                    
                    // 檢查是否移除了滾動
                    if (styles.overflowY === 'visible' || styles.overflowY === 'auto') {
                        console.log('  ✅ 人數設定區域滾動已移除');
                    } else {
                        console.log('  ❌ 人數設定區域仍有滾動限制');
                    }
                    
                    // 檢查是否移除了最大高度限制
                    if (styles.maxHeight === 'none') {
                        console.log('  ✅ 人數設定區域最大高度限制已移除');
                    } else {
                        console.log('  ❌ 人數設定區域仍有最大高度限制');
                    }
                } else {
                    console.log('  ❌ 找不到人數設定區域');
                }
                
                // 檢查透明區塊高度
                console.log('🔍 檢查透明區塊高度:');
                const virtualCard = await page.$('.virtual-student-card');
                if (virtualCard) {
                    const virtualStyles = await page.evaluate((element) => {
                        const computedStyle = window.getComputedStyle(element);
                        return {
                            height: computedStyle.height,
                            minHeight: computedStyle.minHeight,
                            maxHeight: computedStyle.maxHeight
                        };
                    }, virtualCard);
                    
                    console.log(`  高度: ${virtualStyles.height}`);
                    console.log(`  最小高度: ${virtualStyles.minHeight}`);
                    console.log(`  最大高度: ${virtualStyles.maxHeight}`);
                    
                    // 檢查是否縮小了高度
                    const heightValue = parseInt(virtualStyles.height);
                    if (heightValue <= 100) {
                        console.log('  ✅ 透明區塊高度已縮小');
                    } else {
                        console.log('  ❌ 透明區塊高度未縮小');
                    }
                } else {
                    console.log('  ❌ 找不到透明區塊');
                }
                
                // 檢查滾動行為
                console.log('🔍 檢查滾動行為:');
                const modalContent = await page.$('.attendance-modal-content');
                if (modalContent) {
                    const scrollInfo = await page.evaluate((element) => {
                        return {
                            scrollHeight: element.scrollHeight,
                            clientHeight: element.clientHeight,
                            scrollTop: element.scrollTop
                        };
                    }, modalContent);
                    
                    console.log(`  滾動高度: ${scrollInfo.scrollHeight}`);
                    console.log(`  客戶端高度: ${scrollInfo.clientHeight}`);
                    console.log(`  滾動位置: ${scrollInfo.scrollTop}`);
                    
                    // 檢查是否需要滾動
                    if (scrollInfo.scrollHeight <= scrollInfo.clientHeight) {
                        console.log('  ✅ 內容不需要滾動');
                    } else {
                        console.log('  ⚠️ 內容仍需要滾動');
                    }
                }
                
            } else {
                console.log('  ❌ 找不到講師簽到標籤');
            }
        } else {
            console.log('  ❌ 找不到事件卡片');
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
        
        // 最終修復評分
        console.log('🏆 講師簽到UI修復評分:');
        let score = 100;
        
        // 檢查人數設定區域滾動移除
        const studentCountSelection = await page.$('#student-count-selection');
        if (studentCountSelection) {
            const styles = await page.evaluate((element) => {
                const computedStyle = window.getComputedStyle(element);
                return {
                    overflowY: computedStyle.overflowY,
                    maxHeight: computedStyle.maxHeight
                };
            }, studentCountSelection);
            
            if (styles.overflowY !== 'visible' && styles.overflowY !== 'auto') {
                score -= 30;
            }
            if (styles.maxHeight !== 'none') {
                score -= 20;
            }
        } else {
            score -= 50;
        }
        
        // 檢查透明區塊高度縮小
        const virtualCard = await page.$('.virtual-student-card');
        if (virtualCard) {
            const heightValue = parseInt(await page.evaluate((element) => {
                return window.getComputedStyle(element).height;
            }, virtualCard));
            
            if (heightValue > 100) {
                score -= 20;
            }
        } else {
            score -= 30;
        }
        
        // 控制台錯誤檢查
        if (consoleErrors.length > 0) {
            score -= 10;
        }
        
        console.log(`  總分: ${score}/100`);
        
        if (score >= 90) {
            console.log('  🎉 優秀！講師簽到UI修復完成');
        } else if (score >= 80) {
            console.log('  ✅ 良好！大部分修復已完成');
        } else if (score >= 70) {
            console.log('  ⚠️ 一般！還有一些修復需要完成');
        } else {
            console.log('  ❌ 需要改進！修復工作還需要繼續');
        }
        
        // 修復建議
        console.log('💡 講師簽到UI修復建議:');
        
        if (studentCountSelection) {
            const styles = await page.evaluate((element) => {
                const computedStyle = window.getComputedStyle(element);
                return {
                    overflowY: computedStyle.overflowY,
                    maxHeight: computedStyle.maxHeight
                };
            }, studentCountSelection);
            
            if (styles.overflowY !== 'visible' && styles.overflowY !== 'auto') {
                console.log('  ⚠️ 人數設定區域滾動未完全移除');
            }
            if (styles.maxHeight !== 'none') {
                console.log('  ⚠️ 人數設定區域最大高度限制未移除');
            }
        }
        
        if (virtualCard) {
            const heightValue = parseInt(await page.evaluate((element) => {
                return window.getComputedStyle(element).height;
            }, virtualCard));
            
            if (heightValue > 100) {
                console.log('  ⚠️ 透明區塊高度未充分縮小');
            }
        }
        
        console.log('✅ 講師簽到UI修復測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testTeacherAttendanceUIFix().catch(console.error);
