const api = require('./api.js')

const FALLBACK_WEATHER = {
  icon: '⛅',
  temp: '22°C',
  condition: '多云',
  humidity: '65%',
  wind: '南风2级',
  isReal: false,
  city: '桂林'
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
      isReal: true,
      city: res.city || targetCity,
      reportTime: res.reportTime || ''
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

function getSlipperyAdvice(weather) {
  const cond = (weather.condition || '').toLowerCase()
  if (cond.includes('雨') || cond.includes('雪')) {
    return {
      level: 3,
      title: '路面湿滑预警',
      desc: '当前桂林天气' + weather.condition + '，路面湿滑。老人出行请务必穿防滑鞋，携带拐杖，建议选择两江四湖等平坦景区游览，避免前往龙脊梯田等山区景点。'
    }
  }
  if (cond.includes('阴') || weather.humidity === '--') {
    return {
      level: 2,
      title: '路面注意',
      desc: '当前桂林天气' + weather.condition + '，湿度' + (weather.humidity || '较高') + '。建议穿防滑运动鞋，象鼻山台阶较陡请使用扶手，西街石板路注意脚下。'
    }
  }
  return {
    level: 1,
    title: '路面安全',
    desc: '当前桂林天气' + weather.condition + '，天气晴朗适合外出游览。可以前往漓江游船、阳朔西街、芦笛岩等景点，记得做好防晒措施。'
  }
}

function getTravelAdvice(weather) {
  const cond = (weather.condition || '').toLowerCase()
  if (cond.includes('雨')) {
    return {
      advice: '今日有雨，推荐游览芦笛岩溶洞、靖江王城等室内景点，或选择漓江游船欣赏烟雨漓江美景',
      suitable: ['芦笛岩', '靖江王城', '漓江游船'],
      avoid: ['龙脊梯田', '徒步漓江', '杨堤竹筏']
    }
  }
  if (cond.includes('晴') || cond.includes('多云')) {
    return {
      advice: '今日天气晴朗，适合前往象鼻山、两江四湖、阳朔西街，或去杨堤码头乘竹筏漂流漓江',
      suitable: ['象鼻山', '两江四湖', '阳朔西街', '漓江游船', '杨堤码头'],
      avoid: []
    }
  }
  return {
    advice: '今日天气适宜，可以选择任意景点游览',
    suitable: ['象鼻山', '漓江', '阳朔西街', '龙脊梯田', '芦笛岩', '杨堤码头'],
    avoid: []
  }
}

module.exports = {
  getWeather,
  getSlipperyAdvice,
  getTravelAdvice,
  FALLBACK_WEATHER
}
