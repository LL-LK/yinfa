const isProduction = process.env.NODE_ENV === 'production'
const RAILWAY_URL = process.env.RAILWAY_URL || process.env.RENDER_EXTERNAL_URL || ''

const BASE_URL = RAILWAY_URL 
  ? RAILWAY_URL.replace(/\/$/, '') + '/api' 
  : isProduction 
    ? 'https://your-railway-domain.up.railway.app/api' 
    : 'http://localhost:8000/api'

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
