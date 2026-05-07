const app = getApp()

Page({
  data: {
    categories: []
  },

  onLoad: function () {
    this.loadCategories()
  },

  loadCategories: function () {
    app.request({
      url: '/categories',
      method: 'GET'
    }).then(res => {
      this.setData({
        categories: res
      })
    }).catch(err => {
      console.error('加载分类失败:', err)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none',
        duration: 2000
      })
    })
  },

  goList: function (e) {
    const slug = e.currentTarget.dataset.slug
    const name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: `/pages/list/list?category=${slug}&name=${name}`
    })
  }
})