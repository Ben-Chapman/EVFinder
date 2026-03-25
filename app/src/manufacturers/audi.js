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
  generateErrorMessage,
  getGeoFromZipcode,
  stripHTML,
  titleCase,
} from "../helpers/libs";
export async function getAudiInventory(zip, year, model, radius, manufacturer, geo) {
  /**
   * The Audi API requires the ZIP Code to be provided as latitude_longitude. When a
   * user selects an Audi vehicle and provides a valid ZIP Code in the search form
   * a request is fired to Open Street Map to get the geo coordinates. If for some reason
   * that request failed, detect that here and send a new request to get the coords.
   */
  if (!geo.lat || !geo.lon) {
    var geo = await getGeoFromZipcode(zip); // eslint-disable-line no-redeclare
  }

  try {
    // The Audi API expects the lat/long to be provided as latitude_longitude
    geo = `${geo.lat}_${geo.lon}`;

    const invResponse = await apiRequest("inventory", manufacturer, [...arguments], {
      geo: geo,
    });
    return formatAudiInventoryResults(invResponse, year);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

export async function getAudiVinDetail(vehicleId, manufacturer) {
  try {
    const vinData = await apiRequest("vin", manufacturer, 30000, {
      vehicleId: vehicleId,
    });
    return formatAudiVinResults(vinData);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

export function formatAudiInventoryResults(input, modelYear) {
  const res = [];

  input.data?.stockCarSearch?.results?.cars?.forEach((car) => {
    const stockCar = car.stockCar;

    // The Audi inventory API does not support filtering by model year. Doing that here.
    if (stockCar.model?.salesModelyear != modelYear) {
      return;
    }

    // Extract MSRP from the carPrices array
    const msrpEntry = stockCar.carPrices?.find((p) => p.type === "MSRP");
    const price = msrpEntry?.price?.value || 0;

    /**
     * Vehicles in transit have more specific availability data in 'orderStatusText'.
     * Vehicles in stock at the dealer only have availability info in 'saleOrderTypeText'.
     */
    const rawStatus = stockCar.salesInfo?.orderStatusText
      ? stockCar.salesInfo.orderStatusText
      : (stockCar.salesInfo?.saleOrderTypeText || "").replace("-", " ");
    const deliveryDate = titleCase(rawStatus);

    /**
     * Extracting and formatting the various model names.
     * "2026 Audi Q4 e-tron" -> "Q4 e-tron"
     *
     * Quick note for future me, I would have named this modelDesc. In doing so though,
     * there's some bug in the buildFilterOptions() function in the Filters component
     * which would upon submitting the search form, populate a filter query param, with
     * the model pre-selected. This query param would not match any descriptive model
     * names, and thus display 0 vehicles in the Inventory table. Debugging was fruitless.
     * Hence, vehicleDesc and a TODO: to figure this out when I have more time.
     */
    const vehicleDesc = stockCar.titleText?.replace(/\d{4}\sAudi\s/, "") || "";

    const tmp = {
      distance: car.geoDistance?.value?.number,
      drivetrainDesc: stockCar.driveText,
      price,
      trimDesc: stockCar.subtitleText,
      deliveryDate,
      inventoryStatus: deliveryDate,
      exteriorColor: stockCar.colorInfo?.exteriorColor?.colorInfo?.text,
      interiorColor: stockCar.colorInfo?.interiorColor?.colorInfo?.text,
      vehicleDesc,
      dealerName: stockCar.dealer?.name,
      vin: stockCar.vin,
      id: stockCar.id,
    };

    res.push({ ...tmp, ...stockCar });
  });

  return res;
}

export function formatAudiVinResults(input) {
  const stockCar = input.data?.stockCarSearch?.results?.cars?.[0]?.stockCar;
  if (!stockCar) return {};

  const vinFormattedData = {};

  vinFormattedData["Model Name"] = stockCar.titleText;
  vinFormattedData["Trim Name"] = stockCar.subtitleText;
  vinFormattedData["Model Year"] = stockCar.modelInfo?.modelyear;
  vinFormattedData["Body Type"] = stockCar.cartypeText;
  vinFormattedData["Dealer Name"] = stockCar.dealer?.name;
  // The dealer description is provided as raw HTML. Stripping to display plain text.
  vinFormattedData["Dealer Note"] = stripHTML(stockCar.descriptionByDealer || "");
  vinFormattedData["Exterior Color"] =
    stockCar.colorInfo?.exteriorColor?.colorInfo?.text;
  vinFormattedData["Interior Color"] =
    stockCar.colorInfo?.interiorColor?.colorInfo?.text;
  vinFormattedData["Fuel Type"] = stockCar.engineInfo?.fuel?.text;
  // New vehicles have no mileage
  vinFormattedData["Vehicle Mileage"] = "N/A";

  // Build technical specifications from the structured techDataGroups array
  const techSpecs = [];
  stockCar.techDataGroups?.forEach((group) => {
    group.techDataList?.forEach((item) => {
      if (item.text) {
        techSpecs.push(`${item.label}: ${item.text}`);
      }
    });
  });
  if (techSpecs.length > 0) {
    vinFormattedData["Technical Specifications"] = techSpecs.join(",  ");
  }

  // Build equipment sections from manufacturer-specific category data
  stockCar.manufacturerSpecificItems?.cdbCategories?.forEach((category) => {
    if (!category.label) return;
    const features = [];
    category.categories?.forEach((subCategory) => {
      subCategory.features?.forEach((feature) => {
        if (feature.text) features.push(feature.text);
      });
    });
    if (features.length > 0) {
      vinFormattedData[category.label] = features.join(",  ");
    }
  });

  return vinFormattedData;
}
