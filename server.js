import express from "express";
import rateLimit from "express-rate-limit";
import { status, statusBedrock } from "minecraft-server-util";

const app = express();

// 读取环境变量
const PORT = process.env.PORT || 3000;
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT) || 60;
const DEFAULT_CACHE_TTL = parseInt(process.env.CACHE_TTL) || 60;

// 内存缓存
const cache = new Map();

// 限流配置
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: RATE_LIMIT,
  message: { ok: false, error: "Too many requests, please try again later." }
});
app.use(limiter);

// 工具函数：解析地址与端口
function parseAddress(address, type) {
  let host = address;
  let port;
  if (address.includes(":")) {
    const parts = address.split(":");
    host = parts[0];
    port = parseInt(parts[1]);
  } else {
    port = type === "bedrock" ? 19132 : 25565;
  }
  return { host, port };
}

// API: 查询服务器状态
app.get("/api/status/:address", async (req, res) => {
  const { address } = req.params;
  const { type, ttl } = req.query;

  let serverType = type === "bedrock" ? "bedrock" : "java";
  const { host, port } = parseAddress(address, serverType);

  let ttlSec = parseInt(ttl) || DEFAULT_CACHE_TTL;
  if (ttlSec < 5) ttlSec = 5;
  if (ttlSec > 600) ttlSec = 600;

  const cacheKey = `${serverType}-${host}-${port}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expire) {
    return res.json({ ok: true, cached: true, data: cached.data });
  }

  try {
    let result;
    if (serverType === "java") {
      result = await status(host, port, { timeout: 5000 });
    } else {
      result = await statusBedrock(host, port, { timeout: 5000 });
    }

    cache.set(cacheKey, { expire: Date.now() + ttlSec * 1000, data: result });

    res.json({ ok: true, cached: false, data: result });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// 健康检查
app.get("/api/ping", (req, res) => res.json({ ok: true, message: "pong" }));

// API 信息
app.get("/api/info", (req, res) => {
  res.json({
    ok: true,
    name: "Minecraft Server Status API",
    version: "1.0.0",
    endpoints: ["/api/status/:address", "/api/ping", "/api/info", "/api/cache/clear", "/api/cache/stats"]
  });
});

// 清理缓存
app.get("/api/cache/clear", (req, res) => {
  cache.clear();
  res.json({ ok: true, message: "Cache cleared" });
});

// 查看缓存状态
app.get("/api/cache/stats", (req, res) => {
  res.json({
    ok: true,
    size: cache.size,
    keys: Array.from(cache.keys())
  });
});

// 启动服务
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
