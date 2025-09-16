// 測試前端時區處理邏輯
const testEvent = {
    title: "SPIKE 三 18:30-20:30 第1週",
    start: "2025-09-17T10:30:00.000Z",
    end: "2025-09-17T12:30:00.000Z"
};

console.log('=== 前端時區處理測試 ===\n');
console.log(`事件標題: ${testEvent.title}`);
console.log(`原始資料: ${testEvent.start} - ${testEvent.end}\n`);

// 模擬前端的 createEventCard 函數
function createEventCard(event) {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    console.log('JavaScript Date 對象:');
    console.log(`  startDate: ${startDate}`);
    console.log(`  endDate: ${endDate}`);
    console.log(`  startDate.toString(): ${startDate.toString()}`);
    console.log(`  endDate.toString(): ${endDate.toString()}\n`);
    
    // 格式化日期 - 使用本地時區的日期
    const displayDate = startDate.toLocaleDateString('zh-TW');
    console.log(`displayDate (toLocaleDateString): ${displayDate}`);
    
    // 格式化時間 - 使用本地時間
    const timeString = `${startDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`;
    console.log(`timeString (toLocaleTimeString): ${timeString}\n`);
    
    // 檢查各種時間組件
    console.log('時間組件檢查:');
    console.log(`  getFullYear(): ${startDate.getFullYear()}`);
    console.log(`  getMonth(): ${startDate.getMonth()}`);
    console.log(`  getDate(): ${startDate.getDate()}`);
    console.log(`  getHours(): ${startDate.getHours()}`);
    console.log(`  getMinutes(): ${startDate.getMinutes()}`);
    console.log(`  getSeconds(): ${startDate.getSeconds()}\n`);
    
    console.log('UTC 時間組件:');
    console.log(`  getUTCFullYear(): ${startDate.getUTCFullYear()}`);
    console.log(`  getUTCMonth(): ${startDate.getUTCMonth()}`);
    console.log(`  getUTCDate(): ${startDate.getUTCDate()}`);
    console.log(`  getUTCHours(): ${startDate.getUTCHours()}`);
    console.log(`  getUTCMinutes(): ${startDate.getUTCMinutes()}`);
    console.log(`  getUTCSeconds(): ${startDate.getUTCSeconds()}\n`);
    
    console.log('時區資訊:');
    console.log(`  getTimezoneOffset(): ${startDate.getTimezoneOffset()} 分鐘`);
    console.log(`  Intl.DateTimeFormat().resolvedOptions().timeZone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n`);
    
    return {
        displayDate,
        timeString
    };
}

const result = createEventCard(testEvent);
console.log('=== 最終結果 ===');
console.log(`顯示日期: ${result.displayDate}`);
console.log(`顯示時間: ${result.timeString}`);

// 測試不同的時間格式化方式
console.log('\n=== 不同時間格式化方式測試 ===');

const startDate = new Date(testEvent.start);
const endDate = new Date(testEvent.end);

console.log('方式1 - 使用 toLocaleTimeString (12小時制):');
console.log(`  ${startDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`);

console.log('\n方式2 - 使用 toLocaleTimeString (24小時制):');
console.log(`  ${startDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}`);

console.log('\n方式3 - 手動格式化 (24小時制):');
const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
console.log(`  ${startTime} - ${endTime}`);

console.log('\n方式4 - 使用 Intl.DateTimeFormat:');
const timeFormatter = new Intl.DateTimeFormat('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
});
console.log(`  ${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`);
