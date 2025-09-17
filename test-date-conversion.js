// 測試日期轉換邏輯
const ICAL = require('ical.js');

// 模擬 CalDAV 事件數據
const mockEventData = {
    start: "2025-09-17T18:30:00.000Z",
    title: "SPIKE SPIKE 三 18:30-20:30 第1週"
};

console.log('=== 日期轉換測試 ===');
console.log('原始 UTC 時間:', mockEventData.start);

// 方法1：直接解析 UTC 時間
const utcDate = new Date(mockEventData.start);
console.log('方法1 - 直接解析 UTC:', utcDate.toLocaleDateString('zh-TW'));
console.log('方法1 - 本地時間:', utcDate.toLocaleString('zh-TW'));

// 方法2：手動創建本地時間（模擬 CalDAV 解析）
const dateStr = mockEventData.start;
const year = parseInt(dateStr.substring(0, 4));
const month = parseInt(dateStr.substring(5, 7)) - 1; // 月份從0開始
const day = parseInt(dateStr.substring(8, 10));
const hour = parseInt(dateStr.substring(11, 13));
const minute = parseInt(dateStr.substring(14, 16));
const second = parseInt(dateStr.substring(17, 19));

console.log('解析的日期組件:', { year, month: month + 1, day, hour, minute, second });

const localDate = new Date(year, month, day, hour, minute, second);
console.log('方法2 - 手動創建本地時間:', localDate.toLocaleDateString('zh-TW'));
console.log('方法2 - 本地時間:', localDate.toLocaleString('zh-TW'));

// 方法3：使用 iCal.js 解析
try {
    const jcalData = ICAL.parse(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test@example.com
DTSTART:20250917T183000
DTEND:20250917T203000
SUMMARY:${mockEventData.title}
END:VEVENT
END:VCALENDAR`);

    const comp = new ICAL.Component(jcalData);
    const vevent = comp.getFirstSubcomponent('vevent');
    const event = new ICAL.Event(vevent);
    const startDate = event.startDate;
    
    console.log('方法3 - iCal.js 解析:');
    console.log('  年份:', startDate.year);
    console.log('  月份:', startDate.month);
    console.log('  日期:', startDate.day);
    console.log('  小時:', startDate.hour);
    console.log('  分鐘:', startDate.minute);
    console.log('  秒數:', startDate.second);
    console.log('  時區:', startDate.zone ? startDate.zone.tzid : '無時區資訊');
    
    // 測試不同的轉換方法
    if (startDate.zone && startDate.zone.tzid) {
        console.log('  有時區資訊，直接轉換:', startDate.toJSDate().toLocaleDateString('zh-TW'));
    } else {
        console.log('  無時區資訊，直接使用本地時間:', new Date(startDate.year, startDate.month - 1, startDate.day, startDate.hour, startDate.minute, startDate.second).toLocaleDateString('zh-TW'));
    }
    
} catch (error) {
    console.error('iCal.js 解析錯誤:', error.message);
}

console.log('\n=== 預期結果 ===');
console.log('標題顯示「三」（星期三），應該對應 2025/9/17');
