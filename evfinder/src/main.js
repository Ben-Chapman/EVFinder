import "./assets/main.css";

import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
});

createApp(App).use(vuetify).mount("#app");

// const app = createApp(App);

// app.use(createPinia());
// app.use(router);
// app.use(vuetify);

// app.mount("#app");
