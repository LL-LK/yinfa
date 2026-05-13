const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')
const api = require('../../utils/api.js')
const IMG = require('../../utils/image-paths.js')
const base = require('../../utils/page-base.js')

function getFavorites() {
  try { return wx.getStorageSync('user_favorites') || [] } catch(e) { return [] }
}

Page({
  data: Object.assign({
    scenics: [],
    filteredList: [],
    activeTab: 'all',
    tips: {}
  }, base.initStates()),

  onLoad: function () {
    if (base.needLoad.call(this)) this.loadScenicSpots()
  },

  onShow: function () {
    base.refreshFontMode.call(this)
    base.setTabBar.call(this, 1)
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    if (base.needLoad.call(this)) this.loadScenicSpots()
  },

  onTabItemTap: function () { this.loadScenicSpots() },

  switchTab: function (e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.applyFilter()
    voice.speak(tab === 'all' ? '全部景点' : tab === '5a' ? '5A级景区' : tab === '4a' ? '4A级景区' : '免费景点')
  },

  applyFilter: function () {
    var scenics = this.data.scenics
    var tab = this.data.activeTab
    var list = scenics.filter(function (s) {
      if (tab === 'all') return true
      if (tab === '5a') return s.level && s.level.indexOf('5A') !== -1
      if (tab === '4a') return s.level && s.level.indexOf('4A') !== -1
      if (tab === 'free') return s.price === 0 || !s.price
      return true
    })
    this.setData({ filteredList: list })
  },

  loadScenicSpots: function () {
    base.startLoad.call(this)
    var self = this
    var favs = getFavorites()
    var favIds = favs.map(function(f) { return f.id })

    api.request({ url: '/products?category=scenic', method: 'GET' }).then(products => {
      if (products && products.length > 0) {
        const scenics = products.map(p => ({
          id: p.id, name: p.name, level: p.tag_name || '景区',
          image: p.image_url || IMG.SCENIC.b1, intro: p.description || '桂林著名景点，风景如画',
          price: p.price || 0, time: p.duration || '2小时', expanded: false,
          safetyTips: p.safety_tips || '出行请注意安全', transport: p.transport || '市内公交可达',
          hours: p.opening_hours || '8:00-18:00', elderScore: p.elder_score || '4.0',
          walkDistance: p.walk_distance || '约500m', stairsCount: p.stairs_count || '少量台阶',
          restArea: p.rest_area || '有休息区',
          isFavorited: favIds.indexOf(p.id) !== -1
        }))
        self.setData({ scenics: scenics })
        self.applyFilter()
        base.finishLoad.call(self, scenics, { scenics, tips: { icon: '💡', text: '点击卡片展开详情，查看老人友好提示' } })
      } else { self.useScenicFallback() }
    }).catch(() => { self.useScenicFallback() })
  },

  useScenicFallback: function () {
    var favs = getFavorites()
    var favIds = favs.map(function(f) { return f.id })
    var scenics = buildScenics().map(function(s) {
      s.isFavorited = favIds.indexOf(s.id) !== -1
      return s
    })
    this.setData({ scenics: scenics })
    this.applyFilter()
    base.finishLoad.call(this, scenics, { scenics, tips: { icon: '💡', text: '点击卡片展开详情，查看老人友好提示' } })
  },

  toggleExpand: function (e) {
    var index = e.currentTarget.dataset.index
    var item = this.data.filteredList[index]
    var scenics = this.data.scenics
    var realIndex = -1
    for (var i = 0; i < scenics.length; i++) {
      if (scenics[i].id === item.id) { realIndex = i; break }
    }
    if (realIndex >= 0) {
      scenics[realIndex].expanded = !item.expanded
      this.setData({ scenics: scenics })
      this.applyFilter()
      if (!item.expanded) voice.speak(item.name + '，' + item.intro)
    }
  },

  toggleFavorite: function (e) {
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name
    var price = e.currentTarget.dataset.price
    try {
      var favs = wx.getStorageSync('user_favorites') || []
      var idx = favs.findIndex(function(f) { return f.id == id })
      if (idx === -1) {
        favs.push({ id: id, name: name, price: price })
        wx.showToast({ title: '已收藏', icon: 'success' })
        voice.speak(name + '已加入收藏')
      } else {
        favs.splice(idx, 1)
        wx.showToast({ title: '已取消收藏', icon: 'none' })
      }
      wx.setStorageSync('user_favorites', favs)
      this.loadScenicSpots()
    } catch(e) {}
  },

  goDetails: base.goDetails,

  goMap: function () {
    voice.speak('正在打开景点地图')
    nav.go('/pages/map/map', '景点地图')
  },

  goTraffic: function () {
    voice.speak('正在打开交通指南')
    nav.go('/pages/transport/transport', '交通指南')
  },

  goFood: function () {
    voice.speak('正在打开周边美食')
    nav.go('/pages/food/food', '周边美食')
  }
})

