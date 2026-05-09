var LANG_MAP = {
  zh: {
    home: '首页',
    scenic: '景点导览',
    safety: '安全防护',
    profile: '个人中心',
    welcome: '欢迎使用桂林银发旅游',
    login: '微信一键登录',
    logout: '退出登录',
    myOrders: '我的订单',
    myFavorites: '我的收藏',
    healthRecord: '健康记录',
    emergencyContact: '紧急联系人',
    safetySettings: '安全设置',
    addressManagement: '地址管理',
    emergencyHelp: '紧急求助',
    voicePrompt: '语音提示',
    languageAssist: '语言辅助',
    fontSize: '字体大小',
    about: '关于桂林银发旅游',
    hotProducts: '🔥 热门推荐',
    more: '更多 >',
    mapNav: '地图导览',
    food: '桂林美食',
    transport: '交通出行',
    health: '健康记录',
    emergency: '紧急求助',
    products: '全部商品'
  },
  en: {
    home: 'Home',
    scenic: 'Scenic Spots',
    safety: 'Safety',
    profile: 'Profile',
    welcome: 'Welcome to Guilin Senior Travel',
    login: 'Login with WeChat',
    logout: 'Logout',
    myOrders: 'My Orders',
    myFavorites: 'My Favorites',
    healthRecord: 'Health Records',
    emergencyContact: 'Emergency Contacts',
    safetySettings: 'Safety Settings',
    addressManagement: 'Address Book',
    emergencyHelp: 'Emergency Help',
    voicePrompt: 'Voice Prompts',
    languageAssist: 'Language Assist',
    fontSize: 'Font Size',
    about: 'About Guilin Senior Travel',
    hotProducts: '🔥 Hot Recommendations',
    more: 'More >',
    mapNav: 'Map Guide',
    food: 'Local Cuisine',
    transport: 'Transport',
    health: 'Health Records',
    emergency: 'Emergency',
    products: 'All Products'
  },
  ja: {
    home: 'ホーム',
    scenic: '観光スポット',
    safety: '安全対策',
    profile: 'マイページ',
    welcome: '桂林シニア旅行へようこそ',
    login: 'WeChatでログイン',
    logout: 'ログアウト',
    myOrders: '注文履歴',
    myFavorites: 'お気に入り',
    healthRecord: '健康記録',
    emergencyContact: '緊急連絡先',
    safetySettings: '安全設定',
    addressManagement: 'アドレス帳',
    emergencyHelp: '緊急支援',
    voicePrompt: '音声ガイド',
    languageAssist: '言語サポート',
    fontSize: '文字サイズ',
    about: '桂林シニア旅行について',
    hotProducts: '🔥 おすすめ',
    more: 'もっと見る >',
    mapNav: 'マップ案内',
    food: 'グルメ',
    transport: '交通',
    health: '健康記録',
    emergency: '緊急',
    products: '全商品'
  },
  ko: {
    home: '홈',
    scenic: '관광지',
    safety: '안전',
    profile: '내 정보',
    welcome: '구린 시니어 여행에 오신 것을 환영합니다',
    login: 'WeChat 로그인',
    logout: '로그아웃',
    myOrders: '내 주문',
    myFavorites: '즐겨찾기',
    healthRecord: '건강 기록',
    emergencyContact: '긴급 연락처',
    safetySettings: '안전 설정',
    addressManagement: '주소록',
    emergencyHelp: '긴급 도움',
    voicePrompt: '음성 안내',
    languageAssist: '언어 지원',
    fontSize: '글자 크기',
    about: '구린 시니어 여행 소개',
    hotProducts: '🔥 인기 추천',
    more: '더보기 >',
    mapNav: '지도 안내',
    food: '맛집',
    transport: '교통',
    health: '건강 기록',
    emergency: '긴급',
    products: '전체 상품'
  }
}

function t(key) {
  var app = getApp()
  if (!app || !app.globalData) return key
  var lang = app.globalData.currentLang || 'zh'
  var dict = LANG_MAP[lang]
  if (!dict) dict = LANG_MAP['zh']
  return dict[key] || key
}

function getAllLangDict() {
  var app = getApp()
  if (!app || !app.globalData) return LANG_MAP['zh']
  var lang = app.globalData.currentLang || 'zh'
  return LANG_MAP[lang] || LANG_MAP['zh']
}

module.exports = {
  t: t,
  getAllLangDict: getAllLangDict,
  LANG_MAP: LANG_MAP
}
