const app = getApp()

Page({
  data: {
    imgUrls: [
      '/src/assets/image/1.jpg',
      '/src/assets/image/2.jpg',
      '/src/assets/image/3.jpg',
      '/src/assets/image/4.jpg',
      '/src/assets/image/5.jpg'
    ],
    modules: [
      { name: '商品分类', path: '/pages/category/category', icon: '/src/assets/image/c1.png' },
      { name: '购物车', path: '/pages/cart/cart', icon: '/src/assets/image/cart1.png' },
      { name: '订单', path: '/pages/orders/orders', icon: '/src/assets/image/s1.png' },
      { name: '个人中心', path: '/pages/user/user', icon: '/src/assets/image/s2.png' },
      { name: '地图', path: '/pages/map/map', icon: '/src/assets/image/s3.png' },
      { name: '地址管理', path: '/pages/address/address', icon: '/src/assets/image/s4.png' },
      { name: '搜索', path: '/pages/search/search', icon: '/src/assets/image/s5.png' },
      { name: '列表', path: '/pages/list/list', icon: '/src/assets/image/s6.png' }
    ],
    products: []
  },

  onLoad: function () {
    this.loadProducts()
  },

  loadProducts: function () {
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
        }))
      })
    }).catch(err => {
      console.error('加载商品失败:', err)
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