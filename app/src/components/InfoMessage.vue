<template>
  <div class="d-flex justify-content-center">
  <b-card
    class="no-inventory"
    bg-variant="warning"
    text-variant="white"
    >
    <b-card-text>
      <p class="h4">{{ infoTitle }}</p>
      <p class=pt-3 v-html="infoText"></p>
    </b-card-text>
  </b-card>
</div>
</template>


<script>
export default {
  props: {
    infoTitle: { required: true, type: String },
    infoText: { required: true, type: String },
  },
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
    .no-inventory {width: 85vw;}
  }

</style>
