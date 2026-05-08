<template>
  <div class="address-page">
    <h1>📍 地址管理</h1>
    <p class="subtitle">管理您的收货地址，方便快速下单</p>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">
      <p>⚠️ 加载失败</p>
      <button @click="loadAddresses">重试</button>
    </div>

    <div v-else-if="addresses.length === 0" class="empty">
      <p>📭 暂无地址，点击下方按钮添加</p>
    </div>

    <div v-else class="address-list">
      <div v-for="addr in addresses" :key="addr.id" class="address-card" :class="{ default: addr.is_default }">
        <div class="addr-header">
          <strong>{{ addr.full_name }}</strong>
          <span class="phone">{{ addr.phone }}</span>
          <span v-if="addr.is_default" class="badge">默认</span>
        </div>
        <p class="addr-line">{{ addr.address_line }}</p>
        <p class="addr-city">{{ addr.city }} {{ addr.postal_code }}</p>
      </div>
    </div>

    <button class="add-btn">+ 添加新地址</button>
  </div>
</template>

<script>
export default {
  name: 'AddressView',
  data() {
    return { addresses: [], loading: true, error: false }
  },
  methods: {
    loadAddresses() {
      this.loading = true
      this.error = false
      setTimeout(() => {
        this.loading = false
      }, 500)
    }
  },
  mounted() { this.loadAddresses() }
}
</script>

<style scoped>
.address-page { padding: 20px; max-width: 600px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 20px; }
.address-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid transparent; }
.address-card.default { border-left-color: #ff6b35; }
.addr-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.phone { color: #666; }
.badge { background: #fff0e8; color: #ff6b35; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.addr-line, .addr-city { color: #666; margin: 4px 0; }
.add-btn { width: 100%; padding: 14px; background: #ff6b35; color: #fff; border: none; border-radius: 12px; font-size: 16px; margin-top: 20px; cursor: pointer; }
.empty, .error, .loading { text-align: center; padding: 60px 20px; color: #888; }
</style>