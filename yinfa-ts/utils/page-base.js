var app = getApp()

function getFontMode() {
  var app = getApp()
  return (app && app.globalData && app.globalData.fontSizeMode) || 'normal'
}

var BASE = {
  initStates: function () {
    return {
      loading: true,
      error: false,
      empty: false,
      _loaded: false,
      fontSizeMode: getFontMode()
    }
  },

  refreshFontMode: function () {
    var mode = getFontMode()
    if (this.data.fontSizeMode !== mode) {
      this.setData({ fontSizeMode: mode })
    }
  },

  startLoad: function () {
    this.setData({ loading: true, error: false })
  },

  finishLoad: function (list, extra) {
    var data = {
      loading: false,
      error: false,
      empty: !list || list.length === 0,
      _loaded: true
    }
    if (extra) Object.assign(data, extra)
    this.setData(data)
  },

  onLoadError: function (cb) {
    var fallback = typeof cb === 'function' ? cb.call(this) : null
    if (fallback && Array.isArray(fallback)) {
      this.setData({ loading: false, error: false, empty: fallback.length === 0, _loaded: true })
    } else {
      this.setData({ loading: false, error: true, _loaded: false })
    }
  },

  retry: function (method) {
    if (typeof this[method] === 'function') {
      this[method]()
    }
  },

  needLoad: function () {
    return !this.data._loaded
  },

  setTabBar: function (idx) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: idx })
    }
  },

  goDetails: function (e) {
    var id = e.currentTarget.dataset.id
    if (id) {
      var nav = require('./navigate.js')
      nav.go('/pages/details/details?id=' + id)
    }
  }
}

module.exports = BASE
