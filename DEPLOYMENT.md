# AutoDocker 部署指南

## 🚀 部署選項

AutoDocker 支援多種部署方式，您可以選擇最適合的平台：

### 1. Vercel 部署 (推薦)

**優點：** 零配置、自動擴展、全球 CDN、免費額度充足

**設定步驟：**

1. 在 [Vercel](https://vercel.com) 註冊帳號
2. 連接 GitHub 倉庫
3. 設定環境變數：
   ```
   VERCEL_TOKEN=your_vercel_token
   ORG_ID=your_org_id
   PROJECT_ID=your_project_id
   ```

**部署命令：**
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 2. Railway 部署

**優點：** 支援 Docker、簡單易用、自動部署

**設定步驟：**

1. 在 [Railway](https://railway.app) 註冊帳號
2. 連接 GitHub 倉庫
3. 設定環境變數：
   ```
   RAILWAY_TOKEN=your_railway_token
   ```

**部署命令：**
```bash
# 安裝 Railway CLI
npm install -g @railway/cli

# 登入並部署
railway login
railway up
```

### 3. Docker 部署

**優點：** 完全控制、可移植性、支援任何雲端平台

**本地測試：**
```bash
# 建置映像
docker build -t autodocker .

# 運行容器
docker run -p 3000:3000 autodocker
```

**使用 Docker Compose：**
```bash
# 啟動服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### 4. 傳統 VPS 部署

**適用於：** DigitalOcean、Linode、AWS EC2 等

**部署步驟：**

1. 準備伺服器 (Ubuntu 20.04+)
2. 安裝必要軟體：
   ```bash
   # 安裝 Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # 安裝 Go
   wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
   sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
   echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

   # 安裝 zbpack
   git clone https://github.com/zeabur/zbpack.git
   cd zbpack
   go build -o zbpack ./cmd/zbpack
   sudo mv zbpack /usr/local/bin/
   ```

3. 部署應用程式：
   ```bash
   # 克隆倉庫
   git clone https://github.com/120061203/autoDocker.git
   cd autoDocker

   # 安裝依賴
   npm ci

   # 建置應用程式
   npm run build

   # 使用 PM2 運行
   npm install -g pm2
   pm2 start npm --name "autodocker" -- start
   pm2 save
   pm2 startup
   ```

## 🔧 環境變數設定

### 必要環境變數

```bash
NODE_ENV=production
PORT=3000
```

### 可選環境變數

```bash
# 自訂 API 端點
NEXT_PUBLIC_API_URL=https://your-domain.com

# 快取設定
CACHE_TTL=3600

# 日誌等級
LOG_LEVEL=info
```

## 📊 監控和維護

### 健康檢查

所有部署方式都包含健康檢查端點：
```
GET /api/health
```

### 日誌監控

**Vercel：** 在 Dashboard 查看函數日誌
**Railway：** 在 Dashboard 查看部署日誌
**Docker：** 使用 `docker logs` 查看日誌
**VPS：** 使用 `pm2 logs` 查看日誌

### 效能監控

建議設定以下監控：
- CPU 使用率
- 記憶體使用率
- 響應時間
- 錯誤率

## 🔄 自動部署

### GitHub Actions

當您推送代碼到 `main` 分支時，會自動觸發部署：

1. **Vercel 部署：** 自動部署到 Vercel
2. **Railway 部署：** 自動部署到 Railway
3. **Docker 映像：** 自動建置並推送到 Docker Hub

### 手動部署

```bash
# 部署到 Vercel
vercel --prod

# 部署到 Railway
railway up

# 建置 Docker 映像
docker build -t autodocker .
docker push autodocker
```

## 🛠️ 故障排除

### 常見問題

1. **zbpack 未安裝**
   ```bash
   # 檢查 zbpack 是否安裝
   zbpack --version
   
   # 如果未安裝，手動安裝
   git clone https://github.com/zeabur/zbpack.git
   cd zbpack && go build -o zbpack ./cmd/zbpack
   sudo mv zbpack /usr/local/bin/
   ```

2. **端口衝突**
   ```bash
   # 檢查端口使用情況
   lsof -i :3000
   
   # 終止佔用端口的程序
   kill -9 <PID>
   ```

3. **記憶體不足**
   ```bash
   # 增加 Node.js 記憶體限制
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

### 日誌查看

```bash
# Docker 日誌
docker logs <container_id>

# PM2 日誌
pm2 logs autodocker

# 系統日誌
journalctl -u your-service-name
```

## 📈 效能優化

### 生產環境優化

1. **啟用 gzip 壓縮**
2. **設定適當的快取標頭**
3. **使用 CDN 加速靜態資源**
4. **監控和調整記憶體使用**

### 擴展性考量

- **水平擴展：** 使用負載均衡器
- **垂直擴展：** 增加伺服器資源
- **快取策略：** 實作 Redis 快取
- **資料庫：** 考慮使用外部資料庫

## 🔒 安全考量

1. **環境變數：** 不要在代碼中硬編碼敏感資訊
2. **HTTPS：** 確保所有通訊都使用 HTTPS
3. **防火牆：** 設定適當的防火牆規則
4. **定期更新：** 保持依賴套件最新
5. **監控：** 設定安全監控和警報

## 📞 支援

如果您在部署過程中遇到問題，請：

1. 檢查 [GitHub Issues](https://github.com/120061203/autoDocker/issues)
2. 查看日誌輸出
3. 確認環境變數設定
4. 檢查網路連接和防火牆設定