const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    modes: [],
    tips: []
  },

  onLoad: function () {
    this.setData({
      modes: buildModes(),
      tips: [
        { icon: '🚌', text: '公交车1元起，部分线路对60岁以上老人免费' },
        { icon: '🚕', text: '出租车起步价8元，市内景点一般不超过20元' },
        { icon: '🛵', text: '共享电动车需扫码，但建议老人选择更安全的出行方式' },
        { icon: '📞', text: '如需帮助可拨打服务热线：0773-12345' }
      ]
    })
  },

  callTaxi: function () {
    voice.speak('正在打开叫车服务')
    wx.showToast({ title: '请使用高德地图或滴滴出行呼叫出租车', icon: 'none', duration: 2500 })
  },

  goTraffic: function () {
    voice.speak('正在查看实时路况')
    nav.go('/pages/traffic/traffic', '实时路况')
  }
})

function buildModes() {
  return [
    {
      name: '公交车',
      icon: '🚌',
      desc: '全市100+公交线路覆盖主要景点，票价1-2元。60岁以上老人凭身份证免费乘坐部分线路。',
      tips: '推荐线路：2路、16路可到象鼻山；5路可到漓江码头；3路可到芦笛岩。',
      suitable: '最经济实惠'
    },
    {
      name: '出租车/网约车',
      icon: '🚕',
      desc: '桂林市区面积不大，出租车是最省心的出行方式。起步价8元/2公里，超过后每公里1.6元。',
      tips: '可通过滴滴出行、高德地图叫车。市内到阳朔约80-100元。上车前确认目的地，避免绕路。',
      suitable: '最省心舒适'
    },
    {
      name: '旅游大巴',
      icon: '🚌',
      desc: '桂林至各景区有定点旅游大巴，桂林汽车站每天多班次发车，有固定座位和空调。',
      tips: '桂林至阳朔约1小时，票价25元；桂林至龙脊约2.5小时，票价40元。建议提前购票。',
      suitable: '长途景点首选'
    },
    {
      name: '包车服务',
      icon: '🚗',
      desc: '为老人量身推荐：可提前预约专车，点对点接送，全程有司机陪同，最安全便捷。',
      tips: '包车一天约300-500元，可自行规划行程。建议通过酒店前台或正规旅行社预约。',
      suitable: '团体出游推荐'
    },
    {
      name: '步行 + 观光车',
      icon: '🚶',
      desc: '景区内配有观光车，适合走路不便的老人。主要景区内道路平坦，适合缓步游览。',
      tips: '象鼻山、两江四湖等市区景点可步行游览，景区内观光车10-30元不等。携带拐杖更有保障。',
      suitable: '休闲慢游'
    }
  ]
}
