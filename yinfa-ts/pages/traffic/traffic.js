var app = getApp()
var voice = require('../../utils/voice.js')
var amap = require('../../utils/amap-service.js')

var ROUTE_COORDS = {
  '中山路': { origin: '110.2860,25.2830', dest: '110.2900,25.2636' },
  '漓江路': { origin: '110.2950,25.2736', dest: '110.3050,25.2736' },
  '环城南路': { origin: '110.2800,25.2636', dest: '110.3100,25.2836' },
  '中山中路': { origin: '110.2860,25.2800', dest: '110.2880,25.2700' },
  '滨江路': { origin: '110.2954,25.2622', dest: '110.2960,25.2900' },
  '机场路': { origin: '110.1700,25.2300', dest: '110.0500,25.2100' }
}

Page({
  data: {
    roads: [],
    tips: [],
    loading: true,
    error: false,
    lastUpdate: '',
    fontSizeMode: 'normal'
  },

  onLoad: function () {
    var fontMode = app.globalData.fontSizeMode || 'normal'
    this.setData({
      fontSizeMode: fontMode
    })
    this.loadTraffic()
  },

  loadTraffic: function () {
    var self = this
    self.setData({ loading: true, error: false })

    amap.getRoadStatus().then(function(result) {
      var enriched = (result.roads || []).map(enrichRoad)
      self.setData({
        roads: enriched,
        tips: result.tips,
        loading: false,
        error: false,
        lastUpdate: formatTime(new Date())
      })
    }).catch(function() {
      self.setData({ loading: false, error: true })
    })
  },

  goAmapApp: function (e) {
    var name = e.currentTarget.dataset.name
    var coords = ROUTE_COORDS[name]
    if (!coords) {
      wx.showToast({ title: '暂无导航数据', icon: 'none' })
      return
    }

    voice.speak('正在打开' + name + '的导航')

    wx.showActionSheet({
      itemList: ['使用高德地图导航', '使用微信内置导航', '查看沿线交通详情'],
      success: function(res) {
        if (res.tapIndex === 0) {
          wx.navigateToMiniProgram({
            appId: 'wx65cc950f42e8fff1',
            path: 'pages/navi/navi?start=&dest=' + encodeURIComponent(name) + '&type=drive',
            fail: function () {
              wx.showToast({ title: '请安装高德地图APP', icon: 'none' })
            }
          })
        } else if (res.tapIndex === 1) {
          var parts = coords.dest.split(',')
          wx.openLocation({
            latitude: parseFloat(parts[1]),
            longitude: parseFloat(parts[0]),
            name: name,
            scale: 15
          })
        } else if (res.tapIndex === 2) {
          self.showTrafficDetail(name)
        }
      }
    })
  },

  showTrafficDetail: function (name) {
    var road = null
    for (var i = 0; i < this.data.roads.length; i++) {
      if (this.data.roads[i].name === name) {
        road = this.data.roads[i]
        break
      }
    }
    if (!road) return

    var statusLabel = road.status === 'smooth' ? '🟢 畅通' :
                      road.status === 'slow' ? '🟡 缓行' :
                      road.status === 'blocked' ? '⛔ 阻断' : '🔴 拥堵'

    wx.showModal({
      title: road.name + ' 路况详情',
      content: '路段：' + road.from + ' → ' + road.to + '\n'
             + '状态：' + statusLabel + '\n'
             + '平均速度：' + (road.speed || '?') + ' km/h\n'
             + '预计耗时：' + (road.duration || '?') + ' 分钟\n'
             + '距离：约' + formatDistance(road.distance || 0) + '\n\n'
             + road.detail,
      confirmText: '导航去这里',
      cancelText: '关闭',
      confirmColor: '#2E8B57',
      success: function(res) {
        if (res.confirm) {
          var coords = ROUTE_COORDS[name]
          if (coords) {
            var parts = coords.dest.split(',')
            wx.openLocation({
              latitude: parseFloat(parts[1]),
              longitude: parseFloat(parts[0]),
              name: name,
              scale: 15
            })
          }
        }
      }
    })
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 })
  }
})

function formatTime(date) {
  var h = date.getHours()
  var m = date.getMinutes()
  return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m)
}

function formatDistance(m) {
  if (m >= 1000) return (m / 1000).toFixed(1) + 'km'
  return m + 'm'
}

function formatStatusText(status) {
  if (status === 'smooth') return '畅通'
  if (status === 'slow') return '缓行'
  if (status === 'blocked') return '阻断'
  return '拥堵'
}

function enrichRoad(road) {
  road.statusText = formatStatusText(road.status)
  road.distanceText = '约' + formatDistance(road.distance || 0)
  return road
}