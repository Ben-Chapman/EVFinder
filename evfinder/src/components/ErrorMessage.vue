<template>
  <v-container class="d-flex justify-center pt-4">
    <v-card class="error-card" color="amber darken-2" dark>
      <v-card-title> Hmm, There's Been an Error </v-card-title>
      <v-card-text class="pt-3 error-message">
        {{ errorMessage }}

        <div v-if="errorDetail">
          <p class="pt-3">
            Please adjust your search and retry.
            <v-btn icon small class="info-button" @click="showDetail = !showDetail">
              <v-icon>mdi-information</v-icon>
            </v-btn>

            <v-expand-transition>
              <div v-show="showDetail">
                <v-card color="amber darken-2" dark>
                  <code class="error-detail">{{ errorDetail }}</code>
                </v-card>
              </div>
            </v-expand-transition>
          </p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
  export default {
    data() {
      return {
        showDetail: false,
      };
    },
    props: {
      errorMessage: String,
      errorDetail: String,
    },
  };
</script>

<style scoped>
  .error-card {
    /* Add any specific styling for the error card here */
  }
  .info-button {
    /* Style adjustments for the info button if needed */
  }
</style>
