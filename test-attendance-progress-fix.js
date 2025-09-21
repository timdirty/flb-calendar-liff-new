const puppeteer = require('puppeteer');

async function testAttendanceProgressFix() {
    console.log('🧪 開始測試修復後的簽到進度功能...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 667 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 監聽控制台消息
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('簽到') || text.includes('通知') || text.includes('進度') || text.includes('標記') || text.includes('學生') || text.includes('出席') || text.includes('缺席') || text.includes('按鈕') || text.includes('點擊') || text.includes('API') || text.includes('調用')) {
                console.log('📱 控制台:', text);
            }
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        console.log('✅ 頁面載入完成');
        
        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 查找事件卡片
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個事件卡片`);
        
        if (eventCards.length === 0) {
            console.log('❌ 沒有找到事件卡片，無法測試');
            return;
        }
        
        // 選擇一個合適的課程事件（已經開始或即將開始的）
        let selectedCard = null;
        for (let i = 0; i < eventCards.length; i++) {
            const card = eventCards[i];
            const cardInfo = await page.evaluate((card) => {
                return {
                    title: card.dataset.eventTitle,
                    start: card.dataset.eventStart,
                    end: card.dataset.eventEnd,
                    instructor: card.dataset.eventInstructor
                };
            }, card);
            
            console.log(`📅 課程 ${i + 1}:`, cardInfo);
            
            // 選擇第一個課程（通常是最早的）
            if (i === 0) {
                selectedCard = card;
                break;
            }
        }
        
        if (!selectedCard) {
            console.log('❌ 沒有找到合適的課程事件');
            return;
        }
        
        console.log('🔄 開始長按課程事件...');
        
        // 模擬真實的長按操作
        await page.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            // 觸發 mousedown 事件
            const mouseDownEvent = new MouseEvent('mousedown', {
                clientX: startX,
                clientY: startY,
                bubbles: true,
                cancelable: true
            });
            card.dispatchEvent(mouseDownEvent);
            
            console.log('🖱️ 觸發了 mousedown 事件');
        }, selectedCard);
        
        // 等待長按動畫完成（2.5秒）
        console.log('⏳ 等待長按動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 檢查是否出現簽到模態框
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現');
            
            // 等待學生數據載入
            console.log('⏳ 等待學生數據載入...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 檢查學生卡片和狀態
            const studentCards = await page.$$('#studentsList .student-card, #studentsList .attendance-student-item, #studentsList .student-item, #studentsList [data-student-id]');
            console.log(`👥 找到 ${studentCards.length} 個學生卡片`);
            
            // 如果還是找不到，嘗試其他選擇器
            if (studentCards.length === 0) {
                const allCards = await page.evaluate(() => {
                    const selectors = [
                        '.student-card',
                        '.attendance-student-item', 
                        '.student-item',
                        '[data-student-id]',
                        '#studentsList .student-card',
                        '#studentsList .attendance-student-item',
                        '#studentsList .student-item',
                        '#studentsList [data-student-id]',
                        '.attendance-student-list > div'
                    ];
                    
                    const results = {};
                    selectors.forEach(selector => {
                        results[selector] = document.querySelectorAll(selector).length;
                    });
                    return results;
                });
                
                console.log('🔍 所有學生卡片選擇器結果:', allCards);
            }
            
            if (studentCards.length > 0) {
                // 檢查學生的初始狀態
                const initialStates = await page.evaluate(() => {
                    const cards = document.querySelectorAll('.student-card');
                    const states = [];
                    cards.forEach(card => {
                        const name = card.querySelector('.student-name')?.textContent?.trim();
                        const statusTag = card.querySelector('.status-tag');
                        const statusText = statusTag ? statusTag.textContent.trim() : '無狀態';
                        states.push({ name, status: statusText });
                    });
                    return states;
                });
                
                console.log('📋 學生初始狀態:', initialStates);
                
                // 模擬部分學生簽到
                console.log('📝 模擬部分學生簽到...');
                
                // 只點擊第一個學生的出席按鈕
                const presentButtons = await page.$$('#studentsList .present-btn');
                console.log(`🔍 找到 ${presentButtons.length} 個出席按鈕`);
                
                if (presentButtons.length > 0) {
                    // 檢查按鈕狀態
                    const buttonInfo = await page.evaluate((btn) => {
                        return {
                            disabled: btn.disabled,
                            textContent: btn.textContent,
                            className: btn.className,
                            dataset: btn.dataset
                        };
                    }, presentButtons[0]);
                    
                    console.log('🔍 按鈕狀態:', buttonInfo);
                    
                    if (!buttonInfo.disabled) {
                        await presentButtons[0].click();
                        console.log('✅ 點擊了第一個學生的出席按鈕');
                    } else {
                        console.log('⚠️ 按鈕被禁用，無法點擊');
                    }
                    
                    // 等待進度更新（增加等待時間讓API調用完成）
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    // 檢查進度更新
                    const progressInfo = await page.evaluate(() => {
                        const cards = document.querySelectorAll('.student-card');
                        let totalStudents = cards.length;
                        let markedStudents = 0;
                        let currentMarked = 0;
                        
                        // 檢查是否有 studentAttendanceStatus 變數
                        const hasStatusVar = typeof studentAttendanceStatus !== 'undefined';
                        console.log('🔍 檢查變數狀態:', { hasStatusVar, studentAttendanceStatus });
                        
                        cards.forEach(card => {
                            const name = card.querySelector('.student-name')?.textContent?.trim();
                            const statusTag = card.querySelector('.status-tag');
                            const statusText = statusTag ? statusTag.textContent.trim() : '';
                            
                            // 檢查是否有當次簽到狀態
                            if (hasStatusVar && studentAttendanceStatus[name]) {
                                currentMarked++;
                                console.log(`✅ 找到當次簽到狀態: ${name} = ${studentAttendanceStatus[name]}`);
                            }
                            
                            // 檢查是否有任何進度（當次或歷史）
                            if (hasStatusVar && studentAttendanceStatus[name]) {
                                markedStudents++;
                            } else if (statusText && statusText !== '未簽到' && statusText !== '待簽到' && statusText !== '無狀態') {
                                markedStudents++;
                                console.log(`✅ 找到歷史狀態: ${name} = ${statusText}`);
                            }
                        });
                        
                        return {
                            totalStudents,
                            currentMarked,
                            totalMarked: markedStudents,
                            progress: totalStudents > 0 ? (markedStudents / totalStudents) * 100 : 0,
                            hasStatusVar,
                            statusKeys: hasStatusVar ? Object.keys(studentAttendanceStatus) : []
                        };
                    });
                    
                    console.log('📊 進度統計:', progressInfo);
                    
                    // 等待通知發送
                    console.log('⏳ 等待通知發送...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    console.log('🎉 測試完成！請檢查控制台日誌和LINE通知');
                } else {
                    console.log('❌ 沒有找到出席按鈕');
                }
            } else {
                console.log('❌ 沒有找到學生卡片');
            }
        } else {
            console.log('❌ 簽到模態框未出現');
        }
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 3000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testAttendanceProgressFix().catch(console.error);
