const api = require('./api.js')

const FALLBACK_WEATHER = {
  icon: '⛅',
  temp: '18°C ~ 26°C',
  condition: '多云转晴',
  humidity: '65%',
  wind: '微风2级',
  isReal: false
}

function getWeather(city) {
  const targetCity = city || '桂林'

  return api.request({
    url: '/weather',
    method: 'GET',
    data: { city: targetCity },
    showLoading: false
  }).then(res => {
    return {
      icon: _mapIcon(res.condition || res.weather || ''),
      temp: res.temp || res.temperature || '--',
      condition: res.condition || res.weather || '--',
      humidity: res.humidity || '--',
      wind: res.wind || '--',
      isReal: true
    }
  }).catch(() => {
    return FALLBACK_WEATHER
  })
}

function _mapIcon(condition) {
  const text = (condition || '').toLowerCase()
  if (text.includes('晴')) return '☀️'
  if (text.includes('多云')) return '⛅'
  if (text.includes('阴')) return '☁️'
  if (text.includes('雨')) return '🌧️'
  if (text.includes('雪')) return '🌨️'
  if (text.includes('风')) return '💨'
  return '🌤️'
}

// 获取路面湿滑等级建议
function getSlipperyAdvice(weather) {
  const cond = (weather.condition || '').toLowerCase()
  if (cond.includes('雨') || cond.includes('雪')) {
    return {
      level: 3,
      title: '路面湿滑预警',
      desc: '当前' + weather.condition + '，路面湿滑，老人出行请务必穿防滑鞋，携带拐杖，尽量避免前往台阶较多的景点。'
    }
  }
  if (cond.includes('阴') || weather.humidity === '--') {
    return {
      level: 2,
      title: '路面注意',
      desc: '当前' + weather.condition + '，湿度' + (weather.humidity || '正常') + '，建议穿防滑运动鞋，注意台阶和青苔。'
    }
  }
  return {
    level: 1,
    title: '路面安全',
    desc: '当前' + weather.condition + '，路面干燥，适合外出游览。建议穿防滑运动鞋，携带拐杖更安心。'
  }
}

module.exports = {
  getWeather,
  getSlipperyAdvice,
  FALLBACK_WEATHER
}
