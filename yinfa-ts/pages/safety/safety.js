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
      desc: '今日天气晴好，路面干燥，湿度适中，适合外出游览。建议穿防滑运动鞋，携带拐杖更安心。'
    },
    warnings: [
      { name: '漓江步道', desc: '江边石阶有青苔，请小心行走', level: 'medium' },
      { name: '象鼻山台阶', desc: '部分台阶较陡，雨后更需注意', level: 'medium' },
      { name: '西街石板路', desc: '石板凹凸，雨天注意积水', level: 'low' },
      { name: '龙脊梯田路', desc: '雨后极度湿滑，老人不建议', level: 'high' },
      { name: '芦笛岩洞口', desc: '水汽重，地面常年湿润', level: 'medium' },
      { name: '四湖码头', desc: '上下船区域湿滑', level: 'medium' }
    ],
    tips: [
      { icon: '👟', title: '穿防滑鞋', desc: '请穿防滑合脚运动鞋，避免拖鞋或硬底鞋' },
      { icon: '🦯', title: '使用拐杖', desc: '建议携带拐杖或登山杖增加行走稳定性' },
      { icon: '🐢', title: '慢行不急', desc: '放慢脚步游览，给自己充足的游玩时间' },
      { icon: '👥', title: '结伴出行', desc: '与家人朋友同行，相互照应更安全' },
      { icon: '📱', title: '保持通讯', desc: '手机充满电，保存景区紧急联系电话' },
      { icon: '☔', title: '雨不出行', desc: '遇大雨或暴雨，暂停户外游览活动' }
    ],
    accidents: [
      { scene: '景区湿滑台阶', risk: '高', prevent: '使用扶手，一步一阶，不要在台阶上停留拍照' },
      { scene: '雨后石板路', risk: '高', prevent: '绕行或等地面干燥后再走，穿防滑鞋底加深摩擦' },
      { scene: '上下旅游巴士', risk: '中', prevent: '抓牢车门扶手，等车停稳后再上下，不要着急' },
      { scene: '漓江游船甲板', risk: '中', prevent: '甲板湿滑时不要走到边缘，穿平底鞋上下船' },
      { scene: '购物街区地砖', risk: '低', prevent: '注意地面积水或油渍，走路时不要看手机' },
      { scene: '酒店卫生间', risk: '中', prevent: '使用防滑拖鞋，地面积水及时擦干，可铺防滑垫' }
    ]
  },

  onLoad: function () {
    const hour = new Date().getHours()
    if (hour < 8) {
      this.setData({
        slipperyLevel: 2,
        slipperyText: {
          title: '路面注意',
          desc: '清晨路面可能有露水，部分景区步道湿滑。请小心慢行，避开积水区域。'
        }
      })
    }
  }
})
