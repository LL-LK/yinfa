const config = require('./config.js')
const BASE_URL = config.BASE_URL

let loadingCount = 0
let loadingTimer = null

function showLoadingIfNeeded() {
  loadingCount++
  if (loadingCount === 1) {
    loadingTimer = setTimeout(() => {
      wx.showLoading({ title: '加载中...', mask: true })
    }, 300)
  }
}

function hideLoadingIfNeeded() {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0 && loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = null
    wx.hideLoading()
  }
}

function request(options) {
  const url = options.url || ''
  const method = options.method || 'GET'
  const data = options.data || {}
  const showLoading = options.showLoading !== undefined ? options.showLoading : true

  return new Promise((resolve, reject) => {
    if (showLoading) {
      showLoadingIfNeeded()
    }

    wx.request({
      url: BASE_URL + url,
      method: method,
      header: { 'content-type': 'application/json' },
      data: data,
      timeout: 10000,
      success(res) {
        if (showLoading) hideLoadingIfNeeded()
        if (res.statusCode === 200 && res.data) {
          resolve(res.data.data || res.data)
        } else if (res.statusCode === 401) {
          const app = getApp()
          if (app && app.toLogin) {
            app.toLogin()
          }
          reject(res)
        } else {
          reject(res)
        }
      },
      fail(err) {
        if (showLoading) hideLoadingIfNeeded()
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

function getCart(openid) {
  return request({ url: '/cart', method: 'GET', data: { openid }, showLoading: false })
}

function addToCart(openid, productId, quantity) {
  return request({
    url: '/cart/add',
    method: 'POST',
    data: { openid, product_id: productId, quantity: quantity || 1 },
    showLoading: false
  })
}

function updateCartQuantity(itemId, quantity) {
  return request({
    url: `/cart/${itemId}`,
    method: 'PUT',
    data: { quantity },
    showLoading: false
  })
}

function removeFromCart(itemId) {
  return request({
    url: `/cart/${itemId}`,
    method: 'DELETE',
    showLoading: false
  })
}

function clearCart(openid) {
  return request({
    url: '/cart/clear',
    method: 'POST',
    data: { openid },
    showLoading: false
  })
}

function createEmergencyContact(data) {
  return request({ url: '/emergency-contacts/create', method: 'POST', data, showLoading: true })
}

function getEmergencyContacts(openid) {
  return request({ url: '/emergency-contacts', method: 'GET', data: { openid }, showLoading: false })
}

function deleteEmergencyContact(id) {
  return request({ url: `/emergency-contacts/${id}`, method: 'DELETE', showLoading: true })
}

function setPrimaryContact(id) {
  return request({ url: `/emergency-contacts/${id}`, method: 'PUT', showLoading: true })
}

function createHealthRecord(data) {
  return request({ url: '/health-records', method: 'POST', data, showLoading: true })
}

function getHealthRecords(openid) {
  return request({ url: '/health-records', method: 'GET', data: { openid }, showLoading: false })
}

function sendSOSAlert(data) {
  return request({ url: '/sos/alert', method: 'POST', data, showLoading: true })
}

function getWeatherForecast(city, days) {
  return request({ url: '/weather/forecast', method: 'GET', data: { city, days }, showLoading: false })
}

module.exports = {
  request,
  getCategories,
  getProducts,
  getProductById,
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  createEmergencyContact,
  getEmergencyContacts,
  deleteEmergencyContact,
  setPrimaryContact,
  createHealthRecord,
  getHealthRecords,
  sendSOSAlert,
  getWeatherForecast,
  BASE_URL
}