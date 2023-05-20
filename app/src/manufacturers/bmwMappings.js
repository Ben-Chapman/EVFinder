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

const bmwInventoryMapping = {
  interiorGenericColor: "interiorColor",
  // exteriorGenericColor: "exteriorColor",
  name: "trimDesc",
  totalMsrp: "price",
  // status: "inTransit",
  // name: "dealerName",
  dealerEstArrivalDate: "deliveryDate",
  // distanceToLocatorZip: "distance",
  // engineDriveType: "drivetrainDesc",
};

const bmwVinMapping = {
  carlineKey: "",
  dealer: "",
  dealerEnrollmentStatusInd: "",
  dealerInstalledAccessories: "",
  destinationCharge: "Destination Charge",
  engineDescription: "Engine Description",
  // "exteriorColorBaseColor": "Exterior Base Color",
  exteriorColorCode: "Exterior Color Code",
  exteriorColorDescription: "Exterior Color",
  exteriorSwatchUrl: "",
  factoryModelYear: "Factory Model Year",
  highlightFeatures: "",
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
  onlineSalesURL: "",
  portInstalledOptions: "",
  specifications: "",
  subTrimLevel: "",
  trimLevel: "Trim",
  vin: "VIN",
};

const bmwExteriorColorMapping = {
  Gray: "Oxide Grey metallic",
};

const bmwInteriorColorMapping = {
  Brown: "Mocha",
};

export {
  bmwExteriorColorMapping,
  bmwInteriorColorMapping,
  bmwInventoryMapping,
  bmwVinMapping,
};
