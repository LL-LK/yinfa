<template>
  <div :class="['index', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="safety-bar" @click="goSafety">
      <span class="safety-emoji">{{ weatherEmoji }}</span>
      <span class="safety-text">{{ weather.condition || '多云' }} {{ weather.temp || '22°C' }}</span>
      <span class="safety-text2">桂林·银发宜居</span>
    </div>

    <div class="swiper-box">
      <div class="swiper">
        <div class="swiper-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div v-for="(img, idx) in bannerImages" :key="idx" class="swiper-item">
            <img :src="img" class="slide-image" />
            <span class="swiper-label">{{ bannerTexts[idx] }}</span>
          </div>
        </div>
      </div>
      <div class="swiper-dots">
        <span v-for="(_, idx) in bannerImages" :key="idx" :class="['dot', { active: currentSlide === idx }]" @click="currentSlide = idx" />
      </div>
    </div>

    <div class="module-grid">
      <div v-for="item in modules" :key="item.name" :class="['function-item', 'normal-item', item.themeClass]" @click="navigate(item.path, item.name)">
        <img :src="item.icon" class="function-icon-img" mode="aspectFit" />
        <span class="function-name">{{ item.name }}</span>
        <span class="function-sub">{{ item.sub }}</span>
      </div>
    </div>

    <div class="hot-section">
      <div class="section-header">
        <span class="section-title">🔥 热门推荐</span>
        <span class="section-more" @click="$router.push('/list')">更多</span>
      </div>
      <div class="hot-grid">
        <div v-for="item in hotProducts" :key="item.id" class="hot-item" @click="$router.push(`/details?id=${item.id}`)">
          <div class="hot-image-box">
            <img :src="item.image" class="hot-image" loading="lazy" />
            <span class="hot-tag" :style="{ background: item.tagColor }">{{ item.tag }}</span>
          </div>
          <span class="hot-name">{{ item.name }}</span>
          <div class="hot-bottom">
            <span class="hot-price">¥{{ item.price }}</span>
            <span class="hot-sold">起</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import IMAGES from '../utils/imageConfig'

const router = useRouter()
const appStore = useAppStore()

const TAG_COLORS = ['#ff6b35', '#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6']

const weather = ref({ condition: '晴', temp: '26°C' })
const currentSlide = ref(0)
let slideTimer: number | null = null

const weatherEmoji = computed(() => {
  const c = weather.value.condition
  if (c === '晴') return '☀️'
  if (c === '多云') return '⛅'
  if (c === '阴') return '☁️'
  if (c && c.indexOf('雨') >= 0) return '🌧️'
  return '🌤️'
})

const bannerImages = [IMAGES.b1, IMAGES.b2, IMAGES.b3]
const bannerTexts = ['桂林山水甲天下', '象鼻山', '阳朔西街']

const modules = [
  { name: '地图导览', sub: '实时定位', path: '/map', themeClass: 'map-themed', icon: IMAGES.mapIcon },
  { name: '桂林美食', sub: '银发推荐', path: '/food', themeClass: 'food-themed', icon: IMAGES.foodIcon },
  { name: '交通出行', sub: '出行无忧', path: '/transport', themeClass: 'transport-themed', icon: IMAGES.transportIcon },
  { name: '健康记录', sub: '每日监测', path: '/health', themeClass: 'health-themed', icon: IMAGES.healthIcon },
  { name: '紧急求助', sub: '一键呼救', path: '/emergency', themeClass: 'emergency-themed', icon: IMAGES.sosIcon },
  { name: '全部商品', sub: '一站购齐', path: '/cart', themeClass: 'cart-themed', icon: IMAGES.cartIcon },
  { name: '实时路况', sub: '路况查询', path: '/traffic', themeClass: 'traffic-themed', icon: IMAGES.trafficIcon },
  { name: '智能助手', sub: 'AI问答', path: '/assistant', themeClass: 'assistant-themed', icon: IMAGES.assistantIcon },
]

const hotProducts = [
  { id: 1, name: '漓江精华游船票', price: 215, image: IMAGES.b1, tag: '热门', tagColor: TAG_COLORS[0] },
  { id: 2, name: '象鼻山公园（免票）', price: 0, image: IMAGES.b2, tag: '免费', tagColor: TAG_COLORS[1] },
  { id: 3, name: '桂林米粉银发套餐', price: 15, image: IMAGES.food1, tag: '推荐', tagColor: TAG_COLORS[2] },
  { id: 4, name: '阳朔西街一日游', price: 158, image: IMAGES.b3, tag: '特惠', tagColor: TAG_COLORS[3] },
  { id: 5, name: '龙脊梯田观光', price: 80, image: IMAGES.C2, tag: '新品', tagColor: TAG_COLORS[4] },
  { id: 6, name: '两江四湖夜游', price: 185, image: IMAGES.c1, tag: '经典', tagColor: TAG_COLORS[5] },
]

function navigate(path: string, name: string) {
  appStore.speak(name)
  router.push(path)
}

function goSafety() {
  router.push('/safety')
  appStore.speak('安全防护')
}

onMounted(() => {
  slideTimer = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % bannerImages.length
  }, 4000)
})

onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer)
})
</script>

