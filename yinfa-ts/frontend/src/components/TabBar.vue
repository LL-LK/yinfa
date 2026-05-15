<template>
  <div class="tab-bar">
    <template v-for="(item, index) in tabs" :key="index">
      <div
        class="tab-item"
        @click="switchTab(index, item.path)"
      >
        <img
          :src="currentIndex === index ? item.activeIcon : item.icon"
          class="tab-icon"
          :alt="item.text"
        />
        <span
          class="tab-label"
          :class="{ 'tab-active': currentIndex === index }"
          :style="{ color: currentIndex === index ? selectedColor : color }"
        >
          {{ item.text }}
        </span>
      </div>
      <div v-if="index === 1" class="tab-deco">
        <img :src="decoIcon" class="tab-deco-icon" alt="" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import IMAGES from '../utils/imageConfig'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const color = '#999999'
const selectedColor = '#2E8B57'
const decoIcon = IMAGES.tabbar.centerDeco

const tabs = [
  { path: '/', text: '首页', icon: IMAGES.tabbar.home, activeIcon: IMAGES.tabbar.homeActive },
  { path: '/scenic', text: '景点导览', icon: IMAGES.tabbar.scenic, activeIcon: IMAGES.tabbar.scenicActive },
  { path: '/safety', text: '安全防护', icon: IMAGES.tabbar.safety, activeIcon: IMAGES.tabbar.safetyActive },
  { path: '/user', text: '个人中心', icon: IMAGES.tabbar.user, activeIcon: IMAGES.tabbar.userActive },
]

const tabPathMap: Record<string, number> = {
  '/': 0, '/scenic': 1, '/safety': 2, '/user': 3
}

const currentIndex = ref(0)

watch(() => route.path, (path) => {
  if (path in tabPathMap) {
    currentIndex.value = tabPathMap[path]
  }
}, { immediate: true })

function switchTab(index: number, path: string) {
  if (currentIndex.value === index) return
  appStore.speak(tabs[index].text)
  currentIndex.value = index
  router.push(path)
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 50px;
  background: linear-gradient(180deg, rgba(46,139,87,0.18) 0%, rgba(253,255,252,1) 25%, rgba(255,255,255,1) 60%);
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -1px 10px rgba(0,0,0,0.06);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid rgba(46,139,87,0.12);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2px 0;
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.tab-deco {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 100%;
  position: relative;
  z-index: 0;
}

.tab-deco-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-shadow: 0 1px 6px rgba(46,139,87,0.15);
  opacity: 0.85;
}

.tab-icon {
  width: 22px;
  height: 22px;
  margin-bottom: 1px;
}

.tab-label {
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
}

.tab-active {
  font-weight: 700;
}
</style>