# 银发旅游小程序 - 微信小程序

## 项目结构

```
yinfa-ts/
├── pages/                   # 小程序页面
│   ├── index/               # 首页
│   ├── category/            # 分类页
│   ├── cart/                # 购物车
│   ├── user/                # 用户中心
│   ├── orders/              # 订单
│   ├── address/             # 地址管理
│   ├── map/                 # 地图
│   ├── search/              # 搜索
│   ├── list/                # 列表
│   └── details/             # 商品详情
├── image/                   # 图片资源
├── frontend/                # Vue 3 Web前端（可选）
├── backend/server/          # Express后端
├── app.js                   # 小程序入口
├── app.json                 # 小程序配置
├── app.wxss                 # 全局样式
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

或在小程序控制台中动态设置：
```javascript
getApp().setApiUrl('https://your-railway-url/api')
```

## 功能模块

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/pages/index/index` | 轮播图、功能模块、热门商品 |
| 分类 | `/pages/category/category` | 商品分类浏览 |
| 购物车 | `/pages/cart/cart` | 购物车管理 |
| 用户 | `/pages/user/user` | 用户中心 |
| 订单 | `/pages/orders/orders` | 订单列表 |
| 地址 | `/pages/address/address` | 地址管理 |
| 地图 | `/pages/map/map` | 地图导航 |
| 搜索 | `/pages/search/search` | 商品搜索 |
| 列表 | `/pages/list/list` | 商品列表 |
| 详情 | `/pages/details/details` | 商品详情 |
