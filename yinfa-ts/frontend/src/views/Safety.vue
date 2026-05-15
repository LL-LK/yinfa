<template>
  <div :class="['safety', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="poster-section">
      <img :src="posterSrc" class="poster-img" loading="lazy" @error="onPosterError" alt="安全防护" />
      <div class="poster-overlay">
        <span class="poster-title">桂林·银发安全防护</span>
        <span class="poster-subtitle">出行安全 · 健康守护</span>
      </div>
    </div>

    <div class="safety-scroll">
      <div class="section-card weather-card">
        <div class="card-title-row">
          <span class="card-icon">🌤️</span>
          <span class="card-title-text">今日天气 · 路面状况</span>
          <span class="refresh-btn" @click="loadWeather">刷新</span>
        </div>
        <div class="weather-grid">
          <div class="wg-item">
            <span class="wg-label">天气</span>
            <span class="wg-value">{{ weather.condition }} {{ weather.temp }}</span>
          </div>
          <div class="wg-item">
            <span class="wg-label">湿度</span>
            <span class="wg-value">{{ weather.humidity }}</span>
          </div>
          <div class="wg-item">
            <span class="wg-label">风力</span>
            <span class="wg-value">{{ weather.wind }}</span>
          </div>
          <div class="wg-item wg-highlight">
            <span class="wg-label">路面</span>
            <span :class="['wg-value', 'road-' + slippery.level]">{{ slippery.title }}</span>
          </div>
        </div>
      </div>

      <div class="section-card advice-card">
        <div class="card-title-row">
          <span class="card-icon">💡</span>
          <span class="card-title-text">今日出行建议</span>
        </div>
        <div class="advice-main-box">
          <span class="advice-main">{{ travelAdvice.advice }}</span>
        </div>
        <div class="advice-cols">
          <div class="advice-col col-ok">
            <div class="col-head"><span class="col-ic">✅</span><span class="col-tit">推荐游览</span></div>
            <div class="col-body">
              <span v-for="spot in travelAdvice.suitable" :key="spot" class="col-item">{{ spot }}</span>
            </div>
          </div>
          <div class="advice-col col-no">
            <div class="col-head"><span class="col-ic">❌</span><span class="col-tit">建议避开</span></div>
            <div class="col-body">
              <span v-for="spot in travelAdvice.avoid" :key="spot" class="col-item">{{ spot }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="emergency-section">
        <div class="em-btn sos-em-btn" @click="callEmergency">
          <span class="em-icon">🆘</span>
          <span class="em-text">一键呼救</span>
        </div>
        <div class="em-btn loc-em-btn" @click="shareLocation">
          <span class="em-icon">📍</span>
          <span class="em-text">分享位置</span>
        </div>
        <div class="em-btn contact-em-btn" @click="$router.push('/emergency')">
          <span class="em-icon">📞</span>
          <span class="em-text">紧急联系人</span>
        </div>
      </div>

      <div class="section-card tips-card">
        <div class="card-title-row">
          <span class="card-icon">⚠️</span>
          <span class="card-title-text">银发出行安全提示</span>
        </div>
        <div class="tips-list">
          <div v-for="(tip, idx) in safetyTips" :key="idx" class="tip-item" @click="readTip(idx)">
            <span :class="['tip-level', 'tip-' + tip.level]">{{ tip.icon }}</span>
            <div class="tip-content">
              <span class="tip-name">{{ tip.name }}</span>
              <span class="tip-desc">{{ tip.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card health-card">
        <div class="card-title-row">
          <span class="card-icon">💚</span>
          <span class="card-title-text">今日健康提醒</span>
        </div>
        <div class="health-tips">
          <div v-for="(ht, idx) in healthTips" :key="idx" class="ht-item">
            <span class="ht-icon">{{ ht.icon }}</span>
            <span class="ht-text">{{ ht.text }}</span>
          </div>
        </div>
      </div>

      <div class="bottom-space"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import IMAGES from '../utils/imageConfig'

const appStore = useAppStore()

const posterSrc = ref(IMAGES.scenicPoster || '/image/IMG_3710.webp')
const posterTried = ref(false)

const weather = ref({ condition: '晴', temp: '26°C', humidity: '65%', wind: '微风 2级' })
const slippery = ref({ level: 1, title: '干燥·适宜出行' })

const travelAdvice = ref({
  advice: '今日天气晴好，温度适宜，非常适合户外游览。建议携带遮阳帽和饮用水，注意防晒。',
  suitable: ['象鼻山公园 · 路面平坦', '两江四湖 · 步行舒适', '七星公园 · 绿树成荫'],
  avoid: ['龙脊梯田 · 山路较陡', '资源八角寨 · 攀爬较多'],
})

const safetyTips = [
  { name: '景区湿滑台阶', desc: '请使用扶手，一步一阶，不要在台阶上停留拍照。', level: 'high', icon: '⚠️' },
  { name: '雨后石板路', desc: '请绕行或等地面干燥后再走，穿防滑鞋底加深摩擦。', level: 'high', icon: '⚠️' },
  { name: '上下旅游巴士', desc: '请抓牢车门扶手，等车停稳后再上下，不要着急。', level: 'medium', icon: '⚡' },
  { name: '漓江游船甲板', desc: '甲板湿滑时请不要走到边缘，穿平底鞋上下船。', level: 'medium', icon: '⚡' },
  { name: '酒店卫生间', desc: '请使用防滑拖鞋，地面积水及时擦干，可铺防滑垫。', level: 'low', icon: '✅' },
  { name: '购物街区地砖', desc: '注意地面积水或油渍，走路时请不要看手机哦。', level: 'low', icon: '✅' },
]

const healthTips = [
  { icon: '💧', text: '外出请携带饮用水，桂林气候湿润但游览仍需及时补水。' },
  { icon: '🌂', text: '随身携带折叠伞或遮阳帽，应对突发天气变化。' },
  { icon: '💊', text: '常用药品随身带（降压药、救心丸、创可贴）。' },
  { icon: '🕐', text: '每游览1小时休息10-15分钟，避免过度疲劳。' },
  { icon: '📱', text: '保持手机电量充足，开启定位方便家人联系。' },
]

function onPosterError() {
  if (!posterTried.value) {
    posterSrc.value = IMAGES.b2
    posterTried.value = true
  } else {
    posterSrc.value = ''
  }
}

function loadWeather() {
  appStore.speak('刷新天气')
}

function callEmergency() {
  appStore.speak('一键呼救')
  if (confirm('🆘 紧急呼救\n\n即将拨打紧急救援电话：120\n\n是否继续？')) {
    window.location.href = 'tel:120'
  }
}

function shareLocation() {
  appStore.speak('分享位置')
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
        navigator.clipboard.writeText('我的位置：' + url).then(() => {
          alert('位置已复制到剪贴板')
        }).catch(() => {
          alert('我的位置：' + url)
        })
      },
      () => {
        alert('获取位置失败，请检查定位权限')
      }
    )
  } else {
    alert('您的浏览器不支持定位功能')
  }
}

