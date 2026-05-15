export const IMG = (name: string) => `/image/${name}`

export const IMAGES = {
  // 轮播图
  b1: IMG('b1.jpg'),
  b2: IMG('b2.jpg'),
  b3: IMG('b3.jpg'),
  c1: IMG('c1.webp'),
  C2: IMG('C2.webp'),

  // 景点图
  scenic3693: IMG('IMG_3693.webp'),
  scenic3706: IMG('IMG_3706.webp'),
  scenic3709: IMG('IMG_3709.webp'),
  scenic3710: IMG('IMG_3710.webp'),
  scenicLongji: IMG('scenic-longji.webp'),
  scenicLiangjiang: IMG('scenic-liangjiang.webp'),
  scenicPoster: IMG('IMG_3710.webp'),

  // 美食图
  foodIcon: IMG('food-icon.webp'),
  food1: IMG('ba9d180733a820eab9090f72775f48b7.webp'),
  food2: IMG('7a713f6124978b9503f590ae6f5a9f83.webp'),
  food3: IMG('f86251f1476c3e751de19e2f7604de6b.webp'),
  food4: IMG('19b616cc4fddc46918bad267ead3dcd0.webp'),
  food5: IMG('6951bea09da43fe79b53867f0829e5a9.webp'),

  // 功能图标
  transportIcon: IMG('transport-icon.webp'),
  mapIcon: IMG('map-icon.webp'),
  cartIcon: IMG('cart-icon.webp'),
  healthIcon: IMG('health-icon.webp'),
  sosIcon: IMG('sos-icon.webp'),
  trafficIcon: IMG('traffic-icon.webp'),
  assistantIcon: IMG('assistant-icon-v2.webp'),
  mapMarker: IMG('map-marker.png'),

  // 背景图
  bgFood: IMG('bg-food.webp'),
  bgTransport: IMG('bg-transport.webp'),
  bgEmergency: IMG('bg-emergency.webp'),
  bgHealth: IMG('bg-health.webp'),
  bgMap: IMG('bg-map.webp'),
  bgCart: IMG('bg-cart.webp'),

  // 底部导航栏图标
  tabbar: {
    home: IMG('tabbar/home.png'),
    homeActive: IMG('tabbar/home-active.png'),
    scenic: IMG('tabbar/scenic.png'),
    scenicActive: IMG('tabbar/scenic-active.png'),
    safety: IMG('tabbar/safety.png'),
    safetyActive: IMG('tabbar/safety-active.png'),
    user: IMG('tabbar/user.png'),
    userActive: IMG('tabbar/user-active.png'),
    centerDeco: IMG('tabbar/center-deco.webp'),
  },

  fallback: IMG('food-icon.webp'),
}

export function img(path: string): string {
  if (!path) return IMAGES.fallback
  if (path.startsWith('http') || path.startsWith('data:')) return path
  if (path.startsWith('/image/')) return path
  if (path.startsWith('image/')) return '/' + path
  return `/image/${path}`
}

export default IMAGES