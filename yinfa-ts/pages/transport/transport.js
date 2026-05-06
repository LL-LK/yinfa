Page({
  data: {
    transports: [
      {
        name: '公交查询',
        emoji: '🚌',
        desc: '桂林市区公交线路，票价2元',
        price: '¥2起',
        extra: '30条线路',
        btnText: '查看线路',
        bg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)'
      },
      {
        name: '漓江游船',
        emoji: '⛴️',
        desc: '乘船欣赏漓江两岸风光',
        price: '¥215起',
        extra: '4小时航程',
        btnText: '购票详情',
        bg: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)'
      },
      {
        name: '景区巴士',
        emoji: '🚍',
        desc: '直达各大景区的旅游专线',
        price: '¥10起',
        extra: '8条专线',
        btnText: '查询班次',
        bg: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)'
      },
      {
        name: '出租叫车',
        emoji: '🚕',
        desc: '市区出租车起步价6元',
        price: '¥6起',
        extra: '24小时服务',
        btnText: '一键叫车',
        bg: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)'
      },
      {
        name: '机场大巴',
        emoji: '✈️',
        desc: '两江机场至市区约40分钟',
        price: '¥20',
        extra: '30分钟一班',
        btnText: '查看时刻表',
        bg: 'linear-gradient(135deg, #E0F2F1, #B2DFDB)'
      },
      {
        name: '火车站',
        emoji: '🚄',
        desc: '桂林站/北站/西站高铁通达',
        price: '查询',
        extra: '3个站点',
        btnText: '查看位置',
        bg: 'linear-gradient(135deg, #FFF8E1, #FFECB3)'
      }
    ],
    quickTips: [
      { icon: '🕐', text: '避开8:00-9:00早高峰' },
      { icon: '🚌', text: '人多优先坐公交' },
      { icon: '🗺️', text: '提前查路线' },
      { icon: '📞', text: '热线: 0773-XXX' }
    ]
  },

  viewInfo: function (e) {
    const item = e.currentTarget.dataset.item
    wx.showModal({
      title: item.name,
      content: item.desc + '\n价格：' + item.price + '\n' + item.extra + '\n\n详情请拨打桂林交通服务热线\n0773-XXXXXXX',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
