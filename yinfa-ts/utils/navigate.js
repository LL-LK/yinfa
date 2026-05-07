const voice = require('./voice.js')

function go(url, label) {
  if (label) {
    voice.speak('正在进入' + label)
    setTimeout(() => {
      wx.navigateTo({ url: url })
    }, 600)
  } else {
    wx.navigateTo({ url: url })
  }
}

function switchTab(url, label) {
  if (label) {
    voice.speak('正在切换到' + label)
    setTimeout(() => {
      wx.switchTab({ url: url })
    }, 600)
  } else {
    wx.switchTab({ url: url })
  }
}

function goBack(label) {
  if (label) {
    voice.speak('正在返回' + label)
  }
  wx.navigateBack()
}

module.exports = {
  go,
  switchTab,
  goBack
}
