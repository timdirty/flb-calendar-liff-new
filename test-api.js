// 使用內建的 fetch

async function testAPIs() {
    const baseUrl = 'http://localhost:8080';
    
    console.log('🧪 開始測試本地API...\n');
    
    // 測試1: 獲取學生名單
    console.log('📋 測試1: 獲取學生名單');
    try {
        const response = await fetch(`${baseUrl}/api/proxy/google-sheets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getRosterAttendance',
                course: 'SPIKE',
                period: '六 1600-1800'
            })
        });
        
        const data = await response.json();
        console.log('✅ 獲取學生名單成功:', data.success ? '是' : '否');
        if (data.success) {
            console.log(`   學生數量: ${data.count}`);
            console.log(`   學生列表: ${data.students.map(s => s.name).join(', ')}`);
        } else {
            console.log('   錯誤:', data.error);
        }
    } catch (error) {
        console.log('❌ 獲取學生名單失敗:', error.message);
    }
    
    console.log('\n');
    
    // 測試2: 學生簽到
    console.log('📝 測試2: 學生簽到');
    try {
        const response = await fetch(`${baseUrl}/api/proxy/google-sheets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update',
                name: '測試學生',
                date: '2025-01-20',
                present: true,
                course: 'SPIKE',
                period: '六 1600-1800'
            })
        });
        
        const data = await response.json();
        console.log('✅ 學生簽到成功:', data.success ? '是' : '否');
        if (data.success) {
            console.log('   回應:', data);
        } else {
            console.log('   錯誤:', data.error);
        }
    } catch (error) {
        console.log('❌ 學生簽到失敗:', error.message);
    }
    
    console.log('\n');
    
    // 測試3: 查詢出缺勤
    console.log('🔍 測試3: 查詢出缺勤');
    try {
        const response = await fetch(`${baseUrl}/api/proxy/google-sheets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'query',
                name: '測試學生'
            })
        });
        
        const data = await response.json();
        console.log('✅ 查詢出缺勤成功:', data.success ? '是' : '否');
        if (data.success) {
            console.log('   回應:', data);
        } else {
            console.log('   錯誤:', data.error);
        }
    } catch (error) {
        console.log('❌ 查詢出缺勤失敗:', error.message);
    }
    
    console.log('\n🎉 API測試完成！');
}

testAPIs().catch(console.error);
