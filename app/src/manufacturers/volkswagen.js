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
  getGeoFromZipcode,
  titleCase,
} from "../helpers/libs";
import { volkswagenVinMapping } from "./volkswagenMappings";

export async function getVolkswagenInventory(
  zip,
  year,
  model,
  radius,
  manufacturer,
  geo,
) {
  /**
   * The Volkswagen inventory BFF is geo-based and expects the search origin as
   * latitude_longitude. The search form geocodes the zip code, but if that lookup
   * failed, do it here before making the request (mirrors the Audi flow).
   */
  if (!geo || !geo.lat || !geo.lon) {
    geo = await getGeoFromZipcode(zip); // eslint-disable-line no-param-reassign
  }

  try {
    const invResponse = await apiRequest(
      "inventory",
      manufacturer,
      [...arguments],
      {
        geo: `${geo.lat}_${geo.lon}`,
      },
    );
    return formatVolkswagenInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

export function formatVolkswagenInventoryResults(input) {
  /**
   * The backend returns a slimmed list of vehicles under the "cars" key. Map each
   * vehicle onto the column keys the inventory table renders. An empty response (the
   * no-inventory signal) has no "cars" key and yields an empty array.
   */
  const res = [];
  (input.cars || []).forEach((car) => {
    const dealer = car.dealer || {};

    // VW does not expose a drivetrain code, so derive it from the human drive string.
    const driveText = car.drive?.value || "";
    let drivetrainDesc = driveText;
    if (/all.?wheel|awd/i.test(driveText)) drivetrainDesc = "AWD";
    else if (/rear.?wheel|rwd/i.test(driveText)) drivetrainDesc = "RWD";
    else if (/front.?wheel|fwd/i.test(driveText)) drivetrainDesc = "FWD";

    // Dealer-stock vehicles are on the lot; anything else is incoming inventory.
    const inventoryStatus =
      car.businessModel === "dealer_stock"
        ? "In Stock"
        : titleCase((car.businessModel || "In Transit").replace(/_/g, " "));

    // The interior color is not present in the inventory feed; it is only available
    // from the VIN detail call.
    const interior = car.color?.in?.[0]?.value;

    // The trim is the title with the leading "<year> <model> " stripped, e.g.
    // "2025 Volkswagen ID. Buzz Pro S" -> "Pro S". The subtitle field holds a verbose
    // marketing description (drivetrain, power, wheelbase) rather than the trim, so it
    // is only a fallback when the title is not in the expected form.
    const trimPrefix = `${car.modelyear?.value} ${car.model?.value} `;
    const trimDesc = car.title?.startsWith(trimPrefix)
      ? car.title.slice(trimPrefix.length)
      : car.subtitle?.value;

    res.push({
      vin: car.vin,
      modelYear: car.modelyear?.value,
      model: car.model?.value,
      trimDesc,
      exteriorColor: titleCase(car.color?.out?.value || ""),
      interiorColor: interior ? titleCase(interior) : "N/A",
      drivetrainDesc,
      // price is a number; the table formats it as currency via convertToCurrency.
      price: car.parsedPrice?.value,
      deliveryDate: car.availableFrom || inventoryStatus,
      inventoryStatus,
      dealerName: titleCase(dealer.name || ""),
      distance: car.distance,
      // The per-vehicle VDP on the dealer's site, used by the "Dealer's Website for
      // This Vehicle" button.
      onlineSalesURL: car.buildMyDealLinks?.onlineSalesUrl || "",
    });
  });

  return res;
}

export async function getVolkswagenVinDetail(zip, vin, manufacturer) {
  try {
    const vinData = await apiRequest("vin", manufacturer, [...arguments], {
      zip: zip,
      vin: vin,
    });

    // VW returns a null vehicle when it has no detail for this VIN (e.g. a brand-new
    // arrival not yet indexed). Show a friendly message rather than failing.
    if (!vinData?.data?.vehicle) {
      return {
        "Vehicle Details":
          "Detailed information is not available for this vehicle.",
      };
    }

    const needsCurrencyConversion = ["destinationCharge", "msrp"];
    const vinFormattedData = {};
    Object.keys(vinData.data.vehicle).forEach((vinKey) => {
      // Map VW-specific keys to EVFinder-specific keys
      Object.keys(volkswagenVinMapping).includes(vinKey)
        ? (vinFormattedData[volkswagenVinMapping[vinKey]] =
            vinData.data.vehicle[vinKey])
        : null;

      // Need to format some values to display as dollars
      needsCurrencyConversion.includes(vinKey)
        ? (vinFormattedData[volkswagenVinMapping[vinKey]] = convertToCurrency(
            vinData.data.vehicle[vinKey],
          ))
        : null;
    });

    // Accessories
    const dealerAccessory = [];
    vinData.data.vehicle["dealerInstalledAccessories"].forEach((acc) => {
      dealerAccessory.push(
        `${acc["optionDescription"]}: ${convertToCurrency(acc["price"])}`,
      );
    });
    vinFormattedData["Dealer Installed Accessories"] =
      dealerAccessory.join(",  ");

    // Highlighted features
    const highlightFeatures = [];
    vinData.data.vehicle["highlightFeatures"].forEach((feat) => {
      highlightFeatures.push(`${feat["name"]}`);
    });
    vinFormattedData["Highlighted Features"] = highlightFeatures.join(",  ");

    // Specifications
    const specTmp = {};
    vinData.data.vehicle["specifications"].forEach((spec) => {
      const specType = spec["salesFamily"];
      if (!specTmp[specType]) {
        specTmp[specType] = [];
      }
      specTmp[specType].push(
        spec?.optionDescription != "" ? spec?.optionDescription : "N/A",
      );

      // If we have specification data, write it to vinFormattedData
      if (specTmp.length > 0) {
        vinFormattedData[specType] = specTmp.join(", ");
      }
    });
    Object.keys(specTmp).forEach((specKey) => {
      vinFormattedData[`${specKey} Specs: `] = specTmp[specKey].join(", ");
    });

    return vinFormattedData;
  } catch (error) {
    throw generateErrorMessage(error);
  }
}
