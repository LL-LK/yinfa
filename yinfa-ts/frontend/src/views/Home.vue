<template>
  <div class="home">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="content">
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

      <div class="search">
        <router-link to="/search" class="search-text">
          <span class="search-icon">🔍</span>
          搜索商品、景点
        </router-link>
      </div>

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

      <div class="products">
        <div class="newest-title">
          <span>热门商品</span>
        </div>
        <div v-if="productsLoading" class="loading-text">加载中...</div>
        <div v-else-if="productsError" class="loading-text">加载失败</div>
        <div v-else class="products-box">
          <div class="product-item" v-for="product in products" :key="product.id">
            <router-link :to="`/details?id=${product.id}`">
              <div class="product-image">
                <img :src="getImageUrl(product.image_url)" class="product-img" loading="lazy" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api, { getImageUrl } from '../utils/api'

const loading = ref(true)
const productsLoading = ref(true)
const productsError = ref(false)
const currentSlide = ref(0)
let timer: number | null = null

const imgUrls = computed(() => [
  getImageUrl('/image/b1.jpg'),
  getImageUrl('/image/b2.jpg'),
  getImageUrl('/image/b3.jpg'),
  getImageUrl('/image/1.jpg'),
  getImageUrl('/image/1.jpg')
])

const modules = computed(() => {
  const icon = (name: string) => getImageUrl('/image/' + name)
  return [
    { name: '商品分类', path: '/category', icon: icon('icon3.webp') },
    { name: '购物车', path: '/cart', icon: icon('cart1.webp') },
    { name: '订单', path: '/orders', icon: icon('icon3.webp') },
    { name: '个人中心', path: '/user', icon: icon('icon3.webp') },
    { name: '地图', path: '/map', icon: icon('map-marker.webp') },
    { name: '地址管理', path: '/address', icon: icon('icon3.webp') },
    { name: '搜索', path: '/search', icon: icon('icon3.webp') },
    { name: '列表', path: '/list', icon: icon('icon3.webp') }
  ]
})

const products = ref<any[]>([])

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % imgUrls.length
}

async function loadProducts() {
  productsLoading.value = true
  productsError.value = false
  try {
    const res = await api.get('/products', { params: { pageSize: 8 } })
    products.value = (res.data || []).slice(0, 8)
  } catch (e) {
    productsError.value = true
  } finally {
    productsLoading.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)

  loadProducts()
  timer = window.setInterval(nextSlide, 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.home {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}
.loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #fff; }
.loading-spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #ff6b00; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.loading p { margin-top: 10px; color: #666; font-size: 14px; }
.content { animation: fadeIn 0.5s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.swiper { width: 100%; height: 200px; overflow: hidden; position: relative; }
.swiper-wrapper { display: flex; transition: transform 0.5s ease-in-out; height: 100%; }
.swiper-slide { min-width: 100%; height: 100%; }
.slide-image { width: 100%; height: 100%; object-fit: cover; }
.swiper-dots { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
.swiper-dot { width: 8px; height: 8px; border-radius: 50%; background-color: rgba(255,255,255,0.5); cursor: pointer; transition: background-color 0.3s; }
.swiper-dot.active { background-color: #fff; }
.search { padding: 12px 16px; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.search-text { display: flex; align-items: center; background-color: #f5f5f5; border-radius: 20px; padding: 10px 16px; text-decoration: none; color: #999; font-size: 14px; transition: background-color 0.3s; }
.search-text:hover { background-color: #eee; }
.search-icon { margin-right: 8px; font-size: 16px; }
.newest { padding: 16px; background-color: #fff; margin: 10px 0; }
.newest-title { margin-bottom: 16px; font-weight: 600; font-size: 16px; color: #333; position: relative; padding-left: 12px; }
.newest-title::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 16px; background-color: #ff6b00; border-radius: 2px; }
.newest-box { display: flex; flex-wrap: wrap; justify-content: space-between; }
.newest-list { width: 25%; text-align: center; margin-bottom: 16px; transition: transform 0.2s; }
.newest-list:hover { transform: translateY(-2px); }
.newest-list a { text-decoration: none; color: inherit; }
.icon-box { width: 50px; height: 50px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; background-color: #f9f9f9; border-radius: 12px; padding: 8px; transition: background-color 0.3s; }
.icon-box:hover { background-color: #f0f0f0; }
.icon-image { width: 100%; height: 100%; object-fit: contain; }
.newest-text { font-size: 12px; color: #333; }
.products { padding: 16px; background-color: #fff; }
.products-box { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; }
.loading-text { text-align: center; color: #999; padding: 20px; font-size: 14px; }
.product-item { width: calc(50% - 6px); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; background-color: #fff; }
.product-item:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.product-item a { text-decoration: none; color: inherit; }
.product-image { width: 100%; height: 140px; overflow: hidden; background-color: #f5f5f5; }
.product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.product-item:hover .product-img { transform: scale(1.05); }
.product-info { padding: 12px; }
.product-name { font-size: 14px; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #333; }
.product-price { font-size: 16px; font-weight: 600; color: #ff6b00; }
</style>
