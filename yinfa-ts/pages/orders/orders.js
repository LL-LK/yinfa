const app = getApp()
const api = require('../../utils/api.js')
const voice = require('../../utils/voice.js')

Page({
  data: {
    orders: [],
    filteredOrders: [],
    selectedTab: 'all',
    loading: true,
    error: false
  },

  onLoad: function () {
    this.loadOrders()
  },

  onShow: function () {
    this.loadOrders()
  },

  onPullDownRefresh: function () {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadOrders: function () {
    const openid = (app.globalData.userInfo && app.globalData.userInfo.openid) || ''
    if (!openid) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '请先在"我的"页面登录后查看订单'
      })
      return Promise.resolve()
    }

    this.setData({ loading: true, error: false })

    return api.request({
      url: '/orders',
      method: 'GET',
      data: { openid },
      showLoading: false
    }).then(orders => {
      const list = Array.isArray(orders) ? orders.map(o => ({
        id: o.id,
        orderNo: o.order_no || o.orderNo || '',
        title: o.items && o.items.length
          ? o.items.map(i => (i.product ? i.product.name : '') + ' x' + i.quantity).join('、')
          : '订单商品',
        price: o.total_price || o.price || 0,
        date: o.created_at ? o.created_at.slice(0, 10) : (o.date || ''),
        status: o.status || 'pending',
        statusText: getStatusText(o.status),
        payBtnVisible: o.status === 'pending'
      })) : []
      this.setData({ orders: list, loading: false })
      this._applyFilter(list)
    }).catch(() => {
      this.setData({
        orders: [],
        loading: false,
        error: true,
        errorMsg: '加载订单失败，请下拉刷新重试'
      })
    })
  },

  onOrderTap: function (e) {
    const id = e.currentTarget.dataset.id
    if (!id) return

    api.request({
      url: `/orders/${id}`,
      method: 'GET',
      showLoading: true
    }).then(order => {
      const title = order.items && order.items.length
        ? order.items.map(i => (i.product ? i.product.name : '') + ' x' + i.quantity).join('、')
        : '订单商品'
      voice.speak(
        '订单' + (order.order_no || '').slice(-6) +
        '，金额' + (order.total_price || 0) + '元' +
        '，状态' + getStatusText(order.status)
      )
      wx.showModal({
        title: '订单详情',
        content: `${title}\n金额：¥${order.total_price || 0}\n状态：${getStatusText(order.status)}`,
        confirmText: order.status === 'pending' ? '去支付' : '知道了',
        showCancel: order.status === 'pending',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm && order.status === 'pending') {
            this.doPay(order)
          }
        }
      })
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  doPay: function (order) {
    wx.showLoading({ title: '支付中...' })

    api.request({
      url: `/orders/${order.id}/paid`,
      method: 'POST',
      showLoading: false
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '支付成功', icon: 'success' })
      voice.speak('支付成功，您的订单已确认')
      this.loadOrders()
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '支付失败，请重试', icon: 'none' })
      voice.speak('支付失败，请重试')
    })
  },

  onTabChange: function (e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ selectedTab: tab })
    this._applyFilter(this.data.orders)
  },

  _applyFilter: function (orders) {
    const tab = this.data.selectedTab
    const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab)
    this.setData({ filteredOrders: filtered })
  }
})

function getStatusText(status) {
  const map = {
    'pending': '待支付',
    'paid': '已支付',
    'shipped': '已发货',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || status || '未知'
}