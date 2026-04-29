const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onLoad: function () {
    this.loadUser()
  },

  loadUser: function () {
    app.request({
      url: '/users/test_openid',
      method: 'GET'
    }).then(res => {
      this.setData({
        userInfo: res
      })
    }).catch(err => {
      console.error('加载用户信息失败:', err)
    })
  },

  goAddress: function () {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  goOrders: function () {
    wx.navigateTo({
      url: '/pages/orders/orders'
    })
  },

  goCart: function () {
    wx.switchTab({
      url: '/pages/cart/cart'
    })
  },

  goHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})