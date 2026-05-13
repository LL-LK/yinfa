const app = getApp()

Component({
  data: {
    selected: 0,
    color: '#999999',
    selectedColor: '#2E8B57',
    fontSizeMode: 'normal',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '/image/tabbar/home.png',
        selectedIconPath: '/image/tabbar/home-active.png'
      },
      {
        pagePath: '/pages/scenic/scenic',
        text: '景点导览',
        iconPath: '/image/tabbar/scenic.png',
        selectedIconPath: '/image/tabbar/scenic-active.png'
      },
      {
        pagePath: '/pages/safety/safety',
        text: '安全防护',
        iconPath: '/image/tabbar/safety.png',
        selectedIconPath: '/image/tabbar/safety-active.png'
      },
      {
        pagePath: '/pages/user/user',
        text: '个人中心',
        iconPath: '/image/tabbar/user.png',
        selectedIconPath: '/image/tabbar/user-active.png'
      }
    ]
  },

  lifetimes: {
    attached() {
      const mode = app.globalData.fontSizeMode || 'normal'
      this.setData({ fontSizeMode: mode })
    }
  },

  pageLifetimes: {
    show() {
      const mode = app.globalData.fontSizeMode || 'normal'
      if (mode !== this.data.fontSizeMode) {
        this.setData({ fontSizeMode: mode })
      }
    }
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const path = e.currentTarget.dataset.path
      if (this.data.selected === index) return

      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})