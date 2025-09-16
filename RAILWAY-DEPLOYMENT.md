# Railway 部署指南

本指南將幫助您將FLB講師行事曆LIFF應用部署到Railway平台。

## 前置要求

### 1. 安裝Railway CLI
```bash
npm install -g @railway/cli
```

### 2. 註冊Railway帳號
前往 [Railway](https://railway.app/) 註冊帳號

### 3. 登入Railway
```bash
railway login
```

## 部署步驟

### 方法一：使用部署腳本（推薦）

```bash
# 執行部署腳本
./deploy-railway.sh
```

### 方法二：手動部署

#### 1. 準備文件
```bash
# 創建public目錄
mkdir -p public

# 複製文件
cp liff-calendar.html public/index.html
cp logo.jpg public/  # 如果存在
cp package-railway.json package.json
cp server-railway.js server.js
```

#### 2. 初始化Railway專案
```bash
railway init
```

#### 3. 部署
```bash
railway up
```

## 環境變數設定

在Railway控制台中設定以下環境變數：

### 必要變數
- `NODE_ENV`: `production`
- `PORT`: `3000` (Railway會自動設定)

### Google Apps Script API
- `GOOGLE_SCRIPT_URL`: 您的Google Apps Script URL
- `GOOGLE_SCRIPT_COOKIE`: 您的Cookie值

### LIFF設定
- `LIFF_ID`: 您的LIFF ID

## 設定LIFF應用

### 1. 獲取部署URL
部署完成後，Railway會提供一個URL，例如：
```
https://your-app-name.railway.app
```

### 2. 更新LIFF設定
1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 選擇您的Channel
3. 進入LIFF設定
4. 更新Endpoint URL為您的Railway URL
5. 保存設定

### 3. 更新LIFF ID
在 `public/index.html` 中更新LIFF ID：
```javascript
let liffId = 'YOUR_LIFF_ID'; // 替換為您的LIFF ID
```

## 資料庫設定

Railway會自動創建SQLite資料庫文件，但請注意：

### 持久化存儲
- Railway的免費方案不保證文件持久化
- 建議升級到付費方案或使用外部資料庫

### 外部資料庫選項
1. **Railway PostgreSQL** (推薦)
2. **Railway MySQL**
3. **外部雲端資料庫**

## 監控和管理

### 查看日誌
```bash
railway logs
```

### 重新部署
```bash
railway up
```

### 查看狀態
```bash
railway status
```

### 查看環境變數
```bash
railway variables
```

## 故障排除

### 1. 部署失敗
- 檢查 `package.json` 是否正確
- 確認所有依賴都已安裝
- 查看Railway日誌

### 2. 應用無法啟動
- 檢查環境變數設定
- 確認端口設定正確
- 查看應用日誌

### 3. LIFF初始化失敗
- 確認LIFF ID正確
- 檢查Endpoint URL設定
- 確認CORS設定

### 4. 資料庫錯誤
- 檢查SQLite文件權限
- 確認資料庫路徑正確
- 考慮使用外部資料庫

## 性能優化

### 1. 啟用壓縮
應用已啟用gzip壓縮

### 2. 快取設定
- 講師列表快取24小時
- 靜態文件使用Express靜態中間件

### 3. 安全設定
- 使用Helmet.js增強安全性
- 設定CSP政策
- 啟用CORS

## 擴展功能

### 1. 自定義域名
在Railway控制台中設定自定義域名

### 2. SSL證書
Railway自動提供SSL證書

### 3. 監控和警報
使用Railway的監控功能

## 成本估算

### 免費方案
- 每月500小時運行時間
- 512MB RAM
- 1GB存儲空間

### 付費方案
- 按使用量計費
- 更多資源和功能
- 持久化存儲

## 支援

如有問題，請：
1. 查看Railway文檔
2. 檢查應用日誌
3. 聯繫FLB技術團隊

## 更新日誌

### v1.0.0
- 初始Railway部署版本
- 整合講師API和主服務器
- 支援LIFF應用
- SQLite資料庫快取
