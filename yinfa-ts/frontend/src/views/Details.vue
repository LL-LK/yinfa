<template>
  <div :class="['details-page', 'font-mode-' + appStore.fontSizeMode]">
    <div class="detail-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <button class="cart-btn" @click="$router.push('/cart')">🛒</button>
    </div>

    <div v-if="loading" class="loading-state" style="height: 100vh;">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="error" class="error-state" style="height: 100vh;">
      <span class="error-icon">😵</span>
      <span class="error-text">加载失败</span>
      <button class="btn-primary" @click="loadProduct">重新加载</button>
    </div>

    <div v-else class="content">
      <div class="image-gallery">
        <img :src="getImageUrl(product.image_url)" :alt="product.name" class="main-image" />
      </div>

      <div class="product-info card">
        <div class="info-header">
          <h1 class="product-name">{{ product.name }}</h1>
          <span v-if="product.category" class="product-tag">{{ product.category.name || product.category }}</span>
        </div>
        <div class="price-row">
          <span class="product-price">¥{{ product.price }}</span>
          <span class="product-original" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
        </div>
        <div class="product-desc" v-if="product.description">{{ product.description }}</div>
        <div class="product-meta">
          <div class="meta-item" v-if="product.stock !== undefined && product.stock !== null">
            <span class="meta-label">库存</span>
            <span :class="['meta-value', { 'stock-low': product.stock <= 5 }]">
              {{ product.stock > 0 ? product.stock + '件' : '暂无库存' }}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-label">已售</span>
            <span class="meta-value">{{ product.sold || 128 }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">评分</span>
            <span class="meta-value">⭐ {{ product.rating || 4.8 }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section card">
        <div class="section-title-sm">📝 商品详情</div>
        <div class="detail-content">
          {{ product.detail || product.description || '暂无详细描述' }}
        </div>
      </div>

      <div class="detail-section card">
        <div class="section-title-sm">📋 购买须知</div>
        <div class="notice-list">
          <div class="notice-item">• 下单后30分钟内未付款，订单将自动取消</div>
          <div class="notice-item">• 门票类商品凭订单号到景区售票处兑换</div>
          <div class="notice-item">• 如需退改，请在游玩日期前联系客服</div>
          <div class="notice-item">• 60岁以上老人可享优惠，请携带身份证</div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <button class="bottom-btn cart-btn" @click="$router.push('/cart')">
        🛒 <span v-if="cartStore.totalCount">{{ cartStore.totalCount }}</span>
      </button>
      <button
        class="bottom-btn add-btn"
        :disabled="product.stock <= 0"
        @click="addToCart"
      >
        {{ product.stock <= 0 ? '暂无库存' : '加入购物车' }}
      </button>
      <button
        class="bottom-btn buy-btn"
        :disabled="product.stock <= 0"
        @click="buyNow"
      >
        立即购买
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAppStore } from '../stores/app'
import api, { getImageUrl } from '../utils/api'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const appStore = useAppStore()

const loading = ref(true)
const error = ref(false)
const product = ref<any>({
  id: 0, name: '', price: 0, image_url: '', description: '', detail: '', stock: 10, sold: 0, category: null
})

async function loadProduct() {
  loading.value = true
  error.value = false
  try {
    const id = route.query.id || 1
    const res = await api.get(`/products/${id}`)
    const data = (res as any)?.data || res
    product.value = { ...product.value, ...data }
  } catch (e) {
    error.value = true
    product.value = {
      id: 1, name: '漓江景区门票', price: 80, originalPrice: 120,
      image_url: '/image/b1.jpg', description: '百里漓江，百里画廊，乘坐游船欣赏桂林山水精华段',
      detail: '漓江风景名胜区是国家5A级旅游景区，世界自然遗产。乘坐游船从桂林到阳朔，全程约83公里，沿途可以欣赏到九马画山、黄布倒影等著名景点。\n\n游船时间：约4小时\n包含内容：游船票、导游讲解\n推荐游览季节：4-10月',
      stock: 50, sold: 1280, rating: 4.9, category: { name: '门票预订' }
    }
  } finally {
    loading.value = false
  }
}

function addToCart() {
  const openid = localStorage.getItem('openid') || 'demo_user'
  cartStore.addToCart(openid, product.value.id, 1)
  appStore.speak('已添加' + product.value.name + '到购物车')
}

function buyNow() {
  const openid = localStorage.getItem('openid') || 'demo_user'
  cartStore.addToCart(openid, product.value.id, 1)
  router.push('/cart')
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.details-page { background: var(--bg); min-height: 100vh; padding-bottom: 80px; }

.detail-header {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px; display: flex; justify-content: space-between;
  padding: 12px 16px; z-index: 10;
}
.back-btn, .cart-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0,0,0,0.3); color: #fff; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(10px);
}

.image-gallery { width: 100%; height: 320px; overflow: hidden; }
.main-image { width: 100%; height: 100%; object-fit: cover; }

.product-info { margin: 12px 16px; padding: 16px; }
.info-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.product-name { font-size: 20px; font-weight: 700; color: var(--text-primary); flex: 1; }
.product-tag { font-size: 11px; color: var(--accent); background: rgba(255,107,53,0.1); padding: 2px 8px; border-radius: 4px; white-space: nowrap; }

.price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
.product-price { font-size: 28px; font-weight: 700; color: var(--accent); }
.product-original { font-size: var(--font-sm); color: var(--text-hint); text-decoration: line-through; }

.product-desc { font-size: var(--font-md); color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px; }

.product-meta { display: flex; gap: 24px; }
.meta-item { display: flex; gap: 4px; }
.meta-label { font-size: var(--font-xs); color: var(--text-hint); }
.meta-value { font-size: var(--font-xs); color: var(--text-primary); font-weight: 600; }
.stock-low { color: var(--danger); }

.detail-section { margin: 0 16px 12px; padding: 16px; }
.section-title-sm { font-size: var(--font-md); font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
.detail-content { font-size: var(--font-sm); color: var(--text-secondary); line-height: 1.8; white-space: pre-wrap; }
.notice-list { display: flex; flex-direction: column; gap: 6px; }
.notice-item { font-size: var(--font-sm); color: var(--text-secondary); line-height: 1.6; }

.bottom-bar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  display: flex; gap: 8px; padding: 10px 16px;
  background: var(--bg-card); box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
  align-items: center;
}
.bottom-btn {
  padding: 10px 0; border-radius: var(--radius-xl);
  font-size: var(--font-md); font-weight: 600; cursor: pointer;
  transition: opacity 0.2s; display: flex; align-items: center;
  justify-content: center; gap: 4px;
}
.bottom-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cart-btn.cart-btn { width: 44px; flex-shrink: 0; background: var(--bg-input); color: var(--text-primary); border-radius: 50%; }
.add-btn { flex: 1; background: #FF9800; color: #fff; }
.buy-btn { flex: 1.2; background: var(--accent); color: #fff; }
</style>