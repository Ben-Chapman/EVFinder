<template>
  <b-container
    fluid
    class="d-flex flex-column justify-content-center min-vh-100"
    :style="heroImageStyle"
    id="background"
    >
    <div class="justify-content-center">
      <FormSelectors/>
    </div>

    <b-row class="flex-fill">
      <transition name="fade" mode="out-in">
        <InventoryTable v-if="this.showTable"/>
      </transition>
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
  data() {
    return {
      heroImage: {}
    }
  },
  mounted() {
      this.getHeroImage()
  },  // mounted

  methods: {
    getHeroImage() {
      const heroImages = [
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
      
      // Random int which will be used to select an element from heroImages
      const rand = Math.floor(Math.random() * (heroImages.length))
      const relativeImagePath = "hero_images"

      this.heroImage = {
        "imageUrl": relativeImagePath.concat('/', heroImages[rand].imageName),
        "blurredImageUrl": relativeImagePath.concat('/blurred/', heroImages[rand].imageName),
        "title": heroImages[rand].overlayText,
      }
    },
  },

  computed: {
    // Vuex
    ...mapState([
        'inventoryCount',
        'showTable',
      ]),

    heroImageStyle() {
        return {
          backgroundImage: `url('${this.heroImage['imageUrl']}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          transition: '1s background ease'
        }
      },
  },  //computed

  watch: {
      showTable() {
        this.heroImage["imageUrl"] = this.heroImage["blurredImageUrl"]
      }
  },  // watch

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

  .fade-enter-active, .fade-leave-active {
    transition: opacity 2s
  }

  .fade-enter, .fade-leave-to {
      opacity: 0
  }
</style>
