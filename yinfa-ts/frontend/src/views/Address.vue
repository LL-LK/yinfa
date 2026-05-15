<template>
  <div :class="['address-page', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner">
      <span class="banner-icon">📍</span>
      <div>
        <div class="banner-title">地址管理</div>
        <div class="banner-desc">管理您的收货地址</div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="addresses.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <div class="empty-title">暂无地址</div>
      <div class="empty-desc">点击下方按钮添加地址</div>
    </div>

    <div v-else class="address-list">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        :class="['address-card card', { default: addr.is_default }]"
      >
        <div class="addr-header">
          <span class="addr-name">{{ addr.full_name }}</span>
          <span class="addr-phone">{{ addr.phone }}</span>
          <span v-if="addr.is_default" class="default-badge">默认</span>
        </div>
        <div class="addr-line">{{ addr.address_line }}</div>
        <div class="addr-city">{{ addr.city }} {{ addr.postal_code }}</div>
        <div class="addr-actions">
          <button class="addr-action" @click="editAddress(addr)">✏️ 编辑</button>
          <button class="addr-action danger" @click="deleteAddress(addr)">🗑️ 删除</button>
          <button v-if="!addr.is_default" class="addr-action" @click="setDefault(addr)">⭐ 设为默认</button>
        </div>
      </div>
    </div>

    <div class="add-section">
      <button class="btn-accent add-btn" @click="showForm = true">+ 添加新地址</button>
    </div>

    <div v-if="showForm" class="form-overlay" @click.self="showForm = false">
      <div class="form-panel">
        <div class="form-header">
          <span class="form-title">{{ editingAddress ? '编辑地址' : '添加地址' }}</span>
          <button class="form-close" @click="closeForm">✕</button>
        </div>
        <div class="form-body">
          <div class="form-group">
            <label class="form-label">收货人 *</label>
            <input v-model="form.full_name" type="text" class="form-input" placeholder="请输入收货人姓名" />
          </div>
          <div class="form-group">
            <label class="form-label">联系电话 *</label>
            <input v-model="form.phone" type="tel" class="form-input" placeholder="请输入联系电话" />
          </div>
          <div class="form-group">
            <label class="form-label">所在地区</label>
            <input v-model="form.city" type="text" class="form-input" placeholder="省/市/区" />
          </div>
          <div class="form-group">
            <label class="form-label">详细地址 *</label>
            <textarea v-model="form.address_line" class="form-textarea" rows="2" placeholder="街道/门牌号等"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">邮政编码</label>
            <input v-model="form.postal_code" type="text" class="form-input" placeholder="邮政编码（选填）" />
          </div>
          <div class="form-group">
            <label class="form-checkbox">
              <input type="checkbox" v-model="form.is_default" />
              <span>设为默认地址</span>
            </label>
          </div>
          <button class="btn-primary submit-btn" @click="saveAddress">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const loading = ref(false)
const showForm = ref(false)
const editingAddress = ref<any>(null)

const addresses = ref([
  { id: 1, full_name: '张大爷', phone: '138****5678', address_line: '桂林市秀峰区中山路88号', city: '桂林市 秀峰区', postal_code: '541001', is_default: true }
])

const form = reactive({
  full_name: '',
  phone: '',
  city: '桂林市',
  address_line: '',
  postal_code: '',
  is_default: false
})

function editAddress(addr: any) {
  editingAddress.value = addr
  form.full_name = addr.full_name
  form.phone = addr.phone
  form.city = addr.city
  form.address_line = addr.address_line
  form.postal_code = addr.postal_code || ''
  form.is_default = addr.is_default
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingAddress.value = null
  form.full_name = ''
  form.phone = ''
  form.city = '桂林市'
  form.address_line = ''
  form.postal_code = ''
  form.is_default = false
}

function saveAddress() {
  if (!form.full_name) { alert('请输入收货人姓名'); return }
  if (!form.phone) { alert('请输入联系电话'); return }
  if (!form.address_line) { alert('请输入详细地址'); return }

  if (editingAddress.value) {
    Object.assign(editingAddress.value, { ...form })
  } else {
    addresses.value.push({ id: Date.now(), ...form })
  }

  if (form.is_default) {
    addresses.value.forEach(a => {
      if (a !== editingAddress.value) a.is_default = false
    })
  }

  appStore.speak('地址已保存')
  closeForm()
}

function deleteAddress(addr: any) {
  if (!confirm('确定删除此地址吗？')) return
  addresses.value = addresses.value.filter(a => a.id !== addr.id)
}

function setDefault(addr: any) {
  addresses.value.forEach(a => a.is_default = false)
  addr.is_default = true
}
</script>

<style scoped>
.address-page { background: var(--bg); min-height: 100vh; }

.address-list { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.address-card { padding: 14px; }
.address-card.default { border-left: 4px solid var(--primary); }
.addr-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.addr-name { font-size: var(--font-lg); font-weight: 700; color: var(--text-primary); }
.addr-phone { font-size: var(--font-sm); color: var(--text-secondary); }
.default-badge { font-size: 11px; background: rgba(255,107,53,0.1); color: var(--accent); padding: 1px 8px; border-radius: 8px; font-weight: 600; }
.addr-line { font-size: var(--font-md); color: var(--text-primary); margin-bottom: 4px; }
.addr-city { font-size: var(--font-sm); color: var(--text-hint); margin-bottom: 8px; }
.addr-actions { display: flex; gap: 12px; }
.addr-action { font-size: var(--font-xs); color: var(--primary); padding: 2px 8px; cursor: pointer; }
.addr-action.danger { color: var(--danger); }

.add-section { padding: 16px; }
.add-btn { width: 100%; padding: 14px; font-size: var(--font-lg); }

.form-overlay {
  position: fixed; top: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px; height: 100vh;
  background: rgba(0,0,0,0.4); z-index: 200;
  display: flex; align-items: flex-end;
}
.form-panel {
  background: var(--bg-card); width: 100%; max-height: 85vh; overflow-y: auto;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  animation: slideUp 0.3s ease;
}
.form-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border-light);
}
.form-title { font-size: var(--font-lg); font-weight: 700; }
.form-close { font-size: 20px; color: var(--text-hint); }
.form-body { padding: 20px; }
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: var(--font-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
.form-input {
  width: 100%; padding: 10px 14px; background: var(--bg-input);
  border-radius: var(--radius-sm); font-size: var(--font-md);
}
.form-textarea {
  width: 100%; padding: 10px 14px; background: var(--bg-input);
  border-radius: var(--radius-sm); font-size: var(--font-md); resize: none;
}
.form-checkbox { display: flex; align-items: center; gap: 8px; font-size: var(--font-sm); color: var(--text-secondary); cursor: pointer; }
.form-checkbox input { width: 20px; height: 20px; accent-color: var(--primary); }
.submit-btn { width: 100%; padding: 14px; font-size: var(--font-lg); margin-top: 8px; }
</style>