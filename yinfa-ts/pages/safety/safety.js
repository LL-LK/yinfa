const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')
const weatherUtil = require('../../utils/weather.js')
const app = getApp()

Page({
  data: {
    posterSrc: '/image/IMG_3710.webp',
    posterTried: false,
    weather: {},
    travelAdvice: { suitable: [], avoid: [] },
    slippery: { level: 1, title: '干燥' },
    safetyTips: [],
    healthTips: [],
    fontSizeMode: 'normal',
    weatherLoading: false
  },

  onLoad: function () {
    this.setData({ fontSizeMode: app.globalData.fontSizeMode || 'normal' })
    this.loadSafetyData()
  },

  onShow: function () {
    baseRefreshFontMode.call(this)
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  onTabItemTap: function () {
    this.loadSafetyData()
  },

  onPosterError: function () {
    if (!this.data.posterTried) {
      this.setData({
        posterSrc: '/image/b2.jpg',
        posterTried: true
      })
    } else {
      this.setData({ posterSrc: '' })
    }
  },

  loadSafetyData: function () {
    this.loadWeather()
    this.buildSafetyTips()
    this.buildHealthTips()
  },

  loadWeather: function () {
    var self = this
    var hadData = this.data.weather && this.data.weather.condition

    if (!hadData) {
      this.setData({ weatherLoading: true })
    }

    weatherUtil.getWeather('桂林').then(function (weather) {
      var slippery = weatherUtil.getSlipperyAdvice(weather)
      var travel = weatherUtil.getTravelAdvice(weather)

      self.setData({
        weather: weather,
        travelAdvice: travel,
        slippery: {
          level: slippery.level,
          title: slippery.title
        },
        weatherLoading: false
      })
    }).catch(function () {
      var fallback = weatherUtil.FALLBACK_WEATHER
      var slippery = weatherUtil.getSlipperyAdvice(fallback)
      var travel = weatherUtil.getTravelAdvice(fallback)

      self.setData({
        weather: fallback,
        travelAdvice: travel,
        slippery: {
          level: slippery.level,
          title: slippery.title
        },
        weatherLoading: false
      })
    })
  },

  buildSafetyTips: function () {
    this.setData({
      safetyTips: [
        { name: '景区湿滑台阶', desc: '请使用扶手，一步一阶，不要在台阶上停留拍照。', level: 'high', icon: '⚠️' },
        { name: '雨后石板路', desc: '请绕行或等地面干燥后再走，穿防滑鞋底加深摩擦。', level: 'high', icon: '⚠️' },
        { name: '上下旅游巴士', desc: '请抓牢车门扶手，等车停稳后再上下，不要着急。', level: 'medium', icon: '⚡' },
        { name: '漓江游船甲板', desc: '甲板湿滑时请不要走到边缘，穿平底鞋上下船。', level: 'medium', icon: '⚡' },
        { name: '酒店卫生间', desc: '请使用防滑拖鞋，地面积水及时擦干，可铺防滑垫。', level: 'low', icon: '✅' },
        { name: '购物街区地砖', desc: '注意地面积水或油渍，走路时请不要看手机哦。', level: 'low', icon: '✅' }
      ]
    })
  },

  buildHealthTips: function () {
    this.setData({
      healthTips: [
        { icon: '💧', text: '外出请携带饮用水，桂林气候湿润但游览仍需及时补水。' },
        { icon: '🌂', text: '随身携带折叠伞或遮阳帽，应对突发天气变化。' },
        { icon: '💊', text: '常用药品随身带（降压药、救心丸、创可贴）。' },
        { icon: '🕐', text: '每游览1小时休息10-15分钟，避免过度疲劳。' },
        { icon: '📱', text: '保持手机电量充足，开启定位方便家人联系。' }
      ]
    })
  },

  readTip: function (e) {
    var item = this.data.safetyTips[e.currentTarget.dataset.index]
    if (item) voice.speak(item.name + '：' + item.desc)
  },

  callEmergency: function () {
    wx.showModal({
      title: '🆘 紧急呼救',
      content: '即将拨打紧急救援电话：120\n\n是否继续？',
      confirmText: '立即拨打',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '120' })
        }
      }
    })
  },

  shareLocation: function () {
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        wx.setClipboardData({
          data: '我的位置：https://maps.google.com/?q=' + res.latitude + ',' + res.longitude,
          success: function () {
            wx.showToast({ title: '位置已复制到剪贴板', icon: 'success' })
          }
        })
      },
      fail: function () {
        wx.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' })
      }
    })
  },

  goEmergency: function () {
    voice.speak('正在打开紧急联系人页面')
    nav.go('/pages/emergency/emergency', '紧急联系人')
  }
})

function baseRefreshFontMode() {
  var app = getApp()
  if (this.data.fontSizeMode !== app.globalData.fontSizeMode) {
    this.setData({ fontSizeMode: app.globalData.fontSizeMode || 'normal' })
  }
}