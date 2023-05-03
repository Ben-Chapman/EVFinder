<template>
  <b-container fluid>
    <b-row align-h="center">
      <!-- Display on small displays (mobile portrait) -->
      <h1
        class="slogan-small-display text-center d-flex d-sm-none mt-0"
        :class="sloganTextColor"
      >
      Find Your New {{ this.displayName }}<br>With The EV Finder
      </h1>

      <!-- Show this version on all other displays -->
      <h1
        class="slogan-large-display d-none d-sm-none d-md-block"
        :class="sloganTextColor"
      >
      Find Your New {{ this.displayName }} With The EV Finder
      </h1>
    </b-row>
</b-container>
</template>

<script>

export default {
  props: {
    displayName: String,
    textColor: String
  },


  computed: {
    sloganTextColor() {
      return this.textColor == "dark" ? "dark-text" : "light-text"
    }
  }
}
// console.log(this.displayName)
</script>

<style>
.slogan-large-display {
  font-size: 2.5rem;
}

.slogan-small-display {
  font-size: 1.5rem;
  line-height: 2rem;
}

.dark-text {
  color: #1d1d1d;
  backdrop-filter: blur(3px) saturate(70%);
  padding: 0px 40px;
}

.light-text {
  color: #fff;
  filter: drop-shadow(0px 5px 8px #3d3d3d);

}
</style>
