import Vue from 'vue'
import VueRouter from 'vue-router'
import App from '../App.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App,
    props: route => ({
      // query: route.query.q,
      zipcode: route.zipcode.z,  // url/?z=90210
      // year: '2022',
      // model: 'Ioniq%205',
      // radius: '',
    })
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router