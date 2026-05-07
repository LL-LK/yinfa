module.exports = {
  _speaking: false,

  speak(text, options) {
    if (!text) return
    const opts = options || {}
    const lang = opts.lang || 'zh_CN'

    if (this._speaking) {
      this.stop()
    }

    const plugin = requirePlugin('WechatSI')
    if (plugin && plugin.textToSpeech) {
      this._speaking = true
      plugin.textToSpeech({
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

  _fallbackSpeak(text) {
    const audioCtx = wx.createInnerAudioContext()
    const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&le=zh`
    audioCtx.src = url
    audioCtx.play()
  },

  stop() {
    this._speaking = false
  },

  onTap(text) {
    this.speak(text, { lang: 'zh_CN' })
  }
}

