import Vue from "vue";
import { VuePlausible } from "vue-plausible";

import App from "./App.vue";

import router from "./router/routes.js";
import store from "./vuexStore";

import "./vueFilters.js";

import {
  AlertPlugin,
  BIconBoxArrowUpRight,
  BIconChevronDown,
  BIconGithub,
  BIconInfoCircle,
  BIconPhoneLandscape,
  BIconSliders,
  BIconX,
  BIconXCircle,
  BadgePlugin,
  ButtonPlugin,
  CardPlugin,
  CollapsePlugin,
  DropdownPlugin,
  FormCheckboxPlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormSelectPlugin,
  ImagePlugin,
  LayoutPlugin,
  LinkPlugin,
  ListGroupPlugin,
  ProgressPlugin,
  SpinnerPlugin,
  TablePlugin,
  TooltipPlugin,
} from "bootstrap-vue";

[
  AlertPlugin,
  BadgePlugin,
  ButtonPlugin,
  CardPlugin,
  CollapsePlugin,
  DropdownPlugin,
  FormCheckboxPlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormSelectPlugin,
  ImagePlugin,
  LayoutPlugin,
  LinkPlugin,
  ListGroupPlugin,
  ProgressPlugin,
  SpinnerPlugin,
  TablePlugin,
  TooltipPlugin,
].forEach((x) => Vue.use(x));

Vue.component("BIconBoxArrowUpRight", BIconBoxArrowUpRight);
Vue.component("BIconChevronDown", BIconChevronDown);
Vue.component("BIconGithub", BIconGithub);
Vue.component("BIconInfoCircle", BIconInfoCircle);
Vue.component("BIconPhoneLandscape", BIconPhoneLandscape);
Vue.component("BIconSliders", BIconSliders);
Vue.component("BIconX", BIconX);
Vue.component("BIconXCircle", BIconXCircle);

// Import Bootstrap an BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(VuePlausible, {
  domain: "theevfinder.com",
  trackLocalhost: false,
  enableAutoPageviews: true,
  enableAutoOutboundTracking: true,
});

import "./assets/app_style.scss";
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
