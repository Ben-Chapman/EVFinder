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
import { generateErrorMessage, stripHTML, titleCase } from "../helpers/libs";
import { audiInventoryMapping, audiVinMapping } from "./audiMappings";

export async function getAudiInventory(zip, year, model, radius, manufacturer) {
  try {
    const geo = await getGeoFromZipcode(zip);
    const invResponse = await apiRequest(
      "inventory",
      manufacturer,
      30000,
      [...arguments],
      { geo: geo }
    );
    return formatAudiInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

export async function getAudiVinDetail(vehicleId, manufacturer) {
  try {
    const vinData = await apiRequest("vin", manufacturer, 30000, [...arguments], {
      vehicleId: vehicleId,
    });
    return formatAudiVinResults(vinData);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

async function getGeoFromZipcode(zip) {
  const osmApi = "https://nominatim.openstreetmap.org/search?";

  const geo = await fetch(
    osmApi + new URLSearchParams({ postalcode: zip, country: "US", format: "json" }),
    { method: "GET", mode: "cors" }
  );

  if (geo.ok) {
    const mapData = await geo.json();

    // The Audi API expects the lat/long to be provided as latitude_longitude
    return `${mapData[0].lat}_${mapData[0].lon}`;
  } else {
    return ["ERROR", geo.status, geo.text];
  }
}

function formatAudiInventoryResults(input) {
  const res = [];

  input.data?.getFilteredVehiclesForWormwood?.vehicles?.forEach((vehicle) => {
    var tmp = {};
    Object.keys(vehicle).forEach((key) => {
      Object.keys(audiInventoryMapping).includes(key)
        ? (tmp[audiInventoryMapping[key]] = vehicle[key])
        : null;
    });

    /**
     * The interiorColor value returned from the Audi API is something like
     * "Black-Gray, Black, Flint Gray with Orange piping, Black", where Flint Gray...
     * is the actual interior color. Extracting the actual interiorColor here
     */
    const interiorColors = vehicle["interiorColor"]
      ? vehicle["interiorColor"].split(",")
      : "Unknown";

    // The real interior color is the second-to-last element in the array
    vehicle["interiorColor"] = interiorColors[interiorColors.length - 2];

    // The Audi MSRP is provided as $12,345.00. Stripping the cents, and removing non-digits.
    // If the API-provided price is null, write 0 for the price.
    tmp["price"] = tmp["price"] ? tmp["price"].split(".")[0].replace(/\D/g, "") : 0;

    /**
     * Vehicles in transit have more specific availability data in 'vehicleOrderStatus'.
     * Vehicles in stock at the dealer only have availability info in `vehicleInventoryType
     * So dealing with that here
     */
    vehicle["vehicleOrderStatus"] === null
      ? (tmp["deliveryDate"] = titleCase(
          vehicle["vehicleInventoryType"].replace("-", " ")
        ))
      : null;

    // Populating the Availability filter
    tmp["inventoryStatus"] = tmp["deliveryDate"];

    /**
     * Extracting and formatting the various model names.
     * 2023 Audi e-tron Sportback -> e-tron Sportback
     *
     * Quick note for future me, I would have named this modelDesc. In doing so though,
     * there's some bug in the buildFilterOptions() function in the Filters component
     * which would upon submitting the search form, populate a filter query param, with
     * the model pre-selected. This query param would not match any descriptive model
     * names, and thus display 0 vehicles in the Inventory table. Debugging was fruitless.
     * Hence, vehicleDesc and a TODO: to figure this out when I have more time.
     */
    tmp["vehicleDesc"] = vehicle["modelName"].replace(/\d{4}\sAudi\s/, "");

    res.push({ ...tmp, ...vehicle });
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
    }
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
            }
          );
        }
        // Standard equipment
        else if (equipmentType == "standardEquipments") {
          Object.keys(
            input.data.getVehicleInfoForWormwood.equipments[equipmentType]
          ).forEach((e) => {
            if (
              e != "__typename" &&
              input.data.getVehicleInfoForWormwood.equipments[equipmentType][e] !==
                null &&
              input.data.getVehicleInfoForWormwood.equipments[equipmentType][e].length >
                0
            ) {
              Object.keys(
                input.data.getVehicleInfoForWormwood.equipments[equipmentType][e]
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
    }
  );
  return vinFormattedData;
}
