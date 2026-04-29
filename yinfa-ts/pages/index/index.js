const app = getApp()

Page({
  data: {
    imgUrls: [
      '/image/1.jpg',
      '/image/2.jpg',
      '/image/3.jpg',
      '/image/4.jpg',
      '/image/5.jpg'
    ],
    modules: [
      { name: '商品分类', path: '/pages/category/category', icon: '/image/c1.png' },
      { name: '购物车', path: '/pages/cart/cart', icon: '/image/cart1.png' },
      { name: '订单', path: '/pages/orders/orders', icon: '/image/s5.png' },
      { name: '个人中心', path: '/pages/user/user', icon: '/image/s6.png' },
      { name: '地图', path: '/pages/map/map', icon: '/image/s3.png' },
      { name: '地址管理', path: '/pages/address/address', icon: '/image/s4.png' },
      { name: '搜索', path: '/pages/search/search', icon: '/image/s1.png' },
      { name: '列表', path: '/pages/list/list', icon: '/image/s2.png' }
    ],
    products: [],
    loading: true
  },

  onLoad: function () {
    this.loadProducts()
  },

  loadProducts: function () {
    wx.showLoading({ title: '加载中...' })
    
    app.request({
      url: '/products',
      method: 'GET'
    }).then(res => {
      this.setData({
        products: res.slice(0, 8).map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image_url
        })),
        loading: false
      })
      wx.hideLoading()
    }).catch(err => {
      console.error('加载商品失败:', err)
      this.setData({ loading: false })
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  goSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  goDetails: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/details/details?id=${id}`
    })
  },

  goPage: function (e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({
      url: path
    })
  }
})