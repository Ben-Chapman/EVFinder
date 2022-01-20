<template>
  <b-container>
    <b-row>
      <Header/>
    </b-row>

    <b-row>
      <FormSelector/>
    </b-row>

    <b-row>
      <InventoryGrid/>
    </b-row>
  </b-container>
</template>

<script>
import Header from './components/Header.vue'
import InventoryGrid from './components/InventoryGrid.vue'
import FormSelector from './components/FormSelector.vue'

export default {
  name: 'App',
  components: {
    Header,
    InventoryGrid,
    FormSelector
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
