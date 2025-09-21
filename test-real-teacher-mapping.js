const axios = require('axios');

async function testRealTeacherMapping() {
    console.log('🚀 開始測試真實講師user ID映射功能...');
    
    const baseUrl = 'http://localhost:3000';
    
    try {
        // 測試獲取所有講師與user ID的對應關係
        console.log('\n📋 測試獲取所有講師與user ID的對應關係...');
        const mappingResponse = await axios.get(`${baseUrl}/api/teacher-user-mapping`);
        console.log('✅ 所有講師映射:', JSON.stringify(mappingResponse.data, null, 2));
        
        // 測試根據講師名稱獲取user ID
        console.log('\n🔍 測試根據講師名稱獲取user ID...');
        const testTeachers = ['Tim', 'Ted', 'Yoki 🙏🏻', 'Agnes', 'Hansen'];
        
        for (const teacherName of testTeachers) {
            try {
                const teacherResponse = await axios.get(`${baseUrl}/api/teacher-user-id/${encodeURIComponent(teacherName)}`);
                console.log(`📝 講師 "${teacherName}":`, JSON.stringify(teacherResponse.data, null, 2));
            } catch (error) {
                console.log(`❌ 講師 "${teacherName}" 查詢失敗:`, error.response?.data || error.message);
            }
        }
        
        // 測試學生簽到通知
        console.log('\n🔔 測試學生簽到通知...');
        const testNotificationData = {
            message: `📚 學生簽到通知測試\n\n👨‍🏫 講師：Ted\n📖 課程：SPM\n📅 日期：${new Date().toLocaleDateString('zh-TW')}\n\n✅ 出席 (1人)：\n測試學生\n\n⏰ 簽到時間：${new Date().toLocaleString('zh-TW')}`,
            teacherName: 'Ted',
            courseName: 'SPM',
            presentStudents: ['測試學生'],
            absentStudents: [],
            unmarkedStudents: []
        };
        
        const notificationResponse = await axios.post(`${baseUrl}/api/student-attendance-notification`, testNotificationData);
        console.log('📤 通知發送結果:', JSON.stringify(notificationResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.response?.data || error.message);
    }
}

// 執行測試
testRealTeacherMapping().catch(console.error);
