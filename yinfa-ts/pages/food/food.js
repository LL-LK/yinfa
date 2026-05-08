const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')
const api = require('../../utils/api.js')

Page({
  data: {
    featured: [
      { name: '桂林米粉', sub: '本地人最爱', badge: 'TOP1' },
      { name: '啤酒鱼', sub: '阳朔名菜', badge: '必吃' },
      { name: '油茶', sub: '瑶族传统', badge: '养生' },
      { name: '马蹄糕', sub: '清甜爽口', badge: '甜品' }
    ],
    foods: [],
    selectedFood: null,
    loading: true,
    empty: false,
    error: false,
    _loaded: false
  },

  onLoad: function () {
    if (!this.data._loaded) {
      this.loadFoods()
    }
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ current: 2 });
    }
    if (!this.data._loaded) {
      this.loadFoods()
    }
  },

  loadFoods: function () {
    this.setData({ loading: true, error: false })

    api.request({
      url: '/products?category=food',
      method: 'GET'
    }).then((products) => {
      if (products && products.length > 0) {
        const foods = products.map(p => ({
          id: p.id,
          name: p.name,
          type: p.tag_name || '推荐',
          image: p.image_url || '/image/72.webp',
          desc: p.description || '桂林地道美食，值得品尝',
          price: p.price || 10,
          score: p.elder_score || '4.5',
          address: p.transport || '桂林市区',
          expanded: false
        }))
        this.setData({ foods, loading: false, empty: foods.length === 0, _loaded: true })
      } else {
        this.useFallback()
      }
    }).catch(() => {
      this.useFallback()
    })
  },

  useFallback: function () {
    this.setData({
      foods: buildFoods(),
      loading: false,
      empty: false,
      error: this.data.foods.length === 0,
      _loaded: true
    })
  },

  selectFood: function (e) {
    const index = e.currentTarget.dataset.index
    const foods = this.data.foods
    foods.forEach(f => f.expanded = false)
    const food = foods[index]
    food.expanded = !food.expanded
    const selected = food.expanded ? food : null
    this.setData({ foods, selectedFood: selected })

    if (selected) {
      voice.speak(selected.name + '：' + selected.desc + '。推荐指数' + selected.score + '分。人均' + selected.price + '元。' + selected.address)
    }
  }
})

function buildFoods() {
  return [
    {
      id: 1,
      name: '桂林米粉',
      type: '必尝',
      image: '/image/72.webp',
      desc: '桂林最具代表性的美食，卤水香浓，米粉爽滑，配有锅烧、牛肉等多种配料，老少皆宜。',
      price: 10,
      score: '4.8',
      address: '市区各大米粉店，推荐崇善米粉、又益轩',
      expanded: false
    },
    {
      id: 2,
      name: '啤酒鱼',
      type: '招牌',
      image: '/image/11.webp',
      desc: '阳朔名菜，用漓江鲜鱼加啤酒烹制，鱼肉鲜嫩，汤汁浓郁，不辣适合老人。',
      price: 68,
      score: '4.7',
      address: '阳朔西街及周边餐馆',
      expanded: false
    },
    {
      id: 3,
      name: '桂林油茶',
      type: '传统',
      image: '/image/12.webp',
      desc: '瑶族传统饮品，用茶叶、姜、蒜等擂制而成，暖胃驱寒，配上炒米脆果别具风味。',
      price: 8,
      score: '4.5',
      address: '龙胜、资源等少数民族聚居区',
      expanded: false
    },
    {
      id: 4,
      name: '马蹄糕',
      type: '甜品',
      image: '/image/21.webp',
      desc: '用桂林特产马蹄制成，晶莹剔透，清甜爽口，软糯不粘牙，适合老人食用。',
      price: 5,
      score: '4.6',
      address: '桂林市区各大菜市场和甜品店',
      expanded: false
    },
    {
      id: 5,
      name: '荔浦芋扣肉',
      type: '名菜',
      image: '/image/22.webp',
      desc: '荔浦芋头软糯香甜，搭配五花肉肥而不腻，是桂林宴席上的传统名菜。',
      price: 48,
      score: '4.6',
      address: '桂林各大饭店和农家乐',
      expanded: false
    },
    {
      id: 6,
      name: '阳朔田螺酿',
      type: '特色',
      image: '/image/31.webp',
      desc: '田螺中填入肉馅，鲜香可口，是阳朔独有的特色小吃，别有风味。',
      price: 35,
      score: '4.4',
      address: '阳朔西街小吃摊和餐馆',
      expanded: false
    }
  ]
}
