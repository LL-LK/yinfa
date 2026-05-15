<template>
  <div :class="['search-page', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner">
      <span class="banner-icon">🔍</span>
      <div>
        <div class="banner-title">搜索</div>
        <div class="banner-desc">搜索商品、景点、美食</div>
      </div>
    </div>

    <div class="search-bar">
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="搜索商品、景点"
        @keyup.enter="doSearch"
        autofocus
      />
      <button class="search-btn" @click="doSearch">搜索</button>
    </div>

    <div v-if="!hasSearched" class="search-body">
      <div v-if="searchHistory.length > 0" class="section">
        <div class="section-header">
          <span class="section-title-sm">🔍 搜索历史</span>
          <span class="clear-btn" @click="searchHistory = []">清空</span>
        </div>
        <div class="tags">
          <span
            v-for="(tag, idx) in searchHistory"
            :key="idx"
            class="tag"
            @click="keyword = tag; doSearch()"
          >{{ tag }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title-sm">🔥 热门搜索</div>
        <div class="tags">
          <span v-for="tag in hotTags" :key="tag" class="tag hot" @click="keyword = tag; doSearch()">{{ tag }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title-sm">📋 分类搜索</div>
        <div class="tags">
          <span v-for="cat in categories" :key="cat.name" class="tag cat" @click="$router.push({ path: cat.path })">{{ cat.name }}</span>
        </div>
      </div>
    </div>

    <div v-else class="results">
      <div v-if="searching" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">搜索中...</div>
      </div>

      <div v-else-if="results.length === 0" class="empty-state">
        <span class="empty-icon">🔎</span>
        <div class="empty-title">未找到相关内容</div>
        <div class="empty-desc">请尝试其他关键词</div>
      </div>

      <div v-else class="result-list">
        <div
          v-for="item in results"
          :key="item.id"
          class="result-item"
          @click="$router.push(`/details?id=${item.id}`)"
        >
          <img :src="getImageUrl(item.image_url || item.image)" :alt="item.name" class="result-image" />
          <div class="result-info">
            <div class="result-name">{{ item.name }}</div>
            <div class="result-desc" v-if="item.description">{{ item.description }}</div>
            <div class="result-price">¥{{ item.price }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import api, { getImageUrl } from '../utils/api'

const appStore = useAppStore()

const keyword = ref('')
const hasSearched = ref(false)
const searching = ref(false)
const results = ref<any[]>([])

const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('searchHistory') || '[]'))
const hotTags = ['漓江', '桂林米粉', '阳朔', '龙脊梯田', '门票', '啤酒鱼']

const categories = [
  { name: '景点导览', path: '/scenic' },
  { name: '美食推荐', path: '/food' },
  { name: '商品分类', path: '/category' },
  { name: '交通接送', path: '/transport' }
]

async function doSearch() {
  if (!keyword.value.trim()) return
  hasSearched.value = true
  searching.value = true

  const kw = keyword.value.trim()
  if (!searchHistory.value.includes(kw)) {
    searchHistory.value.unshift(kw)
    if (searchHistory.value.length > 10) searchHistory.value.pop()
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }

  try {
    const res = await api.get('/products', { params: { query: kw } })
    const data = Array.isArray(res) ? res : (res as any)?.data || []
    results.value = Array.isArray(data) ? data : []

    if (kw.includes('漓江') || kw.includes('景点')) {
      results.value.push(
        { id: 100, name: '漓江景区门票', price: 80, image_url: '/image/b1.jpg', description: '5A景区·百里漓江百里画廊' }
      )
    }
    if (kw.includes('米粉') || kw.includes('美食') || kw.includes('桂林')) {
      results.value.push(
        { id: 101, name: '桂林米粉', price: 12, image_url: '/image/food-icon.webp', description: '卤水香浓·桂林人的早餐灵魂' }
      )
    }
  } catch (e) {
    results.value = []
  } finally {
    searching.value = false
  }
}
</script>

<style scoped>
.search-page { background: var(--bg); min-height: 100vh; }

.search-bar {
  display: flex; gap: 8px; padding: 12px 16px; background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}
.search-input {
  flex: 1; padding: 10px 16px; background: var(--bg-input);
  border-radius: var(--radius-xl); font-size: var(--font-md);
}
.search-btn {
  padding: 10px 20px; background: var(--primary); color: #fff;
  border-radius: var(--radius-xl); font-size: var(--font-md); font-weight: 600;
}

.search-body { padding: 16px; }
.section { margin-bottom: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.section-title-sm { font-size: var(--font-md); font-weight: 700; color: var(--text-primary); }
.clear-btn { font-size: var(--font-xs); color: var(--text-hint); cursor: pointer; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag {
  padding: 6px 14px; background: var(--bg-input); border-radius: var(--radius-xl);
  font-size: var(--font-sm); color: var(--text-secondary); cursor: pointer;
  transition: all var(--transition-fast);
}
.tag:hover { background: var(--border-light); }
.tag.hot { background: rgba(255,107,53,0.08); color: var(--accent); }
.tag.cat { background: rgba(46,139,87,0.06); color: var(--primary); }

.results { padding: 0 16px 16px; }
.result-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.result-item {
  display: flex; gap: 12px; padding: 12px; background: var(--bg-card);
  border-radius: var(--radius-md); cursor: pointer;
  transition: transform var(--transition-fast);
}
.result-item:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.result-image { width: 80px; height: 80px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0; }
.result-info { flex: 1; }
.result-name { font-size: var(--font-md); font-weight: 600; color: var(--text-primary); }
.result-desc { font-size: var(--font-xs); color: var(--text-hint); margin: 2px 0; }
.result-price { font-size: var(--font-lg); font-weight: 700; color: var(--accent); }
</style>