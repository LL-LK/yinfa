<template>
  <div class="map-page">
    <h1>🗺️ 景区地图</h1>
    <p class="subtitle">查看桂林景区分布</p>
    <div class="map-placeholder">
      <p>🗺️</p>
      <p>Web端暂不支持地图组件</p>
      <p class="hint">请使用微信小程序查看完整地图功能</p>
    </div>
    <div class="scenic-list">
      <h3>🏞️ 主要景点</h3>
      <div class="scenic-item" v-for="spot in scenicSpots" :key="spot.name">
        <div class="scenic-icon">{{ spot.icon }}</div>
        <div class="scenic-info">
          <div class="scenic-name">{{ spot.name }}</div>
          <div class="scenic-desc">{{ spot.desc }}</div>
        </div>
        <div class="scenic-coords">{{ spot.coords }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const scenicSpots = [
  { name: '漓江风景名胜区', desc: '百里漓江，百里画廊', coords: '25.27°N, 110.29°E', icon: '🚢' },
  { name: '象鼻山公园', desc: '桂林城徽，象山水月', coords: '25.27°N, 110.29°E', icon: '🐘' },
  { name: '阳朔西街', desc: '中西文化交融古街', coords: '24.78°N, 110.49°E', icon: '🏮' },
  { name: '龙脊梯田', desc: '世界梯田原乡', coords: '25.75°N, 110.13°E', icon: '🌾' },
  { name: '两江四湖', desc: '城在景中，景在城中', coords: '25.27°N, 110.29°E', icon: '🌊' },
  { name: '芦笛岩', desc: '国宾洞，大自然艺术之宫', coords: '25.29°N, 110.26°E', icon: '🕯️' },
  { name: '杨堤码头', desc: '漓江精华段起点', coords: '25.03°N, 110.42°E', icon: '⛵' }
]
</script>

<style scoped>
.map-page { padding: 20px; max-width: 600px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 20px; }
.map-placeholder { text-align: center; padding: 60px 20px; color: #888; background: #f8f9fa; border-radius: 12px; margin-bottom: 20px; }
.map-placeholder p:first-child { font-size: 64px; margin-bottom: 16px; }
.hint { font-size: 12px; color: #bbb; margin-top: 8px; }
.scenic-list { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.scenic-list h3 { margin: 0 0 16px 0; font-size: 16px; color: #333; }
.scenic-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.scenic-item:last-child { border-bottom: none; }
.scenic-icon { font-size: 32px; width: 40px; text-align: center; }
.scenic-info { flex: 1; }
.scenic-name { font-size: 14px; font-weight: 600; color: #333; }
.scenic-desc { font-size: 12px; color: #999; margin-top: 2px; }
.scenic-coords { font-size: 11px; color: #bbb; white-space: nowrap; }
</style>
