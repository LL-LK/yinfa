<template>
  <div class="search">
    <div class="search-header">
      <div class="search-box">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索商品、景点"
          @keyup.enter="doSearch"
          class="search-input"
        />
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>
    </div>

    <div v-if="!hasSearched" class="hot-searches">
      <div v-if="searchHistory.length > 0" class="history-section">
        <h3>🔍 搜索历史</h3>
        <div class="tags">
          <span v-for="(tag, idx) in searchHistory" :key="idx"
                class="tag history-tag"
                @click="searchTag(tag)">
            {{ tag }}
          </span>
          <span class="tag clear-btn" @click="clearHistory">清除历史</span>
        </div>
      </div>
      <h3>🔥 热门搜索</h3>
      <div class="tags">
        <span v-for="tag in hotTags" :key="tag"
              class="tag"
              @click="searchTag(tag)">
          {{ tag }}
        </span>
      </div>
    </div>

    <div v-else class="results">
      <div v-if="loading" class="loading">搜索中...</div>
      <div v-else-if="results.length === 0" class="no-results">
        <p>😔 未找到\"{{ keyword }}\"相关商品</p>
        <p class="hint">试试这些热门商品</p>
        <div class="recommend-list">
          <div class="result-item" v-for="item in hotProducts" :key="item.id">
            <router-link :to="`/details?id=${item.id}`">
              <div class="result-image">
                <img :src="getImageUrl(item.image_url)" :alt="item.name" loading="lazy" />
              </div>
              <div class="result-info">
                <div class="result-name">{{ item.name }}</div>
                <div class="result-price">¥{{ item.price }}</div>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <div class="filter-bar" v-if="results.length > 0">
        <button :class="{ active: priceFilter === 'all' }" @click="priceFilter = 'all'">全部价格</button>
        <button :class="{ active: priceFilter === '0-100' }" @click="priceFilter = '0-100'">0-100</button>
        <button :class="{ active: priceFilter === '100-300' }" @click="priceFilter = '100-300'">100-300</button>
        <button :class="{ active: priceFilter === '300+' }" @click="priceFilter = '300+'">300+</button>
      </div>

      <div class="result-list" v-if="filteredResults.length > 0">
        <div class="result-item" v-for="item in filteredResults" :key="item.id">
          <router-link :to="`/details?id=${item.id}`">
            <div class="result-image">
              <img :src="getImageUrl(item.image_url)" :alt="item.name" loading="lazy" />
            </div>
            <div class="result-info">
              <div class="result-name">{{ item.name }}</div>
              <div class="result-tag" v-if="item.category">{{ item.category.name }}</div>
              <div class="result-price">¥{{ item.price }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import api, { getImageUrl } from '../utils/api'

const keyword = ref('')
const hasSearched = ref(false)
const loading = ref(false)
const results = ref<any[]>([])
const hotProducts = ref<any[]>([])
const priceFilter = ref('all')

const hotTags = ['漓江', '阳朔', '米粉', '龙脊梯田', '西街', '象鼻山']

const searchHistory = ref<string[]>(
  JSON.parse(localStorage.getItem('searchHistory') || '[]')
)

const filteredResults = computed(() => {
  if (priceFilter.value === 'all') return results.value
  if (priceFilter.value === '0-100') return results.value.filter(p => p.price <= 100)
  if (priceFilter.value === '100-300') return results.value.filter(p => p.price > 100 && p.price <= 300)
  if (priceFilter.value === '300+') return results.value.filter(p => p.price > 300)
  return results.value
})

function saveHistory(kw: string) {
  const h = searchHistory.value.filter(h => h !== kw)
  h.unshift(kw)
  searchHistory.value = h.slice(0, 5)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

function clearHistory() {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

async function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) return

  hasSearched.value = true
  loading.value = true
  saveHistory(kw)

  try {
    const res = await api.get('/products', { params: { search: kw } })
    results.value = res.data || []
  } catch (e) {
    results.value = []
  } finally {
    loading.value = false
  }
}

function searchTag(tag: string) {
  keyword.value = tag
  doSearch()
}
</script>

<style scoped>
.search {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}
.search-header { padding: 12px 16px; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.search-box { display: flex; gap: 8px; }
.search-input { flex: 1; padding: 10px 16px; border: 1px solid #ddd; border-radius: 20px; font-size: 14px; outline: none; }
.search-input:focus { border-color: #ff6b00; }
.search-btn { padding: 10px 20px; background-color: #ff6b00; color: #fff; border: none; border-radius: 20px; font-size: 14px; cursor: pointer; }
.search-btn:hover { opacity: 0.9; }
.hot-searches { padding: 20px 16px; }
.hot-searches h3 { margin: 0 0 12px 0; font-size: 16px; color: #333; }
.history-section { margin-bottom: 20px; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { padding: 6px 12px; background-color: #f5f5f5; border-radius: 16px; font-size: 14px; color: #666; cursor: pointer; transition: all 0.2s; }
.tag:hover { background-color: #ff6b00; color: #fff; }
.clear-btn { background: #fff; border: 1px solid #ddd; color: #999; font-size: 12px; }
.clear-btn:hover { background: #eee; color: #666; }
.results { padding: 16px; }
.loading { text-align: center; padding: 40px 0; color: #888; }
.no-results { text-align: center; padding: 40px 0; color: #999; font-size: 14px; }
.hint { font-size: 12px; color: #bbb; margin: 8px 0; }
.recommend-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.filter-bar { display: flex; gap: 8px; margin-bottom: 12px; }
.filter-bar button {
  padding: 4px 12px; border: 1px solid #ddd; border-radius: 12px;
  background: #fff; color: #666; font-size: 12px; cursor: pointer;
}
.filter-bar button.active { background: #ff6b00; color: #fff; border-color: #ff6b00; }
.result-list { display: flex; flex-direction: column; gap: 12px; }
.result-item { background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.result-item a { text-decoration: none; color: inherit; display: flex; gap: 12px; padding: 12px; }
.result-image { width: 80px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background-color: #f5f5f5; }
.result-image img { width: 100%; height: 100%; object-fit: cover; }
.result-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.result-name { font-size: 16px; color: #333; margin-bottom: 4px; }
.result-tag { font-size: 11px; color: #ff6b00; background: #fff3e0; display: inline-block; padding: 1px 6px; border-radius: 4px; margin-bottom: 4px; width: fit-content; }
.result-price { font-size: 18px; font-weight: 600; color: #ff6b00; }
</style>
