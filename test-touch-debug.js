const puppeteer = require('puppeteer');

async function testTouchDebug() {
    console.log('🚀 開始觸控調試測試...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 393,
            height: 852,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true
        },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    });

    try {
        const page = await browser.newPage();
        
        // 設置 iPhone 16 Pro 用戶代理
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
        
        // 設置視窗大小
        await page.setViewport({
            width: 393,
            height: 852,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true
        });

        console.log('📱 模擬 iPhone 16 Pro 環境設置完成');

        // 導航到頁面
        console.log('🌐 正在載入頁面...');
        await page.goto('http://localhost:3000/perfect-calendar.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        console.log('✅ 頁面載入完成');

        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 等待課程卡片出現
        console.log('⏳ 等待課程卡片出現...');
        await page.waitForSelector('.event-card', { timeout: 10000 });

        // 查找可點擊的課程卡片
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個課程卡片`);

        if (eventCards.length > 0) {
            const firstCard = eventCards[0];
            
            // 先滾動到課程卡片位置
            await firstCard.scrollIntoView();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const box = await firstCard.boundingBox();
            if (box) {
                const centerX = box.x + box.width / 2;
                const centerY = box.y + box.height / 2;
                console.log('📍 課程卡片位置:', { centerX, centerY, width: box.width, height: box.height });
                
                // 添加觸控事件監聽器來調試
                await page.evaluate(() => {
                    let touchStartCount = 0;
                    let touchEndCount = 0;
                    
                    document.addEventListener('touchstart', function(e) {
                        touchStartCount++;
                        console.log('🔍 TouchStart 事件觸發 #' + touchStartCount, {
                            target: e.target.tagName,
                            className: e.target.className,
                            touches: e.touches.length
                        });
                    });
                    
                    document.addEventListener('touchend', function(e) {
                        touchEndCount++;
                        console.log('🔍 TouchEnd 事件觸發 #' + touchEndCount, {
                            target: e.target.tagName,
                            className: e.target.className,
                            changedTouches: e.changedTouches.length
                        });
                    });
                    
                    window.touchDebug = {
                        touchStartCount: () => touchStartCount,
                        touchEndCount: () => touchEndCount
                    };
                });
                
                // 直接觸發觸控事件到課程卡片元素
                console.log('🔋 開始觸控長按，等待 5 秒...');
                
                // 觸發 touchstart 事件
                await page.evaluate((element) => {
                    const touch = new Touch({
                        identifier: 1,
                        target: element,
                        clientX: 196.5,
                        clientY: 410.5,
                        pageX: 196.5,
                        pageY: 410.5,
                        screenX: 196.5,
                        screenY: 410.5
                    });
                    
                    const touchEvent = new TouchEvent('touchstart', {
                        touches: [touch],
                        targetTouches: [touch],
                        changedTouches: [touch],
                        bubbles: true,
                        cancelable: true
                    });
                    
                    element.dispatchEvent(touchEvent);
                }, firstCard);
                
                // 等待 5 秒
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // 觸發 touchend 事件
                await page.evaluate((element) => {
                    const touch = new Touch({
                        identifier: 1,
                        target: element,
                        clientX: 196.5,
                        clientY: 410.5,
                        pageX: 196.5,
                        pageY: 410.5,
                        screenX: 196.5,
                        screenY: 410.5
                    });
                    
                    const touchEvent = new TouchEvent('touchend', {
                        touches: [],
                        targetTouches: [],
                        changedTouches: [touch],
                        bubbles: true,
                        cancelable: true
                    });
                    
                    element.dispatchEvent(touchEvent);
                }, firstCard);
                
                // 檢查觸控事件是否被觸發
                const touchCounts = await page.evaluate(() => {
                    return {
                        touchStart: window.touchDebug.touchStartCount(),
                        touchEnd: window.touchDebug.touchEndCount()
                    };
                });
                console.log('📊 觸控事件計數:', touchCounts);
                
                // 等待一下讓動畫完成
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 檢查是否有模態框出現
                const modal = await page.$('.attendance-modal-content');
                if (modal) {
                    console.log('✅ 簽到模態框出現');
                    
                    // 檢查學生列表
                    const studentsList = await page.$('#studentsList');
                    if (studentsList) {
                        console.log('✅ 學生列表存在');
                        
                        // 檢查學生列表的滾動設置
                        const studentsListStyle = await page.evaluate(() => {
                            const element = document.getElementById('studentsList');
                            if (element) {
                                const computedStyle = window.getComputedStyle(element);
                                return {
                                    overflowY: computedStyle.overflowY,
                                    maxHeight: computedStyle.maxHeight,
                                    minHeight: computedStyle.minHeight,
                                    height: computedStyle.height,
                                    scrollHeight: element.scrollHeight,
                                    clientHeight: element.clientHeight
                                };
                            }
                            return null;
                        });
                        console.log('📊 學生列表滾動設置:', studentsListStyle);
                        
                        // 檢查學生卡片數量
                        const studentCards = await page.$$('.attendance-student-item');
                        console.log(`👥 找到 ${studentCards.length} 個學生卡片`);
                        
                        if (studentCards.length > 0) {
                            console.log('✅ 學生卡片存在');
                            
                            // 檢查學生列表內容高度
                            const contentHeight = await page.evaluate(() => {
                                const studentsList = document.getElementById('studentsList');
                                if (studentsList) {
                                    return {
                                        scrollHeight: studentsList.scrollHeight,
                                        clientHeight: studentsList.clientHeight,
                                        offsetHeight: studentsList.offsetHeight,
                                        children: studentsList.children.length,
                                        innerHTML: studentsList.innerHTML.substring(0, 200)
                                    };
                                }
                                return null;
                            });
                            console.log('📏 學生列表內容詳情:', contentHeight);
                            
                            // 嘗試滾動學生列表
                            console.log('🔄 嘗試滾動學生列表...');
                            await page.evaluate(() => {
                                const studentsList = document.getElementById('studentsList');
                                if (studentsList) {
                                    studentsList.scrollTop = 100;
                                }
                            });
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            
                            // 檢查滾動是否成功
                            const scrollTop = await page.evaluate(() => {
                                const studentsList = document.getElementById('studentsList');
                                return studentsList ? studentsList.scrollTop : 0;
                            });
                            console.log('📜 滾動位置:', scrollTop);
                            
                            if (scrollTop > 0) {
                                console.log('✅ 學生列表滾動成功');
                            } else {
                                console.log('❌ 學生列表滾動失敗');
                                
                                // 嘗試強制設置滾動高度
                                console.log('🔧 嘗試強制設置滾動高度...');
                                await page.evaluate(() => {
                                    const studentsList = document.getElementById('studentsList');
                                    if (studentsList) {
                                        studentsList.style.height = '200px';
                                        studentsList.style.overflowY = 'scroll';
                                    }
                                });
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                
                                // 再次嘗試滾動
                                await page.evaluate(() => {
                                    const studentsList = document.getElementById('studentsList');
                                    if (studentsList) {
                                        studentsList.scrollTop = 50;
                                    }
                                });
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                
                                const newScrollTop = await page.evaluate(() => {
                                    const studentsList = document.getElementById('studentsList');
                                    return studentsList ? studentsList.scrollTop : 0;
                                });
                                console.log('📜 強制設置後滾動位置:', newScrollTop);
                            }
                        }
                    } else {
                        console.log('❌ 學生列表不存在');
                    }
                } else {
                    console.log('❌ 簽到模態框沒有出現');
                }
            } else {
                console.log('❌ 無法獲取課程卡片位置');
            }
        } else {
            console.log('❌ 沒有找到課程卡片');
        }

        // 等待一下讓用戶看到結果
        console.log('⏳ 等待 5 秒讓用戶查看結果...');
        await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
        console.log('🔚 測試完成，瀏覽器已關閉');
    }
}

// 執行測試
testTouchDebug().catch(console.error);
