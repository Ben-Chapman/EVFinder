import Vue from "vue";
import VueRouter from "vue-router";
import App from "../App.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: App,
    props: (route) => ({
      // These are the available query params
      zipcode: route.query.z, // ?z=90210
      year: route.query.y, // ?y=2022
      model: route.query.m,
      radius: route.query.r,
    }),
  },
  {
    path: "/inventory/:year/:manufacturer/:model",
    component: App,
    props: (route) => ({
      // These are the available query params
      zipcode: route.query.zipcode, // ?z=90210
      year: route.query.year, // ?y=2022
      model: route.query.model,
      radius: route.query.radius,
    }),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
