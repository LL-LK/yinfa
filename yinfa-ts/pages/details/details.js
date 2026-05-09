var app = getApp()
var api = require('../../utils/api.js')
var voice = require('../../utils/voice.js')
var nav = require('../../utils/navigate.js')
var IMG = require('../../utils/image-paths.js')

var FALLBACK_PRODUCTS = {
  1: { id: 1, name: '漓江精华段', price: 215, image_url: IMG.SCENIC.b1, description: '桂林山水精华，乘船欣赏黄布倒影、九马画山等经典景观。', stock: 999, wheelchairAccess: true, restArea: '充足', suggestedDuration: '4小时', stairsCount: 0, tag_name: '5A景区', voiceUrl: '' },
  2: { id: 2, name: '象鼻山公园', price: 55, image_url: IMG.SCENIC.b2, description: '桂林城徽象鼻山，形状酷似大象饮水，是桂林的标志性景点。', stock: 999, wheelchairAccess: false, restArea: '一般', suggestedDuration: '1.5小时', stairsCount: 80, tag_name: '5A景区', voiceUrl: '' },
  3: { id: 3, name: '阳朔西街', price: 0, image_url: IMG.SCENIC.b3, description: '中西文化交融的千年古街，可品尝地道啤酒鱼和桂林米粉。', stock: 999, wheelchairAccess: true, restArea: '充足', suggestedDuration: '2小时', stairsCount: 0, tag_name: '4A景区', voiceUrl: '' },
  4: { id: 4, name: '龙脊梯田', price: 80, image_url: IMG.SCENIC.b1, description: '世界人工奇观，层层梯田从山脚盘绕到山顶，秋季金黄最美。', stock: 999, wheelchairAccess: false, restArea: '一般', suggestedDuration: '半天', stairsCount: 200, tag_name: '4A景区', voiceUrl: '' },
  5: { id: 5, name: '芦笛岩', price: 90, image_url: IMG.SCENIC.b2, description: '著名溶洞景观，钟乳石千姿百态，被誉为"大自然艺术之宫"。', stock: 999, wheelchairAccess: false, restArea: '一般', suggestedDuration: '1.5小时', stairsCount: 60, tag_name: '4A景区', voiceUrl: '' },
  6: { id: 6, name: '两江四湖', price: 220, image_url: IMG.SCENIC.b3, description: '桂林市中心环城水系，夜游灯光璀璨，景色迷人。', stock: 999, wheelchairAccess: true, restArea: '充足', suggestedDuration: '2小时', stairsCount: 0, tag_name: '5A景区', voiceUrl: '' },
  7: { id: 7, name: '杨堤码头', price: 160, image_url: IMG.SCENIC.b1, description: '漓江竹筏漂流的起点，欣赏漓江美景的最佳方式。', stock: 999, wheelchairAccess: false, restArea: '充足', suggestedDuration: '2小时', stairsCount: 0, tag_name: '漓江精华段起点', voiceUrl: '' }
}

function getOpenid() {
  return (app.globalData.userInfo && app.globalData.userInfo.openid) || ''
}

Page({
  data: {
    product: null,
    quantity: 1,
    loading: true,
    loadError: false,
    isFavorited: false,
    fontSizeMode: 'normal'
  },

  onLoad: function (options) {
    this.setData({ fontSizeMode: app.globalData.fontSizeMode || 'normal' })
    var id = options.id
    this.loadProduct(id)
    this.checkFavorite(id)
  },

  checkFavorite: function (id) {
    try {
      var favs = wx.getStorageSync('user_favorites') || []
      var idx = favs.findIndex(function(f) { return f.id == id })
      this.setData({ isFavorited: idx !== -1 })
    } catch(e) {}
  },

  toggleFavorite: function () {
    var self = this
    var p = this.data.product
    if (!p) return
    try {
      var favs = wx.getStorageSync('user_favorites') || []
      var idx = favs.findIndex(function(f) { return f.id == p.id })
      if (idx === -1) {
        favs.push({ id: p.id, name: p.name, price: p.price, image_url: p.image_url })
        self.setData({ isFavorited: true })
        wx.showToast({ title: '已收藏', icon: 'success' })
        voice.speak(p.name + '已加入收藏')
      } else {
        favs.splice(idx, 1)
        self.setData({ isFavorited: false })
        wx.showToast({ title: '已取消收藏', icon: 'none' })
      }
      wx.setStorageSync('user_favorites', favs)
    } catch(e) {}
  },

  loadProduct: function (id) {
    var self = this
    this.setData({ loading: true, loadError: false })

    api.getProductById(id).then(function(res) {
      self.setData({ product: res, loading: false, loadError: false })
    }).catch(function(err) {
      console.warn('加载商品详情失败:', err)
      var fallback = FALLBACK_PRODUCTS[id]
      if (fallback) {
        self.setData({ product: fallback, loading: false, loadError: false })
      } else {
        self.setData({ loading: false, loadError: true })
      }
    })
  },

  retryLoad: function () {
    var pages = getCurrentPages()
    if (pages.length > 0) {
      var options = pages[pages.length - 1].options || {}
      if (options.id) this.loadProduct(options.id)
    }
  },

  decrease: function () {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 })
    }
  },

  increase: function () {
    this.setData({ quantity: this.data.quantity + 1 })
  },

  addToCart: function () {
    var p = this.data.product
    if (!p) return

    var openid = getOpenid()
    if (!openid) {
      wx.showModal({
        title: '需要登录',
        content: '登录后才能将商品加入购物车',
        confirmText: '去登录',
        cancelText: '稍后',
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/user/user' })
          }
        }
      })
      return
    }

    api.addToCart(openid, p.id, this.data.quantity).then(function() {
      wx.showToast({ title: '已添加到购物车', icon: 'success' })
      voice.speak(p.name + '已添加到购物车，当前数量' + self.data.quantity + '件')

      var cartItems = app.globalData.cartItems || []
      var exist = cartItems.find(function(item) { return item.id === p.id })
      if (exist) {
        exist.quantity += self.data.quantity
      } else {
        cartItems.push({
          id: p.id, name: p.name, price: p.price,
          image: p.image_url || IMG.FALLBACK,
          quantity: self.data.quantity
        })
      }
      app.globalData.cartItems = cartItems
    }).catch(function() {
      wx.showToast({ title: '加入购物车失败', icon: 'none' })
    })
  },

  buyNow: function () {
    this.addToCart()
    nav.go('/pages/cart/cart')
  },

  playVoiceIntro: function () {
    var product = this.data.product
    if (!product) return
    wx.showLoading({ title: '正在加载语音...' })
    var innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = product.voiceUrl || ''
    innerAudioContext.play()
    wx.hideLoading()
    var self = this
    innerAudioContext.onError(function () {
      wx.showToast({ title: '语音加载失败', icon: 'none' })
    })
    innerAudioContext.onEnded(function () {
      innerAudioContext.destroy()
    })
  }
})