const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')

Page({
  data: {
    keyword: '',
    hasSearched: false,
    loading: false,
    results: [],
    hotProducts: [],
    priceFilter: 'all',
    sortBy: 'default',
    page: 1,
    pageSize: 10,
    hasMore: false,
    loadingMore: false,
    searchHistory: [],
    hotTags: ['漓江', '阳朔', '米粉', '龙脊梯田', '西街', '象鼻山', '两江四湖', '芦笛岩'],
    showHistoryClear: false
  },

  onLoad: function () {
    this.loadSearchHistory()
  },

  onShow: function () {
    this.loadSearchHistory()
  },

  loadSearchHistory: function () {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({
      searchHistory: history.slice(0, 5),
      showHistoryClear: history.length > 0
    })
  },

  onKeywordInput: function (e) {
    this.setData({ keyword: e.detail.value })
  },

  doSearch: function () {
    const keyword = this.data.keyword.trim()
    if (!keyword) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }

    this.saveSearchHistory(keyword)
    this.setData({
      hasSearched: true,
      loading: true,
      page: 1,
      results: [],
      priceFilter: 'all',
      sortBy: 'default'
    })

    this.fetchResults()
  },

  searchTag: function (e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({ keyword: tag })
    this.doSearch()
  },

  searchHistoryItem: function (e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword: keyword })
    this.doSearch()
  },

  clearHistory: function () {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({ searchHistory: [], showHistoryClear: false })
        }
      }
    })
  },

  saveSearchHistory: function (keyword) {
    let history = wx.getStorageSync('searchHistory') || []
    history = history.filter(h => h !== keyword)
    history.unshift(keyword)
    history = history.slice(0, 5)
    wx.setStorageSync('searchHistory', history)
    this.setData({ searchHistory: history, showHistoryClear: true })
  },

  fetchResults: function () {
    const keyword = this.data.keyword.trim()
    const params = {
      search: keyword,
      sort: this.data.sortBy !== 'default' ? this.data.sortBy : undefined,
      page: this.data.page,
      pageSize: this.data.pageSize
    }

    this.setData({ loading: this.data.page === 1, loadingMore: this.data.page > 1 })

    api.getProducts(params).then(results => {
      const newResults = Array.isArray(results) ? results : []
      const allResults = this.data.page === 1 ? newResults : [...this.data.results, ...newResults]

      let filtered = this.applyPriceFilter(allResults)

      this.setData({
        results: allResults,
        loading: false,
        loadingMore: false,
        hasMore: newResults.length >= this.data.pageSize
      })

      if (this.data.page === 1 && allResults.length === 0) {
        this.loadHotProducts()
      }
    }).catch(() => {
      this.setData({ loading: false, loadingMore: false })
      if (this.data.page === 1) {
        this.loadHotProducts()
      }
    })
  },

  loadHotProducts: function () {
    api.getProducts({ pageSize: 6, sort: 'price_asc' }).then(results => {
      this.setData({ hotProducts: Array.isArray(results) ? results.slice(0, 6) : [] })
    }).catch(() => {})
  },

  applyPriceFilter: function (list) {
    switch (this.data.priceFilter) {
      case '0-100': return list.filter(p => p.price <= 100)
      case '100-300': return list.filter(p => p.price > 100 && p.price <= 300)
      case '300+': return list.filter(p => p.price > 300)
      default: return list
    }
  },

  onPriceFilter: function (e) {
    this.setData({ priceFilter: e.currentTarget.dataset.filter })
  },

  onSortChange: function (e) {
    this.setData({ sortBy: e.currentTarget.dataset.sort, page: 1, results: [] })
    this.fetchResults()
  },

  loadMore: function () {
    if (!this.data.hasMore || this.data.loadingMore) return
    this.setData({ page: this.data.page + 1 })
    this.fetchResults()
  },

  goDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/details/details?id=' + id })
  },

  onReachBottom: function () {
    this.loadMore()
  }
})
