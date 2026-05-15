<template>
  <div :class="['orders-page', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner">
      <span class="banner-icon">📋</span>
      <div>
        <div class="banner-title">我的订单</div>
        <div class="banner-desc">查看您的订单状态和历史记录</div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div v-else-if="error" class="error-state">
      <span class="error-icon">😵</span>
      <span class="error-text">加载失败</span>
      <button class="btn-primary" @click="loadOrders">重新加载</button>
    </div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <div class="empty-title">暂无订单</div>
      <div class="empty-desc">快去探索桂林美景吧</div>
    </div>

    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-card card">
        <div class="order-header">
          <span class="order-id">订单号: {{ order.id }}</span>
          <span class="order-status" :class="'status-' + (order.status || 'pending')">
            {{ statusText(order.status) }}
          </span>
        </div>
        <div class="order-items">
          <div class="order-item" v-if="order.items">
            <img
              v-if="order.items[0]?.product?.image_url"
              :src="getImageUrl(order.items[0].product.image_url)"
              class="order-image"
            />
            <span class="order-item-name">{{ order.items[0]?.product?.name || '商品' }}</span>
          </div>
          <span v-else class="order-item-name">{{ order.product_name || '商品' }}</span>
        </div>
        <div class="order-footer">
          <span class="order-total">合计: ¥{{ order.total_amount || order.total || 0 }}</span>
          <span class="order-date">{{ formatDate(order.created_at || order.date) }}</span>
        </div>
        <div class="order-actions">
          <button v-if="order.status === 'pending'" class="action-btn cancel" @click="cancelOrder(order)">取消订单</button>
          <button class="action-btn detail" @click="viewDetail(order)">查看详情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import api, { getImageUrl } from '../utils/api'

const appStore = useAppStore()

const loading = ref(true)
const error = ref(false)
const orders = ref<any[]>([])

async function loadOrders() {
  loading.value = true
  error.value = false
  try {
    const openid = localStorage.getItem('openid') || 'demo_user'
    const res = await api.get(`/orders?openid=${openid}`)
    const data = Array.isArray(res) ? res : (res as any)?.data || []
    orders.value = Array.isArray(data) ? data : []

    if (orders.value.length === 0) {
      orders.value = [
        { id: 1001, status: 'completed', total_amount: 80, product_name: '漓江景区门票', created_at: '2024-03-15', items: [{ product: { name: '漓江景区门票', image_url: '/image/b1.jpg' } }] },
        { id: 1002, status: 'pending', total_amount: 12, product_name: '桂林米粉', created_at: '2024-03-16', items: [{ product: { name: '桂林米粉', image_url: '/image/food-icon.webp' } }] }
      ]
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: '待付款', paid: '已付款', completed: '已完成', cancelled: '已取消'
  }
  return map[status] || status
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function cancelOrder(order: any) {
  if (!confirm('确定取消此订单吗？')) return
  order.status = 'cancelled'
}

function viewDetail(order: any) {
  appStore.speak('查看订单详情')
  alert(`订单号: ${order.id}\n商品: ${order.product_name || '--'}\n金额: ¥${order.total_amount || 0}\n状态: ${statusText(order.status)}`)
}

onMounted(loadOrders)
</script>

<style scoped>
.orders-page { background: var(--bg); min-height: 100vh; }

.order-list { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.order-card { padding: 14px; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.order-id { font-size: var(--font-xs); color: var(--text-hint); }
.order-status {
  font-size: var(--font-sm); font-weight: 600; padding: 2px 10px; border-radius: 10px;
}
.status-pending { background: rgba(243,156,18,0.1); color: #f39c12; }
.status-paid { background: rgba(52,152,219,0.1); color: #3498db; }
.status-completed { background: rgba(46,139,87,0.1); color: var(--primary); }
.status-cancelled { background: rgba(231,76,60,0.1); color: var(--danger); }
.order-items { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.order-image { width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover; }
.order-item-name { font-size: var(--font-md); color: var(--text-primary); }
.order-footer { display: flex; justify-content: space-between; margin-bottom: 10px; }
.order-total { font-size: var(--font-md); font-weight: 700; color: var(--accent); }
.order-date { font-size: var(--font-xs); color: var(--text-hint); }
.order-actions { display: flex; gap: 8px; justify-content: flex-end; }
.action-btn { font-size: var(--font-xs); padding: 6px 14px; border-radius: var(--radius-xl); cursor: pointer; }
.action-btn.detail { border: 1px solid var(--primary); color: var(--primary); }
.action-btn.cancel { border: 1px solid var(--danger); color: var(--danger); }
</style>