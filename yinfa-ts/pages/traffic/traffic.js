const app = getApp()
const nav = require('../../utils/navigate.js')
const voice = require('../../utils/voice.js')

Page({
  data: {
    roads: [],
    tips: [],
    loading: true,
    error: false,
    fontSizeMode: 'normal'
  },

  onLoad: function () {
    this.setData({ fontSizeMode: app.globalData.fontSizeMode || 'normal' })
    this.loadTraffic()
  },

  loadTraffic: function () {
    this.setData({ loading: true, error: false })
    setTimeout(() => {
      try {
        this.setData({
          roads: [
            { name: '中山中路', status: '畅通', detail: '路况良好' },
            { name: '漓江路', status: '缓行', detail: '旅游车辆较多' },
            { name: '滨江路', status: '畅通', detail: '路况良好' },
            { name: '环城南二路', status: '拥堵', detail: '高峰期拥堵' },
            { name: '西山路', status: '畅通', detail: '路况良好' },
            { name: '解放东路', status: '缓行', detail: '商圈路段' }
          ],
          tips: [
            { icon: '🚌', text: '推荐乘坐公交车，凭老年卡免费乘坐' },
            { icon: '🚕', text: '出租车起步价8元，可以使用微信支付' },
            { icon: '⏰', text: '早高峰7:30-9:00，晚高峰17:00-19:00' },
            { icon: '🅿️', text: '市区停车场较多，景区停车场通常收费' }
          ],
          loading: false
        })
      } catch (e) {
        this.setData({ loading: false, error: true })
      }
    }, 300)
  },

  goBack: function () {
    wx.navigateBack()
  }
})