const api = require('./utils/api.js')
const voice = require('./utils/voice.js')

App({
  globalData: {
    cartItems: [],
    userInfo: null,
    fontSizeMode: wx.getStorageSync('fontSizeMode') || 'normal',
    voiceEnabled: wx.getStorageSync('voiceEnabled') !== false
  },

  onLaunch: function () {
    voice.speak('欢迎使用桂林银发旅游，祝您旅途愉快')
  },

  request: api.request,

  getCategories: api.getCategories,

  getProducts: api.getProducts,

  getProductById: api.getProductById
})
