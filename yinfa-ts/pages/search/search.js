const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    keyword: '',
    products: [],
    hotTags: ['漓江', '阳朔', '米粉', '龙脊梯田', '西街', '象鼻山'],
    hasSearched: false
  },

  onLoad: function () {},

  inputChange: function (e) {
    this.setData({ keyword: e.detail.value })
  },

  search: function () {
    if (!this.data.keyword.trim()) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' })
      voice.speak('请先输入搜索关键词')
      return
    }
    voice.speak('正在搜索' + this.data.keyword)

    api.request({ url: '/products', method: 'GET', data: { search: this.data.keyword } }).then(res => {
      const list = (res || []).map(item => ({
        id: item.id, name: item.name || '未知', price: item.price || 0,
        image: item.image_url || '/image/default.jpg',
        description: item.description || ''
      }))
      this.setData({ products: list, hasSearched: true })
      voice.speak('找到' + list.length + '个相关商品')
    }).catch(() => {
      voice.speak('搜索失败，请重试')
    })
  },

  searchTag: function (e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({ keyword: tag })
    this.search()
  },

  goDetails: function (e) {
    const id = e.currentTarget.dataset.id
    nav.go('/pages/details/details?id=' + id)
  }
})
