#!/bin/bash

# 講師報表系統自動化測試腳本
# 使用方法: ./run-tests.sh [quick|full]

echo "🧪 講師報表系統自動化測試"
echo "================================"

# 檢查Node.js和npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝，請先安裝 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安裝，請先安裝 npm"
    exit 1
fi

# 檢查puppeteer是否安裝
if ! npm list puppeteer &> /dev/null; then
    echo "📦 安裝 Puppeteer..."
    npm install puppeteer
fi

# 檢查服務器是否運行
echo "🔍 檢查服務器狀態..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ 服務器正在運行"
else
    echo "❌ 服務器未運行，請先啟動服務器"
    echo "   運行: npm start 或 node server.js"
    exit 1
fi

# 根據參數選擇測試類型
case "${1:-quick}" in
    "quick")
        echo "🚀 執行快速測試..."
        node quick-test-teacher-report.js
        ;;
    "full")
        echo "🚀 執行完整測試..."
        node test-teacher-report-automation.js
        ;;
    *)
        echo "使用方法: $0 [quick|full]"
        echo "  quick - 快速測試（預設）"
        echo "  full  - 完整測試（包含截圖和詳細報告）"
        exit 1
        ;;
esac

echo "✅ 測試完成"
