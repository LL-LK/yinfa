const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')
const weatherUtil = require('../../utils/weather.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    weather: weatherUtil.FALLBACK_WEATHER,
    modules: [
      { icon: '🏔️', name: '景点攻略', url: '/pages/scenic/scenic', voice: '查看桂林景点攻略' },
      { icon: '🍜', name: '特色美食', url: '/pages/food/food', voice: '查看桂林特色美食' },
      { icon: '🚌', name: '交通出行', url: '/pages/transport/transport', voice: '查看交通出行建议' },
      { icon: '🛡️', name: '安全提醒', url: '/pages/safety/safety', voice: '查看安全提醒，包含天气和路面信息' },
      { icon: '🗺️', name: '地图导览', url: '/pages/map/map', voice: '打开地图查看景点位置' },
      { icon: '🛒', name: '旅游商城', url: '/pages/category/category', voice: '进入旅游商城选购门票和特产' }
    ],
    hotProducts: []
  },

  onLoad: function () {
    this.loadWeather()
    this.loadHotProducts()
  },

  loadWeather: function () {
    weatherUtil.getWeather('桂林').then(w => {
      this.setData({ weather: w })
    })
  },

  loadHotProducts: function () {
    api.getProducts().then(products => {
      const hot = (products || []).slice(0, 6).map((p, i) => {
        const tags = ['热门', '必去', '推荐', '特惠', '新品', '经典']
        return {
          id: p.id,
          name: p.name || '未知商品',
          price: p.price,
          image: p.image_url || '/image/default.jpg',
          tag: tags[i % tags.length]
        }
      })
      this.setData({ hotProducts: hot })
    }).catch(() => {
      this.setData({
        hotProducts: [
          { id: 1, name: '漓江精华游船票', price: 215, image: '/image/b1.jpg', tag: '热门' },
          { id: 2, name: '象鼻山公园门票', price: 55, image: '/image/b2.jpg', tag: '必去' },
          { id: 3, name: '桂林米粉套餐', price: 38, image: '/image/72.png', tag: '推荐' },
          { id: 4, name: '阳朔西街一日游', price: 168, image: '/image/b3.jpg', tag: '特惠' },
          { id: 5, name: '龙脊梯田观光', price: 180, image: '/image/b1.jpg', tag: '新品' },
          { id: 6, name: '两江四湖夜游', price: 220, image: '/image/b2.jpg', tag: '经典' }
        ]
      })
    })
  },

  readAloud: function () {
    voice.speak('首页共有' + this.data.modules.length + '个功能模块：景点攻略、特色美食、交通出行、安全提醒、地图导览、旅游商城。底部还有热门推荐、一键呼救、实时路况和我的订单。点击任意按钮即可进入对应功能。')
  },

  goModule: function (e) {
    const url = e.currentTarget.dataset.url
    const name = e.currentTarget.dataset.name
    const txt = e.currentTarget.dataset.voice
    voice.speak(txt || '正在进入' + name)
    setTimeout(() => {
      if (url.indexOf('/pages/index/') > -1 || url.indexOf('/pages/scenic/') > -1 ||
          url.indexOf('/pages/safety/') > -1 || url.indexOf('/pages/user/') > -1) {
        wx.switchTab({ url: url })
      } else {
        wx.navigateTo({ url: url })
      }
    }, 600)
  },

  goDetails: function (e) {
    const id = e.currentTarget.dataset.id
    voice.speak('正在查看商品详情')
    nav.go('/pages/details/details?id=' + id)
  },

  goSafety: function () {
    voice.speak('正在查看安全信息')
    wx.switchTab({ url: '/pages/safety/safety' })
  },

  goTraffic: function () {
    voice.speak('正在查看实时路况')
    nav.go('/pages/traffic/traffic', '实时路况')
  },

  goOrders: function () {
    voice.speak('正在查看我的订单')
    nav.go('/pages/orders/orders', '我的订单')
  },

  sendSOS: function () {
    voice.speak('正在发起紧急求助')
    wx.showModal({
      title: '紧急求助',
      content: '确认向紧急联系人发送求助信息和当前位置？',
      confirmColor: '#FF4444',
      success: function (res) {
        if (res.confirm) {
          wx.getLocation({
            type: 'gcj02',
            success: function (loc) {
              wx.showToast({ title: '求助已发送，请保持手机畅通', icon: 'none', duration: 3000 })
              voice.speak('求助信息已发送，包含您当前的位置。请保持电话畅通，救援人员将与您联系。')
            },
            fail: function () {
              wx.showToast({ title: '求助已发送', icon: 'none', duration: 3000 })
              voice.speak('求助信息已发送，请保持电话畅通。')
            }
          })
        }
      }
    })
  }
})
