var app = getApp()
var voice = require('../../utils/voice.js')
var api = require('../../utils/api.js')

var FAVORITES_KEY = 'user_favorites'
var MENU_ITEMS = [
  { id: 'orders',    icon: '📋', name: '我的订单',   url: '/pages/orders/orders' },
  { id: 'address',   icon: '📍', name: '地址管理',   url: '/pages/address/address' },
  { id: 'favorites', icon: '❤️', name: '我的收藏',   url: '', badge: true },
  { id: 'health',    icon: '🏥', name: '健康记录',   url: '/pages/health/health' },
  { id: 'emergency', icon: '👨‍👩‍👧', name: '紧急联系人', url: '/pages/emergency/emergency' },
  { id: 'safety',    icon: '🛡️', name: '安全设置',   url: '/pages/safety/safety' }
]

function getFavorites() {
  try { return wx.getStorageSync(FAVORITES_KEY) || [] } catch(e) { return [] }
}

function saveFavorites(list) {
  wx.setStorageSync(FAVORITES_KEY, list)
}

Page({
  data: {
    isLoggedIn: false,
    nickname: '桂林游客',
    avatarUrl: '',
    phone: '',
    favoriteCount: 0,
    orderCount: 0,
    voiceEnabled: true,
    langAssistEnabled: false,
    currentLang: 'zh',
    langClassZh: 'lang-active',
    langClassEn: '',
    langClassJa: '',
    langClassKo: '',
    fontSizeMode: 'normal',
    sosLoading: false,
    menuItems: MENU_ITEMS
  },

  onLoad: function () { this.refreshState() },

  onShow: function () { this.refreshState() },

  onTabItemTap: function () { this.refreshState() },

  computeLangClasses: function (lang) {
    return {
      langClassZh: lang === 'zh' ? 'lang-active' : '',
      langClassEn: lang === 'en' ? 'lang-active' : '',
      langClassJa: lang === 'ja' ? 'lang-active' : '',
      langClassKo: lang === 'ko' ? 'lang-active' : ''
    }
  },

  refreshState: function () {
    var self = this
    var g = app.globalData
    var userInfo = g.userInfo
    var isLoggedIn = !!(userInfo && userInfo.openid)

    var lang = g.currentLang || 'zh'
    var base = this.computeLangClasses(lang)
    base.isLoggedIn = isLoggedIn
    base.nickname = (userInfo && userInfo.nickname) || '桂林游客'
    base.avatarUrl = (userInfo && userInfo.avatar_url) || ''
    base.phone = (userInfo && userInfo.phone) || ''
    base.favoriteCount = getFavorites().length
    base.fontSizeMode = g.fontSizeMode || 'normal'
    base.voiceEnabled = g.voiceEnabled !== false
    base.langAssistEnabled = g.langAssistEnabled || false
    base.currentLang = lang

    if (isLoggedIn) {
      var openid = userInfo.openid
      self.fetchOrderCount(openid)
      api.getCart(openid).then(function(cart) {
        base.orderCount = cart && cart.items ? cart.items.length : 0
        self.setData(base)
      }).catch(function() {
        base.orderCount = 0
        self.setData(base)
      })
    } else {
      base.orderCount = 0
      self.setData(base)
    }

    self.setData(base)
  },

  fetchOrderCount: function (openid) {
    var self = this
    api.request({
      url: '/orders',
      method: 'GET',
      data: { openid: openid },
      showLoading: false
    }).then(function(orders) {
      self.setData({ orderCount: Array.isArray(orders) ? orders.length : 0 })
    }).catch(function() {})
  },

  doLogin: function () {
    var self = this
    wx.login({
      success: function (loginRes) {
        if (!loginRes.code) return
        wx.showLoading({ title: '登录中...' })
        api.request({
          url: '/users/wxlogin',
          method: 'POST',
          data: { code: loginRes.code },
          showLoading: false
        }).then(function (user) {
          wx.hideLoading()
          app.globalData.userInfo = {
            openid: user.openid,
            nickname: user.nickname || '桂林游客',
            avatar_url: user.avatar_url || '',
            phone: user.phone || ''
          }
          app.globalData.openid = user.openid
          app.globalData.loginChecked = true
          wx.setStorageSync('userInfo', app.globalData.userInfo)
          wx.setStorageSync('openid', user.openid)
          wx.showToast({ title: '登录成功', icon: 'success' })
          voice.speak('登录成功，欢迎回来')
          self.refreshState()
        }).catch(function () {
          wx.hideLoading()
          wx.showToast({ title: '登录失败，请重试', icon: 'none' })
          voice.speak('登录失败，请重试')
        })
      }
    })
  },

  doLogout: function () {
    var self = this
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmText: '确定退出',
      confirmColor: '#D32F2F',
      success: function(res) {
        if (res.confirm) {
          app.globalData.userInfo = null
          app.globalData.openid = null
          app.globalData.loginChecked = false
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('openid')
          wx.showToast({ title: '已退出登录', icon: 'none' })
          voice.speak('已退出登录')
          self.refreshState()
        }
      }
    })
  },

  tapMenu: function (e) {
    var id = e.currentTarget.dataset.id
    var item = MENU_ITEMS.find(function(m) { return m.id === id })
    if (!item) return

    if (item.url) {
      wx.navigateTo({ url: item.url })
    } else if (id === 'favorites') {
      this.goFavorites()
    }
  },

  goFavorites: function () {
    var favorites = getFavorites()
    if (favorites.length === 0) {
      wx.showModal({
        title: '我的收藏',
        content: '您还没有收藏任何景点。\n在景点详情页点击「收藏」按钮即可添加。',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#2E8B57'
      })
      return
    }

    var names = favorites.map(function(f, i) {
      return (i + 1) + '. ' + f.name + (f.price > 0 ? ' (¥' + f.price + ')' : ' (免费)')
    }).join('\n')

    wx.showModal({
      title: '我的收藏 (' + favorites.length + '个景点)',
      content: names,
      confirmText: '清空收藏',
      cancelText: '关闭',
      confirmColor: '#D32F2F',
      success: function(res) {
        if (res.confirm) {
          saveFavorites([])
          wx.showToast({ title: '已清空收藏', icon: 'none' })
          this.refreshState && this.refreshState()
        }
      }.bind(this)
    })
  },

  toggleVoice: function () {
    var newVal = !this.data.voiceEnabled
    app.updateVoiceEnabled(newVal)
    this.setData({ voiceEnabled: newVal })
    voice.speak(newVal ? '语音提示已开启' : '')
    wx.showToast({ title: '语音提示已' + (newVal ? '开启' : '关闭'), icon: 'none' })
  },

  toggleLangAssist: function () {
    var newVal = !this.data.langAssistEnabled
    app.updateLangAssist(newVal)
    this.setData({ langAssistEnabled: newVal })
    var msg = newVal ? '语言辅助已开启' : '语言辅助已关闭'
    voice.speak(msg)
    wx.showToast({ title: msg, icon: 'none' })
  },

  setLangAssist: function (e) {
    var lang = e.currentTarget.dataset.lang
    app.updateCurrentLang(lang)
    var data = this.computeLangClasses(lang)
    data.currentLang = lang
    this.setData(data)
    var langNames = { zh: '中文', en: 'English', ja: '日本語', ko: '한국어' }
    var msg = '已切换为' + (langNames[lang] || lang)
    voice.speak(msg)
    wx.showToast({ title: msg, icon: 'none' })
  },

  setFontSize: function (e) {
    var mode = e.currentTarget.dataset.mode
    app.updateFontSize(mode)
    this.setData({ fontSizeMode: mode })
    var labels = { small: '标准字体', normal: '较大字体', large: '超大字体' }
    wx.showToast({ title: '已切换' + (labels[mode] || mode), icon: 'none' })
  },

  goAbout: function () {
    wx.showModal({
      title: '关于桂林银发旅游',
      content: '版本：1.0.0\n\n专为银发群体打造的桂林智慧导览与商城小程序。\n\n提供景点导览、美食推荐、交通出行、安全保障等功能，让老人出游更安心、更便捷。',
      showCancel: false,
      confirmText: '好的',
      confirmColor: '#2E8B57'
    })
  },

  sendSOS: function () {
    if (this.data.sosLoading) return
    var self = this

    wx.showModal({
      title: '🆘 紧急求助',
      content: '即将获取您的位置并通知紧急联系人，确定继续？',
      confirmText: '确定求助',
      confirmColor: '#e74c3c',
      success: function (res) {
        if (!res.confirm) return
        self.setData({ sosLoading: true })

        wx.getLocation({
          type: 'gcj02',
          success: function (locRes) {
            var openid = app.globalData.openid || wx.getStorageSync('openid') || 'demo_user'
            api.sendSOSAlert({
              openid: openid,
              latitude: locRes.latitude,
              longitude: locRes.longitude
            }).then(function (sosRes) {
              voice.speak('已获取您的位置并通知紧急联系人，请保持冷静等待救援')
              wx.showToast({ title: '已启动紧急求助', icon: 'none' })

              var primaryContact = sosRes.contacts && sosRes.contacts.length > 0 ? sosRes.contacts[0] : null
              if (primaryContact && primaryContact.phone) {
                wx.showModal({
                  title: '拨打紧急联系人',
                  content: '即将拨打' + primaryContact.name + '的电话 ' + primaryContact.phone,
                  confirmText: '立即拨打',
                  confirmColor: '#e74c3c',
                  success: function (modalRes) {
                    if (modalRes.confirm) wx.makePhoneCall({ phoneNumber: primaryContact.phone })
                  }
                })
              } else {
                wx.makePhoneCall({ phoneNumber: '110' })
              }
              self.setData({ sosLoading: false })
            }).catch(function () {
              voice.speak('已拨打求助电话，位置已发送给家人，请保持冷静等待救援')
              wx.makePhoneCall({ phoneNumber: '110' })
              wx.showToast({ title: '已启动紧急求助', icon: 'none' })
              self.setData({ sosLoading: false })
            })
          },
          fail: function () {
            voice.speak('位置获取失败，已拨打求助电话，请保持冷静等待救援')
            wx.makePhoneCall({ phoneNumber: '110' })
            wx.showToast({ title: '已启动紧急求助(未获取到位置)', icon: 'none' })
            self.setData({ sosLoading: false })
          }
        })
      }
    })
  }
})
