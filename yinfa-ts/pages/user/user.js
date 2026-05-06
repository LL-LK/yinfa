Page({
  goOrders: function () {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },
  goAddress: function () {
    wx.navigateTo({ url: '/pages/address/address' })
  },
  goScenic: function () {
    wx.switchTab({ url: '/pages/scenic/scenic' })
  },
  goSafety: function () {
    wx.switchTab({ url: '/pages/safety/safety' })
  },
  callHelp: function () {
    wx.showModal({
      title: '一键求助',
      content: '即将拨打桂林旅游服务热线\n0773-XXXXXXX',
      confirmText: '立即拨打',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '07731234567' })
        }
      }
    })
  }
})
