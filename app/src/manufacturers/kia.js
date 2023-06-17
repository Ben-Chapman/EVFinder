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

import { normalizeJson, generateErrorMessage } from "../helpers/libs";
import { apiRequest } from "../helpers/request";
import { kiaInventoryMapping, kiaVinMapping } from "./kiaMappings";

export async function getKiaInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest("inventory", manufacturer, [...arguments]);
    return formatKiaInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

function formatKiaInventoryResults(input) {
  const r = input;
  if ("inventoryVehicles" in r) {
    var n = normalizeJson(r["inventoryVehicles"], kiaInventoryMapping); // Normalized results
    n.forEach((vehicle) => {
      // Lookup the dealer name/address from the dealer code
      const dCode = vehicle["dealerCode"];
      const dealerDetail = r["filterSet"]["dealers"].find(
        (dealer) => dealer["code"] === dCode
      );

      // Some results have a fqdn for a dealerUrl, some not. Stripping the
      // scheme, which will be re-inserted by the template
      vehicle["dealerUrl"] = dealerDetail["url"].replace(/http(s)?:\/\//i, "");
      vehicle["dealerName"] = dealerDetail["name"];
      vehicle["city"] = dealerDetail["location"]["city"];
      vehicle["state"] = dealerDetail["location"]["state"];

      // Distance to 2 decimal places
      vehicle["distance"] = parseFloat(vehicle["dealerDistance"]).toFixed(2).toString();

      // Delivery Date
      if (vehicle["status"] == "DS") {
        vehicle["deliveryDate"] = "Available";
        vehicle["inventoryStatus"] = "Available";
      } else if (vehicle["status"] == "IT") {
        vehicle["deliveryDate"] = "Arriving Soon";
        vehicle["inventoryStatus"] = "Arriving Soon";
      }

      /* The Kia API data is inconsistent and some vehicles don't have a
      drivetrainDesc field (AWD/RWD), but do include this information in
      a longer string description. For these vehicles, extracting the desc
      from the string
      */
      if (vehicle["edwTrim"].match(/RWD|AWD/) != null) {
        vehicle["drivetrainDesc"] = vehicle["edwTrim"].match(/RWD|AWD/)[0];
      } else {
        vehicle["drivetrainDesc"] = "Unknown";
      }

      /**
       * Kia stores the exterior color name under a top-level object called
       * exteriorImages{}, which we need to pull out for display in the UI.
       * So, regex matching the hex value provided with each vehicle description
       * and looping through the top-level object to find the hex value and
       * extract the actual color name.
       */
      try {
        const extColor =
          vehicle["exteriorImagesExteriorProfile"].match(/[0-9a-fA-F]{6}/)[0];
        // Looping through the non-flattened API response object to get exterior color
        r["filterSet"]["criteriaGroups"].forEach((group) => {
          if (group.groupName === "Colors") {
            group["groupCriteria"].forEach((criteria) => {
              criteria["elements"].forEach((element) => {
                if (element["baseHex"] === extColor) {
                  vehicle["exteriorColor"] = element["name"];
                }
              });
            });
          }
        });
      } catch {
        vehicle["exteriorColor"] = "Unknown";
      }
    });
  } else {
    n = [];
  }

  return n;
}

export function getKiaVinDetail(input) {
  /** The KIA API response contains all publicly available information
   * about the vehicle, so there's no additional VIN API call needed. Thus
   * storing the /inventory API data directly in the vinDetail local store.
   */
  const k = {};
  Object.keys(input).forEach((key) => {
    if (Object.keys(kiaVinMapping).includes(key)) {
      k[kiaVinMapping[key]] = input[key];
    }
    // The Kia API returns individual elements for each feature, so
    // concatenating into a single string for display
    if (key.indexOf("features0Options") >= 0) {
      // Does the key contain features0Options
      if (k["Top Features"]) {
        k["Top Features"] = `${k["Top Features"]}, ${input[key]}`;
      } else {
        k["Top Features"] = input[key];
      }
    }
  });

  return k;
}
