#!/bin/bash

echo "🔍 檢查Railway部署環境..."

# 檢查Railway CLI
if command -v railway &> /dev/null; then
    echo "✅ Railway CLI 已安裝"
    railway --version
else
    echo "❌ Railway CLI 未安裝"
    echo "請執行: npm install -g @railway/cli"
    exit 1
fi

# 檢查登入狀態
if railway whoami &> /dev/null; then
    echo "✅ 已登入Railway"
    railway whoami
else
    echo "❌ 未登入Railway"
    echo "請執行: railway login"
    exit 1
fi

# 檢查必要文件
echo "📁 檢查必要文件..."

files=("liff-calendar.html" "package-railway.json" "server-railway.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
        exit 1
    fi
done

# 檢查可選文件
if [ -f "logo.jpg" ]; then
    echo "✅ logo.jpg 存在"
else
    echo "⚠️  logo.jpg 不存在（可選）"
fi

# 檢查Node.js版本
echo "📦 檢查Node.js版本..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js 版本: $NODE_VERSION"
    
    # 檢查版本是否大於18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo "✅ Node.js 版本符合要求 (>=18)"
    else
        echo "⚠️  Node.js 版本建議升級到18或更高"
    fi
else
    echo "❌ Node.js 未安裝"
    exit 1
fi

# 檢查npm版本
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm 版本: $NPM_VERSION"
else
    echo "❌ npm 未安裝"
    exit 1
fi

echo ""
echo "🎉 環境檢查完成！"
echo ""
echo "📋 下一步:"
echo "1. 執行 ./deploy-railway.sh 開始部署"
echo "2. 在Railway控制台中設定環境變數"
echo "3. 更新LIFF應用的Endpoint URL"
echo ""
echo "🔧 環境變數需要設定:"
echo "   - GOOGLE_SCRIPT_URL"
echo "   - GOOGLE_SCRIPT_COOKIE"
echo "   - LIFF_ID"
