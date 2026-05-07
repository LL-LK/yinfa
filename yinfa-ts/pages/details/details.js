const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

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

    const cartItems = app.globalData.cartItems || []
    const exist = cartItems.find(item => item.id === p.id)

    if (exist) {
      exist.quantity += this.data.quantity
    } else {
      cartItems.push({
        id: p.id, name: p.name, price: p.price,
        image: p.image_url || '/image/default.jpg',
        quantity: this.data.quantity
      })
    }

    app.globalData.cartItems = cartItems
    voice.speak(p.name + '已添加到购物车，当前数量' + this.data.quantity + '件')
    wx.showToast({ title: '已添加到购物车', icon: 'success' })
  },

  buyNow: function () {
    this.addToCart()
    nav.go('/pages/cart/cart')
  }
})
