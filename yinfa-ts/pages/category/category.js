const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    categories: []
  },

  onLoad: function () {
    this.loadCategories()
  },

  loadCategories: function () {
    api.getCategories().then(res => {
      this.setData({ categories: res })
    }).catch(err => {
      console.error('加载分类失败:', err)
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    })
  },

  goList: function (e) {
    const slug = e.currentTarget.dataset.slug
    const name = e.currentTarget.dataset.name
    voice.speak('正在查看' + name + '分类')
    nav.go('/pages/list/list?category=' + slug + '&name=' + name)
  }
})
