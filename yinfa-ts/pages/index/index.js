const app = getApp()

Page({
  data: {
    imgUrls: [
      '/image/b1.jpg',
      '/image/b2.jpg',
      '/image/b3.jpg'
    ],
    modules: [
      { name: '漓江景点', path: '/pages/scenic/scenic', emoji: '🏔️', desc: '桂林山水', bg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' },
      { name: '桂林美食', path: '/pages/food/food', emoji: '🍜', desc: '地方特色', bg: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' },
      { name: '交通出行', path: '/pages/transport/transport', emoji: '🚌', desc: '便捷出行', bg: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)' },
      { name: '防滑指南', path: '/pages/safety/safety', emoji: '🛡️', desc: '安全提醒', bg: 'linear-gradient(135deg, #FCE4EC, #F8BBD0)' },
      { name: '实时路况', path: '/pages/traffic/traffic', emoji: '🚦', desc: '路况查看', bg: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)' },
      { name: '一键求助', path: '', emoji: '🆘', desc: '紧急联系', bg: 'linear-gradient(135deg, #FFEBEE, #FFCDD2)' },
      { name: '我的订单', path: '/pages/orders/orders', emoji: '📋', desc: '查看订单', bg: 'linear-gradient(135deg, #E0F2F1, #B2DFDB)' },
      { name: '个人中心', path: '/pages/user/user', emoji: '👤', desc: '我的信息', bg: 'linear-gradient(135deg, #FFF8E1, #FFECB3)' }
    ],
    products: [],
    loading: true,
    weatherTip: {
      icon: '☁️',
      text: '今日桂林 多云转晴 18°C~26°C',
      detail: '适宜出行 · 空气质量优良 · 路面干燥'
    }
  },

  onLoad: function () {
    this.loadProducts()
  },

  loadProducts: function () {
    app.request({
      url: '/products',
      method: 'GET'
    }).then(res => {
      const guilinProducts = res.slice(0, 6).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image_url,
        tag: ['热门', '推荐', '必去', '特惠', '新品', '经典'][Math.floor(Math.random() * 6)]
      }))
      
      this.setData({ products: guilinProducts, loading: false })
    }).catch(() => {
      this.setData({
        products: [
          { id: 1, name: '漓江精华游船票', price: 215, image: '/image/b1.jpg', tag: '热门' },
          { id: 2, name: '象鼻山公园门票', price: 55, image: '/image/b2.jpg', tag: '必去' },
          { id: 3, name: '桂林米粉套餐', price: 38, image: '/image/72.png', tag: '推荐' },
          { id: 4, name: '阳朔西街一日游', price: 168, image: '/image/b3.jpg', tag: '特惠' },
          { id: 5, name: '龙脊梯田观光', price: 180, image: '/image/1.jpg', tag: '新品' },
          { id: 6, name: '两江四湖夜游', price: 220, image: '/image/2.jpg', tag: '经典' }
        ],
        loading: false
      })
    })
  },

  goPage: function (e) {
    const path = e.currentTarget.dataset.path
    if (!path) {
      this.callHelp()
      return
    }
    wx.navigateTo({ url: path })
  },

  goDetails: function (e) {
    wx.navigateTo({
      url: '/pages/details/details?id=' + e.currentTarget.dataset.id
    })
  },

  goSafety: function () {
    wx.switchTab({ url: '/pages/safety/safety' })
  },

  goTraffic: function () {
    wx.navigateTo({ url: '/pages/traffic/traffic' })
  },

  goMore: function () {
    wx.navigateTo({ url: '/pages/scenic/scenic' })
  },

  callHelp: function () {
    wx.showModal({
      title: '一键求助',
      content: '即将拨打桂林旅游服务热线\n0773-XXXXXXX',
      confirmText: '立即拨打',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '07731234567' })
        }
      }
    })
  }
})
