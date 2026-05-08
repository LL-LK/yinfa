<template>
  <div class="orders-page">
    <h1>📋 我的订单</h1>
    <p class="subtitle">查看您的订单状态和历史记录</p>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">
      <p>⚠️ 加载失败</p>
      <button @click="loadOrders">重试</button>
    </div>

    <div v-else-if="orders.length === 0" class="empty">
      <p>📭 暂无订单</p>
      <p class="hint">快去探索桂林美景吧</p>
    </div>

    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">订单号: {{ order.order_no }}</span>
          <span class="order-status" :class="'status-' + statusClass(order.status)">{{ statusText(order.status) }}</span>
        </div>
        <div class="order-body">
          <div v-for="item in order.items" :key="item.id" class="order-product">
            <img v-if="item.product && item.product.image_url" :src="getImageUrl(item.product.image_url)" class="product-thumb" />
            <div class="product-info">
              <span class="product-name">{{ item.product ? item.product.name : '已下架商品' }}</span>
              <span class="product-qty">x{{ item.quantity }}</span>
              <span class="product-price">¥{{ item.unit_price }}</span>
            </div>
          </div>
        </div>
        <div class="order-footer">
          <span>📅 {{ order.created_at ? order.created_at.split('T')[0] : '' }}</span>
          <span class="price">¥{{ order.total_price }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api, { getImageUrl } from '../utils/api'
import { useOrderStore } from '../stores/order'

const orderStore = useOrderStore()
const loading = ref(true)
const error = ref(false)
const orders = ref<any[]>([])

const statusMap: Record<string, string> = {
  pending: '待付款', paid: '已付款', shipped: '已发货',
  completed: '已完成', cancelled: '已取消'
}
const statusClassMap: Record<string, string> = {
  pending: 'warn', paid: 'info', shipped: 'info',
  completed: 'ok', cancelled: 'danger'
}

function statusText(status: string) { return statusMap[status] || status }
function statusClass(status: string) { return statusClassMap[status] || 'info' }

async function loadOrders() {
  loading.value = true
  error.value = false
  try {
    const openid = localStorage.getItem('openid') || 'demo_user'
    await orderStore.fetchOrders(openid)
    orders.value = orderStore.orders
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)
</script>

<style scoped>
.orders-page { padding: 20px; max-width: 600px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 20px; }
.order-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.order-no { font-size: 12px; color: #999; }
.order-status { font-size: 12px; padding: 2px 8px; border-radius: 4px; }
.status-ok { background: #e8f8f0; color: #27ae60; }
.status-warn { background: #fef5e7; color: #f39c12; }
.status-danger { background: #fdeaea; color: #e74c3c; }
.status-info { background: #e8f0fe; color: #3498db; }
.order-body { margin: 8px 0; }
.order-product { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.order-product:last-child { border-bottom: none; }
.product-thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
.product-info { flex: 1; display: flex; align-items: center; gap: 8px; }
.product-name { font-size: 14px; color: #333; flex: 1; }
.product-qty { font-size: 12px; color: #999; }
.product-price { font-size: 14px; color: #333; font-weight: 600; }
.order-footer { display: flex; justify-content: space-between; font-size: 14px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f0f0f0; }
.price { color: #ff6b35; font-weight: 700; font-size: 18px; }
.empty, .error, .loading { text-align: center; padding: 60px 20px; color: #888; }
.hint { font-size: 12px; color: #bbb; margin-top: 4px; }
.error button { margin-top: 10px; padding: 8px 16px; background: #ff6b00; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>
