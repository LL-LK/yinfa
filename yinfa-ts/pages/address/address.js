const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')

Page({
  data: {
    addresses: [],
    formData: {
      full_name: '',
      phone: '',
      address_line: '',
      city: '',
      postal_code: '',
      is_default: false
    }
  },

  onLoad: function () {
    this.loadAddresses()
  },

  loadAddresses: function () {
    api.request({ url: '/addresses', method: 'GET', data: { openid: 'test_openid' } }).then(res => {
      this.setData({ addresses: res })
    }).catch(err => {
      console.error('加载地址失败:', err)
    })
  },

  inputChange: function (e) {
    const field = e.currentTarget.dataset.field
    this.setData({ ['formData.' + field]: e.detail.value })
  },

  checkboxChange: function (e) {
    this.setData({ 'formData.is_default': e.detail.value.length > 0 })
  },

  submitAddress: function () {
    const f = this.data.formData
    if (!f.full_name || !f.phone || !f.address_line || !f.city) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      voice.speak('请先填写完整地址信息')
      return
    }

    api.request({ url: '/address/create', method: 'POST', data: { openid: 'test_openid', ...f } }).then(() => {
      wx.showToast({ title: '添加成功', icon: 'success' })
      voice.speak('地址添加成功')
      this.setData({
        formData: { full_name: '', phone: '', address_line: '', city: '', postal_code: '', is_default: false }
      })
      this.loadAddresses()
    }).catch(err => {
      console.error('添加地址失败:', err)
      wx.showToast({ title: '添加失败', icon: 'none' })
    })
  }
})
