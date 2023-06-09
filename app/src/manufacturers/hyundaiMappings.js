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

const hyundaiInteriorColors = {
  YGN: "Gray",
  NNB: "Black",
  VKE: "Dark Green",
  T9Y: "Black",
  YPK: "Gray",
  MMH: "Gray",
  TRY: "Black",
  UUE: "Beige",
  REY: "Gray",
  MMF: "Tan",
  YTH: "Gray",
  RNE: "Dark Green",
};

const hyundaiTransitStatus = {
  AA: "At Sea",
  DS: "Dealer Stock",
  IR: "In Transit",
  IT: "In Transit",
  PA: "Port Arrival",
  TN: "Ready for Shipment",
};

const hyundaiVinDetailMapping = {
  DealerPrice: "Dealer Price",
  DI: "DI",
  colors: "colors",
  MAPPrice: "Market Adjustment Price",
  accessories: "Accessories",
  cityMpg: "City MPG",
  classDesc: "Class Description",
  colorDesc: "Color Description",
  cylinders: "Cylinders",
  dealerCd: "Dealer Code",
  doorCd: "Door Code",
  drivetrain: "Drivetrain",
  drivetrainDesc: "Drivetrain Description",
  engineDesc: "Engine Description",
  engineDisplacement: "Engine Displacement",
  epaClassDesc: "EPA Class Description",
  epaEstAvgMpg: "EPA Estimated Average MPG",
  extColorDesc: "External Color Description",
  freight: "Freight Charge",
  fuelDesc: "Fuel Description",
  highwayMpg: "Highway MPG",
  horsepower: "Horsepower",
  intColorDesc: "Interior Color Description",
  inventoryStatus: "Inventory Status",
  mileage: "Mileage",
  modelCd: "Model Code",
  modelGroupCd: "Model Group Code",
  modelNm: "Model Number",
  modelYear: "Model Year",
  msrp: "MSRP",
  packages: "Packages",
  plannedDeliveryDate: "Planned Delivery Date",
  rbcSavings: "RBC Savings",
  sortableMileage: "Vehicle Mileage",
  totalAccessoryPrice: "Total Accessory Price",
  totalExtColorPrice: "Total Exterior Color Price",
  totalIntColorPrice: "Total Interior Color Price",
  totalOptions: "Total Options Price",
  totalPackageOptionPrice: "Total Package Options Price",
  totalPackagePrice: "Total Package Price",
  totalPackages: "Total Packages",
  transmissionDesc: "Transmission Description",
  trimDesc: "Trim Description",
  vin: "VIN",
};

export { hyundaiInteriorColors, hyundaiTransitStatus, hyundaiVinDetailMapping };
