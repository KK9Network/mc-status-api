# Minecraft Server Status API

一个用于查询 **Minecraft Java 版** 与 **基岩版** 服务器信息的 API。

## 📦 安装

git clone https://github.com/KK9Network/mc-status-api.git
cd mc-status-api
npm install

## 🚀 运行

### 普通方式
npm start

### 开发模式
npm run dev

### Docker 运行
docker compose up -d

## ⚙️ 配置环境变量

本项目支持使用 `.env` 文件配置运行参数。  
你可以先复制一份 `.env.example`：

cp .env.example .env

然后根据需要修改内容，例如：

PORT=3000
RATE_LIMIT=60
CACHE_TTL=60

- `PORT` → 服务运行端口  
- `RATE_LIMIT` → 每分钟最大请求次数 (限流)  
- `CACHE_TTL` → 默认缓存时间 (秒)  

## 🔌 API 接口

### 1. 查询服务器状态
GET /api/status/:address?type=java|bedrock&ttl=60
- :address → 支持 域名 或 IP:端口
- type → java (默认) 或 bedrock
- ttl → 缓存秒数 (默认 60)

### 2. 健康检查
GET /api/ping

### 3. API 信息
GET /api/info

### 4. 清理缓存
GET /api/cache/clear

### 5. 查看缓存状态
GET /api/cache/stats

## 📄 License
MIT

