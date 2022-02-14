<template>
  <div>
    <div>
      <FormOptions/>
    </div>
    <b-row >
      <InventoryGrid/>
    </b-row>
  </div>
</template>

<script>
import FormOptions from './components/FormSelectors.vue'
import InventoryGrid from './components/InventoryGrid.vue'

export default {
  name: 'App',
  components: {
    FormOptions,
    InventoryGrid,
  },

  // Vue.head config here
  head: {
    title: {
      inner: 'EV Finder'
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
