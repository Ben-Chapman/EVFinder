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
  normalizeJson,
  sortObjectByKey,
  titleCase,
} from "../helpers/libs";
import { fordInventoryMapping, fordVinMapping } from "./fordMappings";

export async function getFordInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest("inventory", manufacturer, 30000, [
      ...arguments,
    ]);
    return formatFordInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

export async function getFordVinDetail(
  vin,
  dealerSlug,
  model,
  year,
  paCode,
  zip,
  manufacturer
) {
  if (dealerSlug === undefined) {
    const errorMessage = `Additional information could not be be retrieved for VIN ${vin}`;
    return generateErrorMessage(errorMessage);
  } else {
    try {
      const vinData = await apiRequest("vin", manufacturer, 15000, [...arguments], {
        dealerSlug: dealerSlug,
        modelSlug: `${year}-${model}`.toLowerCase(), // 2022-mache
        paCode: paCode,
        zip: zip,
        model: model,
        year: year,
      });
      return formatFordVinResults(vinData);
    } catch (error) {
      throw generateErrorMessage(error);
    }
  }
}

function formatFordInventoryResults(input) {
  if (Object.keys(input.data.filterResults).length == 0) {
    // filterResults is empty when no vehicles are found for a given search
    // Returning an empty object so the UI displays the no vehicles found message
    return {};
  }

  let vehicles = input.data.filterResults.ExactMatch.vehicles;
  let d =
    input.data.filterSet.filterGroupsMap.Dealer[0].filterItemsMetadata.filterItems;

  // rdata is returned from the EV Finder API when it has to page to retrieve all available
  // inventory information for a given search. Here we're merging the initial inventory
  // results with any paginated inventory results
  if (Object.hasOwn(input, "rdata")) {
    Object.keys(input.rdata).forEach((key) => {
      if (key == "vehicles") {
        // Merging vehicle information
        input.rdata[key].forEach((vehiclePaginationResult) => {
          vehicles = vehicles.concat(vehiclePaginationResult);
        });
      } else {
        // Merging dealer information
        input.rdata[key].forEach((dealerPaginationResult) => {
          d = d.concat(dealerPaginationResult);
        });
      }
    });
  }

  var n = normalizeJson(vehicles, fordInventoryMapping);
  /**
   * Loop through the dealer information in the returned inventory object,
   * and pull out the dealerId and dealer name. We'll use this hashmap to
   * populate information displayed in the UI
   */
  const dealers = {};

  d.forEach((dealer) => {
    dealers[dealer["value"]] = {
      // 'value' is the key for the dealer ID
      displayName: dealer["displayName"],
      distance: dealer["distance"],
    };
  });

  n.forEach((vehicle) => {
    // The dealerSlug is needed for VIN detail calls. Storing here for use later
    vehicle["dealerSlug"] = input["dealerSlug"];

    // Format the inventory status
    vehicle["daysOnDealerLot"] > 0
      ? ((vehicle["deliveryDate"] = `In Stock for ${vehicle["daysOnDealerLot"]} days`),
        (vehicle["inventoryStatus"] = "In Stock"))
      : ((vehicle["deliveryDate"] = "Unknown"),
        (vehicle["inventoryStatus"] = "In Stock"));

    /**
     * In testing, I've seen where the dealerId provided in an individual
     * vehicle response, doesn't match any dealerId provided by the inventory
     * API response (API error?). So catching that and falling back to deriving
     * the dealer's name from another field.
     */
    const dealerId = vehicle["dealerPaCode"];
    try {
      vehicle["distance"] = dealers[dealerId]["distance"];
      vehicle["dealerName"] = dealers[dealerId]["displayName"];
    } catch (error) {
      // /dealer/Santa-Monica-Ford-12345/model/2022-Mache/... ->
      // Santa Monica Ford 12345
      vehicle["dealerName"] = vehicle["detailPageUrl"]
        .split("/")[2]
        .replaceAll("-", " ");
      vehicle["distance"] = "0";
    }
  });

  return n;
}

function formatFordVinResults(input) {
  const v = normalizeJson([input.data.selected], fordVinMapping)[0];
  const needsCurrencyConversion = [
    "vehiclePricingMsrpPricingBase",
    "vehiclePricingMsrpPricingOptions",
    "vehiclePricingDestinationDeliveryCharge",
    "vehiclePricingMsrpPricingNetPrice",
  ];

  const vinFormattedData = {};
  Object.keys(v).forEach((vinKey) => {
    // Map Ford-specific keys to EVFinder-specific keys
    Object.keys(fordVinMapping).includes(vinKey)
      ? (vinFormattedData[fordVinMapping[vinKey]] = v[vinKey])
      : null;

    // Need to format some values to display as dollars
    needsCurrencyConversion.includes(vinKey)
      ? (vinFormattedData[fordVinMapping[vinKey]] = convertToCurrency(v[vinKey]))
      : null;
  });

  // Provide dealer details
  vinFormattedData[
    "Dealer Address"
  ] = `${v["dealerName"]}\n${v["dealerDealerAddressStreet1"]} ${v["dealerDealerAddressStreet2"]} ${v["dealerDealerAddressStreet3"]}\n${v["dealerAddressCity"]}, ${v["dealerAddressState"]} ${v["dealerAddressZipCode"]}`;

  vinFormattedData["Dealer Phone"] = v["dealerDealerPhone"];

  // Ford exposes dealer installed accessories in nested Objects, dealing with
  // that here
  const features = input.data.selected.vehicle.vehicleFeatures;
  Object.keys(features).forEach((key) => {
    // WheelSize desc is a duplicate of another key, so excluding it
    if (features[key]["displayName"] != null && key != "WheelSize") {
      vinFormattedData[titleCase(key)] = features[key]["displayName"];
    }
  });
  return sortObjectByKey(vinFormattedData);
}
