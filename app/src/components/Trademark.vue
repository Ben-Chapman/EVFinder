<template>
  <b-container fluid>
    <b-row align-h="center">
      <!-- <h1 class="slogan">The Fastest and Easiest Way To Find Your New Electric Vehicle</h1>-->
      <h1 class="slogan">Find Your New {{ this.displayName }} With The EV Finder</h1>
    </b-row>
</b-container>
</template>

<script>
export default {
  props: {
    displayName: String
  },
}

</script>

<style>
.slogan {
  color: #fff;
  font-size: 2.5rem;
  filter: drop-shadow(3px 3px 1.5px #3d3d3d);
}
</style>
