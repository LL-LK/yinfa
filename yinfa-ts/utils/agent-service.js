var AGENT_BASE = (function() {
  // 生产环境优先读环境变量，兼容微信小程序云托管
  if (typeof wx !== 'undefined' && wx.cloud) {
    return '' // 云托管环境直接使用相对路径
  }
  // 微信小程序通过webview代理时使用固定地址
  // 部署后需在微信后台配置业务域名并修改此处
  return process.env.AGENT_BASE_URL || 'http://localhost:8001'
})()

var HEALTH_TIMEOUT = 3000
var CHAT_TIMEOUT = 15000
var MCP_TIMEOUT = 30000 // MCP调用超时稍长

var cachedCapabilities = null

function requestAgent(path, options) {
  var opts = options || {}
  var timeout = opts.timeout || CHAT_TIMEOUT

  return new Promise(function(resolve, reject) {
    var timer = setTimeout(function() {
      reject({ errMsg: '智能助手请求超时，请稍后重试', timeout: true })
    }, timeout)

    wx.request({
      url: AGENT_BASE + path,
      method: opts.method || 'POST',
      header: { 'content-type': 'application/json' },
      data: opts.data || {},
      timeout: timeout,
      success: function(res) {
        clearTimeout(timer)
        if (res.statusCode === 200 && res.data) {
          resolve(res.data)
        } else {
          reject({ statusCode: res.statusCode, data: res.data, errMsg: '服务器响应异常' })
        }
      },
      fail: function(err) {
        clearTimeout(timer)
        reject({ errMsg: '无法连接到智能助手服务', detail: err })
      }
    })
  })
}

function healthCheck() {
  return requestAgent('/health', { method: 'GET', timeout: HEALTH_TIMEOUT })
}

function getCapabilities() {
  if (cachedCapabilities) {
    return Promise.resolve(cachedCapabilities)
  }
  return requestAgent('/capabilities', { method: 'GET', timeout: HEALTH_TIMEOUT }).then(function(res) {
    cachedCapabilities = res
    return res
  }).catch(function() {
    return null
  })
}

/**
 * MCP路径：使用JSON-RPC 2.0协议调用lvyou-agi
 * 优先使用MCP，fallback到REST
 */
function chatMCP(message, profile) {
  var sessionId = profile && profile.sessionId || 'yinfa-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

  var mcpRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'chat',
      arguments: {
        message: message,
        context: profile ? {
          group_size: profile.group_size || 2,
          duration: profile.time_budget || 240,
          budget: profile.budget_level || 'medium',
          interests: profile.interests || ['风景'],
          elderly_count: profile.elderly_count || 2,
          start_location: profile.start_location || '杨堤码头'
        } : undefined
      },
      session_id: sessionId
    }
  }

  return new Promise(function(resolve, reject) {
    var timer = setTimeout(function() {
      reject({ errMsg: 'MCP请求超时，尝试REST路径...', timeout: true, mcpFailed: true })
    }, MCP_TIMEOUT)

    wx.request({
      url: AGENT_BASE + '/api/mcp',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: mcpRequest,
      timeout: MCP_TIMEOUT,
      success: function(res) {
        clearTimeout(timer)
        if (res.statusCode === 200 && res.data) {
          var data = res.data
          // JSON-RPC错误
          if (data.error) {
            reject({ errMsg: 'MCP调用失败: ' + data.error.message, mcpFailed: true, original: data.error })
            return
          }
          // JSON-RPC成功响应
          if (data.result) {
            try {
              var result = typeof data.result === 'string' ? JSON.parse(data.result) : data.result
              if (result && result.type && result.data) {
                resolve(normalizeResponse(result.data))
              } else if (result && result.content) {
                resolve(result.content)
              } else if (result && typeof result === 'string') {
                resolve(result)
              } else {
                resolve(JSON.stringify(result))
              }
            } catch (e) {
              resolve(data.result)
            }
          } else {
            reject({ errMsg: 'MCP响应格式异常', mcpFailed: true, original: data })
          }
        } else {
          reject({ statusCode: res.statusCode, data: res.data, errMsg: 'MCP服务器响应异常', mcpFailed: true })
        }
      },
      fail: function(err) {
        clearTimeout(timer)
        reject({ errMsg: 'MCP服务不可用，尝试REST路径...', mcpFailed: true, original: err })
      }
    })
  })
}

/**
 * REST路径：直接调用lvyou-agi /api/chat
 */
