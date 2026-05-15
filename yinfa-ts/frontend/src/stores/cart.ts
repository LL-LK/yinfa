import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

interface CartItem {
  id: number
  product: {
    id: number
    name: string
    price: number
    image_url: string
  }
  quantity: number
  checked?: boolean
  image?: string
  name?: string
  price?: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)

  const totalCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const totalPrice = computed(() =>
    items.value.reduce((s, i) => s + i.quantity * (i.product.price || 0), 0)
  )

  async function fetchCart(openid: string) {
    if (!openid) return
    loading.value = true
    try {
      const res = await api.get('/cart', { params: { openid } })
      items.value = res.data || []
    } catch (e) {
      console.error('Failed to fetch cart:', e)
    } finally {
      loading.value = false
    }
  }

  async function addToCart(openid: string, productId: number, quantity = 1) {
    try {
      await api.post('/cart/add', { openid, product_id: productId, quantity })
      await fetchCart(openid)
    } catch (e) {
      console.error('Failed to add to cart:', e)
    }
  }

  async function removeItem(itemId: number, openid: string) {
    try {
      await api.delete(`/cart/${itemId}`)
      await fetchCart(openid)
    } catch (e) {
      console.error('Failed to remove from cart:', e)
    }
  }

  async function updateQuantity(itemId: number, quantity: number, openid: string) {
    try {
      await api.put(`/cart/${itemId}`, { quantity })
      await fetchCart(openid)
    } catch (e) {
      console.error('Failed to update quantity:', e)
    }
  }

  return { items, loading, totalCount, totalPrice, fetchCart, addToCart, removeItem, updateQuantity }
})
