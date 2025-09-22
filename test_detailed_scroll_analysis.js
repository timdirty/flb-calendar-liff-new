const puppeteer = require('puppeteer');

async function testDetailedScrollAnalysis() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 }, // iPhone X 尺寸
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 375, height: 812 });
    
    try {
        console.log('🚀 開始詳細滾動分析...');
        
        // 導航到頁面
        await page.goto('http://localhost:3000/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 點擊今日按鈕
        await page.click('button[data-view="today"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 找到一個課程並點擊
        const courseCards = await page.$$('.event-card');
        if (courseCards.length > 0) {
            await courseCards[0].click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 等待標籤出現並切換到講師簽到標籤
            await page.waitForSelector('[data-tab="teacher-attendance"]', { timeout: 10000 });
            const teacherTab = await page.$('[data-tab="teacher-attendance"]');
            if (teacherTab) {
                await teacherTab.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 詳細分析滾動容器和內容
                const detailedInfo = await page.evaluate(() => {
                    const modalContent = document.querySelector('.attendance-modal-content');
                    const attendanceContent = document.getElementById('attendanceContent');
                    const scrollContainer = document.querySelector('.teacher-attendance-content div[style*="overflow-y: auto"]');
                    const transparentBlock = document.querySelector('div[style*="height: 300px"][style*="background: transparent"]');
                    
                    let info = {
                        modalContent: null,
                        attendanceContent: null,
                        scrollContainer: null,
                        transparentBlock: null,
                        allElements: []
                    };
                    
                    if (modalContent) {
                        info.modalContent = {
                            scrollTop: modalContent.scrollTop,
                            scrollHeight: modalContent.scrollHeight,
                            clientHeight: modalContent.clientHeight,
                            canScroll: modalContent.scrollHeight > modalContent.clientHeight,
                            scrollableDistance: modalContent.scrollHeight - modalContent.clientHeight
                        };
                    }
                    
                    if (attendanceContent) {
                        info.attendanceContent = {
                            scrollTop: attendanceContent.scrollTop,
                            scrollHeight: attendanceContent.scrollHeight,
                            clientHeight: attendanceContent.clientHeight,
                            canScroll: attendanceContent.scrollHeight > attendanceContent.clientHeight,
                            scrollableDistance: attendanceContent.scrollHeight - attendanceContent.clientHeight
                        };
                    }
                    
                    if (scrollContainer) {
                        info.scrollContainer = {
                            scrollTop: scrollContainer.scrollTop,
                            scrollHeight: scrollContainer.scrollHeight,
                            clientHeight: scrollContainer.clientHeight,
                            canScroll: scrollContainer.scrollHeight > scrollContainer.clientHeight,
                            scrollableDistance: scrollContainer.scrollHeight - scrollContainer.clientHeight
                        };
                    }
                    
                    if (transparentBlock) {
                        const rect = transparentBlock.getBoundingClientRect();
                        const style = window.getComputedStyle(transparentBlock);
                        info.transparentBlock = {
                            height: rect.height,
                            styleHeight: style.height,
                            top: rect.top,
                            bottom: rect.bottom,
                            visible: rect.height > 0
                        };
                    }
                    
                    // 分析所有子元素的高度
                    const targetContainer = attendanceContent || scrollContainer;
                    if (targetContainer) {
                        const children = targetContainer.children;
                        for (let i = 0; i < children.length; i++) {
                            const child = children[i];
                            const rect = child.getBoundingClientRect();
                            const style = window.getComputedStyle(child);
                            info.allElements.push({
                                index: i,
                                tagName: child.tagName,
                                className: child.className,
                                id: child.id,
                                height: rect.height,
                                styleHeight: style.height,
                                top: rect.top,
                                bottom: rect.bottom,
                                isVisible: rect.height > 0
                            });
                        }
                    }
                    
                    return info;
                });
                
                console.log('📊 詳細滾動分析:', JSON.stringify(detailedInfo, null, 2));
                
                // 嘗試手動滾動到不同位置
                await page.evaluate(() => {
                    const attendanceContent = document.getElementById('attendanceContent');
                    if (attendanceContent) {
                        console.log('🔧 嘗試滾動attendanceContent到不同位置...');
                        
                        // 滾動到中間位置
                        attendanceContent.scrollTop = attendanceContent.scrollHeight / 2;
                        console.log('滾動到中間 - scrollTop:', attendanceContent.scrollTop);
                        
                        // 等待一下
                        setTimeout(() => {
                            // 滾動到底部
                            attendanceContent.scrollTop = attendanceContent.scrollHeight;
                            console.log('滾動到底部 - scrollTop:', attendanceContent.scrollTop);
                        }, 500);
                    }
                });
                
                // 等待滾動完成
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 檢查最終狀態
                const finalInfo = await page.evaluate(() => {
                    const attendanceContent = document.getElementById('attendanceContent');
                    if (attendanceContent) {
                        return {
                            scrollTop: attendanceContent.scrollTop,
                            scrollHeight: attendanceContent.scrollHeight,
                            clientHeight: attendanceContent.clientHeight,
                            canScroll: attendanceContent.scrollHeight > attendanceContent.clientHeight,
                            scrollableDistance: attendanceContent.scrollHeight - attendanceContent.clientHeight
                        };
                    }
                    return null;
                });
                
                console.log('📊 最終滾動狀態:', finalInfo);
                
                // 測試結果
                if (finalInfo && finalInfo.scrollableDistance > 200) {
                    console.log('✅ 滾動區域已成功擴展！');
                } else {
                    console.log('❌ 滾動區域擴展不足');
                }
                
                return finalInfo && finalInfo.scrollableDistance > 200;
            } else {
                console.log('❌ 找不到講師簽到標籤');
                return false;
            }
        } else {
            console.log('❌ 找不到課程卡片');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
        return false;
    } finally {
        await browser.close();
    }
}

testDetailedScrollAnalysis();
