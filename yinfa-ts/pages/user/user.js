const app = getApp()
const voice = require('../../utils/voice.js')
const api = require('../../utils/api.js')

Page({
  data: {
    favoriteCount: 3,
    orderCount: 2,
    voiceEnabled: true,
    fontSizeMode: 'normal',
    sosLoading: false,
    isLoggedIn: false,
    nickname: '桂林游客',
    avatarUrl: ''
  },

  onLoad: function () {
    this.refreshState()
  },

  onShow: function () {
    this.refreshState()
  },

  onTabItemTap: function () {
    this.refreshState()
  },

  refreshState: function () {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    const isLoggedIn = !!(userInfo && userInfo.openid)
    const fontSize = wx.getStorageSync('fontSizeMode') || 'normal'
    const voiceEn = app.globalData.voiceEnabled !== false
    const cartItems = app.globalData.cartItems || []

    this.setData({
      isLoggedIn: isLoggedIn,
      nickname: (userInfo && userInfo.nickname) || '桂林游客',
      avatarUrl: (userInfo && userInfo.avatar_url) || '',
      favoriteCount: wx.getStorageSync('favoriteCount') || 3,
      orderCount: wx.getStorageSync('orderCount') || cartItems.reduce((s, i) => s + (i.quantity || 1), 0),
      fontSizeMode: fontSize,
      voiceEnabled: voiceEn
    })
  },

  doLogin: function () {
    var self = this
    wx.login({
      success: function (loginRes) {
        if (loginRes.code) {
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
      }
    })
  },

  toggleVoice: function () {
    const newVal = !this.data.voiceEnabled
    app.updateVoiceEnabled(newVal)
    this.setData({ voiceEnabled: newVal })
    if (newVal) {
      voice.speak('语音提示已开启')
    }
    wx.showToast({ title: '语音提示已' + (newVal ? '开启' : '关闭'), icon: 'none' })
  },

  setFontSize: function (e) {
    const mode = e.currentTarget.dataset.mode
    app.updateFontSize(mode)
    this.setData({ fontSizeMode: mode })
    wx.showToast({
      title: mode === 'large' ? '已切换超大字体' : mode === 'normal' ? '已切换较大字体' : '已切换标准字体',
      icon: 'none'
    })
  },

  sendSOS: function () {
    if (this.data.sosLoading) return
    var that = this

    wx.showModal({
      title: '🆘 紧急求助',
      content: '即将获取您的位置并通知紧急联系人，确定继续？',
      confirmText: '确定求助',
      confirmColor: '#e74c3c',
      success: function (res) {
        if (res.confirm) {
          that.setData({ sosLoading: true })

          wx.getLocation({
            type: 'gcj02',
            success: function (locRes) {
              const openid = app.globalData.openid || wx.getStorageSync('openid') || 'demo_user'
              api.sendSOSAlert({
                openid,
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
                      if (modalRes.confirm) {
                        wx.makePhoneCall({ phoneNumber: primaryContact.phone })
                      }
                    }
                  })
                } else {
                  wx.makePhoneCall({ phoneNumber: '110' })
                }

                that.setData({ sosLoading: false })
              }).catch(function () {
                voice.speak('已拨打求助电话，位置已发送给家人，请保持冷静等待救援')
                wx.makePhoneCall({ phoneNumber: '110' })
                wx.showToast({ title: '已启动紧急求助', icon: 'none' })
                that.setData({ sosLoading: false })
              })
            },
            fail: function () {
              voice.speak('位置获取失败，已拨打求助电话，请保持冷静等待救援')
              wx.makePhoneCall({ phoneNumber: '110' })
              wx.showToast({ title: '已启动紧急求助(未获取到位置)', icon: 'none' })
              that.setData({ sosLoading: false })
            }
          })
        }
      }
    })
  },

  goOrders: function () {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  goAddress: function () {
    wx.navigateTo({ url: '/pages/address/address' })
  },

  goFavorites: function () {
    voice.speak('收藏功能开发中，敬请期待')
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  goHealth: function () {
    wx.navigateTo({ url: '/pages/health/health' })
  },

  goEmergency: function () {
    wx.navigateTo({ url: '/pages/emergency/emergency' })
  },

  goSafety: function () {
    wx.navigateTo({ url: '/pages/safety/safety' })
  }
})
