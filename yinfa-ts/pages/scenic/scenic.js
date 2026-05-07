const app = getApp()

Page({
  data: {
    scenics: [
      {
        id: 1,
        name: '漓江精华段',
        level: '5A景区',
        image: '/image/b1.jpg',
        intro: '桂林山水精华，乘船欣赏黄布倒影、九马画山等经典景观，感受人在画中游。',
        price: 215,
        time: '4小时',
        slippery: true,
        expanded: false,
        highlight: '乘竹筏漂流漓江，两岸青山相对出，碧水蓝天相映成趣，是桂林旅游的必去之地。',
        safetyTips: '漓江沿岸步道青苔较多，上下船时请慢行注意脚下，雨天甲板湿滑请不要奔跑。',
        transport: '桂林市区乘5路、16路公交至漓江码头；也可乘出租车约15元，车程10分钟。',
        hours: '8:00 - 17:30（建议上午9:00前往，避开中午日晒）'
      },
      {
        id: 2,
        name: '象鼻山公园',
        level: '5A景区',
        image: '/image/b2.jpg',
        intro: '桂林城徽，山形酷似大象饮水，是桂林最具代表性的景点之一，适合老年游客漫步。',
        price: 55,
        time: '2小时',
        slippery: false,
        expanded: false,
        highlight: '象鼻山是桂林的城市名片，从江对岸观赏效果最佳，晚上灯光秀也很壮观。',
        safetyTips: '',
        transport: '2路、16路、23路公交到象山公园站；步行从市中心约15分钟可达。',
        hours: '6:30 - 18:00'
      },
      {
        id: 3,
        name: '阳朔西街',
        level: '4A景区',
        image: '/image/b3.jpg',
        intro: '中西文化交融的古街，石板路两侧店铺林立，可品尝桂林美食和购买特色纪念品。',
        price: 0,
        time: '3小时',
        slippery: true,
        expanded: false,
        highlight: '阳朔西街有1400多年历史，街道不长但店铺林立，夜晚灯火通明，非常热闹。',
        safetyTips: '西街石板路凹凸不平，雨天注意积水湿滑，人流密集时请保管好随身物品。',
        transport: '桂林汽车站乘直达阳朔大巴约1.5小时；也可乘漓江游船到达阳朔码头。',
        hours: '全天开放'
      },
      {
        id: 4,
        name: '龙脊梯田',
        level: '4A景区',
        image: '/image/1.jpg',
        intro: '壮观梯田景观，层层叠叠如天梯直上云端，云雾缭绕时宛如仙境。',
        price: 180,
        time: '6小时',
        slippery: true,
        expanded: false,
        highlight: '龙脊梯田被誉为\"世界梯田之冠\"，四季皆美：春水如镜，夏绿如茵，秋金如浪，冬雪如画。',
        safetyTips: '雨后山路极其湿滑，老年人不建议前往梯田深处，可在观景台远眺即可。',
        transport: '桂林乘车至龙胜约2.5小时；建议跟团前往，有导游陪同更安全。',
        hours: '7:00 - 18:00'
      },
      {
        id: 5,
        name: '两江四湖',
        level: '5A景区',
        image: '/image/2.jpg',
        intro: '桂林市区水系游览，乘船夜游欣赏灯光璀璨的美景，适合全家一起出行。',
        price: 220,
        time: '2.5小时',
        slippery: false,
        expanded: false,
        highlight: '夜游两江四湖是桂林特色，漓江、桃花江与四湖相连，灯光把山水装点得如梦如幻。',
        safetyTips: '',
        transport: '市中心步行可达多个码头，文昌桥码头、日月湾码头均可登船。',
        hours: '夜游19:30 - 21:30；日游9:00 - 17:00'
      },
      {
        id: 6,
        name: '芦笛岩',
        level: '4A景区',
        image: '/image/3.jpg',
        intro: '著名溶洞景观，钟乳石千姿百态，洞内恒温约20°C，雨天游览的好去处。',
        price: 90,
        time: '1.5小时',
        slippery: true,
        expanded: false,
        highlight: '芦笛岩被誉为\"大自然的艺术之宫\"，洞内钟乳石形态万千，灯光照射下如梦如幻。',
        safetyTips: '洞口水汽重地面常年湿润，洞内台阶较多，请使用扶手慢行。',
        transport: '3路公交至芦笛岩站；出租车约20分钟车程。',
        hours: '8:00 - 17:30'
      }
    ]
  },

  onLoad: function (options) {
    if (options && options.mode === 'favorite') {
      this.loadFavorites()
    }
  },

  loadFavorites: function () {
    const favorites = app.globalData.favorites
    if (favorites.length === 0) {
      wx.showToast({ title: '暂无收藏', icon: 'none' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } else {
      const ids = favorites.map(f => f.id)
      this.setData({
        scenics: this.data.scenics.filter(s => ids.includes(s.id))
      })
    }
  },

  toggleExpand: function (e) {
    const idx = e.currentTarget.dataset.idx
    const key = 'scenics[' + idx + '].expanded'
    const current = this.data.scenics[idx].expanded
    this.setData({ [key]: !current })
  },

  toggleFavorite: function (e) {
    const idx = e.currentTarget.dataset.idx
    const scenic = this.data.scenics[idx]
    
    if (app.isFavorite(scenic.id)) {
      app.removeFavorite(scenic.id)
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      app.addFavorite(scenic)
      wx.showToast({ title: '收藏成功', icon: 'success' })
    }
  },

  isFavorite: function (id) {
    return app.isFavorite(id)
  },

  book: function (e) {
    const idx = e.currentTarget.dataset.idx
    const scenic = this.data.scenics[idx]
    wx.showModal({
      title: '预订确认',
      content: `确认预订「${scenic.name}」？\n价格：¥${scenic.price}起`,
      confirmText: '确认预订',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '预订成功', icon: 'success' })
        }
      }
    })
  }
})
