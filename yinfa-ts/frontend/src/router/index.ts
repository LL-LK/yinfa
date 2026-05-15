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
      path: '/scenic',
      name: 'Scenic',
      component: () => import('../views/Scenic.vue')
    },
    {
      path: '/safety',
      name: 'Safety',
      component: () => import('../views/Safety.vue')
    },
    {
      path: '/user',
      name: 'User',
      component: () => import('../views/User.vue')
    },
    {
      path: '/category',
      name: 'Category',
      component: () => import('../views/Category.vue')
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('../views/Cart.vue')
    },
    {
      path: '/details',
      name: 'Details',
      component: () => import('../views/Details.vue')
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import('../views/Orders.vue')
    },
    {
      path: '/address',
      name: 'Address',
      component: () => import('../views/Address.vue')
    },
    {
      path: '/map',
      name: 'Map',
      component: () => import('../views/Map.vue')
    },
    {
      path: '/list',
      name: 'List',
      component: () => import('../views/List.vue')
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('../views/Search.vue')
    },
    {
      path: '/food',
      name: 'Food',
      component: () => import('../views/Food.vue')
    },
    {
      path: '/transport',
      name: 'Transport',
      component: () => import('../views/Transport.vue')
    },
    {
      path: '/assistant',
      name: 'Assistant',
      component: () => import('../views/Assistant.vue')
    },
    {
      path: '/emergency',
      name: 'Emergency',
      component: () => import('../views/Emergency.vue')
    },
    {
      path: '/health',
      name: 'Health',
      component: () => import('../views/Health.vue')
    },
    {
      path: '/traffic',
      name: 'Traffic',
      component: () => import('../views/Traffic.vue')
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