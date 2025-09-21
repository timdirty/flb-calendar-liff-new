const puppeteer = require('puppeteer');

async function testVirtualStudentCard() {
    console.log('🚀 開始測試虛擬學生卡片功能...');
    
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

        // 查找所有課程卡片並顯示講師信息
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個課程卡片`);
        
        // 檢查所有課程的講師
        const allCourses = [];
        for (let i = 0; i < eventCards.length; i++) {
            const cardData = await page.evaluate((card) => {
                return {
                    instructor: card.dataset.eventInstructor,
                    title: card.dataset.eventTitle,
                    start: card.dataset.eventStart
                };
            }, eventCards[i]);
            allCourses.push({ card: eventCards[i], data: cardData });
        }
        
        console.log('📋 所有課程講師:', allCourses.map(c => c.data.instructor));
        
        // 查找 BELLA 講師的課程，如果沒有則選擇第一個
        let selectedCard = null;
        const bellaCard = allCourses.find(c => c.data.instructor === 'BELLA');
        
        if (bellaCard) {
            selectedCard = bellaCard.card;
            console.log('🎯 找到 BELLA 講師的課程:', bellaCard.data);
        } else {
            selectedCard = allCourses[0].card;
            console.log('🎯 沒有找到 BELLA 講師，選擇第一個課程:', allCourses[0].data);
        }
        
        if (selectedCard) {
            const firstCard = selectedCard;
            
            // 先滾動到課程卡片位置
            await firstCard.scrollIntoView();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const box = await firstCard.boundingBox();
            if (box) {
                const centerX = box.x + box.width / 2;
                const centerY = box.y + box.height / 2;
                console.log('📍 課程卡片位置:', { centerX, centerY, width: box.width, height: box.height });
                
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
                
                console.log('🔋 觸控長按完成');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // 檢查是否有模態框出現
                const modal = await page.$('.attendance-modal-content');
                if (modal) {
                    console.log('✅ 簽到模態框出現');
                    
                    // 檢查學生列表
                    const studentsList = await page.$('#studentsList');
                    if (studentsList) {
                        console.log('✅ 學生列表存在');
                        
                        // 檢查虛擬學生卡片是否存在
                        const virtualCard = await page.$('.virtual-student-card');
                        if (virtualCard) {
                            console.log('✅ 虛擬學生卡片存在');
                            
                            // 檢查虛擬學生卡片的樣式和位置
                            const virtualCardInfo = await page.evaluate(() => {
                                const element = document.querySelector('.virtual-student-card');
                                if (element) {
                                    const computedStyle = window.getComputedStyle(element);
                                    const rect = element.getBoundingClientRect();
                                    return {
                                        height: computedStyle.height,
                                        opacity: computedStyle.opacity,
                                        visibility: computedStyle.visibility,
                                        display: computedStyle.display,
                                        pointerEvents: computedStyle.pointerEvents,
                                        offsetHeight: element.offsetHeight,
                                        scrollHeight: element.scrollHeight,
                                        clientHeight: element.clientHeight,
                                        // 檢查內聯樣式
                                        styleHeight: element.style.height,
                                        // 檢查所有可能影響高度的屬性
                                        maxHeight: computedStyle.maxHeight,
                                        minHeight: computedStyle.minHeight,
                                        boxSizing: computedStyle.boxSizing,
                                        rect: {
                                            top: rect.top,
                                            left: rect.left,
                                            width: rect.width,
                                            height: rect.height
                                        }
                                    };
                                }
                                return null;
                            });
                            console.log('📊 虛擬學生卡片詳細信息:', virtualCardInfo);
                            
                            // 檢查學生列表的所有子元素
                            const allChildren = await page.evaluate(() => {
                                const studentsList = document.getElementById('studentsList');
                                if (studentsList) {
                                    const children = Array.from(studentsList.children);
                                    return children.map((child, index) => ({
                                        index: index,
                                        tagName: child.tagName,
                                        className: child.className,
                                        offsetHeight: child.offsetHeight,
                                        scrollHeight: child.scrollHeight,
                                        clientHeight: child.clientHeight
                                    }));
                                }
                                return [];
                            });
                            console.log('📋 學生列表所有子元素:', allChildren);
                        } else {
                            console.log('❌ 虛擬學生卡片不存在');
                        }
                        
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
                                    clientHeight: element.clientHeight,
                                    offsetHeight: element.offsetHeight,
                                    // 檢查所有可能影響高度的屬性
                                    boxSizing: computedStyle.boxSizing,
                                    display: computedStyle.display,
                                    flex: computedStyle.flex,
                                    flexDirection: computedStyle.flexDirection
                                };
                            }
                            return null;
                        });
                        console.log('📊 學生列表滾動設置:', studentsListStyle);
                        
                        // 設置固定高度並檢查滾動
                        console.log('🔧 設置固定高度並檢查滾動...');
                        await page.evaluate(() => {
                            const studentsList = document.getElementById('studentsList');
                            if (studentsList) {
                                // 設置固定高度
                                studentsList.style.height = '500px';
                                studentsList.style.maxHeight = '500px';
                                studentsList.style.minHeight = '500px';
                                // 強制重新計算
                                studentsList.offsetHeight;
                            }
                        });
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // 重新檢查高度
                        const newHeight = await page.evaluate(() => {
                            const element = document.getElementById('studentsList');
                            if (element) {
                                return {
                                    scrollHeight: element.scrollHeight,
                                    clientHeight: element.clientHeight,
                                    offsetHeight: element.offsetHeight
                                };
                            }
                            return null;
                        });
                        console.log('📏 設置固定高度後的高度:', newHeight);
                        
                        // 檢查學生卡片數量
                        const studentCards = await page.$$('.attendance-student-item');
                        console.log(`👥 找到 ${studentCards.length} 個學生卡片`);
                        
                        // 檢查是否有滾動空間（使用容器的實際高度）
                        const hasScroll = newHeight.scrollHeight > 500; // 容器固定高度是 500px
                        console.log('🔄 是否有滾動空間:', hasScroll);
                        console.log('📏 內容高度:', newHeight.scrollHeight);
                        console.log('📏 容器高度: 500px');
                        console.log('📏 滾動空間:', newHeight.scrollHeight - 500, 'px');
                        
                        if (hasScroll) {
                            console.log('✅ 學生列表可以滾動');
                            
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
                            }
                        } else {
                            console.log('⚠️ 學生列表沒有滾動空間');
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
testVirtualStudentCard().catch(console.error);
