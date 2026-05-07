const app = getApp()

Page({
  data: {
    products: [],
    category: '',
    name: ''
  },

  onLoad: function (options) {
    this.setData({
      category: options.category || '',
      name: options.name || '全部商品'
    })
    this.loadProducts()
  },

  loadProducts: function () {
    const params = this.data.category ? { category: this.data.category } : {}
    app.request({
      url: '/products',
      method: 'GET',
      data: params
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
      console.error('加载商品失败:', err)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none',
        duration: 2000
      })
    })
  },

  goDetails: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/details/details?id=${id}`
    })
  }
})