<template>
  <b-container
    fluid
    class="d-flex flex-column justify-content-center min-vh-100 hero"
    :style="{backgroundImage: `url('${getHeroImage['imageUrl']}')`}"
    >
    <div class="justify-content-center">
      <FormSelectors/>
    </div>
    <b-row class="flex-fill">
      <!-- <transition name="fade"> -->
        <InventoryTable v-if="this.showTable"/>
      <!-- </transition> -->
    </b-row>
    <b-row class="frosted-bg">
      <Footer/>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from 'vuex'
import Footer from './components/Footer.vue'
import FormSelectors from './components/FormSelectors.vue'
import InventoryTable from './components/InventoryTable.vue'
import { version } from '../package.json'


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
    InventoryTable,
  },

  computed: {
    // Vuex
    ...mapState([
        'inventoryCount',
        'showTable',
      ]),
    getHeroImage() {
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
      
      // If we're showing the inventory results table, do this
      if (this.showTable) {
        return {
          "imageUrl": null,
        }
        
      } else {
        return {
          "imageUrl": relativeImagePath.concat('/', vehicleImages[rand].imageName),
          "title": vehicleImages[rand].overlayText
        }
      }
      
    },
  },  //computed

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

  .frosted-bg {
    mask: linear-gradient(transparent, black 20%);
    backdrop-filter: blur(20px) saturate(50%);
  }

  .hero {
     /**
     * :style="" in the container definition is needed to dynamically generate
     * the background image url from getHeroImage(). The remainder of the
     * CSS can be defined here.
     */
    background-size: cover;
    background-position: center center;
    background-attachment: fixed;
  }

</style>
