const puppeteer = require('puppeteer');

async function testSimpleTiming() {
    console.log('🧪 開始測試新的長按時序（使用滑鼠事件）...');
    console.log('📋 預期時序：0.5秒集氣 → 1秒預載 → 1.5秒開啟');
    
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
            if (text.includes('觸控') || text.includes('持續時間') || text.includes('太短') || text.includes('充電') || text.includes('載入') || text.includes('集氣') || text.includes('預載') || text.includes('跳出') || text.includes('模態框') || text.includes('滑鼠') || text.includes('按壓') || text.includes('集氣充能')) {
                console.log('📱 控制台:', text);
            }
        });
        
        // 導航到頁面
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        console.log('✅ 頁面載入完成');
        
        // 等待頁面完全載入
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 查找事件卡片
        const eventCards = await page.$$('.event-card');
        console.log(`📅 找到 ${eventCards.length} 個事件卡片`);
        
        if (eventCards.length === 0) {
            console.log('❌ 沒有找到事件卡片，無法測試');
            return;
        }
        
        const firstCard = eventCards[0];
        
        // 測試1：短按（0.3秒）- 應該不觸發充電動畫
        console.log('🔄 測試1：短按（0.3秒）- 應該不觸發充電動畫');
        
        await firstCard.hover();
        await page.mouse.down();
        
        // 等待0.3秒
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await page.mouse.up();
        
        // 等待動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試2：中按（0.8秒）- 應該觸發充電動畫但不開啟載入
        console.log('🔄 測試2：中按（0.8秒）- 應該觸發充電動畫但不開啟載入');
        
        await firstCard.hover();
        await page.mouse.down();
        
        // 等待0.8秒
        await new Promise(resolve => setTimeout(resolve, 800));
        
        await page.mouse.up();
        
        // 等待動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試3：長按（1.2秒）- 應該觸發充電動畫和預載入但不開啟載入
        console.log('🔄 測試3：長按（1.2秒）- 應該觸發充電動畫和預載入但不開啟載入');
        
        await firstCard.hover();
        await page.mouse.down();
        
        // 等待1.2秒
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        await page.mouse.up();
        
        // 等待動畫完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試4：完整長按（2秒）- 應該完整觸發所有階段
        console.log('🔄 測試4：完整長按（2秒）- 應該完整觸發所有階段');
        
        await firstCard.hover();
        await page.mouse.down();
        
        // 等待2秒
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await page.mouse.up();
        
        // 等待載入完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查模態框是否出現
        const modal = await page.$('.attendance-modal-content');
        if (modal) {
            console.log('✅ 簽到模態框已出現（完整長按觸發成功）');
            
            // 關閉模態框
            const closeBtn = await page.$('#closeAttendanceModal');
            if (closeBtn) {
                await closeBtn.click();
                console.log('✅ 關閉了模態框');
            }
        } else {
            console.log('❌ 簽到模態框未出現（完整長按未觸發）');
        }
        
        console.log('🎉 新時序測試完成！');
        console.log('📋 時序總結：');
        console.log('   - 0.5秒：開始集氣充能動畫');
        console.log('   - 1.0秒：開始後端預載入');
        console.log('   - 1.5秒：跳出載入動畫');
        
        // 等待一下讓用戶看到結果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 運行測試
testSimpleTiming().catch(console.error);
