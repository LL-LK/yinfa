const app = getApp()
const api = require('../../utils/api.js')
const nav = require('../../utils/navigate.js')
const voice = require('../../utils/voice.js')

Page({
  data: {
    categories: [],
    products: [],
    activeCategory: 0,
    loadingCategories: true,
    loadingProducts: true,
    productError: false,
    fontSizeMode: 'normal'
  },

  onLoad: function () {
    this.setData({ fontSizeMode: app.globalData.fontSizeMode || 'normal' })
    this.loadCategories()
  },

  onShow: function () {
    api.getCategories().then(cats => {
      this.setData({ categories: cats, loadingCategories: false })
      if (cats.length > 0 && this.data.products.length === 0) {
        this.loadProducts(cats[0])
      }
    }).catch(() => {
      this.setData({ loadingCategories: false })
    })
  },

  loadCategories: function () {
    this.setData({ loadingCategories: true })
    api.getCategories().then(cats => {
      this.setData({ categories: cats, loadingCategories: false })
      if (cats.length > 0) {
        this.loadProducts(cats[0])
      }
    }).catch(() => {
      this.setData({
        loadingCategories: false,
        categories: [
          { id: 1, name: '热门推荐', slug: 'hot' },
          { id: 2, name: '门票预订', slug: 'tickets' },
          { id: 3, name: '跟团游', slug: 'tours' },
          { id: 4, name: '交通接送', slug: 'transport' },
          { id: 5, name: '特色美食', slug: 'food' }
        ]
      })
      if (this.data.products.length === 0) {
        this.loadProducts(null)
      }
    })
  },

  loadProducts: function (category) {
    this.setData({ loadingProducts: true, productError: false })
    const slug = category && category.slug ? category.slug : null
    const params = slug ? { category: slug } : {}

    api.getProducts(params).then(res => {
      const list = Array.isArray(res) ? res : []
      this.setData({
        products: list.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image_url || '/image/icon3.webp'
        })),
        loadingProducts: false
      })
    }).catch(() => {
      this.setData({ loadingProducts: false, productError: true })
    })
  },

  switchCategory: function (e) {
    const idx = parseInt(e.currentTarget.dataset.index, 10)
    const category = this.data.categories[idx]
    if (idx !== this.data.activeCategory) {
      this.setData({ activeCategory: idx, products: [] })
      this.loadProducts(category)
      if (category && category.name) {
        voice.speak('正在查看' + category.name)
      }
    }
  },

  goDetails: function (e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      nav.go('/pages/details/details?id=' + id)
    }
  }
})