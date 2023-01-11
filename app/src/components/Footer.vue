<template>
  <b-container fluid class="footer frosted-bg">
    <b-row align-h="center" class="d-flex justify-content-center pt-1 footer-text">
      ©2022 &ndash; {{ this.currentYear }} The EV Finder | Licensed under&nbsp;
      <a href="https://github.com/Ben-Chapman/EVFinder/blob/main/LICENSE">
        <u>GNU GPLv3</u>
      </a>
    </b-row>

      <b-row align-h="center" class="d-flex justify-content-center py-2">
        <a target="_blank" href="https://github.com/Ben-Chapman/EVFinder">
          <b-icon-github
            aria-hidden="true"
            class="ml-4 icon"
            font-scale="1.3"
            variant="dark"
            >
          </b-icon-github>
        </a>
      </b-row>
  </b-container>
</template>

<script>
  export default {

  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },  //computed
}
</script>

<style lang="scss">
  @import '../assets/app_style.scss';

  .footer {
    position: sticky;
    bottom: 0;
    height: auto;
  }

  .footer-text a {
      color: black;
    }

  .icon:hover {
      color: $analogous-logo-green !important;
    }

  .frosted-bg {
    background-color: rgba(255, 255, 255, .15);
    backdrop-filter: blur(10px);
  }
</style>
