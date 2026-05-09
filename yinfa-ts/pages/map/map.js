var voice = require('../../utils/voice.js')
var api = require('../../utils/api.js')
var nav = require('../../utils/navigate.js')
var IMG = require('../../utils/image-paths.js')
var app = getApp()

var DEFAULT_CENTER = { lat: 25.2736, lng: 110.2900 }
var MARKER_CACHE_KEY = 'map_markers_cache'
var MARKER_CACHE_TTL = 60 * 60 * 1000
var API_TIMEOUT = 3000

var FALLBACK_PRODUCTS = [
  { id: 1, name: '漓江精华段', latitude: 25.2797, longitude: 110.2847, price: 215, image_url: IMG.SCENIC.b1, level: '5A景区' },
  { id: 2, name: '象鼻山公园', latitude: 25.2622, longitude: 110.2954, price: 55, image_url: IMG.SCENIC.b2, level: '5A景区' },
  { id: 3, name: '阳朔西街', latitude: 24.7805, longitude: 110.4863, price: 0, image_url: IMG.SCENIC.b3, level: '4A景区' },
  { id: 4, name: '龙脊梯田', latitude: 25.7154, longitude: 110.0289, price: 80, image_url: IMG.SCENIC.b1, level: '4A景区' },
  { id: 5, name: '芦笛岩', latitude: 25.2883, longitude: 110.2747, price: 90, image_url: IMG.SCENIC.b2, level: '4A景区' },
  { id: 6, name: '两江四湖', latitude: 25.2833, longitude: 110.3013, price: 220, image_url: IMG.SCENIC.b3, level: '5A景区' }
]

var FALLBACK_MARKERS = FALLBACK_PRODUCTS.map(function(p, i) {
  return {
    id: p.id,
    latitude: p.latitude,
    longitude: p.longitude,
    title: p.name,
    iconPath: IMG.MODULE.mapMarker,
    width: 34,
    height: 34,
    zIndex: 10 - i,
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
  }
})

function buildMarker(p, i) {
  return {
    id: p.id,
    latitude: p.latitude,
    longitude: p.longitude,
    title: p.name,
    iconPath: IMG.MODULE.mapMarker,
    width: 34,
    height: 34,
    zIndex: 10 - i,
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
  }
}

function findById(list, markerId) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].id == markerId) return list[i]
  }
  return null
}

