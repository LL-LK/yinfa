<template>
  <div :class="['user', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="user-header">
      <div class="avatar-box">
        <img v-if="userInfo.avatarUrl" :src="userInfo.avatarUrl" class="avatar-img" />
        <span v-else class="avatar-emoji">{{ userInfo.isLoggedIn ? '👴' : '🔐' }}</span>
      </div>

      <span class="user-name">{{ userInfo.nickname }}</span>

      <template v-if="userInfo.isLoggedIn">
        <span class="user-id">{{ userInfo.hasPhone ? '已绑定手机' : '桂林银发旅行者' }}</span>
        <div class="btn-logout" @click="doLogout">退出登录</div>
      </template>

      <template v-else>
        <span class="user-subtitle">点击登录，享受更多服务</span>
        <div class="btn-login" @click="doLogin">微信一键登录</div>
      </template>

      <div class="user-stats">
        <div class="stat" @click="tapMenu('favorites')">
          <span class="stat-num">{{ favoriteCount }}</span>
          <span class="stat-label">收藏景点</span>
        </div>
        <div class="stat" @click="tapMenu('orders')">
          <span class="stat-num">{{ orderCount }}</span>
          <span class="stat-label">我的订单</span>
        </div>
        <div class="stat" @click="toggleVoice">
          <span class="stat-num">{{ voiceEnabled ? '开' : '关' }}</span>
          <span class="stat-label">语音提示</span>
        </div>
      </div>
    </div>

    <div class="sos-section" @click="sendSOS">
      <div class="sos-icon">🆘</div>
      <div class="sos-text">
        <span class="sos-title">紧急求助</span>
        <span class="sos-desc">遇到危险，一键求助家人和救援</span>
      </div>
    </div>

    <div class="menu-section">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        @click="tapMenu(item.id)"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span class="menu-name">{{ item.name }}</span>
        <span v-if="item.badge && favoriteCount > 0" class="menu-badge">{{ favoriteCount }}</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <div class="settings-section">
      <span class="settings-title">语音提示</span>
      <div class="voice-switch" @click="toggleVoice">
        <span>{{ voiceEnabled ? '✅ 已开启（点击关闭）' : '❌ 已关闭（点击开启）' }}</span>
        <span class="voice-hint">开启后每次点击按钮都会语音播报，方便老人使用</span>
      </div>
    </div>

    <div class="settings-section">
      <span class="settings-title">语言辅助</span>
      <div class="lang-assist-switch" @click="toggleLangAssist">
        <label class="lang-switch-label">
          <input type="checkbox" :checked="langAssistEnabled" @change.stop="toggleLangAssist" class="lang-switch-check" />
          <span class="lang-switch-track" :class="{ checked: langAssistEnabled }"></span>
          <span class="lang-switch-thumb" :class="{ checked: langAssistEnabled }"></span>
        </label>
        <div class="lang-assist-content">
          <span class="lang-assist-title">{{ langAssistEnabled ? '✅ 已开启' : '❌ 已关闭' }}</span>
          <span class="lang-assist-hint">开启后提供多语言翻译和语音朗读辅助功能</span>
        </div>
      </div>
      <div v-if="langAssistEnabled" class="lang-options">
        <div :class="['lang-option', { active: currentLang === 'zh' }]" @click="setLang('zh')">
          <span class="lang-name">中文</span>
        </div>
        <div :class="['lang-option', { active: currentLang === 'en' }]" @click="setLang('en')">
          <span class="lang-name">English</span>
        </div>
        <div :class="['lang-option', { active: currentLang === 'ja' }]" @click="setLang('ja')">
          <span class="lang-name">日本語</span>
        </div>
        <div :class="['lang-option', { active: currentLang === 'ko' }]" @click="setLang('ko')">
          <span class="lang-name">한국어</span>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <span class="settings-title">字体大小</span>
      <div class="font-size-options">
        <div :class="['font-option', { active: appStore.fontSizeMode === 'normal' }]" @click="setFontSize('small')">标准</div>
        <div :class="['font-option', { active: appStore.fontSizeMode === 'large' }]" @click="setFontSize('normal')">较大</div>
        <div :class="['font-option', { active: appStore.fontSizeMode === 'xlarge' }]" @click="setFontSize('large')">超大</div>
      </div>
    </div>

    <div class="menu-section">
      <div class="menu-item" @click="goAbout">
        <span class="menu-icon">ℹ️</span>
        <span class="menu-name">关于桂林银发旅游</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

