<template>
  <div class="d-flex justify-center">
    <v-card class="no-inventory" color="secondary" dark>
      <v-card-text>
        <div class="h4">{{ infoTitle }}</div>
        <div class="pt-3" v-html="this.staticInfoText"></div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  export default {
    props: {
      infoTitle: { required: true, type: String },
      infoText: { required: true, type: String },
    },
    data() {
      return {
        staticInfoText: this.infoText,
      };
    },
  };
</script>

<style scoped>
  @import "../assets/app_style.scss";
</style>
