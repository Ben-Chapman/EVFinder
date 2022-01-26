import Vue from 'vue'
import VueHead from 'vue-head'
import { VuePlausible } from 'vue-plausible'

import App from './App.vue'

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Vue.use(VueHead)

Vue.use(VuePlausible, {
  domain: 'theevfinder.com',
  trackLocalhost: false,
  enableAutoPageviews: true,
  enableAutoOutboundTracking: true,
})

import './assets/app_style.scss'
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
