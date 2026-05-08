# 银发智能导览小程序 - 桂林旅游

## 项目结构

```
yinfa-ts/
├── pages/                   # 小程序页面
│   ├── index/               # 首页（轮播图、功能模块、热门商品）
│   ├── scenic/              # 景点导览（7大景点详情+老人友好提示+语音）
│   ├── safety/              # 安全中心（天气+出行建议+安全警告+语音朗读）
│   ├── food/                # 美食推荐
│   ├── transport/           # 交通出行
│   ├── traffic/             # 实时路况
│   ├── health/              # 健康记录（血压/心率/备注）
│   ├── emergency/           # 紧急联系人管理
│   ├── map/                 # 地图导航（桂林景点标记+定位+导航）
│   ├── category/            # 分类页
│   ├── cart/                # 购物车
│   ├── user/                # 用户中心（SOS紧急求助+语音+字体切换）
│   ├── orders/              # 订单列表
│   ├── address/             # 地址管理
│   ├── search/              # 搜索（防抖+历史记录）
│   ├── list/                # 商品列表
│   └── details/             # 商品详情+购票
├── utils/                   # 工具库
│   ├── api.js               # API请求封装
│   ├── voice.js             # 语音播报（TTS）
│   ├── amap.js              # 高德地图SDK
│   ├── weather.js           # 天气查询
│   └── navigate.js          # 页面导航
├── image/                   # 图片资源
├── frontend/                # Vue 3 Web管理后台（可选）
├── backend/server/          # Express + TypeScript 后端
│   └── src/
│       ├── middleware/       # 中间件（auditLog, requestLogger, validation）
│       ├── routes/           # API路由
│       ├── types/            # TypeScript类型定义
│       ├── database.ts       # SQL.js数据库+自动备份
│       ├── logger.ts         # Pino结构化日志
│       └── index.ts          # 服务入口
├── app.js                   # 小程序入口
├── app.json                 # 小程序配置（4个tabBar）
├── app.wxss                 # 全局样式（绿色主题）
└── project.config.json      # 项目配置
```

## 快速开始

### 1. 启动后端

```bash
cd backend/server
npm install
npx ts-node src/index.ts
```

后端运行在 `http://localhost:8000`

### 2. 打开小程序

1. 打开微信开发者工具
2. 导入 `yinfa-ts` 目录
3. 点击编译

## 配置API地址

在 `app.js` 中修改后端地址：

```javascript
globalData: {
  apiBaseUrl: 'http://localhost:8000/api',  // 本地开发
  // apiBaseUrl: 'https://your-railway-url/api',  // 生产环境
}
```

## 功能模块

### 核心页面
| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/pages/index/index` | 轮播图、功能模块入口、热门景点推荐 |
| 景点 | `/pages/scenic/scenic` | 7大景点详情、老人友好提示、语音播报、购票入口 |
| 安全 | `/pages/safety/safety` | 天气预报、出行建议、安全警告、语音朗读 |
| 我的 | `/pages/user/user` | 个人中心、SOS紧急求助、语音开关、字体缩放 |

### 辅助页面
| 页面 | 路径 | 说明 |
|------|------|------|
| 地图 | `/pages/map/map` | 桂林景点地图标记、定位、导航 |
| 美食 | `/pages/food/food` | 桂林美食推荐 |
| 交通 | `/pages/transport/transport` | 交通出行方案 |
| 路况 | `/pages/traffic/traffic` | 实时路况信息 |
| 健康 | `/pages/health/health` | 健康记录管理（血压、心率） |
| 紧急 | `/pages/emergency/emergency` | 紧急联系人管理 |

### 电商页面
| 页面 | 路径 | 说明 |
|------|------|------|
| 分类 | `/pages/category/category` | 商品分类浏览 |
| 搜索 | `/pages/search/search` | 商品搜索（防抖+历史记录） |
| 列表 | `/pages/list/list` | 商品列表 |
| 详情 | `/pages/details/details` | 商品详情+购票 |
| 购物车 | `/pages/cart/cart` | 购物车管理 |
| 订单 | `/pages/orders/orders` | 订单列表+创建 |
| 地址 | `/pages/address/address` | 地址管理 |

## 后端API接口

### 商品模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取商品分类 |
| GET | `/api/products` | 商品列表（支持分类/搜索/价格排序/分页） |
| GET | `/api/products/:id` | 商品详情 |

### 用户模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/users/login` | 用户登录/注册（Zod参数验证+审计日志） |
| POST | `/api/users/wxlogin` | 微信小程序登录（code换openid） |
| GET | `/api/users/:openid` | 用户详情 |

### 购物车模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cart?openid=` | 获取购物车 |
| POST | `/api/cart/add` | 添加商品到购物车 |
| PUT | `/api/cart/:itemId` | 修改数量（quantity<=0时删除） |
| DELETE | `/api/cart/:itemId` | 删除购物车项 |
| POST | `/api/cart/clear` | 清空购物车 |

### 订单模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders?openid=` | 订单列表 |
| GET | `/api/orders/:id` | 订单详情 |
| POST | `/api/orders/create` | 创建订单（参数验证+审计日志） |
| POST | `/api/orders/:id/paid` | 模拟支付 |

### 地址模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/addresses?openid=` | 地址列表 |
| POST | `/api/addresses/create` | 创建地址（参数验证+审计日志） |

### 天气模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/weather?city=桂林` | 实时天气（高德API+缓存+fallback） |
| GET | `/api/weather/forecast?city=桂林&days=3` | 天气预报 |

### 紧急联系人模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/emergency-contacts?openid=` | 联系人列表 |
| POST | `/api/emergency-contacts/create` | 添加联系人（最多3个） |
| PUT | `/api/emergency-contacts/:id` | 设为主联系人 |
| DELETE | `/api/emergency-contacts/:id` | 删除联系人 |

### 健康记录模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health-records?openid=` | 健康记录列表 |
| POST | `/api/health-records` | 添加健康记录 |

### SOS紧急求助
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/sos/alert` | 触发SOS，获取位置并通知紧急联系人 |

## 安全措施

- **Helmet** 安全头中间件
- **express-rate-limit** 速率限制（100次/15分钟）
- **Zod** 参数验证（登录/订单/地址 schema）
- **审计日志** 记录敏感操作（IP、openid、操作类型、时间戳）
- **请求体限制** 1MB
- **CORS** 可配置允许域名
- **SQL参数化查询** 防止SQL注入
- **数据库自动备份** 每小时备份，保留最近24份

## 数据库表

| 表名 | 说明 |
|------|------|
| categories | 商品分类表 |
| products | 商品表 |
| user_profiles | 用户表 |
| addresses | 地址表 |
| orders | 订单表 |
| order_items | 订单项表 |
| cart_items | 购物车表 |
| emergency_contacts | 紧急联系人表 |
| health_records | 健康记录表 |
