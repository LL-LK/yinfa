const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL || '/image'

export function imgUrl(path: string): string {
  if (!path) return `${IMAGE_BASE}/icon3.png`
  if (path.startsWith('/image/')) {
    return `${IMAGE_BASE}${path.slice(6)}`
  }
  if (path.startsWith('/assets/image/')) {
    return `${IMAGE_BASE}${path.slice(13)}`
  }
  if (path.startsWith('http')) return path
  return `${IMAGE_BASE}/${path.replace(/^\//, '')}`
}

export { IMAGE_BASE }