const router = useRouter()
const appStore = useAppStore()

const userInfo = ref({
  isLoggedIn: false,
  nickname: '桂林游客',
  avatarUrl: '',
  hasPhone: false,
})

const favoriteCount = ref(0)
const orderCount = ref(0)
const voiceEnabled = ref(true)
const langAssistEnabled = ref(false)
const currentLang = ref('zh')
const sosLoading = ref(false)

const menuItems = [
  { id: 'orders',    icon: '📋', name: '我的订单',   url: '/orders' },
  { id: 'address',   icon: '📍', name: '地址管理',   url: '/address' },
  { id: 'favorites', icon: '❤️', name: '我的收藏',   url: '', badge: true },
  { id: 'health',    icon: '🏥', name: '健康记录',   url: '/health' },
  { id: 'emergency', icon: '👨‍👩‍👧', name: '紧急联系人', url: '/emergency' },
  { id: 'safety',    icon: '🛡️', name: '安全设置',   url: '/safety' },
]

function tapMenu(id: string) {
  const item = menuItems.find(m => m.id === id)
  if (!item) return

  if (item.url) {
    router.push(item.url)
    appStore.speak(item.name)
  } else if (id === 'favorites') {
    if (favoriteCount.value === 0) {
      alert('您还没有收藏任何景点。\n在景点详情页点击「收藏」按钮即可添加。')
    } else {
      alert('我的收藏 (' + favoriteCount.value + '个景点)')
    }
  }
}

function doLogin() {
  alert('请在小程序中使用微信一键登录')
  appStore.speak('登录中')
}

function doLogout() {
  if (confirm('确定要退出当前账号吗？')) {
    userInfo.value.isLoggedIn = false
    userInfo.value.nickname = '桂林游客'
    localStorage.removeItem('openid')
    appStore.speak('已退出登录')
  }
}

function toggleVoice() {
  voiceEnabled.value = !voiceEnabled.value
  appStore.toggleVoice()
  const msg = voiceEnabled.value ? '语音提示已开启' : '语音提示已关闭'
  appStore.speak(msg)
  alert(msg)
}

function toggleLangAssist() {
  langAssistEnabled.value = !langAssistEnabled.value
  const msg = langAssistEnabled.value ? '语言辅助已开启' : '语言辅助已关闭'
  appStore.speak(msg)
}

function setLang(lang: string) {
  currentLang.value = lang
  const names: Record<string, string> = { zh: '中文', en: 'English', ja: '日本語', ko: '한국어' }
  const msg = '已切换为' + (names[lang] || lang)
  appStore.speak(msg)
}

function setFontSize(mode: string) {
  appStore.setFontSize(mode as 'normal' | 'large' | 'xlarge')
  const labels: Record<string, string> = { small: '标准字体', normal: '较大字体', large: '超大字体' }
  appStore.speak('已切换' + (labels[mode] || mode))
}

function goAbout() {
  alert('版本：1.0.0\n\n专为银发群体打造的桂林智慧导览与商城小程序。\n\n提供景点导览、美食推荐、交通出行、安全保障等功能，让老人出游更安心、更便捷。')
}

function sendSOS() {
  if (sosLoading.value) return
  if (confirm('🆘 紧急求助\n\n即将获取您的位置并通知紧急联系人，确定继续？')) {
    sosLoading.value = true
    appStore.speak('紧急求助已启动')
    setTimeout(() => { sosLoading.value = false }, 1000)
  }
}
</script>

<style scoped>
.user { background: var(--bg); min-height: 100vh; padding-bottom: 60px; }

.user-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 30px 20px 24px;
  display: flex; flex-direction: column; align-items: center;
}

.avatar-box {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px; border: 2px solid rgba(255,255,255,0.3); overflow: hidden;
}
.avatar-emoji { font-size: 28px; }
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

