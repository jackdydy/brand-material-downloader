# 使用 Playwright 官方鏡像（已預裝 Chromium 和所有依賴）
FROM mcr.microsoft.com/playwright:v1.59.1-noble

# 設置工作目錄
WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm@10.4.1

# 複製 package.json 和 lock file
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# 安裝依賴
RUN pnpm install --frozen-lockfile

# 複製所有源代碼
COPY . .

# 構建應用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 設置環境變量
ENV NODE_ENV=production
ENV PORT=3000

# 啟動應用
CMD ["pnpm", "start"]