<style scoped>
.index {
  background: var(--bg);
  padding-bottom: 20px;
}

.safety-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #FFF8E7 0%, #E8F5E9 40%, #E8F4FD 100%);
}

.safety-emoji {
  font-size: 18px;
}

.safety-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.safety-text2 {
  font-size: 12px;
  color: var(--text-secondary);
}

.swiper-box {
  width: 100%;
  position: relative;
}

.swiper {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.swiper-track {
  display: flex;
  transition: transform 0.5s ease;
  height: 100%;
}

.swiper-item {
  min-width: 100%;
  position: relative;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.swiper-label {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
}

.swiper-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: #fff;
  width: 16px;
  border-radius: 3px;
}

.module-grid {
  display: flex;
  flex-wrap: wrap;
  background: var(--bg-card);
  margin: 10px;
  border-radius: 12px;
  padding: 6px;
  gap: 6px;
  box-shadow: var(--shadow-sm);
}

.function-item {
  position: relative;
  width: calc((100% - 18px) / 4);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 1px 6px;
  box-sizing: border-box;
  transition: all 0.15s;
  cursor: pointer;
}

.function-item:active {
  transform: scale(0.95);
}

.function-icon-img {
  width: 28px;
  height: 28px;
  margin-bottom: 3px;
}

.function-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.2;
}

.function-sub {
  font-size: 10px;
  color: var(--text-hint);
  text-align: center;
  margin-top: 1px;
  font-weight: 500;
}

/* 8个组件独立主题 */
.map-themed {
  background: linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%);
  border-radius: 8px;
  border-bottom: 2px solid #42A5F5;
}
.map-themed .function-name { color: #0D47A1; }
.map-themed .function-sub { color: #1565C0; }

.food-themed {
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE0B2 100%);
  border-radius: 8px;
  border-bottom: 2px solid #FF9800;
}
.food-themed .function-name { color: #BF360C; }
.food-themed .function-sub { color: #E65100; }

.transport-themed {
  background: linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: 8px;
  border-bottom: 2px solid #66BB6A;
}
.transport-themed .function-name { color: #1B5E20; }
.transport-themed .function-sub { color: #2E7D32; }

.health-themed {
  background: linear-gradient(180deg, #E0F2F1 0%, #B2DFDB 100%);
  border-radius: 8px;
  border-bottom: 2px solid #26A69A;
}
.health-themed .function-name { color: #004D40; }
.health-themed .function-sub { color: #00695C; }

.emergency-themed {
  background: linear-gradient(180deg, #FFEBEE 0%, #FFCDD2 100%);
  border-radius: 8px;
  border-bottom: 2px solid #EF5350;
}
.emergency-themed .function-name { color: #B71C1C; font-weight: 800; }
.emergency-themed .function-sub { color: #C62828; }

.cart-themed {
  background: linear-gradient(180deg, #F3E5F5 0%, #E1BEE7 100%);
  border-radius: 8px;
  border-bottom: 2px solid #AB47BC;
}
.cart-themed .function-name { color: #4A148C; }
.cart-themed .function-sub { color: #6A1B9A; }

.traffic-themed {
  background: linear-gradient(180deg, #FFF8E1 0%, #FFECB3 100%);
  border-radius: 8px;
  border-bottom: 2px solid #FFC107;
}
.traffic-themed .function-name { color: #F57F17; font-weight: 700; }
.traffic-themed .function-sub { color: #E65100; font-weight: 600; }

.assistant-themed {
  background: linear-gradient(180deg, #E8EAF6 0%, #C5CAE9 100%);
  border-radius: 8px;
  border-bottom: 2px solid #5C6BC0;
}
.assistant-themed .function-name { color: #283593; font-weight: 700; }
.assistant-themed .function-sub { color: #1A237E; font-weight: 600; }

.hot-section {
  margin: 0 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 4px;
}

.section-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-primary);
}

.section-more {
  font-size: 14px;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
}

.hot-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 2px 0;
}

.hot-item {
  width: calc(33.333% - 5px);
  background: var(--bg-card);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s;
  margin-bottom: 8px;
  cursor: pointer;
}

.hot-item:active {
  transform: scale(0.97);
  box-shadow: none;
}

.hot-image-box {
  position: relative;
  width: 100%;
  height: 90px;
  overflow: hidden;
  background: var(--border-light);
}

.hot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 2px 7px;
  border-radius: 2px;
  font-size: 10px;
  color: #fff;
  font-weight: 600;
}

.hot-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  padding: 7px 7px 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-bottom {
  display: flex;
  align-items: baseline;
  padding: 0 7px 8px;
}

.hot-price {
  font-size: 17px;
  font-weight: 700;
  color: var(--accent);
}

.hot-sold {
  font-size: 12px;
  color: var(--text-hint);
  margin-left: 2px;
}

.font-mode-large .module-grid { gap: 8px; padding: 8px; }
.font-mode-large .function-item { width: calc((100% - 8px) / 2); padding: 12px 4px 10px; }
.font-mode-large .function-icon-img { width: 36px; height: 36px; margin-bottom: 5px; }
.font-mode-large .function-name { font-size: 16px; }
.font-mode-large .function-sub { font-size: 12px; margin-top: 2px; }
</style>