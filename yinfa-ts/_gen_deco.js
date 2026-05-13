const sharp = require('sharp')

sharp('image/IMG_3984(1).PNG')
  .resize(81, 81)
  .webp({ quality: 85 })
  .toFile('image/tabbar/center-deco.webp')
  .then(() => console.log('center-deco.webp created'))
  .catch(e => console.error('Error:', e))