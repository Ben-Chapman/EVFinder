import Vue from 'vue'
import VueRouter from 'vue-router'
import App from '../App.vue'

// import store from '../vuexStore'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: App,
    props: route => ({
      // These are the available query params
      zipcode: route.query.z,  // ?z=90210
      year: route.query.y,  // ?y=2022
      model: route.query.m,
      radius: route.query.r,
      trim: route.query.t,
      color: route.query.c,
      drivetrain: route.query.d,
      msrp: route.query.mp,
    })
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router