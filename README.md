# 银发旅游小程序

这是一个为老年人设计的旅游服务小程序，提供景点门票、酒店预订、旅游团等服务。

## 项目结构

- `yinfa-ts/` - TypeScript项目根目录
  - `src/` - 前端Vue 3 + TypeScript代码
    - `assets/` - 静态资源（图片等）
    - `components/` - 组件
    - `views/` - 页面视图
    - `router/` - 路由配置
  - `server/` - 后端TypeScript代码
    - `src/` - 后端源代码
      - `routes/` - API路由
      - `types/` - 类型定义
      - `database.ts` - 数据库操作
    - `data/` - SQLite数据库文件

## 技术栈

- 前端：Vue 3 + TypeScript + Vite
- 后端：Express + TypeScript + SQLite

## 快速开始

### 前端

1. 进入前端项目目录
```bash
cd yinfa-ts
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

### 后端

1. 进入后端项目目录
```bash
cd yinfa-ts/server
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 功能模块

- 商品分类
- 商品详情
- 购物车
- 订单管理
- 用户中心
- 地址管理
- 地图功能
- 搜索功能

## API接口

- GET /api/categories - 获取分类列表
- GET /api/products - 获取商品列表
- GET /api/products/:id - 获取商品详情
- POST /api/users/login - 用户登录
- GET /api/users/:openid - 获取用户详情
- POST /api/address/create - 创建地址
- GET /api/addresses - 获取地址列表
- POST /api/order/create - 创建订单
- GET /api/orders - 获取订单列表
- GET /api/orders/:id - 获取订单详情

## 微信小程序配置

1. 打开微信开发者工具
2. 导入项目：选择 `yinfa-ts` 目录
3. 修改小程序配置文件，确保正确设置
4. 编译运行

## 注意事项

- 后端服务器默认运行在 `http://localhost:8000`
- 前端开发服务器默认运行在 `http://localhost:5173`
- 数据库会在首次启动时自动初始化并创建示例数据