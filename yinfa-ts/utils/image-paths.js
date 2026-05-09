const IMAGE = '/image'

const img = (name) => IMAGE + '/' + name

module.exports = {
  IMAGE_ROOT: IMAGE,

  SCENIC: {
    b1: img('b1.jpg'),
    b2: img('b2.jpg'),
    b3: img('b3.jpg'),
  },

  FOOD: {
    72: img('72.png'),
    11: img('11.png'),
    12: img('12.png'),
    21: img('21.png'),
    22: img('22.png'),
    31: img('31.png'),
  },

  MODULE: {
    41: img('41.png'),
    42: img('42.png'),
    icon3: img('icon3.webp'),
    mapMarker: img('map-marker.png'),
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
