Page({
  data: {
    summary: {
      status: '基本畅通',
      time: '更新 08:30',
      green: 8,
      orange: 3,
      red: 1
    },
    roads: [
      { name: '中山中路', desc: '市中心主干道', speed: '35km/h', status: '缓行' },
      { name: '漓江路', desc: '通往阳朔', speed: '45km/h', status: '畅通' },
      { name: '解放东路', desc: '商业中心', speed: '30km/h', status: '缓行' },
      { name: '环城北路', desc: '火车站方向', speed: '52km/h', status: '畅通' },
      { name: '翠竹路', desc: '机场方向', speed: '55km/h', status: '畅通' },
      { name: '中山南路', desc: '象鼻山附近', speed: '18km/h', status: '拥堵' },
      { name: '临桂大道', desc: '新城区', speed: '48km/h', status: '畅通' },
      { name: '南环路', desc: '两江四湖', speed: '42km/h', status: '畅通' },
      { name: '信义路', desc: '步行街区', speed: '28km/h', status: '缓行' },
      { name: '滨江路', desc: '漓江沿岸', speed: '44km/h', status: '畅通' }
    ],
    scenicTraffic: [
      { name: '象鼻山公园', parking: '紧张' },
      { name: '两江四湖', parking: '充足' },
      { name: '芦笛岩', parking: '充足' },
      { name: '阳朔西街', parking: '紧张' }
    ],
    scenicSuggest: '象鼻山公园停车紧张，建议乘坐2路、16路公交前往',
    tips: [
      { icon: '🕐', text: '避开早高峰 8:00-9:00 出行更顺畅' },
      { icon: '🚌', text: '景区周边人多停车难，建议乘坐公交' },
      { icon: '🗺️', text: '出发前先查看路况，合理规划路线' },
      { icon: '📞', text: '路况咨询热线：0773-XXXXXXX' }
    ]
  }
})
