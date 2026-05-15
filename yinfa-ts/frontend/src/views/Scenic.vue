<template>
  <div :class="['scenic', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner banner-sunrise">
      <span class="banner-icon">🏔️</span>
      <div>
        <span class="banner-title">桂林·景点导览</span>
        <span class="banner-desc">银发友好 · 精选推荐</span>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-scroll">
        <div class="filter-tabs">
          <div v-for="tab in tabs" :key="tab.key" :class="['filter-tab', { active: activeTab === tab.key }]" @click="switchTab(tab.key)">
            {{ tab.label }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-spinner">
      <div class="loading-ring"></div>
    </div>

    <div v-else class="sc-list">
      <div v-for="(item, index) in filteredList" :key="item.id" class="sc-card">
        <div class="sc-card-img-wrap">
          <img :src="item.image" class="sc-card-img" loading="lazy" />
          <div class="sc-level-badge">{{ item.level }}</div>
          <div class="sc-score-badge">⭐ {{ item.elderScore }}</div>
        </div>
        <div class="sc-card-body">
          <div class="sc-card-header">
            <span class="sc-name">{{ item.name }}</span>
            <div class="sc-price-row">
              <span v-if="item.price > 0" class="sc-price">¥{{ item.price }}</span>
              <span v-else class="sc-price free-tag">免费</span>
            </div>
          </div>
          <span class="sc-intro">{{ item.intro }}</span>
          <div class="sc-tags">
            <span v-if="item.walkDistance" class="sc-tag">🚶 {{ item.walkDistance }}</span>
            <span v-if="item.stairsCount" class="sc-tag">🪜 {{ item.stairsCount }}</span>
            <span v-if="item.restArea" class="sc-tag">🛋️ {{ item.restArea }}</span>
            <span class="sc-tag time-tag">⏱️ {{ item.time }}</span>
          </div>

          <div v-if="item.expanded" class="sc-detail-panel">
            <div class="sd-line">
              <span class="sd-label">开放时间</span><span class="sd-val">{{ item.hours }}</span>
            </div>
            <div class="sd-line">
              <span class="sd-label">交通方式</span><span class="sd-val">{{ item.transport }}</span>
            </div>
            <div class="sd-line sd-warning">
              <span class="sd-label">⚠️ 安全提示</span><span class="sd-val">{{ item.safetyTips }}</span>
            </div>
            <div class="sc-detail-actions">
              <div :class="['sc-fav-btn', { faved: item.isFavorited }]" @click="toggleFavorite(item)">
                <span>{{ item.isFavorited ? '❤️ 已收藏' : '🤍 收藏' }}</span>
              </div>
              <button class="btn-primary sc-go-btn" @click="$router.push(`/details?id=${item.id}`)">查看详情购票</button>
            </div>
          </div>

          <div class="sc-expand-btn" @click="toggleExpand(index)">
            <span>{{ item.expanded ? '收起详情 ▲' : '展开详情 ▼' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="qa-btn" @click="$router.push('/map')">
        <span class="qa-icon">🗺️</span>
        <span class="qa-text">景点地图</span>
      </div>
      <div class="qa-btn" @click="$router.push('/traffic')">
        <span class="qa-icon">🚌</span>
        <span class="qa-text">交通指南</span>
      </div>
      <div class="qa-btn" @click="$router.push('/food')">
        <span class="qa-icon">🍜</span>
        <span class="qa-text">周边美食</span>
      </div>
    </div>

    <div class="bottom-space"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import IMAGES from '../utils/imageConfig'

const appStore = useAppStore()
const loading = ref(false)
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: '5a', label: '5A景区' },
  { key: '4a', label: '4A景区' },
  { key: 'free', label: '免费' },
]

interface Spot {
  id: number; name: string; intro: string; image: string; elderScore: number;
  price: number; level: string; key: string; walkDistance: string;
  stairsCount: string; restArea: string; time: string; hours: string;
  transport: string; safetyTips: string; expanded: boolean; isFavorited: boolean;
}

const spots = ref<Spot[]>([
  {
    id: 1, name: '漓江风景名胜区', intro: '百里漓江，百里画廊，世界自然遗产中举世瞩目的璀璨明珠', image: IMAGES.b1,
    elderScore: 4.8, price: 215, level: '5A', key: '5a',
    walkDistance: '平坦', stairsCount: '少量台阶', restArea: '多处休息区', time: '3-4小时',
    hours: '08:00-18:00', transport: '公交车/租车/游船码头', safetyTips: '游船请穿好救生衣，甲板湿滑小心行走',
    expanded: false, isFavorited: false,
  },
  {
    id: 2, name: '象鼻山公园', intro: '桂林城徽，象山水月奇观，桂林山水的象征', image: IMAGES.b2,
    elderScore: 4.7, price: 0, level: '5A', key: 'free',
    walkDistance: '平坦', stairsCount: '无台阶', restArea: '每隔200米', time: '1-2小时',
    hours: '06:30-19:00', transport: '公交2/16/23路可达', safetyTips: '江边湿滑，请勿靠近水边',
    expanded: false, isFavorited: false,
  },
  {
    id: 3, name: '龙脊梯田', intro: '世界梯田原乡，四季如画，壮族瑶族文化瑰宝', image: IMAGES.scenicLongji,
    elderScore: 4.5, price: 80, level: '4A', key: '4a',
    walkDistance: '较陡', stairsCount: '较多台阶', restArea: '观景台有座椅', time: '2-3小时',
    hours: '07:00-17:30', transport: '专线车/包车从桂林出发', safetyTips: '山路较陡，建议乘坐景区接驳车',
    expanded: false, isFavorited: false,
  },
  {
    id: 4, name: '两江四湖', intro: '城在景中，景在城中，桂林环城水系精华', image: IMAGES.scenicLiangjiang,
    elderScore: 4.6, price: 185, level: '5A', key: '5a',
    walkDistance: '平坦', stairsCount: '少量台阶', restArea: '沿途多座椅', time: '1.5-2小时',
    hours: '08:00-21:30', transport: '步行/公交可达各码头', safetyTips: '夜游时请注意台阶和桥梁',
    expanded: false, isFavorited: false,
  },
  {
    id: 5, name: '阳朔西街', intro: '中西文化交融的千年古街，阳朔必打卡之地', image: IMAGES.b3,
    elderScore: 4.4, price: 0, level: '4A', key: 'free',
    walkDistance: '平坦石板路', stairsCount: '无台阶', restArea: '茶座咖啡馆众多', time: '1-3小时',
    hours: '全天开放', transport: '桂林-阳朔班车/自驾', safetyTips: '人多拥挤，注意保管随身物品',
    expanded: false, isFavorited: false,
  },
  {
    id: 6, name: '芦笛岩', intro: '国宾洞，大自然艺术之宫，86版西游记取景地', image: IMAGES.scenic3710,
    elderScore: 4.3, price: 60, level: '4A', key: '4a',
    walkDistance: '洞内平缓', stairsCount: '少量台阶', restArea: '入口有休息大厅', time: '1小时',
    hours: '08:00-17:30', transport: '公交3路/包车', safetyTips: '洞内湿滑，请勿触摸钟乳石',
    expanded: false, isFavorited: false,
  },
])

const filteredList = computed(() => {
  if (activeTab.value === 'all') return spots.value
  if (activeTab.value === 'free') return spots.value.filter(s => s.price === 0)
  return spots.value.filter(s => s.key === activeTab.value)
})

function switchTab(tab: string) {
  activeTab.value = tab
  appStore.speak(tab === 'all' ? '全部' : tabs.find(t => t.key === tab)?.label || '')
}

function toggleExpand(index: number) {
  const s = filteredList.value[index]
  if (s) {
    const original = spots.value.find(sp => sp.id === s.id)
    if (original) original.expanded = !original.expanded
  }
}

function toggleFavorite(item: Spot) {
  const original = spots.value.find(sp => sp.id === item.id)
  if (original) {
    original.isFavorited = !original.isFavorited
    appStore.speak(original.isFavorited ? '已收藏' : '已取消收藏')
  }
}
</script>

<style scoped>
.scenic { background: var(--bg); min-height: 100vh; padding-bottom: 20px; }

.banner { padding: 18px 15px; display: flex; align-items: center; gap: 10px; border-radius: 12px; margin: 10px; }
.banner-sunrise { background: linear-gradient(135deg, #D4A853 0%, #2E8B57 60%, #3A7CC3 100%); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.banner-icon { font-size: 23px; }
.banner-title { display: block; font-size: 19px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.banner-desc { display: block; font-size: 12px; opacity: 0.9; margin-top: 2px; color: #fff; }

.filter-bar { margin: 0 10px 8px; }
.filter-scroll { overflow-x: auto; white-space: nowrap; }
.filter-scroll::-webkit-scrollbar { display: none; }
.filter-tabs { display: inline-flex; gap: 6px; padding: 4px 2px; }
.filter-tab {
  display: inline-block; padding: 7px 16px; border-radius: 20px; font-size: 14px;
  font-weight: 600; color: var(--text-secondary); background: var(--bg-card);
  border: 1px solid var(--border); transition: all 0.15s; flex-shrink: 0; cursor: pointer;
}
.filter-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); box-shadow: var(--shadow-sm); }
.filter-tab:active { transform: scale(0.95); }

.sc-list { padding: 0 10px; }
.sc-card { background: var(--bg-card); border-radius: 12px; overflow: hidden; margin-bottom: 10px; box-shadow: var(--shadow-sm); transition: all 0.15s; }
.sc-card:active { transform: scale(0.99); }
.sc-card-img-wrap { position: relative; width: 100%; height: 160px; overflow: hidden; }
.sc-card-img { width: 100%; height: 100%; object-fit: cover; }
.sc-level-badge {
  position: absolute; top: 8px; left: 8px; font-size: 12px; font-weight: 700;
  color: #fff; background: linear-gradient(135deg, var(--gold), #FFA000);
  padding: 3px 10px; border-radius: 10px; box-shadow: var(--shadow-sm);
}
.sc-score-badge {
  position: absolute; top: 8px; right: 8px; font-size: 12px; font-weight: 700;
  color: #fff; background: rgba(0,0,0,0.5); padding: 3px 9px; border-radius: 10px;
}
.sc-card-body { padding: 10px 12px; }
.sc-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 5px; }
.sc-name { font-size: 19px; font-weight: 700; color: var(--text-primary); flex: 1; min-width: 0; }
.sc-price-row { flex-shrink: 0; }
.sc-price { font-size: 19px; font-weight: 700; color: var(--accent); }
.sc-price.free-tag { font-size: 14px; color: var(--success); background: var(--success-light); padding: 3px 9px; border-radius: 10px; font-weight: 700; font-size: 12px; }
.sc-intro { display: block; font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 7px; }
.sc-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 3px; }
.sc-tag { display: inline-flex; align-items: center; font-size: 12px; color: var(--text-hint); background: var(--cloud); padding: 3px 7px; border-radius: 2px; font-weight: 500; }
.sc-tag.time-tag { background: var(--primary-light); color: var(--primary-dark); font-weight: 600; }
.sc-expand-btn { text-align: center; padding: 8px 0 2px; cursor: pointer; }
.sc-expand-btn span { font-size: 12px; color: var(--primary); font-weight: 600; }

.sc-detail-panel { margin-top: 8px; padding: 10px; background: var(--bg); border-radius: 8px; animation: fadeIn 0.25s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.sd-line { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 6px; }
.sd-line:last-child { margin-bottom: 0; }
.sd-label { font-size: 14px; font-weight: 600; color: var(--text-primary); min-width: 70px; flex-shrink: 0; }
.sd-val { font-size: 14px; color: var(--text-secondary); line-height: 1.7; flex: 1; }
.sd-warning .sd-val { color: var(--warning-dark); font-weight: 500; }
.sd-warning .sd-label { color: var(--sos); }

.sc-detail-actions { display: flex; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--border-light); }
.sc-fav-btn { flex: 1; text-align: center; padding: 11px 8px; border-radius: 8px; font-size: 15px; font-weight: 600; background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); cursor: pointer; transition: all 0.15s; }
.sc-fav-btn.faved { background: var(--sos-light); color: var(--sos-dark); border-color: #EF9A9A; }
.sc-fav-btn:active { transform: scale(0.96); }
.sc-go-btn { flex: 2; font-size: 15px; padding: 11px 8px; }

.quick-actions { display: flex; gap: 8px; margin: 14px 10px 0; padding: 10px; background: var(--bg-card); border-radius: 12px; box-shadow: var(--shadow-sm); }
.qa-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 10px 6px; background: var(--primary-light); border-radius: 8px; cursor: pointer; transition: all 0.15s; }
.qa-btn:active { background: var(--primary); transform: scale(0.95); }
.qa-btn:active .qa-text { color: #fff; }
.qa-icon { font-size: 19px; }
.qa-text { font-size: 12px; font-weight: 600; color: var(--primary-dark); }

.bottom-space { height: 20px; }
</style>