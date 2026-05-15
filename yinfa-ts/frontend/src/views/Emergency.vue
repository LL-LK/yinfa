<template>
  <div :class="['emergency', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="header">
      <div class="header-icon">👨‍👩‍👧</div>
      <span class="header-title">紧急联系人</span>
      <span class="header-desc">最多添加3位紧急联系人，遇到危险可一键求助</span>
    </div>

    <div v-if="!loading && contacts.length > 0" class="contact-list">
      <div v-for="contact in contacts" :key="contact.id" class="contact-card">
        <div class="contact-info">
          <div class="contact-header">
            <span class="contact-name">{{ contact.name }}</span>
            <span v-if="contact.is_primary" class="primary-badge">主联系人</span>
          </div>
          <span class="contact-phone">{{ contact.phone }}</span>
          <span v-if="contact.relationship" class="contact-relation">{{ contact.relationship }}</span>
        </div>
        <div class="contact-actions">
          <div class="action-btn call-btn" @click="makeCall(contact.phone)">
            <span class="action-icon">📞</span>
            <span>拨打</span>
          </div>
          <div class="action-btn location-btn" @click="sendLocation(contact.name)">
            <span class="action-icon">📍</span>
            <span>发位置</span>
          </div>
        </div>
        <div class="contact-footer">
          <div v-if="!contact.is_primary" class="footer-btn" @click="setPrimary(contact.id)"><span>设为主联系人</span></div>
          <div class="footer-btn danger" @click="deleteContact(contact.id, contact.name)"><span>删除</span></div>
        </div>
      </div>
    </div>

    <div v-if="!loading && contacts.length === 0" class="empty">
      <span class="empty-icon">📋</span>
      <span class="empty-text">还没有添加紧急联系人</span>
      <span class="empty-hint">添加家人或朋友的电话，遇到紧急情况可一键求助</span>
    </div>

    <div v-if="loading" class="loading"><span>加载中...</span></div>

    <div class="add-section">
      <div v-if="!showForm && contacts.length < 3" class="add-btn" @click="showAddForm">
        <span class="add-icon">＋</span>
        <span>添加紧急联系人</span>
      </div>

      <div v-if="showForm" class="form-section">
        <div class="form-title">添加紧急联系人</div>

        <div class="form-group">
          <span class="form-label">姓名</span>
          <input class="form-input" placeholder="请输入姓名" v-model="formData.name" />
        </div>

        <div class="form-group">
          <span class="form-label">手机号</span>
          <input class="form-input" type="number" maxlength="11" placeholder="请输入手机号" v-model="formData.phone" />
        </div>

        <div class="form-group">
          <span class="form-label">关系</span>
          <input class="form-input" placeholder="如：儿子、女儿、老伴" v-model="formData.relationship" />
        </div>

        <div class="form-group row">
          <span class="form-label">设为主要联系人</span>
          <input type="checkbox" v-model="formData.is_primary" />
        </div>

        <div class="form-actions">
          <div class="form-btn cancel-btn" @click="hideForm">取消</div>
          <div :class="['form-btn', 'submit-btn', { disabled: submitting }]" @click="submitContact">
            {{ submitting ? '添加中...' : '确认添加' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const loading = ref(false)
const showForm = ref(false)
const submitting = ref(false)

interface Contact {
  id: number; name: string; phone: string; relationship: string; is_primary: boolean;
}

const contacts = ref<Contact[]>([
  { id: 1, name: '张志明', phone: '138****5678', relationship: '儿子', is_primary: true },
  { id: 2, name: '李秀英', phone: '139****8901', relationship: '女儿', is_primary: false },
])

const formData = ref({ name: '', phone: '', relationship: '', is_primary: false })

function showAddForm() { showForm.value = true; appStore.speak('添加紧急联系人') }
function hideForm() { showForm.value = false; formData.value = { name: '', phone: '', relationship: '', is_primary: false } }

function submitContact() {
  if (!formData.value.name || !formData.value.phone) return
  submitting.value = true
  setTimeout(() => {
    contacts.value.push({
      id: Date.now(), name: formData.value.name, phone: formData.value.phone,
      relationship: formData.value.relationship, is_primary: formData.value.is_primary,
    })
    submitting.value = false
    hideForm()
    appStore.speak('已添加' + formData.value.name)
  }, 500)
}

function makeCall(phone: string) {
  appStore.speak('拨打' + phone)
  window.location.href = 'tel:' + phone.replace(/\*/g, '').substring(0, 3)
}

function sendLocation(name: string) {
  appStore.speak('发送位置给' + name)
  alert('正在发送您的位置给 ' + name)
}

function setPrimary(id: number) {
  contacts.value.forEach(c => c.is_primary = c.id === id)
  appStore.speak('已设置为主联系人')
}

function deleteContact(id: number, name: string) {
  if (confirm('确定要删除 ' + name + ' 吗？')) {
    contacts.value = contacts.value.filter(c => c.id !== id)
    appStore.speak('已删除' + name)
  }
}
</script>

<style scoped>
.emergency { background: var(--bg); min-height: 100vh; padding-bottom: 20px; }

.header { padding: 40px 20px 20px; text-align: center; }
.header-icon { font-size: 32px; }
.header-title { display: block; font-size: 19px; font-weight: 700; color: var(--text-primary); margin-top: 8px; }
.header-desc { display: block; font-size: 14px; color: var(--text-hint); margin-top: 4px; }

.contact-list { padding: 0 10px; }
.contact-card { background: var(--bg-card); border-radius: 8px; padding: 14px; margin-bottom: 8px; box-shadow: var(--shadow-sm); }
.contact-info { margin-bottom: 10px; }
.contact-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.contact-name { font-size: 19px; font-weight: 700; color: var(--text-primary); }
.primary-badge { font-size: 12px; padding: 3px 8px; background: var(--danger-light); color: var(--danger); border-radius: 10px; font-weight: 700; }
.contact-phone { display: block; font-size: 15px; color: var(--text-secondary); }
.contact-relation { display: block; font-size: 14px; color: var(--text-hint); margin-top: 2px; }

.contact-actions { display: flex; gap: 8px; margin-bottom: 10px; }
.action-btn { flex: 1; text-align: center; padding: 9px; background: var(--bg); border-radius: 4px; font-size: 14px; font-weight: 600; color: var(--text-primary); cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 4px; }
.action-btn:active { background: var(--bg-hover); }
.action-icon { font-size: 14px; }

.contact-footer { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid var(--border-light); }
.footer-btn { flex: 1; text-align: center; padding: 8px; font-size: 14px; color: var(--text-secondary); cursor: pointer; }
.footer-btn.danger { color: var(--danger); }
.footer-btn:active { opacity: 0.7; }

.empty { text-align: center; padding: 50px 20px; }
.empty-icon { font-size: 40px; }
.empty-text { display: block; font-size: 17px; color: var(--text-hint); margin-top: 10px; }
.empty-hint { display: block; font-size: 14px; color: var(--text-hint); margin-top: 4px; }

.add-section { padding: 10px; }
.add-btn { margin: 0 10px; text-align: center; padding: 14px; background: var(--danger); color: #fff; font-size: 17px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.add-btn:active { background: var(--danger-dark); transform: scale(0.97); }
.add-icon { font-size: 20px; font-weight: 700; }

.form-section { background: var(--bg-card); border-radius: 8px; padding: 14px; margin: 0 10px; box-shadow: var(--shadow-sm); }
.form-title { font-size: 19px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; text-align: center; }
.form-group { margin-bottom: 12px; }
.form-group.row { display: flex; align-items: center; justify-content: space-between; }
.form-label { display: block; font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.form-input { width: 100%; padding: 12px 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 4px; font-size: 17px; box-sizing: border-box; }
.form-actions { display: flex; gap: 10px; margin-top: 16px; }
.form-btn { flex: 1; padding: 14px; text-align: center; border-radius: 8px; font-size: 17px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.form-btn:active { transform: scale(0.97); }
.cancel-btn { background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); }
.submit-btn { background: var(--danger); color: #fff; }
.submit-btn:active { background: var(--danger-dark); }
.submit-btn.disabled { opacity: 0.5; }
</style>