// 測試標題解析功能
const testTitles = [
    "SPIKE 三 18:30-20:30 第1週",
    "ESM SPM二 14:30-15:30 第1週", 
    "SPM 二 16:30-17:30 到府 第3週",
    "BOOST 六 12:30-14:00 第2週",
    "EV3 四 10:00-11:00 第1週"
];

console.log('=== 標題解析測試 ===\n');

// 從標題解析時間
function parseTimeFromTitle(title) {
    // 匹配格式如 "18:30-20:30", "14:30-15:30", "16:30-17:30" 等
    const timeMatch = title.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
    if (timeMatch) {
        return {
            startTime: timeMatch[1],
            endTime: timeMatch[2],
            timeString: `${timeMatch[1]} - ${timeMatch[2]}`
        };
    }
    return null;
}

// 從標題解析日期（根據星期幾）
function parseDateFromTitle(title, baseDate = new Date()) {
    const dayMap = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0
    };
    
    // 匹配格式如 "SPIKE 三 18:30-20:30", "ESM SPM二 14:30-15:30" 等
    const dayMatch = title.match(/([一二三四五六日])/);
    if (dayMatch) {
        const targetDay = dayMap[dayMatch[1]];
        const currentDay = baseDate.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        
        const targetDate = new Date(baseDate);
        targetDate.setDate(baseDate.getDate() + daysUntilTarget);
        
        return targetDate;
    }
    return baseDate;
}

testTitles.forEach((title, index) => {
    console.log(`測試 ${index + 1}: ${title}`);
    
    const timeResult = parseTimeFromTitle(title);
    const dateResult = parseDateFromTitle(title);
    
    if (timeResult) {
        console.log(`  ✅ 解析時間: ${timeResult.timeString}`);
    } else {
        console.log(`  ❌ 無法解析時間`);
    }
    
    console.log(`  📅 解析日期: ${dateResult.toLocaleDateString('zh-TW')}`);
    console.log(`  📅 星期: ${['日', '一', '二', '三', '四', '五', '六'][dateResult.getDay()]}`);
    console.log('');
});

// 測試今天的日期
console.log('=== 今天日期參考 ===');
const today = new Date();
console.log(`今天: ${today.toLocaleDateString('zh-TW')} (星期${['日', '一', '二', '三', '四', '五', '六'][today.getDay()]})`);
console.log('');

// 測試特定日期的解析
console.log('=== 特定日期解析測試 ===');
const testDate = new Date('2025-09-16'); // 假設今天是週二
console.log(`基準日期: ${testDate.toLocaleDateString('zh-TW')} (星期${['日', '一', '二', '三', '四', '五', '六'][testDate.getDay()]})`);

testTitles.forEach((title, index) => {
    const dateResult = parseDateFromTitle(title, testDate);
    console.log(`${title} -> ${dateResult.toLocaleDateString('zh-TW')} (星期${['日', '一', '二', '三', '四', '五', '六'][dateResult.getDay()]})`);
});
