# 桂林银发旅游小程序 - 项目总结

## 项目概述

桂林银发旅游小程序（Guilin Silver Hair Tourism）是一个专为银发（老年）群体打造的智慧导览与文旅电商平台，覆盖桂林核心景点和文旅服务。

**版本**: v1.0.0  
**开发完成**: 2026年5月

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 微信小程序 | 原生框架 WXML/WXSS/JS | 18个页面 + 4个组件 + 自定义TabBar |
| Web管理后台 | Vue 3 + TypeScript + Vite + Pinia | 10个管理页面 |
| 后端API | Express + TypeScript + Node.js | RESTful API 20+端点 |
| 数据库 | SQL.js (SQLite/WASM) / PostgreSQL | 双模式支持，9张表 |
| 部署 | Railway | 云端一键部署，持久化卷 |
| CI/CD | GitHub Actions | 自动类型检查 + 构建 + 部署 |


## 系统架构

```
┌─────────────────────────────────────────────────┐
│                  微信小程序 (18 pages)             │
│   WechatSI语音插件 · 高德地图SDK · 自定义TabBar    │
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST API
┌────────────────────▼────────────────────────────┐
│              Express 后端 (TypeScript)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Helmet   │ │ Zod验证   │ │ 审计日志         │ │
│  │ CORS     │ │ RateLimit│ │ 请求日志         │ │
│  │ Compress │ │ Body 1MB │ │ SQL参数化防注入   │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│   SQL.js (主) / PostgreSQL (可选)                  │
│   9张表 · 每小时备份(24份) · 灾难恢复              │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│            Vue 3 Web管理后台 (10 pages)            │
│   Pinia状态管理 · Vue Router · Vite构建            │
└─────────────────────────────────────────────────┘
```


## 页面清单（18个）

### TabBar页面（4个）
| 页面 | 路径 | 核心功能 |
|------|------|---------|
| 首页 | pages/index/index | 轮播图、8功能入口、热门推荐、天气 |
| 景点导览 | pages/scenic/scenic | 7大景点、分类筛选、老人友好评分 |
| 安全防护 | pages/safety/safety | 天气预警、路滑评估、SOS求助 |
| 个人中心 | pages/user/user | 登录、订单、收藏、语音/字体/语言设置 |

### 辅助功能 + 电商页面（14个）
地图导览、桂林美食、交通出行、实时路况、健康记录、紧急联系人、
智能助手、分类浏览、商品搜索、商品列表、商品详情、购物车、订单列表、地址管理


## API接口列表（20+端点）

### 商品模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/categories | 分类列表(5分钟缓存) |
| GET | /api/products | 商品列表(分类/搜索/排序/分页) |
| GET | /api/products/:id | 商品详情 |

### 用户模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/users/wxlogin | 微信code登录换openid |
| POST | /api/users/login | 登录/注册 |
| GET | /api/users/:openid | 用户详情 |

### 购物车 & 订单
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/cart | 查看购物车 |
| POST | /api/cart | 添加购物车 |
| PUT | /api/cart/:itemId | 修改数量 |
| DELETE | /api/cart/:itemId | 删除商品 |
| POST | /api/cart/clear | 清空购物车 |
| GET | /api/orders | 订单列表 |
| POST | /api/order/create | 创建订单 |
| POST | /api/orders/:id/paid | 模拟支付 |

### 地址 · 天气 · 联系人 · 健康 · SOS
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/addresses | 地址列表/创建 |
| GET | /api/weather | 实时天气 |
| GET | /api/weather/forecast | 天气预报 |
| POST | /api/emergency-contacts/create | 添加紧急联系人 |
| GET/PUT/DELETE | /api/emergency-contacts/:id | 查看/修改/删除 |
| GET/POST | /api/health-records | 健康记录 |
| POST | /api/sos/alert | SOS求助 |


## 银发友好特性

- **三档字体缩放**：标准(1x) / 较大(1.2x) / 超大(1.5x)，CSS变量全局响应
- **全程语音播报**：WechatSI插件(主) → 有道TTS(备) → 静默降级，支持4语种
- **语言辅助切换**：中文 / English / 日本語 / 한국어
- **老人友好评分**：综合步行距离、台阶数、休息区打分
- **安全防护6层**：天气监测 → 路滑评估 → 出行建议 → 安全提示 → 健康提醒 → SOS求助


## 安全体系

