Page({
  data: {
    scenics: [
      {
        id: 1,
        name: '漓江精华段',
        level: '5A景区',
        image: '/image/b1.jpg',
        intro: '桂林山水精华，乘船欣赏象鼻山、叠彩山等经典景观，感受人在画中游的意境。',
        price: 215,
        time: '4小时',
        slippery: true
      },
      {
        id: 2,
        name: '象鼻山公园',
        level: '5A景区',
        image: '/image/b2.jpg',
        intro: '桂林城徽，山形酷似大象饮水，是桂林最具代表性的景点之一，适合老年游客漫步观赏。',
        price: 55,
        time: '2小时',
        slippery: false
      },
      {
        id: 3,
        name: '阳朔西街',
        level: '4A景区',
        image: '/image/b3.jpg',
        intro: '中西文化交融的古街，石板路两侧店铺林立，可品尝地道桂林美食，购买特色纪念品。',
        price: 0,
        time: '3小时',
        slippery: true
      },
      {
        id: 4,
        name: '龙脊梯田',
        level: '4A景区',
        image: '/image/1.jpg',
        intro: '壮观的梯田景观，层层叠叠如天梯直上云端。建议青壮年游客前往，老年人量力而行。',
        price: 180,
        time: '6小时',
        slippery: true
      },
      {
        id: 5,
        name: '两江四湖',
        level: '5A景区',
        image: '/image/2.jpg',
        intro: '桂林市区水系游览，乘船夜游可欣赏灯光璀璨的两江四湖美景，适合全家出行。',
        price: 220,
        time: '2.5小时',
        slippery: false
      },
      {
        id: 6,
        name: '芦笛岩',
        level: '4A景区',
        image: '/image/3.jpg',
        intro: '著名溶洞景观，钟乳石千姿百态，洞内恒温约20°C，是夏季避暑和雨天游览的好去处。',
        price: 90,
        time: '1.5小时',
        slippery: true
      }
    ]
  },

  goDetails: function (e) {
    wx.navigateTo({
      url: '/pages/details/details?id=' + e.currentTarget.dataset.id
    })
  }
})