.user-name { font-size: 19px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.user-id { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
.user-subtitle { font-size: 14px; color: rgba(255,255,255,0.75); margin-bottom: 20px; }

.btn-login {
  background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.35);
  border-radius: 20px; padding: 7px 32px; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.btn-login:active { background: rgba(255,255,255,0.35); transform: scale(0.96); }

.btn-logout {
  font-size: 12px; color: rgba(255,255,255,0.55);
  margin-bottom: 8px; padding: 4px 0; cursor: pointer;
}
.btn-logout:active { color: rgba(255,255,255,0.9); }

.user-stats {
  display: flex; justify-content: space-around; width: 100%;
  margin-top: 16px; padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.2);
}
.stat { display: flex; flex-direction: column; align-items: center; padding: 8px 16px; cursor: pointer; }
.stat-num { font-size: 19px; font-weight: 700; color: #fff; }
.stat-label { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px; }

.sos-section {
  margin: 16px 10px; display: flex; align-items: center; padding: 20px;
  background: var(--bg-card); border-radius: 12px;
  box-shadow: var(--shadow-sm); border-left: 3px solid var(--sos);
  transition: all 0.15s; cursor: pointer;
}
.sos-section:active { background: var(--sos-light); transform: scale(0.98); }
.sos-icon { font-size: 24px; margin-right: 16px; }
.sos-text { display: flex; flex-direction: column; }
.sos-title { font-size: 17px; font-weight: 700; color: var(--text-primary); }
.sos-desc { font-size: 12px; color: var(--text-hint); margin-top: 4px; }

.menu-section {
  margin: 0 10px 16px; background: var(--bg-card);
  border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm);
}
.menu-item {
  display: flex; align-items: center; padding: 20px;
  border-bottom: 1px solid var(--border-light); min-height: 50px;
  cursor: pointer; transition: background 0.15s;
}
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: var(--bg-mask); }

.menu-icon { font-size: 19px; margin-right: 10px; width: 28px; text-align: center; flex-shrink: 0; }
.menu-name { flex: 1; font-size: 17px; font-weight: 500; color: var(--text-primary); }
.menu-badge {
  font-size: 12px; padding: 2px 8px; border-radius: 40px;
  background: var(--sos); color: #fff; font-weight: 600; margin-right: 12px;
}
.menu-arrow { font-size: 13px; color: var(--text-hint); }

.settings-section {
  margin: 0 10px 16px; background: var(--bg-card);
  border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm);
}
.settings-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; display: block; }

.voice-switch {
  display: flex; flex-direction: column; padding: 10px;
  background: var(--cloud); border-radius: 12px;
  font-size: 14px; color: var(--text-primary); cursor: pointer;
  transition: all 0.15s;
}
.voice-switch:active { background: var(--primary-light); }
.voice-hint { font-size: 12px; color: var(--text-hint); margin-top: 8px; }

.lang-assist-switch {
  display: flex; align-items: center; gap: 20px;
  padding: 10px; background: var(--cloud); border-radius: 12px;
  transition: all 0.15s; cursor: pointer;
}
.lang-assist-switch:active { background: var(--primary-light); }

.lang-switch-label {
  position: relative; display: inline-block; width: 36px; height: 22px;
  flex-shrink: 0;
}
.lang-switch-check {
  opacity: 0; width: 0; height: 0; position: absolute;
}
.lang-switch-track {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: #ccc; border-radius: 11px; transition: 0.2s;
}
.lang-switch-track.checked { background: #2E8B57; }
.lang-switch-thumb {
  position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
  background: #fff; border-radius: 50%; transition: 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.lang-switch-thumb.checked { transform: translateX(14px); }

.lang-assist-content { display: flex; flex-direction: column; flex: 1; }
.lang-assist-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.lang-assist-hint { font-size: 12px; color: var(--text-hint); margin-top: 4px; }

.lang-options { display: flex; gap: 12px; margin-top: 16px; }
.lang-option {
  flex: 1; text-align: center; padding: 16px 8px; border-radius: 12px;
  background: var(--bg); border: 2px solid var(--border);
  font-size: 13px; color: var(--text-secondary); cursor: pointer;
  transition: all 0.15s;
}
.lang-option:active { transform: scale(0.95); background: var(--primary-light); }
.lang-option.active {
  background: var(--primary-light); border-color: var(--primary);
  font-weight: 700; color: var(--primary-dark); font-size: 14px;
}

.font-size-options { display: flex; gap: 16px; }
.font-option {
  flex: 1; text-align: center; padding: 20px;
  border-radius: 12px; background: var(--bg); font-size: 15px;
  color: var(--text-secondary); border: 2px solid var(--border);
  cursor: pointer; transition: all 0.15s;
}
.font-option.active {
  background: var(--primary); color: #fff; font-weight: 600;
  border-color: var(--primary-dark); box-shadow: var(--shadow-sm);
}
.font-option:active { transform: scale(0.96); }
</style>