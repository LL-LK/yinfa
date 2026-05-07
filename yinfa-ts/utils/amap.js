const AMAP_KEY = '829dd231de2233a32cf4c3f2441733ca'
const AMAP_BASE_URL = 'https://restapi.amap.com/v3'

function request(url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: AMAP_BASE_URL + url,
      data: { key: AMAP_KEY, ...data },
      success: (res) => {
        if (res.data.status === '1') {
          resolve(res.data)
        } else {
          reject(new Error(res.data.info || '请求失败'))
        }
      },
      fail: reject
    })
  })
}

function getTrafficStatus(roadName) {
  return request('/traffic/status/road', { name: roadName, extensions: 'all' })
    .then(data => {
      if (!data.trafficinfo || !data.trafficinfo.roads) {
        return { road: roadName, status: '畅通', description: '道路畅通' }
      }
      const road = data.trafficinfo.roads[0]
      const congestion = road && road.traffic_lights ? parseFloat(road.traffic_lights) : 0
      let status = '畅通'
      let statusText = '畅通'
      if (congestion > 0.7) {
        status = '拥堵'
        statusText = '拥堵'
      } else if (congestion > 0.4) {
        status = '缓行'
        statusText = '缓行'
      }
      return {
        road: roadName,
        status: statusText,
        statusCode: status,
        description: road ? road.description || road.status || '' : '',
        speed: road ? road.speed || '' : ''
      }
    })
}

function getWeather(city = '桂林') {
  return request('/weather/weatherInfo', { city: city, extensions: 'all' })
    .then(data => {
      if (!data.lives || data.lives.length === 0) {
        return getDefaultWeather()
      }
      const live = data.lives[0]
      const condition = live.weather || '晴'
      let slippery = '安全'
      if (condition.includes('雨') || condition.includes('雪')) {
        slippery = '注意'
      }
      if (condition.includes('暴雨') || condition.includes('大雪')) {
        slippery = '危险'
      }
      return {
        weather: condition,
        temperature: live.temperature + '°C',
        tempRange: `${live.temperature}°C`,
        humidity: live.humidity + '%',
        wind: live.wind + ' ' + live.windpower + '级',
        reportTime: live.reporttime,
        slippery: slippery,
        city: live.city
      }
    })
    .catch(() => getDefaultWeather())
}

function getDefaultWeather() {
  return {
    weather: '晴',
    temperature: '26°C',
    tempRange: '22~30°C',
    humidity: '65%',
    wind: '东南风 2级',
    reportTime: new Date().toLocaleString(),
    slippery: '安全',
    city: '桂林'
  }
}

function searchPOI(keywords, city = '桂林') {
  return request('/place/text', {
    keywords: keywords,
    city: city,
    types: '风景名胜|餐饮服务|医疗保健|交通设施',
    offset: 20,
    page: 1,
    output: 'json'
  }).then(data => {
    if (!data.pois) return []
    return data.pois.map(p => ({
      id: p.id,
      name: p.name,
      address: p.address || p.location,
      location: p.location,
      type: p.type,
      distance: p.distance
    }))
  })
}

function getNavigation(from, to) {
  return request('/direction/driving', {
    origin: from,
    destination: to,
    strategy: '0'
  }).then(data => {
    if (!data.route) return null
    const route = data.route
    const path = route.paths[0]
    return {
      distance: formatDistance(path.distance),
      duration: formatDuration(path.duration),
      strategy: path.strategy,
      steps: path.steps.map(s => ({
        instruction: s.instruction.replace(/<[^>]+>/g, ''),
        distance: formatDistance(parseInt(s.distance)),
        road: s.road
      })),
      taxi: route.taxi ? {
        distance: formatDistance(parseInt(route.taxi.distance)),
        duration: formatDuration(parseInt(route.taxi.duration)),
        price: route.taxi.detail ? route.taxi.detail[0].price : '约' + Math.round(route.taxi.surname) + '元'
      } : null
    }
  })
}

function formatDistance(m) {
  if (m >= 1000) {
    return (m / 1000).toFixed(1) + '公里'
  }
  return m + '米'
}

function formatDuration(s) {
  if (s >= 3600) {
    return Math.floor(s / 3600) + '小时' + Math.floor((s % 3600) / 60) + '分钟'
  }
  if (s >= 60) {
    return Math.floor(s / 60) + '分钟'
  }
  return s + '秒'
}

function geocode(address, city = '桂林') {
  return request('/geocode/geocode', { address: address, city: city })
    .then(data => {
      if (!data.geocodes || data.geocodes.length === 0) return null
      const g = data.geocodes[0]
      return {
        province: g.province,
        city: g.city,
        district: g.district,
        location: g.location,
        address: g.formatted_address
      }
    })
}

function regeocode(location) {
  return request('/geocode/regeo', { location: location })
    .then(data => {
      if (!data.regeocode) return null
      const r = data.regeocode
      return {
        address: r.formatted_address,
        city: r.addressComponent.city,
        district: r.addressComponent.district,
        poi: r.pois ? r.pois[0] : null
      }
    })
}

module.exports = {
  AMAP_KEY,
  getTrafficStatus,
  getWeather,
  searchPOI,
  getNavigation,
  geocode,
  regeocode,
  formatDistance,
  formatDuration
}
