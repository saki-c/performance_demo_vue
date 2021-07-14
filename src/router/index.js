import Vue from 'vue'
import Router from 'vue-router'

//导入登录页面组件
import Login from '@/views/login.vue'
import Home from '@/views/home.vue'


Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'Default',
      redirect: '/user',
      component: Home
    },
    {
      // home页面并不需要被访问，只是作为其它组件的父组件
      path: '/home',
      name: 'Home',
      component: Home,
      meta: {
        requireAuth: true
      },
      children: [{
          path: '/user',
          name: 'User',
          component: () => import('@/views/user/index'),
          meta: {
            requireAuth: true
          }
        },
        {
          path: '/home',
          name: 'Home',
          component: () => import('@/views/home/index'),
          meta: {
            requireAuth: true
          }
        },
        {
          path: '/department',
          name: 'Department',
          component: () => import('@/views/department/index'),
          meta: {
            requireAuth: true
          }
        },

        {
          path: '/performance',
          name: 'Performance',
          component: () => import('@/views/performance/index'),
          meta: {
            requireAuth: true
          }
        }
      ]
    },
    //添加登录页面路由
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})
