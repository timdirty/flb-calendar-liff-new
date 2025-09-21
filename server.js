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
            connectSrc: ["'self'", "https://script.google.com", "https://api.line.me", "https://api-data.line.me", "https://liffsdk.line-scdn.net"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
        }
    }
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

// LINE Messaging API 配置
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || 'LaeRrV+/XZ6oCJ2ZFzAFlZXHX822l50NxxM2x6vBkuoux4ptr6KjFJcIXL6pNJel2dKbZ7nxachvxvKrKaMNchMqGTywUl4KMGXhxd/bdiDM7M6Ad8OiXF+VzfhlSMXfu1MbDfxdwe0z/NLYHzadyQdB04t89/1O/w1cDnyilFU=';
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';

// 載入講師資料
let teacherData = null;
try {
    teacherData = require('./teacher_data.json');
    console.log('✅ 講師資料載入成功');
} catch (error) {
    console.error('❌ 載入講師資料失敗:', error.message);
}

// 管理員設定
const ADMIN_USER_ID = teacherData?.teachers?.Tim || 'Udb51363eb6fdc605a6a9816379a38103'; // Tim的管理員ID

// CalDAV 配置
const CALDAV_CONFIG = {
    baseUrl: process.env.CALDAV_URL || 'https://funlearnbar.synology.me:9102/caldav.php',
    username: process.env.CALDAV_USERNAME || 'testacount',
    password: process.env.CALDAV_PASSWORD || 'testacount'
};

// 初始化 CalDAV 客戶端
let caldavClient = null;

// LINE Messaging API 通知函數
async function sendLineMessage(message, targetUserId = null) {
    try {
        if (!LINE_CHANNEL_ACCESS_TOKEN || LINE_CHANNEL_ACCESS_TOKEN === 'YOUR_CHANNEL_ACCESS_TOKEN_HERE') {
            console.log('LINE Channel Access Token 未設定，跳過通知');
            return { success: false, message: 'LINE Channel Access Token 未設定' };
        }

        // 準備發送目標列表
        const targetUsers = [];
        
        // 總是發送給管理員Tim
        if (ADMIN_USER_ID) {
            targetUsers.push(ADMIN_USER_ID);
        }
        
        // 如果指定了特定使用者，也發送給該使用者
        if (targetUserId && targetUserId !== ADMIN_USER_ID) {
            targetUsers.push(targetUserId);
        }
        
        if (targetUsers.length === 0) {
            console.log('沒有有效的發送目標，跳過通知');
            return { success: false, message: '沒有有效的發送目標' };
        }

        // 發送給所有目標使用者（改為順序發送以便更好的錯誤處理）
        const results = [];
        
        for (const userId of targetUsers) {
            try {
                console.log(`正在發送LINE訊息給 ${userId}...`);

                const response = await axios.post(LINE_MESSAGING_API, {
                    to: userId,
                    messages: [{
                        type: 'text',
                        text: message
                    }]
                }, {
                    headers: {
                        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10秒超時
                });
                
                console.log(`✅ LINE 訊息發送成功給 ${userId}:`, response.data);
                results.push({ success: true, userId, data: response.data });
                
                // 添加小延遲避免API限制
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.error(`❌ LINE 訊息發送失敗給 ${userId}:`, error.response?.data || error.message);
                results.push({ success: false, userId, error: error.response?.data || error.message });
            }
        }

        // 檢查是否有任何成功的發送
        const hasSuccess = results.some(result => result.success);
        
        return {
            success: hasSuccess,
            message: hasSuccess ? '通知發送成功' : '所有通知發送失敗',
            results: results
        };
        
    } catch (error) {
        console.error('LINE 通知發送錯誤:', error);
        return { success: false, message: error.message };
    }
}
try {
    caldavClient = new CalDAVClient(CALDAV_CONFIG.baseUrl, CALDAV_CONFIG.username, CALDAV_CONFIG.password);
    console.log('CalDAV 客戶端初始化成功');
} catch (error) {
    console.error('CalDAV 客戶端初始化失敗:', error.message);
}

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

// 根據講師名稱獲取user ID
function getUserIdByTeacherName(teacherName) {
    return new Promise((resolve, reject) => {
        // 首先嘗試從teacher_data.json中查找
        if (teacherData && teacherData.teachers) {
            const userId = teacherData.teachers[teacherName];
            if (userId) {
                console.log(`✅ 從teacher_data.json找到講師 "${teacherName}" 的user ID: ${userId}`);
                resolve(userId);
                return;
            }
        }
        
        // 如果沒找到，再從資料庫中查找
        db.get(
            'SELECT user_id FROM teacher_matches WHERE teacher_name = ? ORDER BY confidence DESC, created_at DESC LIMIT 1',
            [teacherName],
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const userId = row ? row.user_id : null;
                    if (userId) {
                        console.log(`✅ 從資料庫找到講師 "${teacherName}" 的user ID: ${userId}`);
                    } else {
                        console.log(`❌ 找不到講師 "${teacherName}" 的user ID`);
                    }
                    resolve(userId);
                }
            }
        );
    });
}

