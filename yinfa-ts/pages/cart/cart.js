const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

function getOpenid() {
  return (app.globalData.userInfo && app.globalData.userInfo.openid) || ''
}

function updateTabBadge(count) {
  if (count > 0) {
    wx.setTabBarBadge({
      index: 2,
      text: count > 99 ? '99+' : String(count)
    }).catch(() => {})
  } else {
    wx.removeTabBarBadge({ index: 2 }).catch(() => {})
  }
}

Page({
  data: {
    cartItems: [],
    totalPrice: 0,
    loading: true,
    cartItemIds: {},
    fontSizeMode: 'normal'
  },

  onShow: function () {
    this.setData({ fontSizeMode: app.globalData.fontSizeMode || 'normal' })
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.loadCart()
  },

  loadCart: function () {
    const openid = getOpenid()
    if (!openid) {
      this.setData({ cartItems: [], totalPrice: 0, loading: false })
      updateTabBadge(0)
      return
    }

    this.setData({ loading: true })

    api.getCart(openid).then(items => {
      const list = Array.isArray(items) ? items : []
      const total = list.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0)
      const ids = {}
      list.forEach(i => { ids[i.product_id] = i.id })
      this.setData({
        cartItems: list.map(item => ({
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          image: item.image || '/image/icon3.webp',
          quantity: item.quantity
        })),
        totalPrice: total,
        cartItemIds: ids,
        loading: false
      })
      updateTabBadge(list.length)
      app.globalData.cartItems = list
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  decrease: function (e) {
    const idx = e.currentTarget.dataset.index
    const item = this.data.cartItems[idx]
    if (!item) return

    const openid = getOpenid()
    if (!openid) return

    const newQty = item.quantity - 1
    if (newQty <= 0) {
      this.removeItem(e)
      return
    }

    api.updateCartQuantity(item.id, newQty).then(() => {
      voice.speak(item.name + '数量减少为' + newQty + '件')
    }).catch(() => {})

    const items = this.data.cartItems
    items[idx].quantity = newQty
    const total = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0)
    this.setData({ cartItems: items, totalPrice: total })
  },

  increase: function (e) {
    const idx = e.currentTarget.dataset.index
    const item = this.data.cartItems[idx]
    if (!item) return

    const openid = getOpenid()
    if (!openid) return

    const newQty = item.quantity + 1
    api.updateCartQuantity(item.id, newQty).catch(() => {})

    const items = this.data.cartItems
    items[idx].quantity = newQty
    const total = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0)
    voice.speak(item.name + '数量增加为' + newQty + '件')
    this.setData({ cartItems: items, totalPrice: total })
  },

  removeItem: function (e) {
    const idx = e.currentTarget.dataset.index
    const item = this.data.cartItems[idx]
    if (!item) return

    this.confirmRemove(idx, item.name)
  },

  confirmRemove: function (idx, name) {
    wx.showModal({
      title: '确认删除',
      content: '确定要从购物车中删除' + name + '吗？',
      confirmColor: '#07C160',
      success: (res) => {
        if (res.confirm) {
          const item = this.data.cartItems[idx]
          if (!item) return
          api.removeFromCart(item.id).catch(() => {})
          const items = this.data.cartItems.filter((_, i) => i !== idx)
          const total = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0)
          voice.speak(name + '已从购物车中移除')
          this.setData({ cartItems: items, totalPrice: total })
          updateTabBadge(items.length)
          app.globalData.cartItems = items
        }
      }
    })
  },

  checkout: function () {
    const openid = getOpenid()
    if (!openid) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      voice.speak('请先在"我的"页面登录后再结算')
      return
    }

    if (this.data.cartItems.length === 0) {
      voice.speak('购物车为空，请先去选购商品')
      wx.showToast({ title: '购物车为空', icon: 'none' })
      return
    }

    voice.speak('正在结算，共' + this.data.cartItems.length + '件商品，合计' + this.data.totalPrice + '元')

    const orderItems = this.data.cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }))

    api.request({
      url: '/order/create',
      method: 'POST',
      data: { openid, items: orderItems },
      showLoading: true
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '订单创建成功，待支付', icon: 'success' })
      voice.speak('下单成功，已为您生成订单')
      api.clearCart(openid).catch(() => {})
      this.setData({ cartItems: [], totalPrice: 0 })
      updateTabBadge(0)
      app.globalData.cartItems = []
      setTimeout(() => {
        nav.go('/pages/orders/orders')
      }, 800)
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '下单失败，请重试', icon: 'none' })
      voice.speak('下单失败，请重试')
    })
  },

  goHome: function () {
    wx.switchTab({ url: '/pages/index/index' })
  }
})