# 講師行事曆檢視應用程式

一個專為講師設計的響應式行事曆檢視應用程式，支援手機端快速查看行程安排。直接從 CalDAV 服務器獲取真實的講師行事曆資料。

## 功能特色

- 📱 **手機端優化**：完全響應式設計，適合手機瀏覽
- 📅 **多種檢視模式**：今日、本週、本月、全部行程檢視
- 👥 **講師篩選**：可選擇特定講師查看其行程
- 📝 **教案連結**：自動提取並顯示可點擊的教案連結
- 🔄 **即時同步**：直接從 CalDAV 服務器獲取最新資料
- 📊 **統計資訊**：顯示事件總數、講師數等統計

## 技術架構

### 前端
- **HTML5**：語義化標記，內嵌 CSS 和 JavaScript
- **CSS3**：響應式設計、現代化 UI
- **JavaScript ES6+**：模組化程式設計

### 後端
- **Node.js**：伺服器運行環境
- **Express.js**：Web 框架
- **CalDAV 協議**：與 Synology 行事曆同步
- **iCalendar 解析**：處理 .ics 格式資料

## 安裝與使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動服務器

```bash
npm start
```

或使用開發模式（自動重啟）：

```bash
npm run dev
```

### 3. 訪問應用程式

開啟瀏覽器訪問：`http://localhost:3000/perfect-calendar.html`

## 使用說明

### 主要功能

- **檢視模式**：切換今日、本週、本月、全部事件檢視
- **講師篩選**：選擇特定講師查看其行程
- **日期篩選**：選擇特定日期查看事件
- **教案連結**：點擊教案按鈕直接跳轉到 Notion 頁面
- **統計資訊**：查看總事件數、講師數等統計

### 資料來源

應用程式直接從 CalDAV 服務器獲取資料：
- **服務器**：`https://funlearnbar.synology.me:9102/caldav.php/`
- **帳號**：`testacount`
- **支援講師**：17 位講師的行事曆
- **事件類型**：SPM教案、SPIKE教案、ESM教案、BOOST教案

### 教案連結功能

- 自動從事件描述中提取 Notion 連結
- 支援多種教案格式識別
- 一鍵跳轉到對應的教案頁面
- 美觀的按鈕設計，提升使用體驗

## 部署

### 本地部署

1. 確保已安裝 Node.js 14+
2. 執行 `npm install` 安裝依賴
3. 執行 `npm start` 啟動服務

### 雲端部署

推薦使用以下平台進行部署：

- **Heroku**：簡單的 Node.js 應用部署
- **Vercel**：靜態網站 + API 部署
- **Railway**：全端應用部署
- **DigitalOcean**：VPS 部署

### 環境變數

可設定以下環境變數：

```bash
PORT=3000                    # 服務器端口
SYNOLOGY_URL=your_url       # Synology 行事曆 URL
CACHE_DURATION=300000       # 快取持續時間（毫秒）
```

## 開發

### 專案結構

```
├── perfect-calendar.html  # 主頁面（內嵌 CSS 和 JavaScript）
├── server.js              # 後端服務器
├── caldav-client.js       # CalDAV 客戶端
├── package.json           # 專案配置
├── start.sh              # 啟動腳本
└── README.md             # 說明文件
```

### 自訂樣式

修改 `perfect-calendar.html` 中的 `<style>` 區塊來自訂外觀：

- 色彩主題：修改 CSS 變數
- 字體：調整 `font-family`
- 佈局：修改響應式斷點

### 新增功能

1. 在 `perfect-calendar.html` 的 `<script>` 區塊中新增前端邏輯
2. 在 `server.js` 中新增 API 端點
3. 在 `caldav-client.js` 中修改 CalDAV 處理邏輯

## 故障排除

### 常見問題

1. **無法載入行程資料**
   - 檢查網路連線
   - 確認 CalDAV 服務器是否正常運作
   - 查看瀏覽器控制台錯誤訊息

2. **教案連結無法點擊**
   - 確認事件描述中包含 Notion 連結
   - 檢查連結格式是否正確
   - 清除瀏覽器快取

3. **手機端顯示異常**
   - 檢查響應式設計
   - 確認 viewport 設定
   - 測試不同螢幕尺寸

### 除錯模式

開啟瀏覽器開發者工具查看詳細錯誤訊息：

1. 按 F12 開啟開發者工具
2. 切換到 Console 標籤
3. 查看錯誤和警告訊息

## 授權

MIT License - 詳見 LICENSE 檔案

## 支援

如有問題或建議，請聯繫開發團隊。

---

**注意**：此應用程式僅供教學用途，請確保遵守相關網站的使用條款和隱私政策。
