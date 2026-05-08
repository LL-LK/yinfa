const voice = require('./voice.js')

let pendingTimer = null

function go(url, label) {
  clearPending()
  if (label) {
    voice.speak('正在进入' + label)
    pendingTimer = setTimeout(() => {
      pendingTimer = null
      wx.navigateTo({
        url: url,
        fail: () => {}
      })
    }, 600)
  } else {
    wx.navigateTo({ url: url })
  }
}

function switchTab(url, label) {
  clearPending()
  if (label) {
    voice.speak('正在切换到' + label)
    pendingTimer = setTimeout(() => {
      pendingTimer = null
      wx.switchTab({
        url: url,
        fail: () => {}
      })
    }, 600)
  } else {
    wx.switchTab({ url: url })
  }
}

function goBack(label) {
  clearPending()
  if (label) {
    voice.speak('正在返回' + label)
  }
  wx.navigateBack()
}

function clearPending() {
  if (pendingTimer) {
    clearTimeout(pendingTimer)
    pendingTimer = null
  }
}

module.exports = {
  go,
  switchTab,
  goBack,
  clearPending
}