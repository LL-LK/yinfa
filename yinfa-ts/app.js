App({
  globalData: {
    userInfo: null,
    cartItems: [],
    voiceEnabled: true,
    fontSizeMode: 'normal',
    cachedCategories: null,
    loginChecked: false
  },

  onLaunch: function () {
    const fontSize = wx.getStorageSync('fontSizeMode') || 'normal'
    const voiceEn = wx.getStorageSync('voiceEnabled')
    const cartItems = wx.getStorageSync('cartItems') || []

    this.globalData.fontSizeMode = fontSize
    this.globalData.voiceEnabled = voiceEn !== false
    this.globalData.cartItems = cartItems

    this.preloadCommonData()
    this.setupFontSize()
    this.autoLogin()
  },

  preloadCommonData: function () {
    const api = require('./utils/api.js')
    api.getCategories().then(cats => {
      getApp().globalData.cachedCategories = cats
    }).catch(() => {})
  },

  setupFontSize: function () {
    const mode = this.globalData.fontSizeMode
    if (mode === 'large' || mode === 'normal') {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (currentPage && currentPage.setData) {
        try {
          currentPage.setData({ _fontLarge: mode === 'large' })
        } catch (e) {}
      }
    }
  },

  updateVoiceEnabled: function (enabled) {
    this.globalData.voiceEnabled = enabled
    wx.setStorageSync('voiceEnabled', enabled)
  },

  updateFontSize: function (mode) {
    this.globalData.fontSizeMode = mode
    wx.setStorageSync('fontSizeMode', mode)
  },

  autoLogin: function () {
    var self = this
    wx.login({
      success: function (res) {
        if (res.code) {
          var api = require('./utils/api.js')
          api.request({
            url: '/users/wxlogin',
            method: 'POST',
            data: { code: res.code },
            showLoading: false
          }).then(function (user) {
            self.globalData.userInfo = {
              openid: user.openid,
              nickname: user.nickname || '桂林游客',
              avatar_url: user.avatar_url || '',
              phone: user.phone || ''
            }
            self.globalData.openid = user.openid
            self.globalData.loginChecked = true
            wx.setStorageSync('userInfo', self.globalData.userInfo)
            wx.setStorageSync('openid', user.openid)
          }).catch(function (err) {
            console.warn('自动登录失败，使用离线模式:', err)
            const cachedUser = wx.getStorageSync('userInfo')
            if (cachedUser && cachedUser.openid) {
              self.globalData.userInfo = cachedUser
            }
            self.globalData.loginChecked = true
          })
        } else {
          console.warn('wx.login 获取code失败')
          self.globalData.loginChecked = true
        }
      },
      fail: function (err) {
        console.warn('wx.login 失败:', err)
        const cachedUser = wx.getStorageSync('userInfo')
        if (cachedUser && cachedUser.openid) {
          self.globalData.userInfo = cachedUser
        }
        self.globalData.loginChecked = true
      }
    })
  },

  toLogin: function () {
    wx.showModal({
      title: '需要登录',
      content: '登录后查看订单和管理地址',
      confirmText: '去登录',
      cancelText: '稍后',
      success: function (res) {
        if (res.confirm) {
          wx.switchTab({ url: '/pages/user/user' })
        }
      }
    })
  },

  isLoggedIn: function () {
    return !!(this.globalData.userInfo && this.globalData.userInfo.openid)
  }
})