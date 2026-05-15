<template>
  <div :class="['list-page', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner">
      <span class="banner-icon">🛍️</span>
      <div>
        <div class="banner-title">商品列表</div>
        <div class="banner-desc">发现更多旅行好物</div>
      </div>
    </div>

    <div class="toolbar">
      <div class="filter-row">
        <button
          v-for="cat in categories"
          :key="cat.slug"
          :class="['filter-btn', { active: selectedCategory === cat.slug }]"
          @click="selectCategory(cat.slug)"
        >{{ cat.name }}</button>
      </div>
      <div class="sort-row">
        <button :class="{ active: sortBy === 'default' }" @click="sortBy = 'default'">默认</button>
        <button :class="{ active: sortBy === 'price_asc' }" @click="sortBy = 'price_asc'">价格↑</button>
        <button :class="{ active: sortBy === 'price_desc' }" @click="sortBy = 'price_desc'">价格↓</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="error" class="error-state">
      <span class="error-icon">😵</span>
      <span class="error-text">加载失败</span>
      <button class="btn-primary" @click="loadProducts">重新加载</button>
    </div>

    <div v-else-if="sortedProducts.length === 0" class="empty-state">
      <span class="empty-icon">📦</span>
      <div class="empty-title">暂无商品</div>
    </div>

    <div v-else class="product-grid">
      <div
        v-for="product in sortedProducts"
        :key="product.id"
        class="product-item"
        @click="$router.push(`/details?id=${product.id}`)"
      >
        <div class="product-image">
          <img :src="getImageUrl(product.image_url || product.image)" :alt="product.name" loading="lazy" />
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-price">¥{{ product.price }}</div>
        </div>
      </div>
    </div>

    <div v-if="hasMore && !loading" class="load-more">
      <button class="btn-outline" @click="loadMore">加载更多</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import api, { getImageUrl } from '../utils/api'

const appStore = useAppStore()

const categories = [
  { name: '全部', slug: 'all' },
  { name: '门票', slug: 'tickets' },
  { name: '跟团游', slug: 'tours' },
  { name: '交通', slug: 'transport' },
  { name: '美食', slug: 'food' }
]

const selectedCategory = ref('all')
const sortBy = ref('default')
const loading = ref(true)
const error = ref(false)
const hasMore = ref(true)
const products = ref<any[]>([
  { id: 1, name: '漓江景区门票', price: 80, image_url: '/image/b1.jpg' },
  { id: 2, name: '阳朔西街一日游', price: 35, image_url: '/image/b3.jpg' },
  { id: 3, name: '龙脊梯田门票', price: 70, image_url: '/image/b1.jpg' },
  { id: 4, name: '象鼻山公园门票', price: 55, image_url: '/image/b2.jpg' },
  { id: 5, name: '两江四湖夜游', price: 90, image_url: '/image/b1.jpg' },
  { id: 6, name: '芦笛岩门票', price: 60, image_url: '/image/b2.jpg' },
  { id: 7, name: '桂林米粉', price: 12, image_url: '/image/food-icon.webp' },
  { id: 8, name: '啤酒鱼套餐', price: 68, image_url: '/image/b3.jpg' }
])

const sortedProducts = computed(() => {
  const list = [...products.value]
  switch (sortBy.value) {
    case 'price_asc': return list.sort((a, b) => a.price - b.price)
    case 'price_desc': return list.sort((a, b) => b.price - a.price)
    default: return list
  }
})

async function loadProducts() {
  loading.value = true
  error.value = false
  try {
    const res = await api.get('/products')
    const data = Array.isArray(res) ? res : (res as any)?.data || []
    if (Array.isArray(data) && data.length > 0) {
      products.value = data
    }
  } catch (e) {
    // use default products
  } finally {
    loading.value = false
  }
}

function selectCategory(slug: string) {
  selectedCategory.value = slug
}

function loadMore() {
  // append more products
  loading.value = true
  setTimeout(() => {
    loading.value = false
    hasMore.value = false
  }, 800)
}

loadProducts()
</script>

<style scoped>
.list-page { background: var(--bg); min-height: 100vh; }

.toolbar {
  background: var(--bg-card); padding: 10px 16px;
  box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 10;
}
.filter-row { display: flex; gap: 6px; margin-bottom: 8px; overflow-x: auto; }
.filter-row::-webkit-scrollbar { display: none; }
.filter-btn {
  padding: 4px 12px; border-radius: var(--radius-xl); font-size: var(--font-xs);
  color: var(--text-secondary); cursor: pointer; white-space: nowrap;
  border: 1px solid var(--border-light); transition: all var(--transition-fast);
}
.filter-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.sort-row { display: flex; gap: 12px; }
.sort-row button {
  font-size: var(--font-xs); color: var(--text-hint); cursor: pointer; padding: 2px 4px;
  border-bottom: 2px solid transparent;
}
.sort-row button.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 600; }

.product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px 16px; }
.product-item {
  background: var(--bg-card); border-radius: var(--radius-md); overflow: hidden;
  cursor: pointer; transition: transform var(--transition-fast);
}
.product-item:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.product-image { width: 100%; height: 140px; overflow: hidden; }
.product-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.product-item:hover .product-image img { transform: scale(1.05); }
.product-info { padding: 8px 10px 10px; }
.product-name { font-size: var(--font-sm); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-price { font-size: var(--font-lg); font-weight: 700; color: var(--accent); margin-top: 2px; }

.load-more { padding: 16px; text-align: center; }
</style>