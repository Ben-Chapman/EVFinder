 /*
This file is used to map API specific JSON key descriptions to normalized key
descriptions used throughout the site.
The structure of the jsonMapping object is:
{
'normalizedKey': 'apiSpecificKey'
}

And more specifically:
{
'exteriorColor': 'colorOfTheOutsideOfTheCar',
'year': 'modelYear',
'horsepower': 'powerLevelAsMeasuredByHorses'
}
 */

 export const kiaJsonMapping = {
  'ExtColorLongDesc': 'exteriorColorDescription',
  'trimDesc': 'edwTrim',
  'drivetrainDesc': 'drivetrainDescription',
  'price': 'msrp',
  'inventoryStatus': 'status',
  'distance': 'range',
  'vin-with-more-details': '',
  }

  export const kiaVinMapping = {
      "ExtColorLongDesc": 'Exterior Color',
      "trimDesc": 'Trim Description',
      "drivetrainDesc": 'Drivetrain',
      "price": 'MSRP',
      "distance": 'Miles from Zip Code',
      "bodyDescription": 'Body Description',
      "dealerCode": 'Dealer Code',
      "dealerPrice": 'Dealer Price',
      "drivetrainDrivetrain": 'Drivetrain Description',
      // "drivetrainId": '',
      "engineCylindersEngineCylinders": 'Engine Cylinders',
      // "engineCylindersId": '',
      "engineDisplacement": 'Engine Displacement',
      "exteriorColorCode": 'Exterior Color Code',
      // "exteriorColorEdwColorName": '',
      // "exteriorColorId": '',
      "exteriorColorName": 'Exterior Color Name',
      // "exteriorColorProcessType": '',
      // "exteriorColorUseSwatch": '',
      // "features0Options0": '',
      // "features0Options1": '',
      // "features0Options2": '',
      // "features0Options3": '',
      // "features0Title": '',
      // "id": '',
      "interiorColorCode": 'Interior Color Code',
      "interiorColorDescription": 'Interior Color',
      // "interiorColorEdwColorName": '',
      // "interiorColorId": '',
      // "interiorColorName": '',
      // "interiorColorProcessType": '',
      // "interiorColorUseSwatch": '',
      // "locationLatitude": '',
      // "locationLongitude": '',
      "mileage": 'Mileage',
      // "modelId": '',
      "modelModel": 'Model',
      "modelCode": 'Model Code',
      "optionPackageCode": 'Option Package Code',
      "options0": 'Options',
      "options1": 'Options',
      "seriesId": 'Series ID',
      "status": 'DS',
      // "transmissionId": '',
      "transmissionTransmission": 'Transmission',
      // "trimId": '',
      "trimLongName": 'Trim Name',
      // "trimName": '',
      "vin": 'VIN',
      // "yearId": '',
      "yearYear": 'Year',
      // "features0Options4": '',
      // "dealerUrl": '',
      "dealerNm": 'Dealer Name',
      "city": 'City',
      "state": 'State',
      "PlannedDeliveryDate": 'Inventory Status',
  }