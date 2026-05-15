import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useAppStore = defineStore('app', () => {
  const fontSizeMode = ref<'normal' | 'large' | 'xlarge'>(
    (localStorage.getItem('fontSizeMode') as any) || 'normal'
  )
  const voiceEnabled = ref(localStorage.getItem('voiceEnabled') !== 'false')
  const voiceRate = ref(parseFloat(localStorage.getItem('voiceRate') || '1.0'))
  const voiceVolume = ref(parseFloat(localStorage.getItem('voiceVolume') || '0.8'))

  watch(fontSizeMode, (val) => {
    localStorage.setItem('fontSizeMode', val)
  })

  watch(voiceEnabled, (val) => {
    localStorage.setItem('voiceEnabled', String(val))
  })

  watch(voiceRate, (val) => {
    localStorage.setItem('voiceRate', String(val))
  })

  watch(voiceVolume, (val) => {
    localStorage.setItem('voiceVolume', String(val))
  })

  function setFontSize(mode: 'normal' | 'large' | 'xlarge') {
    fontSizeMode.value = mode
  }

  function toggleVoice() {
    voiceEnabled.value = !voiceEnabled.value
  }

  function speak(text: string) {
    if (!voiceEnabled.value || !text) return
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = voiceRate.value
      utterance.volume = voiceVolume.value
      window.speechSynthesis.speak(utterance)
    }
  }

  return {
    fontSizeMode,
    voiceEnabled,
    voiceRate,
    voiceVolume,
    setFontSize,
    toggleVoice,
    speak
  }
})