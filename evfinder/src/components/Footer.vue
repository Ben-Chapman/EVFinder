<template>
  <v-container fluid class="footer frosted-bg">
    <v-row align="center" justify="center" class="d-flex py-2 footer-text">
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
  </v-container>
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
