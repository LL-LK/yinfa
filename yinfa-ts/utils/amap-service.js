var AMAP_KEY = ''
var AMAP_BASE = 'https://restapi.amap.com/v3'

var GUILIN_CENTER = { lng: 110.2900, lat: 25.2736 }

var FALLBACK_ROADS = [
  { name: '中山路', from: '火车站', to: '叠彩山', coords: '110.2900,25.2736;110.2950,25.2830', detail: '桂林南北主干道，贯穿市区核心商圈', status: 'congested', speed: 18, duration: 28 },
  { name: '漓江路', from: '甲天下广场', to: '漓江桥', coords: '110.2950,25.2736;110.3050,25.2736', detail: '东西向主干道，连接市中心和漓江东岸', status: 'smooth', speed: 42, duration: 12 },
  { name: '环城南路', from: '瓦窑', to: '八里街', coords: '110.2800,25.2636;110.3100,25.2836', detail: '城市环线，过境车辆较多', status: 'slow', speed: 28, duration: 22 },
  { name: '中山中路', from: '十字街', to: '南门桥', coords: '110.2860,25.2800;110.2880,25.2700', detail: '商业步行街区，建议绕行滨江路', status: 'congested', speed: 12, duration: 35 },
  { name: '滨江路', from: '象鼻山', to: '叠彩山', coords: '110.2954,25.2622;110.2960,25.2900', detail: '漓江沿岸景观路，适合银发出行', status: 'smooth', speed: 38, duration: 15 },
  { name: '机场路', from: '临桂', to: '两江机场', coords: '110.1700,25.2300;110.0500,25.2100', detail: '通往两江国际机场的快速通道', status: 'smooth', speed: 65, duration: 25 }
]

var FALLBACK_TIPS = [
  { icon: '🚌', text: '公交1号线沿中山路行驶，高峰期建议错峰' },
  { icon: '🚶', text: '滨江路适合步行游览，沿途可欣赏漓江风光' },
  { icon: '⏰', text: '工作日 7:30-9:00、17:00-18:30 为拥堵高峰' },
  { icon: '🚕', text: '起步价8元，市内打车到阳朔约80-100元' },
  { icon: '🅿️', text: '象鼻山、七星公园周边停车位较紧张' },
  { icon: '🔄', text: '主城区限行外埠牌照，建议公交出行' }
]

function requestAmap(path, data) {
  return new Promise(function(resolve, reject) {
    if (!AMAP_KEY) {
      reject({ missingKey: true })
      return
    }

    var qs = 'key=' + encodeURIComponent(AMAP_KEY)
    for (var k in data) {
      if (data.hasOwnProperty(k)) {
        qs += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
      }
    }

    wx.request({
      url: AMAP_BASE + path + '?' + qs,
      method: 'GET',
      timeout: 8000,
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.status === '1') {
          resolve(res.data)
        } else {
          reject(res.data || { info: 'API error' })
        }
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}

function getTrafficCircle(radius) {
  return requestAmap('/traffic/status/circle', {
    location: GUILIN_CENTER.lng + ',' + GUILIN_CENTER.lat,
    radius: radius || 5000,
    extensions: 'all',
    level: 4
  })
}

function getTrafficRectangle(rect) {
  return requestAmap('/traffic/status/rectangle', {
    rectangle: rect || '110.2300,25.2200;110.3500,25.3300',
    extensions: 'all',
    level: 4
  })
}

function getDriving(origin, destination) {
  return requestAmap('/direction/driving', {
    origin: origin,
    destination: destination,
    strategy: 0,
    extensions: 'all'
  })
}

function getRoadStatus() {
  return new Promise(function(resolve) {
    var roadData = FALLBACK_ROADS.slice()

    if (!AMAP_KEY) {
      resolve({ roads: addDynamicStatus(roadData), tips: FALLBACK_TIPS, fromApi: false })
      return
    }

    var requests = roadData.map(function(road) {
      var parts = road.coords.split(';')
      return getDriving(parts[0], parts[parts.length - 1]).then(function(res) {
        if (res.route && res.route.paths && res.route.paths.length > 0) {
          var path = res.route.paths[0]
          var totalSecs = 0
          for (var i = 0; i < path.steps.length; i++) {
            totalSecs += parseInt(path.steps[i].duration) || 0
          }
          var dur = Math.round(totalSecs / 60)
          var dist = parseInt(path.distance) || 0
          var speed = dur > 0 ? Math.round(dist / (dur * 60) * 3.6) : 0

          var status = 'smooth'
          if (path.trafficstatus == 2) status = 'slow'
          else if (path.trafficstatus == 3) status = 'congested'
          else if (path.trafficstatus == 4) status = 'blocked'

          return {
            name: road.name,
            from: road.from,
            to: road.to,
            detail: '实时路况：' + road.detail,
            status: status,
            speed: speed,
            duration: dur,
            distance: dist
          }
        }
        return road
      }).catch(function() {
        return road
      })
    })

    Promise.all(requests).then(function(results) {
      resolve({ roads: addDynamicStatus(results), tips: FALLBACK_TIPS, fromApi: true })
    }).catch(function() {
      resolve({ roads: addDynamicStatus(roadData), tips: FALLBACK_TIPS, fromApi: false })
    })
  })
}

function addDynamicStatus(roads) {
  var now = new Date()
  var hour = now.getHours()
  var day = now.getDay()
  var isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
  var isWeekend = day === 0 || day === 6

  return roads.map(function(road, i) {
    if (road.status && road.speed) return road

    var baseSpeed = 40 - i * 3
    if (isPeak) baseSpeed -= 15
    if (isWeekend && i < 2) baseSpeed -= 5

    var status = 'smooth'
    if (baseSpeed < 20) status = 'congested'
    else if (baseSpeed < 30) status = 'slow'

    return {
      name: road.name,
      from: road.from,
      to: road.to,
      detail: road.detail,
      status: status,
      speed: Math.max(baseSpeed, 5),
      duration: Math.round(road.distance ? road.distance / baseSpeed * 60 : (15 + i * 5)),
      distance: road.distance || 3000 + i * 800
    }
  })
}

function getTrafficAroundScenic(scenicLng, scenicLat) {
  if (!AMAP_KEY) {
    return Promise.reject({ missingKey: true })
  }
  return getTrafficCircle(3000)
}

function setAmapKey(key) {
  AMAP_KEY = key
}

function hasAmapKey() {
  return !!AMAP_KEY
}

module.exports = {
  getRoadStatus: getRoadStatus,
  getTrafficCircle: getTrafficCircle,
  getTrafficRectangle: getTrafficRectangle,
  getDriving: getDriving,
  getTrafficAroundScenic: getTrafficAroundScenic,
  setAmapKey: setAmapKey,
  hasAmapKey: hasAmapKey,
  FALLBACK_ROADS: FALLBACK_ROADS,
  FALLBACK_TIPS: FALLBACK_TIPS,
  GUILIN_CENTER: GUILIN_CENTER
}