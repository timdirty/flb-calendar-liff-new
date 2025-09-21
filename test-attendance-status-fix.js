const puppeteer = require('puppeteer');

async function testAttendanceStatusFix() {
    console.log('🧪 開始測試修復後的學生狀態識別...');
    
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
            if (text.includes('簽到') || text.includes('通知') || text.includes('進度') || text.includes('標記') || text.includes('學生') || text.includes('出席') || text.includes('缺席') || text.includes('狀態') || text.includes('歷史') || text.includes('歸類') || text.includes('檢查')) {
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
        
        // 長按第一個課程事件
        const firstCard = eventCards[0];
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
        }, firstCard);
        
        // 等待長按動畫完成（2.5秒）
        console.log('⏳ 等待長按動畫完成...');
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 檢查是否出現簽到模態框
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現');
            
            // 等待學生數據載入
            console.log('⏳ 等待學生數據載入...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 檢查學生卡片和狀態
            const studentCards = await page.$$('#studentsList .student-card, #studentsList .attendance-student-item, #studentsList .student-item, #studentsList [data-student-id]');
            console.log(`👥 找到 ${studentCards.length} 個學生卡片`);
            
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
                
                // 測試進度計算
                const progressInfo = await page.evaluate(() => {
                    const cards = document.querySelectorAll('.student-card');
                    let totalStudents = cards.length;
                    let markedStudents = 0;
                    
                    cards.forEach(card => {
                        const name = card.querySelector('.student-name')?.textContent?.trim();
                        const statusTag = card.querySelector('.status-tag');
                        const statusText = statusTag ? statusTag.textContent.trim() : '';
                        
                        // 檢查是否有任何狀態
                        if (statusText && 
                            (statusText.includes('出席') || statusText.includes('Present') || statusText.includes('✅') || statusText.includes('已出席') ||
                             statusText.includes('缺席') || statusText.includes('Absent') || statusText.includes('❌') || statusText.includes('已缺席') ||
                             statusText.includes('請假') || statusText.includes('Leave') || statusText.includes('⚠️') || statusText.includes('已請假'))) {
                            markedStudents++;
                        }
                    });
                    
                    return {
                        totalStudents,
                        markedStudents,
                        progress: totalStudents > 0 ? (markedStudents / totalStudents) * 100 : 0
                    };
                });
                
                console.log('📊 進度計算結果:', progressInfo);
                
                // 測試通知系統的狀態分類
                const notificationTest = await page.evaluate(() => {
                    const cards = document.querySelectorAll('.student-card');
                    const presentStudents = [];
                    const absentStudents = [];
                    const unmarkedStudents = [];
                    
                    cards.forEach(card => {
                        const studentName = card.querySelector('.student-name')?.textContent?.trim();
                        if (studentName) {
                            const statusTag = card.querySelector('.status-tag');
                            const statusText = statusTag ? statusTag.textContent.trim() : '';
                            
                            if (statusText.includes('出席') || statusText.includes('Present') || statusText.includes('✅') || statusText.includes('已出席')) {
                                presentStudents.push(studentName);
                            } else if (statusText.includes('缺席') || statusText.includes('Absent') || statusText.includes('❌') || statusText.includes('已缺席')) {
                                absentStudents.push(studentName);
                            } else if (statusText.includes('請假') || statusText.includes('Leave') || statusText.includes('⚠️') || statusText.includes('已請假')) {
                                absentStudents.push(studentName + '(請假)');
                            } else {
                                unmarkedStudents.push(studentName);
                            }
                        }
                    });
                    
                    return {
                        present: presentStudents,
                        absent: absentStudents,
                        unmarked: unmarkedStudents,
                        total: presentStudents.length + absentStudents.length + unmarkedStudents.length
                    };
                });
                
                console.log('📤 通知系統狀態分類:', notificationTest);
                
                console.log('🎉 測試完成！請檢查控制台日誌');
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
testAttendanceStatusFix().catch(console.error);
