# 部署指南

## 部署到 Zeabur

### 方法一：直接部署（推薦）

1. **準備專案**
   ```bash
   # 確保所有文件已提交
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **在 Zeabur 部署**
   - 訪問 [Zeabur Dashboard](https://dash.zeabur.com)
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub"
   - 選擇你的倉庫
   - 選擇 "Dockerfile" 部署方式
   - 點擊 "Deploy"

3. **配置環境變量**（如需要）
   - 在專案設置中添加必要的環境變量
   - 例如：`NODE_ENV=production`

### 方法二：使用 Zeabur CLI

1. **安裝 Zeabur CLI**
   ```bash
   npm install -g @zeabur/cli
   ```

2. **登入 Zeabur**
   ```bash
   zeabur login
   ```

3. **部署專案**
   ```bash
   zeabur deploy
   ```

## 部署到其他平台

### Vercel

1. **安裝 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **部署**
   ```bash
   vercel --prod
   ```

### Railway

1. **連接 GitHub 倉庫**
   - 訪問 [Railway](https://railway.app)
   - 連接你的 GitHub 倉庫
   - 選擇自動部署

### Docker 本地部署

1. **構建鏡像**
   ```bash
   docker build -t autodocker .
   ```

2. **運行容器**
   ```bash
   docker run -p 3000:3000 autodocker
   ```

## 環境配置

### 必需環境變量

```bash
# 生產環境
NODE_ENV=production
PORT=3000
```

### 可選環境變量

```bash
# 自定義配置
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## 性能優化

### 1. 啟用 Gzip 壓縮
在 `next.config.js` 中添加：
```javascript
const nextConfig = {
  compress: true,
  // ... 其他配置
}
```

### 2. 啟用 CDN
- 在 Zeabur 中啟用 CDN 加速
- 配置靜態資源緩存

### 3. 數據庫連接（如需要）
```bash
# 添加數據庫環境變量
DATABASE_URL=your-database-url
```

## 監控和日誌

### 1. 健康檢查
訪問 `/api/health` 端點檢查服務狀態

### 2. 日誌監控
- 在 Zeabur Dashboard 中查看實時日誌
- 設置日誌告警

### 3. 性能監控
- 使用 Zeabur 內建的性能監控
- 配置自定義指標

## 故障排除

### 常見問題

1. **構建失敗**
   - 檢查 Node.js 版本兼容性
   - 確保所有依賴已正確安裝

2. **部署失敗**
   - 檢查 Dockerfile 語法
   - 確認端口配置正確

3. **運行時錯誤**
   - 檢查環境變量配置
   - 查看應用日誌

### 調試步驟

1. **本地測試**
   ```bash
   npm run build
   npm start
   ```

2. **檢查構建日誌**
   - 在 Zeabur Dashboard 中查看構建日誌
   - 確認沒有錯誤信息

3. **驗證部署**
   - 訪問部署的 URL
   - 測試主要功能

## 安全配置

### 1. HTTPS
- Zeabur 自動提供 HTTPS
- 確保所有請求使用 HTTPS

### 2. 環境變量安全
- 不要在代碼中硬編碼敏感信息
- 使用環境變量存儲配置

### 3. 依賴安全
- 定期更新依賴包
- 使用 `npm audit` 檢查安全漏洞

## 擴展部署

### 1. 多環境部署
- 設置開發、測試、生產環境
- 使用不同的環境變量配置

### 2. 自動化部署
- 配置 GitHub Actions
- 設置自動部署流程

### 3. 負載均衡
- 使用 Zeabur 的負載均衡功能
- 配置多實例部署
