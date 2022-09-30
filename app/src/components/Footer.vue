<template>
  <b-container fluid class="footer">
    <b-row align-h="center" class="d-flex justify-content-center" >
      Copyright ©{{ this.currentYear }} The EV Finder | 
      Licensed under &nbsp;
      <a href="https://github.com/Ben-Chapman/EVFinder/blob/main/LICENSE">
        GNU GPLv3
      </a>
      </b-row>

      <b-row align-h="center" class="d-flex justify-content-center py-2">
        <a href="https://github.com/Ben-Chapman/EVFinder">
          <b-icon-github
            aria-hidden="true"
            class="ml-4"
            font-scale="1.3"
            variant="dark">
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
  .footer {
  position: sticky;
  bottom: 0;
  height: auto;
}
</style>
