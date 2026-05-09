const sharp = require('sharp')
const path = require('path')

const DIR = path.join(__dirname, 'image', 'tabbar')
const SIZE = 81

const ICONS = {
  home: { emoji: '\u{1F3E0}', color: '#2E8B57', activeColor: '#1B5E20' },
  scenic: { emoji: '\u{1F5FB}', color: '#FF9800', activeColor: '#E65100' },
  safety: { emoji: '\u{1F6E1}\uFE0F', color: '#EF5350', activeColor: '#C62828' },
  user: { emoji: '\u{1F464}', color: '#42A5F5', activeColor: '#1565C0' }
}

async function createIcon(name, emoji, color, isActive) {
  const suffix = isActive ? '-active' : ''
  const bgColor = isActive ? color : '#FFFFFF'
  const fgColor = isActive ? '#FFFFFF' : color
  const svgIcon = `<svg width="${SIZE}" height="${SIZE}">
    <rect width="${SIZE}" height="${SIZE}" rx="18" fill="${bgColor}"/>
    <text x="40.5" y="54" text-anchor="middle" font-size="44" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif" fill="${fgColor}">${emoji}</text>
  </svg>`
  await sharp(Buffer.from(svgIcon)).png().toFile(path.join(DIR, `${name}${suffix}.png`))
  console.log(`Created ${name}${suffix}.png`)
}

async function main() {
  for (const [name, cfg] of Object.entries(ICONS)) {
    await createIcon(name, cfg.emoji, cfg.color, false)
    await createIcon(name, cfg.emoji, cfg.activeColor, true)
  }
  console.log('\nAll 8 tabbar icons generated!')
}

main().catch(console.error)
