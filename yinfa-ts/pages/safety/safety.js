const voice = require('../../utils/voice.js')

Page({
  data: {
    weather: null,
    travelAdvice: { suitable: [], avoid: [] },
    warnings: [],
    slippery: { level: 1, title: '干燥' },
    loadingWeather: true,
    loadingWarnings: false
  },

  onLoad: function () {
    this.loadSafetyData()
  },

  onShow: function () {
    this.updateFontLarge()
    this.loadWeather()
  },

  onTabItemTap: function () {
    this.loadSafetyData()
  },

  updateFontLarge: function () {
    const app = getApp()
    if (app.globalData.fontSizeMode === 'large') {
      this.setData({ _fontLarge: true })
    }
  },

  loadSafetyData: function () {
    this.loadWeather()
    this.buildWarnings()
  },

  loadWeather: function () {
    this.setData({ loadingWeather: true })
    setTimeout(() => {
      const condition = '晴'
      const temp = 25
      let slippery = { level: 1, title: '干燥' }

      if (condition === '雨' || condition === '阵雨' || condition === '雷阵雨') {
        slippery = { level: 3, title: '湿滑危险' }
      } else if (condition === '阴' || condition === '多云' || temp > 30) {
        slippery = { level: 2, title: '微湿' }
      }

      this.setData({
        weather: {
          condition: condition,
          temp: `${temp}°C`,
          humidity: '60%',
          wind: '微风',
          city: '桂林',
          uv: '中等',
          reportTime: new Date().toLocaleString()
        },
        travelAdvice: {
          suitable: ['漓江游船', '象鼻山观光', '西街漫步', '品尝米粉'],
          avoid: ['避免中午高温时段户外活动', '注意防滑路段']
        },
        slippery: slippery,
        loadingWeather: false
      })
    }, 300)
  },

  buildWarnings: function () {
    this.setData({ loadingWarnings: true })
    const that = this
    setTimeout(() => {
      const allWarnings = [
        { name: '景区湿滑台阶', desc: '请使用扶手，一步一阶，不要在台阶上停留拍照。', level: 'high', icon: '⚠️' },
        { name: '雨后石板路', desc: '请绕行或等地面干燥后再走，穿防滑鞋底加深摩擦。', level: 'high', icon: '⚠️' },
        { name: '上下旅游巴士', desc: '请抓牢车门扶手，等车停稳后再上下，不要着急。', level: 'medium', icon: '⚠️' },
        { name: '漓江游船甲板', desc: '甲板湿滑时请不要走到边缘，穿平底鞋上下船。', level: 'medium', icon: '⚡' },
        { name: '酒店卫生间', desc: '请使用防滑拖鞋，地面积水及时擦干，可铺防滑垫。', level: 'low', icon: '✅' },
        { name: '购物街区地砖', desc: '注意地面积水或油渍，走路时请不要看手机哦。', level: 'low', icon: '✅' }
      ]
      
      allWarnings.forEach(item => {
        item.girlImage = that.getGirlImage(item.level)
      })
      
      this.setData({
        warnings: allWarnings,
        loadingWarnings: false
      })
    }, 200)
  },

  readWarning: function (e) {
    const item = this.data.warnings[e.currentTarget.dataset.index]
    if (item) {
      voice.speak(`${item.name}：${item.desc}`)
    }
  },

  callEmergency: function () {
    wx.showModal({
      title: '🆘 紧急呼救',
      content: '即将拨打紧急救援电话：120\n\n是否继续？',
      confirmText: '立即拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '120',
            success: function () {
              console.log('拨打成功')
            },
            fail: function (err) {
              console.error('拨打失败:', err)
              wx.showToast({
                title: '拨号失败，请手动拨打120',
                icon: 'none',
                duration: 3000
              })
            }
          })
        }
      }
    })
  },

  shareLocation: function () {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude

        wx.showModal({
          title: '📍 分享位置',
          content: `当前位置坐标：\n纬度：${latitude.toFixed(6)}\n经度：${longitude.toFixed(6)}\n\n是否复制位置信息？`,
          confirmText: '复制并发送',
          cancelText: '取消',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.setClipboardData({
                data: `我的位置：https://maps.google.com/?q=${latitude},${longitude}`,
                success: function () {
                  wx.showToast({
                    title: '位置已复制到剪贴板',
                    icon: 'success',
                    duration: 2000
                  })
                }
              })
            }
          }
        })
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        wx.showToast({
          title: '获取位置失败，请检查定位权限',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },

  goBack: function () {
    wx.navigateBack()
  },

  getGirlImage: function (level) {
    if (level === 'high') {
      return '/image/IMG_3693.webp'
    } else if (level === 'medium') {
      return '/image/IMG_3706.webp'
    } else {
      return '/image/IMG_3709.webp'
    }
  }
})