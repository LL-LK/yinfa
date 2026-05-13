import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imageDir = path.join(__dirname, '..', 'image')

const tasks = [
  { src: 'IMG_3914.png', dest: 'health-icon.webp', label: '健康' },
  { src: 'IMG_3919.png', dest: 'map-icon.webp', label: '地图' },
  { src: 'IMG_3918.png', dest: 'transport-icon.webp', label: '交通' },
  { src: 'IMG_3915.png', dest: 'cart-icon.webp', label: '购物' },
]

for (const task of tasks) {
  const srcPath = path.join(imageDir, task.src)
  const destPath = path.join(imageDir, task.dest)

  await sharp(srcPath)
    .resize(128, 128, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(destPath)

  const srcInfo = await sharp(srcPath).metadata()
  const destInfo = await sharp(destPath).metadata()
  const srcSize = fs.statSync(srcPath).size
  const destSize = fs.statSync(destPath).size

  console.log(`[${task.label}] ${srcInfo.width}x${srcInfo.height} ${(srcSize / 1024).toFixed(0)}KB → ${destInfo.width}x${destInfo.height} ${(destSize / 1024).toFixed(1)}KB (${((1 - destSize / srcSize) * 100).toFixed(0)}%)`)
}