var app = getApp()
var voice = require('../../utils/voice.js')
var agent = require('../../utils/agent-service.js')

var QUICK_TAGS = [
  { label: '🏔️ 景点推荐', q: '推荐漓江精华段必去景点，适合2位老人半天游览' },
  { label: '🌤️ 天气趋势', q: '桂林五月份的天气怎么样，适不适合老人出游' },
  { label: '🍜 美食推荐', q: '桂林有什么适合老人吃的特色美食推荐' },
  { label: '🚌 交通指南', q: '从桂林市区到阳朔怎么去最方便，带老人出行' },
  { label: '🎫 杨堤码头', q: '杨堤码头竹筏票价多少，老人有优惠吗' },
  { label: '📋 行程规划', q: '帮我规划半天漓江游览行程，2位老人，预算中等' },
  { label: '👥 客流预测', q: '周末去漓江人多吗，什么时候人少' },
  { label: '🛡️ 安全提示', q: '老人游览漓江有什么安全注意事项' }
]

Page({
  data: {
    messages: [],
    inputText: '',
    scrollToView: '',
    thinking: false,
    agentOnline: false,
    fontSizeMode: 'normal'
  },

  onLoad: function () {
    this.setData({ fontSizeMode: app.globalData.fontSizeMode || 'normal' })
    this.checkAgentStatus()
    this.addSystemMsg('您好！我是桂林银发旅游智能管家 💚\n\n我可以帮您：\n🏔️ 规划漓江游览路线\n📊 预测客流和等待时间\n🎫 查询景点票价和优惠\n🍜 推荐适合老人的美食\n🚌 提供交通出行建议\n\n请问有什么可以帮您的？')
  },

  checkAgentStatus: function () {
    var self = this
    agent.healthCheck().then(function() {
      self.setData({ agentOnline: true })
    }).catch(function() {
      self.setData({ agentOnline: false })
    })
  },

  addSystemMsg: function (text) {
    var msg = { id: Date.now(), type: 'system', text: text }
    var messages = this.data.messages.concat([msg])
    this.setData({ messages: messages, scrollToView: 'msg-' + msg.id })
  },

  addBotMsg: function (text) {
    var msg = { id: Date.now(), type: 'bot', text: text }
    var messages = this.data.messages.concat([msg])
    this.setData({
      messages: messages,
      scrollToView: 'msg-' + msg.id,
      thinking: false
    })
    voice.speak(text.substring(0, 80))
  },

  sendMessage: function () {
    var text = this.data.inputText.trim()
    if (!text || this.data.thinking) return

    var userMsg = { id: Date.now(), type: 'user', text: text }
    var messages = this.data.messages.concat([userMsg])
    this.setData({
      inputText: '',
      messages: messages,
      scrollToView: 'msg-' + userMsg.id,
      thinking: true
    })

    var self = this
    agent.chat(text, {
      group_size: 2,
      time_budget: 240,
      budget_level: 'medium',
      interests: ['风景', '美食'],
      elderly_count: 2,
      start_location: '杨堤码头'
    }).then(function(answer) {
      self.addBotMsg(answer)
    }).catch(function(err) {
      self.addBotMsg('抱歉，处理您的请求时出现了问题。请稍后重试。\n\n错误信息：' + (err && err.errMsg || '未知错误'))
    })
  },

  onInput: function (e) {
    this.setData({ inputText: e.detail.value })
  },

  tapQuick: function (e) {
    var q = e.currentTarget.dataset.q
    var userMsg = { id: Date.now(), type: 'user', text: q }
    var messages = this.data.messages.concat([userMsg])
    this.setData({
      inputText: '',
      messages: messages,
      scrollToView: 'msg-' + userMsg.id,
      thinking: true
    })

    voice.speak('正在为您查询')

    var self = this
    agent.chat(q, {
      group_size: 2,
      time_budget: 240,
      budget_level: 'medium',
      interests: ['风景', '美食'],
      elderly_count: 2,
      start_location: '杨堤码头'
    }).then(function(answer) {
      self.addBotMsg(answer)
    }).catch(function(err) {
      self.addBotMsg('智能助手服务暂不可用。\n\n💡 提示：请确保 lvyou-agi 服务已启动\n命令：cd F:\\lvyou-agi && python server.py')
    })
  },

  refreshAgent: function () {
    this.checkAgentStatus()
    this.addSystemMsg('🔄 正在重新连接智能助手服务...')
  }
})