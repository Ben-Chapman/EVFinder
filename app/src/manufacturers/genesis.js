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

import { genesisInventoryMapping, genesisVinMapping } from "./genesisMappings";
import { apiRequest } from "../helpers/request";
import { convertToCurrency, titleCase, generateErrorMessage } from "../helpers/libs";

// const apiBase = "https://api.theevfinder.com";
export async function getGenesisInventory(zip, year, model, radius, manufacturer) {
  /**
   * Genesis EVs are 2023 model year and newer. If the user selects 2022 return
   * an empty array without making an API call.
   * TODO: Create an info-message Vue component, and display a helpful info message.
   */
  if (year == 2022) {
    return [];
  }

  try {
    const invResponse = await apiRequest("inventory", manufacturer, 15000, [
      ...arguments,
    ]);
    return formatGenesisInventoryResults(await invResponse, radius);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

function formatGenesisInventoryResults(input, radius) {
  const res = [];
  input?.data?.Vehicles.forEach((vehicle) => {
    const k = {};
    Object.keys(vehicle["Veh"]).forEach((key) => {
      // Remap the Genesis-specific key into the EV Finder specific key
      if (Object.keys(genesisInventoryMapping).includes(key)) {
        if (key == "SortablePrice") {
          // For now, 'price' needs to be a string
          k[genesisInventoryMapping[key]] = vehicle["Veh"][key].toString();
        } else {
          k[genesisInventoryMapping[key]] = vehicle["Veh"][key];
        }
      } else {
        // If there's no EV Finder-specific key, just use the Genesis key
        k[key] = vehicle["Veh"][key];
      }

      if (vehicle["Veh"]["Model"].match(/GV?[7,8]0/)) {
        k["trimDesc"] = vehicle["Veh"]["Package"]
          ? vehicle["Veh"]["Package"]
          : "Standard";
      }
    });
    // The Genesis Inventory API does not seem to provide a way to limit results by distance
    // So after receiving all inventory results, filtering out the results which are >
    // the radius selected by the user
    if (Number(k["distance"]) <= radius) {
      res.push(k);
    }
  });
  console.log(radius);
  return res;
}

export async function getGenesisVinDetail(vin, zip, manufacturer) {
  /** The Genesis Inventory service does not provide a lot of additional detail
   * for each vehicle, and it appears there is no JSON endpoint for a VIN lookup.
   * So for now, just storing the /inventory API data directly in the vinDetail
   * local store.
   */
  try {
    const vinResponse = await apiRequest("vin", manufacturer, 5000, [...arguments], {
      zip: zip,
    });

    if (Object.keys(vinResponse?.data[0]?.Vehicle[0]).length > 0) {
      return formatVinDetails(vinResponse);
    } else {
      return generateErrorMessage("An error occurred fetching detail for this VIN");
    }
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

function formatVinDetails(input) {
  const vinData = input?.data[0]?.Vehicle[0];
  const dealerData = input?.data[0]?.dealer[0];
  const k = {};
  const needsCurrencyConversion = [
    "msrp",
    "totalExtColorPrice",
    "totalIntColorPrice",
    "totalPackagePrice",
    "MAPPrice",
  ];

  Object.keys(vinData).forEach((key) => {
    if (key == "Accessories" && vinData[key]) {
      const accTmp = [];
      vinData[key].forEach((accessory) => {
        accTmp.push(
          `${titleCase(accessory["AccessoryNm"])}: ${convertToCurrency(
            accessory["AccessoryPrice"]
          )}`
        );
      });
      k["Accessories"] = accTmp.join(", ");
    }

    if (Object.keys(genesisVinMapping).includes(key)) {
      if (vinData[key]) {
        // Need to format some values to display as dollars
        needsCurrencyConversion.includes(key)
          ? (k[genesisVinMapping[key]] = convertToCurrency(vinData[key]))
          : (k[genesisVinMapping[key]] = vinData[key]);
      }
    }
  });

  // Including Dealer information
  k["Dealer Name"] = titleCase(dealerData["DlrName"]);
  k["Dealer Address"] =
    titleCase(
      `${dealerData["Address1"]} ${dealerData["Address2"]} ${dealerData["City"]}`
    ) + `,  ${dealerData["State"]} ${dealerData["DlrZipCode"]}`;
  k["Dealer Phone Number"] = dealerData["Phone"];
  k["Dealer Website"] = dealerData["DealerUrl"];
  return k;
}
