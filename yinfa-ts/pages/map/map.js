Page({
  data: {
    latitude: 39.9042,
    longitude: 116.4074,
    markers: [{
      id: 1,
      latitude: 39.9042,
      longitude: 116.4074,
      iconPath: '/src/assets/image/map-marker.png',
      width: 30,
      height: 30,
      title: '北京故宫'
    }, {
      id: 2,
      latitude: 39.9149,
      longitude: 116.4038,
      iconPath: '/src/assets/image/map-marker.png',
      width: 30,
      height: 30,
      title: '天安门广场'
    }, {
      id: 3,
      latitude: 39.9999,
      longitude: 116.4753,
      iconPath: '/src/assets/image/map-marker.png',
      width: 30,
      height: 30,
      title: '颐和园'
    }, {
      id: 4,
      latitude: 39.9242,
      longitude: 116.3975,
      iconPath: '/src/assets/image/map-marker.png',
      width: 30,
      height: 30,
      title: '人民英雄纪念碑'
    }]
  },

  onLoad: function () {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: () => {
        console.log('获取位置失败，使用默认位置')
      }
    })
  },

  onMarkerTap: function (e) {
    const marker = this.data.markers.find(m => m.id === e.detail.markerId)
    if (marker) {
      wx.showToast({
        title: marker.title,
        icon: 'none'
      })
    }
  }
})