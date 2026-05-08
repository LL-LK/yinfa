const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')

Page({
  data: {
    products: [],
    loading: true,
    refreshing: false,
    loadingMore: false,
    selectedCategory: '',
    categories: [],
    sortBy: 'default',
    priceFilter: 'all',
    page: 1,
    pageSize: 10,
    hasMore: false
  },

  onLoad: function (options) {
    if (options.category) {
      this.setData({ selectedCategory: options.category })
    }
    this.loadCategories()
    this.loadProducts()
  },

  loadCategories: function () {
    api.getCategories().then(res => {
      this.setData({ categories: Array.isArray(res) ? res : [] })
    }).catch(() => {})
  },

  selectCategory: function (e) {
    const slug = e.currentTarget.dataset.slug
    const newSlug = slug === this.data.selectedCategory ? '' : slug
    this.setData({ selectedCategory: newSlug, page: 1, products: [] })
    this.loadProducts()
  },

  onSortChange: function (e) {
    this.setData({ sortBy: e.currentTarget.dataset.sort, page: 1, products: [] })
    this.loadProducts()
  },

  onPriceFilter: function (e) {
    this.setData({ priceFilter: e.currentTarget.dataset.filter, page: 1, products: [] })
    this.loadProducts()
  },

  loadProducts: function () {
    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize
    }

    if (this.data.selectedCategory) {
      params.category = this.data.selectedCategory
    }

    if (this.data.sortBy !== 'default') {
      params.sort = this.data.sortBy
    }

    if (this.data.priceFilter === '0-100') {
      params.maxPrice = 100
    } else if (this.data.priceFilter === '100-300') {
      params.minPrice = 100
      params.maxPrice = 300
    } else if (this.data.priceFilter === '300+') {
      params.minPrice = 300
    }

    const isFirstPage = this.data.page === 1
    this.setData({
      loading: isFirstPage,
      loadingMore: !isFirstPage,
      refreshing: false
    })

    api.getProducts(params).then(results => {
      const newProducts = Array.isArray(results) ? results : []
      const allProducts = isFirstPage ? newProducts : [...this.data.products, ...newProducts]

      this.setData({
        products: allProducts,
        loading: false,
        loadingMore: false,
        hasMore: newProducts.length >= this.data.pageSize
      })
    }).catch(() => {
      this.setData({ loading: false, loadingMore: false, refreshing: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  onRefresh: function () {
    this.setData({ refreshing: true, page: 1, products: [] })
    this.loadProducts()
  },

  loadMore: function () {
    if (!this.data.hasMore || this.data.loadingMore) return
    this.setData({ page: this.data.page + 1 })
    this.loadProducts()
  },

  goDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/details/details?id=' + id })
  },

  onReachBottom: function () {
    this.loadMore()
  }
})