function chatREST(message, profile) {
  return requestAgent('/api/chat', {
    method: 'POST',
    data: {
      message: message,
      context: profile ? {
        group_size: profile.group_size || 2,
        duration: profile.time_budget || 240,
        budget: profile.budget_level || 'medium',
        interests: profile.interests || ['风景'],
        elderly_count: profile.elderly_count || 2,
        start_location: profile.start_location || '杨堤码头'
      } : undefined,
      use_tools: true,
      stream: false
    },
    timeout: CHAT_TIMEOUT
  }).then(function(res) {
    // lvyou-agi /chat 返回 ChatResponse: { type, intent, content, data }
    // content 可能是字符串（无 profile 时）或富文本（有 profile 时）
    if (res && res.type && res.data) {
      // 有 structured data，走 normalizeResponse
      return normalizeResponse(res.data)
    }
    if (res && res.type && res.content && !res.data) {
      // 有 type 但无 data，content 是直接返回的文本（如 summary）
      return normalizeResponse({ type: res.type, intent: res.intent, summary: res.content })
    }
    if (res && res.content && typeof res.content === 'string' && !res.type) {
      // content 是直接文本（非结构化响应），直接返回
      return res.content
    }
    if (res && res.code === 0 && res.data) {
      // 兼容旧格式
      return normalizeResponse(res.data)
    }
    return '抱歉，我暂时无法回答您的问题，请稍后再试。'
  })
}

/**
 * 主chat函数：优先MCP，fallback到REST
 */
function chat(message, profile) {
  // 先尝试MCP路径
  return chatMCP(message, profile).catch(function(mcpErr) {
    // MCP失败，尝试REST路径
    console.warn('MCP路径失败，尝试REST路径:', mcpErr.errMsg || mcpErr.message || mcpErr)
    return chatREST(message, profile).catch(function(restErr) {
      if (restErr.timeout) {
        throw { errMsg: '智能助手响应超时，请稍后重试', timeout: true, original: restErr }
      }
      throw { errMsg: '智能助手服务暂不可用', original: restErr }
    })
  }).catch(function(err) {
    if (err.timeout) {
      throw { errMsg: '智能助手响应超时，请稍后重试', timeout: true, original: err }
    }
    throw { errMsg: '智能助手服务暂不可用', original: err }
  })
}

/**
 * 强制使用REST路径（调试用）
 */
function chatRESTOnly(message, profile) {
  return chatREST(message, profile).catch(function(err) {
    if (err.timeout) {
      throw { errMsg: '智能助手响应超时，请稍后重试', timeout: true, original: err }
    }
    throw { errMsg: '智能助手服务暂不可用', original: err }
  })
}

/**
 * 强制使用MCP路径（调试用）
 */
function chatMCPOnly(message, profile) {
  return chatMCP(message, profile).catch(function(err) {
    throw { errMsg: err.errMsg || 'MCP服务暂不可用', mcpFailed: true, original: err }
  })
}

function normalizeResponse(data) {
  if (!data) return '抱歉，没有获取到有效回答。'

  if (data.type === 'route_plan') {
    var route = data.route || {}
    var parts = []
    parts.push('📍 **' + (route.route_name || '推荐路线') + '**\n')
    parts.push('目的地：' + (route.destination || '漓江精华段'))
    parts.push('时长：' + (route.duration_minutes || '?') + '分钟')
    parts.push('票价：¥' + (route.price_yuan || '?'))

    if (route.highlights)
      parts.push('亮点：' + route.highlights)
    if (route.tips)
      parts.push('贴士：' + route.tips)

    if (route.stops && route.stops.length > 0) {
      parts.push('\n停靠站点：')
      for (var i = 0; i < route.stops.length; i++) {
        parts.push((i + 1) + '. ' + route.stops[i])
      }
    }
    return parts.join('\n')
  }

  if (data.type === 'behavior_prediction') {
    var b = data.behavior || {}
    var bp = []
    bp.push('📊 **客流预测**\n')
    bp.push('预计停留：' + (b.stay_duration_hours || b.stay_duration_minutes || '?') + '小时')
    bp.push('季节：' + (b.season || '?'))

    if (b.purchase_intent) {
      bp.push('\n购买意愿分析：')
      for (var pk in b.purchase_intent) {
        if (b.purchase_intent.hasOwnProperty(pk)) {
          bp.push('  · ' + pk + ': ' + b.purchase_intent[pk])
        }
      }
    }

    if (b.peak_analysis)
      bp.push('\n高峰分析：' + b.peak_analysis)

    return bp.join('\n')
  }

  if (data.type === 'knowledge_answer') {
    return data.answer || '抱歉，我暂时无法回答这个问题。'
  }

  if (data.type === 'multi_intent_response') {
    var results = data.results || []
    var text = data.summary || ''
    for (var j = 0; j < results.length; j++) {
      var r = results[j]
      if (r.type === 'knowledge_answer' && r.answer) {
        text += '\n\n' + r.answer
      }
    }
    return text || '处理完成'
  }

  if (data.type === 'itinerary' && data.markdown) {
    return data.markdown
  }

  if (data.summary) {
    return data.summary
  }

  // MCP路径返回的结果可能是字符串化的JSON
  if (typeof data === 'string') {
    try {
      var parsed = JSON.parse(data)
      return normalizeResponse(parsed)
    } catch (e) {
      return data
    }
  }

  return JSON.stringify(data)
}

function setAgentBase(url) {
  AGENT_BASE = url
  cachedCapabilities = null
}

module.exports = {
  chat: chat,
  chatRESTOnly: chatRESTOnly,
  chatMCPOnly: chatMCPOnly,
  healthCheck: healthCheck,
  getCapabilities: getCapabilities,
  setAgentBase: setAgentBase
}
