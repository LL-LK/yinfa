# 环境变量完整参考文档

**项目：漓江旅游小程序 (yinfa) x AI服务 (lvyou-agi)**
**最后更新：2025-05-12**

---

## 一、yinfa 后端 — Railway 部署配置清单

### ★ 必须配置（否则服务无法正常运行）

| 变量名 | 值来源 | Railway Variable Key | 说明 |
|---|---|---|---|
| `DATABASE_URL` | Railway PostgreSQL 连接字符串 | `DATABASE_URL` | 创建 PostgreSQL 数据库后自动生成 |
| `JWT_SECRET` | `openssl rand -hex 32` 生成 | `JWT_SECRET` | JWT签名密钥，生产必须改 |
| `WECHAT_APPID` | 微信公众平台 mp.weixin.qq.com | `WECHAT_APPID` | 小程序AppID，以 wx 开头 |
| `WECHAT_SECRET` | 微信公众平台 mp.weixin.qq.com | `WECHAT_SECRET` | 小程序AppSecret |
| `AGENT_BASE_URL` | lvyou-agi 部署地址 | `AGENT_BASE_URL` | lvyou-agi Railway URL，末尾不要加 / |

### ◆ 微信支付（开通微信小商店后配置）

| 变量名 | 值来源 | Railway Variable Key | 说明 |
|---|---|---|---|
| `WECHAT_MCHID` | 微信商户平台 pay.weixin.qq.com | `WECHAT_MCHID` | 商户号 |
| `WECHAT_APIV3_KEY` | `openssl rand -hex 32` 生成 | `WECHAT_APIV3_KEY` | APIv3密钥，32字符 |
| `WECHAT_SERIAL_NO` | 微信商户平台证书页 | `WECHAT_SERIAL_NO` | 证书序列号 |
| `WECHAT_CERT_PATH` | 固定值 | `WECHAT_CERT_PATH` | `/app/cert/apiclient_cert.pem` |
| `WECHAT_KEY_PATH` | 固定值 | `WECHAT_KEY_PATH` | `/app/cert/apiclient_key.pem` |

### ◇ 可选配置（有默认值）

| 变量名 | 默认值 | 说明 |
|---|---|---|
| `PORT` | `8000` | 服务端口 |
| `NODE_ENV` | `production` | 环境 |
| `JWT_EXPIRES_IN` | `604800` | JWT过期秒数（7天） |
| `AGENT_TIMEOUT` | `30000` | AI请求超时（毫秒） |
| `LOG_LEVEL` | `info` | 日志级别 |

---

## 二、lvyou-agi — Railway 部署配置清单

### ★ 必须配置

| 变量名 | 值来源 | Railway Variable Key | 说明 |
|---|---|---|---|
| `MINIMAX_API_KEY` | MiniMax开放平台 platform.minimax.chat | `MINIMAX_API_KEY` | API密钥 |
| `MINIMAX_BASE_URL` | 固定值 | `MINIMAX_BASE_URL` | `https://api.minimax.chat` |
| `MINIMAX_MODEL` | 固定值 | `MINIMAX_MODEL` | `abab6.5s-chat` |

### ◇ 可选配置

| 变量名 | 默认值 | 说明 |
|---|---|---|
| `PORT` | `8001` | 服务端口 |
| `ENVIRONMENT` | `production` | 环境 |
| `LOG_LEVEL` | `INFO` | 日志级别 |
| `CORS_ORIGINS` | （需填入） | 允许的跨域来源 |
| `KNOWLEDGE_BASE_PATH` | `./data/docs` | 知识库文档目录 |
| `TFIDF_INDEX_PATH` | `./data/tfidf_index.pkl` | TF-IDF索引缓存 |
| `MAX_TOKENS` | `2048` | 单次最大token数 |
| `TEMPERATURE` | `0.7` | 随机性（0-1） |
| `MAX_HISTORY_TURNS` | `10` | 对话历史轮次 |
| `STREAM_ENABLED` | `true` | SSE流式响应 |

---

## 三、快速生成密钥命令

```bash
# JWT_SECRET（yinfa后端用）
openssl rand -hex 32

# WECHAT_APIV3_KEY（微信支付用）
openssl rand -hex 32
```

---

## 四、部署地址对应关系

```
yinfa 小程序前端（微信开发者工具）
    ↓ HTTPS 请求
yinfa Express 后端（Railway）  ← AGENT_BASE_URL 指向下方
    ↓ HTTP /api/agent/chat
lvyou-agi FastAPI（Railway）   ← MINIMAX_API_KEY 指向 MiniMax
    ↓
MiniMax LLM API
```

---

## 五、验证配置

```bash
# yinfa 后端健康检查
curl https://your-yinfa.railway.app/health

# lvyou-agi 健康检查
curl https://your-lvyou-agi.railway.app/health
```
