const voice = require('../../utils/voice.js')
const amap = require('../../utils/amap.js')

Page({
  data: {
    summary: { status: '加载中...', time: '', green: 0, orange: 0, red: 0 },
    roads: [],
    scenicParking: [],
    tips: [],
    weather: null,
    loading: true
  },

  onLoad: function () {
    this.loadData()
  },

  async loadData() {
    wx.showLoading({ title: '加载中...' })
    
    const now = new Date()
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
    
    this.setData({ loading: true })
    
    try {
      const [weather, trafficData] = await Promise.all([
        this.loadWeather(),
        this.loadTraffic()
      ])
      
      this.setData({
        summary: {
          status: this.calculateOverallStatus(trafficData),
          time: '更新 ' + timeStr,
          green: trafficData.filter(r => r.status === '畅通').length,
          orange: trafficData.filter(r => r.status === '缓行').length,
          red: trafficData.filter(r => r.status === '拥堵').length
        },
        roads: trafficData,
        weather: weather,
        tips: this.generateTips(weather, trafficData),
        loading: false
      })
      
    } catch (err) {
      console.error('加载失败:', err)
      this.setData({
        roads: this.getDefaultRoads(),
        weather: amap.getDefaultWeather(),
        summary: { status: '基本畅通', time: '更新 ' + timeStr, green: 6, orange: 3, red: 1 },
        tips: [
          { icon: '🕐', text: '避开早高峰 8:00-9:00 出行更顺畅' },
          { icon: '🚌', text: '景区周边人多停车难，建议老人乘坐公交' },
          { icon: '🗺️', text: '出发前先查看路况，合理规划路线' },
          { icon: '📞', text: '桂林市交通服务热线：0773-12328' }
        ],
        loading: false
      })
    }
    
    wx.hideLoading()
  },

  async loadWeather() {
    try {
      const weather = await amap.getWeather('桂林')
      return weather
    } catch (err) {
      console.error('天气加载失败:', err)
      return amap.getDefaultWeather()
    }
  },

  async loadTraffic() {
    const roadNames = [
      '中山路',
      '漓江路',
      '解放路',
      '环城路',
      '七星路',
      '象山路',
      '机场路',
      '香江路',
      '临桂路',
      '南环路'
    ]
    
    const promises = roadNames.map(name => 
      amap.getTrafficStatus(name).catch(() => ({
        road: name,
        status: '畅通',
        statusCode: '畅通',
        description: '道路畅通'
      }))
    )
    
    const results = await Promise.all(promises)
    
    return results.map(r => ({
      name: r.road || r.name,
      desc: this.getRoadDesc(r.road || r.name),
      status: r.status,
      statusCode: r.statusCode || r.status,
      description: r.description || '',
      speed: r.speed || ''
    }))
  },

  getRoadDesc(name) {
    const descs = {
      '中山路': '市中心主干道',
      '漓江路': '通往阳朔',
      '解放路': '商业中心',
      '环城路': '环城快速路',
      '七星路': '七星公园方向',
      '象山路': '象鼻山附近',
      '机场路': '两江机场方向',
      '香江路': '火车站附近',
      '临桂路': '临桂新区',
      '南环路': '两江四湖'
    }
    return descs[name] || ''
  },

  calculateOverallStatus(roads) {
    const redCount = roads.filter(r => r.status === '拥堵').length
    const orangeCount = roads.filter(r => r.status === '缓行').length
    
    if (redCount > 2) return '拥堵严重'
    if (redCount > 0) return '部分拥堵'
    if (orangeCount > 3) return '基本畅通'
    return '畅通'
  },

  generateTips(weather, roads) {
    const tips = []
    
    if (weather.slippery === '注意' || weather.slippery === '危险') {
      tips.push({ icon: '⚠️', text: '今日有雨，路面湿滑，请穿防滑鞋，慢行' })
    }
    
    if (weather.weather.includes('高温') || weather.weather.includes('晴')) {
      tips.push({ icon: '☀️', text: '今日高温，注意防暑，多饮水' })
    }
    
    const congestionCount = roads.filter(r => r.status === '拥堵').length
    if (congestionCount > 0) {
      tips.push({ icon: '🚗', text: `${congestionCount}条道路拥堵，请提前规划路线` })
    }
    
    tips.push({ icon: '🕐', text: '建议避开早高峰 8:00-9:00 出行' })
    tips.push({ icon: '🚌', text: '老人建议乘坐公交出行，更安全舒适' })
    tips.push({ icon: '📞', text: '桂林市交通服务热线：0773-12328' })
    
    return tips
  },

  getDefaultRoads() {
    return [
      { name: '中山路', desc: '市中心主干道', status: '畅通' },
      { name: '漓江路', desc: '通往阳朔', status: '畅通' },
      { name: '解放路', desc: '商业中心', status: '缓行' },
      { name: '环城路', desc: '环城快速路', status: '畅通' },
      { name: '七星路', desc: '七星公园方向', status: '畅通' },
      { name: '象山路', desc: '象鼻山附近', status: '缓行' },
      { name: '机场路', desc: '两江机场方向', status: '畅通' },
      { name: '香江路', desc: '火车站附近', status: '拥堵' }
    ]
  },

  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => wx.stopPullDownRefresh(), 1000)
  },

  readSummary() {
    const s = this.data.summary
    voice.speak('当前桂林整体路况：' + s.status + '。' + s.green + '条道路畅通，' + s.orange + '条道路缓行，' + s.red + '条道路拥堵。')
  }
})
