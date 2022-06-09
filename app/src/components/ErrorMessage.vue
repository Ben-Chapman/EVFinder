<template>
  <b-card
    style="max-width: 60vw"
    bg-variant="warning"
    text-variant="white"
    title="Hmm, There's Been an Error"
  >
    <b-card-text class="pt-3">
      There was a server error with this request: <code class="error-message">{{ this.apiErrorDetail[2] }} ({{ this.apiErrorDetail[1] }})</code>

      <p class="pt-3">Please refresh this page, or retry your request.</p>
    </b-card-text>

    <b-button @click="refreshPage()" class="float-right" variant="primary">Retry</b-button>
  </b-card>
</template>

<script>
import {mapState} from 'vuex'

export default {
  methods: {
    refreshPage() {
      location.reload()
    }
  },
  computed: {
      ...mapState([
        'apiErrorDetail',
      ]),
  }
}
</script>

<style lang="scss">
  @import '../assets/app_style.scss';

  .error-message {
    color: #fff;
    font-family: $font-family-monospace;
    font-size: 1.1rem;
    letter-spacing: -.03rem;
}
</style>