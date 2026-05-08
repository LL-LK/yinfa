import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

interface Order {
  id: number
  order_no: string
  total_price: number
  status: string
  created_at: string
  items: any[]
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const loading = ref(false)

  async function fetchOrders(openid: string) {
    if (!openid) return
    loading.value = true
    try {
      const res = await api.get('/orders', { params: { openid } })
      orders.value = res.data || []
    } catch (e) {
      console.error('Failed to fetch orders:', e)
    } finally {
      loading.value = false
    }
  }

  async function createOrder(openid: string, items: { product_id: number; quantity: number }[]) {
    try {
      const res = await api.post('/order/create', { openid, items })
      await fetchOrders(openid)
      return res.data
    } catch (e) {
      console.error('Failed to create order:', e)
      throw e
    }
  }

  const statusMap: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }

  const statusClass: Record<string, string> = {
    pending: 'warn',
    paid: 'info',
    shipped: 'info',
    completed: 'ok',
    cancelled: 'danger'
  }

  return { orders, loading, fetchOrders, createOrder, statusMap, statusClass }
})
