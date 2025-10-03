# 使用官方 Node.js 18 Alpine 作為基礎映像
FROM node:18-alpine AS base

# 安裝必要的系統依賴
RUN apk add --no-cache \
    git \
    go \
    build-base \
    wget \
    curl \
    && rm -rf /var/cache/apk/*

# 設定 Go 環境
ENV GOPATH=/go
ENV PATH=$GOPATH/bin:/usr/local/go/bin:$PATH

# 安裝 zbpack (使用官方版本以確保兼容性)
RUN wget -O /usr/local/bin/zbpack https://github.com/zbpack/zbpack/releases/latest/download/zbpack_linux_amd64 \
    && chmod +x /usr/local/bin/zbpack \
    && zbpack --version

# 建立應用程式目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production && npm cache clean --force

# 複製應用程式原始碼
COPY . .

# 建置應用程式
RUN npm run build

# 建立非 root 使用者
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 變更檔案擁有者
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 3000

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 啟動應用程式
CMD ["npm", "start"]