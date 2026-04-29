<template>
  <div class="search">
    <div class="search-header">
      <div class="search-box">
        <input 
          v-model="keyword" 
          type="text" 
          placeholder="搜索商品、景点"
          @keyup.enter="search"
          class="search-input"
        />
        <button class="search-btn" @click="search">搜索</button>
      </div>
    </div>
    <div v-if="!hasSearched" class="hot-searches">
      <h3>热门搜索</h3>
      <div class="tags">
        <span v-for="tag in hotTags" :key="tag" 
              class="tag" 
              @click="searchTag(tag)">
          {{ tag }}
        </span>
      </div>
    </div>
    <div v-else class="results">
      <div v-if="results.length === 0" class="no-results">
        没有找到相关结果
      </div>
      <div v-else class="result-list">
        <div class="result-item" v-for="item in results" :key="item.id">
          <router-link :to="`/details?id=${item.id}`">
            <div class="result-image">
              <img :src="item.image" :alt="item.name" loading="lazy" />
            </div>
            <div class="result-info">
              <div class="result-name">{{ item.name }}</div>
              <div class="result-price">¥{{ item.price }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')
const hasSearched = ref(false)
const results = ref<any[]>([])

const hotTags = ['故宫', '长城', '烤鸭', '一日游', '颐和园']

const products = [
  { id: 1, name: '故宫门票', price: 60, image: new URL('../assets/image/1.jpg', import.meta.url).href },
  { id: 2, name: '长城门票', price: 45, image: new URL('../assets/image/2.jpg', import.meta.url).href },
  { id: 3, name: '颐和园门票', price: 30, image: new URL('../assets/image/3.jpg', import.meta.url).href },
  { id: 4, name: '北京饭店', price: 800, image: new URL('../assets/image/4.jpg', import.meta.url).href },
  { id: 5, name: '王府井酒店', price: 450, image: new URL('../assets/image/5.jpg', import.meta.url).href },
  { id: 6, name: '北京一日游', price: 299, image: new URL('../assets/image/6.jpg', import.meta.url).href },
  { id: 7, name: '北京烤鸭', price: 198, image: new URL('../assets/image/72.png', import.meta.url).href },
  { id: 8, name: '故宫书签', price: 38, image: new URL('../assets/image/82.png', import.meta.url).href }
]

const search = () => {
  if (!keyword.value.trim()) return
  hasSearched.value = true
  results.value = products.filter(p => 
    p.name.toLowerCase().includes(keyword.value.toLowerCase())
  )
}

const searchTag = (tag: string) => {
  keyword.value = tag
  search()
}
</script>

<style scoped>
.search {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.search-header {
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #ff6b00;
}

.search-btn {
  padding: 10px 20px;
  background-color: #ff6b00;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.search-btn:hover {
  opacity: 0.9;
}

.hot-searches {
  padding: 20px 16px;
}

.hot-searches h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tag:hover {
  background-color: #ff6b00;
  color: #fff;
}

.results {
  padding: 16px;
}

.no-results {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.result-item a {
  text-decoration: none;
  color: inherit;
  display: flex;
  gap: 12px;
  padding: 12px;
}

.result-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f5f5f5;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.result-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff6b00;
}
</style>