# 桂林银发旅游小程序 - 项目修复总结

## 一、项目概述

本项目是一个面向银发人群的桂林旅游服务小程序，提供景点导览、安全防护、地图导航、美食推荐等核心功能。

## 二、问题修复汇总

### 1. CSS变量系统问题（最高优先级）

**问题**：CSS变量未设置硬值降级，部分设备无法识别`var()`语法

**修复**：
- `app.wxss`：为所有关键属性添加硬值fallback
- 添加完整的CSS变量系统：字体大小、颜色、间距、圆角、阴影等

**关键变量**：
```css
--font-xs: 24rpx; --font-sm: 28rpx; --font-md: 32rpx; --font-lg: 36rpx; --font-xl: 44rpx; --font-xxl: 52rpx;
--primary: #2E8B57; --accent: #FF6B35; --sos: #EF5350; --gold: #FFD700;
--radius-xs: 4rpx; --radius-sm: 8rpx; --radius-md: 12rpx; --radius-lg: 16rpx; --radius-pill: 100rpx;
--shadow-sm: 0 4rpx 12rpx rgba(0,0,0,0.06);
```

### 2. 导航栏(TabBar)配置问题

**问题**：TabBar图标不显示、颜色配置错误

**修复**：
- `app.json`：添加`darkmode: true`，修复`borderStyle`为`"black"`
- 重新生成8个PNG图标（81×81尺寸）：
  - home.png/home-active.png（🏠）
  - scenic.png/scenic-active.png（⛰️）
  - safety.png/safety-active.png（🛡️）
  - user.png/user-active.png（👤）

### 3. 图片资源问题

**问题**：图片路径错误、格式不兼容（WebP在TabBar中不支持）

**修复**：
- 修复9处图片扩展名错误（`.webp`→`.png/.jpg`）
- 创建`utils/image-paths.js`集中管理图片路径
- TabBar图标统一使用PNG格式

### 4. 全局布局混乱

**问题**：安全区域适配问题、布局错乱

**修复**：
- `app.wxss`：安全区域三重fallback（88rpx、constant()、env()）
- `user.wxss`：完全重写，修复类名不匹配问题

### 5. 轮播图问题

**问题**：轮播图加载失败无兜底

**修复**：
- `index.wxml`：添加`wx:if`条件判断+`binderror`错误处理
- 统一使用JPG格式：b1.jpg、b2.jpg、b3.jpg

### 6. 响应式设计缺失

**问题**：字体大小切换无效

**根因**：`page[data-font-*="true"]`选择器无法命中虚拟`<page>`元素

**修复**：
- 改用`.font-mode-small`/`.font-mode-large`/`.font-mode-huge`类选择器
- 在所有页面根view添加`font-mode-{{fontSizeMode}}`绑定
- `app.js`：`updateFontSize`通过`getCurrentPages()`广播到所有活跃页面

### 7. "我的"页面功能完善

**问题**：虚假数据、硬编码内容、功能缺失

**修复**：
- `user.js`：集成真实API（GET /orders）、localStorage收藏系统、登录/登出、字体切换、语音控制、SOS功能
- `details.js`/`scenic.js`：添加收藏功能，跨页同步

### 8. 热门推荐显示问题

**问题**：商品网格空白、骨架屏缺失

**根因**：`loadHotProducts`使用`base.finishLoad`设置通用`loading`，而非WXML使用的`loadingHot`

**修复**：
- 直接设置`loadingHot: false`
- 添加骨架屏样式和动画
- 添加错误状态、空状态样式

## 三、页面结构

### 首页(index)布局

```
┌─────────────────────────────────────────────┐
│ [区域1] 安全栏 .safety-bar                  │
│   天气emoji + 温度 + "桂林·银发宜居"       │
├─────────────────────────────────────────────┤
│ [区域2] 轮播图 .swiper-box (360rpx)        │
│   b1.jpg / b2.jpg / b3.jpg                 │
├─────────────────────────────────────────────┤
│ [区域3] 功能模块网格 .module-grid           │
│   ┌─────────┬─────────┬─────────┐          │
│   │ 🗺️地图  │ 🍜美食  │ 🚌交通   │ 第1行   │
│   ├─────────┼─────────┼─────────┤          │
│   │ 💚健康  │ 🆘紧急  │ 🛒商品   │ 第2行   │
│   └─────────┴─────────┴─────────┘          │
├─────────────────────────────────────────────┤
│ [区域4] 热门推荐 .hot-section               │
│   标题 + 2×3商品卡片网格                    │
└─────────────────────────────────────────────┘
```

