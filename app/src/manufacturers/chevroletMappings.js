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

const chevroletInventoryMapping = {
  'intColor': 'interiorColor',
  'extColor': 'exteriorColor',
  'trimName': 'trimDesc',  // trim.name
  'totalPrice': 'price',  // pricing.cash.summary.items[].value where items[].type==total_vehicle_price
  'vehicleAvailabilityDisplayStatus': 'deliveryDate',
  'dealerDistance': 'distance',  // dealer.distance
  'vin': 'vin',
  'dealerName': 'dealerName',  // dealer.name
  }

const chevroletVinMapping = {
  "vin": "VIN",
  "dealerBac": "Dealer Code",
  "dealerName": "Dealer Name",
  "dealerPostalCode": "Dealer Zip Code",
  "stock": "Stock Number",
  "totalVehiclePrice": "MSRP",  // prices.summary[].type == total_vehicle_price
  "model": "Model",
  "year": "Model Year",
  "trimName": "Trim Description",
  "mileage": "Mileage",
  "seatingCapacity": "Seating",
  "extColorOptionCode": "Exterior Color Code",
  "extColorDescription": "Exterior Color",
  "intColorOptionCode": "Interior Color Code",
  "intColorDescription": "Interior Color",
  "epaElectricRange": "EPA Estimated MPG Rating",  // keyFeatures[].iconKey == icon_epa_electric_range
  }

export {
  chevroletInventoryMapping,
  chevroletVinMapping
};
