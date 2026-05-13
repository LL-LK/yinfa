# 桂林银发旅游小程序 (Guilin Silver Hair Tourism)

> 专为银发群体打造的桂林智慧导览与文旅电商平台

---

## 快速链接

| 文档 | 说明 |
|------|------|
| [PROJECT_SUMMARY.md](./yinfa-ts/PROJECT_SUMMARY.md) | 完整项目总结（架构/页面/API/安全/部署） |
| [yinfa-ts/README.md](./yinfa-ts/README.md) | 小程序开发指南（本地开发/环境配置/目录结构） |
| [railway.json](./railway.json) | Railway部署配置 |
| [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) | GitHub Actions CI/CD流水线 |

---

## 项目结构

```
yinfa/
├── yinfa-ts/                      # 微信小程序 + 后端 + Web后台
│   ├── pages/                     # 18个小程序页面
│   ├── frontend/                  # Vue 3 Web管理后台(10页)
│   ├── backend/server/            # Express + TypeScript后端
│   │   └── src/
│   │       ├── index.ts           # 服务入口(8000端口)
│   │       ├── database.ts        # SQL.js数据库
│   │       ├── db-pg.ts           # PostgreSQL适配器
│   │       ├── routes/            # API路由(20+端点)
│   │       └── middleware/        # 中间件(验证/审计/日志)
│   └── PROJECT_SUMMARY.md         # 项目总结文档
├── railway.json                   # Railway部署配置
├── Procfile                       # Heroku部署入口
├── .github/workflows/deploy.yml   # CI/CD自动部署流水线
└── README.md                      # 本文件
```

---

## 技术栈一览

| 组件 | 技术 |
|------|------|
| 小程序 | 微信原生框架 WXML/WXSS/JS |
| Web后台 | Vue 3 + TypeScript + Vite + Pinia |
| 后端 | Express + TypeScript + Node.js |
| 数据库 | SQL.js (SQLite/WASM) 支持PostgreSQL切换 |
| 部署 | Railway (主要) / Heroku (备选) |
| CI/CD | GitHub Actions |
| 安全 | Helmet · CORS · RateLimit · Zod · 审计日志 |

---

## 部署状态

### 当前部署流程

```
GitHub Push (main/master)
    │
    ├──→ GitHub Actions
    │       ├── lint-and-build: tsc类型检查 + 编译
    │       └── deploy: railway up 自动部署
    │
    └──→ Railway (自动检测)
            ├── 读取 railway.json
            ├── cd yinfa-ts/backend/server
            ├── npm install && npx tsc
            └── node dist/index.js (端口8000)
```

### 部署配置文件

| 文件 | 用途 |
|------|------|
| `railway.json` | Railway环境变量 + 构建/启动命令 + 持久化卷配置 |
| `Procfile` | Heroku兼容部署入口 |
| `.github/workflows/deploy.yml` | CI/CD流水线：类型检查 → 构建 → 自动部署 |
| `yinfa-ts/backend/.env.template` | 环境变量模板(12个变量) |

### 环境变量清单

| 变量名 | 必填 | 说明 |
|--------|------|------|
| NODE_ENV | ✅ | `production` / `development` |
| PORT | ✅ | 服务端口(默认8000) |
| WECHAT_APPID | ✅ | 微信小程序AppID |
| WECHAT_SECRET | ✅ | 微信小程序Secret |
| WECHAT_MCHID | ❌ | 微信支付商户号 |
| WECHAT_API_KEY | ❌ | 微信支付API密钥 |
| AMAP_KEY | ✅ | 高德地图API Key |
| ALLOWED_ORIGINS | ✅ | CORS允许的域名(逗号分隔) |
| LVYOU_AGI_URL | ❌ | 旅游AI代理地址 |
| LVYOU_AGI_API_KEY | ❌ | 旅游AI代理Key |
| AGENT_BASE_URL | ❌ | Agent基础URL |
| DATABASE_URL | ❌ | PostgreSQL连接串(为空则使用SQL.js) |

完整列表参见 `yinfa-ts/backend/.env.template`。

---

## API接口概览

20+ RESTful端点，统一响应格式 `{"code": 0, "data": ...}` / `{"code": 1, "error": "..."}`

| 模块 | 端点 | 说明 |
|------|------|------|
| 商品 | /api/categories, /api/products | 分类+商品列表/详情 |
| 用户 | /api/users/wxlogin | 微信code登录 |
| 购物车 | /api/cart | CRUD操作 |
| 订单 | /api/orders, /api/order/create | 订单管理 |
| 天气 | /api/weather | 实时天气(30分钟缓存) |
| SOS | /api/sos/alert | 紧急求助 |
| 健康 | /api/health-records | 健康记录管理 |
| 联系人 | /api/emergency-contacts | 紧急联系人管理 |

完整接口文档 → [PROJECT_SUMMARY.md](./yinfa-ts/PROJECT_SUMMARY.md#api接口列表20端点)

---

## 数据库备份

- **频率**: 每小时自动备份
- **格式**: `backups/shop_backup_YYYY-MM-DDTHH-MM-SS.db`
- **保留**: 最近24份
- **恢复**: 主库损坏时自动从最新备份恢复

---

## 已知限制

1. 支付回调写入仅支持SQL.js模式（PostgreSQL待适配）
2. 前端API地址需在生产环境替换为Railway域名
3. 静态文件路径依赖运行时目录结构

---

**2026年5月 · 桂林**