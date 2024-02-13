import Vue from "vue";
import VueRouter from "vue-router";
import App from "../App.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: App,
  },
  {
    path: "/inventory/:year/:manufacturer/:model",
    component: App,
    props: (route) => ({
      // These are the available query params
      zipcode: route.query.zipcode,
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
