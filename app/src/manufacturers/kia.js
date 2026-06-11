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

import {
  normalizeJson,
  generateErrorMessage,
  convertToCurrency,
  titleCase,
} from "../helpers/libs";
import { apiRequest } from "../helpers/request";
import { kiaInventoryMapping } from "./kiaMappings";

export async function getKiaInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest("inventory", manufacturer, [...arguments]);
    return formatKiaInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

export function formatKiaInventoryResults(input) {
  const r = input;
  if ("inventoryVehicles" in r) {
    var n = normalizeJson(r["inventoryVehicles"], kiaInventoryMapping); // Normalized results
    n.forEach((vehicle) => {
      // Lookup the dealer name/address from the dealer code
      const dCode = vehicle["dealerCode"];
      const dealerDetail = r["filterSet"]["dealers"].find(
        (dealer) => dealer["code"] === dCode,
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

      // The inventory API provides readable exterior and interior color names
      // directly on each vehicle (extColor/intColor, mapped to exteriorColor and
      // interiorColor). Fall back to "Unknown" when a value is absent.
      vehicle["exteriorColor"] = vehicle["exteriorColor"] || "Unknown";
      vehicle["interiorColor"] = vehicle["interiorColor"] || "Unknown";
    });
  } else {
    n = [];
  }

  return n;
}

export async function getKiaVinDetail(vin, zip, manufacturer) {
  /** The inventory API now returns a slim record per vehicle, so the rich detail
   * (engine, options, features, full color objects) is fetched from the EV Finder
   * /vin/kia endpoint, which passes through Kia's vinInfo response.
   */
  try {
    const vinResponse = await apiRequest("vin", manufacturer, [...arguments], {
      zip: zip,
    });

    if (vinResponse?.vehicles?.length > 0) {
      return formatKiaVinDetails(vinResponse);
    } else {
      return generateErrorMessage("An error occurred fetching detail for this VIN");
    }
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

export function formatKiaVinDetails(input) {
  const vehicle = input?.vehicles?.[0];
  const dealer = input?.dealers?.[0];
  if (!vehicle) return {};

  const k = {};

  k["VIN"] = vehicle.vin;
  k["Year"] = vehicle.year?.year;
  k["Model"] = vehicle.model?.model;
  k["Model Code"] = vehicle.modelCode;
  k["Trim"] = vehicle.trim?.name;
  k["Series ID"] = vehicle.seriesId;

  // Pricing is returned as a plain number string; format it as USD for display.
  if (vehicle.msrp) k["MSRP"] = convertToCurrency(vehicle.msrp);
  if (vehicle.dealerPrice) k["Dealer Price"] = convertToCurrency(vehicle.dealerPrice);

  if (vehicle.exteriorColor) {
    k["Exterior Color"] = vehicle.exteriorColor.name;
    if (vehicle.exteriorColor.code) {
      k["Exterior Color Code"] = vehicle.exteriorColor.code;
    }
  }
  if (vehicle.interiorColor) {
    k["Interior Color"] =
      vehicle.interiorColor.description || vehicle.interiorColor.name;
    if (vehicle.interiorColor.code) {
      k["Interior Color Code"] = vehicle.interiorColor.code;
    }
  }

  // The inventory API omits a discrete drivetrain field, so derive it from the trim
  // description (e.g. "LT LR AWD") as the inventory formatter does.
  const drivetrainMatch = vehicle.edwTrim?.match(/RWD|AWD/);
  k["Drivetrain"] = drivetrainMatch ? drivetrainMatch[0] : "Unknown";

  if (vehicle.transmission?.transmission) {
    k["Transmission"] = vehicle.transmission.transmission;
  }
  if (vehicle.engineCylinders?.engineCylinders) {
    k["Engine Cylinders"] = vehicle.engineCylinders.engineCylinders;
  }
  if (vehicle.engineDisplacement) k["Engine Displacement"] = vehicle.engineDisplacement;
  if (vehicle.mileage) k["Mileage"] = vehicle.mileage;
  if (vehicle.bodyDescription) k["Body Description"] = vehicle.bodyDescription;
  if (vehicle.optionPackageCode) k["Option Package Code"] = vehicle.optionPackageCode;

  if (vehicle.status === "DS") {
    k["Inventory Status"] = "Available";
  } else if (vehicle.status === "IT") {
    k["Inventory Status"] = "Arriving Soon";
  }

  if (Array.isArray(vehicle.options) && vehicle.options.length > 0) {
    k["Options"] = vehicle.options.join(", ");
  }

  // Kia groups features by section; the first group holds the headline features.
  const topFeatures = vehicle.features?.[0]?.options;
  if (Array.isArray(topFeatures) && topFeatures.length > 0) {
    k["Top Features"] = topFeatures.join(", ");
  }

  // Dealer details come from the response's dealers array (authoritative), rather
  // than the vehicle record which carries only a dealer code.
  if (dealer) {
    k["Dealer Code"] = dealer.code;
    k["Dealer Name"] = titleCase(dealer.name);
    if (dealer.location) {
      k["City"] = titleCase(dealer.location.city);
      k["State"] = dealer.location.state;
    }
    if (dealer.distance) {
      k["Miles from ZIP Code"] = parseFloat(dealer.distance).toFixed(2).toString();
    }
    if (dealer.url) {
      k["Dealer Website"] = dealer.url.replace(/http(s)?:\/\//i, "");
    }
  }

  return k;
}
