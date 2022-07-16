 /**
  * This file is used to map API specific JSON key descriptions to normalized key
  * descriptions used throughout the site.
  * 
  * The structure of the jsonMapping object is:
  * {
  *   'normalizedKey': 'apiSpecificKey'
  * }
  * 
  * And more specifically:
  * {
  *   'exteriorColor': 'colorOfTheOutsideOfTheCar',
  *   'year': 'modelYear',
  *   'horsepower': 'powerLevelAsMeasuredByHorses'
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
  }

// const hyundaiTransitStatus = {
//   'AA': 'At Sea',
//   'DS': 'Dealer Stock',
//   'IR': 'In Transit',
//   'IT': 'In Transit',
//   'PA': 'Port Arrival',
//   'TN': 'Ready for Shipment',
// }

// const hyundaiVinDetailMapping = {
//   'DealerPrice': 'Dealer Price',
//   'DI': 'DI',
//   'colors': 'colors',
//   'MAPPrice': 'Market Adjustment Price',
//   'accessories': 'Accessories',
//   'cityMpg': 'City MPG',
//   'classDesc': 'Class Description',
//   'colorDesc': 'Color Description',
//   'cylinders': 'Cylinders',
//   'dealerCd': 'Dealer Code',
//   'doorCd': 'Door Code',
//   'drivetrain': 'Drivetrain',
//   'drivetrainDesc': 'Drivetrain Description',
//   'engineDesc': 'Engine Description',
//   'engineDisplacement': 'Engine Displacement',
//   'epaClassDesc': 'EPA Class Description',
//   'epaEstAvgMpg': 'EPA Estimated Average MPG',
//   'extColorDesc': 'External Color Description',
//   'freight': 'Freight Charge',
//   'fuelDesc': 'Fuel Description',
//   'highwayMpg': 'Highway MPG',
//   'horsepower': 'Horsepower',
//   'intColorDesc': 'Interior Color Description',
//   'inventoryStatus': 'Inventory Status',
//   'mileage': 'Mileage',
//   'modelCd': 'Model Code',
//   'modelGroupCd': 'Model Group Code',
//   'modelNm': 'Model Number',
//   'modelYear': 'Model Year',
//   'msrp': 'MSRP',
//   'packages': 'Packages',
//   'plannedDeliveryDate': 'Planned Delivery Date',
//   'rbcSavings': 'RBC Savings',
//   'sortableMileage': 'Vehicle Mileage',
//   'totalAccessoryPrice': 'Total Accessory Price',
//   'totalExtColorPrice': 'Total Exterior Color Price',
//   'totalIntColorPrice': 'Total Interior Color Price',
//   'totalOptions': 'Total Options Price',
//   'totalPackageOptionPrice': 'Total Package Options Price',
//   'totalPackagePrice': 'Total Package Price',
//   'totalPackages': 'Total Packages',
//   'transmissionDesc': 'Transmission Description',
//   'trimDesc': 'Trim Description',
//   'vin': 'VIN'
// }

export {
  genesisInventoryMapping
};