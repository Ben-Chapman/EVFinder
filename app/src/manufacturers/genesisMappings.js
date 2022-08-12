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

const genesisInventoryMapping = {
  'IntColor': 'interiorColor',
  'ExtColorDesc': 'exteriorColor',
  'TrimDesc': 'trimDesc',
  'Drivetrain': 'drivetrainDesc',
  'SortablePrice': 'price',
  'status': 'inventoryStatus',
  'range': 'distance',
  'VIN': 'vin',
  'DlrName': 'dealerName',
  'PlannedDeliveryDate': 'deliveryDate',
  }

const genesisVinMapping = {
  "vin": "VIN",
  "DealerCd": "Dealer Code",
  "DlrName": "Dealer Name",
  "DlrZipCode": "Dealer Zip Code",
  "StockNumber": "Stock Number",
  "deliveryDate": "Planned Delivery Date",
  "PresaleVehicleFlag": "Presale Vehicle Flag",
  "FormattedPrice": "MSRP",
  "Model": "Model",
  "ModelTitle": "Model Title",
  "ModelYear": "Model Year",
  "trimDesc": "Trim Description",
  "Mileage": "Mileage",
  "Seating": "Seating",
  "Drivetrain": "Drivetrain",
  "DrivetrainDesc": "Drivetrain Description",
  "EngineDesc": "Engine Description",
  "Trans": "Transmission",
  "ExtColorCd": "Exterior Color Code",
  "exteriorColor": "Exterior Color",
  "IntColorCd": "Interior Color Code",
  "interiorColor": "Interior Color",
  "HorsePower": "Horsepower",
  "CityMPGRating": "City MPG Rating",
  "EPAEstAvgMPGRating": "EPA Estimated MPG Rating",
  "HighwayMPGRating": "Highway MPG Rating",
  "Freight": "Freight",
  "Package": "Package",
  }

export {
  genesisInventoryMapping,
  genesisVinMapping
};