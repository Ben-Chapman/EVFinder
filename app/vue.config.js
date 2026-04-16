const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  configureWebpack: {
    resolve: {
      // vue-plausible bundles a nuxt-module.js that imports 'path', which is a
      // Node.js core module. Webpack 5 no longer polyfills these automatically.
      // Since the nuxt module is never used in a browser context, we exclude it.
      fallback: {
        path: false,
      },
    },
  },
});
