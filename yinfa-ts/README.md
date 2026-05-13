# 桂林银发旅游小程序

> 专为银发群体打造的桂林智慧导览与文旅电商平台

---

## 快速开始

### 环境要求
- Node.js >= 18
- 微信开发者工具
- Railway 账号 (部署用)

### 本地开发

```bash
# 1. 进入后端目录
cd yinfa-ts/backend/server

# 2. 安装依赖
npm install

# 3. 配置环境变量（从模板复制）
cp ../.env.template ../.env
# 编辑 .env 填入真实的微信AppID/Secret等

# 4. 启动开发服务器（会执行数据库迁移 + 启动Express）
npm run dev
```

后端默认运行在 `http://localhost:8000`。

### 微信小程序开发

1. 用"微信开发者工具"打开 `yinfa-ts/` 目录
2. 在 `project.config.json` 中填入正确的 `appid`
3. 编译预览

### Vue Web管理后台

```bash
cd yinfa-ts/frontend
npm install
npm run dev
```

---

## 项目一览

| 指标 | 数值 |
|------|------|
| 小程序页面数 | 18 |
| API端点 | 20+ |
| 数据库表 | 9 |
| 组件 | 4 |
| 工具模块 | 6 |

详细架构和设计请参见 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)。

---

## 部署

### Railway（推荐）

1. Fork本项目到GitHub
2. 在 [Railway](https://railway.app) 中连接仓库
3. Railway自动读取 `railway.json`，执行部署
4. 在Railway Dashboard设置环境变量（参考 `.env.template`）

### Heroku（备选）

```bash
heroku create
heroku buildpacks:set heroku/nodejs
git push heroku main
```

因Procfile已配置为 `cd yinfa-ts/backend/server && npm install && npm run build && npm run start`。

### CI/CD

GitHub Actions 配置于 `.github/workflows/deploy.yml`：
- **Push触发**: TypeScript类型检查 + 编译
- **部署**: 自动部署到Railway（需设置 `RAILWAY_TOKEN` Secret）

---

## API文档

详见 [PROJECT_SUMMARY.md#api接口列表](./PROJECT_SUMMARY.md#api接口列表20端点)

统一响应格式：
```json
// 成功
{ "code": 0, "data": {...} }

// 失败
{ "code": 1, "error": "错误描述" }
```

---

## 安全审计

| 层级 | 措施 |
|------|------|
| HTTP | Helmet + CORS + gzip |
| 速率 | 100次/15分钟/IP |
| 参数 | Zod 7个Schema + 手机号正则 |
| SQL | prepare+bind参数化 |
| 审计 | 审计日志 |
| 运维 | 每小时DB备份 + 灾难恢复 |

---

## 目录结构

```
yinfa-ts/
├── pages/          # 18个小程序页面
├── components/     # 4个通用组件
├── utils/          # 6个工具模块
├── custom-tab-bar/ # 自定义TabBar
├── frontend/       # Vue 3 Web后台
├── backend/        # Express后端
│   ├── .env.template
│   └── server/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts       # 服务入口
│           ├── database.ts    # SQL.js
│           ├── db-pg.ts       # PostgreSQL适配器
│           ├── logger.ts      # Winston日志
│           ├── migrate.ts     # 数据库迁移
│           ├── middleware/    # 中间件
│           ├── routes/        # API路由
│           ├── types/         # TS类型定义
│           └── migrations/    # SQL脚本
├── image/          # 图片资源
├── app.js          # 小程序入口
├── app.json        # 小程序配置
├── app.wxss        # 全局样式
├── PROJECT_SUMMARY.md  # 详细项目总结
└── README.md       # 本文件
```

---

## 已知限制 & 待优化

1. **支付模块暂仅支持SQL.js**，PostgreSQL模式下支付回调写入待适配
2. **静态文件路径**依赖运行时目录结构，Railway部署后路径可能需调整
3. **前端API地址**硬编码为 `localhost:8000`，生产环境需改为Railway域名
4. **未配置HTTPS**：生产环境应通过Railway自带TLS或nginx反向代理

---

**2026年5月 · 桂林**