#!/bin/bash

echo "🚀 開始穩定部署..."

# 檢查是否有 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    exit 1
fi

# 清理舊的映像檔
echo "🧹 清理舊的映像檔..."
docker system prune -f

# 使用穩定的 Dockerfile
echo "📦 使用穩定版 Dockerfile 建置映像檔..."
docker build -f Dockerfile.stable -t flb-calendar-stable .

if [ $? -eq 0 ]; then
    echo "✅ 映像檔建置成功！"
    
    # 停止舊的容器
    echo "🛑 停止舊的容器..."
    docker stop flb-calendar-container 2>/dev/null || true
    docker rm flb-calendar-container 2>/dev/null || true
    
    # 啟動新容器
    echo "🚀 啟動新容器..."
    docker run -d \
        --name flb-calendar-container \
        -p 8080:8080 \
        --restart unless-stopped \
        flb-calendar-stable
    
    if [ $? -eq 0 ]; then
        echo "✅ 容器啟動成功！"
        echo "🌐 應用程式運行在: http://localhost:8080"
        echo "📊 查看日誌: docker logs -f flb-calendar-container"
    else
        echo "❌ 容器啟動失敗"
        exit 1
    fi
else
    echo "❌ 映像檔建置失敗"
    exit 1
fi
