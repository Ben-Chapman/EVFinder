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
  interiorColorDescription: "interiorColor",
  exteriorColorDescription: "exteriorColor",
  trimLevel: "trimDesc",
  msrp: "price",
  status: "inTransit",
  name: "dealerName",
  url: "dealerUrl",
  PlannedDeliveryDate: "deliveryDate",
};

const volkswagenVinMapping = {
  carlineKey: "",
  dealerEnrollmentStatusInd: "",
  destinationCharge: "Destination Charge",
  engineDescription: "Engine Description",
  exteriorColorCode: "Exterior Color Code",
  exteriorColorDescription: "Exterior Color",
  factoryModelYear: "Factory Model Year",
  interiorColorBaseColor: "",
  interiorColorCode: "Interior Color Code",
  interiorColorDescription: "Interior Color",
  interiorSwatchUrl: "",
  mediaAssets: "",
  mediaImageUrl: "",
  mediaImageUrlAlt: "",
  model: "Model",
  modelCode: "Model Code",
  modelVersion: "Model Version",
  modelYear: "Model Year",
  mpgCity: "City MPG",
  mpgHighway: "Highway MPG",
  msrp: "MSRP",
  portInstalledOptions: "",
  subTrimLevel: "",
  trimLevel: "Trim",
  vin: "VIN",
};

export { volkswagenInventoryMapping, volkswagenVinMapping };
