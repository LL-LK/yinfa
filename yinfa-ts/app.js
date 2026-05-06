App({
  globalData: {
    apiBaseUrl: 'http://localhost:8000/api',
    userInfo: null,
    cartItems: []
  },

  onLaunch: function () {
    console.log('App Launch')
    this.initApiUrl()
  },

  onShow: function () {
    console.log('App Show')
  },

  onHide: function () {
    console.log('App Hide')
  },

  initApiUrl: function() {
    const savedUrl = wx.getStorageSync('apiBaseUrl')
    if (savedUrl) {
      this.globalData.apiBaseUrl = savedUrl
    }
  },

  setApiUrl: function(url) {
    this.globalData.apiBaseUrl = url
    wx.setStorageSync('apiBaseUrl', url)
  },

  request: function(options) {
    const { url, method = 'GET', data = {}, header = {} } = options
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBaseUrl + url,
        method: method,
        data: data,
        header: {
          'content-type': 'application/json',
          ...header
        },
        timeout: 10000,
        success: (res) => {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else {
            reject(res.data.error || '请求失败')
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
})