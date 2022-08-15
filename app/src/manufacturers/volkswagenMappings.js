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

const volkswagenInventoryMapping = {
  'interiorColorDescription': 'interiorColor',
  'exteriorColorDescription': 'exteriorColor',
  'trimLevel': 'trimDesc',
  'msrp': 'price',
  'status': 'inTransit',
  'name': 'dealerName',
  'url': 'dealerUrl',
  'PlannedDeliveryDate': 'deliveryDate',
  }

const volkswagenVinMapping = {
  "carlineKey": "",
  "dealer": "",
  "dealerEnrollmentStatusInd": "",
  "dealerInstalledAccessories": "",
  "destinationCharge": "Destination Charge",
  "engineDescription": "Engine Description",
  // "exteriorColorBaseColor": "Exterior Base Color",
  "exteriorColorCode": "Exterior Color Code",
  "exteriorColorDescription": "Exterior Color",
  "exteriorSwatchUrl": "",
  "factoryModelYear": "Factory Model Year",
  "highlightFeatures": "",
  "interiorColorBaseColor": "",
  "interiorColorCode": "Interior Color Code",
  "interiorColorDescription": "Interior Color",
  "interiorSwatchUrl": "",
  "mediaAssets": "",
  "mediaImageUrl": "",
  "mediaImageUrlAlt": "",
  "model": "Model",
  "modelCode": "Model Code",
  "modelVersion": "Model Version",
  "modelYear": "Model Year",
  "mpgCity": "City MPG",
  "mpgHighway": "Highway MPG",
  "msrp": "MSRP",
  "onlineSalesURL": "",
  "portInstalledOptions": "",
  "specifications": "",
  "subTrimLevel": "",
  "trimLevel": "Trim",
  "vin": "VIN",
  }

export {
  volkswagenInventoryMapping,
  volkswagenVinMapping
};