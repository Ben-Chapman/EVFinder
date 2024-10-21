/**
 * Copyright 2023 Joel Gomez, 2023 - 2024 Ben Chapman
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

import { convertToCurrency, generateErrorMessage, titleCase } from "../helpers/libs";
import { apiRequest } from "../helpers/request";
import { chevroletVinMapping } from "./chevroletMappings";

const manufacturer = "chevrolet";

/**
 * Fetches vehicle inventory from the manufacturer's API.
 *
 * @param {String} zip The zipcode to use as the reference "center"
 * @param {String} year The vehicle model year
 * @param {String} model The vehicle model
 * @param {String} radius The radius from the zipcode
 * @returns A "normalized" response object for convenience or an Error array
 */
export async function getChevroletInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest("inventory", manufacturer, [...arguments]);
    return formatChevroletInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

/**
 * Aggregates and flattens API response data for convenient frontend rendering.
 *
 * @param {Object} input a response object from the inventory API
 * @returns a "normalized" inventory object
 */
function formatChevroletInventoryResults(input) {
  const results = [];
  input?.data?.hits.forEach((vehicle) => {
    results.push({
      dealerName: titleCase(vehicle.dealer.name),
      deliveryDate: vehicle.stockDetails.estimatedDeliveryDate,
      drivetrainDesc: vehicle.driveType,
      distance: vehicle.dealer.distance.value,
      price: vehicle.pricing.cash.msrp.value,
      exteriorColor: vehicle.baseExteriorColor,
      interiorColor: vehicle.baseInteriorColor,
      vin: vehicle.id,
      trimDesc: vehicle.variant.name,
    });
  });
  return results;
}

/**
 * Gets vehicle details by VIN from the manufacturer's API.
 *
 * @param {String} vin
 * @returns a "normalized" vehicle details object
 */
export async function getChevroletVinDetail(vin) {
  try {
    var vinData = await apiRequest("vin", manufacturer, [vin]);
  } catch (error) {
    throw generateErrorMessage(error);
  }
  const vinFormattedData = {};

  const enhancedResult = {
    ...vinData.data,
    dealerBac: vinData.data.dealer?.bac,
    dealerName: vinData.data.dealer?.name,
    dealerPostalCode: vinData.data.dealer?.postalCode,
    totalVehiclePrice: convertToCurrency(
      vinData.data.prices?.summary
        .find((item) => item.type == "total_vehicle_price")
        .value.toString() ?? "0",
    ),
    trimName: vinData.data.trim?.name,
    extColorOptionCode: vinData.data.extColor?.optionCode,
    extColorDescription: vinData.data.extColor?.description,
    intColorOptionCode: vinData.data.intColor?.optionCode,
    intColorDescription: vinData.data.intColor?.description,
    epaElectricRange:
      vinData.data.keyFeatures
        .find((item) => item.iconKey == "icon-epa-electric-range")
        ?.value.match(/\d+ miles/i)[0] ?? "Unavailable",
  };

  Object.keys(enhancedResult).forEach((vinKey) => {
    // Map Chevrolet-specific keys to EVFinder-specific keys
    if (Object.keys(chevroletVinMapping).includes(vinKey)) {
      vinFormattedData[chevroletVinMapping[vinKey]] = enhancedResult[vinKey];
    }
  });

  return vinFormattedData;
}
