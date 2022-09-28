<template>
  <b-container fluid class="footer">
    <b-row align-h="center" class="d-flex justify-content-center" >
      Copyright ©{{ this.currentYear }} The EV Finder | 
      Licensed under &nbsp;
      <a href="https://github.com/Ben-Chapman/EVFinder/blob/main/LICENSE">
        GNU GPLv3
      </a>
      </b-row>

      <b-row align-h="center" class="d-flex justify-content-center pt-2">
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
  // width: 100%;
  height: auto; /* Set the fixed height of the footer here */
  // line-height: 60px; /* Vertically center the text there */
  background-color: rgba(156, 246, 104, 0.98);
}
</style>
