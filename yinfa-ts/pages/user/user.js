const app = getApp()

Page({
  data: {
    favoriteCount: 0,
    orderCount: 2,
    fontSizeMode: 'normal'
  },

  onLoad: function () {
    this.loadData()
  },

  loadData: function () {
    this.setData({
      favoriteCount: app.globalData.favorites.length,
      fontSizeMode: app.globalData.fontSizeMode
    })
  },

  goOrders: function () {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  goAddress: function () {
    wx.navigateTo({ url: '/pages/address/address' })
  },

  goFavorites: function () {
    wx.navigateTo({ url: '/pages/scenic/scenic?mode=favorite' })
  },

  goHealth: function () {
    wx.showModal({
      title: '健康记录',
      content: '身高：____ cm\n体重：____ kg\n血压：____ / ____ mmHg\n\n请在个人健康档案中记录您的身体状况，便于紧急情况下快速提供信息。',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  goEmergency: function () {
    const contacts = app.globalData.emergencyContacts
    let content = '请添加紧急联系人，以便在紧急情况下联系您的家人。\n\n'
    if (contacts.length > 0) {
      contacts.forEach((c, i) => {
        content += `${i + 1}. ${c.name} - ${c.phone}\n`
      })
    }
    wx.showModal({
      title: '紧急联系人',
      content: content,
      confirmText: '添加联系人',
      cancelText: '知道了',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '添加紧急联系人',
            editable: true,
            placeholderText: '请输入联系人姓名和电话，格式：姓名,电话',
            success: (res) => {
              if (res.confirm && res.content) {
                const parts = res.content.split(',')
                if (parts.length === 2) {
                  const contact = { name: parts[0].trim(), phone: parts[1].trim() }
                  app.globalData.emergencyContacts.push(contact)
                  app.saveEmergencyContacts()
                  wx.showToast({ title: '添加成功', icon: 'success' })
                } else {
                  wx.showToast({ title: '格式错误', icon: 'none' })
                }
              }
            }
          })
        }
      }
    })
  },

  goSafety: function () {
    wx.switchTab({ url: '/pages/safety/safety' })
  },

  setFontSize: function (mode) {
    app.setFontSizeMode(mode)
    this.setData({ fontSizeMode: mode })
    wx.showToast({
      title: mode === 'small' ? '已切换标准字体' : mode === 'normal' ? '已切换较大字体' : '已切换超大字体',
      icon: 'none'
    })
  },

  sendSOS: function () {
    app.sendSOS()
  }
})