// 獲取所有講師與user ID的對應關係
function getAllTeacherUserMapping() {
    return new Promise((resolve, reject) => {
        // 優先使用teacher_data.json中的資料
        if (teacherData && teacherData.teachers) {
            const mapping = {};
            Object.entries(teacherData.teachers).forEach(([teacherName, userId]) => {
                mapping[teacherName] = {
                    userId: userId,
                    confidence: 1.0, // 從JSON文件來的資料信心度設為1.0
                    source: 'teacher_data.json'
                };
            });
            console.log('✅ 使用teacher_data.json中的講師映射資料');
            resolve(mapping);
            return;
        }
        
        // 如果沒有JSON文件，從資料庫中查找
        db.all(
            `SELECT DISTINCT teacher_name, user_id, MAX(confidence) as max_confidence, MAX(created_at) as latest_match
             FROM teacher_matches 
             GROUP BY teacher_name, user_id 
             ORDER BY teacher_name, max_confidence DESC`,
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // 為每個講師選擇最佳匹配的user ID
                    const mapping = {};
                    rows.forEach(row => {
                        if (!mapping[row.teacher_name] || row.max_confidence > mapping[row.teacher_name].confidence) {
                            mapping[row.teacher_name] = {
                                userId: row.user_id,
                                confidence: row.max_confidence,
                                latestMatch: row.latest_match,
                                source: 'database'
                            };
                        }
                    });
                    console.log('✅ 使用資料庫中的講師映射資料');
                    resolve(mapping);
                }
            }
        );
    });
}

// 模擬行事曆事件數據（實際部署時應該連接到真實的CalDAV服務器）
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

// 測試頁面路由
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'perfect-calendar-test.html'));
});

// 測試功能驗證頁面
app.get('/test-functionality', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-system-functionality.html'));
});

// 課程解析測試頁面
app.get('/test-course-parsing', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-course-parsing.html'));
});

// 正式版本路由
app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'perfect-calendar.html'));
});

// 學生簽到通知API
app.post('/api/student-attendance-notification', async (req, res) => {
    try {
        const { message, teacherName, courseName, presentStudents, absentStudents, unmarkedStudents } = req.body;
        
        if (!message) {
            return res.json({ success: false, message: '請提供通知訊息' });
        }

        // 構建通知訊息
        let notificationMessage = `📚 學生簽到通知\n\n`;
        notificationMessage += `👨‍🏫 講師：${teacherName || '未知講師'}\n`;
        notificationMessage += `📖 課程：${courseName || '未知課程'}\n`;
        notificationMessage += `📅 日期：${new Date().toLocaleDateString('zh-TW')}\n\n`;
        
        if (presentStudents && presentStudents.length > 0) {
            notificationMessage += `✅ 出席 (${presentStudents.length}人)：\n${presentStudents.join('、')}\n\n`;
        }
        
        if (absentStudents && absentStudents.length > 0) {
            notificationMessage += `❌ 缺席 (${absentStudents.length}人)：\n${absentStudents.join('、')}\n\n`;
        }
        
        if (unmarkedStudents && unmarkedStudents.length > 0) {
            notificationMessage += `⏳ 未選擇 (${unmarkedStudents.length}人)：\n${unmarkedStudents.join('、')}\n\n`;
        }
        
        notificationMessage += `⏰ 簽到時間：${new Date().toLocaleString('zh-TW')}`;
        
        // 嘗試獲取講師的user ID
        let teacherUserId = null;
        if (teacherName) {
            try {
                teacherUserId = await getUserIdByTeacherName(teacherName);
                console.log(`🔍 講師 "${teacherName}" 的user ID:`, teacherUserId);
            } catch (error) {
                console.log('❌ 獲取講師user ID失敗:', error.message);
            }
        }
        
        // 發送通知
        const result = await sendLineMessage(notificationMessage, teacherUserId);
        
        res.json({
            success: result.success,
            message: result.success ? '學生簽到通知發送成功' : '學生簽到通知發送失敗',
            error: result.message,
            teacherUserId: teacherUserId
        });
        
    } catch (error) {
        console.error('學生簽到通知發送錯誤:', error);
        res.json({ success: false, message: '通知發送失敗', error: error.message });
    }
});

