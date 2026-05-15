<template>
  <div :class="['assistant', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="header">
      <span class="header-icon">🤖</span>
      <span class="header-title">银发AI助手</span>
      <span class="header-desc">语音问答·旅游咨询·生活帮助</span>
    </div>

    <div class="shortcut-section">
      <div class="shortcut-grid">
        <div class="sc-item" @click="askQuick(q)" v-for="q in quickQuestions" :key="q">
          <span class="sc-tag">{{ q }}</span>
        </div>
      </div>
    </div>

    <div class="chat-box">
      <div class="chat-body" ref="chatBodyRef">
        <div v-for="(msg, idx) in messages" :key="idx" :class="['chat-msg', msg.role === 'user' ? 'user-msg' : 'ai-msg']">
          <div v-if="msg.role === 'ai'" class="msg-avatar">🤖</div>
          <div class="msg-bubble">
            <span class="msg-text">{{ msg.content }}</span>
          </div>
          <div v-if="msg.role === 'user'" class="msg-avatar">👤</div>
        </div>

        <div v-if="thinking" class="chat-msg ai-msg">
          <div class="msg-avatar">🤖</div>
          <div class="msg-bubble typing">
            <span class="typing-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>
          </div>
        </div>
      </div>

      <div class="chat-input-row">
        <div class="voice-toggle" :class="{ active: voiceMode }" @click="toggleVoiceMode">
          <span>🎤</span>
        </div>
        <input class="chat-input" placeholder="请输入您的问题..." v-model="inputText" @keyup.enter="sendMsg" />
        <div class="send-btn" @click="sendMsg">
          <span>发送</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const inputText = ref('')
const thinking = ref(false)
const voiceMode = ref(false)
const chatBodyRef = ref<HTMLElement | null>(null)

interface Message { role: 'user' | 'ai'; content: string }
const messages = ref<Message[]>([
  { role: 'ai', content: '您好！我是银发AI小助手 🤖\n\n您可以问我关于桂林旅游、健康养生、出行攻略等任何问题，我会用语音为您朗读回复内容。\n\n💡 试试问我：\n• 桂林有哪些必去景点？\n• 桂林米粉哪家最好吃？\n• 今天天气适合出行吗？' },
])

const quickQuestions = [
  '桂林必去景点', '今天天气如何', '桂林美食推荐',
  '交通出行攻略', '老人健康注意', '阳朔怎么去',
]

const answerMap: Record<string, string> = {
  '桂林必去景点': '桂林必去景点推荐：\n\n🏔️ 1. 漓江风景名胜区（5A）- 乘船游览百里漓江，欣赏桂林山水精华\n🐘 2. 象鼻山公园（5A/免费）- 桂林城市标志，交通便利\n🌾 3. 龙脊梯田（4A）- 世界梯田原乡，每年5-10月景色最佳\n🌃 4. 两江四湖（5A）- 推荐夜游，看桂林夜景\n🏞️ 5. 阳朔西街（4A/免费）- 中西文化交融的古街\n\n💡 老年人建议优先选择象鼻山和两江四湖，路面平坦，适合慢游。',
  '今天天气如何': '今天桂林天气晴好 🌤️\n气温：22°C - 28°C\n湿度：65%\n风力：微风 2级\n\n适合外出游览，建议穿着轻薄长袖，携带遮阳帽和饮用水。早晚温差不大，非常适合银发长者户外活动。',
  '桂林美食推荐': '桂林美食推荐 🍜\n\n🥇 桂林米粉 - 来桂林必吃！推荐崇善米粉总店，15元起\n🐟 阳朔啤酒鱼 - 漓江鲜鱼配啤酒烹制，88元起\n🍖 荔浦芋扣肉 - 传统名菜，软糯不油腻，58元起\n🍵 恭城油茶 - 少数民族特色饮品，暖胃驱寒，10元起\n\n💡 老年人建议选择米粉和油茶，口味清淡易消化。',
  '交通出行攻略': '桂林交通出行攻略 🚌\n\n🚕 出租车起步价8元，市区到各景点20-40元\n🚌 65岁以上老人凭证免费乘公交\n⛴️ 漓江游船全程约4小时，建议提前一天订票\n🚲 阳朔适合骑行，但老年人建议乘坐电瓶车\n\n💡 推荐使用"桂林出行"APP查看实时公交。',
  '老人健康注意': '银发出游健康提醒 💚\n\n⚠️ 穿防滑鞋 - 景区路面可能有青苔\n💊 随身带药 - 慢性病老人必备常用药\n💧 及时补水 - 桂林气候湿热，出汗多\n🕐 量力而行 - 累了就休息，不逞强\n📱 保持联系 - 告诉家人行程安排\n\n🌟 祝您旅途愉快，平安健康！',
  '阳朔怎么去': '从桂林去阳朔 🚌\n\n🚌 班车：桂林汽车站乘班车，约1.5小时，25元\n⛴️ 游船：磨盘山码头乘游船，约4小时，215元起\n🚗 自驾：约70公里，走桂阳公路，1小时左右\n\n💡 老年人推荐乘游船，一路赏漓江风光，舒适惬意。建议提前一天订票。',
}

