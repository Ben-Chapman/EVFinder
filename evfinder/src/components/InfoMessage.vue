<template>
  <div class="d-flex justify-content-center border-0">
    <b-card class="no-inventory" bg-variant="secondary" text-variant="dark">
      <b-card-text>
        <p class="h4">{{ infoTitle }}</p>
        <p class="pt-3" v-html="this.staticInfoText"></p>
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
export default {
  props: {
    infoTitle: { required: true, type: String },
    infoText: { required: true, type: String }
  },
  data() {
    return {
      // When the "no inventory found" message is displayed, the year and model are
      // pulled from the SearchForm. After this Component is called and displayed and
      // a user selects another option from the SearchForm, the text would dynamically
      // change in response to user input. That's confusing, so storing the text which
      // was passed into this component, and use this static text for display in the UI.
      staticInfoText: this.infoText
    }
  }
}
</script>

<style lang="scss">
@import '../assets/app_style.scss';

.no-inventory {
  font-size: 1.2rem;
  text-align: center;
}

// For medium and smaller screens
@include media-breakpoint-down(md) {
  .no-inventory {
    width: 85vw;
  }
}
</style>
