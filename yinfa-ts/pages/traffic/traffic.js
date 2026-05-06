Page({
  data: {
    summary: {
      status: '基本畅通',
      time: '08:30',
      green: 8,
      orange: 3,
      red: 1
    },
    roads: [
      { name: '中山中路', desc: '市中心主干道', speed: '35km/h', status: '缓行' },
      { name: '漓江路', desc: '通往阳朔方向', speed: '45km/h', status: '畅通' },
      { name: '解放东路', desc: '商业中心区域', speed: '30km/h', status: '缓行' },
      { name: '环城北路', desc: '火车站方向', speed: '50km/h', status: '畅通' },
      { name: '翠竹路', desc: '通往机场方向', speed: '55km/h', status: '畅通' },
      { name: '中山南路', desc: '象鼻山附近', speed: '20km/h', status: '拥堵' },
      { name: '临桂大道', desc: '新城区方向', speed: '48km/h', status: '畅通' },
      { name: '南环路', desc: '两江四湖周边', speed: '40km/h', status: '畅通' },
      { name: '信义路', desc: '步行街区域', speed: '28km/h', status: '缓行' },
      { name: '滨江路', desc: '漓江沿岸', speed: '42km/h', status: '畅通' }
    ],
    scenicTraffic: [
      {
        name: '象鼻山公园',
        parking: '紧张',
        desc: '景区周边车辆较多，建议乘坐公交前往',
        suggest: '可乘坐2路、16路公交到象山公园站下车'
      },
      {
        name: '两江四湖景区',
        parking: '充足',
        desc: '周边有多处停车场，交通便利',
        suggest: '推荐从文昌桥码头进入，人流量较小'
      },
      {
        name: '芦笛岩',
        parking: '充足',
        desc: '景区停车位充足，道路通畅',
        suggest: '景区距市区约6公里，驾车约20分钟'
      },
      {
        name: '阳朔西街',
        parking: '紧张',
        desc: '旅游旺季停车困难，建议乘坐旅游专线',
        suggest: '桂林汽车站有直达阳朔的旅游大巴'
      }
    ],
    tips: [
      { icon: '🕐', text: '避开早高峰8:00-9:00出行' },
      { icon: '🚌', text: '人多路段优先乘坐公交' },
      { icon: '🗺️', text: '提前查看路线规划行程' },
      { icon: '📞', text: '路况咨询: 0773-XXXXXXX' }
    ]
  }
})
