import Vue from 'vue'
import VueHead from 'vue-head'
import { VuePlausible } from 'vue-plausible'

import App from './App.vue'

import {
  BIconX,
  BIconXCircle,
  BIconChevronDown,
  BIconBoxArrowUpRight,
  BIconSliders,
  LayoutPlugin,
  FormGroupPlugin,
  FormSelectPlugin,
  FormInputPlugin,
  ButtonPlugin,
  TooltipPlugin,
  TablePlugin,
  IconsPlugin,
  DropdownPlugin,
  BadgePlugin,
  FormCheckboxPlugin,
  LinkPlugin,
  CardPlugin,
  ListGroupPlugin,
  SpinnerPlugin,
} from 'bootstrap-vue'

[
  LayoutPlugin,
  IconsPlugin,
  FormGroupPlugin,
  FormSelectPlugin,
  FormInputPlugin,
  ButtonPlugin,
  TooltipPlugin,
  TablePlugin,
  DropdownPlugin,
  BadgePlugin,
  FormCheckboxPlugin,
  LinkPlugin,
  CardPlugin,
  ListGroupPlugin,
  SpinnerPlugin,
].forEach(x => Vue.use(x));

Vue.component('BIconSliders', BIconSliders)
Vue.component('BIconX', BIconX)
Vue.component('BIconXCircle', BIconXCircle)
Vue.component('BIconChevronDown', BIconChevronDown)
Vue.component('BIconBoxArrowUpRight', BIconBoxArrowUpRight)


// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
// Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
// Vue.use(IconsPlugin)

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
