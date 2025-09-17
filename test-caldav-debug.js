// 調試 CalDAV 客戶端日期處理
const CalDAVClient = require('./caldav-client.js');

// 創建測試客戶端
const client = new CalDAVClient('https://test.com', 'test', 'test');

// 模擬 iCal 數據
const mockICalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test@example.com
DTSTART:20250917T183000
DTEND:20250917T203000
SUMMARY:SPIKE SPIKE 三 18:30-20:30 第1週
LOCATION:站前教室
DESCRIPTION:測試事件
END:VEVENT
END:VCALENDAR`;

console.log('=== CalDAV 客戶端調試 ===');
console.log('模擬 iCal 數據:');
console.log(mockICalData);

try {
    const events = client.parseICalData(mockICalData);
    console.log('\n解析結果:');
    console.log('事件數量:', events.length);
    
    if (events.length > 0) {
        const event = events[0];
        console.log('事件標題:', event.title);
        console.log('開始時間 (ISO):', event.start);
        console.log('結束時間 (ISO):', event.end);
        console.log('地址:', event.location);
        
        // 測試日期顯示
        const startDate = new Date(event.start);
        console.log('開始日期 (本地):', startDate.toLocaleDateString('zh-TW'));
        console.log('開始時間 (本地):', startDate.toLocaleTimeString('zh-TW'));
        console.log('星期幾:', ['日', '一', '二', '三', '四', '五', '六'][startDate.getDay()]);
        
        // 檢查是否與標題中的「三」匹配
        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][startDate.getDay()];
        const titleDay = event.title.match(/[一二三四五六日]/);
        if (titleDay) {
            console.log('標題中的星期:', titleDay[0]);
            console.log('日期匹配:', dayOfWeek === titleDay[0] ? '✅ 正確' : '❌ 錯誤');
        }
        
        // 檢查地址處理
        console.log('地址處理:', event.location === '台北市中正區開封街1段2號9樓' ? '✅ 正確' : '❌ 錯誤');
    }
} catch (error) {
    console.error('解析錯誤:', error.message);
    console.error('錯誤堆疊:', error.stack);
}