function askQuick(q: string) {
  inputText.value = q
  sendMsg()
}

function sendMsg() {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''

  messages.value.push({ role: 'user', content: text })
  scrollToBottom()
  thinking.value = true

  setTimeout(() => {
    thinking.value = false
    let reply = answerMap[text]
    if (!reply) {
      reply = '这是一个很好的问题！\n\n我是银发AI小助手，目前还在学习更多知识。您可以尝试问我：\n• 桂林必去景点\n• 今天天气如何\n• 桂林美食推荐\n• 交通出行攻略\n• 老人健康注意\n• 阳朔怎么去\n\n我会继续努力学习，为您提供更好的服务 🤖'
    }
    messages.value.push({ role: 'ai', content: reply })
    scrollToBottom()
    appStore.speak(reply.replace(/[^\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）\n]/g, ' ').substring(0, 100))
  }, 1500)
}

function toggleVoiceMode() {
  voiceMode.value = !voiceMode.value
  appStore.speak(voiceMode.value ? '语音输入开启' : '语音输入关闭')
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.assistant { background: var(--bg); min-height: calc(100vh - 132px); display: flex; flex-direction: column; }

.header { padding: 20px 15px 15px; text-align: center; }
.header-icon { font-size: 32px; }
.header-title { display: block; font-size: 23px; font-weight: 700; color: var(--text-primary); margin-top: 4px; }
.header-desc { display: block; font-size: 14px; color: var(--text-hint); margin-top: 3px; }

.shortcut-section { padding: 0 10px 10px; }
.shortcut-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.sc-item { flex: 1; min-width: calc(33.333% - 6px); }
.sc-tag {
  display: block; text-align: center; padding: 9px 6px; font-size: 14px;
  font-weight: 600; color: var(--primary); background: var(--primary-light);
  border-radius: 8px; cursor: pointer; transition: all 0.15s;
}
.sc-tag:active { background: var(--primary); color: #fff; }

.chat-box { flex: 1; display: flex; flex-direction: column; margin: 0 10px 10px; background: var(--bg-card); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm); }

.chat-body { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 10px; max-height: calc(100vh - 300px); }

.chat-msg { display: flex; gap: 6px; max-width: 85%; }
.user-msg { align-self: flex-end; }
.ai-msg { align-self: flex-start; }
.msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.msg-bubble { max-width: 100%; padding: 10px 12px; border-radius: 8px; }
.ai-msg .msg-bubble { background: var(--primary-light); border-top-left-radius: 2px; }
.user-msg .msg-bubble { background: var(--primary); border-top-right-radius: 2px; }
.user-msg .msg-text { color: #fff; }
.msg-text { font-size: 15px; color: var(--text-primary); line-height: 1.7; white-space: pre-wrap; word-break: break-word; }

.msg-bubble.typing { padding: 8px 14px; }
.typing-dots { display: flex; gap: 3px; }
.typing-dots .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-hint); animation: typing 1.4s infinite both; }
.typing-dots .dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dots .dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }

.chat-input-row { display: flex; align-items: center; gap: 6px; padding: 8px 10px; border-top: 1px solid var(--border-light); background: var(--bg); }
.voice-toggle { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-card); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.voice-toggle.active { background: var(--primary); }
.voice-toggle:active { transform: scale(0.9); }
.chat-input { flex: 1; padding: 9px 10px; border: 1px solid var(--border); border-radius: 19px; font-size: 15px; background: var(--bg-card); box-sizing: border-box; }
.send-btn { padding: 8px 14px; background: var(--primary); color: #fff; border-radius: 19px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.send-btn:active { background: var(--primary-dark); transform: scale(0.95); }
</style>