# 🚀 AutoDocker 使用指南

## 問題修復完成！

我已經修復了以下問題：

### ✅ 已修復的問題
1. **GitHub 連結文字顏色** - 現在文字是深色的，清晰可見
2. **分析按鈕沒反應** - 添加了調試信息和錯誤處理
3. **文件上傳說明** - 更新為支援整個專案文件夾

## 🧪 測試步驟

### 1. 啟動應用
```bash
# 應用已經在運行
# 訪問: http://localhost:3001
```

### 2. 測試文件上傳

#### 方法一：使用示例文件
1. **進入示例目錄**
   ```bash
   cd examples/nodejs-app/
   ```

2. **選擇所有文件**
   - 選擇 `package.json` 和 `index.js`
   - 拖拽到上傳區域

3. **開始分析**
   - 點擊 "開始分析" 按鈕
   - 查看控制台輸出（F12 打開開發者工具）

#### 方法二：使用 Python 示例
1. **進入 Python 示例目錄**
   ```bash
   cd examples/python-app/
   ```

2. **選擇文件**
   - 選擇 `requirements.txt` 和 `app.py`
   - 拖拽到上傳區域

3. **開始分析**
   - 點擊 "開始分析" 按鈕

### 3. 調試信息

打開瀏覽器開發者工具（F12），您會看到：

```
開始分析，文件數量: 2
添加文件: package.json application/json
添加文件: index.js text/javascript
調用分析 API...
API 響應狀態: 200
分析結果: {language: "nodejs", framework: "express", ...}
```

## 🔧 如果分析仍然沒反應

### 檢查步驟：

1. **打開開發者工具**
   - 按 F12 打開瀏覽器開發者工具
   - 查看 Console 標籤

2. **檢查網絡請求**
   - 點擊 Network 標籤
   - 點擊 "開始分析"
   - 查看是否有 `/api/analyze` 請求

3. **檢查錯誤信息**
   - 查看 Console 中的錯誤信息
   - 查看 Network 中的響應狀態

### 常見問題解決：

#### 問題 1: 沒有文件被上傳
**解決方案**: 確保選擇了多個文件（package.json + 源代碼文件）

#### 問題 2: API 請求失敗
**解決方案**: 檢查控制台錯誤信息，可能是文件格式問題

#### 問題 3: 分析結果為空
**解決方案**: 確保上傳了正確的配置文件（package.json, requirements.txt 等）

## 📊 預期結果

### Node.js 專案分析結果
```json
{
  "language": "nodejs",
  "framework": "express",
  "version": "18",
  "packageManager": "npm",
  "startCmd": "npm start",
  "installCmd": "npm install"
}
```

### 生成的 Dockerfile 示例
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start command
CMD ["npm", "start"]
```

## 🎯 測試建議

1. **先測試簡單的 Node.js 專案**
   - 使用 `examples/nodejs-app/` 中的文件
   - 確保有 `package.json` 和源代碼文件

2. **檢查控制台輸出**
   - 所有調試信息都會顯示在控制台
   - 如果有錯誤，會顯示具體的錯誤信息

3. **逐步測試**
   - 先測試文件上傳
   - 再測試分析功能
   - 最後測試 Dockerfile 生成

## 🚨 如果仍有問題

請提供以下信息：
1. 瀏覽器控制台的錯誤信息
2. Network 標籤中的請求狀態
3. 您上傳的文件列表

這樣我可以進一步診斷問題！