function readTip(index: number) {
  const tip = safetyTips[index]
  appStore.speak(tip.name + '：' + tip.desc)
}
</script>

<style scoped>
.safety { background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; }

.poster-section {
  position: relative; width: 100%; min-height: 100px;
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #43A047 100%);
}
.poster-img { width: 100%; display: block; min-height: 100px; object-fit: cover; }
.poster-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 20px 16px 14px;
  background: linear-gradient(transparent, rgba(0,0,0,0.55));
}
.poster-title { display: block; font-size: 19px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.poster-subtitle { display: block; font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 2px; }

.safety-scroll { flex: 1; overflow-y: auto; }

.section-card { margin: 0 10px 10px; background: var(--bg-card); border-radius: 12px; padding: 14px; box-shadow: var(--shadow-sm); }
.card-title-row { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-light); }
.card-icon { font-size: 19px; }
.card-title-text { flex: 1; font-size: 17px; font-weight: 700; color: var(--text-primary); }
.refresh-btn { font-size: 12px; color: var(--primary); font-weight: 600; padding: 3px 8px; background: var(--primary-light); border-radius: 10px; cursor: pointer; }

.weather-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.wg-item { background: var(--cloud); border-radius: 8px; padding: 9px 8px; display: flex; flex-direction: column; gap: 4px; }
.wg-item.wg-highlight { grid-column: span 2; background: linear-gradient(135deg, var(--gold-light) 0%, #FFECB3 100%); border: 1px solid #FFE082; }
.wg-label { font-size: 12px; color: var(--text-hint); font-weight: 600; }
.wg-value { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.wg-value.road-1 { color: var(--success); }
.wg-value.road-2 { color: var(--warning); }
.wg-value.road-3 { color: var(--sos); }

.advice-main-box { background: linear-gradient(135deg, var(--gold-light) 0%, #FFF9C4 100%); border-radius: 8px; padding: 9px; margin-bottom: 8px; border-left: 3px solid var(--warning); }
.advice-main { font-size: 14px; color: var(--text-primary); line-height: 1.7; font-weight: 500; }
.advice-cols { display: flex; gap: 6px; }
.advice-col { flex: 1; border-radius: 8px; overflow: hidden; }
.col-ok { background: linear-gradient(135deg, var(--success-light) 0%, var(--accent-light) 100%); border: 1px solid #A5D6A7; }
.col-no { background: linear-gradient(135deg, var(--sos-light) 0%, #FFCDD2 100%); border: 1px solid #EF9A9A; }
.col-head { padding: 7px 8px; display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.5); }
.col-ic { font-size: 14px; }
.col-tit { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.col-body { padding: 7px 8px; display: flex; flex-direction: column; gap: 5px; }
.col-item { font-size: 12px; color: var(--text-secondary); font-weight: 500; padding-left: 7px; position: relative; }
.col-item::before { content: '•'; position: absolute; left: 0; color: #9E9E9E; font-weight: 700; }

.emergency-section { display: flex; gap: 7px; margin: 0 10px 10px; }
.em-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 14px 8px; border-radius: 12px; cursor: pointer; transition: all 0.15s; }
.em-btn:active { transform: scale(0.95); }
.sos-em-btn { background: linear-gradient(135deg, var(--sos-dark) 0%, var(--sos) 100%); }
.loc-em-btn { background: linear-gradient(135deg, var(--water-dark) 0%, #42A5F5 100%); }
.contact-em-btn { background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); }
.em-icon { font-size: 23px; }
.em-text { font-size: 14px; font-weight: 700; color: #fff; }

.tips-list { display: flex; flex-direction: column; gap: 6px; }
.tip-item { display: flex; align-items: flex-start; gap: 7px; padding: 8px; background: var(--bg); border-radius: 8px; cursor: pointer; transition: all 0.15s; }
.tip-item:active { background: var(--primary-light); }
.tip-level { font-size: 19px; width: 24px; text-align: center; flex-shrink: 0; line-height: 1; }
.tip-high { color: var(--sos); }
.tip-medium { color: var(--warning); }
.tip-low { color: var(--success); }
.tip-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.tip-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.tip-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }

.health-tips { display: flex; flex-direction: column; gap: 6px; }
.ht-item { display: flex; align-items: center; gap: 7px; padding: 7px 8px; background: var(--success-light); border-radius: 4px; border-left: 2px solid var(--success); }
.ht-icon { font-size: 17px; flex-shrink: 0; }
.ht-text { font-size: 14px; color: var(--text-primary); font-weight: 500; line-height: 1.7; }

.bottom-space { height: 20px; }
</style>