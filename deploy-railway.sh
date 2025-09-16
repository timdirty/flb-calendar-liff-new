#!/bin/bash

echo "🚀 部署FLB講師行事曆LIFF應用到Railway..."

# 檢查Railway CLI是否安裝
if ! command -v railway &> /dev/null; then
    echo "❌ 錯誤: 請先安裝Railway CLI"
    echo "請執行: npm install -g @railway/cli"
    exit 1
fi

# 檢查是否已登入Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 請先登入Railway..."
    railway login
fi

# 創建public目錄
echo "📁 創建public目錄..."
mkdir -p public

# 複製LIFF HTML文件到public目錄
echo "📄 複製LIFF應用文件..."
cp liff-calendar.html public/index.html

# 複製logo文件
if [ -f "logo.jpg" ]; then
    cp logo.jpg public/
    echo "✅ Logo文件已複製"
else
    echo "⚠️  警告: logo.jpg 文件不存在"
fi

# 複製package.json
echo "📦 設置package.json..."
cp package-railway.json package.json

# 複製服務器文件
echo "🔧 設置服務器文件..."
cp server-railway.js server.js

# 創建.env.example文件
echo "⚙️  創建環境變數範例文件..."
cat > .env.example << EOF
# Railway環境變數設定
NODE_ENV=production
PORT=3000

# Google Apps Script API設定
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_SCRIPT_COOKIE=YOUR_COOKIE_VALUE

# LIFF設定
LIFF_ID=YOUR_LIFF_ID
EOF

echo "📋 環境變數範例文件已創建: .env.example"
echo ""
echo "⚠️  重要: 請在Railway控制台中設定以下環境變數:"
echo "   - GOOGLE_SCRIPT_URL: 您的Google Apps Script URL"
echo "   - GOOGLE_SCRIPT_COOKIE: 您的Cookie值"
echo "   - LIFF_ID: 您的LIFF ID"
echo ""

# 初始化Railway專案（如果尚未初始化）
if [ ! -f "railway.json" ]; then
    echo "🚂 初始化Railway專案..."
    railway init
fi

# 部署到Railway
echo "🚀 開始部署到Railway..."
railway up

# 獲取部署URL
echo "🌐 獲取部署URL..."
DEPLOY_URL=$(railway domain)

if [ ! -z "$DEPLOY_URL" ]; then
    echo ""
    echo "🎉 部署成功！"
    echo "🌐 應用網址: https://$DEPLOY_URL"
    echo "📊 健康檢查: https://$DEPLOY_URL/api/health"
    echo ""
    echo "📱 下一步:"
    echo "1. 在LINE Developers Console中更新LIFF應用的Endpoint URL為: https://$DEPLOY_URL"
    echo "2. 在Railway控制台中設定環境變數"
    echo "3. 在LINE中測試LIFF應用"
    echo ""
    echo "🔧 管理命令:"
    echo "  - 查看日誌: railway logs"
    echo "  - 重新部署: railway up"
    echo "  - 查看狀態: railway status"
else
    echo "❌ 無法獲取部署URL，請檢查部署狀態"
    railway status
fi
