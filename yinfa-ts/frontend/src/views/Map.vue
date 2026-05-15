<template>
  <div :class="['map-page', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner">
      <span class="banner-icon">🗺️</span>
      <div>
        <div class="banner-title">景区地图</div>
        <div class="banner-desc">查看桂林景区分布</div>
      </div>
    </div>

    <div class="map-placeholder">
      <div class="map-canvas">
        <div class="map-grid">
          <div
            v-for="spot in scenicSpots"
            :key="spot.name"
            class="map-pin"
            :style="{ left: spot.pos[0] + '%', top: spot.pos[1] + '%' }"
            @click="selectedSpot = spot"
          >
            <span class="pin-icon">{{ spot.icon }}</span>
            <span class="pin-label">{{ spot.name }}</span>
          </div>
        </div>
        <div class="map-watermark">桂林景区分布图</div>
      </div>
    </div>

    <div v-if="selectedSpot" class="spot-detail card">
      <div class="spot-header">
        <span class="spot-icon-lg">{{ selectedSpot.icon }}</span>
        <div>
          <div class="spot-name">{{ selectedSpot.name }}</div>
          <div class="spot-level">{{ selectedSpot.level }}景区</div>
        </div>
      </div>
      <div class="spot-desc">{{ selectedSpot.desc }}</div>
      <div class="spot-coords">📍 {{ selectedSpot.coords }}</div>
      <button class="btn-primary" style="width:100%;margin-top:10px;" @click="$router.push('/scenic')">
        查看景点详情
      </button>
    </div>

    <div class="scenic-list">
      <div class="section-title">🏞️ 主要景点</div>
      <div
        v-for="spot in scenicSpots"
        :key="spot.name"
        class="scenic-item"
        @click="selectedSpot = spot"
      >
        <div class="scenic-icon">{{ spot.icon }}</div>
        <div class="scenic-info">
          <div class="scenic-name">{{ spot.name }}</div>
          <div class="scenic-desc">{{ spot.desc }}</div>
        </div>
        <div class="scenic-badge">{{ spot.level }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const selectedSpot = ref<any>(null)

const scenicSpots = [
  { name: '漓江风景名胜区', desc: '百里漓江，百里画廊', coords: '25.27°N, 110.29°E', icon: '🚢', level: '5A', pos: [55, 40] },
  { name: '象鼻山公园', desc: '桂林城徽，象山水月', coords: '25.27°N, 110.29°E', icon: '🐘', level: '5A', pos: [48, 45] },
  { name: '阳朔西街', desc: '中西文化交融古街', coords: '24.78°N, 110.49°E', icon: '🏮', level: '4A', pos: [65, 58] },
  { name: '龙脊梯田', desc: '世界梯田原乡', coords: '25.75°N, 110.13°E', icon: '🌾', level: '4A', pos: [35, 25] },
  { name: '两江四湖', desc: '城在景中，景在城中', coords: '25.27°N, 110.29°E', icon: '🌊', level: '5A', pos: [50, 42] },
  { name: '芦笛岩', desc: '国宾洞，大自然艺术之宫', coords: '25.29°N, 110.26°E', icon: '🕯️', level: '4A', pos: [42, 38] },
  { name: '杨堤码头', desc: '漓江精华段起点', coords: '25.03°N, 110.42°E', icon: '⛵', level: '-', pos: [58, 50] },
  { name: '银子岩', desc: '世界岩溶艺术宝库', coords: '24.55°N, 110.40°E', icon: '💎', level: '4A', pos: [70, 65] }
]
</script>

<style scoped>
.map-page { background: var(--bg); min-height: 100vh; }

.map-placeholder { padding: 0 16px; margin-bottom: 12px; }
.map-canvas {
  position: relative; width: 100%; height: 280px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
  border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md);
}
.map-grid { width: 100%; height: 100%; position: relative; }
.map-pin {
  position: absolute; transform: translate(-50%, -50%); cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  transition: transform 0.2s;
}
.map-pin:hover { transform: translate(-50%, -50%) scale(1.2); z-index: 2; }
.pin-icon { font-size: 24px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2)); }
.pin-label {
  font-size: 9px; color: #333; background: rgba(255,255,255,0.85);
  padding: 1px 6px; border-radius: 6px; white-space: nowrap;
  font-weight: 600; backdrop-filter: blur(4px);
}
.map-watermark {
  position: absolute; bottom: 10px; right: 12px;
  font-size: 11px; color: rgba(0,0,0,0.25); font-weight: 600;
}

.spot-detail { margin: 0 16px 12px; padding: 16px; }
.spot-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.spot-icon-lg { font-size: 32px; }
.spot-name { font-size: var(--font-lg); font-weight: 700; color: var(--text-primary); }
.spot-level { font-size: var(--font-xs); color: var(--accent); font-weight: 600; }
.spot-desc { font-size: var(--font-sm); color: var(--text-secondary); margin-bottom: 6px; }
.spot-coords { font-size: var(--font-xs); color: var(--text-hint); font-family: monospace; }

.scenic-list { padding: 0 16px 16px; }
.scenic-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.15s; }
.scenic-item:hover { background: rgba(46,139,87,0.03); }
.scenic-item:last-child { border-bottom: none; }
.scenic-icon { font-size: 28px; width: 40px; text-align: center; }
.scenic-info { flex: 1; }
.scenic-name { font-size: var(--font-md); font-weight: 600; color: var(--text-primary); }
.scenic-desc { font-size: var(--font-xs); color: var(--text-hint); }
.scenic-badge {
  font-size: 11px; padding: 2px 8px; border-radius: 4px;
  background: rgba(46,139,87,0.1); color: var(--primary); font-weight: 600;
}
</style>