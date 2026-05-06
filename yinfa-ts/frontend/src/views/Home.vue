<template>
  <div class="home">
    <!-- 加载动画 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 主内容 -->
    <div v-else class="content">
      <!-- 轮播图区域 -->
      <div class="swiper">
        <div class="swiper-wrapper" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div v-for="(img, index) in imgUrls" :key="index" class="swiper-slide">
            <img :src="img" class="slide-image" loading="lazy" />
          </div>
        </div>
        <div class="swiper-dots">
          <span v-for="(_, index) in imgUrls" :key="index" 
                class="swiper-dot" 
                :class="{ active: currentSlide === index }"
                @click="goToSlide(index)"></span>
        </div>
      </div>

      <!-- 搜索框区域 -->
      <div class="search">
        <router-link to="/search" class="search-text">
          <span class="search-icon">🔍</span>
          搜索商品、景点
        </router-link>
      </div>

      <!-- 功能模块区域 -->
      <div class="newest">
        <div class="newest-title">
          <span>功能模块</span>
        </div>
        <div class="newest-box">
          <div class="newest-list" v-for="(item, index) in modules" :key="index">
            <router-link :to="item.path">
              <div class="icon-box">
                <img :src="item.icon" class="icon-image" loading="lazy" />
              </div>
              <div class="newest-text">{{ item.name }}</div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="products">
        <div class="newest-title">
          <span>热门商品</span>
        </div>
        <div class="products-box">
          <div class="product-item" v-for="(product, index) in products" :key="index">
            <router-link :to="`/details?id=${product.id}`">
              <div class="product-image">
                <img :src="product.image" class="product-img" loading="lazy" />
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">¥{{ product.price }}</div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const loading = ref(true)
const currentSlide = ref(0)
let timer: number | null = null

const imgUrls = [
  new URL('../assets/image/1.jpg', import.meta.url).href,
  new URL('../assets/image/2.jpg', import.meta.url).href,
  new URL('../assets/image/3.jpg', import.meta.url).href,
  new URL('../assets/image/4.jpg', import.meta.url).href,
  new URL('../assets/image/5.jpg', import.meta.url).href
]

const modules = [
  { name: '商品分类', path: '/category', icon: new URL('../assets/image/c1.png', import.meta.url).href },
  { name: '购物车', path: '/cart', icon: new URL('../assets/image/cart1.png', import.meta.url).href },
  { name: '订单', path: '/orders', icon: new URL('../assets/image/s1.png', import.meta.url).href },
  { name: '个人中心', path: '/user', icon: new URL('../assets/image/s2.png', import.meta.url).href },
  { name: '地图', path: '/map', icon: new URL('../assets/image/s3.png', import.meta.url).href },
  { name: '地址管理', path: '/address', icon: new URL('../assets/image/s4.png', import.meta.url).href },
  { name: '搜索', path: '/search', icon: new URL('../assets/image/s5.png', import.meta.url).href },
  { name: '列表', path: '/list', icon: new URL('../assets/image/s6.png', import.meta.url).href }
]

const products = [
  { id: 1, name: '漓江景区门票', price: 80, image: new URL('../assets/image/1.jpg', import.meta.url).href },
  { id: 2, name: '阳朔西街', price: 35, image: new URL('../assets/image/2.jpg', import.meta.url).href },
  { id: 3, name: '龙脊梯田', price: 70, image: new URL('../assets/image/3.jpg', import.meta.url).href },
  { id: 4, name: '桂林漓江大瀑布酒店', price: 600, image: new URL('../assets/image/4.jpg', import.meta.url).href },
  { id: 5, name: '阳朔悦榕庄', price: 900, image: new URL('../assets/image/5.jpg', import.meta.url).href },
  { id: 6, name: '桂林阳朔三日游', price: 599, image: new URL('../assets/image/6.jpg', import.meta.url).href },
  { id: 7, name: '桂林米粉', price: 25, image: new URL('../assets/image/72.png', import.meta.url).href },
  { id: 8, name: '桂林山水画扇', price: 68, image: new URL('../assets/image/82.png', import.meta.url).href }
]

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % imgUrls.length
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
  
  timer = window.setInterval(nextSlide, 3000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.home {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #fff;
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

.loading p {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.content {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.swiper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.swiper-wrapper {
  display: flex;
  transition: transform 0.5s ease-in-out;
  height: 100%;
}

.swiper-slide {
  min-width: 100%;
  height: 100%;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.swiper-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.swiper-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.3s;
}

.swiper-dot.active {
  background-color: #fff;
}

.search {
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-text {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 10px 16px;
  text-decoration: none;
  color: #999;
  font-size: 14px;
  transition: background-color 0.3s;
}

.search-text:hover {
  background-color: #eee;
}

.search-icon {
  margin-right: 8px;
  font-size: 16px;
}

.newest {
  padding: 16px;
  background-color: #fff;
  margin: 10px 0;
}

.newest-title {
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 16px;
  color: #333;
  position: relative;
  padding-left: 12px;
}

.newest-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #ff6b00;
  border-radius: 2px;
}

.newest-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.newest-list {
  width: 25%;
  text-align: center;
  margin-bottom: 16px;
  transition: transform 0.2s;
}

.newest-list:hover {
  transform: translateY(-2px);
}

.newest-list a {
  text-decoration: none;
  color: inherit;
}

.icon-box {
  width: 50px;
  height: 50px;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 8px;
  transition: background-color 0.3s;
}

.icon-box:hover {
  background-color: #f0f0f0;
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.newest-text {
  font-size: 12px;
  color: #333;
}

.products {
  padding: 16px;
  background-color: #fff;
}

.products-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}

.product-item {
  width: calc(50% - 6px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: #fff;
}

.product-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.product-item a {
  text-decoration: none;
  color: inherit;
}

.product-image {
  width: 100%;
  height: 140px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-item:hover .product-img {
  transform: scale(1.05);
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b00;
}
</style>