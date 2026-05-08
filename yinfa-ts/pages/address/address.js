const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')

function getOpenid() {
  return (app.globalData.userInfo && app.globalData.userInfo.openid) || ''
}

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
    },
    loading: true,
    notLoggedIn: false
  },

  onLoad: function () {
    this.loadAddresses()
  },

  onShow: function () {
    this.loadAddresses()
  },

  loadAddresses: function () {
    const openid = getOpenid()
    if (!openid) {
      this.setData({
        loading: false,
        notLoggedIn: true,
        addresses: []
      })
      return
    }

    this.setData({ loading: true, notLoggedIn: false })

    api.request({
      url: '/addresses',
      method: 'GET',
      data: { openid },
      showLoading: false
    }).then(res => {
      this.setData({ addresses: Array.isArray(res) ? res : [], loading: false })
    }).catch(err => {
      console.error('加载地址失败:', err)
      this.setData({ loading: false })
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

    const openid = getOpenid()
    if (!openid) {
      this.goLogin()
      return
    }

    const isEdit = !!f.editId
    const method = isEdit ? 'PUT' : 'POST'
    const url = isEdit ? '/address/' + f.editId : '/address/create'
    const data = isEdit ? { openid, ...f } : { openid, ...f }

    api.request({
      url: url,
      method: method,
      data: data,
      showLoading: true
    }).then(() => {
      wx.showToast({ title: isEdit ? '修改成功' : '添加成功', icon: 'success' })
      voice.speak('地址' + (isEdit ? '修改' : '添加') + '成功')
      this.setData({
        formData: { full_name: '', phone: '', address_line: '', city: '', postal_code: '', is_default: false }
      })
      this.loadAddresses()
    }).catch(err => {
      console.error(isEdit ? '修改地址失败:' : '添加地址失败:', err)
      wx.showToast({ title: isEdit ? '修改失败' : '添加失败', icon: 'none' })
    })
  },

  goLogin: function () {
    wx.showModal({
      title: '需要登录',
      content: '登录后才能管理地址',
      confirmText: '去登录',
      cancelText: '稍后',
      success: function (res) {
        if (res.confirm) {
          wx.switchTab({ url: '/pages/user/user' })
        }
      }
    })
  },

  editAddress: function (e) {
    const id = e.currentTarget.dataset.id
    const address = this.data.addresses.find(a => a.id === id)
    if (!address) return
    this.setData({
      formData: {
        full_name: address.full_name || '',
        phone: address.phone || '',
        city: address.city || '',
        address_line: address.address_line || '',
        postal_code: address.postal_code || '',
        is_default: !!address.is_default,
        editId: id
      }
    })
    wx.showToast({ title: '请修改信息后保存', icon: 'none' })
  },

  deleteAddress: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该地址吗？',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          const openid = getOpenid()
          api.request({
            url: '/address/' + id,
            method: 'DELETE',
            data: { openid },
            showLoading: true
          }).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadAddresses()
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' })
          })
        }
      }
    })
  },

  setDefaultAddress: function (e) {
    const id = e.currentTarget.dataset.id
    const openid = getOpenid()
    api.request({
      url: '/address/' + id + '/default',
      method: 'POST',
      data: { openid },
      showLoading: true
    }).then(() => {
      wx.showToast({ title: '已设为默认', icon: 'success' })
      this.loadAddresses()
    }).catch(() => {
      wx.showToast({ title: '设置失败', icon: 'none' })
    })
  }
})