#!/bin/bash

echo "🚀 啟動FLB講師行事曆LIFF應用..."

# 檢查Node.js是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤: 請先安裝Node.js"
    exit 1
fi

# 檢查npm是否安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤: 請先安裝npm"
    exit 1
fi

# 安裝依賴
echo "📦 安裝依賴套件..."
npm install --prefix . express axios sqlite3

# 創建public目錄
mkdir -p public

# 複製LIFF HTML文件到public目錄
cp liff-calendar.html public/index.html

# 複製logo文件
if [ -f "logo.jpg" ]; then
    cp logo.jpg public/
    echo "✅ Logo文件已複製"
else
    echo "⚠️  警告: logo.jpg 文件不存在"
fi

# 啟動講師API服務器
echo "🔧 啟動講師API服務器..."
node teacher-api.js &

# 等待API服務器啟動
sleep 3

# 檢查API服務器是否運行
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ 講師API服務器已啟動 (端口: 3001)"
else
    echo "❌ 講師API服務器啟動失敗"
    exit 1
fi

# 啟動主服務器
echo "🌐 啟動主服務器..."
node server.js &

# 等待主服務器啟動
sleep 3

# 檢查主服務器是否運行
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 主服務器已啟動 (端口: 3000)"
    echo ""
    echo "🎉 FLB講師行事曆LIFF應用已成功啟動！"
    echo ""
    echo "📱 LIFF應用網址: http://localhost:3000"
    echo "🔧 講師API: http://localhost:3001"
    echo "📊 健康檢查: http://localhost:3001/api/health"
    echo ""
    echo "💡 使用說明:"
    echo "1. 在LINE Developers Console中創建LIFF應用"
    echo "2. 將LIFF ID更新到 liff-calendar.html 中的 liffId 變數"
    echo "3. 將LIFF應用網址設為: http://localhost:3000"
    echo "4. 在LINE中測試LIFF應用"
    echo ""
    echo "🛑 按 Ctrl+C 停止服務器"
else
    echo "❌ 主服務器啟動失敗"
    exit 1
fi

# 等待用戶中斷
wait
