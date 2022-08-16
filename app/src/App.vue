<template>
  <b-container fluid>
      <FormSelectors/>
    <b-row>
      <InventoryTable/>
    </b-row>
  </b-container>
</template>

<script>
import FormSelectors from './components/FormSelectors.vue'
import InventoryTable from './components/InventoryTable.vue'
import {version} from '../package.json'

console.log(`
The EVFinder release version ${version}

███████      Hey There!
██           Found a bug? -> https://github.com/Ben-Chapman/EVFinder/issues/new?template=bug_report.md
█████
██           Are you good with the Internet, software development and whatnot?
███████      Come help out -> https://github.com/Ben-Chapman/EVFinder

`)

export default {
  name: 'App',
  components: {
    FormSelectors,
    InventoryTable,
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

/*
This is needed to prevent horizontal scrolling when using a fluid (full-width) 
container
*/
.container-fluid {
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
}
</style>
