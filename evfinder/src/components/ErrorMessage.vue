<template>
  <div class="d-flex justify-content-center border-0 pt-4">
    <b-card
      class="error-card"
      bg-variant="warning"
      text-variant="white"
      title="Hmm, There's Been an Error"
    >
      <b-card-text class="pt-3 error-message">
        <!-- Displaying the errorMessage returned from the EV Finder API and collapsing
        any error detail, accessible from an info button -->
        {{ errorMessage }}

        <div v-if="errorDetail">
          <p class="pt-3">
            Please adjust your search and retry.
            <b-button size="sm" variant="link" class="px-0 pl-2 info-button" v-b-toggle.collapse-2>
              <b-icon-info-circle aria-hidden="true"></b-icon-info-circle>
            </b-button>

            <b-collapse id="collapse-2">
              <b-card bg-variant="warning" text-variant="white">
                <code class="error-detail">{{ errorDetail }}</code>
              </b-card>
            </b-collapse>
          </p>
        </div>
        <div v-else>
          <p class="pt-3">Please adjust your search and retry.</p>
        </div>
      </b-card-text>

      <b-button @click="refreshPage()" class="float-right" variant="primary">Retry</b-button>
    </b-card>
  </div>
</template>

<script>
import { logMessage } from '../helpers/logger'
import { mapState } from 'vuex'

export default {
  mounted() {
    // If this component is called, we're showing an error message
    // Logging the error text and form data which contains the detail of the user's
    // search
    logMessage(`${this.errorMessage}, ${this.errorDetail}`)
  },
  methods: {
    refreshPage() {
      location.reload()
    }
  },

  computed: {
    ...mapState(['apiErrorDetail', 'form']),

    errorMessage() {
      return this.apiErrorDetail[1].detail.errorMessage
    },

    errorDetail() {
      return this.apiErrorDetail[1].detail.errorData
    }
  }
}
</script>

<style lang="scss">
@import '../assets/app_style.scss';

// Mobile portrait
@include media-breakpoint-down(sm) {
  .error-card {
    width: 80vw;
  }
}

// Everything larger than mobile portrait
@include media-breakpoint-up(sm) {
  .error-card {
    width: 40vw;
  }
}

.error-message {
  font-size: 1.1rem;
}

.error-detail {
  color: #fff;
  font-family: $font-family-monospace;
  font-size: 1.1rem;
  letter-spacing: -0.03rem;
}

.info-button {
  color: #fff !important;
}
</style>
