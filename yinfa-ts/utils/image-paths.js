const IMAGE = '/image'

const img = (name) => IMAGE + '/' + name

module.exports = {
  IMAGE_ROOT: IMAGE,

  SCENIC: {
    b1: img('b1.jpg'),
    b2: img('b2.jpg'),
    b3: img('b3.jpg'),
    c1: img('c1.webp'),
    C2: img('C2.webp'),
  },

  FOOD: {
    72: img('food-icon.webp'),
    11: img('ba9d180733a820eab9090f72775f48b7.webp'),
    12: img('7a713f6124978b9503f590ae6f5a9f83.webp'),
    21: img('f86251f1476c3e751de19e2f7604de6b.webp'),
    22: img('19b616cc4fddc46918bad267ead3dcd0.webp'),
    31: img('6951bea09da43fe79b53867f0829e5a9.webp'),
  },

  MODULE: {
    41: img('41.png'),
    42: img('42.png'),
    icon3: img('icon3.webp'),
    mapMarker: img('map-marker.png'),
    foodIcon: img('food-icon.webp'),
    mapIcon: img('map-icon.webp'),
    transportIcon: img('transport-icon.webp'),
    cartIcon: img('cart-icon.webp'),
    healthIcon: img('health-icon.webp'),
    sosIcon: img('sos-icon.webp'),
    trafficIcon: img('traffic-icon.webp'),
    assistantIcon: img('assistant-icon-v2.webp'),
    bgMap: img('bg-map.webp'),
    bgFood: img('bg-food.webp'),
    bgTransport: img('bg-transport.webp'),
    bgHealth: img('bg-health.webp'),
    bgEmergency: img('bg-emergency.webp'),
    bgCart: img('bg-cart.webp'),
  },

  SWIPER: {
    img0329: img('IMG_0329.webp'),
    img0333: img('IMG_0333.webp'),
    img0337: img('IMG_0337.webp'),
    img0347: img('IMG_0347.webp'),
    img0349: img('IMG_0349.webp'),
    img3693: img('IMG_3693.webp'),
    img3706: img('IMG_3706.webp'),
    img3709: img('IMG_3709.webp'),
  },

  TABBAR: {
    home: 'image/tabbar/home.png',
    homeActive: 'image/tabbar/home-active.png',
    scenic: 'image/tabbar/scenic.png',
    scenicActive: 'image/tabbar/scenic-active.png',
    safety: 'image/tabbar/safety.png',
    safetyActive: 'image/tabbar/safety-active.png',
    user: 'image/tabbar/user.png',
    userActive: 'image/tabbar/user-active.png',
  },

  CART: {
    cart1: img('cart1.webp'),
    cart2: img('cart2.webp'),
  },

  FALLBACK: img('icon3.webp'),
}
