<template>
  <v-layout>
    <v-footer class="frosted-bg text-center d-flex flex-column">
      <v-row justify="center" no-gutters>
        <span>©2022 &ndash; {{ this.currentYear }} The EV Finder</span>

        <span>
          <GithubLogo />
        </span>

        <span
          >Licensed under&nbsp;
          <a href="https://github.com/Ben-Chapman/EVFinder/blob/main/LICENSE">
            <u>GNU GPLv3</u>
          </a>
        </span>
      </v-row>
    </v-footer>
  </v-layout>
</template>

<script>
  import GithubLogo from "./GithubLogo.vue";
  export default {
    components: { GithubLogo },
    computed: {
      currentYear() {
        return new Date().getFullYear();
      },
    }, //computed
  };
</script>

<style lang="scss">
  // @import '../assets/app_style.scss';

  .footer {
    position: sticky;
    bottom: 0;
    height: auto;
  }

  .footer-text a {
    color: black;
  }

  .frosted-bg {
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
  }
</style>
