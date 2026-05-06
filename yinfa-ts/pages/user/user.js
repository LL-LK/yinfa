const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onLoad: function () {
    this.loadUser()
  },

  loadUser: function () {
    const openid = wx.getStorageSync('openid') || 'test_openid'
    
    app.request({
      url: '/users/' + openid,
      method: 'GET'
    }).then(res => {
      this.setData({
        userInfo: res
      })
    }).catch(err => {
      console.log('用户未注册，尝试注册...')
      app.request({
        url: '/users/login',
        method: 'POST',
        data: {
          openid: openid,
          nickname: '测试用户',
          avatar_url: '',
          phone: ''
        }
      }).then(res => {
        this.setData({
          userInfo: res
        })
        wx.setStorageSync('openid', openid)
      }).catch(err => {
        console.error('加载用户信息失败:', err)
      })
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