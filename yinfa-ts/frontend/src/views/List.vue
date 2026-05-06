<template>
  <div class="list">
    <div class="header">
      <h1>商品列表</h1>
    </div>
    <div class="filter">
      <button v-for="cat in categories" :key="cat" 
              :class="['filter-btn', { active: selectedCategory === cat }]"
              @click="selectedCategory = cat">
        {{ cat }}
      </button>
    </div>
    <div class="products">
      <div class="product-item" v-for="product in filteredProducts" :key="product.id">
        <router-link :to="`/details?id=${product.id}`">
          <div class="product-image">
            <img :src="product.image" :alt="product.name" loading="lazy" />
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">¥{{ product.price }}</div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedCategory = ref('全部')
const categories = ['全部', '门票', '酒店', '美食', '线路']

const products = [
  { id: 1, name: '漓江景区门票', price: 80, category: '门票', image: new URL('../assets/image/1.jpg', import.meta.url).href },
  { id: 2, name: '阳朔西街', price: 35, category: '门票', image: new URL('../assets/image/2.jpg', import.meta.url).href },
  { id: 3, name: '龙脊梯田', price: 70, category: '门票', image: new URL('../assets/image/3.jpg', import.meta.url).href },
  { id: 4, name: '桂林漓江大瀑布酒店', price: 600, category: '酒店', image: new URL('../assets/image/4.jpg', import.meta.url).href },
  { id: 5, name: '阳朔悦榕庄', price: 900, category: '酒店', image: new URL('../assets/image/5.jpg', import.meta.url).href },
  { id: 6, name: '桂林阳朔三日游', price: 599, category: '线路', image: new URL('../assets/image/6.jpg', import.meta.url).href },
  { id: 7, name: '桂林米粉', price: 25, category: '美食', image: new URL('../assets/image/72.png', import.meta.url).href },
  { id: 8, name: '桂林山水画扇', price: 68, category: '其他', image: new URL('../assets/image/82.png', import.meta.url).href }
]

const filteredProducts = computed(() => {
  if (selectedCategory.value === '全部') {
    return products
  }
  return products.filter(p => p.category === selectedCategory.value)
})
</script>

<style scoped>
.list {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.filter {
  display: flex;
  padding: 10px 16px;
  background-color: #fff;
  gap: 8px;
  overflow-x: auto;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background-color: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-btn.active {
  background-color: #ff6b00;
  color: #fff;
  border-color: #ff6b00;
}

.products {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.product-item:hover {
  transform: translateY(-2px);
}

.product-item a {
  text-decoration: none;
  color: inherit;
  display: flex;
  gap: 12px;
  padding: 12px;
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff6b00;
}
</style>