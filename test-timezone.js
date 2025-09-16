// 測試時區轉換問題
const testEvents = [
    {
        title: "SPIKE 三 18:30-20:30 第1週",
        start: "2025-09-17T10:30:00.000Z",
        end: "2025-09-17T12:30:00.000Z"
    },
    {
        title: "ESM SPM二 14:30-15:30 第1週", 
        start: "2025-09-16T06:30:00.000Z",
        end: "2025-09-16T07:30:00.000Z"
    },
    {
        title: "SPM 二 16:30-17:30 到府 第3週",
        start: "2025-09-17T08:30:00.000Z", 
        end: "2025-09-17T09:30:00.000Z"
    }
];

console.log('=== 時區轉換測試 ===\n');

testEvents.forEach((event, index) => {
    console.log(`事件 ${index + 1}: ${event.title}`);
    console.log(`原始 UTC 時間: ${event.start} - ${event.end}`);
    
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    console.log(`JavaScript Date 對象:`);
    console.log(`  startDate: ${startDate}`);
    console.log(`  endDate: ${endDate}`);
    
    console.log(`本地時區轉換:`);
    console.log(`  日期: ${startDate.toLocaleDateString('zh-TW')}`);
    console.log(`  時間: ${startDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`);
    
    console.log(`UTC 時間組件:`);
    console.log(`  UTC 年: ${startDate.getUTCFullYear()}, 月: ${startDate.getUTCMonth() + 1}, 日: ${startDate.getUTCDate()}`);
    console.log(`  UTC 時: ${startDate.getUTCHours()}, 分: ${startDate.getUTCMinutes()}`);
    
    console.log(`本地時間組件:`);
    console.log(`  本地 年: ${startDate.getFullYear()}, 月: ${startDate.getMonth() + 1}, 日: ${startDate.getDate()}`);
    console.log(`  本地 時: ${startDate.getHours()}, 分: ${startDate.getMinutes()}`);
    
    console.log(`時區偏移: ${startDate.getTimezoneOffset()} 分鐘 (${startDate.getTimezoneOffset() / 60} 小時)`);
    console.log('---\n');
});

// 測試不同的時區處理方式
console.log('=== 不同時區處理方式測試 ===\n');

const testEvent = testEvents[0];
const startDate = new Date(testEvent.start);

console.log(`測試事件: ${testEvent.title}`);
console.log(`原始 UTC: ${testEvent.start}`);

// 方式1: 直接使用 toLocaleDateString
console.log(`\n方式1 - 直接使用 toLocaleDateString:`);
console.log(`  日期: ${startDate.toLocaleDateString('zh-TW')}`);
console.log(`  時間: ${startDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`);

// 方式2: 手動構建本地日期
console.log(`\n方式2 - 手動構建本地日期:`);
const localDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
const localTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
console.log(`  日期: ${localDate.toLocaleDateString('zh-TW')}`);
console.log(`  時間: ${localTime}`);

// 方式3: 使用 Intl.DateTimeFormat
console.log(`\n方式3 - 使用 Intl.DateTimeFormat:`);
const formatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
});
const formatted = formatter.format(startDate);
console.log(`  格式化結果: ${formatted}`);

// 方式4: 強制使用台灣時區
console.log(`\n方式4 - 強制使用台灣時區:`);
const taiwanDate = new Date(startDate.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
console.log(`  日期: ${taiwanDate.toLocaleDateString('zh-TW')}`);
console.log(`  時間: ${taiwanDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`);
