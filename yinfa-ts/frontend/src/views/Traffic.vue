<template>
  <div :class="['traffic', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner">
      <span class="banner-icon">🚦</span>
      <div class="banner-info">
        <span class="banner-title">实时路况</span>
        <span class="banner-desc">桂林市区交通快报 · {{ lastUpdate }}更新</span>
      </div>
    </div>

    <div class="road-list">
      <div
        v-for="road in roads"
        :key="road.name"
        :class="['road-item', 'road-' + road.status]"
      >
        <div :class="['road-status-dot', road.status + '-dot']"></div>
        <div class="road-info">
          <div class="road-name-row">
            <span class="road-name">{{ road.name }}</span>
            <span :class="['road-status-tag', road.status + '-tag']">{{ road.statusText }}</span>
          </div>
          <span class="road-detail">{{ road.from }} → {{ road.to }}</span>
          <div class="road-metrics">
            <span class="metric">{{ road.speed }} km/h</span>
            <span class="metric-sep">|</span>
            <span class="metric">{{ road.duration }} 分钟</span>
            <span class="metric-sep">|</span>
            <span class="metric">{{ road.distanceText }}</span>
          </div>
          <span class="road-extra">{{ road.detail }}</span>
        </div>
        <span class="road-nav-arrow">导航</span>
      </div>
    </div>

    <div class="tips-section">
      <span class="tips-title">💡 出行建议</span>
      <div class="tips-grid">
        <div v-for="(tip, idx) in trafficTips" :key="idx" class="tl-item">
          <span class="tl-icon">{{ tip.icon }}</span>
          <span class="tl-text">{{ tip.text }}</span>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bb-btn" @click="loadTraffic">
        <span class="bb-icon">🔄</span>
        <span>刷新路况</span>
      </div>
      <div class="bb-btn bb-btn-primary" @click="$router.push('/transport')">
        <span>← 返回交通出行</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const lastUpdate = ref('10:30')

const roads = [
  { name: '中山中路', status: 'smooth', statusText: '畅通', from: '南门桥', to: '十字街', speed: 42, duration: 8, distanceText: '3.2km', detail: '双向畅通无拥堵' },
  { name: '解放东路', status: 'slow', statusText: '缓行', from: '十字街', to: '解放桥', speed: 22, duration: 12, distanceText: '2.6km', detail: '东向西车流量较大' },
  { name: '漓江路', status: 'congested', statusText: '拥堵', from: '甲天下广场', to: '三里店', speed: 14, duration: 18, distanceText: '3.0km', detail: '多处信号灯路口排队' },
  { name: '机场路', status: 'smooth', statusText: '畅通', from: '桂林市区', to: '两江机场', speed: 68, duration: 25, distanceText: '28km', detail: '全程高速畅通' },
  { name: '滨江路', status: 'slow', statusText: '缓行', from: '伏波山', to: '象鼻山', speed: 25, duration: 10, distanceText: '2.8km', detail: '景区周边车流密集' },
]

const trafficTips = [
  { icon: '🚗', text: '早晚高峰(7:30-9:00, 17:30-19:00)市区主要道路较为拥堵' },
  { icon: '🏥', text: '景区周边停车位紧张，建议乘坐公共交通前往' },
  { icon: '🌧️', text: '雨天路面湿滑，请减速慢行，保持安全车距' },
  { icon: '🅿️', text: '市中心停车场较少，可导航至百货大楼停车场' },
  { icon: '🚌', text: '建议乘坐旅游专线巴士前往龙脊、阳朔等远郊景区' },
  { icon: '📱', text: '使用高德地图/百度地图可查看实时路况和导航' },
]

function loadTraffic() {
  appStore.speak('刷新路况')
}
</script>

<style scoped>
.traffic { background: var(--bg); min-height: 100vh; padding-bottom: 20px; }

.banner {
  background: linear-gradient(135deg, #1a237e 0%, #283593 40%, #3949ab 100%);
  padding: 18px 15px; display: flex; align-items: center;
}
.banner-icon { font-size: 23px; margin-right: 10px; }
.banner-info { flex: 1; }
.banner-title { display: block; font-size: 19px; font-weight: 700; color: #fff; }
.banner-desc { display: block; font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 2px; }

.road-list { padding: 10px; }
.road-item {
  display: flex; align-items: flex-start; gap: 8px;
  background: var(--bg-card); border-radius: 8px; padding: 12px;
  margin-bottom: 8px; box-shadow: var(--shadow-sm);
  transition: all 0.15s; border-left: 3px solid transparent; cursor: pointer;
}
.road-item:active { transform: scale(0.98); }
.road-smooth { border-left-color: #4CAF50; }
.road-slow { border-left-color: #FFC107; }
.road-congested { border-left-color: #FF5722; }
.road-blocked { border-left-color: #D32F2F; }

.road-status-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
.smooth-dot { background: #4CAF50; }
.slow-dot { background: #FFC107; }
.congested-dot { background: #FF5722; }
.blocked-dot { background: #D32F2F; }

.road-info { flex: 1; min-width: 0; }
.road-name-row { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.road-name { font-size: 17px; font-weight: 700; color: var(--text-primary); }
.road-status-tag { padding: 2px 7px; border-radius: 2px; font-size: 11px; font-weight: 700; }
.smooth-tag { background: #E8F5E9; color: #2E7D32; }
.slow-tag { background: #FFF8E1; color: #F57F17; }
.congested-tag { background: #FBE9E7; color: #BF360C; }
.blocked-tag { background: #FFEBEE; color: #B71C1C; }

.road-detail { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
.road-metrics { display: flex; align-items: center; gap: 4px; margin-bottom: 3px; }
.metric { font-size: 14px; font-weight: 600; color: var(--primary-dark); }
.metric-sep { color: var(--border); font-size: 12px; }
.road-extra { display: block; font-size: 12px; color: var(--text-hint); line-height: 1.7; }
.road-nav-arrow { font-size: 14px; color: var(--primary); font-weight: 600; flex-shrink: 0; margin-top: 3px; }

.tips-section { padding: 0 10px 10px; }
.tips-title { display: block; font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; padding-left: 4px; }
.tips-grid { display: flex; flex-wrap: wrap; gap: 5px; }
.tl-item { flex: 1; min-width: calc(50% - 5px); background: var(--bg-card); padding: 8px 9px; border-radius: 4px; box-shadow: var(--shadow-sm); display: flex; align-items: flex-start; gap: 5px; }
.tl-icon { font-size: 14px; flex-shrink: 0; }
.tl-text { font-size: 12px; font-weight: 500; color: var(--text-primary); line-height: 1.7; }

.bottom-bar { display: flex; gap: 8px; margin: 0 10px 10px; }
.bb-btn { flex: 1; text-align: center; padding: 12px; background: var(--bg-card); border-radius: 8px; font-size: 15px; font-weight: 600; color: var(--text-primary); box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; transition: all 0.15s; }
.bb-btn:active { transform: scale(0.97); background: var(--primary-light); }
.bb-btn-primary { background: var(--primary); color: #fff; }
.bb-btn-primary:active { background: var(--primary-dark); }
.bb-icon { font-size: 15px; }
</style>