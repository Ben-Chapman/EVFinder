<template>
  <v-container fluid>
    <v-row align-h="center">
      <!-- Small displays (mobile portrait) -->
      <h1
        class="slogan-small-display text-center d-flex d-md-none mt-0"
        :class="sloganTextColor"
        id="slogan-small-display"
      >
        Find Your New {{ this.displayName }}<br />With The EV Finder
      </h1>

      <!-- Medium displays (mobile landscape, iPad portrait) -->
      <h1
        class="slogan-small-display d-none d-md-block d-lg-none"
        :class="sloganTextColor"
        id="slogan-medium-display"
      >
        Find Your New {{ this.displayName }} With The EV Finder
      </h1>

      <!-- Show this version on all other displays (Desktop, iPad landscape)-->
      <h1
        class="slogan-large-display d-none d-lg-block"
        :class="sloganTextColor"
        id="slogan-large-display"
      >
        Find Your New {{ this.displayName }} With The EV Finder
      </h1>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    props: {
      displayName: String,
      textColor: String,
    },

    computed: {
      sloganTextColor() {
        return this.textColor == "dark" ? "dark-text" : "light-text";
      },
    },
  };
</script>

<style>
  .slogan-small-display {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .slogan-large-display {
    font-size: 2.5rem;
  }

  .dark-text {
    color: #2d2d2d;
    text-shadow:
      2px 5px 5px rgba(139, 139, 139, 0.3),
      0px -4px 10px rgba(255, 255, 255, 0.789);
  }

  .light-text {
    color: #fff;
    filter: drop-shadow(0px 5px 8px #3d3d3d);
  }
</style>
