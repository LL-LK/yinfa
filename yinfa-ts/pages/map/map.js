const voice = require('../../utils/voice.js')
const api = require('../../utils/api.js')
const nav = require('../../utils/navigate.js')

const DEFAULT_CENTER = { lat: 25.2736, lng: 110.2900 }
const MARKER_CACHE_KEY = 'map_markers_cache'
const MARKER_CACHE_TTL = 60 * 60 * 1000

const SCENIC_ICONS = {
  'default': '/image/map-marker.png',
  '5A': '/image/map-marker.png',
  '4A': '/image/map-marker.png',
  '3A': '/image/map-marker.png'
}

Page({
  data: {
    centerLng: DEFAULT_CENTER.lng,
    centerLat: DEFAULT_CENTER.lat,
    markers: [],
    scenicProducts: [],
    loading: true,
    error: false,
    mapScale: 12,
    showControls: false,
    hasLocation: false
  },

  onLoad: function () {
    this.setData({ loading: true })
    this.loadLocation()
    this.loadScenicMarkers()
  },

  onShow: function () {
    if (this.data.markers.length === 0 && !this.data.loading) {
      this.loadScenicMarkers()
    }
  },

  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap')
  },

  loadLocation: function () {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          centerLat: res.latitude,
          centerLng: res.longitude,
          hasLocation: true
        })
        setTimeout(() => {
          const ctx = this.mapCtx || wx.createMapContext('myMap')
          ctx.moveToLocation()
        }, 500)
      },
      fail: () => {
        voice.speak('未获取到当前位置，显示桂林市中心地图')
        this.setData({
          centerLat: DEFAULT_CENTER.lat,
          centerLng: DEFAULT_CENTER.lng,
          hasLocation: false
        })
      }
    })
  },

  loadScenicMarkers: function () {
    const cached = wx.getStorageSync(MARKER_CACHE_KEY)
    if (cached && cached.data && cached.data.length > 0 && Date.now() - cached.time < MARKER_CACHE_TTL) {
      this.setData({ markers: cached.data, scenicProducts: cached.products || [], loading: false })
    }

    api.request({
      url: '/products?category=scenic',
      method: 'GET'
    }).then((products) => {
      if (products && products.length > 0) {
        const valid = products.filter(p => p.latitude && p.longitude)
        const markers = valid.map((p, i) => ({
          id: p.id,
          latitude: p.latitude,
          longitude: p.longitude,
          title: p.name,
          iconPath: SCENIC_ICONS[p.tag_name] || SCENIC_ICONS['default'],
          width: 34,
          height: 34,
          zIndex: 10 - i,
          callout: {
            content: p.name,
            color: '#2E8B57',
            fontSize: 15,
            borderRadius: 10,
            padding: 10,
            display: 'BYCLICK',
            textAlign: 'center'
          },
          anchor: { x: 0.5, y: 1 }
        }))
        this.setData({
          markers,
          scenicProducts: valid,
          loading: false,
          error: false
        })
        wx.setStorageSync(MARKER_CACHE_KEY, { data: markers, products: valid, time: Date.now() })
      } else {
        this.setFallbackMarkers()
      }
    }).catch(() => {
      if (this.data.markers.length === 0) {
        this.setFallbackMarkers()
      }
    })
  },

  setFallbackMarkers: function () {
    const fallbackProducts = [
      { id: 1, name: '漓江精华段', latitude: 25.2797, longitude: 110.2847, price: 215, image_url: '/image/b1.jpg' },
      { id: 2, name: '象鼻山公园', latitude: 25.2622, longitude: 110.2954, price: 55, image_url: '/image/b2.jpg' },
      { id: 3, name: '阳朔西街', latitude: 24.7805, longitude: 110.4863, price: 0, image_url: '/image/b3.jpg' },
      { id: 4, name: '龙脊梯田', latitude: 25.7154, longitude: 110.0289, price: 80, image_url: '/image/b1.jpg' },
      { id: 5, name: '芦笛岩', latitude: 25.2883, longitude: 110.2747, price: 90, image_url: '/image/b2.jpg' },
      { id: 6, name: '两江四湖', latitude: 25.2833, longitude: 110.3013, price: 220, image_url: '/image/b3.jpg' }
    ]
    const markers = fallbackProducts.map(p => ({
      id: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
      title: p.name,
      iconPath: '/image/map-marker.png',
      width: 34,
      height: 34,
      zIndex: 10,
      anchor: { x: 0.5, y: 1 },
      callout: {
        content: p.name,
        color: '#2E8B57',
        fontSize: 15,
        borderRadius: 10,
        padding: 10,
        display: 'BYCLICK',
        textAlign: 'center'
      }
    }))
    this.setData({ markers, scenicProducts: fallbackProducts, loading: false, error: false })
  },

  onMarkerTap: function (e) {
    const markerId = e.detail.markerId
    const product = this.data.scenicProducts.find(p => p.id === markerId)
    if (product) {
      voice.speak(product.name + '。桂林著名景点')
      wx.showModal({
        title: product.name,
        content: product.price > 0 ? '门票 ¥' + product.price + '\n点击确定查看详情' : '免费景点\n点击确定查看详情',
        confirmText: '查看详情',
        cancelText: '关闭',
        confirmColor: '#2E8B57',
        success: (res) => {
          if (res.confirm) {
            nav.go('/pages/details/details?id=' + product.id)
          }
        }
      })
    }
  },

  onCalloutTap: function (e) {
    const markerId = e.detail.markerId
    const product = this.data.scenicProducts.find(p => p.id === markerId)
    if (product) {
      nav.go('/pages/details/details?id=' + product.id)
    }
  },

  moveToLocation: function () {
    const ctx = this.mapCtx || wx.createMapContext('myMap')
    ctx.moveToLocation()
    voice.speak('正在定位您的位置')
  },

  zoomIn: function () {
    const scale = Math.min(this.data.mapScale + 2, 18)
    this.setData({ mapScale: scale })
  },

  zoomOut: function () {
    const scale = Math.max(this.data.mapScale - 2, 5)
    this.setData({ mapScale: scale })
  },

  onRegionChange: function (e) {
    if (e.type === 'end') {
      this.setData({ showControls: true })
    }
  }
})
