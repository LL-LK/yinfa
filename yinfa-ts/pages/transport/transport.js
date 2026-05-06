Page({
  data: {
    transports: [
      {
        name: '公交查询',
        emoji: '🚌',
        desc: '桂林公交线路覆盖市区主要景点，票价2元起',
        btnText: '查看线路'
      },
      {
        name: '漓江游船',
        emoji: '⛴️',
        desc: '乘坐游船欣赏漓江两岸风光，有不同航程可选',
        btnText: '了解详情'
      },
      {
        name: '景区巴士',
        emoji: '🚍',
        desc: '直达各大景区的旅游专线，方便快捷',
        btnText: '查询班次'
      },
      {
        name: '出租叫车',
        emoji: '🚕',
        desc: '桂林市区出租车起步价6元，也可使用网约车',
        btnText: '一键叫车'
      },
      {
        name: '机场大巴',
        emoji: '✈️',
        desc: '两江机场至市区约40分钟，大巴票价20元',
        btnText: '查看时刻'
      },
      {
        name: '火车站',
        emoji: '🚄',
        desc: '桂林站/桂林北站/桂林西站，高铁通达全国',
        btnText: '查看位置'
      }
    ]
  },

  viewInfo: function (e) {
    const item = e.currentTarget.dataset.item
    wx.showModal({
      title: item.name,
      content: item.desc + '\n\n具体信息请拨打桂林交通服务热线\n0773-XXXXXXX',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
