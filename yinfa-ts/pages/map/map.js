Page({
  data: {
    latitude: 25.2736,
    longitude: 110.2900,
    markers: [{
      id: 1,
      latitude: 25.2797,
      longitude: 110.2847,
      iconPath: '/image/map-marker.png',
      width: 30,
      height: 30,
      title: '漓江'
    }, {
      id: 2,
      latitude: 24.7805,
      longitude: 110.4863,
      iconPath: '/image/map-marker.png',
      width: 30,
      height: 30,
      title: '阳朔西街'
    }, {
      id: 3,
      latitude: 25.7154,
      longitude: 110.0289,
      iconPath: '/image/map-marker.png',
      width: 30,
      height: 30,
      title: '龙脊梯田'
    }, {
      id: 4,
      latitude: 25.2622,
      longitude: 110.2954,
      iconPath: '/image/map-marker.png',
      width: 30,
      height: 30,
      title: '象鼻山'
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