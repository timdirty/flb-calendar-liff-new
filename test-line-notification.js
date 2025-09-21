const axios = require('axios');

async function testLineNotification() {
    console.log('🚀 開始測試LINE通知功能...');
    
    const LINE_CHANNEL_ACCESS_TOKEN = 'LaeRrV+/XZ6oCJ2ZFzAFlZXHX822l50NxxM2x6vBkuoux4ptr6KjFJcIXL6pNJel2dKbZ7nxachvxvKrKaMNchMqGTywUl4KMGXhxd/bdiDM7M6Ad8OiXF+VzfhlSMXfu1MbDfxdwe0z/NLYHzadyQdB04t89/1O/w1cDnyilFU=';
    const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';
    
    // 測試訊息
    const testMessage = `📚 學生簽到通知測試

👨‍🏫 講師：Ted
📖 課程：SPM
📅 日期：${new Date().toLocaleDateString('zh-TW')}

✅ 出席 (1人)：
Essie

⏳ 未選擇 (1人)：
Luna

⏰ 簽到時間：${new Date().toLocaleString('zh-TW')}`;

    try {
        console.log('📤 發送測試通知...');
        console.log('📝 通知內容:');
        console.log(testMessage);
        
        // 注意：這裡需要Tim的實際LINE用戶ID
        // 暫時使用一個測試ID，實際使用時需要替換
        const response = await axios.post(LINE_MESSAGING_API, {
            to: 'U1234567890abcdef1234567890abcdef1', // 這裡需要替換為Tim的實際LINE用戶ID
            messages: [{
                type: 'text',
                text: testMessage
            }]
        }, {
            headers: {
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ LINE通知發送成功！');
        console.log('📥 回應:', response.data);
        
    } catch (error) {
        console.error('❌ LINE通知發送失敗:');
        if (error.response) {
            console.error('狀態碼:', error.response.status);
            console.error('錯誤訊息:', error.response.data);
        } else {
            console.error('錯誤:', error.message);
        }
    }
}

// 執行測試
testLineNotification().catch(console.error);
