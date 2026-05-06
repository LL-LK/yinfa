Page({
  data: {
    weather: {
      icon: '⛅',
      temp: '18°C ~ 26°C',
      condition: '多云转晴',
      humidity: '65%',
      wind: '微风2级',
      slippery: '注意'
    },
    slipperyLevel: 1,
    slipperyText: {
      title: '路面安全',
      desc: '今日天气晴好，路面干燥，适合外出游览'
    },
    warnings: [
      {
        name: '漓江沿岸步道',
        desc: '江边石阶可能有青苔，请小心行走',
        level: 'medium'
      },
      {
        name: '象鼻山登山台阶',
        desc: '部分台阶较陡，建议使用扶手，雨后更需注意',
        level: 'medium'
      },
      {
        name: '阳朔西街石板路',
        desc: '古街石板凹凸不平，雨天注意积水',
        level: 'low'
      },
      {
        name: '龙脊梯田山路',
        desc: '雨后山路湿滑严重，老年人不建议前往',
        level: 'high'
      },
      {
        name: '芦笛岩洞口',
        desc: '洞口水汽重，地面常年湿润，请慢行',
        level: 'medium'
      },
      {
        name: '两江四湖码头',
        desc: '上下船区域湿滑，请听从工作人员引导',
        level: 'medium'
      }
    ],
    tips: [
      {
        icon: '👟',
        title: '穿防滑鞋',
        desc: '出门游览请穿防滑、合脚的运动鞋，避免穿拖鞋或硬底鞋'
      },
      {
        icon: '🦯',
        title: '使用拐杖',
        desc: '建议携带拐杖或登山杖，增加行走稳定性，减轻膝盖负担'
      },
      {
        icon: '🐢',
        title: '慢行不着急',
        desc: '游览时放慢脚步，避免匆忙行走，给自己充足的游览时间'
      },
      {
        icon: '👥',
        title: '结伴出行',
        desc: '尽量与家人朋友同行，相互照应，遇到困难及时求助'
      },
      {
        icon: '📱',
        title: '保持通讯',
        desc: '手机充满电，保存导游和景区紧急联系电话'
      },
      {
        icon: '☔',
        title: '雨天不出行',
        desc: '遇大雨或暴雨天气，建议暂停户外游览活动'
      }
    ]
  },

  onLoad: function () {
    this.updateSlipperyLevel()
  },

  updateSlipperyLevel: function () {
    const now = new Date()
    const hour = now.getHours()
    let level = 1
    let text = { title: '路面安全', desc: '今日天气晴好，路面干燥，适合外出游览' }
    
    if (hour < 8) {
      level = 2
      text = { title: '路面注意', desc: '清晨路面可能有露水，请小心慢行，避免积水区域' }
    }
    
    this.setData({
      slipperyLevel: level,
      slipperyText: text
    })
  },

  viewTraffic: function () {
    wx.navigateTo({
      url: '/pages/traffic/traffic'
    })
  }
})
