import axios from 'axios'

const API_BASE = 'https://web-production-58353.up.railway.app/api'
const IMAGE_BASE = 'https://web-production-58353.up.railway.app/image'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export function getImageUrl(path: string): string {
  if (!path) return `${IMAGE_BASE}/icon3.webp`
  if (path.startsWith('http')) return path
  if (path.startsWith('/image/')) return IMAGE_BASE + path.slice('/image'.length)
  if (path.startsWith('/assets/image/')) return IMAGE_BASE + path.slice('/assets/image'.length)
  return `${IMAGE_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

export { IMAGE_BASE }
export default api
