<template>
  <div class="cart">
    <div v-if="cartItems.length === 0" class="empty">
      <div class="empty-icon">🛒</div>
      <p>购物车是空的</p>
      <router-link to="/list" class="go-shopping">去逛逛</router-link>
    </div>
    <div v-else class="cart-content">
      <div class="cart-items">
        <div class="cart-item" v-for="item in cartItems" :key="item.id">
          <div class="item-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-price">¥{{ item.price }}</div>
            <div class="item-actions">
              <button class="quantity-btn" @click="decreaseQuantity(item)">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button class="quantity-btn" @click="increaseQuantity(item)">+</button>
            </div>
          </div>
        </div>
      </div>
      <div class="cart-footer">
        <div class="total">
          <span>合计：</span>
          <span class="total-price">¥{{ totalPrice }}</span>
        </div>
        <button class="checkout-btn" @click="checkout">结算</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cartItems = ref([
  { id: 1, name: '漓江景区门票', price: 80, image: new URL('../assets/image/1.jpg', import.meta.url).href, quantity: 2 },
  { id: 7, name: '桂林米粉', price: 25, image: new URL('../assets/image/72.png', import.meta.url).href, quantity: 1 }
])

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const increaseQuantity = (item: any) => {
  item.quantity++
}

const decreaseQuantity = (item: any) => {
  if (item.quantity > 1) {
    item.quantity--
  } else {
    cartItems.value = cartItems.value.filter(i => i.id !== item.id)
  }
}

const checkout = () => {
  router.push('/orders')
}
</script>

<style scoped>
.cart {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.empty p {
  color: #999;
  font-size: 16px;
  margin-bottom: 20px;
}

.go-shopping {
  padding: 10px 30px;
  background-color: #ff6b00;
  color: #fff;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
}

.cart-content {
  padding: 16px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.item-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b00;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity {
  font-size: 16px;
  color: #333;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.total {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff6b00;
}

.checkout-btn {
  padding: 10px 30px;
  background-color: #ff6b00;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>