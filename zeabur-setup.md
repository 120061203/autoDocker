# Zeabur 部署指南

## 🚀 為什麼選擇 Zeabur？

- ✅ **完全支持 Docker**：原生支持 Dockerfile 部署
- ✅ **支持 Go 應用程式**：可以安裝 `zbpack`
- ✅ **免費額度**：每月有免費使用額度
- ✅ **自動部署**：連接 GitHub 後自動部署
- ✅ **簡單易用**：一鍵部署，無需複雜配置

## 📋 部署步驟

### 1. 註冊 Zeabur 帳號
- 訪問 [zeabur.com](https://zeabur.com)
- 使用 GitHub 帳號登入

### 2. 創建新專案
- 點擊 "New Project"
- 選擇 "Import from GitHub"
- 選擇您的 `autoDocker` 倉庫

### 3. 配置部署
- Zeabur 會自動檢測到 `Dockerfile`
- 選擇 "Docker" 部署方式
- 設置環境變數（如需要）

### 4. 部署完成
- 點擊 "Deploy" 開始部署
- 等待部署完成，獲得專案 URL

## 🔧 環境變數設置

在 Zeabur 專案設置中添加以下環境變數：

```
NODE_ENV=production
PORT=3000
```

## 📁 專案結構

確保您的專案包含以下文件：

```
autoDocker/
├── Dockerfile          # Docker 配置
├── .dockerignore       # Docker 忽略文件
├── package.json        # Node.js 依賴
├── next.config.js      # Next.js 配置
└── app/               # Next.js 應用程式
```

## 🐳 Docker 配置

我們的 `Dockerfile` 已經配置好：
- 使用 Node.js 18 Alpine 基礎映像
- 安裝 `zbpack` Go 應用程式
- 設置工作目錄和依賴安裝
- 配置生產環境啟動

## 🚀 部署優勢

1. **完全支持 `zbpack`**：Zeabur 支持 Go 應用程式，可以正常運行 `zbpack`
2. **Docker 原生支持**：使用我們準備好的 Dockerfile
3. **自動擴展**：根據流量自動調整資源
4. **全球 CDN**：快速訪問速度
5. **免費額度**：每月有免費使用額度

## 🔍 故障排除

### 如果部署失敗：
1. 檢查 `Dockerfile` 語法
2. 確認所有依賴都在 `package.json` 中
3. 檢查環境變數設置
4. 查看 Zeabur 部署日誌

### 如果 `zbpack` 無法運行：
1. 確認 Dockerfile 中 Go 安裝正確
2. 檢查 `zbpack` 二進制文件權限
3. 查看應用程式日誌

## 📞 支援

- Zeabur 文檔：https://docs.zeabur.com
- 社群支援：https://discord.gg/zeabur
- GitHub Issues：在您的倉庫中創建 issue

## 🎉 完成！

部署完成後，您將獲得一個類似 `https://your-project.zeabur.app` 的 URL，您的 AutoDocker 應用程式就可以正常運行了！
