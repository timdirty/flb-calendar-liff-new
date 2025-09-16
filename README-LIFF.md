# FLB講師行事曆檢視系統 - LIFF版

這是一個基於LINE LIFF (LINE Front-end Framework) 的講師行事曆檢視系統，具有自動講師匹配和資料庫快取功能。

## 功能特色

### 🎯 自動講師匹配
- 根據用戶的LINE顯示名稱自動匹配講師
- 使用模糊比對算法，支援部分匹配和相似度計算
- 自動跳過講師選擇步驟，直接顯示匹配結果

### 💾 資料庫快取
- 使用SQLite資料庫快取講師列表
- 24小時快取機制，減少API調用
- 支援手動刷新講師列表

### 🔄 API整合
- 整合Google Apps Script API獲取講師列表
- 後端API處理講師匹配和快取
- 支援匹配歷史記錄

### 📱 LIFF整合
- 基於LINE LIFF框架
- 自動獲取用戶ID和顯示名稱
- 響應式設計，支援手機和桌面

## 系統架構

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LINE LIFF     │    │   主服務器      │    │  講師API服務器   │
│   (前端)        │◄──►│   (端口3000)    │◄──►│   (端口3001)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   行事曆API     │    │  Google Apps    │
                       │   (CalDAV)      │    │  Script API     │
                       └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  SQLite資料庫   │
                                               │  (快取)         │
                                               └─────────────────┘
```

## 安裝和設定

### 1. 安裝依賴

```bash
# 安裝Node.js依賴
npm install express axios sqlite3

# 或使用提供的package文件
npm install --prefix . express axios sqlite3
```

### 2. 設定LIFF應用

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 創建新的Provider和Channel
3. 在Channel設定中啟用LIFF
4. 創建新的LIFF應用，設定：
   - Endpoint URL: `http://localhost:3000`
   - Size: Full
   - Scan QR: 啟用

### 3. 更新LIFF ID

在 `liff-calendar.html` 中找到並更新：

```javascript
let liffId = 'YOUR_LIFF_ID'; // 替換為您的LIFF ID
```

### 4. 啟動服務

```bash
# 使用啟動腳本
./start-liff.sh

# 或手動啟動
node teacher-api.js &  # 講師API服務器
node server.js        # 主服務器
```

## API端點

### 講師API服務器 (端口3001)

- `GET /api/teachers` - 獲取講師列表
- `POST /api/match-teacher` - 匹配講師
- `GET /api/match-history/:userId` - 獲取匹配歷史
- `POST /api/refresh-teachers` - 強制刷新講師列表
- `GET /api/health` - 健康檢查

### 主服務器 (端口3000)

- `GET /` - LIFF應用頁面
- `GET /api/events` - 獲取行事曆事件

## 使用流程

### 1. 用戶進入LIFF應用
- 系統自動獲取用戶的LINE資訊
- 顯示用戶ID和顯示名稱

### 2. 自動講師匹配
- 系統根據顯示名稱模糊匹配講師
- 顯示匹配結果和相似度
- 自動選擇匹配的講師

### 3. 顯示行事曆
- 根據匹配的講師篩選事件
- 支援今日、本週、本月、全部視圖
- 顯示統計資訊

### 4. 個性化設定
- 支援顏色自定義
- 設定會保存到本地存儲

## 資料庫結構

### teachers 表
```sql
CREATE TABLE teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    display_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### teacher_matches 表
```sql
CREATE TABLE teacher_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    teacher_name TEXT,
    confidence REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_name) REFERENCES teachers (name)
);
```

## 配置說明

### Google Apps Script API
在 `teacher-api.js` 中設定：

```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL';
```

### 快取設定
```javascript
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小時
```

### 匹配閾值
```javascript
if (similarity > bestScore && similarity > 0.6) {
    // 相似度閾值為0.6
}
```

## 故障排除

### 1. LIFF初始化失敗
- 檢查LIFF ID是否正確
- 確認Endpoint URL設定
- 檢查網路連接

### 2. 講師匹配失敗
- 檢查Google Apps Script API是否正常
- 查看資料庫是否有講師資料
- 檢查匹配算法參數

### 3. 資料庫錯誤
- 檢查SQLite文件權限
- 確認資料庫文件路徑
- 查看服務器日誌

## 開發說明

### 添加新的匹配算法
在 `teacher-api.js` 中修改 `findBestMatch` 函數：

```javascript
function findBestMatch(query, teachers) {
    // 添加您的匹配邏輯
}
```

### 自定義快取策略
修改 `CACHE_DURATION` 常數或實現更複雜的快取邏輯。

### 擴展API功能
在 `teacher-api.js` 中添加新的路由和處理函數。

## 授權

MIT License

## 支援

如有問題，請聯繫FLB技術團隊。
