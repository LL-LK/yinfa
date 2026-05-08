import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/address',
      name: 'Address',
      component: () => import('../views/Address.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('../views/Cart.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/category',
      name: 'Category',
      component: () => import('../views/Category.vue')
    },
    {
      path: '/details',
      name: 'Details',
      component: () => import('../views/Details.vue')
    },
    {
      path: '/list',
      name: 'List',
      component: () => import('../views/List.vue')
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import('../views/Orders.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('../views/Search.vue')
    },
    {
      path: '/user',
      name: 'User',
      component: () => import('../views/User.vue')
    },
    {
      path: '/map',
      name: 'Map',
      component: () => import('../views/Map.vue')
    }
  ]
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const openid = localStorage.getItem('openid')
    if (!openid) {
      next({ path: '/user', query: { redirect: to.fullPath } })
      return
    }
  }
  next()
})

export default router