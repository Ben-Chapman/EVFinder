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
import { audiVinMapping } from "./audiMappings";

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

function formatAudiVinResults(input) {
  const vinFormattedData = {};
  const vinData = input.data.getVehicleInfoForWormwood;

  // Replace Audi JSON keys with EV Finder JSON keys
  Object.keys(vinData).forEach((vinKey) => {
    Object.keys(audiVinMapping).includes(vinKey)
      ? (vinFormattedData[audiVinMapping[vinKey]] = vinData[vinKey])
      : null;
  });

  // The dealer note is provided as raw HTML. Stripping the HTML to display plain text
  vinFormattedData["Dealer Note"] = stripHTML(vinFormattedData["Dealer Note"]);

  // It appears for new vehicles, 'vehicleMilage' is null. Replacing with something descriptive
  if (!vinFormattedData["Vehicle Mileage"]) {
    vinFormattedData["Vehicle Mileage"] = "N/A";
  }

  // Adjust Market: us -> US
  vinFormattedData["Market"] = vinFormattedData["Market"].toUpperCase();

  // Titlecase Vehicle Type
  vinFormattedData["Vehicle Type"] = titleCase(vinFormattedData["Vehicle Type"]);

  // Building the technical specification and equipments data
  // vinFormattedData["Technical Specifications"] = "";
  let techSpecs = [];
  Object.keys(input.data.getVehicleInfoForWormwood.technicalSpecifications).forEach(
    (key) => {
      let value = input.data.getVehicleInfoForWormwood.technicalSpecifications[key];
      if (value === null) value = "N/A";

      // excluding this metadata-related key
      if (key != "__typename") {
        techSpecs.push(`${titleCase(key)}: ${value}`);
      }
      vinFormattedData["Technical Specifications"] = techSpecs.join(",  ");
    },
  );

  /**
   * Audi provide two types of equipment data, standard and optional with slightly
   * different data structures, hence the logic here to deal with that.
   */
  Object.keys(input.data.getVehicleInfoForWormwood.equipments).forEach(
    (equipmentType) => {
      if (equipmentType != "__typename") {
        let equipment = [];
        // Optional equipment
        if (equipmentType == "optionalEquipments") {
          input.data.getVehicleInfoForWormwood.equipments[equipmentType].forEach(
            (e) => {
              equipment.push(e["headline"]);
            },
          );
        }
        // Standard equipment
        else if (equipmentType == "standardEquipments") {
          Object.keys(
            input.data.getVehicleInfoForWormwood.equipments[equipmentType],
          ).forEach((e) => {
            if (
              e != "__typename" &&
              input.data.getVehicleInfoForWormwood.equipments[equipmentType][e] !==
                null &&
              input.data.getVehicleInfoForWormwood.equipments[equipmentType][e].length >
                0
            ) {
              Object.keys(
                input.data.getVehicleInfoForWormwood.equipments[equipmentType][e],
              ).forEach((key) => {
                const value =
                  input.data.getVehicleInfoForWormwood.equipments[equipmentType][e][
                    key
                  ];
                equipment.push(value["headline"]);
              });
            }
          });
        }
        if (equipment.length > 0) {
          vinFormattedData[titleCase(equipmentType)] = equipment.join(",  ");
        }
      }
    },
  );
  return vinFormattedData;
}
