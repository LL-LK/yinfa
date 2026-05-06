<template>
  <div class="details">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>
    <div v-else class="content">
      <div class="product-image">
        <img :src="product.image" :alt="product.name" />
      </div>
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        <div class="product-price">¥{{ product.price }}</div>
        <p class="product-desc">{{ product.description }}</p>
      </div>
      <div class="actions">
        <button class="btn btn-cart" @click="addToCart">加入购物车</button>
        <button class="btn btn-buy" @click="buyNow">立即购买</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const product = ref({
  id: 1,
  name: '漓江景区门票',
  price: 80,
  image: new URL('../assets/image/1.jpg', import.meta.url).href,
  description: '漓江是桂林山水的精华，被誉为"百里漓江、百里画廊"，是世界自然遗产地。'
})

const addToCart = () => {
  alert('已加入购物车')
}

const buyNow = () => {
  router.push('/orders')
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style scoped>
.details {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff6b00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.product-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 20px;
  background-color: #fff;
}

.product-name {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.product-price {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b00;
  margin-bottom: 15px;
}

.product-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 10px 20px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-cart {
  background-color: #ff9800;
  color: #fff;
}

.btn-buy {
  background-color: #ff6b00;
  color: #fff;
}
</style>