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
import {
  convertToCurrency,
  generateErrorMessage,
  queryParamStringToObject,
  sortObjectByKey,
} from "../helpers/libs";
import { bmwColorMapping, bmwInventoryMapping, bmwVinMapping } from "./bmwMappings";

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
      // The BMW API does not provide an actual vehicle color except embedded in a URL
      // Pulling the query params from initialCOSYURL, and using bmwColorMapping to
      // derive the actual interior and exterior colors.
      const colorMap = queryParamStringToObject(vehicle?.initialCOSYURL);

      tmp["exteriorColor"] = bmwColorMapping[colorMap["paint"]];
      tmp["interiorColor"] = bmwColorMapping[colorMap["fabric"]];
    });

    res.push({ ...tmp, ...vehicle });
  });
  return res;
}

export async function getBMWVinDetail(vin, manufacturer, inventoryData) {
  try {
    let vinData = await apiRequest("vin", manufacturer, 15000, [...arguments], {
      vin: vin,
    });
    // The information for this VIN is buried in the API response, so redefining vinData
    // to avoid having to reference this long string everywhere
    vinData = vinData?.data?.getInventoryByIdentifier?.result[0];

    const needsCurrencyConversion = ["destinationAndHandling", "totalMsrp"];

    const vinFormattedData = {};
    Object.keys(vinData).forEach((key) => {
      Object.keys(bmwVinMapping).includes(key) && vinData[key] != ""
        ? (vinFormattedData[bmwVinMapping[key]] = vinData[key])
        : null;

      if (needsCurrencyConversion.includes(key)) {
        vinFormattedData[bmwVinMapping[key]] = convertToCurrency(
          Number(vinFormattedData[bmwVinMapping[key]])
        );
      }
    });

    // Options for this vehicle
    const vehicleOptions = vinData.options;
    const options = [];
    vehicleOptions.forEach((option) => options.push(option?.name));
    vinFormattedData["Vehicle Options"] = options.join(", ");

    // Pulling interesting information from the inventory data
    vinFormattedData["Dealer Name"] = inventoryData?.dealerName;
    vinFormattedData["Dealer Website"] = inventoryData?.dealerUrl;
    vinFormattedData["Estimated Delivery Date"] = inventoryData?.deliveryDate;
    vinFormattedData["Dealer Estimated Arrival Date"] =
      inventoryData?.dealerEstArrivalDate;
    vinFormattedData["Body Style"] = inventoryData?.bodyStyle?.name;
    vinFormattedData["Days On Lot"] = inventoryData?.daysOnLot;
    vinFormattedData["Order Type"] = inventoryData?.orderType;
    vinFormattedData["Is Vehicle Sold"] = inventoryData?.sold;

    return sortObjectByKey(vinFormattedData);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}
