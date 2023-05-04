export function getHeroImage() {
  const heroImages = [
    {
      imageNames: [
        ["2023-g80ev-1.jpg", "-22rem center", "light"],
        ["2023-g80ev-2.jpg", "-48rem center", "light"],
        ["2023-g80ev-3.jpg", "-10rem center", "dark"],
      ],
      displayName: "Genesis Electrified G80",
      modelName: "ElectrifiedG80",
    },
    {
      imageNames: [
        ["2022-gv60-1.jpg", "-15rem center", "light"],
        ["2022-gv60-2.jpg", "-40rem center", "light"],
        ["2022-gv60-3.jpg", "-10rem center", "light"],
      ],
      displayName: "Genesis GV60",
      modelName: "GV60",
    },
    {
      imageNames: [
        ["2023-id4-1.jpg", "-18.5rem center", "dark"],
        ["2023-id4-2.jpg", "-36rem center", "dark"],
        ["2023-id4-3.jpg", "-35rem center", "dark"],
        ["2023-id4-4.jpg", "-23.5rem center", "light"],
      ],
      displayName: "Volkswagen ID.4",
      modelName: "ID.4",
    },
    {
      imageNames: [
        ["2023-ioniq5-1.jpg", "-20rem center", "light"],
        ["2023-ioniq5-2.jpg", "-44.5rem center", "light"],
        ["2023-ioniq5-3.jpg", "-58rem center", "dark"],
        ["2023-ioniq5-4.jpg", "-28rem center", "light"],
      ],
      displayName: "Hyundai Ioniq 5",
      modelName: "Ioniq%205",
    },
    {
      imageNames: [
        ["2023-ev6-1.jpg", "-28rem center", "light"],
        ["2023-ev6-2.jpg", "-43.5rem center", "light"],
        ["2023-ev6-3.jpg", "-45rem center", "light"],
      ],
      displayName: "Kia EV6",
      modelName: "N",
    },
    {
      imageNames: [
        ["2023-kona-1.jpg", "-10rem center", "light"],
        ["2023-kona-2.jpg", "-20rem center", "light"],
        ["2023-kona-3.jpg", "-10rem center", "dark"],
      ],
      displayName: "Hyundai Kona Electric",
      modelName: "Kona%20Ev",
    },
    {
      imageNames: [
        ["2023-niro-1.jpg", "-20rem center", "light"],
        ["2023-niro-2.jpg", "-38rem center", "light"],
        ["2023-niro-3.jpg", "-26.5rem center", "light"],
      ],
      displayName: "Kia Niro EV",
      modelName: "V",
    },
    {
      imageNames: [
        ["2022-chevrolet-bolt-ev-1.jpg", "-17rem center", "light"],
        ["2022-chevrolet-bolt-ev-2.jpg", "-15rem center", "dark"],
        ["2023-chevrolet-bolt-ev-1.jpg", "-30rem center", "light"],
        ["2023-chevrolet-bolt-ev-2.jpg", "-36rem center", "light"],
      ],
      displayName: "Chevrolet Bolt EV",
      modelName: "Bolt EV",
    },
    {
      imageNames: [
        ["2022-chevrolet-bolt-euv-1.jpg", "-12rem center", "light"],
        ["2022-chevrolet-bolt-euv-2.jpg", "-28rem center", "dark"],
        ["2022-chevrolet-bolt-euv-3.jpg", "-24.5rem center", "light"],
        ["2022-chevrolet-bolt-euv-4.jpg", "-13rem center", "dark"],
      ],
      displayName: "Chevrolet Bolt EUV",
      modelName: "Bolt EUV",
    },
    {
      imageNames: [
        ["2021-mustang-mache-1.jpg", "-45rem center", "dark"],
        ["2021-mustang-mache-2.jpg", "-20rem center", "dark"],
        ["2021-mustang-mache-3.jpg", "-23rem center", "dark"],
        ["2021-mustang-mache-4.jpg", "-21rem center", "dark"],
        ["2022-mustang-mache-1.jpg", "-20rem center", "light"],
      ],
      displayName: "Ford Mustang Mach-E",
      modelName: "mache",
    },
    {
      imageNames: [
        ["2022-audi-etron-1.jpg", "-26rem center", "dark"],
        ["2022-audi-etron-s-1.jpg", "-16rem center", "dark"],
        ["2022-audi-etron-s-sportback-1.jpg", "-13rem center", "light"],
      ],
      displayName: "Audi e-tron®",
      modelName: "etron",
    },
    {
      imageNames: [
        ["2022-audi-etron-gt-1.jpg", "-25rem center", "dark"],
        ["2022-audi-etron-gt-2.jpg", "-10rem center", "light"],
        ["2022-audi-etron-gt-3.jpg", "-10rem center", "dark"],
      ],
      displayName: "Audi e-tron® GT",
      modelName: "etrongt",
    },
    {
      imageNames: [
        ["2022-audi-q4-1.jpg", "-22rem center", "light"],
        ["2022-audi-q4-2.jpg", "-8rem center", "light"],
        ["2022-audi-q4-sportback-1.jpg", "-29rem center", "dark"],
        ["2022-audi-q4-sportback-2.jpg", "-10rem center", "dark"],
        ["2023-audi-q4-1.jpg", "-24rem center", "light"],
      ],
      displayName: "Audi Q4 e-tron®",
      modelName: "q4",
    },
    {
      imageNames: [
        ["2023-ioniq6-1.jpg", "-40rem center", "light"],
        ["2023-ioniq6-3.jpg", "center center", "light"],
        ["2023-ioniq6-4.jpg", "-45rem center", "light"],
        ["2023-ioniq6-5.jpg", "-20rem center", "light"],
        ["2023-ioniq6-2.jpg", "-10rem center", "light"],
        ["2023-ioniq6-6.jpg", "-23rem center", "light"],
      ],
      displayName: "Hyundai Ioniq 6",
      modelName: "Ioniq%206",
    },
  ];

  // Random int which will be used to select an element from heroImages
  const randomVehicle = Math.floor(Math.random() * heroImages.length);
  const randomImageIndex = Math.floor(
    Math.random() * heroImages[randomVehicle]["imageNames"].length
  );
  const randomImage = heroImages[randomVehicle].imageNames[randomImageIndex][0];

  const baseImagePath = "hero_images/";
  const blurredImagePath = baseImagePath.concat("blurred/");
  const mobileImagePath = baseImagePath.concat("mobile/");
  let imageUrl = "";

  /**
   * Detecting mobile devices with screen max-width dimensions.
   * This will account for phones, portrait and landscape, and smaller
   * tablets. If a mobile device is detected, serve the mobile-optimized
   * hero image.
   */
  // Phones in landscape and other mobile devices.
  if (window.matchMedia("(max-width: 1024px)").matches) {
    imageUrl = mobileImagePath + randomImage;
  } else {
    imageUrl = baseImagePath + randomImage;
  }

  return {
    imageUrl: imageUrl,
    portraitPosition: heroImages[randomVehicle].imageNames[randomImageIndex][1],
    blurredImageUrl: blurredImagePath + randomImage,
    displayName: heroImages[randomVehicle].displayName,
    model: heroImages[randomVehicle].modelName,
    textColor: heroImages[randomVehicle].imageNames[randomImageIndex][2],
  };
}

export async function preloadBlurredImage(imageUrl) {
  var image = new Image();
  image.src = imageUrl;
}