// 代理 Google Sheets API 請求
app.post('/api/proxy/google-sheets', async (req, res) => {
    try {
        const { action, course, period, records } = req.body;
        
        console.log('🔄 代理 Google Sheets API 請求:', { action, course, period });
        
        let apiUrl;
        let payload;
        
        if (action === 'getRosterAttendance') {
            apiUrl = 'https://script.google.com/macros/s/AKfycbzm0GD-T09Botbs52e8PyeVuA5slJh6Z0AQ7I0uUiGZiE6aWhTO2D0d3XHFrdLNv90uCw/exec';
            
            // 確保課程和時間格式正確
            const cleanCourse = course ? course.trim() : '';
            const cleanPeriod = period ? period.trim() : '';
            
            console.log('🔍 清理後的參數:', { cleanCourse, cleanPeriod });
            
            payload = {
                action: 'getRosterAttendance',
                course: cleanCourse,
                period: cleanPeriod
            };
            
            // 直接發送請求並返回結果
            const headers = {
                'Content-Type': 'application/json',
                'Cookie': 'NID=525=nsWVvbAon67C2qpyiEHQA3SUio_GqBd7RqUFU6BwB97_4LHggZxLpDgSheJ7WN4w3Z4dCQBiFPG9YKAqZgAokFYCuuQw04dkm-FX9-XHAIBIqJf1645n3RZrg86GcUVJOf3gN-5eTHXFIaovTmgRC6cXllv82SnQuKsGMq7CHH60XDSwyC99s9P2gmyXLppI'
            };
            
            console.log('📤 發送請求到 Google Sheets API:', { apiUrl, payload });
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Google Sheets API 請求失敗: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📥 Google Sheets API 回應:', data);
            
            return res.json(data);
        } else if (action === 'updateAttendance' || action === 'update') {
            // 使用學生簽到 API (dev 版本)
            apiUrl = 'https://script.google.com/macros/s/AKfycbxfj5fwNIc8ncbqkOm763yo6o06wYPHm2nbfd_1yLkHlakoS9FtYfYJhvGCaiAYh_vjIQ/dev';
            
            // 處理單筆簽到記錄
            if (req.body.action === 'update' && req.body.name) {
                const singlePayload = {
                    action: 'update',
                    name: req.body.name,
                    date: req.body.date,
                    present: req.body.present,
                    course: req.body.course,
                    period: req.body.period
                };
                
                console.log('📤 發送單筆簽到記錄:', singlePayload);
                
                try {
                    const singleResponse = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cookie': 'NID=525=nsWVvbAon67C2qpyiEHQA3SUio_GqBd7RqUFU6BwB97_4LHggZxLpDgSheJ7WN4w3Z4dCQBiFPG9YKAqZgAokFYCuuQw04dkm-FX9-XHAIBIqJf1645n3RZrg86GcUVJOf3gN-5eTHXFIaovTmgRC6cXllv82SnQuKsGMq7CHH60XDSwyC99s9P2gmyXLppI'
                        },
                        body: JSON.stringify(singlePayload)
                    });
                    
                    if (!singleResponse.ok) {
                        throw new Error(`單筆簽到記錄 API 請求失敗: ${singleResponse.status} ${singleResponse.statusText}`);
                    }
                    
                    const singleData = await singleResponse.json();
                    console.log('📥 單筆簽到記錄 API 回應:', singleData);
                    
                    return res.json(singleData);
                    
                } catch (error) {
                    console.error('❌ 單筆簽到記錄失敗:', error);
                    return res.status(500).json({
                        success: false,
                        error: error.message
                    });
                }
            }
            
            // 處理多筆簽到記錄
            if (records && records.length > 0) {
                // 如果有多筆記錄，逐一處理
                const results = [];
                for (const record of records) {
                    const singlePayload = {
                        action: 'update',
                        name: record.studentName,
                        date: record.date,
                        present: record.present,
                        course: record.course,
                        period: record.period
                    };
                    
                    console.log('📤 發送單筆簽到記錄:', singlePayload);
                    
                    try {
                        const singleResponse = await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Cookie': 'NID=525=nsWVvbAon67C2qpyiEHQA3SUio_GqBd7RqUFU6BwB97_4LHggZxLpDgSheJ7WN4w3Z4dCQBiFPG9YKAqZgAokFYCuuQw04dkm-FX9-XHAIBIqJf1645n3RZrg86GcUVJOf3gN-5eTHXFIaovTmgRC6cXllv82SnQuKsGMq7CHH60XDSwyC99s9P2gmyXLppI'
                            },
                            body: JSON.stringify(singlePayload)
                        });
                        
                        if (!singleResponse.ok) {
                            throw new Error(`單筆簽到記錄 API 請求失敗: ${singleResponse.status} ${singleResponse.statusText}`);
                        }
                        
                        const singleData = await singleResponse.json();
                        results.push(singleData);
                        
                        // 避免 API 限制，稍作延遲
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                    } catch (error) {
                        console.error(`❌ 單筆簽到記錄失敗:`, error);
                        results.push({
                            success: false,
                            error: error.message,
                            record: record,
                            studentName: record.studentName || record.studentId
                        });
                    }
                }
                
                // 返回所有結果
                const successCount = results.filter(r => r.success === true).length;
                const failedCount = results.filter(r => r.success === false).length;
                
                return res.json({
                    success: successCount > 0,
                    message: `處理完成：${successCount}/${records.length} 筆記錄成功`,
                    results: results,
                    successCount: successCount,
                    failedCount: failedCount
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: '沒有簽到記錄需要處理'
                });
            }
        } else if (action === 'query') {
            // 查詢學生缺勤紀錄
            const { name } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: '缺少學生姓名參數'
                });
            }
            
            apiUrl = 'https://script.google.com/macros/s/AKfycbxfj5fwNIc8ncbqkOm763yo6o06wYPHm2nbfd_1yLkHlakoS9FtYfYJhvGCaiAYh_vjIQ/dev';
            
            payload = {
                action: 'query',
                name: name
            };
            
            console.log('📤 查詢學生缺勤紀錄:', { apiUrl, payload });
            
            const headers = {
                'Content-Type': 'application/json',
                'Cookie': 'NID=525=nsWVvbAon67C2qpyiEHQA3SUio_GqBd7RqUFU6BwB97_4LHggZxLpDgSheJ7WN4w3Z4dCQBiFPG9YKAqZgAokFYCuuQw04dkm-FX9-XHAIBIqJf1645n3RZrg86GcUVJOf3gN-5eTHXFIaovTmgRC6cXllv82SnQuKsGMq7CHH60XDSwyC99s9P2gmyXLppI'
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`查詢缺勤紀錄失敗: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📥 缺勤紀錄查詢回應:', data);
            
            return res.json(data);
        } else {
            return res.status(400).json({
                success: false,
                error: '不支援的 API 動作'
            });
        }
        
        // 如果到達這裡，表示沒有匹配到任何動作，直接返回
        return res.status(400).json({
            success: false,
            error: '無效的 API 動作'
        });
        
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'NID=525=nsWVvbAon67C2qpyiEHQA3SUio_GqBd7RqUFU6BwB97_4LHggZxLpDgSheJ7WN4w3Z4dCQBiFPG9YKAqZgAokFYCuuQw04dkm-FX9-XHAIBIqJf1645n3RZrg86GcUVJOf3gN-5eTHXFIaovTmgRC6cXllv82SnQuKsGMq7CHH60XDSwyC99s9P2gmyXLppI'
        };
        
        console.log('📤 發送請求到 Google Sheets API:', { apiUrl, payload });
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Google Sheets API 請求失敗: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📥 Google Sheets API 回應:', data);
        
        res.json(data);
        
    } catch (error) {
        console.error('❌ 代理 Google Sheets API 請求失敗:', error);
        res.status(500).json({
            success: false,
            error: '代理請求失敗: ' + error.message
        });
    }
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

// 根據講師名稱獲取user ID
app.get('/api/teacher-user-id/:teacherName', async (req, res) => {
    try {
        const { teacherName } = req.params;
        
        if (!teacherName) {
            return res.status(400).json({
                success: false,
                error: '請提供講師名稱'
            });
        }

        // 查詢資料庫獲取最匹配的user ID
        const userId = await getUserIdByTeacherName(teacherName);
        
        if (userId) {
            res.json({
                success: true,
                teacherName: teacherName,
                userId: userId
            });
        } else {
            res.json({
                success: false,
                message: `找不到講師 "${teacherName}" 對應的user ID`,
                teacherName: teacherName
            });
        }
    } catch (error) {
        console.error('獲取講師user ID失敗:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 獲取所有講師與user ID的對應關係
app.get('/api/teacher-user-mapping', async (req, res) => {
    try {
        const mapping = await getAllTeacherUserMapping();
        
        res.json({
            success: true,
            mapping: mapping
        });
    } catch (error) {
        console.error('獲取講師user ID對應關係失敗:', error);
        res.status(500).json({
            success: false,
            error: error.message
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

// 講師報表API
app.post('/api/teacher-report', async (req, res) => {
    try {
        const { teacherName, courseName, courseTime, date, studentCount, courseContent, webApi } = req.body;
        
        console.log('📤 收到講師報表提交:', { teacherName, courseName, courseTime, date, studentCount, courseContent, webApi });
        
        if (!teacherName || !courseName || !courseTime || !date || !webApi) {
            return res.status(400).json({
                success: false,
                message: '缺少必要參數'
            });
        }
        
        // 準備Google Apps Script API請求
        const payload = {
            action: 'appendTeacherCourse',
            sheetName: '報表',
            teacherName: teacherName,
            '課程名稱': courseName,
            '上課時間': courseTime,
            '課程日期': date,
            '人數_助教': (studentCount || 0).toString(),  // 使用正確的欄位名稱並轉換為字串
            '課程內容': courseContent || ''
        };
        
        console.log('📤 發送講師報表到Google Sheets:', payload);
        
        // 使用講師的Web API URL
        const response = await axios.post(webApi, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': process.env.GOOGLE_SCRIPT_COOKIE || 'NID=525=nsWVvbAon67C2qpyiEHQA3SUio_GqBd7RqUFU6BwB97_4LHggZxLpDgSheJ7WN4w3Z4dCQBiFPG9YKAqZgAokFYCuuQw04dkm-FX9-XHAIBIqJf1645n3RZrg86GcUVJOf3gN-5eTHXFIaovTmgRC6cXllv82SnQuKsGMq7CHH60XDSwyC99s9P2gmyXLppI'
            },
            timeout: 10000
        });
        
        console.log('📥 講師報表API回應:', response.data);
        
        res.json({
            success: true,
            message: '講師報表提交成功',
            data: response.data
        });
        
    } catch (error) {
        console.error('❌ 講師報表提交失敗:', error);
        res.status(500).json({
            success: false,
            message: '講師報表提交失敗',
            error: error.message
        });
    }
});

// 獲取講師Web API URL
app.post('/api/teacher-web-api', async (req, res) => {
    try {
        const { teacherName } = req.body;
        
        if (!teacherName) {
            return res.status(400).json({
                success: false,
                message: '請提供講師名稱'
            });
        }
        
        console.log('🔍 查找講師Web API:', teacherName);
        
        // 從Google Apps Script獲取講師列表
        const response = await axios.post(GOOGLE_SCRIPT_URL, {
            action: 'getTeacherList'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': process.env.GOOGLE_SCRIPT_COOKIE || 'NID=525=nsWVvbAon67C2qpyiEHQA3SUio_GqBd7RqUFU6BwB97_4LHggZxLpDgSheJ7WN4w3Z4dCQBiFPG9YKAqZgAokFYCuuQw04dkm-FX9-XHAIBIqJf1645n3RZrg86GcUVJOf3gN-5eTHXFIaovTmgRC6cXllv82SnQuKsGMq7CHH60XDSwyC99s9P2gmyXLppI'
            },
            timeout: 10000
        });
        
        console.log('📋 Google Apps Script API 回應:', response.data);
        
        // 處理不同的回應格式
        let teachers = [];
        if (Array.isArray(response.data)) {
            teachers = response.data;
        } else if (response.data && Array.isArray(response.data.teachers)) {
            teachers = response.data.teachers;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            teachers = response.data.data;
        } else {
            console.log('⚠️ API回應格式不正確，使用CSV備用方案');
            throw new Error('API回應格式不正確');
        }
        
        console.log(`📋 處理後的講師列表: ${teachers.length} 個講師`);
        
        // 查找匹配的講師
        for (const teacher of teachers) {
            const apiTeacherName = teacher.name || teacher.teacherName || teacher.老師;
            const webApi = teacher.webApi || teacher.Web_API || teacher.連結;
            
            if (apiTeacherName && apiTeacherName.toLowerCase().replace(/\s+/g, '') === 
                teacherName.toLowerCase().replace(/\s+/g, '')) {
                
                if (webApi && webApi !== '') {
                    console.log('✅ 找到講師Web API:', webApi);
                    return res.json({
                        success: true,
                        teacherName: teacherName,
                        webApi: webApi
                    });
                } else {
                    console.log('⚠️ 講師沒有配置Web API:', apiTeacherName);
                    return res.json({
                        success: false,
                        message: `講師 "${teacherName}" 沒有配置Web API`
                    });
                }
            }
        }
        
        console.log('❌ 找不到講師:', teacherName);
        res.json({
            success: false,
            message: `找不到講師 "${teacherName}"`
        });
        
    } catch (error) {
        console.error('❌ 獲取講師Web API失敗:', error);
        
        // 嘗試使用CSV備用方案
        console.log('🔄 嘗試使用CSV備用方案...');
        try {
            const fs = require('fs');
            const path = require('path');
            
            const csvPath = path.join(__dirname, 'public', '114-1 講師報表web read api.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');
            const lines = csvContent.split('\n');
            
            // 跳過標題行，從第二行開始處理
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const columns = line.split(',');
                if (columns.length >= 3) {
                    const csvTeacherName = columns[0].trim();
                    const webApi = columns[2].trim();
                    
                    // 模糊匹配講師名稱（忽略空格和大小寫）
                    if (csvTeacherName.toLowerCase().replace(/\s+/g, '') === 
                        teacherName.toLowerCase().replace(/\s+/g, '')) {
                        
                        if (webApi && webApi !== '') {
                            console.log('✅ 從CSV找到講師Web API:', webApi);
                            return res.json({
                                success: true,
                                teacherName: teacherName,
                                webApi: webApi
                            });
                        } else {
                            console.log('⚠️ 講師沒有配置Web API:', csvTeacherName);
                            return res.json({
                                success: false,
                                message: `講師 "${teacherName}" 沒有配置Web API`
                            });
                        }
                    }
                }
            }
            
            console.log('❌ 在CSV中找不到講師:', teacherName);
            res.json({
                success: false,
                message: `找不到講師 "${teacherName}"`
            });
            
        } catch (csvError) {
            console.error('❌ CSV備用方案也失敗:', csvError);
            res.status(500).json({
                success: false,
                message: '獲取講師Web API失敗',
                error: error.message
            });
        }
    }
});

// 獲取當日事件（最快載入）
app.get('/api/events/today', async (req, res) => {
    try {
        if (!caldavClient) {
            console.log('CalDAV 客戶端未初始化');
            return res.json({
                success: false,
                message: 'CalDAV 客戶端未初始化',
                data: [],
                source: 'error',
                type: 'today'
            });
        }

        // 只獲取當日事件
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // 強制重新載入 CalDAV 客戶端
        delete require.cache[require.resolve('./caldav-client.js')];
        const CalDAVClient = require('./caldav-client.js');
        caldavClient = new CalDAVClient(CALDAV_CONFIG.baseUrl, CALDAV_CONFIG.username, CALDAV_CONFIG.password);
        console.log('CalDAV 客戶端已重新載入');
        
        console.log('🚀 正在從 CalDAV 獲取當日事件...');
        console.log(`📅 當日日期範圍: ${startDate.toISOString()} 到 ${endDate.toISOString()}`);
        const events = await caldavClient.getAllInstructorEvents(startDate, endDate);
        
        // 轉換事件格式以符合前端需求
        const formattedEvents = events.map(event => ({
            id: event.id,
            title: event.title,
            instructor: event.instructor,
            start: event.start,
            end: event.end,
            type: event.type || 'other',
            description: event.description || '',
            location: event.location || '',
            time: event.time || '',
            lessonUrl: event.lessonUrl || ''
        }));

        console.log(`✅ 成功獲取 ${formattedEvents.length} 個當日事件`);
        console.log('📋 當日事件範例:', formattedEvents.slice(0, 3).map(e => ({ title: e.title, instructor: e.instructor, start: e.start })));
        res.json({
            success: true,
            data: formattedEvents,
            source: 'caldav',
            type: 'today'
        });
    } catch (error) {
        console.error('獲取當日事件失敗:', error.message);
        console.log('回退到模擬數據');
        
        // 如果 CalDAV 失敗，回退到模擬數據
        res.json({
            success: true,
            data: mockEvents.filter(event => {
                const eventDate = new Date(event.start);
                const today = new Date();
                return eventDate.toDateString() === today.toDateString();
            }),
            source: 'mock',
            type: 'today',
            error: error.message
        });
    }
});

// 獲取本週事件（第二階段載入）
app.get('/api/events/week', async (req, res) => {
    try {
        if (!caldavClient) {
            console.log('CalDAV 客戶端未初始化');
            return res.json({
                success: false,
                message: 'CalDAV 客戶端未初始化',
                data: [],
                source: 'error',
                type: 'week'
            });
        }

        // 獲取本週事件（週一到週日）
        const today = new Date();
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 週日時回到本週一，其他天回到本週一
        weekStart.setDate(today.getDate() + daysToMonday);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // 週日
        weekEnd.setHours(23, 59, 59, 999);

        // 強制重新載入 CalDAV 客戶端
        delete require.cache[require.resolve('./caldav-client.js')];
        const CalDAVClient = require('./caldav-client.js');
        caldavClient = new CalDAVClient(CALDAV_CONFIG.baseUrl, CALDAV_CONFIG.username, CALDAV_CONFIG.password);
        console.log('CalDAV 客戶端已重新載入');
        
        console.log('🔄 正在從 CalDAV 獲取本週事件...');
        console.log(`📅 本週日期範圍: ${weekStart.toISOString()} 到 ${weekEnd.toISOString()}`);
        const events = await caldavClient.getAllInstructorEvents(weekStart, weekEnd);
        
        // 轉換事件格式以符合前端需求
        const formattedEvents = events.map(event => ({
            id: event.id,
            title: event.title,
            instructor: event.instructor,
            start: event.start,
            end: event.end,
            type: event.type || 'other',
            description: event.description || '',
            location: event.location || '',
            time: event.time || '',
            lessonUrl: event.lessonUrl || ''
        }));

        console.log(`✅ 成功獲取 ${formattedEvents.length} 個本週事件`);
        console.log('📋 本週事件範例:', formattedEvents.slice(0, 3).map(e => ({ title: e.title, instructor: e.instructor, start: e.start })));
        res.json({
            success: true,
            data: formattedEvents,
            source: 'caldav',
            type: 'week'
        });
    } catch (error) {
        console.error('獲取本週事件失敗:', error.message);
        console.log('回退到模擬數據');
        
        // 如果 CalDAV 失敗，回退到模擬數據
        res.json({
            success: true,
            data: mockEvents.filter(event => {
                const eventDate = new Date(event.start);
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);
                return eventDate >= weekStart && eventDate < weekEnd;
            }),
            source: 'mock',
            type: 'week',
            error: error.message
        });
    }
});

// 獲取行事曆事件
app.get('/api/events', async (req, res) => {
    try {
        if (!caldavClient) {
            console.log('CalDAV 客戶端未初始化，使用模擬數據');
            return res.json({
                success: true,
                data: mockEvents,
                source: 'mock'
            });
        }

        // 獲取日期範圍（預設為未來30天）
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        // 強制重新載入 CalDAV 客戶端
        delete require.cache[require.resolve('./caldav-client.js')];
        const CalDAVClient = require('./caldav-client.js');
        caldavClient = new CalDAVClient(CALDAV_CONFIG.baseUrl, CALDAV_CONFIG.username, CALDAV_CONFIG.password);
        console.log('CalDAV 客戶端已重新載入');
        
        console.log('正在從 CalDAV 獲取事件...');
        const events = await caldavClient.getAllInstructorEvents(startDate, endDate);
        
        // 轉換事件格式以符合前端需求
        const formattedEvents = events.map(event => ({
            id: event.id,
            title: event.title,
            instructor: event.instructor,
            start: event.start,
            end: event.end,
            type: event.type || 'other',
            description: event.description || '',
            location: event.location || '',
            time: event.time || '',
            lessonUrl: event.lessonUrl || ''
        }));

        console.log(`成功獲取 ${formattedEvents.length} 個事件`);
        console.log('事件資料範例:', formattedEvents[0]);
        res.json({
            success: true,
            data: formattedEvents,
            source: 'caldav',
            type: 'full'
        });
    } catch (error) {
        console.error('獲取行事曆事件失敗:', error.message);
        console.log('回退到模擬數據');
        
        // 如果 CalDAV 失敗，回退到模擬數據
        res.json({
            success: true,
            data: mockEvents,
            source: 'mock',
            type: 'full',
            error: error.message
        });
    }
});

// 測試 CalDAV 連接
app.get('/api/test-caldav', async (req, res) => {
    try {
        if (!caldavClient) {
            return res.json({
                success: false,
                message: 'CalDAV 客戶端未初始化',
                caldavConfig: CALDAV_CONFIG
            });
        }
        
        const calendars = await caldavClient.getCalendars();
        res.json({
            success: true,
            message: 'CalDAV 連接成功',
            calendars: calendars,
            caldavConfig: CALDAV_CONFIG
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'CalDAV 連接失敗',
            error: error.message,
            caldavConfig: CALDAV_CONFIG
        });
    }
});

// 檢查事件來源
app.get('/api/event-source', (req, res) => {
    res.json({
        caldavClient: caldavClient ? '已初始化' : '未初始化',
        caldavConfig: CALDAV_CONFIG,
        mockEvents: mockEvents.length
    });
});

// 測試 CalDAV 連接
app.get('/api/test-caldav-old', async (req, res) => {
    try {
        if (!caldavClient) {
            return res.json({
                success: false,
                error: 'CalDAV 客戶端未初始化',
                caldav_configured: false
            });
        }

        console.log('測試 CalDAV 連接...');
        const calendars = await caldavClient.getCalendars();
        
        res.json({
            success: true,
            calendars: calendars,
            caldav_configured: true,
            message: `成功連接到 CalDAV，找到 ${calendars.length} 個行事曆`
        });
    } catch (error) {
        console.error('CalDAV 連接測試失敗:', error.message);
        res.json({
            success: false,
            error: error.message,
            caldav_configured: true,
            message: 'CalDAV 配置正確但連接失敗'
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
        environment: process.env.NODE_ENV || 'development',
        caldav_configured: caldavClient !== null
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

// 代理 Google Apps Script API 請求
app.get('/api/google-script', async (req, res) => {
    try {
        const { action, limit, offset } = req.query;
        const url = `${GOOGLE_SCRIPT_URL}?action=${action}&limit=${limit}&offset=${offset}`;
        
        console.log('代理請求 Google Apps Script:', url);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'FLB-Calendar-Server/1.0'
            }
        });
        
        // 設定 CORS 標頭
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        res.json(response.data);
    } catch (error) {
        console.error('代理 Google Apps Script 請求失敗:', error);
        res.status(500).json({ error: '代理請求失敗' });
    }
});

// 測試 CalDAV 連接
app.get('/api/test-caldav', async (req, res) => {
    try {
        if (!caldavClient) {
            return res.json({
                success: false,
                message: 'CalDAV 客戶端未初始化',
                caldavConfig: CALDAV_CONFIG
            });
        }
        
        const calendars = await caldavClient.getCalendars();
        res.json({
            success: true,
            message: 'CalDAV 連接成功',
            calendars: calendars,
            caldavConfig: CALDAV_CONFIG
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'CalDAV 連接失敗',
            error: error.message,
            caldavConfig: CALDAV_CONFIG
        });
    }
});

// 檢查事件來源
app.get('/api/event-source', (req, res) => {
    res.json({
        caldavClient: caldavClient ? '已初始化' : '未初始化',
        caldavConfig: CALDAV_CONFIG,
        mockEvents: mockEvents.length
    });
});

// 測試 CalDAV 連接
app.get('/api/test-caldav-old', async (req, res) => {
    try {
        if (!caldavClient) {
            return res.json({
                success: false,
                error: 'CalDAV 客戶端未初始化',
                caldav_configured: false
            });
        }

        console.log('測試 CalDAV 連接...');
        const calendars = await caldavClient.getCalendars();
        
        res.json({
            success: true,
            calendars: calendars,
            caldav_configured: true,
            message: `成功連接到 CalDAV，找到 ${calendars.length} 個行事曆`
        });
    } catch (error) {
        console.error('CalDAV 連接測試失敗:', error.message);
        res.json({
            success: false,
            error: error.message,
            caldav_configured: true,
            message: 'CalDAV 配置正確但連接失敗'
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
        environment: process.env.NODE_ENV || 'development',
        caldav_configured: caldavClient !== null
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

// 代理 Google Apps Script API 請求
app.get('/api/google-script', async (req, res) => {
    try {
        const { action, limit, offset } = req.query;
        const url = `${GOOGLE_SCRIPT_URL}?action=${action}&limit=${limit}&offset=${offset}`;
        
        console.log('代理請求 Google Apps Script:', url);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'FLB-Calendar-Server/1.0'
            }
        });
        
        // 設定 CORS 標頭
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        res.json(response.data);
    } catch (error) {
        console.error('代理 Google Apps Script 請求失敗:', error);
        res.status(500).json({ error: '代理請求失敗' });
    }
});
// 啟動服務器
const server = app.listen(PORT, () => {
    console.log(`🚀 FLB講師行事曆LIFF應用運行在端口 ${PORT}`);
    console.log(`🌐 主頁面: http://localhost:${PORT}`);
    console.log(`🔧 API端點: http://localhost:${PORT}/api/teachers`);
    console.log(`🔗 代理端點: http://localhost:${PORT}/api/google-script`);
    console.log(`📊 健康檢查: http://localhost:${PORT}/api/health`);
    console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
});

// 處理端口衝突
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ 端口 ${PORT} 已被使用，嘗試使用其他端口...`);
        const newPort = PORT + 1;
        const newServer = app.listen(newPort, () => {
            console.log(`🚀 FLB講師行事曆LIFF應用運行在端口 ${newPort}`);
            console.log(`🌐 主頁面: http://localhost:${newPort}`);
            console.log(`🔧 API端點: http://localhost:${newPort}/api/teachers`);
            console.log(`🔗 代理端點: http://localhost:${newPort}/api/google-script`);
            console.log(`📊 健康檢查: http://localhost:${newPort}/api/health`);
            console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
        });
        
        newServer.on('error', (err) => {
            console.error('❌ 無法啟動服務器:', err);
            process.exit(1);
        });
    } else {
        console.error('❌ 服務器錯誤:', err);
        process.exit(1);
    }
});

module.exports = app;
