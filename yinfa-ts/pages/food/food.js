const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    featured: [
      { name: '桂林米粉', sub: '本地人最爱', badge: 'TOP1' },
      { name: '啤酒鱼', sub: '阳朔名菜', badge: '必吃' },
      { name: '油茶', sub: '瑶族传统', badge: '养生' },
      { name: '马蹄糕', sub: '清甜爽口', badge: '甜品' }
    ],
    foods: [],
    selectedFood: null
  },

  onLoad: function () {
    this.setData({
      foods: buildFoods()
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
      name: '桂林米粉',
      type: '必尝',
      image: '/image/72.png',
      desc: '桂林最具代表性的美食，卤水香浓，米粉爽滑，配有锅烧、牛肉等多种配料，老少皆宜。',
      price: 10,
      score: '4.8',
      address: '市区各大米粉店，推荐崇善米粉、又益轩',
      expanded: false
    },
    {
      name: '啤酒鱼',
      type: '招牌',
      image: '/image/1.jpg',
      desc: '阳朔名菜，用漓江鲜鱼加啤酒烹制，鱼肉鲜嫩，汤汁浓郁，不辣适合老人。',
      price: 68,
      score: '4.7',
      address: '阳朔西街及周边餐馆',
      expanded: false
    },
    {
      name: '桂林油茶',
      type: '传统',
      image: '/image/2.jpg',
      desc: '瑶族传统饮品，用茶叶、姜、蒜等擂制而成，暖胃驱寒，配上炒米脆果别具风味。',
      price: 8,
      score: '4.5',
      address: '龙胜、资源等少数民族聚居区',
      expanded: false
    },
    {
      name: '马蹄糕',
      type: '甜品',
      image: '/image/3.jpg',
      desc: '用桂林特产马蹄制成，晶莹剔透，清甜爽口，软糯不粘牙，适合老人食用。',
      price: 5,
      score: '4.6',
      address: '桂林市区各大菜市场和甜品店',
      expanded: false
    },
    {
      name: '荔浦芋扣肉',
      type: '名菜',
      image: '/image/4.jpg',
      desc: '荔浦芋头软糯香甜，搭配五花肉肥而不腻，是桂林宴席上的传统名菜。',
      price: 48,
      score: '4.6',
      address: '桂林各大饭店和农家乐',
      expanded: false
    },
    {
      name: '阳朔田螺酿',
      type: '特色',
      image: '/image/5.jpg',
      desc: '田螺中填入肉馅，鲜香可口，是阳朔独有的特色小吃，别有风味。',
      price: 35,
      score: '4.4',
      address: '阳朔西街小吃摊和餐馆',
      expanded: false
    }
  ]
}
