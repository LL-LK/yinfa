# 银发旅游小程序

一个为老年人设计的旅游服务小程序，提供景点门票、酒店预订、旅游团等服务。

## 快速开始

### 本地开发

**后端启动：**
```bash
cd yinfa-ts/backend/server
npm install
npx ts-node src/index.ts
```

**微信小程序：**
1. 打开微信开发者工具
2. 导入项目：选择 `yinfa-ts` 目录
3. 点击编译

**Web前端（可选）：**
```bash
cd yinfa-ts/frontend
npm install
npm run dev
```

## 项目结构

```
yinfa/
├── yinfa-ts/                    # 微信小程序
│   ├── pages/                   # 小程序页面
│   ├── image/                   # 图片资源
│   ├── frontend/                # Vue 3 Web前端
│   └── backend/server/          # Express后端
├── railway.json                 # Railway部署配置
├── 部署指南.md                  # 详细部署文档
└── 接口文档.md                  # API接口文档
```

## 技术栈

- **小程序**：微信小程序原生框架
- **Web前端**：Vue 3 + TypeScript + Vite
- **后端**：Express + TypeScript + SQL.js
- **部署**：Railway

## 部署

详细部署步骤请查看 [部署指南](./部署指南.md)

### 一键部署到 Railway

1. Fork 本仓库到 GitHub
2. 在 Railway 中创建新项目，选择从 GitHub 部署
3. 选择本仓库，Railway 会自动读取 `railway.json` 配置
4. 添加持久化卷，Mount Path 设置为 `/app/data`
5. 配置环境变量（见部署指南）

## API接口

| 接口 | 说明 |
|------|------|
| `GET /api/categories` | 获取分类列表 |
| `GET /api/products` | 获取商品列表 |
| `GET /api/products/:id` | 获取商品详情 |
| `POST /api/users/login` | 用户登录/注册 |
| `GET /api/users/:openid` | 获取用户信息 |

完整接口文档请查看 [接口文档](./接口文档.md)

## 功能模块

- 商品分类浏览
- 商品详情查看
- 购物车管理
- 订单创建与查看
- 用户中心
- 地址管理
- 地图导航
- 商品搜索
