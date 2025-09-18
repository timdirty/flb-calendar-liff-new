#!/bin/bash

# 講師行事曆檢視 - 本地測試啟動腳本

echo "🚀 啟動講師行事曆檢視本地測試環境"
echo "=================================="

# 檢查 Python 是否安裝
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 未安裝，請先安裝 Python 3"
    exit 1
fi

# 檢查 pip 是否安裝
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 未安裝，請先安裝 pip3"
    exit 1
fi

# 安裝依賴
echo "📦 安裝 Python 依賴..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ 依賴安裝失敗"
    exit 1
fi

echo "✅ 依賴安裝完成"

# 啟動 Flask 伺服器
echo "🌐 啟動 Flask 伺服器..."
echo "📅 行事曆頁面: http://localhost:5000/perfect-calendar.html"
echo "🔍 調試信息: http://localhost:5000/api/debug"
echo "❤️ 健康檢查: http://localhost:5000/api/health"
echo ""
echo "按 Ctrl+C 停止伺服器"
echo ""

# 在背景啟動伺服器
python3 local_server.py &
SERVER_PID=$!

# 等待伺服器啟動
sleep 3

# 檢查伺服器是否正常啟動
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ 伺服器啟動成功"
    
    # 執行篩選功能測試
    echo ""
    echo "🧪 執行篩選功能測試..."
    python3 test_filtering.py
    
    echo ""
    echo "🎉 本地測試環境已準備就緒！"
    echo "📅 請在瀏覽器中開啟: http://localhost:5000/perfect-calendar.html"
    echo ""
    echo "按 Ctrl+C 停止伺服器"
    
    # 等待用戶中斷
    wait $SERVER_PID
else
    echo "❌ 伺服器啟動失敗"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
