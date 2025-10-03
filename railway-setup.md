# Railway 部署指南

## 為什麼選擇 Railway？

1. **支持 Docker**：可以運行包含 `zbpack` 的 Docker 容器
2. **支持 Go**：原生支持 Go 應用程式
3. **簡單部署**：一鍵部署，無需複雜配置
4. **免費額度**：提供免費使用額度

## 部署步驟

### 1. 準備 Railway 配置

Railway 會自動檢測到 `railway.json` 配置文件。

### 2. 連接 GitHub

1. 訪問 [Railway.app](https://railway.app)
2. 使用 GitHub 登入
3. 點擊 "New Project"
4. 選擇 "Deploy from GitHub repo"
5. 選擇您的 `autoDocker` 倉庫

### 3. 自動部署

Railway 會：
- 自動檢測到 `railway.json` 配置
- 使用 Docker 構建（因為有 `Dockerfile`）
- 安裝 `zbpack` 並運行應用程式

### 4. 環境變量（如需要）

在 Railway 儀表板中設置任何必要的環境變量。

## 優勢

- ✅ 支持 `zbpack`（Go 應用程式）
- ✅ 支持 Docker 容器
- ✅ 自動 HTTPS
- ✅ 全球 CDN
- ✅ 簡單的域名管理
- ✅ 免費額度充足

## 與 Vercel 的比較

| 功能 | Vercel | Railway |
|------|--------|---------|
| Node.js 支持 | ✅ 優秀 | ✅ 支持 |
| Go 支持 | ❌ 有限 | ✅ 原生 |
| Docker 支持 | ❌ 不支持 | ✅ 完全支持 |
| 部署速度 | ✅ 很快 | ✅ 快 |
| 免費額度 | ✅ 充足 | ✅ 充足 |
| 域名管理 | ✅ 簡單 | ✅ 簡單 |

## 推薦使用 Railway

對於包含 `zbpack` 的應用程式，Railway 是更好的選擇。
