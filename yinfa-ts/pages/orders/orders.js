const voice = require('../../utils/voice.js')
const nav = require('../../utils/navigate.js')

Page({
  data: {
    orders: [],
    loading: true
  },

  onLoad: function () {
    this.loadOrders()
  },

  loadOrders: function () {
    setTimeout(() => {
      this.setData({
        orders: [
          { orderNo: 'GL20260507001', title: '漓江精华游船票', date: '2026-05-09', people: 2, price: 430, statusText: '已确认' },
          { orderNo: 'GL20260506002', title: '象鼻山公园 + 桂林米粉套票', date: '2026-05-08', people: 1, price: 93, statusText: '已完成' }
        ],
        loading: false
      })
    }, 500)
  },

  readOrder: function (e) {
    const index = e.currentTarget.dataset.index
    const order = this.data.orders[index]
    voice.speak('订单号尾号' + order.orderNo.slice(-4) + '，' + order.title + '，' + order.date + '，' + order.people + '人，金额' + order.price + '元，状态：' + order.statusText)
  }
})
