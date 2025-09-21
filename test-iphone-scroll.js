const puppeteer = require('puppeteer');

async function testStudentCardsScroll() {
    console.log('🚀 開始 iPhone 16 Pro 學生卡片滾動測試...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 393,  // iPhone 16 Pro 寬度
            height: 852, // iPhone 16 Pro 高度
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
        console.log('📏 視窗大小: 393x852, 設備像素比: 3x');

        // 導航到頁面
        console.log('🌐 正在載入頁面...');
        await page.goto('http://localhost:3000/perfect-calendar.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        console.log('✅ 頁面載入完成');

        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 檢查頁面標題
        const title = await page.title();
        console.log('📄 頁面標題:', title);

        // 檢查行事曆容器
        const calendarContainer = await page.$('.calendar-container');
        if (calendarContainer) {
            console.log('✅ 行事曆容器存在');
        } else {
            console.log('❌ 行事曆容器不存在');
        }

        // 等待課程卡片出現
        console.log('⏳ 等待課程卡片出現...');
        await page.waitForSelector('.event-card', { timeout: 10000 });

        // 查找可點擊的課程卡片
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個課程卡片`);

        if (eventCards.length > 0) {
            // 檢查第一個課程卡片的屬性
            const firstCardData = await page.evaluate(() => {
                const card = document.querySelector('.event-card');
                if (card) {
                    return {
                        title: card.dataset.eventTitle,
                        instructor: card.dataset.eventInstructor,
                        start: card.dataset.eventStart,
                        end: card.dataset.eventEnd,
                        className: card.className
                    };
                }
                return null;
            });
            console.log('📋 第一個課程卡片資料:', firstCardData);
            
            // 檢查頁面是否有模態框
            const existingModal = await page.$('.attendance-modal-content');
            if (existingModal) {
                console.log('✅ 簽到模態框已存在');
            } else {
                console.log('⏳ 簽到模態框不存在，嘗試觸發...');
                
                // 長按課程卡片（模擬觸控長按）
                console.log('👆 長按第一個課程卡片...');
                const firstCard = eventCards[0];
                
                // 先滾動到課程卡片位置
                await firstCard.scrollIntoView();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const box = await firstCard.boundingBox();
                if (box) {
                    const centerX = box.x + box.width / 2;
                    const centerY = box.y + box.height / 2;
                    console.log('📍 課程卡片位置:', { centerX, centerY, width: box.width, height: box.height });
                    
                    // 模擬觸控長按：使用 Puppeteer 觸控 API
                    console.log('🔋 開始觸控長按，等待 5 秒...');
                    
                    // 使用 Puppeteer 的觸控 API 進行長按（5秒）
                    await page.touchscreen.tap(centerX, centerY, { delay: 5000 });
                    
                    // 檢查長按過程中是否有充電動畫
                    const checkChargingAnimation = async () => {
                        const hasChargingClass = await page.evaluate(() => {
                            const cards = document.querySelectorAll('.event-card');
                            return Array.from(cards).some(card => card.classList.contains('charging'));
                        });
                        console.log('🔋 充電動畫狀態:', hasChargingClass);
                    };
                    
                    // 每0.5秒檢查一次動畫狀態
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await checkChargingAnimation();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await checkChargingAnimation();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await checkChargingAnimation();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await checkChargingAnimation();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await checkChargingAnimation();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await checkChargingAnimation();
                    
                    console.log('🔋 觸控長按完成');
                    await new Promise(resolve => setTimeout(resolve, 3000)); // 等待更長時間讓動畫完成
                } else {
                    console.log('❌ 無法獲取課程卡片位置');
                }
                
                // 檢查是否有模態框出現
                const modalAfterClick = await page.$('.attendance-modal-content');
                if (modalAfterClick) {
                    console.log('✅ 點擊後簽到模態框出現');
                } else {
                    console.log('⏳ 點擊後沒有模態框，嘗試長按...');
                    
                    // 嘗試長按
                    const firstCard = eventCards[0];
                    const box = await firstCard.boundingBox();
                    if (box) {
                        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                        await page.mouse.down();
                        await new Promise(resolve => setTimeout(resolve, 1500)); // 長按 1.5 秒
                        await page.mouse.up();
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }

            // 等待簽到模態框出現
            console.log('⏳ 等待簽到模態框出現...');
            try {
                await page.waitForSelector('.attendance-modal-content', { timeout: 5000 });
                console.log('✅ 簽到模態框出現');
            } catch (error) {
                console.log('❌ 簽到模態框沒有出現，檢查頁面狀態...');
                
                // 檢查頁面中是否有其他模態框或彈窗
                const allModals = await page.$$('[class*="modal"], [class*="popup"], [class*="dialog"]');
                console.log(`🔍 找到 ${allModals.length} 個可能的模態框`);
                
                // 檢查所有可能的簽到相關元素
                const attendanceElements = await page.$$('[id*="attendance"], [class*="attendance"], [id*="student"], [class*="student"]');
                console.log(`🔍 找到 ${attendanceElements.length} 個簽到相關元素`);
                
                // 檢查是否有學生列表
                const studentsList = await page.$('#studentsList');
                if (studentsList) {
                    console.log('✅ 學生列表存在（可能在頁面中）');
                } else {
                    console.log('❌ 學生列表不存在');
                }
                
                // 檢查頁面中是否有任何可見的彈窗
                const visibleElements = await page.evaluate(() => {
                    const elements = document.querySelectorAll('*');
                    const visible = [];
                    elements.forEach(el => {
                        const style = window.getComputedStyle(el);
                        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                            if (el.id.includes('attendance') || el.className.includes('attendance') || 
                                el.id.includes('student') || el.className.includes('student') ||
                                el.id.includes('modal') || el.className.includes('modal')) {
                                visible.push({
                                    tag: el.tagName,
                                    id: el.id,
                                    className: el.className,
                                    text: el.textContent.substring(0, 50)
                                });
                            }
                        }
                    });
                    return visible;
                });
                console.log('🔍 可見的簽到相關元素:', visibleElements);
                
                // 嘗試點擊簽到菜單
                const attendanceMenu = await page.$('#attendanceMenu');
                if (attendanceMenu) {
                    console.log('✅ 找到簽到菜單，嘗試點擊...');
                    await attendanceMenu.click();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // 再次檢查是否有模態框出現
                    const modalAfterMenuClick = await page.$('.attendance-modal-content');
                    if (modalAfterMenuClick) {
                        console.log('✅ 點擊簽到菜單後模態框出現');
                        // 繼續測試學生卡片滾動功能
                    } else {
                        console.log('❌ 點擊簽到菜單後模態框仍未出現');
                        return; // 提前結束測試
                    }
                } else {
                    console.log('❌ 找不到簽到菜單');
                    return; // 提前結束測試
                }
            }

            // 檢查學生列表是否存在
            const studentsList = await page.$('#studentsList');
            if (studentsList) {
                console.log('✅ 學生列表容器存在');
                
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

                if (studentsListStyle) {
                    // 檢查是否有滾動空間
                    const hasScroll = studentsListStyle.scrollHeight > studentsListStyle.clientHeight;
                    console.log('🔄 是否有滾動空間:', hasScroll);
                    console.log('📏 內容高度:', studentsListStyle.scrollHeight);
                    console.log('📏 可見高度:', studentsListStyle.clientHeight);

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
                }

                // 檢查學生卡片數量
                const studentCards = await page.$$('.attendance-student-item');
                console.log(`👥 找到 ${studentCards.length} 個學生卡片`);

                if (studentCards.length > 0) {
                    console.log('✅ 學生卡片存在');
                    
                    // 檢查學生卡片是否可見
                    for (let i = 0; i < studentCards.length; i++) {
                        const isVisible = await studentCards[i].isIntersectingViewport();
                        console.log(`👤 學生卡片 ${i + 1} 是否可見:`, isVisible);
                    }
                } else {
                    console.log('❌ 沒有找到學生卡片');
                }
            } else {
                console.log('❌ 學生列表容器不存在');
            }

            // 檢查底部導航欄
            const floatingNavigator = await page.$('.floating-navigator');
            if (floatingNavigator) {
                console.log('✅ 底部導航欄存在');
                
                // 檢查導航欄位置
                const navPosition = await page.evaluate(() => {
                    const nav = document.querySelector('.floating-navigator');
                    if (nav) {
                        const rect = nav.getBoundingClientRect();
                        return {
                            bottom: rect.bottom,
                            top: rect.top,
                            height: rect.height
                        };
                    }
                    return null;
                });
                console.log('📍 導航欄位置:', navPosition);
            } else {
                console.log('❌ 底部導航欄不存在');
            }

            // 檢查模態框高度
            const modalHeight = await page.evaluate(() => {
                const modal = document.querySelector('.attendance-modal-content');
                if (modal) {
                    const rect = modal.getBoundingClientRect();
                    return {
                        height: rect.height,
                        maxHeight: window.getComputedStyle(modal).maxHeight
                    };
                }
                return null;
            });
            console.log('📐 模態框高度:', modalHeight);

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
testStudentCardsScroll().catch(console.error);
