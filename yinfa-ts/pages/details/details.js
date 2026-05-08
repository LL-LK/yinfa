const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

function getOpenid() {
  return (app.globalData.userInfo && app.globalData.userInfo.openid) || ''
}

Page({
  data: {
    product: null,
    quantity: 1,
    loading: true
  },

  onLoad: function (options) {
    const id = options.id
    this.loadProduct(id)
  },

  loadProduct: function (id) {
    api.getProductById(id).then(res => {
      this.setData({ product: res, loading: false })
    }).catch(err => {
      console.error('加载商品详情失败:', err)
      wx.showToast({ title: '加载失败，请重试', icon: 'none', duration: 2000 })
      this.setData({ loading: false })
    })
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
    const p = this.data.product
    if (!p) return

    const openid = getOpenid()
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

    api.addToCart(openid, p.id, this.data.quantity).then(() => {
      wx.showToast({ title: '已添加到购物车', icon: 'success' })
      voice.speak(p.name + '已添加到购物车，当前数量' + this.data.quantity + '件')
      const cartItems = app.globalData.cartItems || []
      const exist = cartItems.find(item => item.id === p.id)
      if (exist) {
        exist.quantity += this.data.quantity
      } else {
        cartItems.push({
          id: p.id, name: p.name, price: p.price,
          image: p.image_url || '/image/icon3.webp',
          quantity: this.data.quantity
        })
      }
      app.globalData.cartItems = cartItems
    }).catch(() => {
      wx.showToast({ title: '加入购物车失败', icon: 'none' })
    })
  },

  buyNow: function () {
    this.addToCart()
    nav.go('/pages/cart/cart')
  },

  playVoiceIntro: function () {
    var product = this.data.product;
    if (!product) return;
    wx.showLoading({ title: '正在加载语音...' });
    var innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = product.voiceUrl || '';
    innerAudioContext.play();
    wx.hideLoading();
    var self = this;
    innerAudioContext.onError(function () {
      wx.showToast({ title: '语音加载失败', icon: 'none' });
    });
    innerAudioContext.onEnded(function () {
      innerAudioContext.destroy();
    });
  }
})