| 层级 | 措施 |
|------|------|
| HTTP | Helmet安全头 + CORS + gzip压缩 |
| 速率 | Rate Limit: 100次/15分钟/IP |
| 参数 | Zod 7个验证Schema + 手机号正则验证 |
| SQL | 参数化查询(prepare+bind) + 路径净化 |
| 审计 | 审计日志(login/create_order/create_address) |
| 防护 | SOS防重复点击锁 + GPS多级Fallback |


## 部署架构

### Railway 部署
- **构建命令**: `cd yinfa-ts/backend/server && npm install && npx tsc`
- **启动命令**: `cd yinfa-ts/backend/server && node dist/index.js`
- **持久化**: 数据目录挂载 `/data` 持久化卷
- **健康检查**: `/health` 端点
- **优雅关停**: SIGTERM/SIGINT → stopBackupTimer() → exit(0)

### 环境变量
| 变量名 | 说明 |
|--------|------|
| NODE_ENV | 运行环境(production/development) |
| PORT | 服务端口(8000) |
| WECHAT_APPID | 微信小程序AppID |
| WECHAT_SECRET | 微信小程序Secret |
| WECHAT_MCHID | 微信商户号(可选) |
| WECHAT_API_KEY | 微信支付API Key(可选) |
| AMAP_KEY | 高德地图API Key |
| ALLOWED_ORIGINS | CORS允许域名 |
| LVYOU_AGI_URL | 旅游AI代理地址 |
| LVYOU_AGI_API_KEY | 旅游AI代理Key |
| AGENT_BASE_URL | Agent基础URL |
| DATABASE_URL | PostgreSQL连接串(可选) |

### CI/CD (GitHub Actions)
- **触发**: main/master 分支 push
- **Job 1**: TypeScript类型检查 → 编译构建
- **Job 2**: 部署到Railway (有Railway CLI + RAILWAY_TOKEN Secret)

### 数据库备份
- 每小时自动备份到 `backups/shop_backup_YYYY-MM-DDTHH-MM-SS.db`
- 保留最近24份备份
- 灾难恢复：主库损坏时自动从最新备份恢复


## 目录结构

```
yinfa/
├── yinfa-ts/                      # 微信小程序主目录
│   ├── pages/                     # 18个页面
│   ├── components/                # 4个组件（banner/loading/error/empty）
│   ├── utils/                     # 6个工具模块
│   ├── custom-tab-bar/            # 自定义TabBar
│   ├── frontend/                  # Vue 3 Web管理后台
│   ├── backend/                   # 后端服务
│   │   ├── .env.template          # 环境变量模板
│   │   └── server/
│   │       ├── package.json       # 后端依赖
│   │       ├── tsconfig.json      # TypeScript配置
│   │       ├── src/
│   │       │   ├── index.ts       # 服务入口
│   │       │   ├── database.ts    # SQL.js数据库
│   │       │   ├── db-pg.ts       # PostgreSQL适配器
│   │       │   ├── logger.ts      # Winston日志
│   │       │   ├── migrate.ts     # 数据库迁移
│   │       │   ├── middleware/    # 中间件
│   │       │   ├── routes/        # API路由
│   │       │   ├── types/         # TS类型定义
│   │       │   └── migrations/    # SQL迁移脚本
│   │       └── dist/              # 编译输出(构建产物)
│   ├── image/                     # 图片资源
│   ├── PROJECT_SUMMARY.md         # 本文件
│   └── README.md                  # 项目README
├── .github/workflows/deploy.yml   # GitHub Actions CI/CD
├── railway.json                   # Railway部署配置
├── Procfile                       # Heroku兼容部署
└── README.md                      # 根目录README
```

---

## 技术亮点

1. **Fallback-First渲染**：地图/api/图片三重兜底，杜绝白屏
2. **状态广播机制**：字体/语言/语音变更 → getCurrentPages()遍历 → setData同步
3. **CSS变量系统**：统一Design Token + 硬值fallback兼容老旧设备
4. **组件的状态机模式**：loading→error→empty→data 统一管理
5. **多级API Fallback**：天气(Open-Meteo→高德→本地) / TTS(WechatSI→有道→静默)
6. **SQL.js嵌入式数据库**：零配置、WASM运行、自动每小时备份
7. **双数据库支持**：SQL.js(主) + PostgreSQL(可选)，通过适配器层切换

---

**2026年5月 · 桂林**