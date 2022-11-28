/**
 * This file is used to map API-specific JSON key descriptions to normalized key
 * descriptions used throughout the site.
 *
 * The structure of the jsonMapping object is:
 * {
 *   'apiSpecificKey': 'normalizedKey'
 * }
 *
 * And more specifically:
 * {
 *   'colorOfTheOutsideOfTheCar': 'exteriorColor',
 *   'modelYear': 'year'
 *   'powerLevelAsMeasuredByHorses': 'horsepower'
 * }
 */
const audiInventoryMapping = {
  driveType: "drivetrainDesc",
  modelPrice: "price",
  trimName: "trimDesc",
  distanceFromUser: "distance",
  vehicleOrderStatus: "deliveryDate",
};

const audiVinMapping = {
  bodyType: "Body Type",
  dealerName: "Dealer Name",
  dealerNote: "Dealer Note",
  driveType: "Drivetrain",
  //'equipments': '', //nested object
  exteriorColor: "Exterior Color",
  fuelType: "Fuel Type",
  gearType: "Gear Type",
  market: "Market",
  modelMileage: "Vehicle Mileage",
  modelName: "Model Name",
  modelYear: "Model Year",
  // 'technicalSpecifications': '',  //object
  trimName: "Trim Name",
  trimline: "Trim Line",
  upholsteryColor: "Interior Color",
  vehicleType: "Vehicle Type",
};

export { audiInventoryMapping, audiVinMapping };
