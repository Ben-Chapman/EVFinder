/**
 * Copyright 2023 Joel Gomez, Ben Chapman
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

const chevroletInventoryMapping = {
  intColor: "interiorColor",
  extColor: "exteriorColor",
  trimName: "trimDesc", // trim.name
  totalPrice: "price", // pricing.cash.summary.items[].value where items[].type==total_vehicle_price
  vehicleAvailabilityDisplayStatus: "deliveryDate",
  dealerDistance: "distance", // dealer.distance
  vin: "vin",
  dealerName: "dealerName", // dealer.name
};

const chevroletVinMapping = {
  vin: "VIN",
  dealerBac: "Dealer Code",
  dealerName: "Dealer Name",
  dealerPostalCode: "Dealer ZIP Code",
  stock: "Stock Number",
  totalVehiclePrice: "MSRP", // prices.summary[].type == total_vehicle_price
  model: "Model",
  year: "Model Year",
  trimName: "Trim Description",
  mileage: "Mileage",
  seatingCapacity: "Seating",
  extColorOptionCode: "Exterior Color Code",
  extColorDescription: "Exterior Color",
  intColorOptionCode: "Interior Color Code",
  intColorDescription: "Interior Color",
  epaElectricRange: "EPA Estimated MPG Rating", // keyFeatures[].iconKey == icon_epa_electric_range

  // Enhanced VIN data mappings
  features: "Features",
  warranty: "Warranty Information",
  keyFeatures: "Key Features",
  installedOptions: "Installed Options",
  specifications: "Technical Specifications",
  pricing: "Pricing Details",
  availability: "Availability",
  vehicleDescription: "Description",
  modelYear: "Model Year",
  makeName: "Make",
  modelName: "Model Name",
  bodyStyle: "Body Style",
  driveType: "Drive Type",
  transmission: "Transmission",
  engine: "Engine",
  fuelType: "Fuel Type",
  mpgCity: "MPG City",
  mpgHighway: "MPG Highway",
  mpgCombined: "MPG Combined",
  cargoCapacity: "Cargo Capacity",
  dimensions: "Dimensions",
  weight: "Weight",
  performance: "Performance",
  safety: "Safety Features",
  technology: "Technology Features",
  comfort: "Comfort Features",
  convenience: "Convenience Features",
};

export { chevroletInventoryMapping, chevroletVinMapping };
