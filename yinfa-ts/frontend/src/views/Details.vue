<template>
  <div class="details">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>
    <div v-else-if="error" class="error">
      <p>⚠️ 加载失败</p>
      <button @click="loadProduct">重试</button>
    </div>
    <div v-else class="content">
      <div class="product-image">
        <img :src="getImageUrl(product.image_url)" :alt="product.name" />
      </div>
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        <div class="product-tag" v-if="product.category">{{ product.category.name }}</div>
        <div class="product-price">¥{{ product.price }}</div>
        <p class="product-desc">{{ product.description }}</p>
        <p class="product-stock" v-if="product.stock !== undefined">
          库存: {{ product.stock > 0 ? product.stock + '件' : '暂无库存' }}
        </p>
      </div>
      <div class="actions">
        <button class="btn btn-cart" @click="addToCart" :disabled="product.stock <= 0">
          {{ product.stock <= 0 ? '暂无库存' : '加入购物车' }}
        </button>
        <button class="btn btn-buy" @click="buyNow" :disabled="product.stock <= 0">
          立即购买
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import api, { getImageUrl } from '../utils/api'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const loading = ref(true)
const error = ref(false)
const product = ref<any>({
  id: 0, name: '', price: 0, image_url: '', description: '', stock: 0, category: null
})

async function loadProduct() {
  loading.value = true
  error.value = false
  try {
    const id = route.query.id || 1
    const res = await api.get(`/products/${id}`)
    product.value = res.data || product.value
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function addToCart() {
  const openid = localStorage.getItem('openid') || 'demo_user'
  cartStore.addToCart(openid, product.value.id, 1)
  alert('已加入购物车')
}

function buyNow() {
  const openid = localStorage.getItem('openid') || 'demo_user'
  cartStore.addToCart(openid, product.value.id, 1)
  router.push('/orders')
}

onMounted(loadProduct)
</script>

<style scoped>
.details {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}
.loading { display: flex; align-items: center; justify-content: center; height: 100vh; }
.loading-spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #ff6b00; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.content { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.product-image { width: 100%; height: 300px; overflow: hidden; background-color: #f5f5f5; }
.product-image img { width: 100%; height: 100%; object-fit: cover; }
.product-info { padding: 20px; background-color: #fff; }
.product-name { font-size: 24px; font-weight: 600; color: #333; margin: 0 0 8px 0; }
.product-tag { font-size: 12px; color: #ff6b00; background: #fff3e0; display: inline-block; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px; }
.product-price { font-size: 28px; font-weight: 700; color: #ff6b00; margin-bottom: 15px; }
.product-desc { font-size: 14px; color: #666; line-height: 1.6; }
.product-stock { font-size: 13px; color: #999; margin-top: 8px; }
.actions { position: fixed; bottom: 0; left: 0; right: 0; display: flex; padding: 10px 20px; background-color: #fff; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); gap: 10px; }
.btn { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
.btn:hover { opacity: 0.9; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cart { background-color: #ff9800; color: #fff; }
.btn-buy { background-color: #ff6b00; color: #fff; }
.error { text-align: center; padding: 60px 20px; color: #888; }
.error button { margin-top: 10px; padding: 8px 16px; background: #ff6b00; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>
