App({
  globalData: {
    userInfo: null,
    cartItems: [],
    voiceEnabled: true,
    langAssistEnabled: false,
    currentLang: 'zh',
    fontSizeMode: 'normal',
    cachedCategories: null,
    loginChecked: false
  },

  onLaunch: function () {
    var fontSize = wx.getStorageSync('fontSizeMode') || 'normal'
    var voiceEn = wx.getStorageSync('voiceEnabled')
    var langAssist = wx.getStorageSync('langAssistEnabled') || false
    var currentLang = wx.getStorageSync('currentLang') || 'zh'
    var cartItems = wx.getStorageSync('cartItems') || []

    this.globalData.fontSizeMode = fontSize
    this.globalData.voiceEnabled = voiceEn !== false
    this.globalData.langAssistEnabled = langAssist
    this.globalData.currentLang = currentLang
    this.globalData.cartItems = cartItems

    var cachedUser = wx.getStorageSync('userInfo')
    if (cachedUser && cachedUser.openid) {
      this.globalData.userInfo = cachedUser
      this.globalData.loginChecked = true
    }

    setTimeout(function() { this.preloadCommonData() }.bind(this), 500)
    this.autoLogin()
  },

  preloadCommonData: function () {
    var api = require('./utils/api.js')
    api.getCategories().then(function(cats) {
      getApp().globalData.cachedCategories = cats
    }).catch(function() {})
  },

  updateVoiceEnabled: function (enabled) {
    this.globalData.voiceEnabled = enabled
    wx.setStorageSync('voiceEnabled', enabled)
  },

  updateLangAssist: function (enabled) {
    this.globalData.langAssistEnabled = enabled
    wx.setStorageSync('langAssistEnabled', enabled)
    var pages = getCurrentPages()
    for (var i = 0; i < pages.length; i++) {
      if (pages[i] && pages[i].setData) {
        pages[i].setData({ langAssistEnabled: enabled })
      }
    }
  },

  updateCurrentLang: function (lang) {
    this.globalData.currentLang = lang
    wx.setStorageSync('currentLang', lang)
    var pages = getCurrentPages()
    for (var i = 0; i < pages.length; i++) {
      if (pages[i] && pages[i].setData) {
        pages[i].setData({ currentLang: lang })
      }
    }
  },

  updateFontSize: function (mode) {
    this.globalData.fontSizeMode = mode
    wx.setStorageSync('fontSizeMode', mode)
    var pages = getCurrentPages()
    for (var i = 0; i < pages.length; i++) {
      if (pages[i] && pages[i].setData) {
        pages[i].setData({ fontSizeMode: mode })
      }
    }
  },

  autoLogin: function () {
    var self = this
    var cachedUser = wx.getStorageSync('userInfo')

    if (cachedUser && cachedUser.openid) {
      self.globalData.userInfo = cachedUser
      self.globalData.loginChecked = true
    }

    wx.login({
      success: function(res) {
        if (res.code && !self.globalData.loginChecked) {
          var api = require('./utils/api.js')
          api.request({
            url: '/users/wxlogin',
            method: 'POST',
            data: { code: res.code },
            showLoading: false
          }).then(function(user) {
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
          }).catch(function(err) {
            console.warn('自动登录失败:', err)
            self.globalData.loginChecked = true
          })
        } else {
          self.globalData.loginChecked = true
        }
      },
      fail: function() {
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
      success: function(res) {
        if (res.confirm) wx.switchTab({ url: '/pages/user/user' })
      }
    })
  },

  isLoggedIn: function () {
    return !!(this.globalData.userInfo && this.globalData.userInfo.openid)
  }
})
