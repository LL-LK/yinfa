<template>
  <div class="user-page">
    <div class="user-header">
      <div class="avatar">👴</div>
      <h1>桂林游客</h1>
      <p>尊贵的银发旅行者</p>
    </div>

    <div class="stats">
      <div class="stat"><strong>{{ favoriteCount }}</strong><span>收藏景点</span></div>
      <div class="stat"><strong>{{ orderCount }}</strong><span>我的订单</span></div>
      <div class="stat"><strong>{{ voiceEnabled ? '开' : '关' }}</strong><span>语音提示</span></div>
    </div>

    <div class="sos-btn" @click="sendSOS">
      <span>🆘</span>
      <div><strong>紧急求助</strong><p>遇到危险，一键求助家人和救援</p></div>
    </div>

    <div class="menu">
      <div class="menu-item" @click="$router.push('/orders')"><span>📋</span> 我的订单 <span class="arrow">></span></div>
      <div class="menu-item" @click="$router.push('/address')"><span>📍</span> 地址管理 <span class="arrow">></span></div>
      <div class="menu-item"><span>❤️</span> 我的收藏 <span v-if="favoriteCount" class="badge">{{ favoriteCount }}</span><span class="arrow">></span></div>
      <div class="menu-item"><span>🏥</span> 健康记录 <span class="arrow">></span></div>
    </div>

    <div class="settings">
      <h3>语音提示</h3>
      <label class="toggle">
        <span>{{ voiceEnabled ? '✅ 已开启' : '❌ 已关闭' }}</span>
        <input type="checkbox" v-model="voiceEnabled" @change="toggleVoice">
      </label>
      <h3>字体大小</h3>
      <div class="font-options">
        <button :class="{ active: fontSize === 'small' }" @click="setFont('small')">标准</button>
        <button :class="{ active: fontSize === 'normal' }" @click="setFont('normal')">较大</button>
        <button :class="{ active: fontSize === 'large' }" @click="setFont('large')">超大</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserView',
  data() {
    return {
      favoriteCount: 3,
      orderCount: 2,
      voiceEnabled: true,
      fontSize: 'normal'
    }
  },
  methods: {
    sendSOS() { alert('SOS功能需要在微信环境中使用') },
    toggleVoice() { this.voiceEnabled = !this.voiceEnabled },
    setFont(size) { this.fontSize = size }
  }
}
</script>

<style scoped>
.user-page { padding: 20px; max-width: 600px; margin: 0 auto; }
.user-header { text-align: center; padding: 30px 0; }
.avatar { font-size: 64px; }
.user-header h1 { margin: 10px 0 4px; }
.user-header p { color: #888; }
.stats { display: flex; justify-content: space-around; background: #fff; border-radius: 12px; padding: 20px; margin: 16px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.stat { text-align: center; }
.stat strong { display: block; font-size: 24px; color: #ff6b35; }
.stat span { font-size: 12px; color: #999; }
.sos-btn { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff; border-radius: 12px; padding: 20px; cursor: pointer; }
.sos-btn span:first-child { font-size: 36px; }
.sos-btn p { font-size: 12px; opacity: 0.8; margin-top: 4px; }
.menu { margin: 16px 0; }
.menu-item { display: flex; align-items: center; gap: 12px; background: #fff; padding: 16px; margin-bottom: 4px; cursor: pointer; }
.menu-item:first-child { border-radius: 12px 12px 0 0; }
.menu-item:last-child { border-radius: 0 0 12px 12px; }
.badge { background: #e74c3c; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-left: auto; }
.arrow { margin-left: auto; color: #ccc; }
.settings { background: #fff; border-radius: 12px; padding: 16px; margin: 16px 0; }
.settings h3 { margin: 12px 0 8px; }
.toggle { display: flex; align-items: center; gap: 12px; }
.font-options { display: flex; gap: 8px; }
.font-options button { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; }
.font-options button.active { background: #fff0e8; border-color: #ff6b35; color: #ff6b35; }
</style>