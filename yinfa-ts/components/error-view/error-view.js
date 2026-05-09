Component({
  properties: {
    title: { type: String, value: '加载失败' },
    desc: { type: String, value: '' },
    retry: { type: Boolean, value: true }
  },
  methods: {
    onRetry: function () { this.triggerEvent('retry') }
  }
})
