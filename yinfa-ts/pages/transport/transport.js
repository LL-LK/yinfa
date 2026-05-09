const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')
const api = require('../../utils/api.js')
const base = require('../../utils/page-base.js')

Page({
  data: Object.assign({
    modes: [],
    tips: []
  }, base.initStates()),

  onLoad: function () { if (base.needLoad.call(this)) this.loadTransportModes() },

  onShow: function () { base.refreshFontMode.call(this); if (base.needLoad.call(this)) this.loadTransportModes() },

  loadTransportModes: function () {
    base.startLoad.call(this)
    api.request({ url: '/products?category=transport', method: 'GET' }).then(products => {
      if (products && products.length > 0) {
        const modes = products.map(p => ({
          id: p.id, name: p.name, icon: _transportIcon(p.name),
          desc: p.description || '桂林出行方式，方便快捷',
          tips: p.safety_tips || '出行请注意安全', suitable: p.tag_name || '推荐'
        }))
        base.finishLoad.call(this, modes, { modes,
          tips: [
            { icon: '🚌', text: '公交车1元起，部分线路对60岁以上老人免费' },
            { icon: '🚕', text: '出租车起步价8元，市内景点一般不超过20元' },
            { icon: '🛵', text: '建议老人选择更安全的出行方式' },
            { icon: '📞', text: '如需帮助可拨打服务热线：0773-12345' }
          ]
        })
      } else { this.useFallback() }
    }).catch(() => { this.useFallback() })
  },

  useFallback: function () {
    const modes = buildModes()
    base.finishLoad.call(this, modes, { modes,
      tips: [
        { icon: '🚌', text: '公交车1元起，部分线路对60岁以上老人免费' },
        { icon: '🚕', text: '出租车起步价8元，市内景点一般不超过20元' },
        { icon: '🛵', text: '共享电动车需扫码，但建议老人选择更安全的出行方式' },
        { icon: '📞', text: '如需帮助可拨打服务热线：0773-12345' }
      ]
    })
  },

  callTaxi: function () { voice.speak('正在打开叫车服务'); wx.showToast({ title: '请使用高德地图或滴滴出行呼叫出租车', icon: 'none', duration: 2500 }) },
  goTraffic: function () { voice.speak('正在查看实时路况'); nav.go('/pages/traffic/traffic', '实时路况') }
})

function _transportIcon(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('公交')) return '🚌'
  if (n.includes('出租') || n.includes('网约') || n.includes('打车')) return '🚕'
  if (n.includes('大巴') || n.includes('旅游车')) return '🚌'
  if (n.includes('包车') || n.includes('专车')) return '🚗'
  if (n.includes('步行') || n.includes('观光')) return '🚶'
  if (n.includes('电动') || n.includes('共享')) return '🛵'
  if (n.includes('自行车')) return '🚲'
  return '🚌'
}

function buildModes() {
  return [
    { id: 1, name: '公交车', icon: '🚌', desc: '全市100+公交线路覆盖主要景点，票价1-2元。60岁以上老人凭身份证免费乘坐部分线路。', tips: '推荐线路：2路、16路可到象鼻山；5路可到漓江码头；3路可到芦笛岩。', suitable: '最经济实惠' },
    { id: 2, name: '出租车/网约车', icon: '🚕', desc: '桂林市区面积不大，出租车是最省心的出行方式。起步价8元/2公里，超过后每公里1.6元。', tips: '可通过滴滴出行、高德地图叫车。市内到阳朔约80-100元。', suitable: '最省心舒适' },
    { id: 3, name: '旅游大巴', icon: '🚌', desc: '桂林至各景区有定点旅游大巴，桂林汽车站每天多班次发车，有固定座位和空调。', tips: '桂林至阳朔约1小时，票价25元；桂林至龙脊约2.5小时，票价40元。', suitable: '长途景点首选' },
    { id: 4, name: '包车服务', icon: '🚗', desc: '为老人量身推荐：可提前预约专车，点对点接送，全程有司机陪同，最安全便捷。', tips: '包车一天约300-500元，可自行规划行程。建议通过酒店前台或正规旅行社预约。', suitable: '团体出游推荐' },
    { id: 5, name: '步行 + 观光车', icon: '🚶', desc: '景区内配有观光车，适合走路不便的老人。主要景区内道路平坦，适合缓步游览。', tips: '象鼻山、两江四湖等市区景点可步行游览，景区内观光车10-30元不等。', suitable: '休闲慢游' }
  ]
}
