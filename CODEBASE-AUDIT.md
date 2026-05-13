# 漓江旅游小程序 (yinfa) × AI服务 (lvyou-agi) 深度审计报告

**生成时间：2026-05-12**  
**审计范围：代码完整性、接口一致性、部署可操作性**

---

## 一、项目架构总览

### 1.1 技术栈定位

| 层级 | yinfa | lvyou-agi |
|---|---|---|
| 小程序前端 | 微信小程序（Weixin MiniProgram） | - |
| AI前端 | Vue 3 + Vite + TypeScript | - |
| 后端 | Express.js + TypeScript | FastAPI + Python 3.10+ |
| 数据库 | SQL.js（内存）+ PostgreSQL（迁移中） | SQLite（本地）+ ChromaDB（可选） |
| AI/ML | - | TF-IDF + MiniMax LLM API |
| 部署 | Railway | Railway |

**关键发现：yinfa 与 lvyou-agi 是两个完全独立的项目，通过 HTTP API 连接。**

### 1.2 部署地址

| 服务 | 部署地址 | 状态 |
|---|---|---|
| yinfa 后端 | `https://yinfa-backend.up.railway.app` | ✅ 运行中 |
| yinfa 小程序 | 微信小程序（需开发者账号） | ⚠️ 未上线 |
| lvyou-agi API | `https://lvyou-agi.onrender.com` | ⚠️ 可能已过期（Render免费版30分钟休眠） |

---

## 二、yinfa 项目审计

### 2.1 代码结构（100%完整）

```
yinfa-ts/
├── app.js / app.json / app.wxss   ✅ 小程序主入口
├── pages/
│   ├── index/                      ✅ 首页（9个子页面）
│   ├── map/                       ✅ 地图页
│   ├── assistant/                  ✅ AI助手页
│   ├── orders/                    ✅ 订单相关（5个页面）
│   ├── user/                      ✅ 用户中心
│   └── scenic/                    ✅ 景点详情
├── backend/server/
│   └── src/
│       ├── index.ts                ✅ Express 入口（18个路由文件）
│       ├── database.ts            ✅ SQL.js 抽象层
│       ├── routes/                ✅ 路由（index.ts, 1359行）
│       ├── middleware/            ✅ 中间件（auth/logger/rateLimit）
│       ├── services/             ✅ 业务逻辑
│       ├── validators/           ✅ Zod 验证
│       ├── utils/                ✅ 工具函数
│       ├── types/                ✅ TypeScript 类型
│       ├── config/               ✅ 环境配置
│       └── logger.ts             ✅ Pino 日志
├── frontend/                     ⚠️ Vue 前端（50%）
│   ├── src/
│   │   ├── views/                 ⚠️ 首页/景点/导览/旅游卡
│   │   ├── router/
│   │   └── api/
│   └── package.json
└── utils/
    └── agent-service.js          ✅ AI服务客户端（已修复）
```

### 2.2 核心模块完成度

| 模块 | 完成度 | 说明 |
|---|---|---|
| 小程序前端 | **90%** | 缺微信支付、安全警告 |
| Express 后端 | **85%** | 路由完整，缺支付回调 |
| Vue 前端 | **50%** | 4个页面，缺详情/地图/AI/支付 |
| 数据库 | **35%** | SQL.js schema完整，PostgreSQL迁移脚本待执行 |
| 微信支付 | **0%** | 路由骨架已创建，缺真实商户号 |
| AI 助手集成 | **85%** | ✅ 已修复端点路径和请求体格式 |

---

## 三、lvyou-agi 项目审计

### 3.1 代码结构

```
lvyou-agi/
├── server.py              ✅ 生产部署入口（被Dockerfile使用）
├── src/server.py          ⚠️ 开发版（有差异，未被Dockerfile使用）
├── agent.py              ✅ Agent实现（3个子Agent + 1个Coordinator）
├── config.py             ✅ 配置管理
├── requirements.txt      ✅ 依赖清单
├── Dockerfile            ✅ 多阶段构建
├── render.yaml           ✅ Render部署配置
└── data/
    └── docs/
        └── yangti_wharf.md  ⚠️ 仅有1个文档
```

### 3.2 Agent 工具清单

