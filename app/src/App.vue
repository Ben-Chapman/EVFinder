 <template>
  <b-container
    fluid
    class="d-flex flex-column justify-content-center min-vh-100"
    :style="heroImageStyle"
    id="background"
    >
    <!-- Search form -->
    <div flex class="justify-content-center">
      <SearchForm/>
    </div>

    <!-- Slogan Text -->
    <b-row class="flex-fill">
      <transition name="slide-fade" mode="out-in">
      <Slogan
        v-if="!this.showTable"
        :display-name="this.heroImage['displayName']"
        :text-color="this.heroImage['textColor']"
      />
    </transition>

    <!-- Inventory Table -->
      <transition name="fade" mode="out-in">
        <InventoryTable v-if="this.showTable"/>
      </transition>
    </b-row>

    <!-- Footer -->
    <b-row>
      <Footer/>
    </b-row>
  </b-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { version } from '../package.json'

import Footer from './components/Footer.vue'
import InventoryTable from './components/InventoryTable.vue'
import SearchForm from './components/SearchForm.vue'
import Slogan from './components/Slogan.vue'

import { isValidUrlPath, segmentUrlPath } from './helpers/libs'
import { getHeroImage, preloadBlurredImage } from './helpers/heroImages'


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
    InventoryTable,
    SearchForm,
    Slogan,
  },
  data() {
    return {
      heroImage: {},
      imagePosition: "center center",
      transition: ""
    }
  },
  mounted() {
    // When mounted, check the URL path for a deep link. If found do stuff
    const uri = this.$route.path
    const urlPath = segmentUrlPath(uri)

    if (urlPath.length == 4 && isValidUrlPath(uri)) {
      // Push the requested URL information into Vuex
      this.updateStore({
        'form': {
          'year': urlPath[1],
          'model': urlPath[3].toLowerCase()
        }
      })
      // We have an invalid URL path, so redirect back to /
    } else if (uri != '/') {
      // The query params (if present) are stripped in SearchForm.vue
      this.$router.push({ path: '/' })
    }
      // Fetch the background image
      this.heroImage = getHeroImage(this.form.model)

      if (window.matchMedia("(orientation: portrait)").matches) {
        this.imagePosition = this.heroImage['portraitPosition']
      }

      /**
       * When a random image is selected, push the vehicle model into Vuex.
       * This will be picked up by the FormSelectors component and update the
       * dropdown menu to reflect the vehicle image being shown.
       */
      this.updateStore({'form': {'model': this.heroImage['model']}})


    // Listen for orientation changes, and adjust the image position as needed
    window.addEventListener("resize", this.handleOrientationChange)

    // Push display dimensions to Plausible
    const width  = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth
    const height = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight

    this.$plausible.trackEvent(
      'Display Dimensions', {props: {dimensions: `${width}x${height}`}}
    )

    /**
     * Finally, prefetch the blurred background image, which will be swapped in when
     * the user performs an inventory search. This helps to ensure the we can swap into
     * the blurred image smoothly, without waiting for it to download at search time.
     * Using the load event to fetch this image after the entire page has loaded.
     */
    window.addEventListener('load', () => {
      preloadBlurredImage(this.heroImage["blurredImageUrl"])
    })
  },  // mounted

  computed: {
    // Vuex
    ...mapState([
        'inventoryCount',
        'showTable',
        'form'
      ]),

    heroImageStyle() {
        return {
          backgroundImage: `url(${this.heroImage.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: this.imagePosition,
          backgroundAttachment: 'fixed',
          transition: this.transition
        }
      },
  },  //computed
  methods: {
      ...mapActions([
        'updateStore'
        ]),

    handleOrientationChange() {
      if (window.matchMedia("(orientation: landscape)").matches) {
        this.imagePosition = "center center"
        this.transition = ""  // Prevent bg image sliding when transitioning to landscape
      }
      else if (this.showTable) {
        /**
         * Turns out, when rotating from landscape back to portrait, the image
         * sliding in behind the table is *really* annoying. Thus, preventing that.
         */
        this.transition = ""
      }
      else if (window.matchMedia("(orientation: portrait)").matches) {
        this.transition = "1s background ease"
        this.imagePosition = this.heroImage['portraitPosition']
      }
    }
  },
  watch: {
      showTable() {
        /**
         * When the inventory table is shown, swap the existing background image for the
         * blurred variant. This blurred variant is now an out of focus element on the
         * page (literally and figuratively).
         */
        this.transition = ".3s background ease"
        this.heroImage["imageUrl"] = this.heroImage["blurredImageUrl"]
      }
  },  // watch
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

  .fade-enter-active, .fade-leave-active {
    transition: opacity 2s
  }

  .fade-enter, .fade-leave-to {
      opacity: 0
  }

  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
  }
</style>
