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
const audiInventoryMapping = {
  distanceFromUser: "distance",
  driveType: "drivetrainDesc",
  modelPrice: "price",
  trimName: "trimDesc",
  vehicleOrderStatus: "deliveryDate",
};

const audiVinMapping = {
  bodyType: "Body Type",
  dealerName: "Dealer Name",
  dealerNote: "Dealer Note",
  driveType: "Drivetrain",
  //'equipments': '', //nested object
  exteriorColor: "Exterior Color",
  fuelType: "Fuel Type",
  gearType: "Gear Type",
  market: "Market",
  modelMileage: "Vehicle Mileage",
  modelName: "Model Name",
  modelYear: "Model Year",
  // 'technicalSpecifications': '',  //object
  trimName: "Trim Name",
  trimline: "Trim Line",
  upholsteryColor: "Interior Color",
  vehicleType: "Vehicle Type",
};

export { audiInventoryMapping, audiVinMapping };
