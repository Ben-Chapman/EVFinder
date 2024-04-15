/**
 * Copyright 2023 Ben Chapman
 *
 * This file is part of The EV Finder.
 *
 * The EV Finder is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * The EV Finder is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with The EV Finder.
 * If not, see <https://www.gnu.org/licenses/>.
 */
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

export const kiaInventoryMapping = {
  interiorColor: 'interiorColorDescription',
  exteriorColor: 'exteriorColorDescription',
  trimDesc: 'edwTrim',
  drivetrainDesc: 'drivetrainDescription',
  price: 'msrp',
  inventoryStatus: 'status',
  distance: 'range',
  'vin-with-more-details': ''
}

export const kiaVinMapping = {
  ExtColorLongDesc: 'Exterior Color',
  trimDesc: 'Trim Description',
  drivetrainDesc: 'Drivetrain',
  price: 'MSRP',
  distance: 'Miles from Zip Code',
  bodyDescription: 'Body Description',
  dealerCode: 'Dealer Code',
  dealerPrice: 'Dealer Price',
  drivetrainDrivetrain: 'Drivetrain Description',
  // "drivetrainId": '',
  engineCylindersEngineCylinders: 'Engine Cylinders',
  // "engineCylindersId": '',
  engineDisplacement: 'Engine Displacement',
  exteriorColorCode: 'Exterior Color Code',
  // "exteriorColorEdwColorName": '',
  // "exteriorColorId": '',
  exteriorColorName: 'Exterior Color Name',
  // "exteriorColorProcessType": '',
  // "exteriorColorUseSwatch": '',
  // "features0Options0": '',
  // "features0Options1": '',
  // "features0Options2": '',
  // "features0Options3": '',
  // "features0Title": '',
  // "id": '',
  interiorColorCode: 'Interior Color Code',
  interiorColorDescription: 'Interior Color',
  // "interiorColorEdwColorName": '',
  // "interiorColorId": '',
  // "interiorColorName": '',
  // "interiorColorProcessType": '',
  // "interiorColorUseSwatch": '',
  // "locationLatitude": '',
  // "locationLongitude": '',
  mileage: 'Mileage',
  // "modelId": '',
  modelModel: 'Model',
  modelCode: 'Model Code',
  optionPackageCode: 'Option Package Code',
  options0: 'Options',
  options1: 'Options',
  seriesId: 'Series ID',
  status: 'DS',
  // "transmissionId": '',
  transmissionTransmission: 'Transmission',
  // "trimId": '',
  trimLongName: 'Trim Name',
  // "trimName": '',
  vin: 'VIN',
  // "yearId": '',
  yearYear: 'Year',
  // "features0Options4": '',
  // "dealerUrl": '',
  dealerName: 'Dealer Name',
  city: 'City',
  state: 'State',
  deliveryDate: 'Inventory Status'
}
