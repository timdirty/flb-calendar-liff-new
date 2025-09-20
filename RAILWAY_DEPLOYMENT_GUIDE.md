# Railway 部署指南 - 測試頁面訪問

## 🚀 快速訪問測試頁面

### 1. 獲取 Railway 應用網址
1. 登入 [Railway](https://railway.app)
2. 找到您的專案：`flb-calendar-liff-new`
3. 複製應用網址（格式：`https://your-app-name.railway.app`）

### 2. 訪問不同版本

#### 📱 測試版本（含簽到功能）
```
https://your-app-name.railway.app/test
```
- **功能**：完整整合簽到系統的測試版本
- **特色**：快速簽到、課程選擇、報表查詢
- **用途**：測試和驗證新功能

#### 📅 正式版本
```
https://your-app-name.railway.app/calendar
```
- **功能**：原有的講師行事曆檢視系統
- **特色**：穩定、完整的功能
- **用途**：正式使用

#### 🏠 主頁面
```
https://your-app-name.railway.app/
```
- **功能**：原有的主頁面
- **特色**：基本功能展示
- **用途**：預設入口

#### 🔍 測試功能驗證頁面
```
https://your-app-name.railway.app/test-functionality
```
- **功能**：自動化測試系統各項功能
- **特色**：API 連接測試、CSP 合規性檢查、功能驗證
- **用途**：系統健康檢查和故障排除

## 🔧 部署狀態檢查

### 1. 檢查部署狀態
```bash
# 檢查 Railway 部署狀態
railway status

# 查看部署日誌
railway logs
```

### 2. 本地測試
```bash
# 啟動本地伺服器
npm start

# 訪問測試頁面
open http://localhost:3000/test
```

## 📋 功能對比

| 功能 | 測試版本 (/test) | 正式版本 (/calendar) | 主頁面 (/) |
|------|------------------|---------------------|------------|
| 行事曆檢視 | ✅ | ✅ | ✅ |
| 講師篩選 | ✅ | ✅ | ✅ |
| 時段篩選 | ✅ | ✅ | ✅ |
| 日期篩選 | ✅ | ✅ | ✅ |
| 視圖切換 | ✅ | ✅ | ✅ |
| 統計資訊 | ✅ | ✅ | ✅ |
| 快速簽到 | ✅ | ❌ | ❌ |
| 課程選擇 | ✅ | ❌ | ❌ |
| 報表查詢 | ✅ | ❌ | ❌ |
| 簽到系統整合 | ✅ | ❌ | ❌ |

## 🛠️ 技術細節

### 路由配置
```javascript
// 測試頁面路由
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'perfect-calendar-test.html'));
});

// 正式版本路由
app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'perfect-calendar.html'));
});

// 主頁面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

### 檔案結構
```
講師行事曆檢視/
├── perfect-calendar.html          # 正式版本
├── perfect-calendar-test.html     # 測試版本
├── public/
│   └── index.html                 # 主頁面
└── server.js                      # 伺服器配置
```

## 🔍 故障排除

### 1. 頁面無法訪問
- 檢查 Railway 部署狀態
- 確認網址是否正確
- 查看 Railway 日誌

### 2. 功能異常
- 檢查瀏覽器控制台錯誤
- 確認 API 端點是否正常
- 查看伺服器日誌

### 3. 簽到功能問題
- 確認 LIFF SDK 是否載入
- 檢查簽到系統 URL 是否正確
- 確認 LINE 環境設定

## 📞 支援

如有問題，請檢查：
1. Railway 部署日誌
2. 瀏覽器開發者工具
3. 伺服器狀態

---

**注意**：測試版本僅用於開發和測試，請勿用於生產環境。
