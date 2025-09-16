#!/bin/bash

# 講師行事曆檢視應用程式啟動腳本

echo "🚀 啟動講師行事曆檢視應用程式..."

# 檢查 Node.js 是否已安裝
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未找到 Node.js，請先安裝 Node.js 14+"
    echo "下載地址：https://nodejs.org/"
    exit 1
fi

# 檢查 npm 是否已安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤：未找到 npm，請先安裝 npm"
    exit 1
fi

# 檢查是否已安裝依賴
if [ ! -d "node_modules" ]; then
    echo "📦 安裝依賴套件..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依賴安裝失敗"
        exit 1
    fi
fi

# 啟動應用程式
echo "🌟 啟動服務器..."
echo "📍 應用程式將在 http://localhost:3000 運行"
echo "📱 在手機瀏覽器中打開此網址即可使用"
echo ""
echo "按 Ctrl+C 停止服務器"
echo ""

npm start
