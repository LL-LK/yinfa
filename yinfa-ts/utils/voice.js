module.exports = {
  _speaking: false,
  _pluginReady: false,
  _pendingQueue: [],

  init() {
    if (this._pluginReady) return

    try {
      const plugin = requirePlugin('WechatSI')
      if (plugin && plugin.textToSpeech) {
        this._plugin = plugin
        this._pluginReady = true
        this._processQueue()
      }
    } catch (e) {
      console.log('WechatSI plugin not available, will use fallback')
    }
  },

  speak(text, options) {
    if (!text) return

    if (!this._pluginReady) {
      this._pendingQueue.push({ text, options })
      this.init()
      return
    }

    const opts = options || {}
    const lang = opts.lang || 'zh_CN'

    if (this._speaking) {
      this.stop()
    }

    if (this._plugin && this._plugin.textToSpeech) {
      this._speaking = true
      this._plugin.textToSpeech({
        lang: lang,
        tts: true,
        content: text,
        success: () => { this._speaking = false },
        fail: () => {
          this._speaking = false
          this._fallbackSpeak(text)
        }
      })
    } else {
      this._fallbackSpeak(text)
    }
  },

  _processQueue() {
    while (this._pendingQueue.length > 0) {
      const item = this._pendingQueue.shift()
      this.speak(item.text, item.options)
    }
  },

  _fallbackSpeak(text) {
    try {
      const audioCtx = wx.createInnerAudioContext()
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&le=zh`
      audioCtx.src = url
      audioCtx.play()
    } catch (e) {
      console.log('Fallback speak failed:', e)
    }
  },

  stop() {
    this._speaking = false
    this._pendingQueue = []
  },

  onTap(text) {
    this.speak(text, { lang: 'zh_CN' })
  }
}
