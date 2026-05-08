<template>
  <div class="list">
    <div class="header">
      <h1>商品列表</h1>
    </div>
    <div class="toolbar">
      <div class="filter">
        <button v-for="cat in categories" :key="cat.slug"
                :class="['filter-btn', { active: selectedCategory === cat.slug }]"
                @click="selectCategory(cat.slug)">
          {{ cat.name }}
        </button>
      </div>
      <div class="sort-bar">
        <button :class="{ active: sortBy === 'default' }" @click="sortBy = 'default'">默认</button>
        <button :class="{ active: sortBy === 'price_asc' }" @click="sortBy = 'price_asc'">价格↑</button>
        <button :class="{ active: sortBy === 'price_desc' }" @click="sortBy = 'price_desc'">价格↓</button>
      </div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">
      <p>⚠️ 加载失败</p>
      <button @click="loadData">重试</button>
    </div>
    <div v-else class="products">
      <div class="product-item" v-for="product in displayedProducts" :key="product.id">
        <router-link :to="`/details?id=${product.id}`">
          <div class="product-image">
            <img :src="getImageUrl(product.image_url)" :alt="product.name" loading="lazy" />
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-tag" v-if="product.category">{{ product.category.name }}</div>
            <div class="product-price">¥{{ product.price }}</div>
          </div>
        </router-link>
      </div>
    </div>
    <div v-if="!loading && hasMore" class="load-more">
      <button @click="loadMore" :disabled="loadingMore">
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </button>
    </div>
    <div v-if="!loading && displayedProducts.length === 0" class="empty">
      <p>暂无商品</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api, { getImageUrl } from '../utils/api'

const route = useRoute()

const categories = ref<{ id: number; name: string; slug: string }[]>([])
const products = ref<any[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(false)
const selectedCategory = ref('')
const sortBy = ref('default')
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)

const sortedProducts = computed(() => {
  const list = [...products.value]
  if (sortBy.value === 'price_asc') list.sort((a, b) => a.price - b.price)
  else if (sortBy.value === 'price_desc') list.sort((a, b) => b.price - a.price)
  return list
})

const displayedProducts = computed(() => sortedProducts.value)

function selectCategory(slug: string) {
  selectedCategory.value = slug === selectedCategory.value ? '' : slug
  page.value = 1
  products.value = []
  loadData()
}

async function loadData() {
  loading.value = true
  error.value = false
  try {
    const params: any = { page: page.value, pageSize }
    if (selectedCategory.value) params.category = selectedCategory.value
    if (sortBy.value !== 'default') params.sort = sortBy.value

    const res = await api.get('/products', { params })
    const data = res.data || []
    products.value = data
    hasMore.value = data.length >= pageSize
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  page.value++
  try {
    const params: any = { page: page.value, pageSize }
    if (selectedCategory.value) params.category = selectedCategory.value
    if (sortBy.value !== 'default') params.sort = sortBy.value

    const res = await api.get('/products', { params })
    const data = res.data || []
    products.value = [...products.value, ...data]
    hasMore.value = data.length >= pageSize
  } catch (e) {
    page.value--
  } finally {
    loadingMore.value = false
  }
}

async function loadCategories() {
  try {
    const res = await api.get('/categories')
    categories.value = [{ id: 0, name: '全部', slug: '' }, ...(res.data || [])]
  } catch (e) { /* use defaults */ }
}

onMounted(async () => {
  await loadCategories()
  if (route.query.category) selectedCategory.value = route.query.category as string
  loadData()
})
</script>

<style scoped>
.list {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}
.header { padding: 16px; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.header h1 { margin: 0; font-size: 20px; color: #333; }
.toolbar { background-color: #fff; padding: 0 16px 10px; }
.filter { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; }
.filter-btn {
  padding: 6px 12px; border: 1px solid #ddd; border-radius: 16px;
  background-color: #fff; color: #666; font-size: 14px; cursor: pointer; white-space: nowrap;
}
.filter-btn.active { background-color: #ff6b00; color: #fff; border-color: #ff6b00; }
.sort-bar { display: flex; gap: 8px; }
.sort-bar button {
  padding: 4px 10px; border: 1px solid #ddd; border-radius: 12px;
  background: #fff; color: #666; font-size: 12px; cursor: pointer;
}
.sort-bar button.active { background: #ff6b00; color: #fff; border-color: #ff6b00; }
.products { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.product-item {
  background-color: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s;
}
.product-item:hover { transform: translateY(-2px); }
.product-item a { text-decoration: none; color: inherit; display: flex; gap: 12px; padding: 12px; }
.product-image { width: 100px; height: 100px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background-color: #f5f5f5; }
.product-image img { width: 100%; height: 100%; object-fit: cover; }
.product-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.product-name { font-size: 16px; color: #333; margin-bottom: 4px; }
.product-tag { font-size: 12px; color: #ff6b00; background: #fff3e0; display: inline-block; padding: 2px 8px; border-radius: 4px; margin-bottom: 4px; width: fit-content; }
.product-price { font-size: 18px; font-weight: 600; color: #ff6b00; }
.loading, .empty, .error { text-align: center; padding: 40px; color: #888; }
.load-more { text-align: center; padding: 16px; }
.load-more button {
  padding: 8px 24px; background: #ff6b00; color: #fff; border: none; border-radius: 20px; cursor: pointer;
}
.load-more button:disabled { opacity: 0.6; }
.error button { margin-top: 10px; padding: 8px 16px; background: #ff6b00; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>
