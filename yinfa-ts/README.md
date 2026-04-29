# 银发旅游小程序 - 前后端分离架构

## 项目结构

```
yinfa/
├── frontend/          # 前端项目 (Vue 3 + TypeScript + Vite)
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/           # 后端项目 (Express + TypeScript + SQL.js)
│   └── server/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
└── .gitignore
```

## 快速开始

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

### 后端启动

```bash
cd backend/server
npm install
npm run dev
```

## 优化特性

### 前端优化
- 代码分割 (Code Splitting)
- 路由懒加载
- 图片懒加载
- Gzip压缩
- 依赖预优化

### 后端优化
- 响应缓存 (5分钟TTL)
- 数据库连接复用
- Gzip压缩
- 静态资源优化

## 技术栈

### 前端
- Vue 3 (Composition API)
- TypeScript
- Vite
- Vue Router

### 后端
- Express
- TypeScript
- SQL.js (SQLite)
- CORS
- Compression
