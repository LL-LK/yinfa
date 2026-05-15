<template>
  <div :class="['cart-page', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner">
      <span class="banner-icon">🛒</span>
      <div>
        <div class="banner-title">购物车</div>
        <div class="banner-desc">{{ cartStore.items.length }}件商品</div>
      </div>
    </div>

    <div v-if="cartStore.items.length === 0" class="empty-state">
      <span class="empty-icon">🛒</span>
      <div class="empty-title">购物车是空的</div>
      <div class="empty-desc">赶快去看看有什么好东西吧</div>
      <router-link to="/list" class="btn-primary" style="margin-top:16px;display:inline-block;">去逛逛</router-link>
    </div>

    <div v-else>
      <div class="cart-items">
        <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
          <div class="item-check" @click="item.checked = !item.checked">
            <span :class="['check-box', { checked: item.checked }]">
              {{ item.checked ? '✓' : '' }}
            </span>
          </div>
          <div class="item-image">
            <img
              :src="getImageUrl(item.product?.image_url || item.image || '')"
              :alt="item.product?.name || item.name"
            />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.product?.name || item.name }}</div>
            <div class="item-price">¥{{ item.product?.price || item.price }}</div>
            <div class="item-actions">
              <button class="qty-btn" @click="decreaseQty(item)">-</button>
              <span class="qty-value">{{ item.quantity }}</span>
              <button class="qty-btn" @click="increaseQty(item)">+</button>
              <button class="delete-btn" @click="removeItem(item)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <div class="cart-footer">
        <div class="footer-check" @click="toggleAll">
          <span :class="['check-box', { checked: allChecked }]">
            {{ allChecked ? '✓' : '' }}
          </span>
          <span class="check-label">全选</span>
        </div>
        <div class="footer-info">
          <span class="total-label">合计:</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <button class="btn-accent checkout-btn" :disabled="checkedCount === 0" @click="checkout">
          结算({{ checkedCount }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useAppStore } from '../stores/app'
import { getImageUrl } from '../utils/api'

const cartStore = useCartStore()
const appStore = useAppStore()

const allChecked = computed(() => cartStore.items.length > 0 && cartStore.items.every((i: any) => i.checked))
const checkedCount = computed(() => cartStore.items.filter((i: any) => i.checked).length)
const totalPrice = computed(() =>
  cartStore.items
    .filter((i: any) => i.checked)
    .reduce((sum: number, i: any) => sum + (i.product?.price || i.price || 0) * i.quantity, 0)
)

function toggleAll() {
  const checked = !allChecked.value
  cartStore.items.forEach((i: any) => i.checked = checked)
}

function decreaseQty(item: any) {
  if (item.quantity <= 1) return
  cartStore.addToCart(localStorage.getItem('openid') || 'demo_user', item.id, -1)
}

function increaseQty(item: any) {
  cartStore.addToCart(localStorage.getItem('openid') || 'demo_user', item.id, 1)
}

function removeItem(item: any) {
  if (!confirm('确定删除此商品吗？')) return
  cartStore.removeItem(item.id, localStorage.getItem('openid') || 'demo_user')
}

function checkout() {
  if (checkedCount.value === 0) return
  appStore.speak('正在结算')
  alert(`确认下单吗？\n\n共 ${checkedCount.value} 件商品\n合计: ¥${totalPrice.value.toFixed(2)}`)
}
</script>

<style scoped>
.cart-page { background: var(--bg); min-height: 100vh; }

.cart-items { padding: 12px 16px; }
.cart-item {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg-card); border-radius: var(--radius-md);
  padding: 12px; margin-bottom: 8px; box-shadow: var(--shadow-sm);
}
.item-check { cursor: pointer; flex-shrink: 0; }
.check-box {
  width: 22px; height: 22px; border: 2px solid var(--border-color);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #fff; transition: all var(--transition-fast);
}
.check-box.checked { background: var(--primary); border-color: var(--primary); }
.item-image { width: 80px; height: 80px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; }
.item-image img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; }
.item-name { font-size: var(--font-md); font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.item-price { font-size: var(--font-lg); font-weight: 700; color: var(--accent); margin-bottom: 8px; }
.item-actions { display: flex; align-items: center; gap: 6px; }
.qty-btn {
  width: 28px; height: 28px; border-radius: 50%; background: var(--bg-input);
  font-size: 16px; font-weight: 700; color: var(--text-primary);
  display: flex; align-items: center; justify-content: center;
}
.qty-value { font-size: var(--font-md); font-weight: 600; min-width: 20px; text-align: center; }
.delete-btn { font-size: var(--font-xs); color: var(--danger); margin-left: auto; }

.cart-footer {
  position: fixed; bottom: 56px; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; background: var(--bg-card);
  box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
}
.footer-check { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.check-label { font-size: var(--font-sm); white-space: nowrap; }
.footer-info { flex: 1; }
.total-label { font-size: var(--font-sm); color: var(--text-secondary); }
.total-price { font-size: var(--font-lg); font-weight: 700; color: var(--accent); margin-left: 4px; }
.checkout-btn {
  padding: 10px 20px; font-size: var(--font-md); font-weight: 700;
  border-radius: var(--radius-xl);
}
.checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>