Page({
  data: {
    centerLng: DEFAULT_CENTER.lng,
    centerLat: DEFAULT_CENTER.lat,
    markers: FALLBACK_MARKERS,
    scenicProducts: FALLBACK_PRODUCTS,
    loading: false,
    error: false,
    mapScale: 12,
    hasLocation: false,
    userLat: 0,
    userLng: 0,
    fontSizeMode: 'normal'
  },

  onLoad: function () {
    this.setData({ fontSizeMode: app.globalData.fontSizeMode || 'normal' })
    this._initMap()
  },

  onShow: function () {
    var inited = this._inited
    if (!inited) { this._inited = true; return }
    if (this._needRefresh) {
      this._needRefresh = false
      this.loadLocation()
      this.refreshMarkers()
    }
  },

  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap')
    if (this._locResult) {
      var r = this._locResult
      this._locResult = null
      this.mapCtx.moveToLocation()
    }
  },

  _initMap: function () {
    var self = this

    var cached = wx.getStorageSync(MARKER_CACHE_KEY)
    if (cached && cached.data && cached.data.length > 0 && Date.now() - cached.time < MARKER_CACHE_TTL) {
      self.setData({ markers: cached.data, scenicProducts: cached.products })
    }

    var locPromise = new Promise(function(resolve) {
      wx.getLocation({
        type: 'gcj02',
        success: function(r) { resolve(r) },
        fail: function() { resolve(null) }
      })
    })

    var apiPromise = new Promise(function(resolve) {
      var timeout = setTimeout(function() { resolve(null) }, API_TIMEOUT)
      api.request({ url: '/products?category=scenic', method: 'GET', showLoading: false })
        .then(function(products) {
          clearTimeout(timeout)
          resolve(products || null)
        })
        .catch(function() {
          clearTimeout(timeout)
          resolve(null)
        })
    })

    Promise.all([locPromise, apiPromise]).then(function(results) {
      var loc = results[0]
      var products = results[1]

      var update = {}

      if (loc) {
        update.centerLat = loc.latitude
        update.centerLng = loc.longitude
        update.userLat = loc.latitude
        update.userLng = loc.longitude
        update.hasLocation = true
      } else {
        update.centerLat = DEFAULT_CENTER.lat
        update.centerLng = DEFAULT_CENTER.lng
        update.hasLocation = false
      }

      if (products && products.length > 0) {
        var valid = products.filter(function(p) { return p.latitude && p.longitude })
        if (valid.length > 0) {
          update.markers = valid.map(function(p, i) { return buildMarker(p, i) })
          update.scenicProducts = valid.map(function(p) {
            return Object.assign({}, p, {
              image_url: p.image_url || IMG.SCENIC.b1,
              level: p.tag_name || '景区'
            })
          })
          update.error = false
          try {
            wx.setStorage({ key: MARKER_CACHE_KEY, data: { data: update.markers, products: update.scenicProducts, time: Date.now() } })
          } catch(e) {}
        }
      }

      if (loc && update.scenicProducts) {
        var enriched = computeDistancesSync(loc.latitude, loc.longitude, update.scenicProducts)
        update.scenicProducts = enriched
      }

      self.setData(update)

      wx.nextTick(function() {
        var ctx = self.mapCtx || wx.createMapContext('myMap')
        if (ctx && loc) {
          ctx.moveToLocation()
        } else if (loc) {
          self._locResult = loc
        }
      })
    })
  },

  loadLocation: function () {
    var self = this
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        var update = {
          centerLat: res.latitude,
          centerLng: res.longitude,
          userLat: res.latitude,
          userLng: res.longitude,
          hasLocation: true
        }
        var enriched = computeDistancesSync(res.latitude, res.longitude, self.data.scenicProducts)
        update.scenicProducts = enriched
        self.setData(update)
        wx.nextTick(function() {
          var ctx = self.mapCtx || wx.createMapContext('myMap')
          if (ctx) ctx.moveToLocation()
        })
      },
      fail: function() {
        self.setData({ hasLocation: false })
      }
    })
  },

  refreshMarkers: function () {
    var self = this
    var timeout = setTimeout(function() { return }, API_TIMEOUT)
    api.request({ url: '/products?category=scenic', method: 'GET', showLoading: false })
      .then(function(products) {
        clearTimeout(timeout)
        if (!products || products.length === 0) return
        var valid = products.filter(function(p) { return p.latitude && p.longitude })
        if (valid.length === 0) return
        var markers = valid.map(function(p, i) { return buildMarker(p, i) })
        var enriched = valid.map(function(p) {
          return Object.assign({}, p, {
            image_url: p.image_url || IMG.SCENIC.b1,
            level: p.tag_name || '景区'
          })
        })
        var update = { markers: markers, scenicProducts: enriched, error: false }
        if (self.data.userLat && self.data.userLng) {
          update.scenicProducts = computeDistancesSync(self.data.userLat, self.data.userLng, enriched)
        }
        self.setData(update)
        try {
          wx.setStorage({ key: MARKER_CACHE_KEY, data: { data: markers, products: enriched, time: Date.now() } })
        } catch(e) {}
      })
      .catch(function() { clearTimeout(timeout) })
  },

  onMarkerTap: function (e) {
    var markerId = e.detail.markerId
    var product = findById(this.data.scenicProducts, markerId)
    if (!product) return
    voice.speak(product.name + '，点击查看详情')
    wx.showModal({
      title: product.name,
      content: (product.price > 0 ? '门票 ¥' + product.price : '免费景点') + '\n' + (product.level || '') + '\n点击确定查看详情',
      confirmText: '查看详情',
      cancelText: '关闭',
      confirmColor: '#2E8B57',
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/details/details?id=' + product.id })
        }
      }
    })
  },

  onCalloutTap: function (e) {
    var markerId = e.detail.markerId
    var product = findById(this.data.scenicProducts, markerId)
    if (product) {
      voice.speak('正在打开' + product.name)
      wx.navigateTo({ url: '/pages/details/details?id=' + product.id })
    }
  },

  goScenicDetail: function (e) {
    var id = e.currentTarget.dataset.id
    if (id) {
      voice.speak('正在打开景点详情')
      wx.navigateTo({ url: '/pages/details/details?id=' + id })
    }
  },

  moveToLocation: function () {
    (this.mapCtx || wx.createMapContext('myMap')).moveToLocation()
    voice.speak('正在定位您的位置')
  },

  zoomIn: function () {
    this.setData({ mapScale: Math.min(this.data.mapScale + 2, 18) })
  },

  zoomOut: function () {
    this.setData({ mapScale: Math.max(this.data.mapScale - 2, 5) })
  },

  onRegionChange: function (e) {
    if (e.type === 'end' && !this._shown) this._shown = true
  }
})

function computeDistancesSync(userLat, userLng, products) {
  var result = []
  for (var i = 0; i < products.length; i++) {
    var p = products[i]
    if (p.latitude && p.longitude) {
      var d = getDistance(userLat, userLng, p.latitude, p.longitude)
      result.push(Object.assign({}, p, { distance: formatDistanceStr(d) }))
    } else {
      result.push(p)
    }
  }
  return result
}

function getDistance(lat1, lng1, lat2, lng2) {
  var R = 6371000
  var dLat = (lat2 - lat1) * Math.PI / 180
  var dLng = (lng2 - lng1) * Math.PI / 180
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function formatDistanceStr(m) {
  if (m >= 1000) return (m / 1000).toFixed(1) + 'km'
  return m + 'm'
}