const voice = require('../../utils/voice.js')
const weatherUtil = require('../../utils/weather.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    weather: weatherUtil.FALLBACK_WEATHER,
    slippery: { level: 1, title: '路面安全', desc: '' },
    travelAdvice: {},
    warnings: [],
    loading: true
  },

  onLoad: function () {
    this.refreshAll()
  },

  onPullDownRefresh: function () {
    this.refreshAll().then(() => wx.stopPullDownRefresh())
  },

  refreshAll: function () {
    return weatherUtil.getWeather('桂林').then(w => {
      const slip = weatherUtil.getSlipperyAdvice(w)
      const advice = weatherUtil.getTravelAdvice(w)
      this.setData({
        weather: w,
        slippery: slip,
        travelAdvice: advice,
        warnings: this._buildWarnings(w),
        loading: false
      })
    })
  },

  _buildWarnings: function (weather) {
    const cond = (weather.condition || '').toLowerCase()
    const isWet = cond.includes('雨') || cond.includes('雪')
    const isHumid = weather.humidity !== '--' && parseFloat(weather.humidity) > 70

    return [
      { name: '漓江步道', desc: isWet ? '严重湿滑，请勿在江边行走' : isHumid ? '江边石阶可能潮湿，请小心行走' : '江边石阶有青苔，请小心行走', level: isWet ? 'high' : 'medium' },
      { name: '象鼻山台阶', desc: isWet ? '台阶极度湿滑，不建议攀爬' : '部分台阶较陡，请使用扶手', level: isWet ? 'high' : 'medium' },
      { name: '西街石板路', desc: isWet ? '石板路积水湿滑，请穿防滑鞋' : '石板凹凸，注意脚下', level: isWet ? 'medium' : 'low' },
      { name: '龙脊梯田路', desc: isWet ? '极度危险！下雨天强烈建议不要前往' : '雨后湿滑，老人不建议游览梯田深处', level: isWet ? 'high' : 'high' },
      { name: '芦笛岩入口', desc: isWet ? '洞口地面湿滑，入洞请慢行' : '洞口有缓坡，注意慢行', level: isWet ? 'medium' : 'low' }
    ]
  },

  readWeather: function () {
    const w = this.data.weather
    const s = this.data.slippery
    const real = w.isReal ? '实时' : '参考'
    const text = '今日桂林' + real + '天气：' + w.condition + '，温度' + w.temp + '，湿度' + w.humidity + '，风力' + w.wind + '。' + s.desc
    voice.speak(text)
  },

  readAdvice: function () {
    const advice = this.data.travelAdvice
    let text = '今日出行建议：' + advice.advice
    if (advice.suitable && advice.suitable.length > 0) {
      text += '推荐景点：' + advice.suitable.join('、')
    }
    if (advice.avoid && advice.avoid.length > 0) {
      text += '。建议避免：' + advice.avoid.join('、')
    }
    voice.speak(text)
  },

  goScenicTips: function () {
    voice.speak('正在查看桂林景点安全提示')
    nav.go('/pages/scenic/scenic')
  },

  goRecommended: function (e) {
    const name = e.currentTarget.dataset.name
    voice.speak('正在查看' + name + '景点详情')
    wx.showToast({ title: '正在打开' + name, icon: 'none' })
  },

  callEmergency: function () {
    voice.speak('正在拨打急救电话')
    wx.showModal({
      title: '拨打急救电话',
      content: '确认拨打 120 急救电话？',
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '120' })
        }
      }
    })
  },

  shareLocation: function () {
    voice.speak('正在分享当前位置给家人')
    wx.getLocation({
      type: 'gcj02',
      success: function (loc) {
        wx.showToast({ title: '位置信息已复制，可发送给家人', icon: 'none', duration: 2500 })
        voice.speak('您当前的位置信息已准备好，请在聊天中发送给家人。')
      }
    })
  }
})
