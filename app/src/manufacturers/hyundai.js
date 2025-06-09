/**
 * Copyright 2023 - 2025 Ben Chapman
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

import { convertToCurrency, titleCase } from "../helpers/libs";
import {
  hyundaiVinDetailMapping,
  hyundaiTransitStatus,
  hyundaiInteriorColors,
} from "./hyundaiMappings";
import { apiRequest } from "../helpers/request";
import { generateErrorMessage } from "../helpers/libs";

export async function getHyundaiInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest("inventory", manufacturer, [...arguments], {
      v2: true,
    });
    return formatHyundaiInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

export async function getHyundaiVinDetail(vin, manufacturer, model, year) {
  try {
    const vinResponse = await apiRequest("vin", manufacturer, [...arguments], {
      year: year,
      model: model,
    });

    if (vinResponse["data"].length > 0) {
      return formatVinDetails(vinResponse["data"][0]["vehicle"][0]);
    } else if (vinResponse["data"].length == 0) {
      return generateErrorMessage("No information was found for this VIN");
    } else {
      return generateErrorMessage("An error occurred fetching detail for this VIN");
    }
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

function formatHyundaiInventoryResults(input) {
  const res = [];

  // If the API response does not have a data key, there is no inventory.
  // Return an empty array for the UI to display the no inventory message.
  // This most commonly occurs when the user selects a year that is not valid for a
  // selected model.
  if (!input.data) {
    return [];
  }

  if (input["data"][0]["dealerInfo"] !== null) {
    // If the API returned vehicles in inventory
    input["data"][0]["dealerInfo"].forEach((dealer) => {
      dealer["vehicles"]?.forEach((vehicle) => {
        res.push({ ...dealer, ...vehicle });
      });
    });
  }
  if (res.length > 0) {
    res.forEach((vehicle) => {
      // Because we just merged the dealer and vehicle Objects, deleting the vehicles
      // array from each vehicle (which was carried over from the dealer object)
      delete vehicle["vehicles"];

      // Replace the $xx,xxx.xx string with a value which can be cast to float
      vehicle["price"] = vehicle["price"].replace("$", "").replace(",", "");

      // Translate inventory status codes to something meaningful
      vehicle["inventoryStatus"] = hyundaiTransitStatus[vehicle["inventoryStatus"]];

      // Translate interior color codes to something meaningful
      vehicle["interiorColor"] = hyundaiInteriorColors[vehicle["interiorColorCd"]];

      // Pull the Exterior Color Name up from a nested Object, and title case format
      vehicle["exteriorColor"] = titleCase(vehicle["colors"][0]["ExtColorLongDesc"]);

      // Title case format
      vehicle["drivetrainDesc"] = titleCase(vehicle["drivetrainDesc"]);

      // Delivery Date
      vehicle["deliveryDate"] = vehicle["PlannedDeliveryDate"];

      // Dealer Name
      vehicle["dealerName"] = vehicle["dealerNm"];
    });
  }
  return res;
}

function formatVinDetails(input) {
  var tmp = {};
  var keysToDelete = ["colors", "DDCSpecialProgam"];
  var needsCurrencyConversion = [
    "DealerPrice",
    "MAPPrice",
    "freight",
    "msrp",
    "rbcSavings",
    "totalAccessoryPrice",
    "totalExtColorPrice",
    "totalIntColorPrice",
    "totalOptions",
    "totalPackageOptionPrice",
    "totalPackagePrice",
  ];

  Object.entries(input).forEach(([key, value]) => {
    if (value === null || value == "") {
      if (hyundaiVinDetailMapping[key] != undefined) {
        tmp[hyundaiVinDetailMapping[key]] = "N/A";
      } else {
        key = "N/A";
      }
    } else if (key == "accessories") {
      var aTmp = [];
      for (var a = 0; a < input[key].length; a++) {
        aTmp.push(
          `${titleCase(input[key][a]["accessoryNm"])}: ${convertToCurrency(
            input[key][a]["accessoryPrice"],
          )}`,
        );
      }
      tmp["Accessories"] = aTmp.join(",  ");
    } else if (key == "inventoryStatus") {
      // Translate status codes to something meaningful
      const transitStatus = {
        AA: "At Sea 🚢",
        DS: "Dealer Stock 🚩",
        IR: "🚛 In Transit",
        IT: "🚛 In Transit",
        PA: "Port Arrival",
        TN: "Ready for Shipment",
      };
      tmp["Inventory Status"] = transitStatus[value];
    } else if (needsCurrencyConversion.includes(key)) {
      tmp[hyundaiVinDetailMapping[key]] = convertToCurrency(value);
    } else if (keysToDelete.includes(key) == false) {
      tmp[hyundaiVinDetailMapping[key]] = value;
    }
  });

  // Delete elements no longer needed
  for (let j = 0; j < keysToDelete.length; j++) {
    const element = keysToDelete[j];
    delete tmp[element];
  }

  return tmp;
}
