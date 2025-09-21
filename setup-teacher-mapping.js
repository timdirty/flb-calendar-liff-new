const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 連接資料庫
const db = new sqlite3.Database('./teacher_cache.db');

// 測試講師與user ID的映射資料
const testMappings = [
    { userId: 'U1234567890abcdef1234567890abcdef1', teacherName: 'Ted', confidence: 0.95 },
    { userId: 'U2345678901bcdef1234567890abcdef12', teacherName: 'Tim', confidence: 0.98 },
    { userId: 'U3456789012cdef1234567890abcdef123', teacherName: 'Yoki', confidence: 0.92 },
    { userId: 'U4567890123def1234567890abcdef1234', teacherName: 'Agnes', confidence: 0.90 },
    { userId: 'U5678901234ef1234567890abcdef12345', teacherName: 'Hansen', confidence: 0.88 },
    { userId: 'U6789012345f1234567890abcdef123456', teacherName: 'James', confidence: 0.85 },
    { userId: 'U78901234561234567890abcdef1234567', teacherName: 'Ivan', confidence: 0.87 },
    { userId: 'U8901234567234567890abcdef12345678', teacherName: 'Xian', confidence: 0.89 },
    { userId: 'U901234567834567890abcdef123456789', teacherName: 'Eason', confidence: 0.91 },
    { userId: 'U01234567894567890abcdef1234567890', teacherName: 'Bella', confidence: 0.93 }
];

async function setupTeacherMapping() {
    console.log('🚀 開始設定講師與user ID的映射關係...');
    
    try {
        // 清空現有的映射記錄
        console.log('🗑️ 清空現有的映射記錄...');
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM teacher_matches', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // 插入測試映射資料
        console.log('📝 插入測試映射資料...');
        for (const mapping of testMappings) {
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO teacher_matches (user_id, teacher_name, confidence) VALUES (?, ?, ?)',
                    [mapping.userId, mapping.teacherName, mapping.confidence],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
            console.log(`✅ 已添加: ${mapping.teacherName} -> ${mapping.userId} (信心度: ${mapping.confidence})`);
        }
        
        // 驗證插入結果
        console.log('\n🔍 驗證插入結果...');
        const rows = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM teacher_matches ORDER BY teacher_name', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log('📊 資料庫中的映射記錄:');
        rows.forEach(row => {
            console.log(`  ${row.teacher_name} -> ${row.user_id} (信心度: ${row.confidence})`);
        });
        
        console.log('\n✅ 講師映射設定完成！');
        
    } catch (error) {
        console.error('❌ 設定過程中發生錯誤:', error);
    } finally {
        db.close();
    }
}

// 執行設定
setupTeacherMapping().catch(console.error);
