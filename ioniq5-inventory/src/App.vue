<template>
  <div>
    <b-row>
      <Header/>
    </b-row>

    <b-row >
      <InventoryGrid/>
    </b-row>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import InventoryGrid from './components/InventoryGrid.vue'

export default {
  name: 'App',
  components: {
    Header,
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