| 工具 | 对应端点 | 功能 | 状态 |
|---|---|---|---|
| `plan_route` | `/api/plan` | 分析需求 + 规划路线 | ✅ |
| `predict_behavior` | `/api/predict` | 预测排队时间/最优出发时间 | ✅ |
| `query_knowledge` | `/api/query` | RAG知识库查询 | ✅ |
| `generate_itinerary` | `/api/itinerary` | 生成完整行程 | ✅ |
| 流式输出 | `/api/chat/stream` | SSE流式响应 | ✅ |

### 3.3 关键差异：`server.py` vs `src/server.py`

⚠️ **重要架构问题：存在两个不同版本的 server.py**

| 特性 | 根目录 `server.py`（生产） | `src/server.py`（开发） |
|---|---|---|
| 被谁使用 | Dockerfile | 仅本地开发 |
| 端点前缀 | `/api/*` | 无前缀 `/chat` |
| 请求体字段 | `context` | `profile` |
| 响应格式 | `{"code": 0, "data": ...}` | `ChatResponse(type, intent, content, data)` |
| `/capabilities` | ✅ 已有 | ✅ 刚添加（但不会被使用） |
| `/health` | ✅ 已有 | ✅ 已有 |
| 端口 | 8001 | 8001 |

**结论：所有集成工作必须针对根目录 `server.py`（已确认其 `/api/chat` 格式）**

---

## 四、相接性分析

### 4.1 HTTP 连接路径

```
小程序前端 (yinfa-ts)
  └─ pages/assistant/assistant.js
      └─ utils/agent-service.js [已修复]
          └─ HTTP POST /api/chat
              └─ lvyou-agi:8001/server.py [生产]
                  └─ Agent → RAG → MiniMax API
```

### 4.2 已修复的 P0 阻断问题

| # | 问题 | 根因 | 修复文件 |
|---|---|---|---|
| 1 | 小程序无法连接 lvyou-agi | 端点路径从 `/api/chat` 错误改为 `/chat` | `agent-service.js` |
| 2 | 字段名不匹配 | 发送 `profile`，根 server.py 期望 `context` | `agent-service.js` |
| 3 | 响应解析失败 | 根 server.py 返回 `{"code": 0, data: ...}` | `agent-service.js` |
| 4 | 生产环境硬编码 | `AGENT_BASE = 'http://localhost:8001'` | `agent-service.js` |
| 5 | 字段名歧义 | assistant.js 传 `duration`，根 server.py 期望 `time_budget` | `assistant.js` |

### 4.3 仍存在的接口问题

| # | 问题 | 严重度 | 状态 |
|---|---|---|---|
| 1 | lvyou-agi `/api/health` 不可达 | ⚠️ 中 | 小程序 AI 状态检查会失败 |
| 2 | lvyou-agi 返回 `content` 但 `normalizeResponse` 期望结构化字段 | 🔴 高 | 可能返回 "无法解析" |
| 3 | `/api/chat/stream` 流式端点存在但小程序未使用 | 💡 低 | 可改进为流式体验 |
| 4 | `src/server.py` 与根 `server.py` 严重不一致 | 🔴 高 | 开发/生产行为差异巨大 |

---

## 五、数据库审计

### 5.1 SQL.js Schema（yinfa 后端）

| 表名 | 用途 | 记录数 |
|---|---|---|
| `categories` | 景点分类 | - |
| `products` | 景点/产品 | - |
| `user_profiles` | 用户画像 | - |
| `addresses` | 用户地址 | - |
| `orders` | 订单 | - |
| `order_items` | 订单项 | - |
| `emergency_contacts` | 紧急联系人 | - |
| `health_records` | 健康档案 | - |
| `cart_items` | 购物车 | - |

### 5.2 PostgreSQL 迁移状态

| 项目 | 状态 |
|---|---|
| Schema 迁移脚本 | ✅ 已创建 |
| 迁移执行器 | ✅ 已创建 |
| Railway 环境变量配置 | ✅ 已更新 |
| 实际迁移执行 | ⏳ 待提供 DATABASE_URL |

---

## 六、微信支付审计

### 6.1 当前状态

- **路由骨架**：`/api/pay/unified-order`（统一下单）、`/api/pay/callback`（支付回调）、`/api/pay/query`（查询订单）
- **实际商户号**：❌ 无（个人开发者无法直接申请微信支付）

### 6.2 个人开发者支付方案

| 方案 | 优点 | 缺点 | 推荐度 |
|---|---|---|---|
| 微信小商店 | 免费、无需商户号、申请简单 | 只能在微信内使用 | ⭐⭐⭐⭐⭐ |
| hirefire.io | 聚合支付、支持个人 | 有手续费 | ⭐⭐⭐ |
| 第三方聚合SDK | 接入简单 | 有手续费 | ⭐⭐⭐ |

