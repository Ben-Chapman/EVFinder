<template>
  <b-container
    fluid
    class="d-flex flex-column justify-content-center min-vh-100 hero-image"
    :style="{backgroundImage: `url('${randomHeroImage['imageUrl']}')`}"
    >
      <FormSelectors/>
    <b-row class="flex-fill">
      <!-- <HomepageImageGrid/> -->
      <InventoryTable/>
    </b-row>
    <b-row>
      <Footer/>
    </b-row>
  </b-container>
</template>

<script>
import Footer from './components/Footer.vue'
import FormSelectors from './components/FormSelectors.vue'
// import HomepageImageGrid from './components/HomepageImageGrid.vue'
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
    Footer,
    FormSelectors,
    // HomepageImageGrid,
    InventoryTable,
  },

  computed: {
    randomHeroImage() {
      // https://stackoverflow.com/questions/42872002/in-vue-js-component-how-to-use-props-in-css/52280182#52280182
      const vehicleImages = [
        {
          imageName: "2022-gv60.jpeg",
          overlayText: "2022 Genesis GV60"
        },
        {
          imageName: "2023-id.4.jpg",
          overlayText: "2023 Volkswagen ID.4"
        },
        {
          imageName: "2022-ioniq5.jpeg",
          overlayText: "2022 Hyundai Ioniq 5"
        },
        {
          imageName: "2023-ev6.jpeg",
          overlayText: "2023 Kia EV6"
        },
        {
          imageName: "2023-kona-electric.jpeg",
          overlayText: "2023 Hyundai Kona Electric"
        },
        {
          imageName: "2023-niro-ev.jpeg",
          overlayText: "2023 Kia Niro EV"
        },
      ]
      
      // Random int which will be used to select an element from vehicleImages
      const rand = Math.floor(Math.random() * (vehicleImages.length))

      const relativeImagePath = "hero_images"

      return {
        "imageUrl": relativeImagePath.concat('/', vehicleImages[rand].imageName),
        "title": vehicleImages[rand].overlayText
      }
    }
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
  min-height: 100vh;
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

.hero-image {
  background-size: cover;
}
</style>
