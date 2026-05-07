const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    products: [],
    category: '',
    name: ''
  },

  onLoad: function (options) {
    const cat = options.category || ''
    const catName = options.name || '全部商品'
    this.setData({ category: cat, name: catName })
    this.loadProducts()
  },

  loadProducts: function () {
    const params = this.data.category ? { category: this.data.category } : {}
    api.getProducts(params).then(products => {
      const list = (products || []).map(p => ({
        id: p.id, name: p.name || '未知', price: p.price || 0,
        image: p.image_url || '/image/default.jpg',
        description: p.description || ''
      }))
      this.setData({ products: list })
    }).catch(err => {
      console.error('加载商品失败:', err)
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    })
  },

  goDetails: function (e) {
    const id = e.currentTarget.dataset.id
    voice.speak('正在查看商品详情')
    nav.go('/pages/details/details?id=' + id)
  }
})
