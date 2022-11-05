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
  // 'Drivetrain': 'drivetrainDesc',
  'totalPrice': 'price',  // pricing.cash.summary.items[].value where items[].type==total_vehicle_price
  'vehicleAvailabilityDisplayStatus': 'inventoryStatus',
  'dealerDistance': 'distance',  // dealer.distance
  'vin': 'vin',
  'dealerName': 'dealerName',  // dealer.name
  // 'PlannedDeliveryDate': 'deliveryDate',
  }

const chevroletVinMapping = {
  "vin": "VIN",
  "dealerBac": "Dealer Code",
  "dealerName": "Dealer Name",
  "dealerPostalCode": "Dealer Zip Code",
  "stock": "Stock Number",
  // "deliveryDate": "Planned Delivery Date",
  // "PresaleVehicleFlag": "Presale Vehicle Flag",
  "totalVehiclePrice": "MSRP", // prices.summary[].type == total_vehicle_price
  "model": "Model",
  // "ModelTitle": "Model Title",
  "year": "Model Year",
  "trimName": "Trim Description",
  "mileage": "Mileage",
  "seatingCapacity": "Seating",
  // "Drivetrain": "Drivetrain",
  // "DrivetrainDesc": "Drivetrain Description",
  // "EngineDesc": "Engine Description",
  // "Trans": "Transmission",
  "extColorOptionCode": "Exterior Color Code",
  "extColorDescription": "Exterior Color",
  "intColorOptionCode": "Interior Color Code",
  "intColorDescription": "Interior Color",
  // "HorsePower": "Horsepower",
  // "CityMPGRating": "City MPG Rating",
  // "EPAEstAvgMPGRating": "EPA Estimated MPG Rating",
  // "HighwayMPGRating": "Highway MPG Rating",
  // "Freight": "Freight",
  // "Package": "Package",
  }

export {
  chevroletInventoryMapping,
  chevroletVinMapping
};
