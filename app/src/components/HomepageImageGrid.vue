<template>
  <b-row class="d-flex mt-3" align-h="center">
    <b-card
      overlay
      :img-src=this.randomVehicle.src
      :img-alt=randomVehicle.title
      text-variant="white"
      :title=randomVehicle.title
    >
    </b-card>
  </b-row>
</template>

<script>
export default {
  mounted() {
  },

  data() {
    return {
      vehicleImages: [
        {
          imageName: "2022-gv60.jpeg",
          overlayText: "2022 Genesis GV60"
        },
        {
          imageName: "2023-id.4.jpg",
          overlayText: "2023 Volkswagen ID.4"
        },
        {
          imageName: "2022-ioniq5.jpeg",
          overlayText: "2022 Hyundai Ioniq 5"
        },
        {
          imageName: "2023-ev6.jpeg",
          overlayText: "2023 Kia EV6"
        },
        {
          imageName: "2023-kona-electric.jpeg",
          overlayText: "2023 Hyundai Kona Electric"
        },
        {
          imageName: "2023-niro-ev.jpeg",
          overlayText: "2023 Kia Niro EV"
        },
      ],
    }
  },
  
  computed: {
    randomVehicle() {
      const rand = Math.floor(Math.random() * (this.vehicleImages.length))

      return {
        "src": "hero_images".concat('/', this.vehicleImages[rand].imageName),
        "title": this.vehicleImages[rand].overlayText
      }
    }
  },

  
}
</script>

<style lang="scss">

</style>