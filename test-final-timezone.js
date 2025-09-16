// 最終時區測試 - 模擬完整的前端處理流程
const testEvent = {
    title: "SPIKE 三 18:30-20:30 第1週",
    start: "2025-09-17T10:30:00.000Z",
    end: "2025-09-17T12:30:00.000Z"
};

console.log('=== 最終時區測試 ===\n');
console.log(`事件標題: ${testEvent.title}`);
console.log(`API 資料: ${testEvent.start} - ${testEvent.end}\n`);

// 模擬前端的 createEventCard 函數
function createEventCard(event) {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    console.log('JavaScript Date 對象:');
    console.log(`  startDate: ${startDate}`);
    console.log(`  endDate: ${endDate}\n`);
    
    // 格式化日期 - 使用本地時區的日期
    const displayDate = startDate.toLocaleDateString('zh-TW');
    console.log(`displayDate: ${displayDate}`);
    
    // 格式化時間 - 使用本地時間
    const timeString = `${startDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`;
    console.log(`timeString: ${timeString}\n`);
    
    // 檢查是否與標題中的時間一致
    const titleTime = event.title.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
    if (titleTime) {
        const [, titleStart, titleEnd] = titleTime;
        console.log(`標題中的時間: ${titleStart} - ${titleEnd}`);
        
        // 比較時間
        const displayStart = startDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
        const displayEnd = endDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
        console.log(`顯示的時間: ${displayStart} - ${displayEnd}`);
        
        if (displayStart === titleStart && displayEnd === titleEnd) {
            console.log('✅ 時間顯示正確！');
        } else {
            console.log('❌ 時間顯示不正確！');
        }
    }
    
    return {
        displayDate,
        timeString
    };
}

const result = createEventCard(testEvent);
console.log('\n=== 最終結果 ===');
console.log(`顯示日期: ${result.displayDate}`);
console.log(`顯示時間: ${result.timeString}`);

// 測試其他事件
console.log('\n=== 測試其他事件 ===\n');

const otherEvents = [
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

otherEvents.forEach((event, index) => {
    console.log(`事件 ${index + 1}: ${event.title}`);
    const result = createEventCard(event);
    console.log(`結果: ${result.displayDate} ${result.timeString}\n`);
});
