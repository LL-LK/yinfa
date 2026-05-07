App({
  globalData: {
    apiBaseUrl: '',
    userInfo: null,
    cartItems: []
  },

  onLaunch: function () {
    console.log('App Launch')
    this.initApiUrl()
    this.loadCartFromStorage()
  },

  onShow: function () {
    console.log('App Show')
  },

  onHide: function () {
    console.log('App Hide')
    this.saveCartToStorage()
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