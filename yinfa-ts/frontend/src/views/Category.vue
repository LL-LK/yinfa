<template>
  <div class="category">
    <div class="category-header">
      <h1>商品分类</h1>
    </div>
    <div class="category-content">
      <div class="sidebar">
        <div v-for="cat in categories" :key="cat.id"
             :class="['category-item', { active: selectedCategory === cat.id }]"
             @click="selectedCategory = cat.id">
          {{ cat.name }}
        </div>
      </div>
      <div class="main">
        <div class="product-grid">
          <div class="product-item" v-for="product in filteredProducts" :key="product.id">
            <router-link :to="`/details?id=${product.id}`">
              <div class="product-image">
                <img :src="product.image" :alt="product.name" loading="lazy" />
              </div>
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">¥{{ product.price }}</div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedCategory = ref(1)

const categories = [
  { id: 1, name: '门票' },
  { id: 2, name: '酒店' },
  { id: 3, name: '美食' },
  { id: 4, name: '线路' },
  { id: 5, name: '其他' }
]

const products = [
  { id: 1, name: '漓江景区门票', price: 80, categoryId: 1, image: '/image/b1.jpg' },
  { id: 2, name: '阳朔西街', price: 35, categoryId: 1, image: '/image/b3.jpg' },
  { id: 3, name: '龙脊梯田', price: 70, categoryId: 1, image: '/image/b1.jpg' },
  { id: 4, name: '桂林漓江大瀑布酒店', price: 600, categoryId: 2, image: '/image/b2.jpg' },
  { id: 5, name: '阳朔悦榕庄', price: 900, categoryId: 2, image: '/image/b3.jpg' },
  { id: 6, name: '桂林阳朔三日游', price: 599, categoryId: 4, image: '/image/b1.jpg' },
  { id: 7, name: '桂林米粉', price: 25, categoryId: 3, image: '/image/food-icon.webp' },
  { id: 8, name: '桂林山水画扇', price: 68, categoryId: 5, image: '/image/b2.jpg' }
]

const filteredProducts = computed(() => {
  return products.filter(p => p.categoryId === selectedCategory.value)
})
</script>

<style scoped>
.category {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.category-header {
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.category-header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.category-content {
  flex: 1;
  display: flex;
}

.sidebar {
  width: 100px;
  background-color: #fff;
  border-right: 1px solid #eee;
}

.category-item {
  padding: 16px 12px;
  text-align: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item.active {
  background-color: #fff;
  color: #ff6b00;
  font-weight: 600;
  border-left: 3px solid #ff6b00;
}

.main {
  flex: 1;
  padding: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  padding: 12px;
  display: block;
}

.product-image {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b00;
}
</style>