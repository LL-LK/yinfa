const app = getApp()
const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    cartItems: [],
    totalPrice: 0
  },

  onShow: function () {
    this.loadCart()
  },

  loadCart: function () {
    const items = app.globalData.cartItems || []
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
    this.setData({ cartItems: items, totalPrice: total })
  },

  decrease: function (e) {
    const idx = e.currentTarget.dataset.index
    const items = this.data.cartItems
    if (items[idx].quantity > 1) {
      items[idx].quantity--
      voice.speak(items[idx].name + '数量减少为' + items[idx].quantity + '件')
    } else {
      const name = items[idx].name
      items.splice(idx, 1)
      voice.speak(name + '已从购物车中移除')
    }
    app.globalData.cartItems = items
    this.loadCart()
  },

  increase: function (e) {
    const idx = e.currentTarget.dataset.index
    const items = this.data.cartItems
    items[idx].quantity++
    voice.speak(items[idx].name + '数量增加为' + items[idx].quantity + '件')
    app.globalData.cartItems = items
    this.loadCart()
  },

  removeItem: function (e) {
    const idx = e.currentTarget.dataset.index
    const items = this.data.cartItems
    const name = items[idx].name
    items.splice(idx, 1)
    voice.speak(name + '已从购物车中移除')
    app.globalData.cartItems = items
    this.loadCart()
  },

  checkout: function () {
    if (this.data.cartItems.length === 0) {
      voice.speak('购物车为空，请先去选购商品')
      wx.showToast({ title: '购物车为空', icon: 'none' })
      return
    }
    voice.speak('正在结算，共' + this.data.cartItems.length + '件商品，合计' + this.data.totalPrice + '元')
    nav.go('/pages/orders/orders')
  }
})
