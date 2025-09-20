const axios = require('axios');

// 測試 Rich Menu 關鍵字功能
async function testRichMenuKeywords() {
    const baseUrl = 'https://liff-sttendence-0908-production.up.railway.app';
    
    console.log('🧪 開始測試 Rich Menu 關鍵字功能...\n');
    
    // 測試內部人員綁定
    console.log('1️⃣ 測試內部人員綁定 API...');
    try {
        const response = await axios.post(`${baseUrl}/api/test-richmenu`, {
            userId: 'U0291ce9023f7911a99cf79a54be90de8'
        });
        console.log('✅ 內部人員綁定測試結果:', response.data);
    } catch (error) {
        console.log('❌ 內部人員綁定測試失敗:', error.response?.data || error.message);
    }
    
    console.log('\n2️⃣ 測試解綁 API...');
    try {
        const response = await axios.post(`${baseUrl}/api/test-unbind-richmenu`, {
            userId: 'U0291ce9023f7911a99cf79a54be90de8'
        });
        console.log('✅ 解綁測試結果:', response.data);
    } catch (error) {
        console.log('❌ 解綁測試失敗:', error.response?.data || error.message);
    }
    
    console.log('\n3️⃣ 測試 LINE 訊息發送...');
    try {
        const response = await axios.post(`${baseUrl}/api/test-message`, {
            userId: 'U0291ce9023f7911a99cf79a54be90de8',
            message: '🧪 Rich Menu 關鍵字功能測試\n\n✅ 系統已成功實現以下功能：\n• #內部人員 - 綁定內部人員 Rich Menu\n• #解綁 - 解除 Rich Menu 綁定\n• #測試 - 測試模式（解綁5分鐘後自動重新綁定）\n\n🎉 所有功能已準備就緒！'
        });
        console.log('✅ 訊息發送測試結果:', response.data);
    } catch (error) {
        console.log('❌ 訊息發送測試失敗:', error.response?.data || error.message);
    }
    
    console.log('\n📋 關鍵字功能說明：');
    console.log('• 發送「#內部人員」→ 綁定內部人員 Rich Menu');
    console.log('• 發送「#解綁」→ 解除 Rich Menu 綁定');
    console.log('• 發送「#測試」→ 測試模式（解綁5分鐘後自動重新綁定）');
    console.log('\n🎯 請在 LINE 中測試這些關鍵字！');
}

// 執行測試
testRichMenuKeywords().catch(console.error);
