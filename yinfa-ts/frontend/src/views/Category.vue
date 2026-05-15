<template>
  <div :class="['category-page', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner">
      <span class="banner-icon">🏷️</span>
      <div>
        <div class="banner-title">商品分类</div>
        <div class="banner-desc">选择您需要的旅行服务</div>
      </div>
    </div>

    <div class="category-body">
      <div class="sidebar">
        <div v-if="loadingCategories" class="sidebar-loading">
          <div class="skeleton-text" v-for="i in 5" :key="i" style="width:80%; margin: 16px auto;"></div>
        </div>
        <div
          v-else
          v-for="(cat, idx) in categories"
          :key="cat.id"
          :class="['sidebar-item', { active: activeCategory === idx }]"
          @click="switchCategory(idx)"
        >
          {{ cat.name }}
        </div>
      </div>

      <div class="product-content">
        <div v-if="loadingProducts" class="product-grid">
          <div v-for="i in 4" :key="i" style="padding: 8px;">
            <div class="skeleton-image" style="height:130px;"></div>
            <div class="skeleton-text" style="margin-top:8px;"></div>
            <div class="skeleton-text-short"></div>
          </div>
        </div>

        <div v-else-if="productError" class="error-state">
          <span class="error-icon">😵</span>
          <span class="error-text">加载失败</span>
          <button class="btn-primary" @click="loadProducts(categories[activeCategory])">重新加载</button>
        </div>

        <div v-else-if="products.length === 0" class="empty-state">
          <span class="empty-icon">📦</span>
          <div class="empty-title">该分类暂无商品</div>
        </div>

        <div v-else class="product-grid">
          <div
            v-for="product in products"
            :key="product.id"
            class="product-item"
            @click="$router.push(`/details?id=${product.id}`)"
          >
            <div class="product-image">
              <img :src="getImageUrl(product.image)" :alt="product.name" loading="lazy" />
            </div>
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">¥{{ product.price }}</div>
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

const categories = ref([
  { id: 1, name: '热门推荐', slug: 'hot' },
  { id: 2, name: '门票预订', slug: 'tickets' },
  { id: 3, name: '跟团游', slug: 'tours' },
  { id: 4, name: '交通接送', slug: 'transport' },
  { id: 5, name: '特色美食', slug: 'food' }
])
const products = ref<any[]>([])
const activeCategory = ref(0)
const loadingCategories = ref(false)
const loadingProducts = ref(true)
const productError = ref(false)

async function loadCategories() {
  loadingCategories.value = true
  try {
    const res = await api.get('/categories')
    const data = (res as any)?.data || res
    if (Array.isArray(data) && data.length > 0) {
      categories.value = data
    }
  } catch (e) {
    // use default categories
  } finally {
    loadingCategories.value = false
    if (products.value.length === 0) {
      loadProducts(categories.value[0])
    }
  }
}

async function loadProducts(cat?: any) {
  loadingProducts.value = true
  productError.value = false
  try {
    const params: any = {}
    if (cat?.slug) params.category = cat.slug
    const res = await api.get('/products', { params })
    const data = Array.isArray(res) ? res : (res as any)?.data || []
    products.value = (Array.isArray(data) ? data : []).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image_url || '/image/food-icon.webp'
    }))
  } catch (e) {
    productError.value = true
    products.value = [
      { id: 1, name: '漓江景区门票', price: 80, image: '/image/b1.jpg' },
      { id: 2, name: '阳朔西街', price: 35, image: '/image/b3.jpg' },
      { id: 3, name: '龙脊梯田', price: 70, image: '/image/b1.jpg' },
      { id: 4, name: '桂林漓江大瀑布酒店', price: 600, image: '/image/b2.jpg' }
    ].map(p => ({ ...p }))
  } finally {
    loadingProducts.value = false
  }
}

function switchCategory(idx: number) {
  if (idx === activeCategory.value) return
  activeCategory.value = idx
  products.value = []
  loadProducts(categories.value[idx])
  appStore.speak('正在查看' + categories.value[idx].name)
}

loadCategories()
</script>

<style scoped>
.category-page { background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; }

.category-body { display: flex; flex: 1; height: calc(100vh - 180px); }

.sidebar { width: 100px; background: var(--bg-card); flex-shrink: 0; overflow-y: auto; border-right: 1px solid var(--border-light); }
.sidebar-loading { padding: 20px 0; }
.sidebar-item {
  padding: 16px 12px; font-size: var(--font-md); color: var(--text-secondary);
  text-align: center; border-left: 3px solid transparent;
  transition: all var(--transition-fast); cursor: pointer;
}
.sidebar-item.active {
  background: var(--bg); color: var(--primary); font-weight: 700;
  border-left-color: var(--primary); font-size: var(--font-lg);
}
.sidebar-item:active { background: var(--bg); }

.product-content { flex: 1; overflow-y: auto; background: var(--bg); }

.product-grid { display: flex; flex-wrap: wrap; padding: 8px; }
.product-item { width: 50%; padding: 8px; box-sizing: border-box; cursor: pointer; }
.product-image { width: 100%; height: 140px; border-radius: var(--radius-md); overflow: hidden; background: var(--border-light); }
.product-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.product-item:hover .product-image img { transform: scale(1.05); }
.product-name {
  display: block; font-size: var(--font-md); font-weight: 600;
  color: var(--text-primary); margin-top: 8px; padding: 0 6px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.product-price {
  display: block; font-size: var(--font-lg); font-weight: 700;
  color: var(--accent); padding: 2px 6px 0;
}
</style>