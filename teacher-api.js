const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// 初始化SQLite資料庫
const db = new sqlite3.Database('./teacher_cache.db');

// 創建講師快取表
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        display_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS teacher_matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        teacher_name TEXT,
        confidence REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_name) REFERENCES teachers (name)
    )`);
});

// Google Apps Script API 配置
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfj5fwNIc8ncbqkOm763yo6o06wYPHm2nbfd_1yLkHlakoS9FtYfYJhvGCaiAYh_vjIQ/exec';

// 快取設定
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小時
let teacherCache = {
    data: null,
    timestamp: 0
};

// 中間件
app.use(express.json());
app.use(express.static('public'));

// 從Google Apps Script獲取講師列表
async function fetchTeachersFromGoogle() {
    try {
        console.log('正在從Google Apps Script獲取講師列表...');
        
        const response = await axios.post(GOOGLE_SCRIPT_URL, {
            action: 'getTeacherList'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'NID=525=nsWVvbAon67C2qpyiEHQA3SUio_GqBd7RqUFU6BwB97_4LHggZxLpDgSheJ7WN4w3Z4dCQBiFPG9YKAqZgAokFYCuuQw04dkm-FX9-XHAIBIqJf1645n3RZrg86GcUVJOf3gN-5eTHXFIaovTmgRC6cXllv82SnQuKsGMq7CHH60XDSwyC99s9P2gmyXLppI'
            },
            timeout: 10000
        });

        if (response.data && response.data.teachers) {
            console.log(`成功獲取 ${response.data.teachers.length} 個講師`);
            return response.data.teachers;
        } else {
            throw new Error('無效的回應格式');
        }
    } catch (error) {
        console.error('從Google Apps Script獲取講師列表失敗:', error.message);
        throw error;
    }
}

// 從資料庫獲取講師列表
function getTeachersFromDB() {
    return new Promise((resolve, reject) => {
        db.all('SELECT name, display_name FROM teachers ORDER BY name', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => ({
                    name: row.name,
                    display_name: row.display_name || row.name
                })));
            }
        });
    });
}

// 更新資料庫中的講師列表
function updateTeachersInDB(teachers) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('DELETE FROM teachers', (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                const stmt = db.prepare('INSERT INTO teachers (name, display_name) VALUES (?, ?)');
                teachers.forEach(teacher => {
                    stmt.run(teacher.name, teacher.display_name || teacher.name);
                });
                stmt.finalize((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
}

// 獲取講師列表（帶快取）
async function getTeachers() {
    const now = Date.now();
    
    // 檢查快取是否有效
    if (teacherCache.data && (now - teacherCache.timestamp) < CACHE_DURATION) {
        console.log('使用快取的講師列表');
        return teacherCache.data;
    }

    try {
        // 嘗試從Google Apps Script獲取最新資料
        const teachers = await fetchTeachersFromGoogle();
        teacherCache.data = teachers;
        teacherCache.timestamp = now;
        
        // 更新資料庫
        await updateTeachersInDB(teachers);
        
        return teachers;
    } catch (error) {
        console.log('從Google獲取失敗，嘗試從資料庫獲取...');
        
        try {
            const teachers = await getTeachersFromDB();
            if (teachers.length > 0) {
                teacherCache.data = teachers;
                teacherCache.timestamp = now;
                return teachers;
            }
        } catch (dbError) {
            console.error('從資料庫獲取講師列表失敗:', dbError);
        }
        
        throw new Error('無法獲取講師列表');
    }
}

// 模糊匹配講師名稱
function findBestMatch(query, teachers) {
    if (!query || !teachers.length) return null;
    
    const queryLower = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;
    
    for (const teacher of teachers) {
        const teacherName = teacher.display_name || teacher.name;
        const teacherLower = teacherName.toLowerCase();
        
        // 完全匹配
        if (teacherLower === queryLower) {
            return teacher;
        }
        
        // 包含匹配
        if (teacherLower.includes(queryLower) || queryLower.includes(teacherLower)) {
            const score = Math.min(teacherLower.length, queryLower.length) / Math.max(teacherLower.length, queryLower.length);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = teacher;
            }
        }
        
        // 字符相似度
        const similarity = calculateSimilarity(queryLower, teacherLower);
        if (similarity > bestScore && similarity > 0.6) {
            bestScore = similarity;
            bestMatch = teacher;
        }
    }
    
    return bestMatch;
}

// 計算字符串相似度
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

// Levenshtein距離
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// 保存講師匹配記錄
function saveTeacherMatch(userId, teacherName, confidence) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO teacher_matches (user_id, teacher_name, confidence) VALUES (?, ?, ?)',
            [userId, teacherName, confidence],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

// 獲取講師匹配歷史
function getTeacherMatchHistory(userId) {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT teacher_name, confidence, created_at FROM teacher_matches WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
            [userId],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
}

// API 路由

// 獲取講師列表
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await getTeachers();
        res.json({
            success: true,
            teachers: teachers,
            cached: (Date.now() - teacherCache.timestamp) < CACHE_DURATION
        });
    } catch (error) {
        console.error('獲取講師列表失敗:', error);
        res.status(500).json({
            success: false,
            error: '無法獲取講師列表'
        });
    }
});

// 匹配講師
app.post('/api/match-teacher', async (req, res) => {
    try {
        const { userId, displayName } = req.body;
        
        if (!userId || !displayName) {
            return res.status(400).json({
                success: false,
                error: '缺少必要參數'
            });
        }

        const teachers = await getTeachers();
        const match = findBestMatch(displayName, teachers);
        
        if (match) {
            const confidence = calculateSimilarity(displayName.toLowerCase(), (match.display_name || match.name).toLowerCase());
            
            // 保存匹配記錄
            try {
                await saveTeacherMatch(userId, match.name, confidence);
            } catch (error) {
                console.error('保存匹配記錄失敗:', error);
            }
            
            res.json({
                success: true,
                match: {
                    name: match.name,
                    display_name: match.display_name || match.name,
                    confidence: confidence
                }
            });
        } else {
            res.json({
                success: true,
                match: null,
                message: '未找到匹配的講師'
            });
        }
    } catch (error) {
        console.error('匹配講師失敗:', error);
        res.status(500).json({
            success: false,
            error: '匹配講師失敗'
        });
    }
});

// 獲取匹配歷史
app.get('/api/match-history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await getTeacherMatchHistory(userId);
        
        res.json({
            success: true,
            history: history
        });
    } catch (error) {
        console.error('獲取匹配歷史失敗:', error);
        res.status(500).json({
            success: false,
            error: '獲取匹配歷史失敗'
        });
    }
});

// 強制刷新講師列表
app.post('/api/refresh-teachers', async (req, res) => {
    try {
        // 清除快取
        teacherCache.data = null;
        teacherCache.timestamp = 0;
        
        // 重新獲取
        const teachers = await getTeachers();
        
        res.json({
            success: true,
            teachers: teachers,
            message: '講師列表已刷新'
        });
    } catch (error) {
        console.error('刷新講師列表失敗:', error);
        res.status(500).json({
            success: false,
            error: '刷新講師列表失敗'
        });
    }
});

// 健康檢查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache_age: Date.now() - teacherCache.timestamp
    });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`講師API服務器運行在 http://localhost:${PORT}`);
    console.log(`API端點: http://localhost:${PORT}/api/teachers`);
    console.log(`匹配端點: http://localhost:${PORT}/api/match-teacher`);
});

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n正在關閉服務器...');
    db.close((err) => {
        if (err) {
            console.error('關閉資料庫時出錯:', err);
        } else {
            console.log('資料庫連接已關閉');
        }
        process.exit(0);
    });
});

module.exports = app;
