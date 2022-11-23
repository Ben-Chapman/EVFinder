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
  'driveType': 'drivetrainDesc',
  'modelPrice': 'price',
  'trimName': 'trimDesc',
  'distanceFromUser': 'distance',
  'vehicleOrderStatus': 'deliveryDate'

}

const audiVinMapping = {
}

export {
  audiInventoryMapping,
  audiVinMapping
}
