/**
 * Copyright 2025 Ben Chapman
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
 */

const gmcVinMapping = {
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

// Maps variant.name (trim level) to interior color description. Each GMC EV trim
// ships with exactly one interior, so this can be determined without a VIN lookup.
// Verified against live VIN data. Update when new model years introduce new trims.
const gmcInteriorByTrim = {
  // Sierra EV
  "Elevation Standard Range": "After Dark (Black), CoreTec seat trim",
  "Elevation Extended Range": "After Dark (Black), CoreTec seat trim",
  "Denali Standard Range":
    "After Dark (Black), Premium leather alternative seating surfaces",
  "Extended Range Denali":
    "After Dark (Black), Premium leather alternative seating surfaces",
  "Max Range Denali":
    "After Dark (Black), Premium leather alternative seating surfaces",
  "AT4 Extended Range": "Forest Storm, CoreTec seat trim",
  "AT4 Max Range": "Forest Storm, CoreTec seat trim",
  "Denali Max Range": "Desert Dune, Premium leather alternative seating surfaces",
  // HUMMER EV Pickup
  "2X": "Granite Drift, Premium leather-alternative seating surfaces",
  "3X": "Lunar Horizon (Jet Black/Light Grey), Premium leather-alternative seating surfaces",
};

export { gmcVinMapping, gmcInteriorByTrim };
