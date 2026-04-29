const app = getApp()

Page({
  data: {
    product: null,
    quantity: 1
  },

  onLoad: function (options) {
    const id = options.id
    this.loadProduct(id)
  },

  loadProduct: function (id) {
    app.request({
      url: `/products/${id}`,
      method: 'GET'
    }).then(res => {
      this.setData({
        product: res
      })
    }).catch(err => {
      console.error('加载商品详情失败:', err)
    })
  },

  decrease: function () {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      })
    }
  },

  increase: function () {
    this.setData({
      quantity: this.data.quantity + 1
    })
  },

  addToCart: function () {
    if (!this.data.product) return
    
    const cartItems = app.globalData.cartItems || []
    const existingItem = cartItems.find(item => item.id === this.data.product.id)
    
    if (existingItem) {
      existingItem.quantity += this.data.quantity
    } else {
      cartItems.push({
        id: this.data.product.id,
        name: this.data.product.name,
        price: this.data.product.price,
        image: this.data.product.image_url,
        quantity: this.data.quantity
      })
    }
    
    app.globalData.cartItems = cartItems
    
    wx.showToast({
      title: '已添加到购物车',
      icon: 'success'
    })
  },

  buyNow: function () {
    this.addToCart()
    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  }
})