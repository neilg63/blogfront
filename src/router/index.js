import Vue from 'vue'
import Router from 'vue-router'
import Detail from '@/components/Detail'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Detail
    },
    {
      path: '/filter/:filter',
      name: 'Filter',
      component: Detail
    },
    {
      path: '/:name',
      name: 'Detail',
      component: Detail
    },
    {
      path: '/:name/:sub',
      name: 'Detail',
      component: Detail
    },
    {
      path: '/:name/:sub/:sub',
      name: 'Detail',
      component: Detail
    }
  ]
});
