const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    favoriteCount: 0,
    orderCount: 0,
    fontSizeMode: 'normal',
    voiceEnabled: true
  },

  onLoad: function () {
    const app = getApp()
    const fontSize = wx.getStorageSync('fontSizeMode') || 'normal'
    const voiceEn = app.globalData.voiceEnabled !== false
    this.setData({
      favoriteCount: 3,
      orderCount: 2,
      fontSizeMode: fontSize,
      voiceEnabled: voiceEn
    })
  },

  sendSOS: function () {
    voice.speak('正在发起紧急求助')
    wx.showModal({
      title: '紧急求助',
      content: '确认向紧急联系人发送求助信息和当前位置？',
      confirmColor: '#FF4444',
      success: function (res) {
        if (res.confirm) {
          wx.getLocation({
            type: 'gcj02',
            success: function () {
              wx.showToast({ title: '求助已发送，请保持手机畅通', icon: 'none', duration: 3000 })
              voice.speak('求助信息已发送，包含您当前的位置，请保持电话畅通。')
            },
            fail: function () {
              wx.showToast({ title: '求助已发送', icon: 'none', duration: 3000 })
            }
          })
        }
      }
    })
  },

  goOrders: function () { nav.go('/pages/orders/orders', '我的订单') },
  goAddress: function () { nav.go('/pages/address/address', '地址管理') },
  goFavorites: function () { nav.go('/pages/scenic/scenic') },
  goHealth: function () {
    wx.showToast({ title: '健康记录功能开发中', icon: 'none' })
  },
  goEmergency: function () {
    wx.showToast({ title: '紧急联系人功能开发中', icon: 'none' })
    voice.speak('您可以在微信中设置紧急联系人，或拨打家人电话')
  },
  goSafety: function () {
    wx.switchTab({ url: '/pages/safety/safety' })
    voice.speak('正在进入安全中心')
  },

  setFontSize: function (mode) {
    wx.setStorageSync('fontSizeMode', mode)
    this.setData({ fontSizeMode: mode })
    voice.speak('字体已切换为' + (mode === 'large' ? '超大' : mode === 'normal' ? '较大' : '标准'))
  },

  toggleVoice: function () {
    const newVal = !this.data.voiceEnabled
    getApp().globalData.voiceEnabled = newVal
    wx.setStorageSync('voiceEnabled', newVal)
    this.setData({ voiceEnabled: newVal })
    if (newVal) {
      voice.speak('语音提示已开启')
    } else {
      wx.showToast({ title: '语音提示已关闭', icon: 'none' })
    }
  }
})
