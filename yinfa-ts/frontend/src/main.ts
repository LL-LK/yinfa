import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

const loadingEl = document.getElementById('app-loading')
if (loadingEl) {
  loadingEl.style.transition = 'opacity 0.3s ease'
  loadingEl.style.opacity = '0'
  setTimeout(() => loadingEl.remove(), 350)
}