const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    scenics: [],
    tips: {}
  },

  onLoad: function () {
    this.setData({
      scenics: buildScenics(),
      tips: { icon: '💡', text: '每个景点下方有详细的老人友好提示，出门前记得查看哦' }
    })
  },

  expandInfo: function (e) {
    const index = e.currentTarget.dataset.index
    const scenics = this.data.scenics
    const item = scenics[index]
    const expanded = !item.expanded
    scenics[index].expanded = expanded
    this.setData({ scenics })

    if (expanded) {
      voice.speak(item.name + '，' + item.intro + '。老人出游提示：' + (item.safetyTips || '无特殊提示'))
    }
  },

  goDetails: function (e) {
    const id = e.currentTarget.dataset.id
    voice.speak('正在查看该景点购票详情')
    nav.go('/pages/details/details?id=' + id)
  },

  goWeather: function () {
    voice.speak('正在查看天气和安全提醒')
    wx.switchTab({ url: '/pages/safety/safety' })
  }
})

function buildScenics() {
  return [
    {
      id: 1,
      name: '漓江精华段',
      level: '5A景区',
      image: '/image/b1.jpg',
      intro: '桂林山水精华，乘船欣赏黄布倒影、九马画山等经典景观，感受人在画中游。',
      price: 215,
      time: '4小时',
      expanded: false,
      highlight: '乘船游览漓江，两岸青山相对出，碧水蓝天相映成趣。',
      safetyTips: '漓江沿岸步道青苔较多，上下船时请慢行注意脚下，雨天甲板湿滑请不要奔跑。建议穿防滑鞋，携带手杖。',
      transport: '桂林市区乘5路、16路公交至漓江码头；也可乘出租车约15元。',
      hours: '8:00-17:30（建议上午9:00前往）'
    },
    {
      id: 2,
      name: '象鼻山公园',
      level: '5A景区',
      image: '/image/b2.jpg',
      intro: '桂林城徽象鼻山，形状酷似大象饮水，是桂林的标志性景点，拍照打卡首选。',
      price: 55,
      time: '1.5小时',
      expanded: false,
      highlight: '象鼻山脚下可乘竹筏游览，近距离感受桂林山水的魅力。',
      safetyTips: '台阶较多且部分较陡，请使用扶手慢行。山脚江边有青苔，注意防滑。景区设有无障碍通道。',
      transport: '乘2路、16路公交至象山公园站，步行2分钟即达。',
      hours: '8:00-18:00'
    },
    {
      id: 3,
      name: '阳朔西街',
      level: '4A景区',
      image: '/image/b3.jpg',
      intro: '中西文化交融的千年古街，充满异国情调，可品尝地道啤酒鱼和桂林米粉。',
      price: 0,
      time: '2小时',
      expanded: false,
      highlight: '免费开放的古老街区，夜晚灯火辉煌，热闹非凡。',
      safetyTips: '石板路面凹凸不平，雨天注意积水和湿滑。人多时注意保管随身物品。建议白天游览，光线好更安全。',
      transport: '桂林汽车站乘大巴至阳朔（约1小时），下车步行10分钟。',
      hours: '全天开放'
    },
    {
      id: 4,
      name: '龙脊梯田',
      level: '4A景区',
      image: '/image/b1.jpg',
      intro: '世界人工奇观，层层梯田从山脚盘绕到山顶，四季景色各异，秋季金黄最美。',
      price: 80,
      time: '半天',
      expanded: false,
      highlight: '梯田在日出时分金光闪烁，美不胜收。',
      safetyTips: '雨天极度湿滑，强烈不建议老人前往梯田深处。建议在观景台游览即可，不要深入田间小路。携带拐杖，最好有人陪同。',
      transport: '桂林汽车站乘班车至龙胜（约2.5小时），建议包车前往更舒适。',
      hours: '7:00-18:00'
    },
    {
      id: 5,
      name: '芦笛岩',
      level: '4A景区',
      image: '/image/b2.jpg',
      intro: '著名溶洞景观，钟乳石千姿百态，被誉为"大自然艺术之宫"，洞内凉爽舒适。',
      price: 90,
      time: '1.5小时',
      expanded: false,
      highlight: '洞内岩石千奇百怪，在灯光的照射下如梦如幻。',
      safetyTips: '洞口地面湿滑，入洞请慢行。洞内外温差大（约10度），建议带薄外套。洞内有灯光，但有台阶需注意。',
      transport: '乘3路、14路至芦笛岩站，步行5分钟。',
      hours: '8:00-17:00'
    },
    {
      id: 6,
      name: '两江四湖景区',
      level: '5A景区',
      image: '/image/b3.jpg',
      intro: '桂林市中心环城水系，漓江、桃花江与四湖相连，夜游灯光璀璨，景色迷人。',
      price: 220,
      time: '2小时',
      expanded: false,
      highlight: '夜游时两岸灯火通明，日月双塔熠熠生辉，是桂林最美的夜景。',
      safetyTips: '夜游船只安全性高，上下船有工作人员扶助。湖边步道平坦，适合散步。夜间注意保暖。',
      transport: '市中心步行可达，多个码头可供选择，最近的在杉湖知音台。',
      hours: '日游8:30-17:00，夜游19:00-21:30'
    },
    {
      id: 7,
      name: '杨堤码头',
      level: '漓江精华段起点',
      image: '/image/b1.jpg',
      intro: '漓江竹筏漂流的起点，从杨堤乘竹筏顺流而下至九马画山，是欣赏漓江美景的最佳方式。',
      price: 160,
      time: '2小时',
      expanded: false,
      highlight: '乘坐竹筏漂流漓江，感受清风拂面，两岸青山如画。',
      safetyTips: '上下竹筏请听从船夫指引，穿好救生衣。竹筏行驶中请坐稳扶好，不要站立。建议上午前往，避开午后风浪。',
      transport: '桂林汽车站乘阳朔班车，在杨堤路口下车，转乘景区电瓶车至码头。',
      hours: '7:30-17:30（竹筏每小时一班）'
    }
  ]
}
