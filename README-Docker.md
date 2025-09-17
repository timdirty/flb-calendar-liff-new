# FLB 講師行事曆檢視系統 Docker 部署指南

## 📁 專案結構

```
講師行事曆檢視/
├── server.js              # 後端伺服器
├── caldav-client.js       # CalDAV 客戶端
├── perfect-calendar.html  # 前端頁面
├── package.json           # 專案依賴
├── Dockerfile             # Docker 映像檔定義
├── docker-compose.yml     # Docker 容器編排
├── .dockerignore          # Docker 忽略檔案
├── env.example            # 環境變數範例
├── deploy.sh              # 部署腳本
└── README-Docker.md       # 部署說明

```

## 🚀 快速部署

### 1. 準備環境

```bash
# 檢查 Docker 是否安裝
docker --version
docker-compose --version

# 如果沒有安裝，請先安裝 Docker Desktop
```

### 2. 設定環境變數

```bash
# 複製環境變數範例
cp env.example .env

# 編輯環境變數
nano .env
```

### 3. 執行部署

```bash
# 使用部署腳本（推薦）
./deploy.sh

# 或手動執行
docker-compose up -d --build
```

## 🔧 環境變數設定

### .env 檔案內容

```env
# CalDAV 設定
CALDAV_URL=https://funlearnbar.synology.me:9102/caldav/
CALDAV_USERNAME=testacount
CALDAV_PASSWORD=testacount

# LINE LIFF 設定
LIFF_ID=1657746214-qp0y8NwZ
LIFF_REDIRECT_URI=http://funlearnbar.synology.me:8080/perfect-calendar.html

# 應用程式設定
NODE_ENV=production
PORT=8080
```

## 🌐 外網連線設定

### 1. 路由器 Port Forwarding

```
服務名稱：FLB-Calendar
外部埠：8080
內部 IP：192.168.1.x（您的 NAS IP）
內部埠：8080
通訊協定：TCP
```

### 2. 更新 LINE LIFF 設定

在 LINE Developers Console 中更新 LIFF 設定：

```
Endpoint URL: http://funlearnbar.synology.me:8080/perfect-calendar.html
```

### 3. 測試外網連線

```bash
# 測試本地連線
curl http://localhost:8080

# 測試外網連線
curl http://funlearnbar.synology.me:8080
```

## 🔧 常用 Docker 指令

```bash
# 啟動服務
docker-compose up -d

# 停止服務
docker-compose down

# 重新建立並啟動
docker-compose up -d --build

# 查看日誌
docker-compose logs -f

# 進入容器
docker exec -it flb-calendar sh

# 查看容器狀態
docker ps

# 停止所有容器
docker stop $(docker ps -q)

# 清理未使用的映像檔
docker system prune -a
```

## 📊 監控和維護

### 檢查服務狀態

```bash
# 檢查容器狀態
docker-compose ps

# 查看容器日誌
docker-compose logs -f flb-calendar

# 檢查資源使用
docker stats flb-calendar
```

### 備份和恢復

```bash
# 備份資料庫
cp teacher_cache.db teacher_cache.db.backup

# 備份設定檔
cp docker-compose.yml docker-compose.yml.backup
cp .env .env.backup
```

## 🛠️ 故障排除

### 問題 1：容器無法啟動

```bash
# 檢查日誌
docker-compose logs flb-calendar

# 檢查環境變數
docker-compose config

# 重新建立容器
docker-compose up -d --force-recreate
```

### 問題 2：無法連線 CalDAV

```bash
# 檢查環境變數
docker exec -it flb-calendar env | grep CALDAV

# 測試 CalDAV 連線
docker exec -it flb-calendar curl -k https://funlearnbar.synology.me:9102/caldav/
```

### 問題 3：LIFF 認證失敗

```bash
# 檢查 LIFF 設定
docker exec -it flb-calendar env | grep LIFF

# 確認 URL 正確
curl http://funlearnbar.synology.me:8080/perfect-calendar.html
```

## 📱 手機測試

1. 關閉 WiFi，使用行動網路
2. 在瀏覽器中輸入：`http://funlearnbar.synology.me:8080/perfect-calendar.html`
3. 應該能看到講師行事曆檢視系統

## 🔄 更新部署

```bash
# 拉取最新程式碼
git pull origin main

# 重新部署
./deploy.sh

# 或手動更新
docker-compose down
docker-compose up -d --build
```

## 📝 注意事項

1. **安全性**：建議使用反向代理處理 HTTPS
2. **備份**：定期備份資料庫和設定檔
3. **監控**：定期檢查容器狀態和日誌
4. **更新**：定期更新 Docker 映像檔和依賴

## 🆘 支援

如果遇到問題，請檢查：

1. Docker 和 Docker Compose 版本
2. 環境變數設定
3. 網路連線設定
4. 容器日誌

---

**部署完成後，您的講師行事曆檢視系統將在 `http://funlearnbar.synology.me:8080` 上運行！**
