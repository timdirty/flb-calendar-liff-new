const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const CalDAVClient = require('./caldav-client');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://static.line-scdn.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://script.google.com", "https://api.line.me", "https://api.line.biz"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
        }
    }
}));
app.use(compression());
app.use(cors());
app.use(express.json());
// 提供靜態文件
app.use(express.static('public'));
app.use(express.static('.')); // 提供根目錄的靜態文件

// 提供LIFF應用
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'liff-calendar.html'));
});

// 直接提供LIFF應用文件
app.get('/liff-calendar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'liff-calendar.html'));
});

// 獲取LIFF配置
app.get('/api/liff-config', (req, res) => {
    res.json({
        success: true,
        liffId: process.env.LIFF_ID || '2000000000-XXXXXXXX',
        googleScriptUrl: process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxfj5fwNIc8ncbqkOm763yo6o06wYPHm2nbfd_1yLkHlakoS9FtYfYJhvGCaiAYh_vjIQ/exec'
    });
});

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
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxfj5fwNIc8ncbqkOm763yo6o06wYPHm2nbfd_1yLkHlakoS9FtYfYJhvGCaiAYh_vjIQ/exec';

// 快取設定
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小時
let teacherCache = {
    data: null,
    timestamp: 0
};

// 從Google Apps Script獲取講師列表
async function fetchTeachersFromGoogle() {
    try {
        console.log('正在從Google Apps Script獲取講師列表...');
        
        const response = await axios.post(GOOGLE_SCRIPT_URL, {
            action: 'getTeacherList'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': process.env.GOOGLE_SCRIPT_COOKIE || 'NID=525=nsWVvbAon67C2qpyiEHQA3SUio_GqBd7RqUFU6BwB97_4LHggZxLpDgSheJ7WN4w3Z4dCQBiFPG9YKAqZgAokFYCuuQw04dkm-FX9-XHAIBIqJf1645n3RZrg86GcUVJOf3gN-5eTHXFIaovTmgRC6cXllv82SnQuKsGMq7CHH60XDSwyC99s9P2gmyXLppI'
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

// CalDAV 配置
const CALDAV_CONFIG = {
    baseUrl: process.env.CALDAV_URL || 'https://funlearnbar.synology.me:9102/caldav.php/',
    username: process.env.CALDAV_USERNAME || 'testacount',
    password: process.env.CALDAV_PASSWORD || 'testpassword'
};

// 初始化 CalDAV 客戶端
let caldavClient = null;
if (CALDAV_CONFIG.baseUrl && CALDAV_CONFIG.username && CALDAV_CONFIG.password) {
    caldavClient = new CalDAVClient(CALDAV_CONFIG.baseUrl, CALDAV_CONFIG.username, CALDAV_CONFIG.password);
    console.log('CalDAV 客戶端已初始化');
} else {
    console.log('CalDAV 配置不完整，使用模擬數據');
}

// 模擬行事曆事件數據（當CalDAV不可用時使用）
let mockEvents = [
    {
        id: 1,
        title: "ESM程式設計基礎",
        instructor: "張老師",
        start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        type: "esm",
        description: "學習基本的程式設計概念和邏輯思維",
        lessonUrl: "https://example.com/lesson/1"
    },
    {
        id: 2,
        title: "SPM進階課程",
        instructor: "李老師",
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        type: "spm",
        description: "深入學習系統程式設計",
        lessonUrl: "https://example.com/lesson/2"
    }
];

// API 路由

// 主頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

// 獲取行事曆事件
app.get('/api/events', async (req, res) => {
    try {
        if (caldavClient) {
            console.log('嘗試從CalDAV獲取事件...');
            try {
                // 獲取所有講師的行事曆
                const calendars = await caldavClient.getCalendars();
                console.log('找到行事曆:', calendars.length);
                
                let allEvents = [];
                for (const calendar of calendars) {
                    try {
                        const events = await caldavClient.getEvents(calendar.path);
                        console.log(`行事曆 ${calendar.displayName} 有 ${events.length} 個事件`);
                        allEvents = allEvents.concat(events);
                    } catch (error) {
                        console.error(`獲取行事曆 ${calendar.displayName} 事件失敗:`, error.message);
                    }
                }
                
                console.log(`總共獲取到 ${allEvents.length} 個事件`);
                res.json(allEvents);
                return;
            } catch (caldavError) {
                console.error('CalDAV連接失敗，使用模擬數據:', caldavError.message);
            }
        }
        
        // 如果CalDAV不可用，使用模擬數據
        console.log('使用模擬事件數據');
        res.json(mockEvents);
    } catch (error) {
        console.error('獲取行事曆事件失敗:', error);
        res.status(500).json({
            success: false,
            error: '無法獲取行事曆事件'
        });
    }
});

// 健康檢查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache_age: Date.now() - teacherCache.timestamp,
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404處理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: '找不到請求的資源'
    });
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
    console.error('服務器錯誤:', error);
    res.status(500).json({
        success: false,
        error: '內部服務器錯誤'
    });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`🚀 FLB講師行事曆LIFF應用運行在端口 ${PORT}`);
    console.log(`🌐 主頁面: http://localhost:${PORT}`);
    console.log(`🔧 API端點: http://localhost:${PORT}/api/teachers`);
    console.log(`📊 健康檢查: http://localhost:${PORT}/api/health`);
    console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
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

process.on('SIGTERM', () => {
    console.log('\n收到SIGTERM信號，正在關閉服務器...');
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
