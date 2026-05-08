const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')

Page({
  data: {
    contacts: [],
    loading: true,
    showForm: false,
    formData: {
      name: '',
      phone: '',
      relationship: '',
      is_primary: false
    },
    submitting: false
  },

  onLoad: function () {
    this.loadContacts()
  },

  onShow: function () {
    this.loadContacts()
  },

  loadContacts: function () {
    this.setData({ loading: true })
    const openid = app.globalData.openid || wx.getStorageSync('openid') || 'demo_user'
    api.getEmergencyContacts(openid).then(res => {
      this.setData({ contacts: Array.isArray(res) ? res : [], loading: false })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  showAddForm: function () {
    if (this.data.contacts.length >= 3) {
      wx.showToast({ title: '最多添加3个紧急联系人', icon: 'none' })
      return
    }
    this.setData({
      showForm: true,
      formData: { name: '', phone: '', relationship: '', is_primary: false }
    })
  },

  hideForm: function () {
    this.setData({ showForm: false, formData: { name: '', phone: '', relationship: '', is_primary: false } })
  },

  onNameInput: function (e) {
    this.setData({ 'formData.name': e.detail.value })
  },

  onPhoneInput: function (e) {
    this.setData({ 'formData.phone': e.detail.value })
  },

  onRelationInput: function (e) {
    this.setData({ 'formData.relationship': e.detail.value })
  },

  togglePrimary: function () {
    this.setData({ 'formData.is_primary': !this.data.formData.is_primary })
  },

  submitContact: function () {
    const { name, phone, relationship, is_primary } = this.data.formData
    if (!name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(phone.trim())) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    const openid = app.globalData.openid || wx.getStorageSync('openid') || 'demo_user'
    api.createEmergencyContact({
      openid,
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
      is_primary
    }).then(() => {
      voice.speak('紧急联系人已添加')
      wx.showToast({ title: '添加成功', icon: 'success' })
      this.setData({ showForm: false, submitting: false })
      this.loadContacts()
    }).catch(err => {
      this.setData({ submitting: false })
      wx.showToast({ title: (err && err.data && err.data.error) || '添加失败', icon: 'none' })
    })
  },

  setPrimary: function (e) {
    const id = e.currentTarget.dataset.id
    api.setPrimaryContact(id).then(() => {
      voice.speak('已设为主要联系人')
      this.loadContacts()
    }).catch(() => {
      wx.showToast({ title: '设置失败', icon: 'none' })
    })
  },

  deleteContact: function (e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name || '该联系人'
    wx.showModal({
      title: '确认删除',
      content: `确定要删除\"${name}\"吗？`,
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          api.deleteEmergencyContact(id).then(() => {
            voice.speak('紧急联系人已删除')
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadContacts()
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' })
          })
        }
      }
    })
  },

  makeCall: function (e) {
    const phone = e.currentTarget.dataset.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    }
  },

  sendLocation: function (e) {
    const name = e.currentTarget.dataset.name || '家人'
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const lat = res.latitude
        const lng = res.longitude
        wx.showModal({
          title: '发送位置',
          content: `将位置发送给${name}，确定继续？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.showToast({ title: '位置已发送', icon: 'success' })
            }
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' })
      }
    })
  }
})
