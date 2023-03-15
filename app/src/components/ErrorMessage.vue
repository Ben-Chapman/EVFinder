<template>
  <div class="d-flex justify-content-center border-0">
    <b-card
      style="max-width: 60vw"
      bg-variant="warning"
      text-variant="white"
      title="Hmm, There's Been an Error"
    >
      <b-card-text class="pt-3">
        <!-- This is displayed for shorter HTTP responses like from the EVFinder
        API error text. -->
        <div v-if="this.apiErrorDetail[1].length <= 60">
        There was a server error with this request: <code class="error-message">{{ this.apiErrorDetail[1] }}</code>
          <p class="pt-3">Please refresh this page or retry.</p>
        </div>
        <div v-else>
          <!-- For longer error responses passed through from the various manufacturer
          APIs, we're collapsing the actual error text, accessible from an info button -->
          There was a server error with this request.
          <p class="pt-3">Please refresh this page or retry.
            <b-button size="sm" variant="link" class="px-0 info-button" v-b-toggle.collapse-2>
              <b-icon-info-circle aria-hidden="true"></b-icon-info-circle>
            </b-button>

            <b-collapse id="collapse-2">
              <b-card bg-variant="warning" text-variant="white">
                <code class="error-message">{{ this.apiErrorDetail[1] }}</code>
              </b-card>
            </b-collapse>
          </p>
        </div>
      </b-card-text>

      <b-button @click="refreshPage()" class="float-right" variant="primary">Retry</b-button>
    </b-card>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  mounted() {
    /**
     * If this component is called, we're showing an error message. Logging this
     * to Plausible
    */
    this.$plausible.trackEvent(
      'Error Message', {
        props: {
          statusCode: this.apiErrorDetail[1],
          queryParam: window.location.search,
        }
      }
    )
  },
  methods: {
    refreshPage() {
      location.reload()
    },
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

.info-button {
  color: #fff !important;
}
</style>
