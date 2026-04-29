const app = getApp()

Page({
  data: {
    cartItems: [],
    totalPrice: 0
  },

  onShow: function () {
    this.loadCart()
  },

  loadCart: function () {
    const cartItems = app.globalData.cartItems || []
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    
    this.setData({
      cartItems: cartItems,
      totalPrice: totalPrice
    })
  },

  decrease: function (e) {
    const index = e.currentTarget.dataset.index
    const cartItems = this.data.cartItems
    
    if (cartItems[index].quantity > 1) {
      cartItems[index].quantity--
    } else {
      cartItems.splice(index, 1)
    }
    
    app.globalData.cartItems = cartItems
    this.loadCart()
  },

  increase: function (e) {
    const index = e.currentTarget.dataset.index
    const cartItems = this.data.cartItems
    cartItems[index].quantity++
    app.globalData.cartItems = cartItems
    this.loadCart()
  },

  removeItem: function (e) {
    const index = e.currentTarget.dataset.index
    const cartItems = this.data.cartItems
    cartItems.splice(index, 1)
    app.globalData.cartItems = cartItems
    this.loadCart()
  },

  checkout: function () {
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/orders/orders'
    })
  }
})