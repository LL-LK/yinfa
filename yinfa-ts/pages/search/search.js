const app = getApp()

Page({
  data: {
    keyword: '',
    products: []
  },

  onLoad: function () {
  },

  inputChange: function (e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  search: function () {
    if (!this.data.keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }

    app.request({
      url: '/products',
      method: 'GET',
      data: { search: this.data.keyword }
    }).then(res => {
      this.setData({
        products: res.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image_url,
          description: item.description
        }))
      })
    }).catch(err => {
      console.error('搜索失败:', err)
    })
  },

  goDetails: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/details/details?id=${id}`
    })
  }
})