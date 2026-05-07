App({
  globalData: {
    apiBaseUrl: '',
    userInfo: null,
    cartItems: [],
    fontSizeMode: 'normal',
    favorites: [],
    healthRecord: null,
    emergencyContacts: []
  },

  onLaunch: function () {
    console.log('App Launch')
    this.initApiUrl()
    this.loadCartFromStorage()
    this.loadFavorites()
    this.loadSettings()
    this.loadHealthRecord()
    this.loadEmergencyContacts()
  },

  onShow: function () {
    console.log('App Show')
  },

  onHide: function () {
    console.log('App Hide')
    this.saveCartToStorage()
    this.saveFavorites()
    this.saveSettings()
    this.saveHealthRecord()
    this.saveEmergencyContacts()
  },

  initApiUrl: function() {
    const savedUrl = wx.getStorageSync('apiBaseUrl')
    if (savedUrl) {
      this.globalData.apiBaseUrl = savedUrl
    } else if (process.env.NODE_ENV === 'production') {
      this.globalData.apiBaseUrl = 'https://your-production-domain/api'
    } else {
      this.globalData.apiBaseUrl = 'http://localhost:8000/api'
    }
  },

  setApiUrl: function(url) {
    this.globalData.apiBaseUrl = url
    wx.setStorageSync('apiBaseUrl', url)
  },

  loadCartFromStorage: function() {
    const savedCart = wx.getStorageSync('cartItems')
    if (savedCart) {
      this.globalData.cartItems = JSON.parse(savedCart)
    } else {
      this.globalData.cartItems = []
    }
  },

  saveCartToStorage: function() {
    wx.setStorageSync('cartItems', JSON.stringify(this.globalData.cartItems))
  },

  loadFavorites: function() {
    const saved = wx.getStorageSync('favorites')
    if (saved) {
      this.globalData.favorites = JSON.parse(saved)
    } else {
      this.globalData.favorites = []
    }
  },

  saveFavorites: function() {
    wx.setStorageSync('favorites', JSON.stringify(this.globalData.favorites))
  },

  addFavorite: function(item) {
    const exists = this.globalData.favorites.find(f => f.id === item.id)
    if (!exists) {
      this.globalData.favorites.push(item)
      this.saveFavorites()
      return true
    }
    return false
  },

  removeFavorite: function(id) {
    this.globalData.favorites = this.globalData.favorites.filter(f => f.id !== id)
    this.saveFavorites()
  },

  isFavorite: function(id) {
    return this.globalData.favorites.some(f => f.id === id)
  },

  loadSettings: function() {
    const saved = wx.getStorageSync('settings')
    if (saved) {
      const settings = JSON.parse(saved)
      this.globalData.fontSizeMode = settings.fontSizeMode || 'normal'
    }
  },

  saveSettings: function() {
    wx.setStorageSync('settings', JSON.stringify({
      fontSizeMode: this.globalData.fontSizeMode
    }))
  },

  setFontSizeMode: function(mode) {
    this.globalData.fontSizeMode = mode
    this.saveSettings()
  },

  loadHealthRecord: function() {
    const saved = wx.getStorageSync('healthRecord')
    if (saved) {
      this.globalData.healthRecord = JSON.parse(saved)
    }
  },

  saveHealthRecord: function() {
    if (this.globalData.healthRecord) {
      wx.setStorageSync('healthRecord', JSON.stringify(this.globalData.healthRecord))
    }
  },

  loadEmergencyContacts: function() {
    const saved = wx.getStorageSync('emergencyContacts')
    if (saved) {
      this.globalData.emergencyContacts = JSON.parse(saved)
    } else {
      this.globalData.emergencyContacts = []
    }
  },

  saveEmergencyContacts: function() {
    wx.setStorageSync('emergencyContacts', JSON.stringify(this.globalData.emergencyContacts))
  },

  speak: function(text) {
    if (wx.showModal) {
      wx.showModal({
        title: '语音提示',
        content: text,
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  },

  sendSOS: function() {
    const contacts = this.globalData.emergencyContacts
    if (contacts.length > 0) {
      const primary = contacts[0]
      wx.showModal({
        title: '紧急求助',
        content: `即将拨打紧急联系人：${primary.name}\n电话：${primary.phone}`,
        confirmText: '立即拨打',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: primary.phone,
              fail: () => {
                wx.showToast({ title: '拨号失败', icon: 'none' })
              }
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '紧急求助',
        content: '尚未设置紧急联系人，请先在个人中心添加',
        showCancel: false
      })
    }
  },

  request: function(options) {
    const { url, method = 'GET', data = {}, header = {}, retry = 2 } = options
    
    const doRequest = (attempt) => {
      return new Promise((resolve, reject) => {
        wx.request({
          url: this.globalData.apiBaseUrl + url,
          method: method,
          data: data,
          header: {
            'content-type': 'application/json',
            ...header
          },
          timeout: 5000,
          success: (res) => {
            if (res.data && res.data.code === 0) {
              resolve(res.data.data)
            } else if (res.data && res.data.error) {
              reject(new Error(res.data.error))
            } else {
              reject(new Error('请求失败'))
            }
          },
          fail: (err) => {
            if (attempt < retry) {
              setTimeout(() => {
                doRequest(attempt + 1).then(resolve).catch(reject)
              }, 1000 * attempt)
            } else {
              reject(err)
            }
          }
        })
      })
    }
    
    return doRequest(1)
  }
})
