const app = getApp()

Page({
  data: {
    orders: [],
    cartItems: []
  },

  onLoad: function () {
    this.setData({
      cartItems: app.globalData.cartItems || []
    })
    this.loadOrders()
  },

  loadOrders: function () {
    app.request({
      url: '/orders',
      method: 'GET',
      data: { openid: 'test_openid' }
    }).then(res => {
      this.setData({
        orders: res
      })
    }).catch(err => {
      console.error('加载订单失败:', err)
    })
  },

  createOrder: function () {
    const cartItems = app.globalData.cartItems || []
    
    if (cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      })
      return
    }

    const items = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }))

    app.request({
      url: '/order/create',
      method: 'POST',
      data: {
        openid: 'test_openid',
        items: items
      }
    }).then(res => {
      wx.showToast({
        title: '订单创建成功',
        icon: 'success'
      })
      app.globalData.cartItems = []
      this.loadOrders()
    }).catch(err => {
      console.error('创建订单失败:', err)
      wx.showToast({
        title: '创建订单失败',
        icon: 'none'
      })
    })
  }
})