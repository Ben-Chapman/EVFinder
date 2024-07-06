<template>
  <v-container
    fluid
    class="d-flex flex-column justify-content-center min-vh-100"
    :style="heroImageStyle"
    id="background"
  >
    <!-- Search form -->
    <div flex class="justify-content-center">
      <!-- <SearchForm /> -->
    </div>

    <!-- Slogan Text -->
    <v-row class="flex-fill">
      <transition name="slide-fade" mode="out-in">
        <!-- <Slogan
          v-if="!this.showTable"
          :display-name="this.heroImage['displayName']"
          :text-color="this.heroImage['textColor']"
        /> -->
        <Foo />
      </transition>

      <!-- Inventory Table -->
      <transition name="fade" mode="out-in">
        <InventoryTable v-if="this.showTable" />
      </transition>
    </v-row>

    <!-- Footer -->
    <v-row>
      <Footer />
    </v-row>
  </v-container>
</template>

<!-- <script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script> -->
<script>
  // import { mapActions, mapState } from "vuex";
  import { version } from "../package.json";

  import Footer from "./components/Footer.vue";
  // import InventoryTable from "./components/InventoryTable.vue";
  // import SearchForm from "./components/SearchForm.vue";
  // import Slogan from "./components/Slogan.vue";
  import Foo from "./components/Foo.vue";

  import { isValidUrlPath, segmentUrlPath } from "./helpers/libs";
  import { getHeroImage, preloadBlurredImage } from "./helpers/heroImages";
  import GithubLogo from "../../app/src/components/GithubLogo.vue";

  console.log(`
The EVFinder release version ${version}

███████      Hey There!
██           Found a bug? -> https://github.com/Ben-Chapman/EVFinder/issues/new?template=bug_report.md
█████
██           Are you good with the Internet, software development and whatnot?
███████      Come help out -> https://github.com/Ben-Chapman/EVFinder

`);

  export default {
    name: "App",
    components: {
      Footer,
      GithubLogo,
      // InventoryTable,
      // SearchForm,
      // Slogan,
      // WelcomeItem,
      Foo,
    },

    data() {
      return {
        heroImage: {},
        imagePosition: "center center",
        transition: "",
      };
    },

    mounted() {
      // When mounted, check the URL path for a deep link. If found do stuff
      // const uri = this.$route.path;
      // const urlPath = segmentUrlPath(uri);
      // if (urlPath.length == 4 && isValidUrlPath(uri)) {
      //   // Push the requested URL information into Vuex
      //   this.updateStore({
      //     form: {
      //       year: urlPath[1],
      //       model: urlPath[3].toLowerCase(),
      //     },
      //   });
      //   // We have an invalid URL path, so redirect back to /
      // } else if (uri != "/") {
      //   // The query params (if present) are stripped in SearchForm.vue
      //   this.$router.push({ path: "/" });
      // }
      // // Fetch the background image
      // this.heroImage = getHeroImage(this.form.model);
      // if (window.matchMedia("(orientation: portrait)").matches) {
      //   this.imagePosition = this.heroImage["portraitPosition"];
      // }
      // /**
      //  * When a random image is selected, push the vehicle model into Vuex.
      //  * This will be picked up by the FormSelectors component and update the
      //  * dropdown menu to reflect the vehicle image being shown.
      //  */
      // this.updateStore({ form: { model: this.heroImage["model"] } });
      // // Listen for orientation changes, and adjust the image position as needed
      // window.addEventListener("resize", this.handleOrientationChange);
      // // Push display dimensions to Plausible
      // const width =
      //   window.innerWidth ||
      //   document.documentElement.clientWidth ||
      //   document.body.clientWidth;
      // const height =
      //   window.innerHeight ||
      //   document.documentElement.clientHeight ||
      //   document.body.clientHeight;
      // this.$plausible.trackEvent("Display Dimensions", {
      //   props: { dimensions: `${width}x${height}` },
      // });
      // /**
      //  * Finally, prefetch the blurred background image, which will be swapped in when
      //  * the user performs an inventory search. This helps to ensure the we can swap into
      //  * the blurred image smoothly, without waiting for it to download at search time.
      //  * Using the load event to fetch this image after the entire page has loaded.
      //  */
      // window.addEventListener("load", () => {
      //   preloadBlurredImage(this.heroImage["blurredImageUrl"]);
      // });
    }, // mounted

    computed: {
      // Vuex
      // ...mapState(["inventoryCount", "showTable", "form"]),

      heroImageStyle() {
        return {
          backgroundImage: `url(${this.heroImage.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: this.imagePosition,
          backgroundAttachment: "fixed",
          transition: this.transition,
        };
      },
    }, //computed
    methods: {
      // ...mapActions(["updateStore"]),

      handleOrientationChange() {
        if (window.matchMedia("(orientation: landscape)").matches) {
          this.imagePosition = "center center";
          this.transition = ""; // Prevent bg image sliding when transitioning to landscape
        } else if (this.showTable) {
          /**
           * Turns out, when rotating from landscape back to portrait, the image
           * sliding in behind the table is *really* annoying. Thus, preventing that.
           */
          this.transition = "";
        } else if (window.matchMedia("(orientation: portrait)").matches) {
          this.transition = "1s background ease";
          this.imagePosition = this.heroImage["portraitPosition"];
        }
      },
    },
    watch: {
      showTable() {
        /**
         * When the inventory table is shown, swap the existing background image for the
         * blurred variant. This blurred variant is now an out of focus element on the
         * page (literally and figuratively).
         */
        this.transition = ".3s background ease";
        this.heroImage["imageUrl"] = this.heroImage["blurredImageUrl"];
      },
    }, // watch
  };
</script>

<style scoped>
  header {
    line-height: 1.5;
    max-height: 100vh;
  }

  .logo {
    display: block;
    margin: 0 auto 2rem;
  }

  nav {
    width: 100%;
    font-size: 12px;
    text-align: center;
    margin-top: 2rem;
  }

  nav a.router-link-exact-active {
    color: var(--color-text);
  }

  nav a.router-link-exact-active:hover {
    background-color: transparent;
  }

  nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
  }

  nav a:first-of-type {
    border: 0;
  }

  @media (min-width: 1024px) {
    header {
      display: flex;
      place-items: center;
      padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
      margin: 0 2rem 0 0;
    }

    header .wrapper {
      display: flex;
      place-items: flex-start;
      flex-wrap: wrap;
    }

    nav {
      text-align: left;
      margin-left: -1rem;
      font-size: 1rem;

      padding: 1rem 0;
      margin-top: 1rem;
    }
  }
</style>
