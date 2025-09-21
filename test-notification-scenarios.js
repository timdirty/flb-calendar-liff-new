const axios = require('axios');

async function testNotificationScenarios() {
    console.log('🚀 開始測試各種通知場景...');
    
    const baseUrl = 'http://localhost:3000';
    
    const testScenarios = [
        {
            name: '單一學生出席',
            data: {
                message: `📚 學生簽到通知\n\n👨‍🏫 講師：Ted\n📖 課程：SPM\n📅 日期：${new Date().toLocaleDateString('zh-TW')}\n\n✅ 出席 (1人)：\n陳小明\n\n⏰ 簽到時間：${new Date().toLocaleString('zh-TW')}`,
                teacherName: 'Ted',
                courseName: 'SPM',
                presentStudents: ['陳小明'],
                absentStudents: [],
                unmarkedStudents: []
            }
        },
        {
            name: '多學生混合狀態',
            data: {
                message: `📚 學生簽到通知\n\n👨‍🏫 講師：Agnes\n📖 課程：ESM\n📅 日期：${new Date().toLocaleDateString('zh-TW')}\n\n✅ 出席 (2人)：\n李小華、王大雄\n\n❌ 缺席 (1人)：\n張小美\n\n⏳ 未選擇 (1人)：\n劉小強\n\n⏰ 簽到時間：${new Date().toLocaleString('zh-TW')}`,
                teacherName: 'Agnes',
                courseName: 'ESM',
                presentStudents: ['李小華', '王大雄'],
                absentStudents: ['張小美'],
                unmarkedStudents: ['劉小強']
            }
        },
        {
            name: '全部學生缺席',
            data: {
                message: `📚 學生簽到通知\n\n👨‍🏫 講師：Hansen\n📖 課程：BOOST\n📅 日期：${new Date().toLocaleDateString('zh-TW')}\n\n❌ 缺席 (3人)：\n學生A、學生B、學生C\n\n⏰ 簽到時間：${new Date().toLocaleString('zh-TW')}`,
                teacherName: 'Hansen',
                courseName: 'BOOST',
                presentStudents: [],
                absentStudents: ['學生A', '學生B', '學生C'],
                unmarkedStudents: []
            }
        },
        {
            name: '特殊字符講師名稱',
            data: {
                message: `📚 學生簽到通知\n\n👨‍🏫 講師：Yoki 🙏🏻\n📖 課程：SPIKE\n📅 日期：${new Date().toLocaleDateString('zh-TW')}\n\n✅ 出席 (1人)：\n測試學生\n\n⏰ 簽到時間：${new Date().toLocaleString('zh-TW')}`,
                teacherName: 'Yoki 🙏🏻',
                courseName: 'SPIKE',
                presentStudents: ['測試學生'],
                absentStudents: [],
                unmarkedStudents: []
            }
        },
        {
            name: '未知講師',
            data: {
                message: `📚 學生簽到通知\n\n👨‍🏫 講師：UnknownTeacher\n📖 課程：TEST\n📅 日期：${new Date().toLocaleDateString('zh-TW')}\n\n✅ 出席 (1人)：\n測試學生\n\n⏰ 簽到時間：${new Date().toLocaleString('zh-TW')}`,
                teacherName: 'UnknownTeacher',
                courseName: 'TEST',
                presentStudents: ['測試學生'],
                absentStudents: [],
                unmarkedStudents: []
            }
        }
    ];
    
    for (let i = 0; i < testScenarios.length; i++) {
        const scenario = testScenarios[i];
        console.log(`\n📋 測試場景 ${i + 1}: ${scenario.name}`);
        console.log('='.repeat(50));
        
        try {
            const response = await axios.post(`${baseUrl}/api/student-attendance-notification`, scenario.data);
            console.log('✅ 通知發送成功:');
            console.log(JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ 通知發送失敗:');
            console.log(error.response?.data || error.message);
        }
        
        // 等待一秒再發送下一個通知
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎯 測試完成！');
}

// 執行測試
testNotificationScenarios().catch(console.error);
