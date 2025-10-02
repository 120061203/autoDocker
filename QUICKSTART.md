# 🚀 AutoDocker 快速開始指南

## 立即體驗

### 1. 本地開發

```bash
# 克隆專案
git clone <your-repo-url>
cd autoDocker

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

訪問 `http://localhost:3000` 開始使用！

### 2. 測試功能

#### 使用示例專案

我們提供了示例專案供測試：

**Node.js 示例**
```bash
# 上傳 examples/nodejs-app/ 目錄中的文件
# 包含：package.json, index.js
```

**Python 示例**
```bash
# 上傳 examples/python-app/ 目錄中的文件
# 包含：requirements.txt, app.py
```

#### 測試步驟

1. **上傳文件**
   - 拖拽示例專案文件到上傳區域
   - 或點擊選擇文件

2. **開始分析**
   - 點擊 "開始分析" 按鈕
   - 等待分析完成

3. **查看結果**
   - 查看分析結果（語言、框架、版本等）
   - 預覽生成的 Dockerfile

4. **下載使用**
   - 複製 Dockerfile 內容
   - 或下載 Dockerfile 文件
   - 在您的專案中使用

## 使用生成的 Dockerfile

### 方法一：本地 Docker 構建

```bash
# 將生成的 Dockerfile 保存到您的專案目錄
# 構建 Docker 鏡像
docker build -t your-app .

# 運行容器
docker run -p 3000:3000 your-app
```

### 方法二：部署到雲端平台

生成的 Dockerfile 可以用於任何支援 Docker 的平台：

- **Docker Hub**: 推送到 Docker Hub 並部署
- **AWS ECS**: 使用 ECS 部署容器
- **Google Cloud Run**: 部署到 Cloud Run
- **Azure Container Instances**: 部署到 ACI
- **Kubernetes**: 部署到任何 K8s 集群

## 功能演示

### 支援的專案類型

| 語言 | 框架 | 檢測文件 | 生成 Dockerfile |
|------|------|----------|----------------|
| Node.js | Express, Next.js, React | package.json | ✅ |
| Python | Flask, Django | requirements.txt | ✅ |
| Go | 標準庫, Gin | go.mod | ✅ |
| Java | Spring Boot | pom.xml | ✅ |
| Rust | 標準庫, Actix | Cargo.toml | ✅ |

### 分析結果示例

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

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
```

## 故障排除

### 常見問題

1. **分析失敗**
   - 確保上傳了正確的專案文件
   - 檢查文件格式是否支援

2. **Dockerfile 生成失敗**
   - 檢查專案結構是否完整
   - 確認依賴文件存在

3. **部署失敗**
   - 檢查 Zeabur 連接
   - 確認環境變量配置

### 調試步驟

1. **檢查控制台**
   - 打開瀏覽器開發者工具
   - 查看 Network 和 Console 標籤

2. **檢查 API 響應**
   - 訪問 `/api/health` 檢查服務狀態
   - 查看 API 錯誤信息

3. **本地測試**
   ```bash
   # 測試 API
   curl http://localhost:3000/api/health
   
   # 測試分析
   curl -X POST http://localhost:3000/api/analyze \
     -F "files=@examples/nodejs-app/package.json"
   ```

## 進階功能

### 自定義 Dockerfile 模板

在 `app/api/generate-dockerfile/route.ts` 中修改模板：

```typescript
function generateCustomDockerfile(analysis: any): string {
  return `# 自定義 Dockerfile 模板
FROM custom-base-image
WORKDIR /app
# ... 其他指令
`
}
```

### 添加新的語言支援

1. 在 `app/api/analyze/route.ts` 中添加檢測邏輯
2. 在 `app/api/generate-dockerfile/route.ts` 中添加生成函數
3. 更新前端顯示邏輯

### 集成實際的 zbpack

1. 安裝 zbpack 二進制文件
2. 修改 API 路由調用 zbpack
3. 解析 zbpack 輸出結果

## 貢獻

1. Fork 專案
2. 創建功能分支
3. 提交更改
4. 開啟 Pull Request

## 支援

- 📧 問題回報：[GitHub Issues](https://github.com/your-repo/issues)
- 📚 文檔：[README.md](README.md)
- 🚀 部署：[DEPLOYMENT.md](DEPLOYMENT.md)

---

**享受使用 AutoDocker！** 🎉
