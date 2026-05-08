import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const openid = ref(localStorage.getItem('openid') || '')
  const nickname = ref(localStorage.getItem('nickname') || '桂林游客')
  const avatarUrl = ref(localStorage.getItem('avatarUrl') || '')
  const phone = ref(localStorage.getItem('phone') || '')
  const isLoggedIn = ref(!!openid.value)

  function setUser(user: { openid: string; nickname: string; avatar_url: string; phone: string }) {
    openid.value = user.openid
    nickname.value = user.nickname || '桂林游客'
    avatarUrl.value = user.avatar_url || ''
    phone.value = user.phone || ''
    isLoggedIn.value = true

    localStorage.setItem('openid', user.openid)
    localStorage.setItem('nickname', user.nickname || '')
    localStorage.setItem('avatarUrl', user.avatar_url || '')
    localStorage.setItem('phone', user.phone || '')
  }

  function logout() {
    openid.value = ''
    nickname.value = '桂林游客'
    avatarUrl.value = ''
    phone.value = ''
    isLoggedIn.value = false
    localStorage.clear()
  }

  return { openid, nickname, avatarUrl, phone, isLoggedIn, setUser, logout }
})
