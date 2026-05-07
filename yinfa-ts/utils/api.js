const BASE_URL = 'https://web-production-58353.up.railway.app/api'

let globalLoadingTimer = null

function request(options) {
  const url = options.url || ''
  const method = options.method || 'GET'
  const data = options.data || {}
  const showLoading = options.showLoading !== undefined ? options.showLoading : true

  return new Promise((resolve, reject) => {
    if (showLoading) {
      globalLoadingTimer = setTimeout(() => {
        wx.showLoading({ title: '加载中...', mask: true })
      }, 300)
    }

    wx.request({
      url: BASE_URL + url,
      method: method,
      header: { 'content-type': 'application/json' },
      data: data,
      timeout: 10000,
      success(res) {
        if (globalLoadingTimer) clearTimeout(globalLoadingTimer)
        if (showLoading) wx.hideLoading()

        if (res.statusCode === 200 && res.data) {
          resolve(res.data.data || res.data)
        } else {
          reject(res)
        }
      },
      fail(err) {
        if (globalLoadingTimer) clearTimeout(globalLoadingTimer)
        if (showLoading) wx.hideLoading()
        reject(err)
      }
    })
  })
}

function getCategories() {
  return request({ url: '/categories', method: 'GET', showLoading: false })
}

function getProducts(params) {
  return request({ url: '/products', method: 'GET', data: params || {}, showLoading: false })
}

function getProductById(id) {
  return request({ url: `/products/${id}`, method: 'GET', showLoading: false })
}

module.exports = {
  request,
  getCategories,
  getProducts,
  getProductById,
  BASE_URL
}
