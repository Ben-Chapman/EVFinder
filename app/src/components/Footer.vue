<template>
  <b-container fluid class="footer frosted-bg">
    <b-row align-h="center" class="d-flex justify-content-center py-2 footer-text">
      <span>©2022 &ndash; {{ this.currentYear }}</span>

      <span class="px-1">
        <GithubLogo />
      </span>

      <span>The EV Finder</span>
    </b-row>
  </b-container>
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
  @import "../assets/app_style.scss";

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