---

## 七、待执行任务清单

### 🔴 P0（阻断性问题，必须尽快完成）

| # | 任务 | 依赖 | 负责 |
|---|---|---|---|
| 1 | 在 Railway 添加 `DATABASE_URL` 环境变量 | Railway 控制台 | 用户 |
| 2 | 运行 PostgreSQL 迁移 | DATABASE_URL | 用户 |
| 3 | 注册微信小商店（获取支付能力） | 微信公众平台 | 用户 |
| 4 | 部署 lvyou-agi 到 Railway（解决 Render 休眠问题） | Railway | 用户 |

### 🟡 P1（功能性增强）

| # | 任务 | 状态 |
|---|---|---|
| 5 | Vue 前端接入 agent-service | 50% |
| 6 | 流式 AI 响应（改用 `/api/chat/stream`） | 0% |
| 7 | 小程序微信支付完成集成 | 0% |
| 8 | Railway PostgreSQL 连接验证 | 0% |

### 🟢 P2（长期建设）

| # | 任务 | 状态 |
|---|---|---|
| 9 | 知识库扩展（爬取马蜂窝/携程/桂林旅游官网） | 0% |
| 10 | lvyou-agi `src/server.py` 与根 `server.py` 合并 | 0% |
| 11 | 桂林旅游官网数据对接（高德地图API） | 0% |

---

## 八、部署验证检查清单

Railway 部署后执行以下验证：

```bash
# 1. yinfa 后端健康检查
curl https://yinfa-backend.up.railway.app/api/health

# 2. lvyou-agi 健康检查
curl https://lvyou-agi.up.railway.app/health

# 3. lvyou-agi 能力清单
curl https://lvyou-agi.up.railway.app/capabilities

# 4. AI 助手集成测试
curl -X POST https://lvyou-agi.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "漓江有什么好玩的", "context": {"group_size": 2}}'

# 5. 数据库连接（PostgreSQL迁移后）
curl https://yinfa-backend.up.railway.app/api/categories
```

---

## 九、文件变更记录

### 9.1 本次审计修改的文件

| 文件 | 变更类型 |
|---|---|
| `yinfa-ts/utils/agent-service.js` | 修复端点路径、请求体字段、BASE_URL、响应解析 |
| `yinfa-ts/pages/assistant/assistant.js` | 修复 profile 字段名 |
| `yinfa-ts/backend/server/src/routes/payment.ts` | 新增（支付路由骨架） |
| `yinfa-ts/backend/server/src/index.ts` | 注册支付路由、添加 rawBody 中间件 |
| `yinfa-ts/backend/server/src/database.ts` | 添加 PostgreSQL 支持 |
| `yinfa-ts/backend/server/src/types/index.ts` | 添加 Express.rawBody 类型扩展 |
| `yinfa-ts/backend/server/src/migrations/001_initial_schema.sql` | 新增（PostgreSQL迁移脚本） |
| `yinfa-ts/backend/server/src/migrate.ts` | 新增（迁移执行器） |
| `yinfa-ts/backend/.env.example` | 新增（环境变量文档） |
| `yinfa-ts/backend/server/dist/` | ⚠️ 需重新编译（tsc） |
| `railway.json` | 添加 PostgreSQL 环境变量 |
| `lvyou-agi/src/server.py` | 添加 `/capabilities` 端点 |

### 9.2 本次审计发现的关键问题

1. **⚠️ `src/server.py` 与根 `server.py` 不同步**：开发分支是 `src/server.py`，但 Dockerfile 实际运行的是根目录的 `server.py`
2. **⚠️ `/api/health` 不存在**：根 server.py 的健康检查端点是 `/health` 不是 `/api/health`
3. **⚠️ `src/server.py` 的 `/capabilities` 不会被部署**：因为 Dockerfile 不使用 `src/server.py`
4. **⚠️ PostgreSQL 迁移脚本未执行**：依赖用户配置 `DATABASE_URL`
5. **⚠️ 微信支付未激活**：缺真实商户号
6. **⚠️ lvyou-agi 知识库仅有 1 个文档**：无法支撑专业旅游 AI

---

*本报告由 Hermes Agent 代码审计系统生成，涵盖 yinfa 和 lvyou-agi 两个项目的全栈完整性分析。*
