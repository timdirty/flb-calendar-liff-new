#!/bin/bash

# FLB 講師行事曆檢視系統 Docker 部署腳本

echo "🚀 開始部署 FLB 講師行事曆檢視系統..."

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

# 檢查環境變數檔案
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 檔案，正在從 env.example 複製..."
    cp env.example .env
    echo "📝 請編輯 .env 檔案設定正確的環境變數"
fi

# 停止現有容器
echo "🛑 停止現有容器..."
docker-compose down

# 建立映像檔
echo "🔨 建立 Docker 映像檔..."
docker build -t flb-calendar .

# 啟動服務
echo "🚀 啟動服務..."
docker-compose up -d

# 檢查容器狀態
echo "📊 檢查容器狀態..."
docker-compose ps

# 顯示日誌
echo "📋 顯示容器日誌..."
docker-compose logs -f --tail=50

echo "✅ 部署完成！"
echo "🌐 服務網址: http://localhost:8080"
echo "📱 LIFF 網址: http://funlearnbar.synology.me:8080/perfect-calendar.html"