### TabBar配置

| 序号 | 图标 | 文字 | 页面路径 |
|------|------|------|----------|
| 1 | 🏠 | 首页 | `pages/index/index` |
| 2 | ⛰️ | 景点导览 | `pages/scenic/scenic` |
| 3 | 🛡️ | 安全防护 | `pages/safety/safety` |
| 4 | 👤 | 我的 | `pages/user/user` |

## 四、核心功能

### 1. 字体大小切换

**三档字体**：
- 标准字体（normal）：默认大小
- 较大字体（large）：整体放大1.2倍
- 超大字体（huge）：整体放大1.5倍

**切换流程**：
```
用户点击 → user.js setFontSize() → app.updateFontSize()
  → globalData.fontSizeMode 更新
  → wx.setStorageSync 持久化
  → getCurrentPages() 广播到所有页面
  → 各页面 setData({ fontSizeMode })
  → CSS类名变化 → 字体变量覆盖生效
```

### 2. 收藏系统

- 基于localStorage，key为`user_favorites`
- 支持景点收藏/取消收藏
- 跨页面实时同步

### 3. 安全防护

- 天气与路况卡片
- 出行建议（推荐/避开列表）
- 紧急操作三按钮（呼救、分享位置、紧急联系人）
- 银发安全提示（6条分级提示）
- 健康提醒（5条每日贴士）

### 4. 地图优化

- 采用fallback-first渲染策略
- 立即显示6个本地marker，后台静默刷新
- 解决2-10秒加载延迟问题

## 五、文件结构

```
yinfa-ts/
├── app.js              # 全局配置、字体切换广播
├── app.json            # 页面路由、TabBar配置
├── app.wxss            # 全局样式、CSS变量
├── project.config.json # 项目配置、忽略规则
├── utils/
│   ├── api.js          # API接口封装
│   ├── navigate.js     # 导航工具函数
│   ├── page-base.js    # 页面基础行为
│   ├── image-paths.js  # 图片路径管理
│   ├── weather.js      # 天气工具
│   └── voice.js        # 语音播报
├── pages/
│   ├── index/          # 首页
│   ├── scenic/         # 景点导览
│   ├── safety/         # 安全防护
│   ├── user/           # 我的
│   ├── food/           # 桂林美食
│   ├── transport/      # 交通出行
│   ├── map/            # 地图导览
│   ├── health/         # 健康记录
│   ├── emergency/      # 紧急求助
│   ├── cart/           # 购物车
│   ├── details/        # 商品详情
│   └── ...
├── components/
│   ├── banner-view/    # 轮播组件
│   ├── loading-view/   # 加载组件
│   ├── error-view/     # 错误组件
│   └── empty-view/     # 空状态组件
└── image/
    ├── tabbar/         # TabBar图标
    └── ...             # 其他图片资源
```

## 六、状态管理

### 热门推荐状态切换

```
loadingHot=true          → 显示骨架屏
loadingHot=false + hotError=true          → 显示错误状态(重新加载)
loadingHot=false + hotError=false + length=0 → 显示空状态
loadingHot=false + hotError=false + length>0 → 显示商品网格
```

### 字体模式状态

```javascript
// page-base.js 统一注入
fontSizeMode: app.globalData.fontSizeMode || 'normal'

// onShow时刷新同步
refreshFontMode()
```

## 七、技术亮点

1. **CSS变量系统**：统一的设计token，支持主题切换和响应式字体
2. **组件模块化**：banner-view、loading-view等可复用组件
3. **fallback-first渲染**：地图、热门推荐等采用本地数据优先策略
4. **状态广播机制**：字体切换实时同步所有活跃页面
5. **错误边界处理**：图片加载失败、API请求失败均有兜底方案

## 八、待优化项

1. API接口404问题（后端服务未就绪）
2. WechatSI语音插件不可用（需在微信开发者工具中配置）
3. 部分页面数据mock需要替换为真实API

---

*文档生成时间：2026年5月9日*
*基于50轮对话浓缩整理*