FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製所有檔案
COPY . .

# 暴露端口
EXPOSE 8080

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=8080

# 啟動應用程式
CMD ["npm", "start"]
