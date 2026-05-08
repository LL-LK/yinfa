<template>
  <div class="cart">
    <div v-if="cartStore.items.length === 0" class="empty">
      <div class="empty-icon">🛒</div>
      <p>购物车是空的</p>
      <router-link to="/list" class="go-shopping">去逛逛</router-link>
    </div>
    <div v-else class="cart-content">
      <div class="cart-items">
        <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
          <div class="item-image">
            <img :src="getImageUrl(item.product.image_url)" :alt="item.product.name" />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.product.name }}</div>
            <div class="item-price">¥{{ item.product.price }}</div>
            <div class="item-actions">
              <button class="quantity-btn" @click="decreaseQty(item)">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button class="quantity-btn" @click="increaseQty(item)">+</button>
            </div>
          </div>
          <button class="remove-btn" @click="removeItem(item.id)">删除</button>
        </div>
      </div>
      <div class="cart-footer">
        <div class="total">
          <span>合计：</span>
          <span class="total-price">¥{{ cartStore.totalPrice }}</span>
        </div>
        <button class="checkout-btn" @click="checkout">结算</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import api, { getImageUrl } from '../utils/api'

const router = useRouter()
const cartStore = useCartStore()

function decreaseQty(item: any) {
  if (item.quantity <= 1) return
  const openid = localStorage.getItem('openid') || 'demo_user'
  cartStore.updateQuantity(item.id, item.quantity - 1, openid)
}

function increaseQty(item: any) {
  const openid = localStorage.getItem('openid') || 'demo_user'
  cartStore.updateQuantity(item.id, item.quantity + 1, openid)
}

function removeItem(itemId: number) {
  const openid = localStorage.getItem('openid') || 'demo_user'
  cartStore.removeItem(itemId, openid)
}

function checkout() {
  router.push('/orders')
}

onMounted(() => {
  const openid = localStorage.getItem('openid') || 'demo_user'
  cartStore.fetchCart(openid)
})
</script>

<style scoped>
.cart { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; background: #f5f5f5; }
.empty { text-align: center; padding: 80px 20px; color: #888; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.go-shopping { display: inline-block; margin-top: 16px; padding: 10px 24px; background: #ff6b00; color: #fff; border-radius: 20px; text-decoration: none; }
.cart-content { padding-bottom: 80px; }
.cart-items { padding: 12px 16px; }
.cart-item { display: flex; gap: 12px; background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); align-items: center; }
.item-image { width: 80px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.item-image img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; }
.item-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; }
.item-price { font-size: 16px; font-weight: 700; color: #ff6b00; margin-bottom: 8px; }
.item-actions { display: flex; align-items: center; gap: 10px; }
.quantity-btn { width: 28px; height: 28px; border: 1px solid #ddd; border-radius: 50%; background: #f5f5f5; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.quantity { font-size: 14px; min-width: 20px; text-align: center; }
.remove-btn { background: none; border: none; color: #e74c3c; font-size: 12px; cursor: pointer; }
.cart-footer { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: #fff; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); }
.total { font-size: 16px; }
.total-price { font-size: 22px; font-weight: 700; color: #ff6b00; }
.checkout-btn { padding: 12px 32px; background: #ff6b00; color: #fff; border: none; border-radius: 24px; font-size: 16px; font-weight: 600; cursor: pointer; }
.checkout-btn:hover { opacity: 0.9; }
</style>
