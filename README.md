# AutoDocker - 智能 Dockerfile 生成器

基於 [zbpack](https://github.com/zeabur/zbpack) 技術的智能 Dockerfile 生成工具，專注於為您的專案生成最優的容器化配置。

## 功能特色

- 🚀 **智能分析**: 自動識別專案語言、框架和依賴
- 📝 **自動生成**: 基於分析結果生成最優的 Dockerfile
- 💾 **下載使用**: 生成的 Dockerfile 可用於任何平台
- 🔧 **多語言支援**: 支援 Node.js、Python、Go、Java、Rust 等
- 📱 **響應式設計**: 支援桌面和移動設備
- 🎓 **學習價值**: 了解容器化最佳實踐

## 技術棧

- **前端**: Next.js 14, React 18, TypeScript
- **樣式**: Tailwind CSS
- **分析引擎**: 基於 zbpack 技術
- **部署平台**: Zeabur

## 快速開始

### 本地開發

1. 克隆專案
```bash
git clone <your-repo-url>
cd autoDocker
```

2. 安裝依賴
```bash
npm install
```

3. 啟動開發服務器
```bash
npm run dev
```

4. 打開瀏覽器訪問 `http://localhost:3000`

### 部署到 Zeabur

1. 將專案推送到 GitHub
2. 在 Zeabur 平台連接 GitHub 倉庫
3. 選擇自動部署
4. 等待部署完成

## 使用方式

### 1. 上傳專案文件
- 拖拽文件到上傳區域
- 或提供 GitHub 倉庫連結

### 2. 智能分析
- 系統自動分析專案結構
- 識別語言、框架和依賴

### 3. 生成 Dockerfile
- 基於分析結果生成最優 Dockerfile
- 支援多種語言和框架

### 4. 下載使用
- 預覽生成的 Dockerfile
- 複製或下載到本地使用
- 適用於任何 Docker 環境

## 支援的語言和框架

### Node.js
- Next.js
- React
- Vue.js
- Express
- NestJS

### Python
- Django
- Flask
- FastAPI
- Streamlit

### Go
- Gin
- Echo
- Fiber
- 標準庫

### Java
- Spring Boot
- Maven 專案
- Gradle 專案

### Rust
- Actix Web
- Rocket
- Warp
- 標準庫

## API 端點

### POST /api/analyze
分析上傳的專案文件

**請求**: FormData with files
**響應**: 分析結果對象

### POST /api/generate-dockerfile
基於分析結果生成 Dockerfile

**請求**: JSON with analysisResult
**響應**: Dockerfile 內容

## 開發指南

### 專案結構
```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── globals.css        # 全局樣式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主頁面
├── components/            # React 組件
│   ├── FileUploader.tsx   # 文件上傳組件
│   ├── ProjectAnalyzer.tsx # 專案分析組件
│   ├── DockerfilePreview.tsx # Dockerfile 預覽
│   └── ZeaburDeploy.tsx   # Zeabur 部署組件
├── public/                # 靜態資源
└── README.md              # 專案說明
```

### 添加新的語言支援

1. 在 `app/api/analyze/route.ts` 中添加檢測邏輯
2. 在 `app/api/generate-dockerfile/route.ts` 中添加 Dockerfile 模板
3. 更新前端顯示邏輯

### 自定義 Dockerfile 模板

在 `app/api/generate-dockerfile/route.ts` 中修改對應的生成函數：

```typescript
function generateCustomDockerfile(analysis: any): string {
  // 自定義 Dockerfile 生成邏輯
  return `FROM custom-image
WORKDIR /app
# ... 其他指令
`
}
```

## 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 授權

本專案基於 MIT 授權 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 致謝

- [zbpack](https://github.com/zeabur/zbpack) - 核心分析引擎
- [Zeabur](https://zeabur.com) - 部署平台
- [Next.js](https://nextjs.org) - React 框架
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
