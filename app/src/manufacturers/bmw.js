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

import { apiRequest } from "../helpers/request";
import { generateErrorMessage } from "../helpers/libs";
import {
  bmwExteriorColorMapping,
  bmwInteriorColorMapping,
  bmwInventoryMapping,
  bmwVinMapping,
} from "./bmwMappings";

export async function getBMWInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest("inventory", manufacturer, 15000, [
      ...arguments,
    ]);
    return formatBMWInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

function formatBMWInventoryResults(input) {
  const res = [];
  var tmp = {};
  input?.data?.getInventory?.result.forEach((vehicle) => {
    // Map BMW-specific keys to EVFinder-specific keys
    Object.keys(vehicle).forEach((key) => {
      Object.keys(bmwInventoryMapping).includes(key)
        ? (tmp[bmwInventoryMapping[key]] = vehicle[key])
        : null;

      // Distance to 2 decimal places
      vehicle["distance"] = parseFloat(vehicle["distanceToLocatorZip"])
        .toFixed(2)
        .toString();

      // Extract the drivetrain description
      tmp["drivetrainDesc"] = vehicle?.engineDriveType?.name;

      // Lookup and populate dealer information
      const dealerDetail = input.data.getInventory.dealerInfo.find(
        ({ centerID }) => centerID === vehicle?.dealerId
      );

      tmp["dealerName"] = dealerDetail.newVehicleSales[0].dealerName;
      tmp["dealerUrl"] = dealerDetail.newVehicleSales[0].dealerURL.replace(
        "https://",
        ""
      );

      // Populate descriptive color names
      tmp["exteriorColor"] = bmwExteriorColorMapping[vehicle?.exteriorGenericColor];
      tmp["interiorColor"] = bmwInteriorColorMapping[vehicle?.interiorGenericColor];
    });

    res.push({ ...tmp, ...vehicle });
  });
  return res;
}

export async function getBMWVinDetail(zip, vin, manufacturer) {
  try {
    const vinData = await apiRequest("vin", manufacturer, 15000, [...arguments], {
      zip: zip,
      vin: vin,
    });
    // const needsCurrencyConversion = ["destinationCharge", "msrp"];
    const vinFormattedData = {};
    Object.keys(vinData.data.vehicle).forEach((vinKey) => {
      // Map BMW-specific keys to EVFinder-specific keys
      Object.keys(bmwVinMapping).includes(vinKey)
        ? (vinFormattedData[bmwVinMapping[vinKey]] = vinData.data.vehicle[vinKey])
        : null;
    });

    return vinFormattedData;
  } catch (error) {
    throw generateErrorMessage(error);
  }
}
