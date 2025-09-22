# Docker 網路問題解決方案

## 問題描述
Docker 建置時出現 TLS handshake timeout 錯誤，無法從 Docker Hub 下載基礎映像檔。

## 解決方案

### 方案 1: 使用穩定版 Dockerfile
```bash
# 使用穩定版 Dockerfile 建置
docker build -f Dockerfile.stable -t flb-calendar-stable .
```

### 方案 2: 設定 Docker 鏡像源
創建或編輯 `~/.docker/daemon.json`:
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

然後重啟 Docker 服務。

### 方案 3: 使用本地建置
```bash
# 直接使用 Node.js 運行
npm install
npm start
```

### 方案 4: 使用 Railway 的內建建置
Railway 通常會自動處理網路問題，可以嘗試重新部署。

## 推薦步驟

1. 首先嘗試使用穩定版 Dockerfile:
   ```bash
   ./deploy-stable.sh
   ```

2. 如果仍然失敗，使用本地運行:
   ```bash
   npm install
   npm start
   ```

3. 在 Railway 上重新部署，通常會自動解決網路問題。

## 監控和除錯

```bash
# 查看 Docker 日誌
docker logs flb-calendar-container

# 查看系統資源
docker stats

# 清理 Docker 快取
docker system prune -a
```