function buildScenics() {
  return [
    { id: 1, name: '漓江精华段', level: '5A景区', image: IMG.SCENIC.b1, intro: '桂林山水精华，乘船欣赏黄布倒影、九马画山等经典景观。', price: 215, time: '4小时', expanded: false, safetyTips: '漓江沿岸步道青苔较多，上下船时请慢行，雨天甲板湿滑。建议穿防滑鞋。', transport: '桂林市区乘5路、16路公交至漓江码头', hours: '8:00-17:30', elderScore: '4.2', walkDistance: '约500m', stairsCount: '0级台阶', restArea: '码头有休息亭' },
    { id: 2, name: '象鼻山公园', level: '5A景区', image: IMG.SCENIC.b2, intro: '桂林城徽象鼻山，形状酷似大象饮水，是桂林的标志性景点。', price: 55, time: '1.5小时', expanded: false, safetyTips: '台阶较多且较陡，请使用扶手慢行。山脚江边有青苔，注意防滑。', transport: '乘2路、16路公交至象山公园站', hours: '8:00-18:00', elderScore: '3.8', walkDistance: '约800m', stairsCount: '约80级台阶', restArea: '山顶有休息平台' },
    { id: 3, name: '阳朔西街', level: '4A景区', image: IMG.SCENIC.b3, intro: '中西文化交融的千年古街，可品尝地道啤酒鱼和桂林米粉。', price: 0, time: '2小时', expanded: false, safetyTips: '石板路面凹凸不平，雨天注意积水湿滑。建议白天游览。', transport: '桂林汽车站乘大巴至阳朔（约1小时）', hours: '全天开放', elderScore: '4.5', walkDistance: '约600m', stairsCount: '0级台阶', restArea: '沿街有长椅' },
    { id: 4, name: '龙脊梯田', level: '4A景区', image: IMG.SCENIC.b1, intro: '世界人工奇观，层层梯田从山脚盘绕到山顶，秋季金黄最美。', price: 80, time: '半天', expanded: false, safetyTips: '雨天极度湿滑，强烈不建议老人前往梯田深处。建议仅在观景台游览。', transport: '桂林汽车站乘班车至龙胜（约2.5小时）', hours: '7:00-18:00', elderScore: '2.5', walkDistance: '约300m', stairsCount: '约200级台阶', restArea: '观景台有休息区' },
    { id: 5, name: '芦笛岩', level: '4A景区', image: IMG.SCENIC.b2, intro: '著名溶洞景观，钟乳石千姿百态，被誉为"大自然艺术之宫"。', price: 90, time: '1.5小时', expanded: false, safetyTips: '洞口地面湿滑，入洞请慢行。洞内外温差约10度，建议带薄外套。', transport: '乘3路、14路至芦笛岩站', hours: '8:00-17:00', elderScore: '3.5', walkDistance: '约400m', stairsCount: '约60级台阶', restArea: '洞口有休息区' },
    { id: 6, name: '两江四湖景区', level: '5A景区', image: IMG.SCENIC.b3, intro: '桂林市中心环城水系，夜游灯光璀璨，景色迷人。', price: 220, time: '2小时', expanded: false, safetyTips: '夜游船只安全性高，上下船有工作人员扶助。湖边步道平坦，适合散步。', transport: '市中心步行可达，杉湖知音台码头最近', hours: '日游8:30-17:00，夜游19:00-21:30', elderScore: '4.3', walkDistance: '约1km', stairsCount: '0级台阶', restArea: '沿湖有多个休息亭' },
    { id: 7, name: '杨堤码头', level: '漓江精华段起点', image: IMG.SCENIC.b1, intro: '漓江竹筏漂流的起点，欣赏漓江美景的最佳方式。', price: 160, time: '2小时', expanded: false, safetyTips: '上下竹筏请听从船夫指引，穿好救生衣。竹筏行驶中坐稳扶好。', transport: '桂林汽车站乘阳朔班车，杨堤路口下车', hours: '7:30-17:30', elderScore: '3.9', walkDistance: '约200m', stairsCount: '0级台阶', restArea: '码头有等候区' }
  ]
}