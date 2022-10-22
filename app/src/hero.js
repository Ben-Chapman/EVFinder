export default function getHeroImage() {
  const heroImages = [
    {
      imageNames: [
        ["2022-gv60-1.jpg", "-26rem center"],
        ["2022-gv60-2.jpg", "-10rem center"],
        ["2022-gv60-3.jpg", "-10rem center"],
        ["2022-gv60-4.jpg", "-42rem center"],
      ],
      overlayText: "2022 Genesis GV60",
      modelOptionsValue: "GV60"
    },
    {
      imageNames: [
        ["2023-id4-1.jpg", "-18.5rem center"],
        ["2023-id4-2.jpg", "-36rem center"],
        ["2023-id4-3.jpg", "-35rem center"],
        ["2023-id4-4.jpg","-23.5rem center"],  // maybe image
      ],
      overlayText: "2023 Volkswagen ID.4",
      modelOptionsValue: "ID.4"
    },
    {
      imageNames: [
        ["2023-ioniq5-1.jpg", "-20rem center"],
        ["2023-ioniq5-2.jpg", "-44.5rem center"], //maybe pic
        ["2023-ioniq5-3.jpg", "-47rem center"],
        ["2023-ioniq5-4.jpg", "-28rem center"],
      ],
      overlayText: "2023 Hyundai Ioniq 5",
      modelOptionsValue: "Ioniq%205"
    },
    {
      imageNames: [
        ["2023-ev6-1.jpg", "-28rem center"],
        ["2023-ev6-2.jpg", "-43.5rem center"],
        ["2023-ev6-3.jpg", "-45rem center"],
      ],
      overlayText: "2023 Kia EV6",
      modelOptionsValue: "N"
    },
    {
      imageNames: [
        ["2023-kona-1.jpg", "-10rem center"], //nogo
        ["2023-kona-2.jpg", "-20rem center"],
        ["2023-kona-3.jpg", "-10rem center"],  //maybe
      ],
      overlayText: "2023 Hyundai Kona Electric",
      modelOptionsValue: "Kona%20Ev"
    },
    {
      imageNames: [
        ["2023-niro-1.jpg", "-20rem center"],
        ["2023-niro-2.jpg", "-38rem center"],
        ["2023-niro-3.jpg", "-26.5rem center"],
      ],
      overlayText: "2023 Kia Niro EV",
      modelOptionsValue: "V"
    },
  ]
  
  // Random int which will be used to select an element from heroImages
  const randomVehicle = Math.floor(Math.random() * (heroImages.length))
  const randomImageIndex = Math.floor(Math.random() * (heroImages[randomVehicle]['imageNames'].length))
  const randomImage = heroImages[randomVehicle].imageNames[randomImageIndex][0]

  const baseImagePath = "hero_images/"
  const blurredImagePath = baseImagePath.concat('blurred/')
  const mobileImagePath = baseImagePath.concat('mobile/')
  let imageUrl = ""

  /**
   * Detecting mobile devices with screen max-width dimensions.
   * This will account for phones, portrait and landscape, and smaller
   * tablets. If a mobile device is detected, serve the mobile-optimized
   * hero image.
   */  
  // Phones in landscape and other mobile devices.
  if (window.matchMedia('(max-width: 1024px)').matches) {
    imageUrl = mobileImagePath + randomImage
  } else {
    imageUrl = baseImagePath + randomImage
  }

  return {
    "imageUrl": imageUrl,
    "portraitPosition": heroImages[randomVehicle].imageNames[randomImageIndex][1],
    "blurredImageUrl": blurredImagePath + randomImage,
    "title": heroImages[randomVehicle].overlayText,
  }
}