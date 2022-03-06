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
  'PlannedDeliveryDate': '',
  'distance': 'range',
  'vin-with-more-details': '',
  }