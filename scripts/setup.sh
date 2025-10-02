#!/bin/bash

# AutoDocker 設置腳本

echo "🚀 設置 AutoDocker 專案..."

# 檢查 Node.js 版本
echo "📋 檢查 Node.js 版本..."
node_version=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js 版本: $node_version"
else
    echo "❌ 請先安裝 Node.js (https://nodejs.org/)"
    exit 1
fi

# 檢查 npm 版本
echo "📋 檢查 npm 版本..."
npm_version=$(npm -v 2>/dev/null)
if [ [ $? -eq 0 ]; then
    echo "✅ npm 版本: $npm_version"
else
    echo "❌ npm 未安裝"
    exit 1
fi

# 安裝依賴
echo "📦 安裝專案依賴..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 依賴安裝成功"
else
    echo "❌ 依賴安裝失敗"
    exit 1
fi

# 檢查 TypeScript 編譯
echo "🔧 檢查 TypeScript 編譯..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript 編譯檢查通過"
else
    echo "⚠️  TypeScript 編譯有警告，但可以繼續"
fi

# 構建專案
echo "🏗️  構建專案..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 專案構建成功"
else
    echo "❌ 專案構建失敗"
    exit 1
fi

echo ""
echo "🎉 AutoDocker 設置完成！"
echo ""
echo "📝 下一步："
echo "1. 運行 'npm run dev' 啟動開發服務器"
echo "2. 訪問 http://localhost:3000"
echo "3. 上傳專案文件測試功能"
echo ""
echo "🚀 部署到 Zeabur："
echo "1. 將代碼推送到 GitHub"
echo "2. 在 Zeabur 連接 GitHub 倉庫"
echo "3. 選擇 Dockerfile 部署方式"
echo ""
echo "📚 更多信息請查看 README.md 和 DEPLOYMENT.md"
