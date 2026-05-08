const app = getApp()
const api = require('../../utils/api.js')
const nav = require('../../utils/navigate.js')
const weatherUtil = require('../../utils/weather.js')
const voice = require('../../utils/voice.js')

const TAG_COLORS = ['#ff6b35', '#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6']

Page({
  data: {
    weather: weatherUtil.FALLBACK_WEATHER,
    modules: [
      { name: '景区导览', url: '/pages/scenic/scenic', icon: '🏔️', voice: '景区导览' },
      { name: '地图导览', url: '/pages/map/map', icon: '🗺️', voice: '地图导览' },
      { name: '桂林美食', url: '/pages/food/food', icon: '🍜', voice: '桂林美食' },
      { name: '交通出行', url: '/pages/transport/transport', icon: '🚌', voice: '交通出行' },
      { name: '安全保障', url: '/pages/safety/safety', icon: '🛡️', voice: '安全保障' },
      { name: '健康记录', url: '/pages/health/health', icon: '💚', voice: '健康记录' },
      { name: '紧急求助', url: '/pages/emergency/emergency', icon: '🆘', voice: '紧急求助' },
      { name: '全部商品', url: '/pages/category/category', icon: '🛒', voice: '全部商品' }
    ],
    hotProducts: [],
    loadingHot: true,
    hotError: false
  },

  onLoad: function () {
    this.loadWeather()
    this.loadHotProducts()
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ current: 0 });
    }
    weatherUtil.getWeather(weather => {
      this.setData({ weather })
    })
  },

  loadWeather: function () {
    weatherUtil.getWeather(weather => {
      this.setData({ weather })
    })
  },

  loadHotProducts: function () {
    this.setData({ loadingHot: true, hotError: false })

    api.getProducts({}).then(res => {
      const list = (Array.isArray(res) ? res : []).slice(0, 6)
      const hotProducts = list.map((p, i) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url || '/image/icon3.webp',
        tag: p.category ? p.category.name : '推荐',
        tagColor: TAG_COLORS[i % TAG_COLORS.length]
      }))
      this.setData({ hotProducts, loadingHot: false })
    }).catch(() => {
      this.setData({
        hotProducts: [
          { id: 1, name: '漓江精华游船票', price: 215, image: '/image/b1.jpg', tag: '热门', tagColor: TAG_COLORS[0] },
          { id: 2, name: '象鼻山公园门票', price: 55, image: '/image/b2.jpg', tag: '必去', tagColor: TAG_COLORS[1] },
          { id: 3, name: '桂林米粉套餐', price: 38, image: '/image/72.webp', tag: '推荐', tagColor: TAG_COLORS[2] },
          { id: 4, name: '阳朔西街一日游', price: 168, image: '/image/b3.webp', tag: '特惠', tagColor: TAG_COLORS[3] },
          { id: 5, name: '龙脊梯田观光', price: 180, image: '/image/41.webp', tag: '新品', tagColor: TAG_COLORS[4] },
          { id: 6, name: '两江四湖夜游', price: 220, image: '/image/42.webp', tag: '经典', tagColor: TAG_COLORS[5] }
        ],
        loadingHot: false,
        hotError: true
      })
    })
  },

  goSafety: function () {
    nav.go('/pages/safety/safety', '安全保障')
  },

  goModule: function (e) {
    const { url, name, voice: label } = e.currentTarget.dataset
    if (label) {
      voice.speak('正在进入' + label)
      setTimeout(() => { nav.go(url) }, 600)
    } else {
      nav.go(url)
    }
  },

  goDetails: function (e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      nav.go('/pages/details/details?id=' + id)
    }
  },

  goMoreHot: function () {
    nav.go('/pages/list/list', '更多推荐')
  }
})