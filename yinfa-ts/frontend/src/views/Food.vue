<template>
  <div :class="['food', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner banner-sunrise">
      <span class="banner-icon">🍜</span>
      <div>
        <span class="banner-title">桂林美食</span>
        <span class="banner-desc">地道风味·老人友好推荐</span>
      </div>
    </div>

    <div class="featured">
      <div v-for="(item, idx) in featured" :key="idx" class="ft-item">
        <span class="ft-badge">{{ item.badge }}</span>
        <span class="ft-name">{{ item.name }}</span>
        <span class="ft-sub">{{ item.sub }}</span>
      </div>
    </div>

    <div class="food-list">
      <div
        v-for="(item, index) in foods"
        :key="item.id"
        :class="['food-item', { selected: item.expanded }]"
        @click="selectFood(index)"
      >
        <img :src="item.image" class="fi-img" loading="lazy" />
        <div class="fi-info">
          <div class="fi-name-row">
            <span class="fi-name">{{ item.name }}</span>
            <span class="fi-badge">{{ item.type }}</span>
          </div>
          <span class="fi-price">¥{{ item.price }}起</span>
          <span class="fi-score">⭐{{ item.score }}</span>
        </div>
        <div v-if="item.expanded" class="fi-expand">
          <span class="fi-desc">{{ item.desc }}</span>
          <span class="fi-addr">📍 {{ item.address }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import IMAGES from '../utils/imageConfig'

const appStore = useAppStore()

const featured = [
  { badge: 'TOP1', name: '桂林米粉', sub: '银发推荐' },
  { badge: 'TOP2', name: '阳朔啤酒鱼', sub: '必尝' },
  { badge: 'TOP3', name: '荔浦芋扣肉', sub: '特色' },
]

const foods = ref([
  { id: 1, name: '桂林米粉·卤菜粉', type: '米粉', price: 15, score: 4.8, image: IMAGES.food1, desc: '桂林最具代表性的美食，卤水香浓，米粉爽滑，配上锅烧、牛肉、酸豆角等配料，老少皆宜，是银发游客的最佳选择', address: '桂林市中山中路·崇善米粉总店', expanded: false },
  { id: 2, name: '阳朔啤酒鱼', type: '河鲜', price: 88, score: 4.7, image: IMAGES.food2, desc: '阳朔特色名菜，选用漓江鲜鱼配以啤酒烹制，鱼肉鲜嫩无腥味，汤汁浓郁下饭', address: '阳朔西街·大师傅啤酒鱼', expanded: false },
  { id: 3, name: '荔浦芋扣肉', type: '扣肉', price: 58, score: 4.6, image: IMAGES.food5, desc: '桂林传统名菜，选用荔浦芋头与五花肉层层相扣，芋香肉烂，入口即化，软糯不油腻', address: '桂林市解放西路·金龙寨', expanded: false },
  { id: 4, name: '恭城油茶', type: '茶点', price: 10, score: 4.5, image: IMAGES.food3, desc: '少数民族特色饮品，以茶叶、生姜、大蒜捶打而成，暖胃驱寒，配上炒米、花生，风味独特', address: '恭城县城·油茶小镇', expanded: false },
  { id: 5, name: '尼姑素面', type: '素食', price: 18, score: 4.4, image: IMAGES.food4, desc: '桂林特色素食，面条筋道，汤清味鲜，配以各种素菜浇头，清淡健康，适合老人食用', address: '桂林市榕湖南路·素面馆', expanded: false },
])

function selectFood(index: number) {
  const food = foods.value[index]
  foods.value.forEach(f => f.expanded = false)
  foods.value[index].expanded = !foods.value[index].expanded
  if (foods.value[index].expanded) {
    appStore.speak(food.name + '：¥' + food.price + '起')
  }
}
</script>

<style scoped>
.food { background: var(--bg); min-height: 100vh; padding-bottom: 20px; }

.banner { padding: 18px 15px; display: flex; align-items: center; gap: 10px; border-radius: 12px; margin: 10px; }
.banner-sunrise { background: linear-gradient(135deg, #D4A853 0%, #2E8B57 60%, #3A7CC3 100%); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.banner-icon { font-size: 23px; }
.banner-title { display: block; font-size: 19px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.banner-desc { display: block; font-size: 12px; opacity: 0.9; margin-top: 2px; color: #fff; }

.featured { display: flex; margin: 8px 10px; gap: 6px; }
.ft-item {
  flex: 1; background: var(--bg-card); border-radius: 8px; padding: 10px 6px;
  display: flex; flex-direction: column; align-items: center;
  box-shadow: var(--shadow-sm); position: relative; cursor: pointer;
  transition: all 0.15s;
}
.ft-item:active { background: var(--bg-hover); transform: scale(0.97); }
.ft-badge { position: absolute; top: 3px; right: 4px; font-size: 12px; background: var(--accent); color: #fff; padding: 1px 5px; border-radius: 10px; font-weight: 700; }
.ft-name { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.ft-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

.food-list { padding: 0 10px; }
.food-item {
  display: flex; flex-wrap: wrap; background: var(--bg-card);
  border-radius: 8px; overflow: hidden; margin-bottom: 8px;
  box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.15s;
}
.food-item.selected { box-shadow: var(--shadow-md); border: 1px solid var(--accent-light); }
.fi-img { width: 100px; height: 80px; flex-shrink: 0; object-fit: cover; background: var(--border-light); }
.fi-info { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
.fi-name-row { display: flex; align-items: center; gap: 6px; }
.fi-name { font-size: 17px; font-weight: 700; color: var(--text-primary); }
.fi-badge { font-size: 12px; padding: 2px 7px; background: var(--primary-light); color: var(--primary); border-radius: 10px; font-weight: 600; }
.fi-price { font-size: 19px; font-weight: 700; color: var(--accent); }
.fi-score { font-size: 14px; color: var(--text-secondary); }

.fi-expand {
  width: 100%; padding: 10px 12px; background: var(--bg);
  border-top: 1px solid var(--border-light); animation: foodFadeIn 0.25s ease;
}
@keyframes foodFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.fi-desc { display: block; font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 6px; }
.fi-addr { display: block; font-size: 14px; color: var(--text-hint); }
</style>