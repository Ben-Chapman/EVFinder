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

import { convertToCurrency, generateErrorMessage, titleCase } from "../helpers/libs";
import { apiRequest } from "../helpers/request";
import { chevroletInventoryMapping, chevroletVinMapping } from "./chevroletMappings";

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
    const invResponse = await apiRequest("inventory", manufacturer, 15000, [
      ...arguments,
    ]);
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
  // find exterior and interior color mappings from filter values
  const extColors = input.data?.filters
    .find((item) => item.key == "extColor")
    .values.reduce(
      (colors, color) => ({ ...colors, [color.value]: color.displayValue }),
      {}
    );

  // for interior colors, also include a hint for the material type
  const intColors = input.data?.filters
    .find((item) => item.key == "intColor")
    .values.reduce(
      (colors, color) => ({
        ...colors,
        [color.value]: `${color.displayValue.split(",")[0]}, ${
          color.displayValue.split(",")[1].split(" ")[1]
        }`,
      }),
      {}
    );

  const results = [];

  input.data?.listResponse.forEach((vehicle) => {
    const _vehicle = {};

    // bring some nested values up to the top level and create entries that don't exist
    const enhancedResult = {
      ...vehicle,
      dealerName: titleCase(vehicle?.dealer?.name),
      dealerDistance: vehicle.dealer?.distance,
      trimName: vehicle.trim?.name,
      totalPrice: vehicle.pricing?.cash?.summary?.items
        .find((item) => item.type == "total_vehicle_price")
        .value.toString(),
      vehicleAvailabilityDisplayStatus: titleCase(
        vehicle.vehicleAvailabilityStatus?.displayStatus
      ),
      extColor: extColors[colorCodeFromUrl(vehicle.extImages[0])],
      intColor: intColors[colorCodeFromUrl(vehicle.intImages[0])],
      drivetrainDesc: "FWD", // hard coded for Bolt EV, Bolt EUV; future models may require better strategy for deriving this.
    };

    Object.keys(enhancedResult).forEach((key) => {
      // Remap the Chevrolet-specific key into the EV Finder specific key
      if (Object.keys(chevroletInventoryMapping).includes(key)) {
        _vehicle[chevroletInventoryMapping[key]] = enhancedResult[key];
      } else {
        // If there's no EV Finder-specific key, just append the Chevrolet key
        _vehicle[key] = enhancedResult[key];
      }
    });

    // Some inventory is marked as "Temporarily Unavailable", which is exposed through
    // a recall key, and not vehicleAvailabilityStatus. Dealing with that here
    if (vehicle.recall) {
      _vehicle["deliveryDate"] = vehicle.recall?.displayStatus;
    }

    // Populate inventoryStatus which is exposed as the Availability filter
    _vehicle["inventoryStatus"] = _vehicle["deliveryDate"];

    results.push(_vehicle);
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
    var vinData = await apiRequest("vin", manufacturer, 15000, [vin]);
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
        .value.toString() ?? "0"
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

/**
 * Utility function to extract the color code from image urls.
 * An image url has the color code as the first substring of a substring
 * in a long query param.
 *
 * @param {String} url the image url to extract the color code from
 * @returns the color code as a string, e.g. GAZ
 */
function colorCodeFromUrl(url) {
  const color = new URL(url);
  return color.search.split("/")[3].split("_")[0];
}
