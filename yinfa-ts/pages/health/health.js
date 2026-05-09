const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')

Page({
  data: {
    records: [],
    loading: true,
    showForm: false,
    formData: {
      blood_pressure: '',
      heart_rate: '',
      notes: '',
      record_date: ''
    },
    submitting: false,
    fontSizeMode: 'normal',
    chartData: {
      bpLabels: [],
      bpSystolic: [],
      bpDiastolic: [],
      hrLabels: [],
      hrValues: []
    }
  },

  onLoad: function () {
    this.setData({ fontSizeMode: app.globalData.fontSizeMode || 'normal' })
    const today = new Date().toISOString().split('T')[0]
    this.setData({ 'formData.record_date': today })
    this.loadRecords()
  },

  onShow: function () {
    this.loadRecords()
  },

  loadRecords: function () {
    this.setData({ loading: true })
    const openid = app.globalData.openid || wx.getStorageSync('openid') || 'demo_user'
    api.getHealthRecords(openid).then(res => {
      const records = Array.isArray(res) ? res : []
      this.setData({ records, loading: false })
      this.buildChartData(records)
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  buildChartData: function (records) {
    const sorted = [...records].sort((a, b) => a.record_date.localeCompare(b.record_date))
    const bpLabels = []
    const bpSystolic = []
    const bpDiastolic = []
    const hrLabels = []
    const hrValues = []

    sorted.forEach(r => {
      if (r.blood_pressure) {
        const parts = r.blood_pressure.split('/')
        bpLabels.push(r.record_date)
        bpSystolic.push(parseInt(parts[0], 10) || 0)
        bpDiastolic.push(parseInt(parts[1], 10) || 0)
      }
    })

    sorted.forEach(r => {
      if (r.heart_rate) {
        hrLabels.push(r.record_date)
        hrValues.push(parseInt(r.heart_rate, 10) || 0)
      }
    })

    this.setData({
      'chartData.bpLabels': bpLabels,
      'chartData.bpSystolic': bpSystolic,
      'chartData.bpDiastolic': bpDiastolic,
      'chartData.hrLabels': hrLabels,
      'chartData.hrValues': hrValues
    })
  },

  showAddForm: function () {
    const today = new Date().toISOString().split('T')[0]
    this.setData({
      showForm: true,
      formData: { blood_pressure: '', heart_rate: '', notes: '', record_date: today }
    })
  },

  hideForm: function () {
    this.setData({
      showForm: false,
      formData: { blood_pressure: '', heart_rate: '', notes: '', record_date: '' }
    })
  },

  onBpInput: function (e) {
    this.setData({ 'formData.blood_pressure': e.detail.value })
  },

  onHrInput: function (e) {
    this.setData({ 'formData.heart_rate': e.detail.value })
  },

  onNotesInput: function (e) {
    this.setData({ 'formData.notes': e.detail.value })
  },

  onDateChange: function (e) {
    this.setData({ 'formData.record_date': e.detail.value })
  },

  submitRecord: function () {
    const { blood_pressure, heart_rate, notes, record_date } = this.data.formData
    if (!blood_pressure.trim() && !heart_rate.trim()) {
      wx.showToast({ title: '请至少填写血压或心率', icon: 'none' })
      return
    }

    if (blood_pressure.trim() && !/^\d{2,3}\/\d{2,3}$/.test(blood_pressure.trim())) {
      wx.showToast({ title: '血压格式：120/80', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    const openid = app.globalData.openid || wx.getStorageSync('openid') || 'demo_user'
    api.createHealthRecord({
      openid,
      blood_pressure: blood_pressure.trim(),
      heart_rate: heart_rate.trim(),
      notes: notes.trim(),
      record_date: record_date
    }).then(() => {
      voice.speak('健康记录已保存')
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.setData({ showForm: false, submitting: false })
      this.loadRecords()
    }).catch(() => {
      this.setData({ submitting: false })
      wx.showToast({ title: '保存失败', icon: 'none' })
    })
  },

  getBpMaxHeight: function () {
    const vals = [...this.data.chartData.bpSystolic, ...this.data.chartData.bpDiastolic]
    if (vals.length === 0) return 100
    return Math.max(100, Math.max(...vals) * 1.2)
  },

  getHrMaxHeight: function () {
    const vals = this.data.chartData.hrValues
    if (vals.length === 0) return 100
    return Math.max(100, Math.max(...vals) * 1.2)
  },

  getBpLevel: function (bp) {
    if (!bp) return 'normal'
    const parts = bp.split('/')
    const systolic = parseInt(parts[0], 10) || 0
    const diastolic = parseInt(parts[1], 10) || 0
    if (systolic >= 140 || diastolic >= 90) return 'high'
    if (systolic < 90 || diastolic < 60) return 'low'
    return 'normal'
  },

  getBpLevelText: function (bp) {
    const level = this.getBpLevel(bp)
    if (level === 'high') return '偏高'
    if (level === 'low') return '偏低'
    return '正常'
  }
})
